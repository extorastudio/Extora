import type { ApiHandler, ApiMiddleware } from "@extora/types";

interface ApiRouteOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  handler: ApiHandler;
  middleware?: ApiMiddleware[];
  schema?: Record<string, unknown>;
}

export function createRouter(_pluginName: string) {
  const routes: ApiRouteOptions[] = [];

  return {
    get(path: string, handler: ApiHandler, options?: { middleware?: ApiMiddleware[]; schema?: Record<string, unknown> }) {
      routes.push({ method: "GET", path, handler, ...options });
      return this;
    },
    post(path: string, handler: ApiHandler, options?: { middleware?: ApiMiddleware[]; schema?: Record<string, unknown> }) {
      routes.push({ method: "POST", path, handler, ...options });
      return this;
    },
    put(path: string, handler: ApiHandler, options?: { middleware?: ApiMiddleware[]; schema?: Record<string, unknown> }) {
      routes.push({ method: "PUT", path, handler, ...options });
      return this;
    },
    patch(path: string, handler: ApiHandler, options?: { middleware?: ApiMiddleware[]; schema?: Record<string, unknown> }) {
      routes.push({ method: "PATCH", path, handler, ...options });
      return this;
    },
    delete(path: string, handler: ApiHandler, options?: { middleware?: ApiMiddleware[]; schema?: Record<string, unknown> }) {
      routes.push({ method: "DELETE", path, handler, ...options });
      return this;
    },
    getRoutes(): ApiRouteOptions[] {
      return routes;
    },
  };
}

export function createApiMiddleware(
  name: string,
  fn: ApiMiddleware,
): { name: string; handler: ApiMiddleware } {
  return { name, handler: fn };
}

export function corsMiddleware(origins: string[] = ["*"]): { name: string; handler: ApiMiddleware } {
  return createApiMiddleware("cors", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", origins.join(", "));
  });
}

export function authMiddleware(required = true): { name: string; handler: ApiMiddleware } {
  return createApiMiddleware("auth", async (request, reply) => {
    const auth = request.headers.authorization;
    if (required && !auth) {
      reply.status(401).send({ code: "UNAUTHORIZED", message: "Authentication required" });
    }
  });
}
