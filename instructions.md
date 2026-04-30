# OFF Canada e-store extension (visual-first prototype)

## Objective

Build a **visual-first browser extension** (WXT + React) that shows **Nutri-Score, NOVA, Eco-Score, and Canada FOP** for grocery products in Canada.

The experience should feel simple:

- A **floating icon** appears on a product page
- On click → a clean panel opens
- It displays **only 4 key indicators (must-have)**:
  - Nutri-Score
  - NOVA group
  - Eco-Score
  - Canada FOP warnings

No heavy text. No dense explanations.
Think **visual badges (SVG/images)**, not data tables.

---

## Tech & constraints

- Use **WXT + React + Tailwind CSS**
  - Docs: [https://wxt.dev/guide/installation.html](https://wxt.dev/guide/installation.html) WXT

- Always use **latest official documentation** for all tools
- Use **DuckDB + Parquet** for local experimentation
  - Docs: [https://duckdb.org/docs/](https://duckdb.org/docs/) DuckDB
  - Example guide: [Exploring OFF with DuckDB](https://blog.openfoodfacts.org/en/news/food-transparency-in-the-palm-of-your-hand-explore-the-largest-open-food-database-using-duckdb-%f0%9f%a6%86x%f0%9f%8d%8a)

- Data source: Open Food Facts
  - [Open Food Facts API and its api usage docs](https://world.openfoodfacts.org/data)
  - [https://wiki.openfoodfacts.org/Reusing_Open_Food_Facts_Data](https://wiki.openfoodfacts.org/Reusing_Open_Food_Facts_Data)

---

## Dataset (required)

Use Hugging Face Parquet dataset:

- [https://huggingface.co/datasets/openfoodfacts/product-database/resolve/main/food.parquet?download=true](https://huggingface.co/datasets/openfoodfacts/product-database/resolve/main/food.parquet?download=true)

This is your **primary local dataset** for:

- Matching experiments
- Offline querying via DuckDB
- Reducing API dependency

---

## Important reality (design around this)

- OFF **Canada coverage is incomplete**
- Especially weak for:
  - Barcodes missing
  - Major retailer products (top stores often not fully mapped)

This means:

- **Fallback matching is not optional**
- UI must gracefully handle:
  - partial data
  - uncertain matches

---

## Core UX (this defines the prototype)

### Entry point

- Show a **floating button/icon** on product pages
- Position: bottom-right (or adaptive to avoid overlap)

### On click → open panel

Panel must show **exactly these 4 blocks (visually):**

1. **Nutri-Score** (A–E badge)
2. **NOVA group** (1–4 indicator)
3. **Eco-Score** (A–E badge)
4. **Canada FOP warnings**
   - “High in sugar”
   - “High in sodium”
   - “High in saturated fat”

### UI rules

- Use **SVG badges / icons**, not text-heavy UI
- Minimal labels, large visuals
- Fast render (no blocking)
- Clean, modern layout

No long descriptions. The UI should be scannable in <2 seconds.

---

## Store strategy (very important)

Do NOT try to support many stores.

### Instead

- Pick **ONE store** and go deep
- Ensure:
  - Reliable product detection
  - Accurate data extraction
  - Clean UI placement

Recommended starting points:

- Walmart (often exposes structured data / barcodes)
- Loblaws

Goal:

- Make one store work **really well**
- Then expand later

---

## Product data extraction

From product page, try to extract:

- product name
- brand
- barcode (ideal, but often missing)

Expect:

- Inconsistent DOM
- Missing structured fields

You will need:

- Store-specific selectors
- Iteration and manual inspection

---

## Matching strategy (core logic)

### 1. Primary (best case)

- Use barcode → OFF product API:
  - `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`

### 2. Fallback mode (critical)

When barcode missing or no match:

- Call:
  - [https://world.openfoodfacts.org/cgi/search.pl?search_terms={name+brand}&search_simple=1&json=1](https://world.openfoodfacts.org/cgi/search.pl?search_terms={name+brand}&search_simple=1&json=1)

- Then:
  - Filter by `countries_tags` → prefer Canada
  - Rank results:
    - brand exact match
    - name token overlap
    - substring similarity

### 3. DuckDB-assisted local mode

- Query local `canada_products.parquet`
- Use it to:
  - Generate candidate matches
  - Test ranking logic
  - Improve fallback accuracy

---

## Data preparation (DuckDB)

From the Parquet dataset:

- Filter for Canada:
  - `countries_tags = "en:canada"`

Keep only relevant fields:

- barcode (`code`)
- product_name
- brands
- nutriments
- nutriscore_grade
- nova_group
- ecoscore_grade / score

Export:

- `canada_products.parquet` (working dataset)

Use this for:

- fast local queries
- matching experiments

---

## Canada FOP logic

Reference:

- [https://www.canada.ca/en/health-canada/services/food-nutrition/nutrition-labelling.html](https://www.canada.ca/en/health-canada/services/food-nutrition/nutrition-labelling.html) Health Canada
- [https://www.associatedlp.com/news/2025/complying-with-canadas-front-of-package-nutrition](https://www.associatedlp.com/news/2025/complying-with-canadas-front-of-package-nutrition)

From OFF `nutriments`, determine:

- high sugar
- high sodium
- high saturated fat

Output:

- visual warning icons (not text-heavy explanations)

---

## DuckDB usage (focus areas)

Use DuckDB to:

- Query Parquet directly
- Filter Canada products
- Experiment with:
  - name normalization
  - token matching
  - brand filtering

Goal:

- Improve fallback matching quality
- Not to build a full backend

---

## Key challenges

- Missing barcodes on retailer pages
- Weak OFF coverage in Canada
- Multiple ambiguous matches
- Inconsistent product naming

Your solution must:

- Handle uncertainty
- Prefer “good enough” matches
- Avoid over-complication

---

## What matters for this prototype

- Floating icon appears reliably
- Click → clean panel opens
- Shows **all 4 indicators clearly**
- Works on **one store properly**
- Handles:
  - at least one barcode match
  - at least one fallback match

---

## Implementation mindset

- Prioritize **visual clarity over data depth**
- Keep logic simple and deterministic
- Iterate quickly on one store
- Use DuckDB only where it helps experimentation

This is a **demo-first build**, not a full system.
