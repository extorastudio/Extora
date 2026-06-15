import { describe, it, expect } from "vitest";
import { createFormRouter, createSubmissionRouter } from "../src/routes";

describe("Forms Router", () => {
  it("should have form CRUD routes", () => {
    const router = createFormRouter();
    const routes = router.getRoutes();
    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/api/v1/forms");
    expect(paths).toContain("/api/v1/forms/:id");
  });

  it("should have GET and POST methods", () => {
    const router = createFormRouter();
    const routes = router.getRoutes();
    const methods = routes.map((r) => r.method);
    expect(methods).toContain("GET");
    expect(methods).toContain("POST");
  });
});

describe("Submission Router", () => {
  it("should have submission routes", () => {
    const router = createSubmissionRouter();
    const routes = router.getRoutes();
    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/api/v1/forms/:id/submissions");
    expect(paths).toContain("/api/v1/forms/:slug/submit");
  });

  it("should have GET, POST, DELETE methods", () => {
    const router = createSubmissionRouter();
    const routes = router.getRoutes();
    const methods = routes.map((r) => r.method);
    expect(methods).toContain("GET");
    expect(methods).toContain("POST");
    expect(methods).toContain("DELETE");
  });
});
