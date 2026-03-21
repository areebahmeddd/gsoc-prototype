/**
 * offScores unit tests - score resolvers and URL helpers.
 *
 * Pure functions; no DOM or network. Covers all grades/groups, unknown sentinels,
 * case-insensitivity, and the FOP nutrient-level mapping.
 */
import { describe, expect, it } from "vitest";
import {
  ecoScoreUrl,
  fopUnknownUrl,
  fopWarningUrl,
  novaGroupUrl,
  nutriScoreUrl,
  resolveEcoScore,
  resolveFopWarnings,
  resolveNova,
  resolveNutriScore,
} from "../../src/api/offScores";
import type { OFFProduct } from "../../src/api/offTypes";

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

describe("resolveFopWarnings", () => {
  it("returns empty array when nutrient_levels is absent", () => {
    expect(resolveFopWarnings({})).toEqual([]);
  });

  it("returns empty array when no nutrient is 'high'", () => {
    const product: OFFProduct = {
      nutrient_levels: {
        sugars: "low",
        salt: "moderate",
        "saturated-fat": "low",
      },
    };
    expect(resolveFopWarnings(product)).toEqual([]);
  });

  it("reports High in Sugar when sugars is 'high'", () => {
    const product: OFFProduct = { nutrient_levels: { sugars: "high" } };
    const warnings = resolveFopWarnings(product);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      key: "sugars",
      label: "High in Sugar",
    });
  });

  it("maps salt -> sodium warning", () => {
    const product: OFFProduct = { nutrient_levels: { salt: "high" } };
    const warnings = resolveFopWarnings(product);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      key: "sodium",
      label: "High in Sodium",
    });
  });

  it("reports High in Saturated Fat when saturated-fat is 'high'", () => {
    const product: OFFProduct = {
      nutrient_levels: { "saturated-fat": "high" },
    };
    const warnings = resolveFopWarnings(product);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      key: "saturated-fat",
      label: "High in Saturated Fat",
    });
  });

  it("returns all warnings in FOP_MAP order when all nutrients are 'high'", () => {
    const product: OFFProduct = {
      nutrient_levels: {
        sugars: "high",
        salt: "high",
        "saturated-fat": "high",
      },
    };
    const warnings = resolveFopWarnings(product);
    expect(warnings).toHaveLength(3);
    expect(warnings.map((w) => w.key)).toEqual([
      "sugars",
      "sodium",
      "saturated-fat",
    ]);
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
