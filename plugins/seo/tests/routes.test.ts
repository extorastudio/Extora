import { describe, it, expect } from "vitest";
import { createSeoRouter } from "../src/routes";

describe("SEO Router", () => {
  it("should have meta routes", () => {
    const router = createSeoRouter();
    const routes = router.getRoutes();
    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/api/v1/seo/meta/:type/:id");
  });

  it("should have sitemap endpoint", () => {
    const router = createSeoRouter();
    const routes = router.getRoutes();
    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/api/v1/seo/sitemap");
  });

  it("should have robots.txt endpoint", () => {
    const router = createSeoRouter();
    const routes = router.getRoutes();
    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/api/v1/seo/robots");
  });

  it("should have GET and POST methods", () => {
    const router = createSeoRouter();
    const routes = router.getRoutes();
    const methods = routes.map((r) => r.method);
    expect(methods).toContain("GET");
    expect(methods).toContain("POST");
  });
});
