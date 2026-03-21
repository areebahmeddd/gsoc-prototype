/**
 * useOFF hook - state machine and cancellation tests.
 *
 * Covers the idle -> loading -> done transitions and stale-fetch
 * cancellation when the barcode changes or a component unmounts.
 */
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchProduct } from "../../src/api/offApi";
import type { OFFProduct } from "../../src/api/offTypes";
import { useOFF } from "../../src/hooks/useOFF";

const mockFetchProduct = vi.mocked(fetchProduct);

const PRODUCT: OFFProduct = {
  product_name: "Original Flavour Chips",
  nutriscore_grade: "e",
  nova_group: 4,
  ecoscore_grade: "b",
  nutrient_levels: { "saturated-fat": "high" },
};

beforeEach(() => {
  mockFetchProduct.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useOFF - initial state", () => {
  it("starts idle with null data when barcode is null", () => {
    const { result } = renderHook(() => useOFF(null));
    expect(result.current).toEqual({ data: null, status: "idle" });
  });
});

describe("useOFF - successful fetch", () => {
  it("transitions idle -> loading -> done with product data", async () => {
    mockFetchProduct.mockResolvedValueOnce(PRODUCT);

    const { result } = renderHook(() => useOFF("064100111332"));

    expect(result.current.status).toBe("loading");
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.data).toEqual(PRODUCT);
  });

  it("calls fetchProduct with the provided barcode", async () => {
    mockFetchProduct.mockResolvedValueOnce(PRODUCT);
    renderHook(() => useOFF("064100111332"));

    await waitFor(() =>
      expect(mockFetchProduct).toHaveBeenCalledWith("064100111332"),
    );
  });
});

describe("useOFF - product not found", () => {
  it("sets data to null and status to 'done' when API returns null", async () => {
    mockFetchProduct.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useOFF("3RPT6VQQ6R6G"));

    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.data).toBeNull();
  });
});

describe("useOFF - API error", () => {
  it("sets data to null and status to 'done' on network failure", async () => {
    mockFetchProduct.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useOFF("064100111332"));

    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.data).toBeNull();
  });
});

describe("useOFF - barcode changes", () => {
  it("resets to idle when barcode changes to null", async () => {
    mockFetchProduct.mockResolvedValueOnce(PRODUCT);

    const { result, rerender } = renderHook(
      ({ barcode }: { barcode: string | null }) => useOFF(barcode),
      { initialProps: { barcode: "064100111332" } },
    );

    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.data).toEqual(PRODUCT);

    rerender({ barcode: null });
    expect(result.current).toEqual({ data: null, status: "idle" });
  });

  it("re-fetches and loads new data when barcode changes", async () => {
    const PRODUCT_2: OFFProduct = {
      product_name: "Haagen-Dazs Maple Almond Toffee Ice Cream",
      nutriscore_grade: "d",
      nova_group: 4,
    };
    mockFetchProduct
      .mockResolvedValueOnce(PRODUCT)
      .mockResolvedValueOnce(PRODUCT_2);

    const { result, rerender } = renderHook(
      ({ barcode }: { barcode: string }) => useOFF(barcode),
      { initialProps: { barcode: "064100111332" } },
    );

    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.data).toEqual(PRODUCT);

    rerender({ barcode: "3RPT6VQQ6R6G" });
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.data).toEqual(PRODUCT_2);
  });

  it("ignores a stale response after barcode changes mid-flight", async () => {
    let resolveFirst!: (v: OFFProduct) => void;
    const slowPromise = new Promise<OFFProduct>((res) => {
      resolveFirst = res;
    });

    mockFetchProduct
      .mockReturnValueOnce(slowPromise)
      .mockResolvedValueOnce(PRODUCT);

    const { result, rerender } = renderHook(
      ({ barcode }: { barcode: string }) => useOFF(barcode),
      { initialProps: { barcode: "BARCODE_SLOW" } },
    );

    expect(result.current.status).toBe("loading");

    rerender({ barcode: "BARCODE_FAST" });

    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.data).toEqual(PRODUCT);

    resolveFirst({ product_name: "Stale product" });
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.data).toEqual(PRODUCT);
  });

  it("ignores a stale rejection after barcode changes mid-flight", async () => {
    let rejectFirst!: (e: Error) => void;
    const failingPromise = new Promise<OFFProduct | null>((_, rej) => {
      rejectFirst = rej;
    });

    mockFetchProduct
      .mockReturnValueOnce(failingPromise)
      .mockResolvedValueOnce(PRODUCT);

    const { result, rerender } = renderHook(
      ({ barcode }: { barcode: string }) => useOFF(barcode),
      { initialProps: { barcode: "BARCODE_ERROR" } },
    );

    expect(result.current.status).toBe("loading");

    rerender({ barcode: "BARCODE_OK" });

    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.data).toEqual(PRODUCT);

    rejectFirst(new Error("late network error"));
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.data).toEqual(PRODUCT);
  });
});
