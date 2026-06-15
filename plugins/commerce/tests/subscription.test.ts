import { describe, it, expect } from "vitest";

interface Subscription { id: string; plan: string; status: "active"|"paused"|"cancelled"; amount: number; interval: "monthly"|"yearly"; nextBilling: string; }

function createSubscription(plan: string, amount: number, interval: "monthly"|"yearly"): Subscription {
  return { id: `sub_${Date.now()}`, plan, status: "active", amount, interval, nextBilling: new Date(Date.now()+30*86400000).toISOString() };
}

function pauseSubscription(sub: Subscription): void { sub.status = "paused"; }
function resumeSubscription(sub: Subscription): void { sub.status = "active"; }
function cancelSubscription(sub: Subscription): void { sub.status = "cancelled"; }
function isActive(sub: Subscription): boolean { return sub.status === "active" && new Date(sub.nextBilling) > new Date(); }

describe("Commerce Subscriptions", () => {
  it("should create active subscription", () => {
    const sub = createSubscription("Pro Plan", 29.99, "monthly");
    expect(sub.status).toBe("active");
    expect(sub.amount).toBe(29.99);
  });

  it("should pause and resume", () => {
    const sub = createSubscription("Basic", 9.99, "monthly");
    pauseSubscription(sub);
    expect(sub.status).toBe("paused");
    resumeSubscription(sub);
    expect(sub.status).toBe("active");
  });

  it("should cancel subscription", () => {
    const sub = createSubscription("Premium", 99.99, "yearly");
    cancelSubscription(sub);
    expect(sub.status).toBe("cancelled");
  });

  it("should check active status with billing date", () => {
    const sub = createSubscription("Test", 10, "monthly");
    expect(isActive(sub)).toBe(true);
  });
});
