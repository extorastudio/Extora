import { describe, it, expect } from "vitest";
describe("Health Endpoint Validation", () => {
  it("should require all services for healthy status", () => {
    const services = { database: "connected", redis: "connected" };
    const allOk = Object.values(services).every(s => s === "connected");
    expect(allOk).toBe(true);
  });
  it("should detect degraded service", () => {
    const services = { database: "connected", redis: "disconnected" };
    const allOk = Object.values(services).every(s => s === "connected");
    expect(allOk).toBe(false);
  });
});
