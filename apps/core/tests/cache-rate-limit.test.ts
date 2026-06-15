import { describe, it, expect, beforeEach } from "vitest";

interface CacheEntry<T> { value: T; expiresAt: number; }
class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>();
  get<T>(key: string): T | null {
    const e = this.store.get(key);
    if (!e || e.expiresAt < Date.now()) return null;
    return e.value as T;
  }
  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
  del(key: string): void { this.store.delete(key); }
  has(key: string): boolean { return this.get(key) !== null; }
  clear(): void { this.store.clear(); }
}

class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();
  isAllowed(key: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.hits.get(key);
    if (!entry || now > entry.resetAt) { this.hits.set(key, { count: 1, resetAt: now + windowMs }); return true; }
    if (entry.count >= max) return false;
    entry.count++;
    return true;
  }
}

describe("SimpleCache", () => {
  const cache = new SimpleCache();
  beforeEach(() => cache.clear());

  it("should store and retrieve values", () => {
    cache.set("k", "v", 60000);
    expect(cache.get("k")).toBe("v");
  });

  it("should return null for missing key", () => {
    expect(cache.get("missing")).toBeNull();
  });

  it("should expire after TTL", async () => {
    cache.set("temp", "x", 1);
    await new Promise(r => setTimeout(r, 5));
    expect(cache.get("temp")).toBeNull();
  });

  it("should delete keys", () => {
    cache.set("k", "v", 60000);
    cache.del("k");
    expect(cache.has("k")).toBe(false);
  });

  it("should check key existence", () => {
    cache.set("k", "v", 60000);
    expect(cache.has("k")).toBe(true);
  });
});

describe("RateLimiter", () => {
  const limiter = new RateLimiter();

  it("should allow requests within limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(limiter.isAllowed("ip1", 10, 60000)).toBe(true);
    }
  });

  it("should block after exceeding limit", () => {
    for (let i = 0; i < 6; i++) { limiter.isAllowed("ip2", 5, 60000); }
    expect(limiter.isAllowed("ip2", 5, 60000)).toBe(false);
  });

  it("should separate keys", () => {
    limiter.isAllowed("a", 1, 60000);
    limiter.isAllowed("a", 1, 60000);
    expect(limiter.isAllowed("b", 1, 60000)).toBe(true);
  });
});
