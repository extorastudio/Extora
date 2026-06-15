import { describe, it, expect } from "vitest";
import { createPluginSandbox } from "../src/plugin-loader/sandbox";
import type { PluginManifest } from "@extora/types";

const testManifest: PluginManifest = {
  name: "@test/sandbox-plugin",
  version: "1.0.0",
  type: "plugin",
  title: "Sandbox Test Plugin",
  author: { name: "Test" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0" },
  permissions: [],
  entry: {},
};

describe("Plugin Sandbox", () => {
  it("should create a sandbox for a plugin", () => {
    const sandbox = createPluginSandbox({
      manifest: testManifest,
      allowedPaths: [],
      allowedHosts: [],
      memoryLimitMB: 64,
      cpuLimit: 0.1,
    });

    expect(sandbox).toBeDefined();
    expect(typeof sandbox.execute).toBe("function");
    expect(typeof sandbox.dispose).toBe("function");
  });

  it("should execute simple code in sandbox", () => {
    const sandbox = createPluginSandbox({
      manifest: testManifest,
      allowedPaths: [],
      allowedHosts: [],
      memoryLimitMB: 64,
      cpuLimit: 0.1,
    });

    const result = sandbox.execute<number>("1 + 2 + 3");
    expect(result).toBe(6);
  });

  it("should provide basic built-in objects", () => {
    const sandbox = createPluginSandbox({
      manifest: testManifest,
      allowedPaths: [],
      allowedHosts: [],
      memoryLimitMB: 64,
      cpuLimit: 0.1,
    });

    const result = sandbox.execute<boolean>("typeof JSON !== 'undefined' && typeof Math !== 'undefined'");
    expect(result).toBe(true);
  });

  it("should allow safe built-in modules via restricted require", () => {
    const sandbox = createPluginSandbox({
      manifest: testManifest,
      allowedPaths: [],
      allowedHosts: ["example.com"],
      memoryLimitMB: 64,
      cpuLimit: 0.1,
    });

    const result = sandbox.execute<string>(
      'typeof require !== "undefined" ? (typeof require("path") !== "undefined" ? "ok" : "no-path") : "no-require"',
    );
    expect(result).toBe("ok");
  });

  it("should dispose without error", () => {
    const sandbox = createPluginSandbox({
      manifest: testManifest,
      allowedPaths: [],
      allowedHosts: [],
      memoryLimitMB: 64,
      cpuLimit: 0.1,
    });

    expect(() => { sandbox.dispose(); }).not.toThrow();
  });
});
