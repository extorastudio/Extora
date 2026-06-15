import { describe, it, expect } from "vitest";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  expiresAt?: string;
}

interface DiscountResult {
  valid: boolean;
  discountAmount: number;
  newSubtotal: number;
  error?: string;
}

function applyCoupon(coupon: Coupon, subtotal: number, shippingCost: number): DiscountResult {
  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, newSubtotal: subtotal, error: "Coupon is not active" };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, discountAmount: 0, newSubtotal: subtotal, error: "Coupon has expired" };
  }

  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return { valid: false, discountAmount: 0, newSubtotal: subtotal, error: "Coupon usage limit reached" };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return { valid: false, discountAmount: 0, newSubtotal: subtotal, error: `Minimum order amount is ${coupon.minOrderAmount}` };
  }

  let discountAmount = 0;

  if (coupon.type === "percentage") {
    discountAmount = subtotal * (coupon.value / 100);
  } else if (coupon.type === "fixed_amount") {
    discountAmount = Math.min(coupon.value, subtotal);
  } else if (coupon.type === "free_shipping") {
    discountAmount = shippingCost;
  }

  return { valid: true, discountAmount, newSubtotal: subtotal - discountAmount + (coupon.type === "free_shipping" ? 0 : shippingCost) };
}

describe("Commerce Coupon System", () => {
  const activeCoupon: Coupon = {
    id: "c1", code: "SAVE20", type: "percentage", value: 20,
    currentUses: 0, isActive: true,
  };

  const fixedCoupon: Coupon = {
    id: "c2", code: "FLAT50", type: "fixed_amount", value: 50,
    currentUses: 0, isActive: true, minOrderAmount: 100,
  };

  const freeShipCoupon: Coupon = {
    id: "c3", code: "FREESHIP", type: "free_shipping", value: 0,
    currentUses: 0, isActive: true,
  };

  const expiredCoupon: Coupon = {
    id: "c4", code: "OLD", type: "percentage", value: 10,
    currentUses: 0, isActive: true,
    expiresAt: "2024-01-01",
  };

  const maxedCoupon: Coupon = {
    id: "c5", code: "LIMITED", type: "percentage", value: 15,
    currentUses: 100, maxUses: 100, isActive: true,
  };

  it("should apply percentage discount", () => {
    const result = applyCoupon(activeCoupon, 100, 10);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(20);
    expect(result.newSubtotal).toBe(90);
  });

  it("should apply fixed amount discount", () => {
    const result = applyCoupon(fixedCoupon, 150, 10);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(50);
    expect(result.newSubtotal).toBe(110);
  });

  it("should not discount below minimum order", () => {
    const result = applyCoupon(fixedCoupon, 50, 10);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Minimum order");
  });

  it("should apply free shipping coupon", () => {
    const result = applyCoupon(freeShipCoupon, 100, 15);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(15);
    expect(result.newSubtotal).toBe(85);
  });

  it("should reject expired coupons", () => {
    const result = applyCoupon(expiredCoupon, 100, 10);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("expired");
  });

  it("should reject maxed out coupons", () => {
    const result = applyCoupon(maxedCoupon, 100, 10);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("limit");
  });

  it("should not discount below zero", () => {
    const bigCoupon: Coupon = { ...fixedCoupon, value: 200 };
    const result = applyCoupon(bigCoupon, 100, 10);
    expect(result.discountAmount).toBeLessThanOrEqual(100);
  });

  it("should calculate grand total with coupon, tax, and shipping", () => {
    const subtotal = 200;
    const tax = 16;
    const shipping = 10;

    const discount = applyCoupon(activeCoupon, subtotal, shipping);
    expect(discount.discountAmount).toBe(40);

    const grandTotal = discount.newSubtotal + tax;
    expect(grandTotal).toBe(186);
  });
});
