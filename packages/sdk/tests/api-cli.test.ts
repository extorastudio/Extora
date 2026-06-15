import { describe, it, expect } from "vitest";
import { createRouter, createApiMiddleware, corsMiddleware, authMiddleware } from "../src/api";
import { registerCliCommand, getRegisteredCommands, createCliCommand } from "../src/cli";

describe("createRouter", () => {
  it("should register GET routes", () => {
    const router = createRouter("test-plugin");
    router.get("/test", async () => ({ ok: true }));
    const routes = router.getRoutes();
    expect(routes).toHaveLength(1);
    expect(routes[0]?.method).toBe("GET");
    expect(routes[0]?.path).toBe("/test");
  });

  it("should support method chaining", () => {
    const router = createRouter("test-plugin");
    router
      .get("/users", async () => [])
      .post("/users", async () => ({ id: "1" }))
      .delete("/users/1", async () => ({ deleted: true }));

    const routes = router.getRoutes();
    expect(routes).toHaveLength(3);
    expect(routes.map((r) => r.method)).toEqual(["GET", "POST", "DELETE"]);
  });

  it("should support all HTTP methods", () => {
    const router = createRouter("test-plugin");
    router.get("/get", async () => ({}));
    router.post("/post", async () => ({}));
    router.put("/put", async () => ({}));
    router.patch("/patch", async () => ({}));
    router.delete("/delete", async () => ({}));

    const routes = router.getRoutes();
    expect(routes).toHaveLength(5);
  });

  it("should accept middleware options", () => {
    const router = createRouter("test-plugin");
    const auth = authMiddleware();
    router.get("/admin", async () => ({}), { middleware: [auth.handler] });

    const routes = router.getRoutes();
    expect(routes[0]?.middleware).toHaveLength(1);
  });
});

describe("Middleware builders", () => {
  it("should create named middleware", () => {
    const mw = createApiMiddleware("logger", async (_req, reply) => {
      reply.header("x-test", "yes");
    });
    expect(mw.name).toBe("logger");
    expect(typeof mw.handler).toBe("function");
  });

  it("corsMiddleware should accept origins", () => {
    const mw = corsMiddleware(["https://example.com"]);
    expect(mw.name).toBe("cors");
  });

  it("authMiddleware should create auth handler", () => {
    const mw = authMiddleware(true);
    expect(mw.name).toBe("auth");
  });
});

describe("CLI helpers", () => {
  it("should register CLI commands", () => {
    const cmd = createCliCommand("test-cmd", "A test command", async () => {});
    registerCliCommand(cmd);

    const commands = getRegisteredCommands();
    const found = commands.find((c) => c.name === "test-cmd");
    expect(found).toBeDefined();
    expect(found?.description).toBe("A test command");
  });

  it("should return a copy of commands", () => {
    const before = getRegisteredCommands().length;
    registerCliCommand(createCliCommand("another", "desc", async () => {}));
    expect(getRegisteredCommands().length).toBe(before + 1);
  });
});
