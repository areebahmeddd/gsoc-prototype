export type NutrientLevel = "low" | "moderate" | "high";

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

export interface NutrientLevels {
  "saturated-fat"?: NutrientLevel;
  sugars?: NutrientLevel;
  salt?: NutrientLevel;
}

export type FopWarningKey = "sugars" | "sodium" | "saturated-fat";

export interface FopWarning {
  key: FopWarningKey;
  label: string;
}

export interface OFFProduct {
  product_name?: string;
  nutriscore_grade?: NutriScoreGrade;
  nova_group?: NovaGroup;
  ecoscore_grade?: EcoScoreGrade;
  nutrient_levels?: NutrientLevels;
  nutriments?: Record<string, number | string>;
  image_small_url?: string;
  image_url?: string;
  url?: string;
}

export interface OFFApiResponse {
  status: number;
  product?: OFFProduct;
}
