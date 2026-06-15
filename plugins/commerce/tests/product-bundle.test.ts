import { describe, it, expect } from "vitest";

interface BundleItem { productId: string; name: string; price: number; quantity: number; }
interface Bundle { id: string; name: string; items: BundleItem[]; discountPercent: number; }

function calculateBundlePrice(bundle: Bundle): { individualTotal: number; bundlePrice: number; savings: number } {
  const individualTotal = bundle.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const bundlePrice = individualTotal * (1 - bundle.discountPercent / 100);
  return { individualTotal, bundlePrice: Math.round(bundlePrice * 100) / 100, savings: individualTotal - Math.round(bundlePrice * 100) / 100 };
}

describe("Commerce Product Bundles", () => {
  const bundle: Bundle = {
    id: "b1", name: "Starter Kit", discountPercent: 15,
    items: [
      { productId: "p1", name: "Widget", price: 50, quantity: 1 },
      { productId: "p2", name: "Gizmo", price: 30, quantity: 2 },
    ],
  };

  it("should calculate bundle discount", () => {
    const result = calculateBundlePrice(bundle);
    expect(result.individualTotal).toBe(110);
    expect(result.bundlePrice).toBeCloseTo(93.5, 1);
    expect(result.savings).toBeGreaterThan(0);
  });

  it("should have positive savings", () => {
    const result = calculateBundlePrice(bundle);
    expect(result.savings).toBeGreaterThan(0);
    expect(result.bundlePrice).toBeLessThan(result.individualTotal);
  });

  it("should handle zero discount", () => {
    const noDiscount: Bundle = { ...bundle, discountPercent: 0 };
    const result = calculateBundlePrice(noDiscount);
    expect(result.bundlePrice).toBe(result.individualTotal);
  });
});
