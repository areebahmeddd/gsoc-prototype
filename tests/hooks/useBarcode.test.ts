/**
 * useBarcode hook - polling, retry, and cleanup tests.
 *
 * Uses fake timers to drive the 300 ms initial delay and 500 ms retry interval.
 * Covers first-poll success, retry-until-success, URL reset, unmount, and max attempts.
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBarcode } from "../../src/hooks/useBarcode";
import type { StoreConfig } from "../../src/retailers/configs/types";

function makeConfig(extractFn: () => string | null): StoreConfig {
  return {
    name: "TestStore",
    storageKey: "test",
    matches: [],
    isProductPage: () => true,
    extractBarcode: extractFn,
  };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useBarcode - initial state", () => {
  it("returns null before the first poll fires", () => {
    const config = makeConfig(() => "12345678");
    const { result } = renderHook(() =>
      useBarcode(config, "http://example.com"),
    );
    expect(result.current).toBeNull();
  });
});

describe("useBarcode - successful extraction", () => {
  it("sets barcode when extractBarcode succeeds on the first poll", () => {
    const config = makeConfig(() => "12345678");
    const { result } = renderHook(() =>
      useBarcode(config, "http://example.com"),
    );
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("12345678");
  });

  it("retries and sets barcode when the first poll returns null", () => {
    const extract = vi
      .fn()
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("87654321");
    const config = makeConfig(extract);
    const { result } = renderHook(() =>
      useBarcode(config, "http://example.com"),
    );

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBeNull();

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe("87654321");
  });
});

describe("useBarcode - URL changes", () => {
  it("resets to null and re-polls when the URL changes", () => {
    const extract = vi
      .fn()
      .mockReturnValueOnce("12345678")
      .mockReturnValueOnce("87654321");
    const config = makeConfig(extract);

    const { result, rerender } = renderHook(
      ({ url }: { url: string }) => useBarcode(config, url),
      { initialProps: { url: "http://example.com/page-1" } },
    );

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("12345678");

    rerender({ url: "http://example.com/page-2" });
    expect(result.current).toBeNull();

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("87654321");
  });
});

describe("useBarcode - cleanup", () => {
  it("cancels the pending timer on unmount", () => {
    const extract = vi.fn().mockReturnValue(null);
    const config = makeConfig(extract);

    const { unmount } = renderHook(() =>
      useBarcode(config, "http://example.com"),
    );

    unmount();
    act(() => vi.runAllTimers());

    expect(extract).not.toHaveBeenCalled();
  });

  it("cancels a pending retry fired after unmount", () => {
    const extract = vi.fn().mockReturnValue(null);
    const config = makeConfig(extract);

    const { unmount } = renderHook(() =>
      useBarcode(config, "http://example.com"),
    );

    act(() => vi.advanceTimersByTime(300));
    expect(extract).toHaveBeenCalledTimes(1);

    unmount();

    act(() => vi.advanceTimersByTime(500));
    expect(extract).toHaveBeenCalledTimes(1);
  });

  it("returns null and stops retrying after MAX_ATTEMPTS", () => {
    const extract = vi.fn().mockReturnValue(null);
    const config = makeConfig(extract);

    const { result } = renderHook(() =>
      useBarcode(config, "http://example.com"),
    );

    act(() => vi.advanceTimersByTime(300 + 30 * 500 + 1));
    expect(result.current).toBeNull();

    const callsAtExhaustion = extract.mock.calls.length;

    act(() => vi.advanceTimersByTime(5000));
    expect(extract.mock.calls.length).toBe(callsAtExhaustion);
  });
});
