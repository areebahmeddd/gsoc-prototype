import type { StoreConfig } from "../types";

/** Super C (superc.ca): shares Metro's platform and /p/{barcode} URL pattern. */
export const SuperCConfig: StoreConfig = {
  name: "Super C",
  storageKey: "superc",
  matches: ["*://*.superc.ca/*"],

  isProductPage() {
    return /\/p\/\d{6,14}(\/|$|\?)/.test(window.location.pathname);
  },

  extractBarcode() {
    const urlMatch = window.location.pathname.match(
      /\/p\/(\d{6,14})(?:\/|$|\?)/,
    );
    if (urlMatch) return urlMatch[1];

    const container = document.querySelector<HTMLElement>(
      "div.pdpDetailsContainer",
    );
    const code = container?.getAttribute("data-product-code") ?? null;
    if (code && /^\d{6,14}$/.test(code)) return code;

    const tile = document.querySelector<HTMLElement>(
      ".default-product-tile[data-product-code]",
    );
    const tileCode = tile?.getAttribute("data-product-code") ?? null;
    if (tileCode && /^\d{6,14}$/.test(tileCode)) return tileCode;

    return null;
  },
};
