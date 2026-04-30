/**
 * useCurrentUrl hook - event listener wiring and cleanup tests.
 *
 * Verifies initial href, updates on popstate and wxt:locationchange events,
 * and that listeners are removed on unmount.
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useCurrentUrl } from "../../src/hooks/useCurrentUrl";

function setHref(href: string) {
  Object.defineProperty(window, "location", {
    value: { ...window.location, href },
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  setHref("about:blank");
});

describe("useCurrentUrl", () => {
  it("returns the initial window.location.href", () => {
    const { result } = renderHook(() => useCurrentUrl());
    expect(result.current).toBe(window.location.href);
  });

  it("updates when a popstate event fires", () => {
    const { result } = renderHook(() => useCurrentUrl());

    setHref("http://localhost/page-2");
    act(() => window.dispatchEvent(new Event("popstate")));

    expect(result.current).toBe("http://localhost/page-2");
  });

  it("updates when a wxt:locationchange event fires", () => {
    const { result } = renderHook(() => useCurrentUrl());

    setHref("http://localhost/page-3");
    act(() => window.dispatchEvent(new Event("wxt:locationchange")));

    expect(result.current).toBe("http://localhost/page-3");
  });

  it("stops updating after unmount", () => {
    const { result, unmount } = renderHook(() => useCurrentUrl());
    const urlBeforeUnmount = result.current;

    unmount();

    setHref("http://localhost/should-not-appear");
    act(() => window.dispatchEvent(new Event("popstate")));

    expect(result.current).toBe(urlBeforeUnmount);
  });
});
