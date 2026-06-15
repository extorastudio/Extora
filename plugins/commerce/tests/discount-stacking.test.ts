import { describe, it, expect } from "vitest";
interface Discount { name: string; type: string; value: number; }
function applyDiscounts(subtotal: number, discounts: Discount[]): { total: number; applied: string[] } {
  let total = subtotal; const applied: string[] = [];
  for(const d of discounts) { const discount = d.type==="percentage" ? total*(d.value/100) : Math.min(d.value,total); total -= discount; applied.push(d.name); }
  return { total: Math.round(total*100)/100, applied };
}
describe("Discount Stacking", () => {
  const discounts: Discount[] = [{name:"10% Off",type:"percentage",value:10},{name:"$20 Off",type:"fixed",value:20}];
  it("should stack discounts", () => { const r = applyDiscounts(100, discounts); expect(r.total).toBe(70); expect(r.applied.length).toBe(2); });
  it("should apply percentage first then fixed", () => { const r = applyDiscounts(200, discounts); expect(r.total).toBe(160); });
});
