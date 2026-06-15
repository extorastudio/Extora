import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "./authorization/rbac.js";

export function registerAdminRoutes(server: FastifyInstance, prisma: PrismaClient): void {
  // =========================================================================
  // Plugin Endpoints
  // =========================================================================

  server.get("/api/v1/plugins", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);

    const plugins = await prisma.plugin.findMany({
      orderBy: { installedAt: "desc" },
      select: {
        id: true,
        name: true,
        title: true,
        version: true,
        author: true,
        description: true,
        isActive: true,
        installedAt: true,
      },
    });

    return reply.send({ data: plugins });
  });

  server.post("/api/v1/plugins/:name/activate", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "plugin", "activate");

    const { name } = request.params as { name: string };
    const plugin = await prisma.plugin.findUnique({ where: { name } });

    if (!plugin) {
      return reply.status(404).send({ code: "NOT_FOUND", message: `Plugin "${name}" not found` });
    }

    await prisma.plugin.update({ where: { name }, data: { isActive: true } });

    await prisma.auditLog.create({
      data: {
        userId: ((request as unknown as Record<string, unknown>).userId as string) || null,
        action: "plugin.activate",
        resource: `plugin:${name}`,
        outcome: "success",
        ipAddress: request.ip,
      },
    });

    return reply.send({ success: true });
  });

  server.post("/api/v1/plugins/:name/deactivate", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "plugin", "activate");

    const { name } = request.params as { name: string };
    const plugin = await prisma.plugin.findUnique({ where: { name } });

    if (!plugin) {
      return reply.status(404).send({ code: "NOT_FOUND", message: `Plugin "${name}" not found` });
    }

    await prisma.plugin.update({ where: { name }, data: { isActive: false } });

    await prisma.auditLog.create({
      data: {
        userId: ((request as unknown as Record<string, unknown>).userId as string) || null,
        action: "plugin.deactivate",
        resource: `plugin:${name}`,
        outcome: "success",
        ipAddress: request.ip,
      },
    });

    return reply.send({ success: true });
  });

  // =========================================================================
  // User Endpoints
  // =========================================================================

  server.get("/api/v1/users", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "user", "read");

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return reply.send({ data: users });
  });

  // =========================================================================
  // Theme Endpoints
  // =========================================================================

  server.get("/api/v1/themes", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);

    const themes = await prisma.theme.findMany({
      orderBy: { installedAt: "desc" },
      select: {
        id: true,
        name: true,
        title: true,
        version: true,
        author: true,
        isActive: true,
        installedAt: true,
      },
    });

    return reply.send({ data: themes });
  });

  server.post("/api/v1/themes/:name/activate", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "theme", "configure");

    const { name } = request.params as { name: string };
    const theme = await prisma.theme.findUnique({ where: { name } });

    if (!theme) {
      return reply.status(404).send({ code: "NOT_FOUND", message: `Theme "${name}" not found` });
    }

    // Deactivate all other themes first
    await prisma.theme.updateMany({ data: { isActive: false } });
    await prisma.theme.update({ where: { name }, data: { isActive: true } });

    return reply.send({ success: true });
  });

  // =========================================================================
  // Config Endpoint
  // =========================================================================

  server.get("/api/v1/config", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);

    const configs = await prisma.systemConfig.findMany();

    const result: Record<string, unknown> = {};
    for (const cfg of configs) {
      if (cfg.isSecret) {
        result[cfg.key] = "********";
      } else {
        result[cfg.key] = cfg.value;
      }
    }

    // Also add env-based config
    result.NODE_ENV = process.env.NODE_ENV ?? "development";
    result.PORT = process.env.PORT ?? "3000";
    result.LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
    result.SESSION_TTL = process.env.SESSION_TTL ?? "15m";
    result.REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL ?? "7d";
    result.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
    result.STORAGE_BACKEND = process.env.STORAGE_BACKEND ?? "local";

    return reply.send(result);
  });
}
