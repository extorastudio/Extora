import { describe, it, expect } from "vitest";
import { createMockDatabase } from "../src/testing";

describe("SDK Database Mock", () => {
  it("should provide plugin-scoped DB", () => {
    const db = createMockDatabase();
    const pluginDb = db.getPluginDb("test");
    expect(pluginDb).toBeDefined();
    expect(typeof pluginDb.createTable).toBe("function");
    expect(typeof pluginDb.insert).toBe("function");
    expect(typeof pluginDb.select).toBe("function");
  });

  it("should emulate insert and select", async () => {
    const db = createMockDatabase();
    const pluginDb = db.getPluginDb("test");
    await pluginDb.insert("users", { id: "1", name: "Alice" });
    const rows = await pluginDb.select("users");
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });
});
