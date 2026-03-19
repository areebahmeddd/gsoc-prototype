import type { StoreConfig } from "../types";

/** Walmart (walmart.ca): product pages at /en/ip/ or /fr/ip/; UPC extracted from a span near the "UPC" label. */
export const WalmartConfig: StoreConfig = {
  name: "Walmart",
  storageKey: "walmart",
  matches: ["*://*.walmart.ca/*"],

  isProductPage() {
    return /\/(en|fr)\/ip\//.test(window.location.pathname);
  },

  extractBarcode() {
    if (!this.isProductPage()) return null;

    const productContainer = document.querySelector<HTMLElement>("div.pb2");
    if (productContainer) {
      const upcSpan =
        productContainer.querySelector<HTMLElement>(".mv0 > span");
      const raw = upcSpan?.textContent?.trim() ?? "";
      if (/^\d{8,14}$/.test(raw)) return raw;
    }

    const headers = Array.from(document.querySelectorAll<HTMLElement>("h3"));
    for (const h3 of headers) {
      if (h3.textContent?.trim() === "UPC") {
        const span = h3.parentElement?.querySelector<HTMLElement>("span");
        const value = span?.textContent?.trim() ?? "";
        if (/^\d{8,14}$/.test(value)) return value;
      }
    }

    return null;
  },
};
