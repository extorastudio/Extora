import { describe, it, expect } from "vitest";

interface InventoryItem {
  variantId: string;
  sku: string;
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
}

describe("Commerce Inventory Management", () => {
  let inventory: InventoryItem[];

  beforeEach(() => {
    inventory = [
      { variantId: "v1", sku: "SKU-001", quantity: 100, reserved: 0, lowStockThreshold: 10, allowBackorder: false },
      { variantId: "v2", sku: "SKU-002", quantity: 5, reserved: 0, lowStockThreshold: 10, allowBackorder: true },
      { variantId: "v3", sku: "SKU-003", quantity: 0, reserved: 0, lowStockThreshold: 5, allowBackorder: false },
    ];
  });

  function getAvailable(variantId: string): number {
    const item = inventory.find((i) => i.variantId === variantId);
    if (!item) return 0;
    return item.quantity - item.reserved;
  }

  function reserveStock(variantId: string, qty: number): boolean {
    const item = inventory.find((i) => i.variantId === variantId);
    if (!item) return false;
    if (getAvailable(variantId) >= qty) {
      item.reserved += qty;
      return true;
    }
    if (item.allowBackorder) return true;
    return false;
  }

  function releaseStock(variantId: string, qty: number): void {
    const item = inventory.find((i) => i.variantId === variantId);
    if (item) item.reserved = Math.max(0, item.reserved - qty);
  }

  function isLowStock(variantId: string): boolean {
    const item = inventory.find((i) => i.variantId === variantId);
    if (!item) return false;
    return getAvailable(variantId) <= item.lowStockThreshold;
  }

  it("should return available quantity", () => {
    expect(getAvailable("v1")).toBe(100);
    expect(getAvailable("v2")).toBe(5);
    expect(getAvailable("v3")).toBe(0);
  });

  it("should reserve stock successfully", () => {
    expect(reserveStock("v1", 10)).toBe(true);
    expect(inventory[0]!.reserved).toBe(10);
    expect(getAvailable("v1")).toBe(90);
  });

  it("should reject reservation exceeding stock without backorder", () => {
    expect(reserveStock("v3", 1)).toBe(false);
    expect(inventory[2]!.reserved).toBe(0);
  });

  it("should allow backorder for backorder-enabled items", () => {
    expect(reserveStock("v2", 20)).toBe(true);
    expect(inventory[1]!.reserved).toBe(0); // backorder, nothing reserved
  });

  it("should release stock on cancellation", () => {
    reserveStock("v1", 10);
    expect(getAvailable("v1")).toBe(90);

    releaseStock("v1", 10);
    expect(getAvailable("v1")).toBe(100);
    expect(inventory[0]!.reserved).toBe(0);
  });

  it("should detect low stock", () => {
    expect(isLowStock("v1")).toBe(false);
    expect(isLowStock("v2")).toBe(true);
    expect(isLowStock("v3")).toBe(true);
  });

  it("should not go negative on release", () => {
    releaseStock("v1", 999);
    expect(inventory[0]!.reserved).toBe(0);
  });

  it("should return 0 available for non-existent variant", () => {
    expect(getAvailable("nonexistent")).toBe(0);
  });
});
