import { describe, it, expect } from "vitest";
import { buildItem, buildMeta, initGtmConfig, pushToDataLayer, clearEcommerce } from "./gtm";

describe("src/lib/gtm", () => {
  it("normalizes product items into standard GA4 item structure", () => {
    const rawProduct = {
      id: "prod_123",
      name: "Classic Linen Shirt",
      price: 1999,
      taxons: [{ display_name: "Apparel" }],
    };

    const item = buildItem(rawProduct, 2);
    expect(item).toEqual({
      item_id: "prod_123",
      item_name: "Classic Linen Shirt",
      item_category: "Apparel",
      price: 1999,
      quantity: 2,
    });
  });

  it("builds standard metadata with platform defaults", () => {
    const meta = buildMeta({ source: "newsletter" });
    expect(meta.country).toBe("IN");
    expect(meta.platform).toBe("web");
    expect(meta.source).toBe("newsletter");
  });

  it("does not crash on pushToDataLayer when disabled", () => {
    initGtmConfig({ enabled: false });
    expect(() => pushToDataLayer({ event: "test" })).not.toThrow();
  });
});

