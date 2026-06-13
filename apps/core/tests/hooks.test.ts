import { describe, it, expect } from "vitest";
import { CoreHookRegistry } from "../src/hooks/registry.js";

describe("CoreHookRegistry", () => {
  describe("Actions", () => {
    it("should register and execute action hooks", async () => {
      const registry = new CoreHookRegistry();
      const calls: string[] = [];

      registry.addAction("init", async () => { calls.push("first"); });
      registry.addAction("init", async () => { calls.push("second"); });

      await registry.doAction("init");
      expect(calls).toEqual(["first", "second"]);
    });

    it("should execute hooks in priority order", async () => {
      const registry = new CoreHookRegistry();
      const order: number[] = [];

      registry.addAction("test", async () => { order.push(2); }, 20);
      registry.addAction("test", async () => { order.push(1); }, 10);
      registry.addAction("test", async () => { order.push(3); }, 30);

      await registry.doAction("test");
      expect(order).toEqual([1, 2, 3]);
    });

    it("should pass arguments to action hooks", async () => {
      const registry = new CoreHookRegistry();
      let received: unknown;

      registry.addAction("user.created", async (data: unknown) => { received = data; });

      await registry.doAction("user.created", { id: "123", name: "Test" });
      expect(received).toEqual({ id: "123", name: "Test" });
    });

    it("should handle empty hook list gracefully", async () => {
      const registry = new CoreHookRegistry();
      await expect(registry.doAction("nonexistent")).resolves.toBeUndefined();
    });

    it("should not stop on hook error", async () => {
      const registry = new CoreHookRegistry();
      const calls: string[] = [];

      registry.addAction("test", async () => { throw new Error("fail"); });
      registry.addAction("test", async () => { calls.push("after error"); });

      await registry.doAction("test");
      expect(calls).toEqual(["after error"]);
    });

    it("should remove action hooks", async () => {
      const registry = new CoreHookRegistry();
      const calls: string[] = [];
      const callback = async () => { calls.push("should not run"); };

      registry.addAction("test", callback);
      registry.removeAction("test", callback);

      await registry.doAction("test");
      expect(calls).toHaveLength(0);
    });

    it("should tag hooks with plugin name", () => {
      const registry = new CoreHookRegistry();
      registry.addAction("plugin.init", async () => {}, 10, "@extora/auth");

      const hooks = registry.getActionHooks("plugin.init");
      expect(hooks).toHaveLength(1);
      expect(hooks[0]?.plugin).toBe("@extora/auth");
    });
  });

  describe("Filters", () => {
    it("should apply filters in priority order", async () => {
      const registry = new CoreHookRegistry();

      registry.addFilter<number>("price", async (val: number) => val * 2, 20);
      registry.addFilter<number>("price", async (val: number) => val + 10, 10);

      const result = await registry.applyFilters("price", 100);
      // Priority 10 runs first: 100 + 10 = 110
      // Priority 20 runs second: 110 * 2 = 220
      expect(result).toBe(220);
    });

    it("should return unmodified value when no filters registered", async () => {
      const registry = new CoreHookRegistry();
      const result = await registry.applyFilters("nonexistent", 42);
      expect(result).toBe(42);
    });

    it("should continue filtering on error", async () => {
      const registry = new CoreHookRegistry();

      registry.addFilter<string>("text", async () => { throw new Error("fail"); }, 10);
      registry.addFilter<string>("text", async (val: string) => `${val}!`, 20);

      const result = await registry.applyFilters("text", "hello");
      expect(result).toBe("hello!");
    });

    it("should remove filter hooks", async () => {
      const registry = new CoreHookRegistry();
      const callback = async (val: string) => `${val}-modified`;

      registry.addFilter<string>("test", callback);
      registry.removeFilter<string>("test", callback);

      const result = await registry.applyFilters("test", "original");
      expect(result).toBe("original");
    });
  });

  describe("Lifecycle", () => {
    it("should get registered hooks summary", () => {
      const registry = new CoreHookRegistry();
      registry.addAction("init", async () => {});
      registry.addAction("init", async () => {});
      registry.addFilter("price", async (val: number) => val);

      const summary = registry.getRegisteredHooks();
      expect(summary.get("init")).toEqual({ actions: 2, filters: 0 });
      expect(summary.get("price")).toEqual({ actions: 0, filters: 1 });
    });

    it("should remove all hooks for a plugin", () => {
      const registry = new CoreHookRegistry();
      registry.addAction("init", async () => {}, 10, "@extora/auth");
      registry.addFilter("price", async (val: number) => val, 10, "@extora/auth");
      registry.addAction("init", async () => {}, 10, "@extora/cms");

      registry.removeAllForPlugin("@extora/auth");

      expect(registry.getActionHooks("init")).toHaveLength(1);
      expect(registry.getFilterHooks("price")).toHaveLength(0);
    });
  });
});
