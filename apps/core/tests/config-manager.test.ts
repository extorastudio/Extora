import { describe, it, expect } from "vitest";

interface ConfigEntry { key: string; value: unknown; isSecret: boolean; }
class ConfigStore {
  private store = new Map<string, ConfigEntry>();
  get(key: string): unknown { return this.store.get(key)?.value; }
  set(key: string, value: unknown, isSecret = false): void { this.store.set(key, { key, value, isSecret }); }
  has(key: string): boolean { return this.store.has(key); }
  del(key: string): void { this.store.delete(key); }
  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [k, v] of this.store) { result[k] = v.isSecret ? "***" : v.value; }
    return result;
  }
}

describe("Config Manager", () => {
  const config = new ConfigStore();
  it("should store and retrieve", () => { config.set("key", "val"); expect(config.get("key")).toBe("val"); });
  it("should check existence", () => { expect(config.has("key")).toBe(true); expect(config.has("no")).toBe(false); });
  it("should delete keys", () => { config.del("key"); expect(config.has("key")).toBe(false); });
  it("should mask secrets in getAll", () => { config.set("token", "secret", true); config.set("name", "public"); const all = config.getAll(); expect(all.token).toBe("***"); expect(all.name).toBe("public"); });
});
