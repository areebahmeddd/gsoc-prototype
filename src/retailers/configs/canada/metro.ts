import type { StoreConfig } from "../types";

/** Metro (metro.ca): product pages at /p/{barcode}; DOM fallback via div.pdpDetailsContainer[data-product-code]. */
export const MetroConfig: StoreConfig = {
  name: "Metro",
  storageKey: "metro",
  matches: ["*://*.metro.ca/*"],

  isProductPage() {
    return /\/p\/\d{6,14}(\/|$|\?)/.test(window.location.pathname);
  },

  extractBarcode() {
    // Strategy 1: barcode embedded directly in the URL path /p/{barcode}
    const urlMatch = window.location.pathname.match(
      /\/p\/(\d{6,14})(?:\/|$|\?)/,
    );
    if (urlMatch) return urlMatch[1];

    // Strategy 2: data-product-code attribute on the PDP container
    const container = document.querySelector<HTMLElement>(
      "div.pdpDetailsContainer",
    );
    const code = container?.getAttribute("data-product-code") ?? null;
    if (code && /^\d{6,14}$/.test(code)) return code;

    // Strategy 3: data-product-code attribute on a product tile
    const tile = document.querySelector<HTMLElement>(
      ".default-product-tile[data-product-code]",
    );
    const tileCode = tile?.getAttribute("data-product-code") ?? null;
    if (tileCode && /^\d{6,14}$/.test(tileCode)) return tileCode;

    return null;
  },
};
