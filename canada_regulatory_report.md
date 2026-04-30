# Health Canada Nutrition Labelling — Regulatory Report

## Relevance to `instructions.md` (OFF Canada Extension)

**Sources:** 5 Health Canada pages + industry guide (fetched live)
**Report date:** Current regulatory state (Jan 1, 2026 enforcement active)
**Regulation:** Food and Drug Regulations, sections B.01.350–B.01.357 (amended July 20, 2022, mandatory from Jan 1, 2026)

---

## 1. Executive Summary

Canada's FOP nutrition symbol is now **mandatory** (as of January 1, 2026) on most packaged foods meeting or exceeding nutrient thresholds. The symbol identifies foods "high in" saturated fat, sugars, and/or sodium.

**Critical finding for our extension:** The correct FOP computation is **% Daily Value per serving** — NOT a flat per-100g threshold as currently implemented in `explore_off_v2.py`. This needs to be corrected before building the extension's FOP logic.

---

## 2. Front-of-Package (FOP) Symbol — The Core Logic

### 2.1 Symbol Description

- Black-and-white symbol with magnifying glass
- Shows: "High in sat fat", "High in sugars", "High in sodium" (any combination)
- Always shows 3 bars in fixed order: Sat fat → Sugars → Sodium
- Bilingual (English/French) required on Canadian market
- "Health Canada / Santé Canada" attribution at bottom

### 2.2 Mandatory Trigger — % Daily Value Thresholds

The threshold is based on **% Daily Value per serving (or reference amount, whichever is greater)**.

**Daily Values used for FOP computation (Column 3 — children and/or adults):**

| Nutrient                                | Daily Value |
| --------------------------------------- | ----------- |
| Saturated fat + trans fat (combined DV) | **20 g**    |
| Sugars                                  | **100 g**   |
| Sodium                                  | **2300 mg** |

> **Note:** For FOP computation, only saturated fat is used in the numerator (not sat fat + trans fat combined). The combined DV of 20g is still the denominator.

**Threshold tiers:**

| Product type                                        | Trigger      |
| --------------------------------------------------- | ------------ |
| Standard packaged food (ref amount > 30 g or 30 mL) | **≥ 15% DV** |
| Small package (ref amount ≤ 30 g or 30 mL)          | **≥ 10% DV** |
| Main dish (ref amount ≥ 200 g)                      | **≥ 30% DV** |
| Main dish for toddlers (ref amount ≥ 170 g)         | **≥ 30% DV** |

### 2.3 Absolute Gram Equivalents (for standard products, 15% DV tier)

These are the effective gram thresholds **per serving** for a standard packaged food:

| Nutrient      | Threshold (15% DV)       | Computation   |
| ------------- | ------------------------ | ------------- |
| Saturated fat | **≥ 3.0 g** per serving  | 15% × 20 g    |
| Sugars        | **≥ 15.0 g** per serving | 15% × 100 g   |
| Sodium        | **≥ 345 mg** per serving | 15% × 2300 mg |

For small packages (10% DV):

| Nutrient      | Threshold (10% DV)       |
| ------------- | ------------------------ |
| Saturated fat | **≥ 2.0 g** per serving  |
| Sugars        | **≥ 10.0 g** per serving |
| Sodium        | **≥ 230 mg** per serving |

---

## 3. CRITICAL: Bug in Current `explore_off_v2.py` FOP Logic

### 3.1 What the script currently does (incorrect)

```python
FOP_THRESHOLDS = {
    "saturated-fat": {"field": "saturated-fat_100g", "threshold": 10.0, ...},  # per 100g
    "sodium":        {"field": "sodium_100g",         "threshold": 0.6, ...},  # per 100g (in grams)
    "sugars":        {"field": "sugars_100g",          "threshold": 15.0, ...}, # per 100g
}
```

**Problems:**

1. Computed per 100g — should be **per serving**
2. Sat fat threshold 10g/100g is too permissive — correct is 3g per serving (15% DV)
3. Sodium threshold 600mg/100g is too permissive — correct is 345mg per serving
4. Sugars 15g/100g accidentally close to correct, but still should be per serving, not per 100g

### 3.2 Correct computation

```python
# Daily Values (Health Canada, Column 3 - children and/or adults)
DV = {
    "saturated-fat": 20.0,   # grams (combined DV with trans fat, but only sat fat in numerator)
    "sugars": 100.0,          # grams
    "sodium": 2300.0,         # milligrams
}

# OFF stores sodium in grams, so multiply ×1000 to get mg
def compute_fop_correct(nutriments, serving_size_g):
    """
    serving_size_g: serving size in grams (from OFF 'serving_size' field, parsed)
    Returns: dict of {nutrient: {"pct_dv": float, "flag": bool}}
    """
    results = {}

    # Saturated fat
    sat_fat_per_100g = nutriments.get("saturated-fat_100g", 0)
    sat_fat_serving = sat_fat_per_100g * serving_size_g / 100
    sat_fat_pct_dv = (sat_fat_serving / DV["saturated-fat"]) * 100
    results["saturated-fat"] = {"pct_dv": sat_fat_pct_dv, "flag": sat_fat_pct_dv >= 15}

    # Sugars
    sugars_per_100g = nutriments.get("sugars_100g", 0)
    sugars_serving = sugars_per_100g * serving_size_g / 100
    sugars_pct_dv = (sugars_serving / DV["sugars"]) * 100
    results["sugars"] = {"pct_dv": sugars_pct_dv, "flag": sugars_pct_dv >= 15}

    # Sodium (OFF stores in g, DV is in mg)
    sodium_per_100g_g = nutriments.get("sodium_100g", 0)
    sodium_serving_mg = sodium_per_100g_g * serving_size_g / 100 * 1000
    sodium_pct_dv = (sodium_serving_mg / DV["sodium"]) * 100
    results["sodium"] = {"pct_dv": sodium_pct_dv, "flag": sodium_pct_dv >= 15}

    return results
```

### 3.3 Handling missing serving size (common in OFF data)

When `serving_size` is absent:

- Use `_serving` suffixed fields if available (e.g., `sodium_serving`)
- Otherwise: fall back to per-100g computation with a note that it's approximate
- A common Canadian serving is 30g (snacks/cereals), flag this in output

---

## 4. Exempt / Non-Exempt Foods (Relevant to Our Product List)

### 4.1 Fully exempt (never need FOP symbol) — affects some of our categories

| Food                                        | Why exempt                     | Impact on extension    |
| ------------------------------------------- | ------------------------------ | ---------------------- |
| Butter, ghee, margarine                     | Division 9 fats full exemption | Skip FOP for these     |
| Vegetable oils (canola, olive, etc.)        | Division 9 fats                | Skip FOP               |
| Table sugar, honey, maple syrup             | Sweetening agents              | Skip FOP               |
| Table salt, celery salt                     | Salt exemption                 | Skip FOP               |
| Very small packages (<15 cm²)               | Size exemption                 | Likely won't encounter |
| Individual portion packets (e.g., creamers) | Commercial service exemption   | Likely won't encounter |

### 4.2 Conditionally exempt — key dairy/health foods

| Food                                          | Exemption type            | Condition                                                                                       |
| --------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| Plain milk (any fat %)                        | Health protection benefit | No added sat fat/sodium/sugars                                                                  |
| Plain yogurt                                  | Health protection benefit | Loses exemption if sugars added                                                                 |
| Cheese                                        | Calcium source            | ≥5% DV calcium (since June 2024), exempt for sat fat & sugars; ALWAYS exempt from "high sodium" |
| Whole eggs, plain                             | Health protection benefit | No added nutrients                                                                              |
| Plain nuts/seeds/nut butters                  | Health protection benefit | <30% saturated fat of total fat                                                                 |
| Fresh/frozen/canned plain fruits & vegetables | Health protection benefit | No added sat fat/sodium/sugars                                                                  |
| Fish/seafood with <30% sat fat of total fat   | Health protection benefit | No added nutrients                                                                              |

> **Practical note for extension:** Most products in our test set (Cheerios, Activia, Oreo, Lay's, Tropicana, Heinz Ketchup, etc.) are NOT exempt and must show the FOP symbol if thresholds are met.
>
> **Activia yogurt** — may be conditionally exempt for sat fat/sugars if no problematic added ingredients, but loses it due to fruit preparations. Currently not exempt for sodium.
>
> **Kraft Cheddar cheese** — always exempt from "high sodium" symbol. Check sat fat/sugars threshold.

### 4.3 Products that are PROHIBITED from showing FOP symbol

- Infant formula / human milk substitutes
- Meal replacements / formulated liquid diets
- Nutritional supplements
- Foods for protein-restricted/amino-acid-restricted diets
- These will not appear in our test set.

---

## 5. Nutrition Facts Table — What Matters for Our Extension

### 5.1 The 12 mandatory nutrients

The Canadian NFt must declare:

1. Calories
2. Fat (total)
3. Saturated fat
4. Trans fat
5. Cholesterol
6. Sodium
7. Carbohydrates (total)
8. Fibre
9. Sugars
10. Protein
11. Vitamin D
12. Calcium
13. Iron
14. Potassium

> Most of these map directly to OFF `nutriments.*` fields.

### 5.2 % DV in NFt vs FOP — IMPORTANT DIFFERENCE

- **NFt %DV for sat fat**: uses sat fat + trans fat combined ÷ 20g
- **FOP %DV for sat fat**: uses sat fat ONLY ÷ 20g
- This means if a product has trans fat, the NFt %DV will be HIGHER than what FOP computation uses
- OFF `saturated-fat_100g` is sat fat only → use this for correct FOP logic

### 5.3 % DV interpretation

| % DV                                | Interpretation              |
| ----------------------------------- | --------------------------- |
| ≤ 5%                                | "A little" of this nutrient |
| ≥ 15%                               | "A lot" of this nutrient    |
| The FOP symbol triggers at ≥ 15% DV | Symbol is required          |

### 5.4 Serving size in OFF data

OFF provides:

- `serving_size` → string like "30 g", "250 mL", "2 cookies (28g)"
- `nutriments.energy-kcal_serving` → calories per serving
- `nutriments.sodium_serving` → sodium per serving (in grams, same unit as \_100g)
- `nutriments.sugars_serving` → sugars per serving
- `nutriments.saturated-fat_serving` → sat fat per serving

**Availability in Canadian products:** Low (~30-40% of products have serving data). Per-100g values are much more reliable.

**Recommended approach:**

1. Try `_serving` fields first
2. If missing, parse `serving_size` string to get grams
3. Compute `_per_100g × (serving_g / 100)`
4. If no serving info at all: use per-100g as a proxy with a "approximate" flag in UI

---

## 6. Ingredient List — Signals for Our Extension

The ingredient list is ordered by weight (highest first). Key uses:

### 6.1 Sugar position signal

- If "sugar" or any sugar synonym appears in first 3 ingredients → high-sugar product
- Synonyms to watch: sucrose, glucose, fructose, corn syrup, dextrose, maltose, honey, agave, maple syrup, molasses, brown sugar, invert sugar, fruit juice concentrate

### 6.2 Sodium-containing ingredient signal

- Salt, sodium chloride, monosodium glutamate (MSG), disodium phosphate, sodium benzoate, baking soda (sodium bicarbonate) → sodium source
- Their presence in early position indicates high sodium

### 6.3 How this helps the extension

- Can complement OFF FOP flags with ingredient-text scanning as a fallback
- Especially useful when `nutriments` data is sparse

---

## 7. Nutrient Content Claims — Useful Signals

These claims on labels can help validate our OFF data assessment:

| Claim                  | Meaning (approx.)                                      |
| ---------------------- | ------------------------------------------------------ |
| "Low in sodium"        | ≤ 140 mg/serving                                       |
| "Reduced in sodium"    | ≥ 25% less than reference food                         |
| "Free of sodium"       | < 5 mg/serving                                         |
| "Low in saturated fat" | ≤ 2 g sat fat/serving, ≤ 15% energy from sat+trans fat |
| "Low in sugars"        | ≤ 5 g sugars/serving                                   |
| "Free of sugars"       | < 0.5 g sugars/serving                                 |
| "High fibre"           | ≥ 4 g fibre/serving                                    |
| "Source of fibre"      | ≥ 2 g fibre/serving                                    |

> These claims appear in OFF's `labels_tags` field as: `en:low-sodium`, `en:reduced-fat`, etc. They can serve as soft validation of our computed FOP flags.

---

## 8. Corrected FOP Implementation Strategy for Extension

### 8.1 Computation pipeline (TypeScript pseudocode)

```typescript
interface FOPResult {
  highSaturatedFat: boolean;
  highSugars: boolean;
  highSodium: boolean;
  confidence: "exact" | "estimated" | "unknown";
}

function computeFOP(product: OFFProduct): FOPResult {
  const nutriments = product.nutriments;

  // Try to get per-serving values
  const servingG = parseServingSize(product.serving_size); // parse "30 g" → 30

  let satFatG: number | null = null;
  let sugarsG: number | null = null;
  let sodiumMg: number | null = null;
  let confidence: "exact" | "estimated" | "unknown" = "unknown";

  if (nutriments["saturated-fat_serving"] != null) {
    // Use direct serving values
    satFatG = nutriments["saturated-fat_serving"];
    sugarsG = nutriments["sugars_serving"];
    sodiumMg = (nutriments["sodium_serving"] ?? 0) * 1000;
    confidence = "exact";
  } else if (servingG && nutriments["saturated-fat_100g"] != null) {
    // Compute from per-100g + serving size
    satFatG = (nutriments["saturated-fat_100g"] * servingG) / 100;
    sugarsG = ((nutriments["sugars_100g"] ?? 0) * servingG) / 100;
    sodiumMg = (((nutriments["sodium_100g"] ?? 0) * servingG) / 100) * 1000;
    confidence = "estimated";
  } else if (nutriments["saturated-fat_100g"] != null) {
    // Fallback: assume 100g as serving (rough proxy)
    satFatG = nutriments["saturated-fat_100g"];
    sugarsG = nutriments["sugars_100g"] ?? 0;
    sodiumMg = (nutriments["sodium_100g"] ?? 0) * 1000;
    confidence = "estimated"; // imprecise
  }

  if (satFatG === null)
    return {
      highSaturatedFat: false,
      highSugars: false,
      highSodium: false,
      confidence: "unknown",
    };

  // DVs (Health Canada, column 3 — children and/or adults)
  const SAT_FAT_DV = 20; // grams
  const SUGARS_DV = 100; // grams
  const SODIUM_DV = 2300; // mg
  const THRESHOLD = 0.15; // 15% DV for standard products

  return {
    highSaturatedFat: satFatG / SAT_FAT_DV >= THRESHOLD,
    highSugars: (sugarsG ?? 0) / SUGARS_DV >= THRESHOLD,
    highSodium: sodiumMg / SODIUM_DV >= THRESHOLD,
    confidence,
  };
}
```

### 8.2 Serving size parser

```typescript
function parseServingSize(servingStr: string | undefined): number | null {
  if (!servingStr) return null;
  // Handles: "30g", "30 g", "250 ml", "1 cup (240g)", "2 cookies (28 g)"
  const match = servingStr.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  if (match) return parseFloat(match[1]);
  // mL — assume 1ml ≈ 1g for beverages as approximation
  const mlMatch = servingStr.match(/(\d+(?:\.\d+)?)\s*ml?\b/i);
  if (mlMatch) return parseFloat(mlMatch[1]);
  return null;
}
```

### 8.3 Correction needed in explore_off_v2.py and explore_off_v3.py

The scripts should be updated to:

1. Extract `serving_size` from the OFF product response
2. Parse it to grams
3. Compute FOP as `% DV = nutrient_per_serving / DV × 100`
4. Flag at ≥ 15% DV
5. Fall back to per-100g with a note when serving size is unavailable

---

## 9. OFF API Field Mapping to Canadian NFt Requirements

| Canadian NFt field | OFF API field (v2)              | Notes                 |
| ------------------ | ------------------------------- | --------------------- |
| Calories (kcal)    | `nutriments.energy-kcal_100g`   | Also `_serving`       |
| Fat (total)        | `nutriments.fat_100g`           |                       |
| **Saturated fat**  | `nutriments.saturated-fat_100g` | KEY FOP field         |
| Trans fat          | `nutriments.trans-fat_100g`     | Often missing         |
| Cholesterol        | `nutriments.cholesterol_100g`   | Often missing         |
| **Sodium (mg)**    | `nutriments.sodium_100g` × 1000 | OFF stores in grams!  |
| Carbohydrates      | `nutriments.carbohydrates_100g` |                       |
| Fibre              | `nutriments.fiber_100g`         | Also `fibre_100g`     |
| **Sugars**         | `nutriments.sugars_100g`        | KEY FOP field         |
| Protein            | `nutriments.proteins_100g`      |                       |
| Vitamin D          | `nutriments.vitamin-d_100g`     | Very often missing    |
| Calcium            | `nutriments.calcium_100g`       | mg/100g               |
| Iron               | `nutriments.iron_100g`          | mg/100g               |
| Potassium          | `nutriments.potassium_100g`     | Often missing         |
| Nutri-Score grade  | `nutriscore_grade`              | A-E string            |
| NOVA group         | `nova_group`                    | 1-4 integer           |
| Eco-Score grade    | `ecoscore_grade`                | A-E string            |
| Serving size       | `serving_size`                  | String, needs parsing |

---

## 10. Coverage Gaps and Extension Design Implications

### 10.1 What's reliably in OFF Canada data

- Product names, brands, barcodes (when scanned)
- Saturated fat, sugars, sodium per 100g (the 3 FOP nutrients)
- Nutri-Score grade (not always computed for Canadian products)
- NOVA group (computed by OFF algorithm)
- Eco-Score (computed by OFF, not a Canadian regulation)

### 10.2 What's often missing

- `serving_size` — critical for accurate FOP, missing ~60-70% of Canadian entries
- `vitamin-d_100g` — rarely available
- `potassium_100g` — often missing
- Trans fat — often missing
- Cholesterol — often missing

### 10.3 Extension UI implications

The 4 indicators panel should show confidence level:

```
[Nutri-Score: B]  ← from OFF, reliable if available
[NOVA: 4]         ← from OFF algorithm
[Eco-Score: C]    ← from OFF algorithm
[Canada FOP]
  🔴 High in sugars      ← computed from % DV
  🟡 High in sodium*     ← * = estimated (no serving size)
  ✅ Not high in sat fat
```

Show `*` or `~` when value is estimated from per-100g values.

---

## 11. Comparison: Old FOP Logic vs Correct FOP Logic

| Nutrient | Old threshold (wrong) | Correct 15% DV | Correct 10% DV (small pkg) |
| -------- | --------------------- | -------------- | -------------------------- |
| Sat fat  | 10.0 g/100g           | 3.0 g/serving  | 2.0 g/serving              |
| Sugars   | 15.0 g/100g           | 15.0 g/serving | 10.0 g/serving             |
| Sodium   | 600 mg/100g           | 345 mg/serving | 230 mg/serving             |

**Key takeaway:** The old thresholds were applied per 100g (concentrations), which systematically underdetects high-nutrient warnings. Many products will meet the FOP threshold per serving but not per 100g.

Example: A 30g serving of cereal with 5g sugars:

- Old method: 5/30×100 = 16.7g/100g → 16.7 > 15 → flagged ✓ (accidentally correct)
- Old method: If 4g sugars → 13.3g/100g → NOT flagged ✗
- Correct method: 4g/100g × 15 = per serving = 4×30/100 = 1.2g/serving → 1.2/100 = 1.2% DV → NOT flagged ✓ (agrees)
- But: 4g sugars in 30g serving = 4/100 DV × 100 = 4% → NOT flagged also ✓

More problematic example: Sauce with 600mg Na/serving (15 mL serving):

- Old method: 600mg/15g × 100 = 4000mg/100g = 4g/100g → 0.4×1000 = 400mg/100g... wait, this gets complicated
- The old method comparing 0.6g per 100g (in g units) to sodium_100g which is also in g units is correct magnitude-wise for catching high-sodium condiments but misses moderate-sodium products

---

## 12. Recommended Next Steps

### Priority 1: Fix FOP logic in explore scripts

Update `compute_fop()` in both scripts to use % DV computation with serving sizes.

### Priority 2: Update Python scripts output format

Add to each product result:

- `serving_size_g`: parsed serving size
- `fop_method`: "exact" | "per_100g_estimated"
- `fop_sat_fat_pct_dv`, `fop_sugars_pct_dv`, `fop_sodium_pct_dv`

### Priority 3: Extension FOP TypeScript module

Implement the corrected computation as a standalone utility module for the extension.

### Priority 4: Exemption awareness in extension

For the FOP display, skip the symbol for:

- Plain dairy (check `categories_tags` or `labels_tags` for exemption signals)
- Confirm against product category in OFF data

### Priority 5: Serving size availability analysis

After re-running the scripts: measure what % of the 30 test products have `serving_size` field populated. This determines how reliable FOP estimates will be in production.

---

## 13. Regulatory Timeline

| Date                     | Event                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------- |
| July 20, 2022            | Regulations published in Canada Gazette, Part II                                        |
| July 20, 2022            | Regulations came into force                                                             |
| January 1, 2026          | **Mandatory compliance deadline — ALL non-exempt packaged foods now MUST carry symbol** |
| Products pre-Jan 1, 2026 | May remain on shelves even if not compliant until sold out                              |

**Implication for extension:** When scraping product pages, products may still show pre-2026 labels without the FOP symbol. Our extension fills this gap by computing and displaying FOP status based on OFF nutritional data.

---

## 14. Summary Checklist for Extension Builder

- [ ] **FOP computation**: Use % DV per serving (not per 100g)
- [ ] **DVs**: Sat fat 20g, Sugars 100g, Sodium 2300mg
- [ ] **Threshold**: ≥15% DV for standard, ≥10% for small packages
- [ ] **Sodium unit**: OFF stores sodium in grams — multiply ×1000 for mg
- [ ] **Sat fat only**: NFt %DV uses sat+trans; FOP uses sat fat only
- [ ] **Serving size**: Parse `serving_size` string; fall back to per-100g estimate
- [ ] **Exemptions**: Skip FOP warnings for plain dairy/nuts/eggs/fruits/veg
- [ ] **OFF fields**: `saturated-fat_100g`, `sugars_100g`, `sodium_100g`, `serving_size`
- [ ] **Confidence indicators**: Show when FOP is estimated vs exact
- [ ] **Claims cross-check**: Can use OFF's `labels_tags` (e.g., `en:low-sodium`) as soft validation
- [ ] **Cheese note**: Cheese is exempt from "high in sodium" symbol even if sodium is high
