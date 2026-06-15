import { describe, it, expect } from "vitest";
describe("Commerce Multi-Currency", () => {
  const rates: Record<string,number> = { USD:1, EUR:0.92, GBP:0.79, JPY:150 };
  function convert(amount: number, from: string, to: string): number { return (amount / (rates[from]??1)) * (rates[to]??1); }
  it("should convert USD to EUR", () => { expect(convert(100, "USD", "EUR")).toBeCloseTo(92,0); });
  it("should convert EUR to USD", () => { expect(convert(92, "EUR", "USD")).toBeCloseTo(100,0); });
  it("should convert USD to JPY", () => { expect(convert(100, "USD", "JPY")).toBe(15000); });
  it("should handle same currency", () => { expect(convert(50, "USD", "USD")).toBe(50); });
});
