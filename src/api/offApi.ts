/**
 * Open Food Facts API v2 service.
 *
 * @see https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

import { browser } from "#imports";
import type { OFFApiResponse, OFFProduct } from "./offTypes";

const API_BASE = "https://world.openfoodfacts.org/api/v2/product/";

/** Fields requested from the OFF API for the nutrition panel. */
const FIELDS = [
  "product_name",
  "nutriscore_grade",
  "nova_group",
  "ecoscore_grade",
  "nutrient_levels",
  "nutriments",
  "image_small_url",
  "image_url",
  "url",
].join(",");

function buildUserAgent(): string {
  try {
    const manifest = browser.runtime.getManifest();
    return `${navigator.userAgent} ${manifest.name}/${manifest.version}`;
  } catch {
    return `${navigator.userAgent} openfoodfacts-estore/0.1.0`;
  }
}

/**
 * Fetches a product from the Open Food Facts API by barcode.
 *
 * @param barcode - The product barcode (UPC or EAN).
 * @returns The product data, or null if not found.
 * @throws {Error} When the API responds with a non-OK status.
 */
export async function fetchProduct(
  barcode: string,
): Promise<OFFProduct | null> {
  const url = `${API_BASE}${encodeURIComponent(barcode)}.json?fields=${FIELDS}`;
  // console.log(`[OFF] Request URL: ${url}`);

  const response = await fetch(url, {
    method: "GET",
    cache: "force-cache",
    headers: {
      Accept: "application/json",
      "User-Agent": buildUserAgent(),
    },
  });

  if (!response.ok) {
    // console.error(`[OFF] API error: ${response.status} ${response.statusText}`);
    throw new Error(`OFF API error: ${response.status} ${response.statusText}`);
  }

  const data: OFFApiResponse = await response.json();

  if (data.status === 0 || !data.product) {
    // console.warn(`[OFF] Product not found for barcode: ${barcode}`);
    return null;
  }

  return data.product;
}
