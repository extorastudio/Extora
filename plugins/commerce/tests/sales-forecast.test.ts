import { describe, it, expect } from "vitest";
describe("Sales Forecast", () => {
  function forecast(history: number[], months: number): number { if(history.length===0)return 0; const avg = history.reduce((a,b)=>a+b,0)/history.length; return Math.round(avg*months); }
  it("should forecast 3 months", () => { expect(forecast([100,120,140], 3)).toBe(360); });
  it("should return 0 for no history", () => { expect(forecast([], 3)).toBe(0); });
});
