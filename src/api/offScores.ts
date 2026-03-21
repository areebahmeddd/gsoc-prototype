import { browser } from "#imports";
import type {
  EcoScoreGrade,
  FopWarning,
  FopWarningKey,
  NovaGroup,
  NutriScoreGrade,
  OFFProduct,
} from "./offTypes";

export function resolveNutriScore(product: OFFProduct): NutriScoreGrade {
  const g = product.nutriscore_grade?.toLowerCase();
  if (g && ["a", "b", "c", "d", "e"].includes(g)) return g as NutriScoreGrade;
  return "unknown";
}

export function resolveNova(product: OFFProduct): NovaGroup {
  const g = Number(product.nova_group);
  if ([1, 2, 3, 4].includes(g)) return g as 1 | 2 | 3 | 4;
  return "unknown";
}

export function resolveEcoScore(product: OFFProduct): EcoScoreGrade {
  const g = product.ecoscore_grade?.toLowerCase();
  const valid: EcoScoreGrade[] = ["a-plus", "a", "b", "c", "d", "e", "f"];
  if (g && valid.includes(g as EcoScoreGrade)) return g as EcoScoreGrade;
  return "unknown";
}

export function nutriScoreUrl(grade: NutriScoreGrade): string {
  return browser.runtime.getURL(
    `score/nutriscore/nutriscore-${grade}-new-en.svg`,
  );
}

export function novaGroupUrl(group: NovaGroup): string {
  return browser.runtime.getURL(`score/nova/nova-group-${group}.svg`);
}

export function ecoScoreUrl(grade: EcoScoreGrade): string {
  return browser.runtime.getURL(`score/ecoscore/green-score-${grade}.svg`);
}

const FOP_MAP: Array<{ key: FopWarningKey; label: string }> = [
  { key: "sugars", label: "High in Sugar" },
  { key: "sodium", label: "High in Sodium" },
  { key: "saturated-fat", label: "High in Saturated Fat" },
];

export function fopWarningUrl(key: FopWarningKey): string {
  return browser.runtime.getURL(`fop/fop-${key}.svg`);
}

export function fopUnknownUrl(): string {
  return browser.runtime.getURL("fop/fop-unknown.svg");
}

/** Returns FOP (Front-of-Package) warnings for each nutrient whose level is "high". */
export function resolveFopWarnings(product: OFFProduct): FopWarning[] {
  const levels = product.nutrient_levels;
  if (!levels) return [];

  return FOP_MAP.filter(({ key }) => {
    if (key === "sodium") return levels["salt"] === "high";
    return levels[key as keyof typeof levels] === "high";
  });
}
