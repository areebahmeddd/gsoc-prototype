import type {
  EcoScoreGrade,
  FopResult,
  FopWarning,
  NovaGroup,
  NutriScoreGrade,
  OFFProduct,
} from "./offTypes";

const NUTRISCORE_VALID = new Set(["a", "b", "c", "d", "e"]);
const NOVA_VALID = new Set([1, 2, 3, 4]);
const ECOSCORE_VALID = new Set<EcoScoreGrade>([
  "a-plus",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
]);

export function resolveNutriScore(product: OFFProduct): NutriScoreGrade {
  const g = product.nutriscore_grade?.toLowerCase();
  if (g && NUTRISCORE_VALID.has(g)) return g as NutriScoreGrade;
  return "unknown";
}

export function resolveNova(product: OFFProduct): NovaGroup {
  const g = Number(product.nova_group);
  if (NOVA_VALID.has(g)) return g as 1 | 2 | 3 | 4;
  return "unknown";
}

export function resolveEcoScore(product: OFFProduct): EcoScoreGrade {
  const g = product.ecoscore_grade?.toLowerCase();
  if (g && ECOSCORE_VALID.has(g as EcoScoreGrade)) return g as EcoScoreGrade;
  return "unknown";
}

/**
 * Resolves a human-readable category name from OFF product tags.
 * Picks the last English tag (most specific), strips the "en:" prefix,
 * converts hyphens to spaces, and title-cases the result.
 */
export function resolveCategory(tags?: string[]): string | null {
  if (!tags || tags.length === 0) return null;
  for (let i = tags.length - 1; i >= 0; i--) {
    if (tags[i].startsWith("en:")) {
      return tags[i]
        .slice(3)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  return null;
}

/**
 * Health Canada Daily Values for FOP symbol computation.
 * Source: Food and Drug Regulations, sections B.01.350-B.01.357, Column 3
 *
 * Note: saturated fat DV denominator is 20 g (combined DV with trans fat),
 * but only saturated fat appears in the numerator per the regulation.
 */
const CA_DV_SAT_FAT_G = 20;
const CA_DV_SUGARS_G = 100;
const CA_DV_SODIUM_MG = 2300;

/**
 * Returns the % DV threshold that triggers the FOP symbol.
 * Uses serving_quantity as a proxy for Health Canada's reference amount.
 *   - <= 30 g/mL  (small package): 10% DV
 *   - >= 200 g/mL (main dish):     30% DV
 *   - all others  (standard):      15% DV
 */
function caFopThreshold(servingQuantity: number): number {
  if (servingQuantity <= 30) return 10;
  if (servingQuantity >= 200) return 30;
  return 15;
}

/**
 * Returns a per-serving nutriment value in grams.
 * Prefers the `{key}_serving` field; falls back to `{key}_100g` scaled by servingQuantity.
 * Returns null when neither source is available.
 */
function servingValue(
  nutriments: Record<string, number>,
  key: string,
  servingQuantity: number | undefined,
): number | null {
  const direct = nutriments[`${key}_serving`];
  if (typeof direct === "number") return direct;

  const per100g = nutriments[`${key}_100g`];
  if (
    typeof per100g === "number" &&
    servingQuantity != null &&
    servingQuantity > 0
  ) {
    return (per100g * servingQuantity) / 100;
  }

  return null;
}

/**
 * Computes Health Canada FOP warnings from OFF nutriments data.
 *
 * Applies % Daily Value per-serving thresholds per Food and Drug Regulations
 * B.01.350-B.01.357. Warning order follows the prescribed display sequence:
 * saturated fat, sugars, sodium.
 *
 * Returns "unavailable" when nutriment data is insufficient to compute a result;
 * no partial or approximated output is returned.
 * Returns "computed" otherwise; warnings array may be empty.
 */
export function resolveFopWarnings(product: OFFProduct): FopResult {
  const { nutriments, serving_quantity } = product;
  if (!nutriments) return { status: "unavailable", warnings: [] };

  const satFatG = servingValue(nutriments, "saturated-fat", serving_quantity);
  const sugarsG = servingValue(nutriments, "sugars", serving_quantity);
  const sodiumG = servingValue(nutriments, "sodium", serving_quantity);

  if (satFatG === null && sugarsG === null && sodiumG === null) {
    return { status: "unavailable", warnings: [] };
  }

  const threshold =
    serving_quantity != null ? caFopThreshold(serving_quantity) : 15;

  const warnings: FopWarning[] = [];

  // Saturated fat: >= threshold % of 20 g DV
  if (satFatG !== null && (satFatG / CA_DV_SAT_FAT_G) * 100 >= threshold) {
    warnings.push({ key: "saturated-fat", label: "High in Saturated Fat" });
  }

  // Sugars: >= threshold % of 100 g DV
  if (sugarsG !== null && (sugarsG / CA_DV_SUGARS_G) * 100 >= threshold) {
    warnings.push({ key: "sugars", label: "High in Sugar" });
  }

  // Sodium: >= threshold % of 2300 mg DV (OFF stores sodium in grams)
  if (
    sodiumG !== null &&
    ((sodiumG * 1000) / CA_DV_SODIUM_MG) * 100 >= threshold
  ) {
    warnings.push({ key: "sodium", label: "High in Sodium" });
  }

  return { status: "computed", warnings };
}
