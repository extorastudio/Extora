import { describe, it, expect } from "vitest";

interface Variant {
  id: string; sku: string; price: number; attributes: Record<string, string>; isDefault: boolean; isActive: boolean;
}

describe("Variant Manager", () => {
  const variants: Variant[] = [
    { id: "v1", sku: "SHIRT-RED-M", price: 29.99, attributes: { color: "Red", size: "M" }, isDefault: true, isActive: true },
    { id: "v2", sku: "SHIRT-RED-L", price: 29.99, attributes: { color: "Red", size: "L" }, isDefault: false, isActive: true },
    { id: "v3", sku: "SHIRT-BLUE-M", price: 34.99, attributes: { color: "Blue", size: "M" }, isDefault: false, isActive: false },
  ];

  it("should find active variants", () => {
    const active = variants.filter(v => v.isActive);
    expect(active.length).toBe(2);
  });

  it("should find by attribute combination", () => {
    const redMedium = variants.find(v => v.attributes.color === "Red" && v.attributes.size === "M");
    expect(redMedium?.sku).toBe("SHIRT-RED-M");
  });

  it("should find default variant", () => {
    const def = variants.find(v => v.isDefault);
    expect(def?.id).toBe("v1");
  });

  it("should get price range", () => {
    const prices = variants.filter(v => v.isActive).map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    expect(min).toBe(29.99);
    expect(max).toBe(29.99);
  });
});
