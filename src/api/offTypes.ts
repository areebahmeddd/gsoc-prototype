export type NutriScoreGrade = "a" | "b" | "c" | "d" | "e" | "unknown";

export type NovaGroup = 1 | 2 | 3 | 4 | "unknown";

export type EcoScoreGrade =
  | "a-plus"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "unknown";

export type FopWarningKey = "saturated-fat" | "sugars" | "sodium";

export interface FopWarning {
  key: FopWarningKey;
  label: string;
}

/**
 * Whether Health Canada FOP computation could be performed.
 * - "unavailable": nutriments absent or no per-serving data available.
 * - "computed": computation ran; warnings array may be empty (all nutrients below threshold).
 */
export type FopStatus = "unavailable" | "computed";

export interface FopResult {
  status: FopStatus;
  /** Active FOP warnings in Health Canada display order: saturated fat, sugars, sodium.
   *  Empty array when all nutrients are below the applicable threshold. */
  warnings: FopWarning[];
}

export interface OFFProduct {
  product_name?: string;
  nutriscore_grade?: NutriScoreGrade;
  nova_group?: NovaGroup;
  ecoscore_grade?: EcoScoreGrade;
  /** Serving size in grams (or mL for liquids). */
  serving_quantity?: number;
  /** Nutriment values keyed by OFF field name, e.g. "saturated-fat_serving". */
  nutriments?: Record<string, number>;
  categories_tags?: string[];
  url?: string;
}

export interface OFFApiResponse {
  status: number;
  product?: OFFProduct;
}
