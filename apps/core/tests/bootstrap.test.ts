import { describe, it, expect } from "vitest";

describe("Extora Core", () => {
  it("should verify Node.js version", () => {
    const version = process.version;
    expect(version.startsWith("v22")).toBe(true);
  });

  it("should have environment variables accessible", () => {
    process.env["NODE_ENV"] = "test";
    expect(process.env["NODE_ENV"]).toBe("test");
  });
});
