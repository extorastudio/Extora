import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { loadManifest, tryLoadManifest, validateManifest } from "../src/plugin-loader/manifest";
import { resolveDependencies } from "../src/plugin-loader/resolver";
import type { PluginManifest } from "@extora/types";

const TEST_DIR = path.resolve("/tmp/extora-plugin-test");

function createPluginDir(name: string, manifest: PluginManifest | Record<string, unknown>): string {
  const dir = path.join(TEST_DIR, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "extora.json"), JSON.stringify(manifest, null, 2));
  return dir;
}

const baseManifest: PluginManifest = {
  name: "@test/integration-plugin",
  version: "1.0.0",
  type: "plugin",
  title: "Integration Test Plugin",
  author: { name: "Test" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0 <2.0.0" },
  permissions: ["database:read", "user:read"],
  dependencies: { "@extora/auth": "^1.0.0" },
  entry: { server: "dist/index.js" },
};

describe("Plugin Lifecycle Integration", () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should load a valid manifest from filesystem", async () => {
    createPluginDir("@test/integration-plugin", baseManifest);
    const manifest = await loadManifest(
      path.join(TEST_DIR, "@test/integration-plugin"),
    );
    expect(manifest.name).toBe("@test/integration-plugin");
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.dependencies).toEqual({ "@extora/auth": "^1.0.0" });
  });

  it("should return null for invalid manifest", async () => {
    const dir = createPluginDir("@test/broken", {
      name: "invalid",
      // missing required fields
    });
    const manifest = await tryLoadManifest(dir);
    expect(manifest).toBeNull();
  });

  it("should return null for missing extora.json", async () => {
    const dir = path.join(TEST_DIR, "@test/no-manifest");
    fs.mkdirSync(dir, { recursive: true });
    const manifest = await tryLoadManifest(dir);
    expect(manifest).toBeNull();
  });

  it("should resolve simple dependency graph at runtime", () => {
    const plugins: PluginManifest[] = [
      { ...baseManifest, name: "@test/dep-a", version: "1.0.0", dependencies: {} },
      { ...baseManifest, name: "@test/dep-b", version: "1.0.0", dependencies: { "@test/dep-a": "^1.0.0" } },
    ];
    const installed = new Map([["@test/dep-a", "1.0.0"]]);

    const result = resolveDependencies(plugins, installed);
    expect(result.errors).toHaveLength(0);
    expect(result.resolved).toHaveLength(2);

    const orderA = result.resolved.find((p) => p.manifest.name === "@test/dep-a");
    const orderB = result.resolved.find((p) => p.manifest.name === "@test/dep-b");
    expect(orderA!.loadOrder).toBeLessThan(orderB!.loadOrder);
  });

  it("should validate a manifest with all optional fields", () => {
    const full: PluginManifest = {
      ...baseManifest,
      description: "A full-featured plugin",
      icon: "assets/icon.svg",
      screenshots: ["screen1.png"],
      categories: ["tools", "utilities"],
      keywords: ["test", "integration"],
      homepage: "https://example.com",
      repository: "https://github.com/test/plugin",
      documentation: "https://docs.example.com",
      optionalDependencies: { "@extora/search": "^1.0.0" },
      conflicts: { "@competitor/plugin": "*" },
      hooks: {
        actions: ["user.registered", "content.created"],
        filters: ["cart.total"],
        events: ["order.placed"],
      },
      api: {
        rest: { endpoints: ["/api/v1/test/*"] },
        graphql: { types: ["schema.graphql"] },
      },
      database: { migrations: "dist/migrations/", seeds: "dist/seeds/" },
      config: { schema: "dist/config/schema.json" },
      minimum: { memory: "64MB", cpu: "0.1", disk: "10MB" },
    };

    const result = validateManifest(full);
    expect(result.description).toBe("A full-featured plugin");
    expect(result.hooks?.actions).toContain("user.registered");
    expect(result.api?.rest?.endpoints).toContain("/api/v1/test/*");
    expect(result.minimum?.memory).toBe("64MB");
  });

  it("should reject dependency cycle at resolve time", () => {
    const plugins: PluginManifest[] = [
      { ...baseManifest, name: "@test/cycle-a", version: "1.0.0", dependencies: { "@test/cycle-b": "*" } },
      { ...baseManifest, name: "@test/cycle-b", version: "1.0.0", dependencies: { "@test/cycle-a": "*" } },
    ];

    const result = resolveDependencies(plugins, new Map());
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Circular");
  });

  it("should report missing optional dependency as non-blocking", () => {
    const plugins: PluginManifest[] = [
      { ...baseManifest, name: "@test/main", version: "1.0.0", dependencies: {}, optionalDependencies: { "@missing/pkg": "^1.0.0" } },
    ];

    const result = resolveDependencies(plugins, new Map());
    expect(result.resolved).toHaveLength(1);
  });

  it("should fail on missing required dependency", () => {
    const plugins: PluginManifest[] = [
      { ...baseManifest, name: "@test/main", version: "1.0.0", dependencies: { "@missing/pkg": "^1.0.0" } },
    ];

    const result = resolveDependencies(plugins, new Map());
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("not installed");
  });
});
