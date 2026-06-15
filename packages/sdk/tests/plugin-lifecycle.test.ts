import { describe, it, expect } from "vitest";
import { BasePlugin } from "../src/plugin";
import { createMockLogger, createMockEventBus, createMockDatabase, createMockCache, createMockConfig } from "../src/testing";
import type { PluginManifest, PluginContext } from "@extora/types";

class LifecyclePlugin extends BasePlugin {
  override manifest: PluginManifest = { name: "@test/lifecycle", version: "1.0.0", type: "plugin", title: "LT", author: { name: "T" }, license: "UNLICENSED", extora: { core: ">=1.0.0" }, permissions: [], entry: {} };
  calls: string[] = [];
  override async onInstall() { this.calls.push("install"); }
  override async onActivate() { this.calls.push("activate"); }
  override async onDeactivate() { this.calls.push("deactivate"); }
  override async onUninstall() { this.calls.push("uninstall"); }
  override async onUpdate(prev: string) { this.calls.push(`update:${prev}`); }
}

function createCtx(): PluginContext { return { pluginName: "test", logger: createMockLogger(), database: createMockDatabase(), cache: createMockCache(), eventBus: createMockEventBus(), hooks: { addAction() {}, doAction() { return Promise.resolve(); }, removeAction() {}, addFilter() {}, applyFilters<T>(_:string,v:T) { return Promise.resolve(v); }, removeFilter() {}, getRegisteredHooks() { return new Map(); } }, config: createMockConfig() }; }

describe("Plugin Lifecycle", () => {
  it("should call lifecycle hooks in order", async () => {
    const p = new LifecyclePlugin();
    p._injectContext(createCtx());
    await p.onInstall();
    await p.onActivate();
    await p.onDeactivate();
    await p.onUninstall();
    expect(p.calls).toEqual(["install", "activate", "deactivate", "uninstall"]);
  });

  it("should call onUpdate with previous version", async () => {
    const p = new LifecyclePlugin();
    p._injectContext(createCtx());
    await p.onUpdate("0.9.0");
    expect(p.calls).toContain("update:0.9.0");
  });

  it("should have default lifecycle methods", async () => {
    class DefaultPlugin extends BasePlugin {
      override manifest: PluginManifest = { name: "d", version: "1", type: "plugin", title: "D", author: { name:"D" }, license: "UNLICENSED", extora: { core: ">=1" }, permissions: [], entry: {} };
    }
    const p = new DefaultPlugin();
    p._injectContext(createCtx());
    await expect(p.onInstall()).resolves.toBeUndefined();
  });
});
