import { describe, it, expect } from "vitest";
import { resolveDependencies } from "../src/plugin-loader/resolver.js";
import type { PluginManifest } from "@extora/types";

function makePlugin(
  name: string,
  version: string,
  deps: Record<string, string> = {},
): PluginManifest {
  return {
    name,
    version,
    type: "plugin",
    title: name,
    author: { name: "test" },
    license: "UNLICENSED",
    extora: { core: ">=1.0.0" },
    permissions: [],
    dependencies: deps,
    entry: {},
  };
}

describe("resolveDependencies", () => {
  it("should resolve plugins with no dependencies", () => {
    const plugins = [makePlugin("@extora/auth", "1.0.0")];
    const installed = new Map<string, string>();

    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(0);
    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0]?.manifest.name).toBe("@extora/auth");
  });

  it("should resolve plugins with dependencies in correct order", () => {
    const plugins = [
      makePlugin("@extora/cms", "1.0.0", { "@extora/auth": "^1.0.0" }),
      makePlugin("@extora/auth", "1.0.0"),
    ];
    const installed = new Map<string, string>();

    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(0);
    expect(result.resolved).toHaveLength(2);
    // auth should load before cms (lower load order)
    const auth = result.resolved.find((p) => p.manifest.name === "@extora/auth");
    const cms = result.resolved.find((p) => p.manifest.name === "@extora/cms");
    expect(auth!.loadOrder).toBeLessThan(cms!.loadOrder);
  });

  it("should detect circular dependencies", () => {
    const plugins = [
      makePlugin("a", "1.0.0", { b: "*" }),
      makePlugin("b", "1.0.0", { a: "*" }),
    ];
    const installed = new Map<string, string>();

    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("Circular dependency");
  });

  it("should report missing dependencies", () => {
    const plugins = [
      makePlugin("a", "1.0.0", { c: "^1.0.0" }),
    ];
    const installed = new Map<string, string>();

    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("not installed");
  });

  it("should resolve three-level deep dependency chain", () => {
    const plugins = [
      makePlugin("a", "1.0.0", { b: "*" }),
      makePlugin("b", "1.0.0", { c: "*" }),
      makePlugin("c", "1.0.0"),
    ];
    const installed = new Map<string, string>();

    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(0);
    expect(result.resolved).toHaveLength(3);

    const loads: Record<string, number> = {};
    for (const r of result.resolved) {
      loads[r.manifest.name] = r.loadOrder;
    }
    expect(loads.c).toBeLessThan(loads.b!);
    expect(loads.b).toBeLessThan(loads.a!);
  });

  it("should mark plugin with satisfied dependency from installed map", () => {
    const plugins = [
      makePlugin("@extora/cms", "1.0.0", { "@extora/auth": "^1.0.0" }),
    ];
    const installed = new Map([["@extora/auth", "1.0.0"]]);

    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(0);
    expect(result.resolved).toHaveLength(1);
  });
});
