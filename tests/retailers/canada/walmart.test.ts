/**
 * Walmart config - isProductPage + extractBarcode.
 *
 * Walmart product URLs use an opaque alphanumeric ID (no barcode), so the
 * barcode always comes from the DOM.
 */
import { afterEach, describe, expect, it } from "vitest";
import { WalmartConfig } from "../../../src/retailers/configs/canada/walmart";

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

describe("WalmartConfig.isProductPage", () => {
  it("returns true for an English product URL", () => {
    setPathname(
      "/en/ip/Haagen-Dazs-Maple-Almond-Toffee-Ice-Cream/3RPT6VQQ6R6G",
    );
    expect(WalmartConfig.isProductPage()).toBe(true);
  });

  it("returns true for a French product URL", () => {
    setPathname("/fr/ip/Creme-Glacee-Haagen-Dazs/3RPT6VQQ6R6G");
    expect(WalmartConfig.isProductPage()).toBe(true);
  });

  it("returns false for a search page", () => {
    setPathname("/en/search?query=chips");
    expect(WalmartConfig.isProductPage()).toBe(false);
  });

  it("returns false for a category browse page", () => {
    setPathname("/en/browse/food/snacks");
    expect(WalmartConfig.isProductPage()).toBe(false);
  });

  it("returns false for the home page", () => {
    setPathname("/");
    expect(WalmartConfig.isProductPage()).toBe(false);
  });
});

describe("WalmartConfig.extractBarcode - non-product page", () => {
  it("returns null immediately on a non-product page", () => {
    setPathname("/en/search");
    expect(WalmartConfig.extractBarcode()).toBeNull();
  });
});

describe("WalmartConfig.extractBarcode - JSON-LD strategy", () => {
  it("extracts gtin12 from JSON-LD", () => {
    setPathname("/en/ip/Product/ID1");
    document.body.innerHTML = `
      <script type="application/ld+json">
        {"@context":"https://schema.org","@type":"Product","gtin12":"060410006705"}
      </script>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("060410006705");
  });

  it("extracts gtin13 from JSON-LD", () => {
    setPathname("/en/ip/Product/ID1");
    document.body.innerHTML = `
      <script type="application/ld+json">
        {"@type":"Product","gtin13":"0604100067050"}
      </script>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("0604100067050");
  });

  it("extracts barcode when JSON-LD is an array graph", () => {
    setPathname("/en/ip/Product/ID2");
    document.body.innerHTML = `
      <script type="application/ld+json">
        [{"@type":"WebPage"},{"@type":"Product","gtin12":"012345678905"}]
      </script>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("012345678905");
  });

  it("skips null items in a JSON-LD array", () => {
    setPathname("/en/ip/Product/ID-NULL");
    document.body.innerHTML = `
      <script type="application/ld+json">
        [null, {"@type":"Product","gtin12":"012345678912"}]
      </script>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("012345678912");
  });

  it("skips primitive (non-object) items in a JSON-LD array", () => {
    setPathname("/en/ip/Product/ID-PRIMITIVE");
    document.body.innerHTML = `
      <script type="application/ld+json">
        ["WebPage", {"@type":"Product","gtin12":"012345678912"}]
      </script>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("012345678912");
  });

  it("ignores malformed JSON-LD and falls through", () => {
    setPathname("/en/ip/Product/ID3");
    document.body.innerHTML = `
      <script type="application/ld+json">{ bad json }</script>
      <span data-testid="product-upc">012345678912</span>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("012345678912");
  });
});

describe("WalmartConfig.extractBarcode - data-testid strategy", () => {
  it("extracts barcode from data-testid containing 'upc'", () => {
    setPathname("/en/ip/Product/ID4");
    document.body.innerHTML = `<span data-testid="product-upc">060410006705</span>`;
    expect(WalmartConfig.extractBarcode()).toBe("060410006705");
  });

  it("extracts barcode from data-automation-id containing 'upc'", () => {
    setPathname("/en/ip/Product/ID5");
    document.body.innerHTML = `<div data-automation-id="upc-value">060410006705</div>`;
    expect(WalmartConfig.extractBarcode()).toBe("060410006705");
  });

  it("falls through when the element text is not a valid barcode", () => {
    setPathname("/en/ip/Product/ID-INVALID");
    document.body.innerHTML = `<span data-testid="product-upc">N/A</span>`;
    expect(WalmartConfig.extractBarcode()).toBeNull();
  });
});

describe("WalmartConfig.extractBarcode - label sibling strategy", () => {
  it("extracts barcode via parent row when next sibling has no direct value", () => {
    setPathname("/en/ip/Product/ID-PARENTNEXT");
    document.body.innerHTML = `
      <table>
        <tr><th>UPC</th></tr>
        <tr><td>060410006705</td></tr>
      </table>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("060410006705");
  });

  it("extracts barcode from <dt>UPC</dt><dd> layout", () => {
    setPathname("/en/ip/Product/ID6");
    document.body.innerHTML = `
      <dl>
        <dt>UPC</dt>
        <dd>060410006705</dd>
      </dl>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("060410006705");
  });

  it("is case-insensitive for the label text (Barcode)", () => {
    setPathname("/en/ip/Product/ID8");
    document.body.innerHTML = `
      <dl>
        <dt>Barcode</dt>
        <dd>060410006705</dd>
      </dl>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("060410006705");
  });

  it("is case-insensitive for label text (GTIN)", () => {
    setPathname("/en/ip/Product/ID9");
    document.body.innerHTML = `
      <dl>
        <dt>GTIN</dt>
        <dd>060410006705</dd>
      </dl>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("060410006705");
  });
});

describe("WalmartConfig.extractBarcode - TreeWalker strategy", () => {
  it("extracts barcode from plain text nodes separated by whitespace nodes", () => {
    setPathname("/en/ip/Product/IDX");
    document.body.innerHTML = `
      <div>
        <span>Some details</span>
        <span>UPC</span>
        <span> </span>
        <span>060410006705</span>
      </div>
    `;
    expect(WalmartConfig.extractBarcode()).toBe("060410006705");
  });
});

describe("WalmartConfig.extractBarcode - edge cases", () => {
  it("returns null when no extraction strategy succeeds", () => {
    setPathname("/en/ip/Product/IDZ");
    document.body.innerHTML = `<p>No UPC info here.</p>`;
    expect(WalmartConfig.extractBarcode()).toBeNull();
  });

  it("ignores partial numeric strings shorter than 8 digits", () => {
    setPathname("/en/ip/Product/IDZ2");
    document.body.innerHTML = `
      <dl><dt>UPC</dt><dd>1234</dd></dl>
    `;
    expect(WalmartConfig.extractBarcode()).toBeNull();
  });
});
