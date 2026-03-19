import { useEffect, useState } from "react";
import type { StoreConfig } from "../retailers/configs/types";

/**
 * Polls the DOM for a product barcode using the provided store config.
 * Retries every 500 ms for up to 15 seconds to handle deferred SPA rendering.
 * Resets on URL change to support SPA navigation.
 */
export function useBarcode(
  config: StoreConfig,
  currentUrl: string,
): string | null {
  const [barcode, setBarcode] = useState<string | null>(null);

  useEffect(() => {
    setBarcode(null);
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 30;

    const tryExtract = () => {
      if (cancelled) return;

      const found = config.extractBarcode();
      if (found) {
        // console.log(`[Barcode] Extracted for ${config.name}: ${found}`);
        setBarcode(found);
        return;
      }

      if (attempts++ < MAX_ATTEMPTS) {
        setTimeout(tryExtract, 500);
      }
    };

    const timer = setTimeout(tryExtract, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentUrl, config]);

  return barcode;
}
