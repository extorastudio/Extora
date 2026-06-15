import { describe, it, expect } from "vitest";
interface LoyaltyAccount { userId: string; points: number; tier: "bronze"|"silver"|"gold"; }
function earnPoints(account: LoyaltyAccount, orderTotal: number): LoyaltyAccount {
  const earned = Math.floor(orderTotal); account.points += earned;
  if(account.points>=1000) account.tier="gold"; else if(account.points>=500) account.tier="silver";
  return account;
}
function redeemPoints(account: LoyaltyAccount, points: number): boolean { if(points>account.points) return false; account.points-=points; return true; }
describe("Loyalty Points", () => {
  let a: LoyaltyAccount;
  beforeEach(() => { a = { userId:"u1", points:0, tier:"bronze" }; });
  it("should earn points", () => { earnPoints(a, 150); expect(a.points).toBe(150); });
  it("should upgrade to silver", () => { a.points=499; earnPoints(a, 2); expect(a.tier).toBe("silver"); });
  it("should upgrade to gold", () => { a.points=999; earnPoints(a, 2); expect(a.tier).toBe("gold"); });
  it("should redeem points", () => { a.points=100; expect(redeemPoints(a, 50)).toBe(true); expect(a.points).toBe(50); });
  it("should reject over-redemption", () => { a.points=10; expect(redeemPoints(a, 20)).toBe(false); });
});
