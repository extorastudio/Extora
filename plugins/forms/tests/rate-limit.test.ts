import { describe, it, expect } from "vitest";

interface RateLimitEntry { ip: string; count: number; windowStart: number; blocked: boolean; }

function checkRateLimit(ip: string, limits: Map<string, RateLimitEntry>, maxPerWindow: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = limits.get(ip);
  if (!entry || now - entry.windowStart > windowMs) {
    limits.set(ip, { ip, count: 1, windowStart: now, blocked: false });
    return true;
  }
  if (entry.blocked) return false;
  entry.count++;
  if (entry.count > maxPerWindow) {
    entry.blocked = true;
    return false;
  }
  return true;
}

describe("Forms Rate Limiting", () => {
  const limits = new Map<string, RateLimitEntry>();
  const ip = "192.168.1.1";

  beforeEach(() => { limits.clear(); });

  it("should allow submissions within limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip, limits, 10, 60000)).toBe(true);
    }
  });

  it("should block after exceeding limit", () => {
    for (let i = 0; i < 11; i++) {
      checkRateLimit(ip, limits, 10, 60000);
    }
    expect(checkRateLimit(ip, limits, 10, 60000)).toBe(false);
  });

  it("should reset after window expires", () => {
    const oldLimits = new Map<string, RateLimitEntry>();
    oldLimits.set(ip, { ip, count: 15, windowStart: Date.now() - 120000, blocked: true });
    expect(checkRateLimit(ip, oldLimits, 10, 60000)).toBe(true);
  });

  it("should track separate IPs independently", () => {
    checkRateLimit("1.1.1.1", limits, 2, 60000);
    checkRateLimit("1.1.1.1", limits, 2, 60000);
    checkRateLimit("1.1.1.1", limits, 2, 60000);
    expect(checkRateLimit("2.2.2.2", limits, 2, 60000)).toBe(true);
  });
});
