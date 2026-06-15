import { describe, it, expect } from "vitest";
import { createContentTypeRouter, createContentEntryRouter } from "../src/routes";

describe("CMS Content Type Router", () => {
  it("should have content type CRUD routes", () => {
    const router = createContentTypeRouter();
    const routes = router.getRoutes();
    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/api/v1/content/types");
    expect(paths).toContain("/api/v1/content/types/:name");
  });

  it("should have GET and POST methods", () => {
    const router = createContentTypeRouter();
    const routes = router.getRoutes();
    const methods = routes.map((r) => r.method);
    expect(methods).toContain("GET");
    expect(methods).toContain("POST");
  });
});

describe("CMS Content Entry Router", () => {
  it("should have entry CRUD routes", () => {
    const router = createContentEntryRouter();
    const routes = router.getRoutes();
    const paths = routes.map((r) => r.path);

    expect(paths).toContain("/api/v1/content/:type");
    expect(paths).toContain("/api/v1/content/:type/:id");
    expect(paths).toContain("/api/v1/content/:type/:id/revisions");
  });

  it("should have GET, POST, PATCH, DELETE methods", () => {
    const router = createContentEntryRouter();
    const routes = router.getRoutes();
    const methods = routes.map((r) => r.method);
    expect(methods).toContain("GET");
    expect(methods).toContain("POST");
    expect(methods).toContain("PATCH");
    expect(methods).toContain("DELETE");
  });

  it("should have revisions endpoint", () => {
    const router = createContentEntryRouter();
    const routes = router.getRoutes();
    const revisionRoute = routes.find((r) => r.path.includes("revisions"));
    expect(revisionRoute).toBeDefined();
    expect(revisionRoute?.method).toBe("GET");
  });

  it("should have 6 routes total", () => {
    const router = createContentEntryRouter();
    const routes = router.getRoutes();
    expect(routes).toHaveLength(6);
  });
});
