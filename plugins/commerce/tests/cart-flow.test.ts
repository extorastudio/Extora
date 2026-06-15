import { describe, it, expect, beforeEach } from "vitest";

interface CartItem { variantId: string; name: string; sku: string; quantity: number; unitPrice: number; }
interface Cart { items: CartItem[]; subtotal: number; taxTotal: number; shippingTotal: number; grandTotal: number; couponCode?: string; }

function createCart(): Cart { return { items: [], subtotal: 0, taxTotal: 0, shippingTotal: 0, grandTotal: 0 }; }

function addItem(cart: Cart, item: CartItem): void {
  const existing = cart.items.find(i => i.variantId === item.variantId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.items.push(item);
  }
  recalc(cart);
}

function removeItem(cart: Cart, variantId: string): void {
  cart.items = cart.items.filter(i => i.variantId !== variantId);
  recalc(cart);
}

function recalc(cart: Cart): void {
  cart.subtotal = cart.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  cart.taxTotal = Math.round(cart.subtotal * 0.08 * 100) / 100;
  cart.shippingTotal = cart.subtotal > 50 ? 0 : 9.99;
  cart.grandTotal = Math.round((cart.subtotal + cart.taxTotal + cart.shippingTotal) * 100) / 100;
}

function applyCoupon(cart: Cart, code: string, discountPercent: number): boolean {
  if (cart.couponCode) return false;
  cart.couponCode = code;
  const discount = cart.subtotal * (discountPercent / 100);
  cart.grandTotal = Math.round((cart.grandTotal - discount) * 100) / 100;
  return true;
}

describe("Cart Flow", () => {
  let cart: Cart;

  beforeEach(() => { cart = createCart(); });

  it("should start with empty cart", () => {
    expect(cart.items.length).toBe(0);
    expect(cart.grandTotal).toBe(0);
  });

  it("should add items and recalculate", () => {
    addItem(cart, { variantId: "v1", name: "Widget", sku: "W-1", quantity: 2, unitPrice: 19.99 });
    expect(cart.items.length).toBe(1);
    expect(cart.subtotal).toBe(39.98);
    expect(cart.grandTotal).toBeGreaterThan(39.98);
  });

  it("should stack same variant quantities", () => {
    addItem(cart, { variantId: "v1", name: "W", sku: "SKU", quantity: 1, unitPrice: 10 });
    addItem(cart, { variantId: "v1", name: "W", sku: "SKU", quantity: 2, unitPrice: 10 });
    expect(cart.items.length).toBe(1);
    expect(cart.items[0]!.quantity).toBe(3);
  });

  it("should add multiple different items", () => {
    addItem(cart, { variantId: "a", name: "A", sku: "A", quantity: 1, unitPrice: 25 });
    addItem(cart, { variantId: "b", name: "B", sku: "B", quantity: 2, unitPrice: 15 });
    expect(cart.items.length).toBe(2);
    expect(cart.subtotal).toBe(55);
  });

  it("should remove items", () => {
    addItem(cart, { variantId: "a", name: "A", sku: "A", quantity: 1, unitPrice: 25 });
    addItem(cart, { variantId: "b", name: "B", sku: "B", quantity: 1, unitPrice: 15 });
    removeItem(cart, "a");
    expect(cart.items.length).toBe(1);
    expect(cart.subtotal).toBe(15);
  });

  it("should apply coupon code once", () => {
    addItem(cart, { variantId: "a", name: "A", sku: "A", quantity: 2, unitPrice: 50 });
    const before = cart.grandTotal;
    const applied = applyCoupon(cart, "SAVE10", 10);
    expect(applied).toBe(true);
    expect(cart.grandTotal).toBeLessThan(before);
  });

  it("should reject duplicate coupon", () => {
    addItem(cart, { variantId: "a", name: "A", sku: "A", quantity: 1, unitPrice: 100 });
    applyCoupon(cart, "CODE1", 10);
    const applied = applyCoupon(cart, "CODE2", 15);
    expect(applied).toBe(false);
  });

  it("should offer free shipping above threshold", () => {
    addItem(cart, { variantId: "a", name: "A", sku: "A", quantity: 3, unitPrice: 20 });
    expect(cart.shippingTotal).toBe(0);
    expect(cart.subtotal).toBeGreaterThan(50);
  });
});
