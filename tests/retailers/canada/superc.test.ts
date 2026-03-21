/**
 * Super C config - isProductPage + extractBarcode.
 *
 * Super C shares Metro's platform and /p/{barcode} URL pattern.
 * These tests verify the config is wired correctly for superc.ca.
 */
import { afterEach, describe, expect, it } from "vitest";
import { SuperCConfig } from "../../../src/retailers/configs/canada/superc";

function setPathname(pathname: string) {
  Object.defineProperty(window, "location", {
    value: { ...window.location, pathname },
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  document.body.innerHTML = "";
  setPathname("/");
});

describe("SuperCConfig.isProductPage", () => {
  it("returns true for a canonical product URL", () => {
    setPathname("/en/products/p/066096123306");
    expect(SuperCConfig.isProductPage()).toBe(true);
  });

  it("returns true for a French product URL", () => {
    setPathname("/fr/produits/p/012345678901");
    expect(SuperCConfig.isProductPage()).toBe(true);
  });

  it("returns false for a category page", () => {
    setPathname("/en/products/dairy");
    expect(SuperCConfig.isProductPage()).toBe(false);
  });

  it("returns false for the home page", () => {
    setPathname("/");
    expect(SuperCConfig.isProductPage()).toBe(false);
  });
});

describe("SuperCConfig.extractBarcode - URL strategy", () => {
  it("extracts the barcode from the URL path", () => {
    setPathname("/en/products/p/066096123306");
    expect(SuperCConfig.extractBarcode()).toBe("066096123306");
  });

  it("returns null when not on a product page", () => {
    setPathname("/en/products/dairy");
    expect(SuperCConfig.extractBarcode()).toBeNull();
  });
});

describe("SuperCConfig.extractBarcode - DOM pdpDetailsContainer strategy", () => {
  it("extracts barcode from data-product-code on the PDP container", () => {
    setPathname("/en/products/dairy");
    document.body.innerHTML = `
      <div class="pdpDetailsContainer" data-product-code="123456789012"></div>
    `;
    expect(SuperCConfig.extractBarcode()).toBe("123456789012");
  });

  it("falls through when the container code is not a valid barcode", () => {
    setPathname("/en/products/dairy");
    document.body.innerHTML = `
      <div class="pdpDetailsContainer" data-product-code="INVALID"></div>
    `;
    expect(SuperCConfig.extractBarcode()).toBeNull();
  });
});

describe("SuperCConfig.extractBarcode - DOM product-tile strategy", () => {
  it("extracts barcode from data-product-code on a product tile", () => {
    setPathname("/en/products/dairy");
    document.body.innerHTML = `
      <div class="default-product-tile" data-product-code="888888888888"></div>
    `;
    expect(SuperCConfig.extractBarcode()).toBe("888888888888");
  });

  it("falls through when the tile code is not a valid barcode", () => {
    setPathname("/en/products/dairy");
    document.body.innerHTML = `
      <div class="default-product-tile" data-product-code="bad"></div>
    `;
    expect(SuperCConfig.extractBarcode()).toBeNull();
  });
});
