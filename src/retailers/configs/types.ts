/** Configuration contract for a supported grocery store. */
export interface StoreConfig {
  name: string;
  /** Storage key for the per-store toggle. */
  storageKey: string;
  /** URL match patterns for WXT (same syntax as manifest matches). */
  matches: string[];
  /** Returns true when on a product detail page. */
  isProductPage: () => boolean;
  /** Extracts the product barcode from the DOM or URL, or null if unavailable. */
  extractBarcode: () => string | null;
}
