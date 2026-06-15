import { describe, it, expect } from "vitest";

interface PricingRule {
  name: string;
  type: "percentage" | "fixed" | "buy_x_get_y";
  value: number;
  minQuantity?: number;
  eligibleSkus?: string[];
}

interface CartItem {
  sku: string; name: string; quantity: number; unitPrice: number;
}

function applyPricingRules(items: CartItem[], rules: PricingRule[]): { items: CartItem[]; totalDiscount: number } {
  let totalDiscount = 0;
  const result = items.map(item => ({ ...item }));

  for (const rule of rules) {
    const eligible = result.filter(i => !rule.eligibleSkus || rule.eligibleSkus.includes(i.sku));

    for (const item of eligible) {
      if (rule.minQuantity && item.quantity < rule.minQuantity) continue;

      if (rule.type === "percentage") {
        const discount = item.unitPrice * item.quantity * (rule.value / 100);
        totalDiscount += discount;
      } else if (rule.type === "fixed") {
        totalDiscount += Math.min(rule.value, item.unitPrice * item.quantity);
      } else if (rule.type === "buy_x_get_y") {
        const freeItems = Math.floor(item.quantity / (rule.value + 1));
        totalDiscount += freeItems * item.unitPrice;
      }
    }
  }

  return { items: result, totalDiscount: Math.round(totalDiscount * 100) / 100 };
}

describe("Pricing Rules Engine", () => {
  const cart: CartItem[] = [
    { sku: "W-001", name: "Widget A", quantity: 3, unitPrice: 20 },
    { sku: "W-002", name: "Widget B", quantity: 2, unitPrice: 50 },
  ];

  it("should apply percentage discount", () => {
    const { totalDiscount } = applyPricingRules(cart, [
      { name: "10% Off", type: "percentage", value: 10 },
    ]);
    expect(totalDiscount).toBe(16); // (60+100)*0.10 = 16
  });

  it("should apply fixed amount discount per item", () => {
    const { totalDiscount } = applyPricingRules(cart, [
      { name: "$25 Off", type: "fixed", value: 25 },
    ]);
    expect(totalDiscount).toBe(50); // $25 per eligible item × 2 items
  });

  it("should apply buy X get Y free", () => {
    const { totalDiscount } = applyPricingRules(cart, [
      { name: "Buy 2 Get 1 Free", type: "buy_x_get_y", value: 2 },
    ]);
    // Widget A: qty 3, buy 2 get 1 => 1 free = $20 discount
    // Widget B: qty 2, buy 2 get 1 => 0 free (need 3)
    expect(totalDiscount).toBe(20);
  });

  it("should apply rule only to eligible SKUs", () => {
    const { totalDiscount } = applyPricingRules(cart, [
      { name: "20% Off Widget A", type: "percentage", value: 20, eligibleSkus: ["W-001"] },
    ]);
    expect(totalDiscount).toBe(12); // 60*0.20 = 12
  });

  it("should apply minimum quantity rule", () => {
    const { totalDiscount } = applyPricingRules(cart, [
      { name: "10% Bulk Discount", type: "percentage", value: 10, minQuantity: 3 },
    ]);
    expect(totalDiscount).toBe(6); // only Widget A qualifies (qty 3 => $6 discount)
  });

  it("should handle empty cart", () => {
    const { totalDiscount } = applyPricingRules([], [
      { name: "50% Off", type: "percentage", value: 50 },
    ]);
    expect(totalDiscount).toBe(0);
  });

  it("should handle multiple rules stacked", () => {
    const { totalDiscount } = applyPricingRules(cart, [
      { name: "10% Off", type: "percentage", value: 10 },
      { name: "$10 Off", type: "fixed", value: 10 },
    ]);
    expect(totalDiscount).toBe(36); // 16 + 20
  });
});
