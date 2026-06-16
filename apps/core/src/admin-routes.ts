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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = await (prisma as any).product.findMany({
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
    const slug = String(body.slug ?? String(body.name)).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma as any).product.create({
      data: {
        name: String(body.name),
        slug: `${slug}-${String(Date.now())}`,
        type: String(body.type ?? "simple"),
        status: String(body.status ?? "draft"),
        featured: Boolean(body.featured ?? false),
        description: String(body.description ?? ""),
        shortDesc: String(body.shortDesc ?? ""),
        sku: String(body.sku ?? ""),
        price: Number(body.price ?? body.regularPrice ?? 0),
        regularPrice: Number(body.regularPrice ?? body.price ?? 0),
        salePrice: body.salePrice ? Number(body.salePrice) : null,
        costPrice: body.costPrice ? Number(body.costPrice) : null,
        taxStatus: String(body.taxStatus ?? "taxable"),
        taxClass: String(body.taxClass ?? "standard"),
        weight: body.weight ? Number(body.weight) : null,
        length: body.length ? Number(body.length) : null,
        width: body.width ? Number(body.width) : null,
        height: body.height ? Number(body.height) : null,
        shippingClass: String(body.shippingClass ?? ""),
        manageStock: Boolean(body.manageStock ?? false),
        stockQty: Number(body.stockQty ?? 0),
        stockStatus: String(body.stockStatus ?? "instock"),
        lowStockQty: Number(body.lowStockQty ?? 0),
        soldIndividually: Boolean(body.soldIndividually ?? false),
        backorders: String(body.backorders ?? "no"),
        minQty: Number(body.minQty ?? 1),
        maxQty: body.maxQty ? Number(body.maxQty) : null,
        category: String(body.category ?? "General"),
        categories: Array.isArray(body.categories) ? body.categories.map(String) : [String(body.category ?? "General")],
        tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
        brand: String(body.brand ?? ""),
        images: body.images ?? [],
        videoUrl: body.videoUrl ? String(body.videoUrl) : null,
        downloadUrl: body.downloadUrl ? String(body.downloadUrl) : null,
        downloadLimit: body.downloadLimit ? Number(body.downloadLimit) : null,
        downloadExpiry: body.downloadExpiry ? Number(body.downloadExpiry) : null,
        metaData: body.metaData ?? {},
        upSellIds: Array.isArray(body.upSellIds) ? body.upSellIds.map(String) : [],
        crossSellIds: Array.isArray(body.crossSellIds) ? body.crossSellIds.map(String) : [],
        relatedIds: Array.isArray(body.relatedIds) ? body.relatedIds.map(String) : [],
        comboItems: body.comboItems ?? [],
        dealType: body.dealType ? String(body.dealType) : null,
        dealValue: body.dealValue ? Number(body.dealValue) : null,
        dealLabel: body.dealLabel ? String(body.dealLabel) : null,
        discountType: body.discountType ? String(body.discountType) : null,
        discountValue: body.discountValue ? Number(body.discountValue) : null,
        publishedAt: body.status === "published" ? new Date() : null,
        scheduledAt: body.scheduledAt ? new Date(String(body.scheduledAt)) : null,
      },
    });
    return await reply.status(201).send({ data: product });
  });

  server.patch("/api/v1/commerce/products/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const params = request.params as { id: string };
    const id = decodeURIComponent(params.id);
    const body = request.body as Record<string, unknown> | undefined;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ code: "NOT_FOUND", message: "Product not found" });
    const updateData: Record<string, unknown> = {};
    const fields = ["name","status","featured","description","shortDesc","sku","price","regularPrice","salePrice","costPrice","taxStatus","taxClass","weight","length","width","height","shippingClass","manageStock","stockQty","stockStatus","lowStockQty","soldIndividually","backorders","minQty","maxQty","category","categories","tags","brand","images","videoUrl","downloadUrl","downloadLimit","downloadExpiry","metaData","upSellIds","crossSellIds","relatedIds","comboItems","dealType","dealValue","dealLabel","discountType","discountValue"];
    for (const f of fields) { if (body?.[f] !== undefined) updateData[f] = body[f]; }
    if (body?.status === "published" && existing.status !== "published") {
      updateData.publishedAt = new Date();
    }
    if (body?.scheduledAt) updateData.scheduledAt = new Date(String(body.scheduledAt));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await prisma.product.update({ where: { id }, data: updateData as any });
    return await reply.send({ data: product });
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

  // =========================================================================
  // Content Entries (Pages, Blog Posts)
  // =========================================================================

  server.get("/api/v1/content", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const type = (request.query as Record<string, string> | undefined)?.type;
    const where = type ? { type } : {};
    const list = await prisma.contentEntry.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    return await reply.send({ data: list });
  });

  server.post("/api/v1/content", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const body = request.body as Record<string, unknown> | undefined;
    if (!body?.title) {
      return reply.status(400).send({ code: "BAD_REQUEST", message: "Title is required" });
    }
    const slug = String(body.slug ?? body.title).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const entry = await prisma.contentEntry.create({
      data: {
        title: String(body.title),
        slug: `${slug}-${String(Date.now())}`,
        body: String(body.body ?? ""),
        excerpt: String(body.excerpt ?? ""),
        type: String(body.type ?? "page"),
        status: String(body.status ?? "draft"),
        metadata: (body.metadata ?? {}) as any,
      },
    });
    return await reply.status(201).send({ data: entry });
  });

  server.patch("/api/v1/content/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const params = request.params as { id: string };
    const id = decodeURIComponent(params.id);
    const body = request.body as Record<string, unknown> | undefined;
    const existing = await prisma.contentEntry.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ code: "NOT_FOUND", message: "Content not found" });
    }
    const entry = await prisma.contentEntry.update({
      where: { id },
      data: {
        title: body?.title !== undefined ? String(body.title) : existing.title,
        body: body?.body !== undefined ? String(body.body) : existing.body,
        excerpt: body?.excerpt !== undefined ? String(body.excerpt) : existing.excerpt,
        status: body?.status !== undefined ? String(body.status) : existing.status,
        metadata: body?.metadata !== undefined ? (body.metadata as any) : existing.metadata,
        publishedAt: body?.status === "published" && existing.status !== "published" ? new Date() : existing.publishedAt,
      },
    });
    return await reply.send({ data: entry });
  });

  server.delete("/api/v1/content/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const params = request.params as { id: string };
    const id = decodeURIComponent(params.id);
    const existing = await prisma.contentEntry.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ code: "NOT_FOUND", message: "Content not found" });
    }
    await prisma.contentEntry.delete({ where: { id } });
    return await reply.send({ success: true });
  });
}
