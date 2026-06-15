import { describe, it, expect } from "vitest";
import { validateManifest, PluginManifestSchema } from "../src/plugin-loader/manifest";

const validManifest = {
  name: "@test/plugin",
  version: "1.0.0",
  type: "plugin" as const,
  title: "Test Plugin",
  author: { name: "Test" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0" },
  permissions: ["database:read"],
  entry: { server: "dist/index.js" },
};

describe("PluginManifestSchema", () => {
  it("should validate a correct manifest", () => {
    const result = validateManifest(validManifest);
    expect(result.name).toBe("@test/plugin");
    expect(result.version).toBe("1.0.0");
  });

  it("should reject invalid plugin name format", () => {
    expect(() => validateManifest({ ...validManifest, name: "invalid-name" })).toThrow();
  });

  it("should accept scoped plugin names", () => {
    const result = validateManifest({ ...validManifest, name: "@scope/my-plugin" });
    expect(result.name).toBe("@scope/my-plugin");
  });

  it("should reject invalid semver version", () => {
    expect(() => validateManifest({ ...validManifest, version: "not-semver" })).toThrow();
  });

  it("should accept pre-release versions", () => {
    const result = validateManifest({ ...validManifest, version: "2.0.0-beta.1" });
    expect(result.version).toBe("2.0.0-beta.1");
  });

  it("should reject missing title", () => {
    const bad = { ...validManifest, title: undefined };
    expect(() => validateManifest(bad)).toThrow();
  });

  it("should reject empty title", () => {
    expect(() => validateManifest({ ...validManifest, title: "" })).toThrow();
  });

  it("should use defaults for optional fields", () => {
    const result = validateManifest(validManifest);
    expect(result.dependencies).toEqual({});
    expect(result.permissions).toEqual(["database:read"]);
    expect(result.license).toBe("UNLICENSED");
  });

  it("should validate dependencies format", () => {
    const result = validateManifest({
      ...validManifest,
      dependencies: { "@extora/auth": "^1.0.0" },
    });
    expect(result.dependencies).toEqual({ "@extora/auth": "^1.0.0" });
  });

  it("should reject invalid author email", () => {
    const bad = { ...validManifest, author: { name: "Test", email: "not-email" } };
    expect(() => validateManifest(bad)).toThrow();
  });

  it("should accept valid author email", () => {
    const result = validateManifest({
      ...validManifest,
      author: { name: "Test", email: "test@example.com" },
    });
    expect(result.author.email).toBe("test@example.com");
  });

  it("should accept optional fields", () => {
    const result = validateManifest({
      ...validManifest,
      description: "A test plugin",
      homepage: "https://example.com",
      repository: "https://github.com/test/plugin",
      icon: "assets/icon.svg",
      categories: ["tools"],
      keywords: ["test"],
      screenshots: ["screenshot.png"],
    });
    expect(result.description).toBe("A test plugin");
    expect(result.homepage).toBe("https://example.com");
  });

  it("should validate hooks configuration", () => {
    const result = validateManifest({
      ...validManifest,
      hooks: {
        actions: ["user.registered"],
        filters: ["content.before_save"],
        events: ["order.placed"],
      },
    });
    expect(result.hooks?.actions).toEqual(["user.registered"]);
    expect(result.hooks?.events).toEqual(["order.placed"]);
  });
});
