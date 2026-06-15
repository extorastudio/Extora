import { describe, it, expect } from "vitest";
import { BasePlugin } from "../src/plugin";
import { createMockLogger, createMockEventBus, createMockDatabase, createMockCache, createMockConfig } from "../src/testing";
import type { PluginManifest, PluginContext } from "@extora/types";

class TestPlugin extends BasePlugin {
  override manifest: PluginManifest = {
    name: "@test/plugin",
    version: "1.0.0",
    type: "plugin",
    title: "Test Plugin",
    author: { name: "Test" },
    license: "UNLICENSED",
    extora: { core: ">=1.0.0" },
    permissions: [],
    entry: {},
  };

  installCalled = false;
  activateCalled = false;
  deactivateCalled = false;
  uninstallCalled = false;

  override async onInstall() { this.installCalled = true; }
  override async onActivate() { this.activateCalled = true; }
  override async onDeactivate() { this.deactivateCalled = true; }
  override async onUninstall() { this.uninstallCalled = true; }
}

function createContext(): PluginContext {
  return {
    pluginName: "@test/plugin",
    logger: createMockLogger(),
    database: createMockDatabase(),
    cache: createMockCache(),
    eventBus: createMockEventBus(),
    hooks: { addAction() {}, doAction() { return Promise.resolve(); }, removeAction() {}, addFilter() {}, applyFilters<T>(_: string, v: T) { return Promise.resolve(v); }, removeFilter() {}, getRegisteredHooks() { return new Map(); } },
    config: createMockConfig(),
  };
}

describe("BasePlugin", () => {
  const getCtx = (p: BasePlugin) => (p as unknown as { context: PluginContext }).context;
  const getLogger = (p: BasePlugin) => (p as unknown as { logger: { info: (m: string) => void } }).logger;
  const getDb = (p: BasePlugin) => (p as unknown as { db: unknown }).db;

  it("should inject context", () => {
    const plugin = new TestPlugin();
    const ctx = createContext();
    plugin._injectContext(ctx);
    expect(getCtx(plugin)).toBeDefined();
    expect(getCtx(plugin).pluginName).toBe("@test/plugin");
  });

  it("should call lifecycle hooks in order", async () => {
    const plugin = new TestPlugin();
    plugin._injectContext(createContext());

    await plugin.onInstall();
    expect(plugin.installCalled).toBe(true);

    await plugin.onActivate();
    expect(plugin.activateCalled).toBe(true);

    await plugin.onDeactivate();
    expect(plugin.deactivateCalled).toBe(true);

    await plugin.onUninstall();
    expect(plugin.uninstallCalled).toBe(true);
  });

  it("should provide logger accessor", () => {
    const plugin = new TestPlugin();
    plugin._injectContext(createContext());
    expect(getLogger(plugin)).toBeDefined();
    expect(typeof getLogger(plugin).info).toBe("function");
  });

  it("should provide database accessor", () => {
    const plugin = new TestPlugin();
    plugin._injectContext(createContext());
    expect(getDb(plugin)).toBeDefined();
  });

  it("should publish events via context", async () => {
    const plugin = new TestPlugin();
    const ctx = createContext();
    const received: unknown[] = [];
    ctx.eventBus.subscribe("test.event", async (p) => { received.push(p); });

    plugin._injectContext(ctx);
    const publish = (plugin as unknown as { publishEvent: (t: string, payload: unknown) => Promise<void> }).publishEvent;
    await publish.call(plugin, "test.event", { msg: "hi" });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ msg: "hi" });
  });
});
