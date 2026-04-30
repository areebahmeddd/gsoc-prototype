/**
 * Metro config - isProductPage + extractBarcode.
 *
 * Metro embeds the barcode directly in the URL (/p/{barcode}), so all
 * strategies are exercised by manipulating window.location and the DOM.
 */
import { afterEach, describe, expect, it } from "vitest";
import { MetroConfig } from "../../../src/retailers/configs/canada/metro";

function setPathname(pathname: string) {
  Object.defineProperty(window, "location", {
    value: { ...window.location, pathname },
    writable: true,
  });
}

afterEach(() => {
  document.body.innerHTML = "";
  setPathname("/");
});

describe("MetroConfig.isProductPage", () => {
  it("returns true for a canonical English product URL", () => {
    setPathname(
      "/en/online-grocery/aisles/snacks/salty-snacks/chips/original-flavour-chips/p/064100111332",
    );
    expect(MetroConfig.isProductPage()).toBe(true);
  });

  it("returns true for a French product URL", () => {
    setPathname(
      "/fr/epicerie-en-ligne/rayons/produits-laitiers/p/012345678901",
    );
    expect(MetroConfig.isProductPage()).toBe(true);
  });

  it("returns true when barcode is followed by a slug", () => {
    setPathname("/en/online-grocery/p/064100111332/original-flavour-chips");
    expect(MetroConfig.isProductPage()).toBe(true);
  });

  it("returns false for a category page", () => {
    setPathname("/en/online-grocery/aisles/dairy-eggs");
    expect(MetroConfig.isProductPage()).toBe(false);
  });

  it("returns false for the home page", () => {
    setPathname("/");
    expect(MetroConfig.isProductPage()).toBe(false);
  });

  it("returns false when /p/ exists but without a numeric segment", () => {
    setPathname("/en/online-grocery/p/some-slug");
    expect(MetroConfig.isProductPage()).toBe(false);
  });
});

describe("MetroConfig.extractBarcode - URL strategy", () => {
  it("extracts the barcode from the URL path", () => {
    setPathname(
      "/en/online-grocery/aisles/snacks/salty-snacks/chips/p/064100111332",
    );
    expect(MetroConfig.extractBarcode()).toBe("064100111332");
  });

  it("extracts a short 6-digit barcode", () => {
    setPathname("/en/online-grocery/p/123456");
    expect(MetroConfig.extractBarcode()).toBe("123456");
  });

  it("returns null when not on a product page", () => {
    setPathname("/en/online-grocery/aisles");
    expect(MetroConfig.extractBarcode()).toBeNull();
  });
});

describe("MetroConfig.extractBarcode - DOM pdpDetailsContainer strategy", () => {
  it("extracts barcode from data-product-code on the PDP container", () => {
    setPathname("/en/online-grocery/aisles/dairy");
    document.body.innerHTML = `
      <div class="pdpDetailsContainer" data-product-code="999999999999"></div>
    `;
    expect(MetroConfig.extractBarcode()).toBe("999999999999");
  });

  it("falls through when the container code is not a valid barcode", () => {
    setPathname("/en/online-grocery/aisles/dairy");
    document.body.innerHTML = `
      <div class="pdpDetailsContainer" data-product-code="INVALID"></div>
    `;
    expect(MetroConfig.extractBarcode()).toBeNull();
  });
});

describe("MetroConfig.extractBarcode - DOM product-tile strategy", () => {
  it("extracts barcode from data-product-code on a default product tile", () => {
    setPathname("/en/online-grocery/aisles/dairy");
    document.body.innerHTML = `
      <div class="default-product-tile" data-product-code="888888888888"></div>
    `;
    expect(MetroConfig.extractBarcode()).toBe("888888888888");
  });

  it("falls through when the tile code is not a valid barcode", () => {
    setPathname("/en/online-grocery/aisles/dairy");
    document.body.innerHTML = `
      <div class="default-product-tile" data-product-code="bad"></div>
    `;
    expect(MetroConfig.extractBarcode()).toBeNull();
  });
});
