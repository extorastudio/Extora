import { describe, it, expect } from "vitest";
interface Cart { id: string; updatedAt: string; items: unknown[]; }
describe("Commerce Abandoned Cart", () => {
  function isAbandoned(cart: Cart, thresholdMs: number): boolean { return cart.items.length > 0 && (Date.now() - new Date(cart.updatedAt).getTime()) > thresholdMs; }
  it("should detect abandoned cart", () => { expect(isAbandoned({id:"c1",updatedAt:new Date(Date.now()-86400000).toISOString(),items:[1]},3600000)).toBe(true); });
  it("should not flag active cart", () => { expect(isAbandoned({id:"c2",updatedAt:new Date().toISOString(),items:[1]},3600000)).toBe(false); });
  it("should not flag empty cart", () => { expect(isAbandoned({id:"c3",updatedAt:new Date(Date.now()-86400000).toISOString(),items:[]},3600000)).toBe(false); });
});
