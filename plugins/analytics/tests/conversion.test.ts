import { describe, it, expect } from "vitest";
describe("Analytics Conversion Tracking", () => {
  function calcRate(conversions: number, visitors: number): number { return visitors > 0 ? Math.round((conversions/visitors)*10000)/100 : 0; }
  it("should calculate conversion rate", () => { expect(calcRate(50, 1000)).toBe(5); });
  it("should return 0 for no visitors", () => { expect(calcRate(10, 0)).toBe(0); });
});
