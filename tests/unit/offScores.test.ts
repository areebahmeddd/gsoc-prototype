/**
 * Unit tests for score resolvers (offScores) and asset URL builders (offUrls).
 * No DOM or browser APIs required; all functions are pure.
 */
import { describe, expect, it } from "vitest";
import {
  resolveCategory,
  resolveEcoScore,
  resolveFopWarnings,
  resolveNova,
  resolveNutriScore,
} from "../../src/api/offScores";
import type { OFFProduct } from "../../src/api/offTypes";
import {
  ecoScoreUrl,
  fopUnknownUrl,
  fopWarningUrl,
  novaGroupUrl,
  nutriScoreUrl,
} from "../../src/api/offUrls";

describe("resolveNutriScore", () => {
  it.each(["a", "b", "c", "d", "e"] as const)(
    "returns '%s' for valid grade '%s'",
    (grade) => {
      expect(resolveNutriScore({ nutriscore_grade: grade })).toBe(grade);
    },
  );

  it("is case-insensitive", () => {
    expect(resolveNutriScore({ nutriscore_grade: "A" as unknown as "a" })).toBe(
      "a",
    );
  });

  it("returns 'unknown' when grade is missing", () => {
    expect(resolveNutriScore({})).toBe("unknown");
  });

  it("returns 'unknown' for an unrecognised grade", () => {
    expect(resolveNutriScore({ nutriscore_grade: "z" as unknown as "a" })).toBe(
      "unknown",
    );
  });
});

describe("resolveNova", () => {
  it.each([1, 2, 3, 4] as const)("returns %d for valid group %d", (group) => {
    expect(resolveNova({ nova_group: group })).toBe(group);
  });

  it("returns 'unknown' when nova_group is missing", () => {
    expect(resolveNova({})).toBe("unknown");
  });

  it("returns 'unknown' for out-of-range number", () => {
    expect(resolveNova({ nova_group: 5 as unknown as 1 })).toBe("unknown");
  });

  it("returns 'unknown' for the existing 'unknown' sentinel value", () => {
    expect(resolveNova({ nova_group: "unknown" })).toBe("unknown");
  });
});

describe("resolveEcoScore", () => {
  it.each(["a-plus", "a", "b", "c", "d", "e", "f"] as const)(
    "returns '%s' for valid grade",
    (grade) => {
      expect(resolveEcoScore({ ecoscore_grade: grade })).toBe(grade);
    },
  );

  it("is case-insensitive", () => {
    expect(resolveEcoScore({ ecoscore_grade: "B" as unknown as "b" })).toBe(
      "b",
    );
  });

  it("returns 'unknown' when grade is missing", () => {
    expect(resolveEcoScore({})).toBe("unknown");
  });

  it("returns 'unknown' for an unrecognised grade", () => {
    expect(resolveEcoScore({ ecoscore_grade: "g" as unknown as "a" })).toBe(
      "unknown",
    );
  });
});

describe("resolveCategory", () => {
  it("returns null when tags is undefined", () => {
    expect(resolveCategory(undefined)).toBeNull();
  });

  it("returns null for an empty array", () => {
    expect(resolveCategory([])).toBeNull();
  });

  it("strips the 'en:' prefix and title-cases the result", () => {
    expect(resolveCategory(["en:chips"])).toBe("Chips");
  });

  it("converts hyphens to spaces", () => {
    expect(resolveCategory(["en:salty-snacks"])).toBe("Salty Snacks");
  });

  it("returns the last English tag (most specific category)", () => {
    expect(resolveCategory(["en:snacks", "en:salty-snacks", "en:chips"])).toBe(
      "Chips",
    );
  });

  it("skips non-English tags and picks the last English one", () => {
    // en:chips is at index 1; de:chips at index 2 is skipped -> en:chips wins
    expect(resolveCategory(["fr:chips", "en:chips", "de:chips"])).toBe("Chips");
  });

  it("returns null when no tags have the 'en:' prefix", () => {
    expect(resolveCategory(["fr:chips", "de:chips"])).toBeNull();
  });
});

describe("resolveFopWarnings - Health Canada FOP (B.01.350-B.01.357)", () => {
  it("returns status unavailable when nutriments is absent", () => {
    const result = resolveFopWarnings({});
    expect(result.status).toBe("unavailable");
    expect(result.warnings).toEqual([]);
  });

  it("returns status unavailable when no _serving or _100g values are present", () => {
    const result = resolveFopWarnings({ nutriments: {} });
    expect(result.status).toBe("unavailable");
    expect(result.warnings).toEqual([]);
  });

  it("flags saturated fat when _serving value meets 15% DV (>= 3 g)", () => {
    // 3 g / 20 g DV = 15%, exactly at threshold
    const product: OFFProduct = {
      serving_quantity: 50,
      nutriments: { "saturated-fat_serving": 3 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({
      key: "saturated-fat",
      label: "High in Saturated Fat",
    });
  });

  it("does not flag saturated fat below 15% DV (< 3 g)", () => {
    const product: OFFProduct = {
      serving_quantity: 50,
      nutriments: { "saturated-fat_serving": 2.9 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toEqual([]);
  });

  it("flags sugars when _serving value meets 15% DV (>= 15 g)", () => {
    // 15 g / 100 g DV = 15%
    const product: OFFProduct = {
      serving_quantity: 50,
      nutriments: { sugars_serving: 15 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({
      key: "sugars",
      label: "High in Sugar",
    });
  });

  it("flags sodium when _serving value meets 15% DV (>= 345 mg = 0.345 g)", () => {
    // 0.345 g * 1000 / 2300 mg DV = 15%
    const product: OFFProduct = {
      serving_quantity: 50,
      nutriments: { sodium_serving: 0.345 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({
      key: "sodium",
      label: "High in Sodium",
    });
  });

  it("does not flag sodium below 15% DV (< 345 mg)", () => {
    const product: OFFProduct = {
      serving_quantity: 50,
      nutriments: { sodium_serving: 0.344 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toEqual([]);
  });

  it("returns all three warnings in Health Canada display order when all are high", () => {
    const product: OFFProduct = {
      serving_quantity: 50,
      nutriments: {
        "saturated-fat_serving": 4.5, // 22.5% DV
        sugars_serving: 20, // 20% DV
        sodium_serving: 0.4, // 17.4% DV
      },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toHaveLength(3);
    expect(result.warnings.map((w) => w.key)).toEqual([
      "saturated-fat",
      "sugars",
      "sodium",
    ]);
  });

  it("derives per-serving value from _100g and serving_quantity", () => {
    // 9 g/100g * 50 g serving / 100 = 4.5 g -> 22.5% DV -> flagged
    const product: OFFProduct = {
      serving_quantity: 50,
      nutriments: { "saturated-fat_100g": 9 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].key).toBe("saturated-fat");
  });

  it("prefers _serving over computed _100g value", () => {
    // _serving below threshold; _100g would compute above - must use _serving
    const product: OFFProduct = {
      serving_quantity: 50,
      nutriments: {
        "saturated-fat_serving": 2, // 10% DV -> below threshold
        "saturated-fat_100g": 20, // would compute 50% DV -> flagged if used
      },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toEqual([]);
  });

  it("applies 10% DV threshold for small packages (serving <= 30 g)", () => {
    // 2 g sat fat = 10% DV: not high at 15% threshold, but high at 10% threshold
    const product: OFFProduct = {
      serving_quantity: 15,
      nutriments: { "saturated-fat_serving": 2 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].key).toBe("saturated-fat");
  });

  it("does not flag at 10% threshold when value is below 10% DV", () => {
    // 1.9 g = 9.5% DV, below 10% threshold
    const product: OFFProduct = {
      serving_quantity: 15,
      nutriments: { "saturated-fat_serving": 1.9 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toEqual([]);
  });

  it("applies 30% DV threshold for main dishes (serving >= 200 g)", () => {
    // 5 g sat fat = 25% DV: high at standard 15%, not high at 30% threshold
    const product: OFFProduct = {
      serving_quantity: 250,
      nutriments: { "saturated-fat_serving": 5 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toEqual([]);
  });

  it("flags main dish when value meets 30% DV threshold", () => {
    // 6 g sat fat = 30% DV, exactly at threshold
    const product: OFFProduct = {
      serving_quantity: 250,
      nutriments: { "saturated-fat_serving": 6 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].key).toBe("saturated-fat");
  });

  it("returns status unavailable when no serving data is available at all", () => {
    // Only _100g values, no serving_quantity - cannot derive per-serving
    const product: OFFProduct = {
      nutriments: { "saturated-fat_100g": 50, sugars_100g: 40 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("unavailable");
    expect(result.warnings).toEqual([]);
  });

  it("defaults to 15% DV threshold when serving_quantity is absent", () => {
    // _serving values present but serving_quantity is missing -> threshold falls back to 15%
    // 3 g sat fat / 20 g DV * 100 = 15% -> exactly at threshold -> flagged
    const product: OFFProduct = {
      nutriments: { "saturated-fat_serving": 3 },
    };
    const result = resolveFopWarnings(product);
    expect(result.status).toBe("computed");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].key).toBe("saturated-fat");
  });
});

describe("score URL helpers", () => {
  it("nutriScoreUrl builds the expected path", () => {
    expect(nutriScoreUrl("a")).toBe(
      "chrome-extension://test-id/score/nutriscore/nutriscore-a-new-en.svg",
    );
  });

  it("nutriScoreUrl with unknown grade", () => {
    expect(nutriScoreUrl("unknown")).toBe(
      "chrome-extension://test-id/score/nutriscore/nutriscore-unknown-new-en.svg",
    );
  });

  it("novaGroupUrl builds the expected path", () => {
    expect(novaGroupUrl(3)).toBe(
      "chrome-extension://test-id/score/nova/nova-group-3.svg",
    );
  });

  it("ecoScoreUrl handles 'a-plus'", () => {
    expect(ecoScoreUrl("a-plus")).toBe(
      "chrome-extension://test-id/score/ecoscore/green-score-a-plus.svg",
    );
  });

  it("fopWarningUrl builds the expected path", () => {
    expect(fopWarningUrl("sugars")).toBe(
      "chrome-extension://test-id/fop/fop-sugars.svg",
    );
  });

  it("fopUnknownUrl points to the grey placeholder", () => {
    expect(fopUnknownUrl()).toBe(
      "chrome-extension://test-id/fop/fop-unknown.svg",
    );
  });
});
