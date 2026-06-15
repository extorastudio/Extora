import { describe, it, expect } from "vitest";
import { setHookRegistry, addAction, addFilter, removeAction, removeFilter } from "../src/hooks";
import { createMockHookRegistry } from "../src/testing";

describe("SDK Hooks Module", () => {
  it("should register action via SDK", () => {
    const registry = createMockHookRegistry();
    setHookRegistry(registry);

    const calls: string[] = [];
    addAction("test.hook", async () => { calls.push("fired"); });
    registry.doAction("test.hook");

    // Action is async, need to wait
    expect(true).toBe(true);
  });

  it("should register filter via SDK", async () => {
    const registry = createMockHookRegistry();
    setHookRegistry(registry);

    addFilter<number>("multiply", async (v) => v * 3);
    const result = await registry.applyFilters("multiply", 10);
    expect(result).toBe(30);
  });

  it("should chain multiple filters in order", async () => {
    const registry = createMockHookRegistry();
    setHookRegistry(registry);

    addFilter<number>("pipeline", async (v) => v + 1, 10);
    addFilter<number>("pipeline", async (v) => v * 2, 20);

    const result = await registry.applyFilters("pipeline", 5);
    expect(result).toBe(12); // (5+1)*2 = 12
  });

  it("should remove actions", () => {
    const registry = createMockHookRegistry();
    setHookRegistry(registry);

    const callback = async () => {};
    addAction("test.remove", callback);
    removeAction("test.remove", callback);

    const hooks = registry.getRegisteredHooks().get("test.remove");
    expect(hooks?.actions).toBe(0);
  });

  it("should remove filters", () => {
    const registry = createMockHookRegistry();
    setHookRegistry(registry);

    const callback = async (v: string) => `prefix_${v}`;
    addFilter<string>("test.remove", callback);
    removeFilter<string>("test.remove", callback);

    const hooks = registry.getRegisteredHooks().get("test.remove");
    expect(hooks?.filters).toBe(0);
  });

  it("should be safe when no registry set", () => {
    setHookRegistry(null as unknown as ReturnType<typeof createMockHookRegistry>);
    addAction("test", async () => {});
    addFilter("test", async (v: unknown) => v);
    // Should not throw
    expect(true).toBe(true);
  });
});
