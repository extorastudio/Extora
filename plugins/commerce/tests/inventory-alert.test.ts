import { describe, it, expect } from "vitest";
interface InventoryItem { sku: string; quantity: number; threshold: number; }
describe("Inventory Alerts", () => {
  const items: InventoryItem[] = [{sku:"A",quantity:5,threshold:10},{sku:"B",quantity:15,threshold:10},{sku:"C",quantity:0,threshold:5}];
  function lowStock(): InventoryItem[] { return items.filter(i => i.quantity <= i.threshold); }
  it("should flag low stock items", () => { expect(lowStock().length).toBe(2); });
  it("should include out-of-stock", () => { expect(lowStock().some(i => i.quantity===0)).toBe(true); });
});
