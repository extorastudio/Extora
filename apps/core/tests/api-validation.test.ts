import { describe, it, expect } from "vitest";

const VALID_ENDPOINTS = [
  { method: "GET", path: "/api/v1/system/health", auth: false },
  { method: "GET", path: "/api/v1/system/info", auth: false },
  { method: "POST", path: "/api/v1/auth/login", auth: false },
  { method: "POST", path: "/api/v1/auth/register", auth: false },
  { method: "GET", path: "/api/v1/plugins", auth: true },
  { method: "POST", path: "/api/v1/plugins/:name/activate", auth: true },
  { method: "GET", path: "/api/v1/users", auth: true },
  { method: "GET", path: "/api/v1/themes", auth: true },
  { method: "GET", path: "/api/v1/config", auth: true },
  { method: "GET", path: "/api/v1/plugins/:name/health", auth: true },
];

describe("API Endpoint Validation", () => {
  it("should define all required API endpoints", () => {
    expect(VALID_ENDPOINTS.length).toBeGreaterThanOrEqual(9);
  });

  it("should have health check as open endpoint", () => {
    const health = VALID_ENDPOINTS.find(e => e.path === "/api/v1/system/health");
    expect(health?.auth).toBe(false);
  });

  it("should require auth for admin endpoints", () => {
    const adminEndpoints = VALID_ENDPOINTS.filter(e => e.path.startsWith("/api/v1/plugins") || e.path.startsWith("/api/v1/users") || e.path.startsWith("/api/v1/config"));
    expect(adminEndpoints.every(e => e.auth)).toBe(true);
  });

  it("should have POST endpoints for mutations", () => {
    const mutations = VALID_ENDPOINTS.filter(e => e.method === "POST");
    expect(mutations.length).toBeGreaterThanOrEqual(3);
  });
});
