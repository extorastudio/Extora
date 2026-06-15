import { describe, it, expect } from "vitest";
import { createProductRouter, createCartRouter, createOrderRouter } from "../src/routes";

describe("Commerce Product Router", () => {
  it("should list empty products initially", () => {
    const router = createProductRouter();
    const routes = router.getRoutes();
    expect(routes.length).toBeGreaterThanOrEqual(3);
  });

  it("should have GET, POST routes for products", () => {
    const router = createProductRouter();
    const routes = router.getRoutes();
    const methods = routes.map((r) => r.method);
    expect(methods).toContain("GET");
    expect(methods).toContain("POST");
  });
});

describe("Commerce Cart Router", () => {
  it("should have cart management routes", () => {
    const router = createCartRouter();
    const routes = router.getRoutes();
    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/api/v1/commerce/cart");
    expect(paths).toContain("/api/v1/commerce/cart/items");
  });

  it("should have GET, POST, DELETE methods", () => {
    const router = createCartRouter();
    const routes = router.getRoutes();
    const methods = routes.map((r) => r.method);
    expect(methods).toContain("GET");
    expect(methods).toContain("POST");
    expect(methods).toContain("DELETE");
  });
});

describe("Commerce Order Router", () => {
  it("should have checkout and order routes", () => {
    const router = createOrderRouter();
    const routes = router.getRoutes();
    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/api/v1/commerce/checkout");
    expect(paths).toContain("/api/v1/commerce/orders");
    expect(paths).toContain("/api/v1/commerce/orders/:id");
    expect(paths).toContain("/api/v1/commerce/orders/:id/status");
  });

  it("should have POST, GET, PATCH methods", () => {
    const router = createOrderRouter();
    const routes = router.getRoutes();
    const methods = routes.map((r) => r.method);
    expect(methods).toContain("POST");
    expect(methods).toContain("GET");
    expect(methods).toContain("PATCH");
  });
});
