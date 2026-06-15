import { describe, it, expect } from "vitest";
describe("Analytics Dashboard", () => {
  function calcBounceRate(singlePage: number, total: number): number { return total>0 ? Math.round((singlePage/total)*100) : 0; }
  function calcAvgSession(minutes: number[], sessions: number): number { return sessions>0 ? minutes.reduce((a,b)=>a+b,0)/sessions : 0; }
  it("should calculate bounce rate", () => { expect(calcBounceRate(30, 100)).toBe(30); });
  it("should calculate average session duration", () => { expect(calcAvgSession([5,10,15], 3)).toBe(10); });
  it("should return 0 for no sessions", () => { expect(calcBounceRate(0,0)).toBe(0); expect(calcAvgSession([],0)).toBe(0); });
});
