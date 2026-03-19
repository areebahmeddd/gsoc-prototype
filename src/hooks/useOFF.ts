import { useEffect, useState } from "react";
import { fetchProduct } from "../api/offApi";
import type { OFFProduct } from "../api/offTypes";

interface OFFState {
  data: OFFProduct | null;
  loading: boolean;
}

const INITIAL_STATE: OFFState = { data: null, loading: false };

/** Fetches an OFF product by barcode; resets state when the barcode changes. */
export function useOFF(barcode: string | null): OFFState {
  const [state, setState] = useState<OFFState>(INITIAL_STATE);

  useEffect(() => {
    if (!barcode) {
      setState(INITIAL_STATE);
      return;
    }

    let cancelled = false;
    setState({ data: null, loading: true });

    fetchProduct(barcode)
      .then((product) => {
        if (cancelled) return;
        setState({ data: product, loading: false });
      })
      .catch((err) => {
        if (cancelled) return;
        // console.error(`[OFF] Fetch failed for barcode ${barcode}:`, err);
        setState({ data: null, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [barcode]);

  return state;
}
