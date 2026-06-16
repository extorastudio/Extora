import crypto from "node:crypto";
import net from "node:net";
import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import multipart from "@fastify/multipart";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { BootstrapContext } from "./bootstrap.js";
import type { ApiError } from "@extora/types";
import { registerAuthRoutes } from "./auth/routes.js";
import { registerAdminRoutes } from "./admin-routes.js";
import { registerGraphQLEndpoint, GraphQLRegistry } from "./graphql.js";
import { registerWebSocketEndpoint } from "./websocket.js";

function checkTcp(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timer = setTimeout(() => { socket.destroy(); resolve(false); }, timeoutMs);
    socket.connect(port, host, () => { clearTimeout(timer); socket.destroy(); resolve(true); });
    socket.on("error", () => { clearTimeout(timer); resolve(false); });
  });
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (s3Client) return s3Client;
  const endpoint = process.env.S3_ENDPOINT;
  if (!endpoint) return null;
  s3Client = new S3Client({
    endpoint,
    region: process.env.S3_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
  return s3Client;
}

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
  await server.register(multipart, { limits: { fileSize: 500 * 1024 * 1024, files: 10 } });

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

    // Check S3 / MinIO storage
    const storeBackend = process.env.STORAGE_BACKEND ?? "local";
    if (storeBackend === "s3") {
      const s3Start = Date.now();
      try {
        const client = getS3Client();
        if (client) {
          await client.send(new ListBucketsCommand({}));
          services.storage = { status: "connected", latencyMs: Date.now() - s3Start };
        } else {
          services.storage = { status: "disconnected" };
        }
      } catch {
        services.storage = { status: "disconnected" };
      }
    } else {
      services.storage = { status: "connected" };
    }

    // Check OpenSearch
    const osUrl = process.env.OPENSEARCH_URL;
    if (osUrl) {
      const osStart = Date.now();
      try {
        const res = await fetch(`${osUrl}/_cluster/health`, { signal: AbortSignal.timeout(3000) });
        services.opensearch = { status: res.ok ? "connected" : "disconnected", latencyMs: Date.now() - osStart };
      } catch {
        services.opensearch = { status: "disconnected" };
      }
    } else {
      services.opensearch = { status: "disconnected" };
    }

    // Check SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT ?? "25", 10);
    if (smtpHost) {
      const smtpStart = Date.now();
      try {
        const ok = await checkTcp(smtpHost, smtpPort, 3000);
        services.email = { status: ok ? "connected" : "disconnected", latencyMs: Date.now() - smtpStart };
      } catch {
        services.email = { status: "disconnected" };
      }
    } else {
      services.email = { status: "disconnected" };
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
