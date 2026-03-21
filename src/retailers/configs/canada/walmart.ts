import type { StoreConfig } from "../types";

/** Walmart (walmart.ca): product pages at /en/ip/ or /fr/ip/; UPC extracted via JSON-LD then DOM spec sections. */
export const WalmartConfig: StoreConfig = {
  name: "Walmart",
  storageKey: "walmart",
  matches: ["*://*.walmart.ca/*"],

  isProductPage() {
    return /\/(en|fr)\/ip\//.test(window.location.pathname);
  },

  extractBarcode() {
    if (!this.isProductPage()) return null;

    // Strategy 1: JSON-LD schema.org Product; server-rendered, most reliable
    const ldScripts = Array.from(
      document.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    );
    for (const script of ldScripts) {
      try {
        const json = JSON.parse(script.textContent ?? "");
        const items: unknown[] = Array.isArray(json) ? json : [json];
        for (const item of items) {
          if (typeof item !== "object" || item === null) continue;
          const obj = item as Record<string, unknown>;
          const gtin =
            obj["gtin12"] ??
            obj["gtin13"] ??
            obj["gtin14"] ??
            obj["gtin8"] ??
            obj["gtin"];
          if (typeof gtin === "string" && /^\d{8,14}$/.test(gtin)) return gtin;
        }
      } catch {
        // ignore malformed JSON-LD blocks
      }
    }

    // Strategy 2: data-testid / data-automation-id attributes containing "upc" or "gtin"
    const testIdEl = document.querySelector<HTMLElement>(
      '[data-testid*="upc" i], [data-automation-id*="upc" i], [data-testid*="gtin" i]',
    );
    if (testIdEl) {
      const val = testIdEl.textContent?.trim() ?? "";
      if (/^\d{8,14}$/.test(val)) return val;
    }

    // Strategy 3: label element (h3/h4/dt/th/td/span/div/p) with text "UPC", "Barcode", or "GTIN"
    // followed by its next sibling or the next cell/value element
    const labelEls = Array.from(
      document.querySelectorAll<HTMLElement>(
        "h3, h4, dt, th, td, span, div, p",
      ),
    );
    for (const el of labelEls) {
      const text = el.textContent?.trim() ?? "";
      if (!/^(UPC|Barcode|GTIN)$/i.test(text)) continue;

      // next sibling element
      const next = el.nextElementSibling;
      const nextVal = next?.textContent?.trim() ?? "";
      if (/^\d{8,14}$/.test(nextVal)) return nextVal;

      // parent's next sibling (e.g., <tr><th>UPC</th></tr><tr><td>value</td></tr>)
      const parentNext = el.parentElement?.nextElementSibling;
      const parentNextVal =
        parentNext?.querySelector("td, span, div")?.textContent?.trim() ?? "";
      if (/^\d{8,14}$/.test(parentNextVal)) return parentNextVal;
    }

    // Strategy 4: TreeWalker text-node scan; flexible label match, look ahead up to 8 nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    const textNodes: Text[] = [];
    let node = walker.nextNode();
    while (node) {
      textNodes.push(node as Text);
      node = walker.nextNode();
    }
    for (let i = 0; i < textNodes.length; i++) {
      const t = textNodes[i].textContent?.trim() ?? "";
      if (/^(UPC|Barcode|GTIN)$/i.test(t)) {
        for (let j = i + 1; j < Math.min(i + 8, textNodes.length); j++) {
          const val = textNodes[j].textContent?.trim() ?? "";
          if (/^\d{8,14}$/.test(val)) return val;
        }
      }
    }

    return null;
  },
};
