import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "./authorization/rbac.js";
import { validateManifest } from "./plugin-loader/manifest.js";
import {
  installPlugin,
  uninstallPlugin,
  installTheme,
  uninstallTheme,
  discoverAndRegisterLocalPlugins,
  discoverAndRegisterLocalThemes,
} from "./plugin-installer.js";
import { publishSite } from "./publishing/engine.js";

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

  server.post("/api/v1/plugins/install", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "plugin", "install");

    const body = request.body as Record<string, unknown> | undefined;
    if (!body?.manifest) {
      return reply.status(400).send({ code: "BAD_REQUEST", message: "manifest is required" });
    }

    try {
      const manifest = validateManifest(body.manifest);
      const result = await installPlugin(prisma, server.log, manifest);
      return await reply.status(result.success ? 201 : 409).send(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid manifest";
      return reply.status(400).send({ code: "INVALID_MANIFEST", message });
    }
  });

  server.delete("/api/v1/plugins/:name", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "plugin", "install");

    const params = request.params as { name: string };
    const bodyName = (request.body as Record<string, unknown> | undefined)?.name as string | undefined;
    const name = bodyName ?? decodeURIComponent(params.name);
    const result = await uninstallPlugin(prisma, server.log, name);
    return reply.status(result.success ? 200 : 404).send(result);
  });

  server.post("/api/v1/plugins/discover", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "plugin", "install");

    const count = await discoverAndRegisterLocalPlugins(prisma, server.log);
    return reply.send({ success: true, message: `Registered ${String(count)} plugins from filesystem` });
  });

  server.post("/api/v1/plugins/:name/activate", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "plugin", "activate");

    const params = request.params as { name: string };
    const bodyName = (request.body as Record<string, unknown> | undefined)?.name as string | undefined;
    const name = bodyName ?? decodeURIComponent(params.name);
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

    const params = request.params as { name: string };
    const bodyName = (request.body as Record<string, unknown> | undefined)?.name as string | undefined;
    const name = bodyName ?? decodeURIComponent(params.name);
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

  server.post("/api/v1/themes/install", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "theme", "configure");

    const body = request.body as Record<string, unknown> | undefined;
    if (!body?.manifest) {
      return reply.status(400).send({ code: "BAD_REQUEST", message: "manifest is required" });
    }

    try {
      const manifest = validateManifest(body.manifest);
      const result = await installTheme(prisma, server.log, manifest);
      return await reply.status(result.success ? 201 : 409).send(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid manifest";
      return reply.status(400).send({ code: "INVALID_MANIFEST", message });
    }
  });

  server.delete("/api/v1/themes/:name", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "theme", "configure");

    const params = request.params as { name: string };
    const bodyName = (request.body as Record<string, unknown> | undefined)?.name as string | undefined;
    const name = bodyName ?? decodeURIComponent(params.name);
    const result = await uninstallTheme(prisma, server.log, name);
    return reply.status(result.success ? 200 : 404).send(result);
  });

  server.post("/api/v1/themes/discover", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "theme", "configure");

    const count = await discoverAndRegisterLocalThemes(prisma, server.log);
    return reply.send({ success: true, message: `Registered ${String(count)} themes from filesystem` });
  });

  server.post("/api/v1/themes/:name/activate", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "theme", "configure");

    const params = request.params as { name: string };
    const bodyName = (request.body as Record<string, unknown> | undefined)?.name as string | undefined;
    const name = bodyName ?? decodeURIComponent(params.name);
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

  // =========================================================================
  // Publishing Endpoint
  // =========================================================================

  server.post("/api/v1/site/publish", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    await authorize(request, reply, prisma, "site", "publish");

    try {
      const result = await publishSite(prisma, server.log);
      return await reply.send({ success: true, site: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Publish failed";
      return reply.status(500).send({ code: "PUBLISH_FAILED", message });
    }
  });

  // =========================================================================
  // Commerce — Products (Prisma-backed)
  // =========================================================================

  server.get("/api/v1/commerce/products", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const list = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return await reply.send({ data: list });
  });

  server.post("/api/v1/commerce/products", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const body = request.body as Record<string, unknown> | undefined;
    if (!body?.name) {
      return reply.status(400).send({ code: "BAD_REQUEST", message: "Name is required" });
    }
    const rawSlug = String(body.slug ?? body.name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const slug = `${rawSlug}-${String(Date.now())}`;
    const product = await prisma.product.create({
      data: {
        name: String(body.name),
        slug,
        price: Number(body.price ?? 0),
        comparePrice: body.comparePrice ? Number(body.comparePrice) : null,
        category: String(body.category ?? "General"),
        description: String(body.description ?? ""),
        images: body.images ?? [],
        rating: Number(body.rating ?? 0),
        reviews: Number(body.reviews ?? 0),
        inStock: Boolean(body.inStock ?? true),
        sku: String(body.sku ?? ""),
        tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
        status: String(body.status ?? "published"),
      },
    });
    return await reply.status(201).send({ data: product });
  });

  server.delete("/api/v1/commerce/products/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const params = request.params as { id: string };
    const id = decodeURIComponent(params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ code: "NOT_FOUND", message: "Product not found" });
    }
    await prisma.product.delete({ where: { id } });
    return await reply.send({ success: true });
  });

  // =========================================================================
  // Commerce — Orders
  // =========================================================================

  server.get("/api/v1/commerce/orders", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const list = await prisma.auditLog.findMany({
      where: { action: "site.publish" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, action: true, resource: true, outcome: true, details: true, createdAt: true },
    });
    return await reply.send({
      data: list.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    });
  });
}
