import crypto from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { BootstrapContext } from "./bootstrap.js";
import type { ApiError } from "@extora/types";
import { registerAuthRoutes } from "./auth/routes.js";
import { registerAdminRoutes } from "./admin-routes.js";
import { registerGraphQLEndpoint, GraphQLRegistry } from "./graphql.js";
import { registerWebSocketEndpoint } from "./websocket.js";

export async function createServer(ctx: BootstrapContext): Promise<FastifyInstance> {
  const server = Fastify({
    logger: false,
    trustProxy: true,
    requestIdHeader: "x-request-id",
    genReqId: () => crypto.randomUUID(),
  });

  await server.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  });

  await server.register(websocket);

  // Request logging (async required by Fastify v5)
  server.addHook("onRequest", async (request: FastifyRequest) => {
    await Promise.resolve();
    ctx.logger.debug(`${request.method} ${request.url}`, {
      method: request.method,
      url: request.url,
      requestId: request.id,
      ip: request.ip,
    });
  });

  // Error handler
  server.setErrorHandler((err, _request, reply) => {
    const error = err as Error & { statusCode?: number; code?: string };
    const statusCode = error.statusCode ?? 500;
    const apiError: ApiError = {
      code: error.code ?? "INTERNAL_ERROR",
      message: error.message,
      requestId: _request.id,
    };
    ctx.logger.error(`[${String(statusCode)}] ${error.message}`, {
      code: error.code,
      url: _request.url,
      requestId: _request.id,
    });
    reply.status(statusCode).send(apiError);
  });

  // 404 handler
  server.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      code: "NOT_FOUND",
      message: `Route ${_request.method} ${_request.url} not found`,
      requestId: _request.id,
    });
  });

  // =========================================================================
  // Health & System Endpoints
  // =========================================================================

  server.get("/api/v1/system/health", async () => {
    const services: Record<string, { status: string; latencyMs?: number }> = {};

    // Check PostgreSQL
    const pgStart = Date.now();
    try {
      await ctx.prisma.$queryRaw`SELECT 1`;
      services.database = { status: "connected", latencyMs: Date.now() - pgStart };
    } catch {
      services.database = { status: "disconnected" };
    }

    // Check Redis
    const redisStart = Date.now();
    try {
      await ctx.redis.ping();
      services.redis = { status: "connected", latencyMs: Date.now() - redisStart };
    } catch {
      services.redis = { status: "disconnected" };
    }

    const hasAllServices = Object.values(services).every((s) => s.status === "connected");

    return {
      status: hasAllServices ? "ok" : "degraded",
      version: "0.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services,
    };
  });

  server.get("/api/v1/system/info", () => {
    return {
      version: "0.0.0",
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV ?? "development",
      pid: process.pid,
      memory: {
        heapUsed: `${String(Math.round(process.memoryUsage().heapUsed / 1024 / 1024))} MB`,
        heapTotal: `${String(Math.round(process.memoryUsage().heapTotal / 1024 / 1024))} MB`,
        rss: `${String(Math.round(process.memoryUsage().rss / 1024 / 1024))} MB`,
      },
    };
  });

  // Root redirect
  server.get("/", async (_request, reply) => {
    reply.redirect("/api/v1/system/health");
  });

  // =========================================================================
  // Register Auth Routes
  // =========================================================================
  registerAuthRoutes(server, ctx.prisma);

  // =========================================================================
  // Register Admin Routes (plugins, users, themes, config)
  // =========================================================================
  registerAdminRoutes(server, ctx.prisma);

  // =========================================================================
  // Hook System Debug Endpoint
  // =========================================================================
  server.get("/api/v1/system/hooks", () => ({
    hooks: Array.from(ctx.hooks.getRegisteredHooks().entries()).map(
      ([name, counts]) => ({ name, ...counts }),
    ),
  }));

  // =========================================================================
  // Register GraphQL Endpoint
  // =========================================================================
  const graphql = new GraphQLRegistry();
  graphql.registerType({
    name: "SystemInfo",
    fields: [
      { name: "version", type: "String" },
      { name: "nodeVersion", type: "String" },
      { name: "platform", type: "String" },
    ],
  });
  graphql.registerQuery({
    name: "systemInfo",
    returnType: "SystemInfo",
    resolve: () => ({
      version: "0.0.0",
      nodeVersion: process.version,
      platform: process.platform,
    }),
  });
  graphql.registerQuery({
    name: "health",
    returnType: "String",
    resolve: () => "ok",
  });
  registerGraphQLEndpoint(server, graphql);

  // =========================================================================
  // Register WebSocket Endpoint
  // =========================================================================
  registerWebSocketEndpoint(server, ctx.eventBus);

  return server;
}
