import { describe, it, expect } from "vitest";
import { resolveDependencies } from "../src/plugin-loader/resolver";
import type { PluginManifest } from "@extora/types";

function makePlugin(name: string, version: string, deps: Record<string, string> = {}): PluginManifest {
  return {
    name, version, type: "plugin", title: name,
    author: { name: "test" }, license: "UNLICENSED",
    extora: { core: ">=1.0.0" }, permissions: [], dependencies: deps, entry: {},
  };
}

describe("Dependency Resolver Edge Cases", () => {
  it("should handle empty plugin list", () => {
    const result = resolveDependencies([], new Map());
    expect(result.resolved).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("should handle diamond dependency (A→B, A→C, B→D, C→D)", () => {
    const plugins = [
      makePlugin("a", "1.0.0", { b: "*", c: "*"}),
      makePlugin("b", "1.0.0", { d: "*" }),
      makePlugin("c", "1.0.0", { d: "*" }),
      makePlugin("d", "1.0.0"),
    ];

    const result = resolveDependencies(plugins, new Map());
    expect(result.resolved).toHaveLength(4);
    const d = result.resolved.find((p) => p.manifest.name === "d")!;
    const a = result.resolved.find((p) => p.manifest.name === "a")!;
    expect(d.loadOrder).toBeLessThan(a.loadOrder);
  });

  it("should support semver ^ operator", () => {
    const plugins = [
      makePlugin("consumer", "1.0.0", { lib: "^1.0.0" }),
      makePlugin("lib", "1.5.0"),
    ];
    const installed = new Map([["lib", "1.5.0"]]);
    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(0);
  });

  it("should support semver >= operator", () => {
    const plugins = [
      makePlugin("consumer", "1.0.0", { lib: ">=1.0.0" }),
      makePlugin("lib", "2.0.0"),
    ];
    const installed = new Map([["lib", "2.0.0"]]);
    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(0);
  });

  it("should support semver ~ operator", () => {
    const plugins = [
      makePlugin("consumer", "1.0.0", { lib: "~1.2.0" }),
      makePlugin("lib", "1.2.5"),
    ];
    const installed = new Map([["lib", "1.2.5"]]);
    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(0);
  });

  it("should treat installed map deps as satisfied even when not in plugin list", () => {
    const plugins = [
      makePlugin("consumer", "1.0.0", { lib: ">=2.0.0" }),
    ];
    // lib is in installed map (satisfied), but not in plugins array
    const installed = new Map([["lib", "2.1.0"]]);
    const result = resolveDependencies(plugins, installed);
    // Dependency is satisfied via installed map, no errors
    expect(result.errors).toHaveLength(0);
    expect(result.resolved).toHaveLength(1);
  });

  it("should handle installed deps from map", () => {
    const plugins = [
      makePlugin("top", "1.0.0", { base: "^1.0.0" }),
    ];
    const installed = new Map([["base", "1.3.2"]]);
    const result = resolveDependencies(plugins, installed);
    expect(result.resolved).toHaveLength(1);
  });
});
