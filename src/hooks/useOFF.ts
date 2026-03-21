import { useEffect, useState } from "react";
import { fetchProduct } from "../api/offApi";
import type { OFFProduct } from "../api/offTypes";

export type FetchStatus = "idle" | "loading" | "done";

interface OFFState {
  data: OFFProduct | null;
  status: FetchStatus;
}

const INITIAL_STATE: OFFState = { data: null, status: "idle" };

/** Fetches an OFF product by barcode; resets state when the barcode changes. */
export function useOFF(barcode: string | null): OFFState {
  const [state, setState] = useState<OFFState>(INITIAL_STATE);

  useEffect(() => {
    if (!barcode) {
      setState(INITIAL_STATE);
      return;
    }

    let cancelled = false;
    setState({ data: null, status: "loading" });

    fetchProduct(barcode)
      .then((product) => {
        if (cancelled) return;
        setState({ data: product, status: "done" });
      })
      .catch((err) => {
        if (cancelled) return;
        // console.error(`[OFF] Fetch failed for barcode ${barcode}:`, err);
        setState({ data: null, status: "done" });
      });

    return () => {
      cancelled = true;
    };
  }, [barcode]);

  return state;
}
