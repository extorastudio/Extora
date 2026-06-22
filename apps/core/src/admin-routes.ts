import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
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
  // COD (Cash on Delivery) Config
  // =========================================================================

  server.get("/api/v1/config/cod", async (_request: FastifyRequest, reply: FastifyReply) => {
    const config = await prisma.systemConfig.findUnique({ where: { key: "cod_enabled" } });
    return await reply.send({ data: { cod_enabled: config ? config.value === "true" : true } });
  });

  server.post("/api/v1/config/cod", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const body = request.body as Record<string, unknown> | undefined;
    const enabled = body?.enabled !== false;
    await prisma.systemConfig.upsert({
      where: { key: "cod_enabled" },
      create: { key: "cod_enabled", value: String(enabled) },
      update: { value: String(enabled) },
    });
    return await reply.send({ data: { cod_enabled: enabled } });
  });

  // =========================================================================
  // Pincode Management
  // =========================================================================

  server.get("/api/v1/pincode/check", async (request: FastifyRequest, reply: FastifyReply) => {
    const pincode = ((request.query as Record<string, string>)?.pincode || "").trim();
    if (pincode?.length !== 6) return reply.send({ data: { serviceable: false, message: "Enter a valid 6-digit pincode" } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await (prisma as any).$queryRawUnsafe(`SELECT * FROM "Pincode" WHERE pincode = $1 LIMIT 1`, pincode);
    if (rows.length && rows[0].isServiceable) {
      const r = rows[0];
      return reply.send({ data: { serviceable: true, pincode: r.pincode, city: r.city, state: r.state, deliveryDays: r.deliveryDays, extraCharge: r.extraCharge, codAvailable: r.codAvailable, message: `Delivery to ${r.city}, ${r.state} in ${r.deliveryDays} days` } });
    }
    return reply.send({ data: { serviceable: false, message: "Not serviceable" } });
  });

  server.get("/api/v1/pincode", async (_request: FastifyRequest, reply: FastifyReply) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await (prisma as any).$queryRawUnsafe(`SELECT * FROM "Pincode" ORDER BY pincode ASC`);
    return reply.send({ data: rows });
  });

  server.post("/api/v1/pincode", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as Record<string, unknown> | undefined;
    const p = String(body?.pincode || "").trim();
    if (p?.length !== 6) return reply.status(400).send({ code: "INVALID", message: "Valid 6-digit pincode required" });
    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO "Pincode" (pincode, city, state, "isServiceable", "deliveryDays", "extraCharge", "codAvailable", "prepaidAvailable") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (pincode) DO UPDATE SET city=$2, state=$3, "isServiceable"=$4, "deliveryDays"=$5, "extraCharge"=$6, "codAvailable"=$7, "prepaidAvailable"=$8`,
      p, String(body?.city ?? ""), String(body?.state ?? ""), body?.isServiceable !== false, Number(body?.deliveryDays ?? 3), Number(body?.extraCharge ?? 0), body?.codAvailable !== false, body?.prepaidAvailable !== false,
    );
    return reply.send({ data: { success: true } });
  });

  server.delete("/api/v1/pincode/:pincode", async (request: FastifyRequest, reply: FastifyReply) => {
    const p = (request.params as { pincode: string }).pincode;
    await (prisma as any).$executeRawUnsafe(`DELETE FROM "Pincode" WHERE pincode = $1`, p);
    return reply.send({ data: { deleted: true } });
  });

  // =========================================================================
  // Shipping Management
  // =========================================================================

  server.get("/api/v1/shipping/config", async (_request: FastifyRequest, reply: FastifyReply) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await (prisma as any).$queryRawUnsafe(`SELECT * FROM "ShippingConfig" WHERE "isActive" = true ORDER BY "createdAt" DESC LIMIT 1`);
    return reply.send({ data: rows[0] || {} });
  });

  server.post("/api/v1/shipping/config", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as Record<string, unknown> | undefined;
    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO "ShippingConfig" (name, type, "baseCharge", "freeAbove", "perKgCharge", "extraChargeEnabled", "extraChargePercent", "extraChargeFixed", zones) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
      String(body?.name ?? "Standard"), String(body?.type ?? "flat"), Number(body?.baseCharge ?? 49), Number(body?.freeAbove ?? 499), Number(body?.perKgCharge ?? 0), body?.extraChargeEnabled === true, Number(body?.extraChargePercent ?? 0), Number(body?.extraChargeFixed ?? 0), JSON.stringify(body?.zones ?? []),
    );
    return reply.send({ data: { success: true } });
  });

  server.get("/api/v1/shipping/calculate", async (request: FastifyRequest, reply: FastifyReply) => {
    const amount = Number((request.query as Record<string, string>)?.amount || 0);
    const pincode = ((request.query as Record<string, string>)?.pincode || "").trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configRows: any[] = await (prisma as any).$queryRawUnsafe(`SELECT * FROM "ShippingConfig" WHERE "isActive" = true ORDER BY "createdAt" DESC LIMIT 1`);
    const cfg = configRows[0] || { baseCharge: 49, freeAbove: 499, extraChargeEnabled: false };
    const charge: number = amount >= (Number(cfg.freeAbove) || 499) ? 0 : (Number(cfg.baseCharge) || 49);
    let extra = 0;
    if (pincode?.length === 6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pinRows: any[] = await (prisma as any).$queryRawUnsafe(`SELECT "extraCharge" FROM "Pincode" WHERE pincode = $1 AND "isServiceable" = true LIMIT 1`, pincode);
      if (pinRows.length && pinRows[0].extraCharge) extra += Number(pinRows[0].extraCharge);
    }
    if (cfg.extraChargeEnabled && Number(cfg.extraChargePercent) > 0) extra += Math.round(amount * Number(cfg.extraChargePercent) / 100);
    if (cfg.extraChargeEnabled && Number(cfg.extraChargeFixed) > 0) extra += Number(cfg.extraChargeFixed);
    return reply.send({ data: { shippingCharge: charge, extraCharge: extra, totalCharge: charge + extra, freeShipping: charge === 0 } });
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
    const statusFilter = (request.query as any)?.status as string | undefined;
    const where: any = statusFilter ? { status: statusFilter } : {};

    // Check if Commerce plugin is active
    try {
      const plugins = await (prisma as any).plugin.findMany({ where: { isActive: true } });
      const activeNames = plugins.map((p: any) => p.name ?? "");
      if (!activeNames.some((n: string) => n.includes("commerce"))) {
        // Commerce disabled — return empty list for published filtering
        if (statusFilter === "published") return await reply.send({ data: [] });
      }
    } catch { /* plugin check optional */ }

    const list = await (prisma as any).product.findMany({
      where, orderBy: { createdAt: "desc" },
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
        mrp: body.mrp ? Number(body.mrp) : null,
        discountPercent: body.discountPercent ? Number(body.discountPercent) : null,
        emiAvailable: Boolean(body.emiAvailable ?? false),
        emiPrice: body.emiPrice ? Number(body.emiPrice) : null,
        deliveryInfo: String(body.deliveryInfo ?? ''),
        deliveryDate: String(body.deliveryDate ?? ''),
        codAvailable: Boolean(body.codAvailable ?? true),
        returnPolicy: String(body.returnPolicy ?? '7 days returnable'),
        warranty: String(body.warranty ?? ''),
        offers: Array.isArray(body.offers) ? body.offers : [],
        highlights: Array.isArray(body.highlights) ? body.highlights : [],
        specs: body.specs ?? {},
        sellerName: String(body.sellerName ?? 'Extora Seller'),
        sellerRating: Number(body.sellerRating ?? 4.0),
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
    const fields = ["name","status","featured","description","shortDesc","sku","price","regularPrice","salePrice","costPrice","taxStatus","taxClass","weight","length","width","height","shippingClass","manageStock","stockQty","stockStatus","lowStockQty","soldIndividually","backorders","minQty","maxQty","category","categories","tags","brand","images","videoUrl","downloadUrl","downloadLimit","downloadExpiry","metaData","upSellIds","crossSellIds","relatedIds","comboItems","dealType","dealValue","dealLabel","discountType","discountValue","mrp","discountPercent","emiAvailable","emiPrice","deliveryInfo","deliveryDate","codAvailable","returnPolicy","warranty","offers","highlights","specs","sellerName","sellerRating","multiBuyEnabled"];
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = await (prisma as any).$queryRawUnsafe(
      `SELECT id, "orderNumber", "customerEmail", total, status, "createdAt" FROM "Order" ORDER BY "createdAt" DESC LIMIT 50`,
    );
    const orders = (list as any[]).map((r: any) => ({
      id: String(r.id), orderNumber: String(r.orderNumber), customerEmail: String(r.customerEmail),
      total: Number(r.total), status: String(r.status), items: 1,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));
    return await reply.send({ data: orders });
  });

  server.patch("/api/v1/commerce/orders/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const params = request.params as { id: string };
    const body = request.body as Record<string, unknown> | undefined;
    const newStatus = String(body?.status ?? "confirmed");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).$queryRawUnsafe(
      `UPDATE "Order" SET status = $1 WHERE id = $2`,
      newStatus, decodeURIComponent(params.id),
    );
    return await reply.send({ success: true, status: newStatus });
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

  // =========================================================================
  // Media Library
  // =========================================================================

  server.get("/api/v1/media", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const list = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return await reply.send({ data: list });
  });

  server.post("/api/v1/media", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const body = request.body as Record<string, unknown> | undefined;
    if (!body?.url || !body?.filename) {
      return reply.status(400).send({ code: "BAD_REQUEST", message: "url and filename required" });
    }
    const media = await prisma.media.create({
      data: {
        filename: String(body.filename),
        originalName: String(body.originalName ?? body.filename),
        mimeType: String(body.mimeType ?? "image/png"),
        size: Number(body.size ?? 0),
        width: body.width ? Number(body.width) : null,
        height: body.height ? Number(body.height) : null,
        storageBackend: String(body.storageBackend ?? "local"),
        storagePath: String(body.storagePath ?? body.url),
        url: String(body.url),
        thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl) : null,
        metadata: body.metadata ?? {},
        uploadedBy: (request as unknown as Record<string, string>).userId ?? null,
      },
    });
    return await reply.status(201).send({ data: media });
  });

  server.delete("/api/v1/media/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const params = request.params as { id: string };
    const id = decodeURIComponent(params.id);
    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ code: "NOT_FOUND", message: "Media not found" });
    await prisma.media.delete({ where: { id } });
    return await reply.send({ success: true });
  });

  // =========================================================================
  // Product Taxonomies — Categories, Brands, Tags, Attributes
  // =========================================================================

  const taxonomyCrud = (model: string) => ({
    list: async (_req: FastifyRequest, reply: FastifyReply) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list = await (prisma as any)[model].findMany({ orderBy: { name: "asc" } });
      return await reply.send({ data: list });
    },
    create: async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as Record<string, unknown> | undefined;
      if (!body?.name) return reply.status(400).send({ code: "BAD_REQUEST", message: "Name required" });
      const slug = String(body.slug ?? String(body.name)).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
       
      const data: Record<string, unknown> = { name: String(body.name), slug, description: String(body.description ?? "") };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = await (prisma as any)[model].create({ data });
      return await reply.status(201).send({ data: item });
    },
    update: async (request: FastifyRequest, reply: FastifyReply) => {
      const params = request.params as { id: string };
      const id = decodeURIComponent(params.id);
      const body = request.body as Record<string, unknown> | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = await (prisma as any)[model].findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ code: "NOT_FOUND", message: "Not found" });
      const updateData: Record<string, unknown> = {};
      if (body?.name !== undefined) { updateData.name = String(body.name); updateData.slug = String(body.slug ?? String(body.name)).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }
      if (body?.description !== undefined) updateData.description = String(body.description);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = await (prisma as any)[model].update({ where: { id }, data: updateData as any });
      return await reply.send({ data: item });
    },
    delete: async (request: FastifyRequest, reply: FastifyReply) => {
      const params = request.params as { id: string };
      const id = decodeURIComponent(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any)[model].delete({ where: { id } });
      return await reply.send({ success: true });
    },
  });

  // Register taxonomy routes for each model
  for (const [model, prefix] of [["productCategory", "categories"], ["productBrand", "brands"], ["productTag", "tags"], ["productAttribute", "attributes"]] as const) {
    const tc = taxonomyCrud(model);
    server.get(`/api/v1/commerce/${prefix}`, async (request, reply) => { await authenticate(request, reply, prisma); await tc.list(request, reply); });
    server.post(`/api/v1/commerce/${prefix}`, async (request, reply) => { await authenticate(request, reply, prisma); await tc.create(request, reply); });
    server.patch(`/api/v1/commerce/${prefix}/:id`, async (request, reply) => { await authenticate(request, reply, prisma); await tc.update(request, reply); });
    server.delete(`/api/v1/commerce/${prefix}/:id`, async (request, reply) => { await authenticate(request, reply, prisma); await tc.delete(request, reply); });
  }

  // Reviews
  server.get("/api/v1/commerce/reviews", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = await (prisma as any).productReview.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return await reply.send({ data: list });
  });
  server.patch("/api/v1/commerce/reviews/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const params = request.params as { id: string };
    const id = decodeURIComponent(params.id);
    const body = request.body as Record<string, unknown> | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const review = await (prisma as any).productReview.update({ where: { id }, data: { status: body?.status ?? "approved" } });
    return await reply.send({ data: review });
  });

  // =========================================================================
  // Theme Settings
  // =========================================================================

  server.get("/api/v1/theme/settings", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const theme = (request.query as Record<string, string> | undefined)?.theme ?? "default";
    const items = await (prisma as any).themeSetting.findMany({ where: { themeName: theme } });
    const settings: Record<string, unknown> = {};
    for (const item of items) { settings[item.key] = item.value; }
    return await reply.send({ data: settings });
  });

  server.post("/api/v1/theme/settings", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const body = request.body as Record<string, unknown> | undefined;
    const theme = (body?.theme as string) ?? "default";
    const updates = (body?.settings as Record<string, unknown>) ?? {};
    for (const [key, value] of Object.entries(updates)) {
      await (prisma as any).themeSetting.upsert({
        where: { themeName_key: { themeName: theme, key } },
        create: { themeName: theme, key, value: value as Record<string, unknown> },
        update: { value: value as Record<string, unknown> },
      });
    }
    return await reply.send({ success: true });
  });

  server.post("/api/v1/theme/reset", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const body = request.body as Record<string, unknown> | undefined;
    const theme = (body?.theme as string) ?? "default";
    await (prisma as any).themeSetting.deleteMany({ where: { themeName: theme } });
    return await reply.send({ success: true });
  });

  // =========================================================================
  // File Upload → MinIO/S3
  // =========================================================================

  const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT ?? "http://minio:9000",
    region: process.env.S3_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
    },
    forcePathStyle: true,
  });

  const BUCKET = process.env.S3_BUCKET ?? "extora";

  server.post("/api/v1/media/upload", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);

    try {
      const data = await request.file();
      if (!data) return await reply.status(400).send({ code: "NO_FILE", message: "No file uploaded" });

      const buffer = await data.toBuffer();
      const ext = data.filename.split(".").pop() ?? "bin";
      const key = `uploads/${randomUUID()}.${ext}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: data.mimetype,
      }));

      const url = `/storage/${BUCKET}/${key}`;

      const media = await prisma.media.create({
        data: {
          filename: data.filename,
          originalName: data.filename,
          mimeType: data.mimetype,
          size: buffer.length,
          storageBackend: "s3",
          storagePath: key,
          url,
          uploadedBy: (request as unknown as Record<string, string>).userId ?? null,
        },
      });

      return await reply.status(201).send({ data: media });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      return reply.status(500).send({ code: "UPLOAD_FAILED", message });
    }
  });

  // =========================================================================
  // Newsletter Subscribers
  // =========================================================================

  server.post("/api/v1/subscribers", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as Record<string, unknown> | undefined;
    const email = String(body?.email ?? "");
    if (!email.includes("@")) return reply.status(400).send({ code: "INVALID_EMAIL", message: "Valid email required" });
    try {
      await prisma.systemConfig.upsert({
        where: { key: `subscriber:${email}` },
        create: { key: `subscriber:${email}`, value: email },
        update: { value: email },
      });
    } catch { /* already exists */ }
    return await reply.send({ success: true, message: "Subscribed!" });
  });

  server.get("/api/v1/subscribers", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const subs = await prisma.systemConfig.findMany({ where: { key: { startsWith: "subscriber:" } } });
    return await reply.send({ data: subs.map((s) => ({ email: s.value, subscribedAt: s.updatedAt })) });
  });

  // =========================================================================
  // Product Reviews (Public)
  // =========================================================================

  // POST /api/v1/reviews — submit review (requires purchase)
  server.post("/api/v1/reviews", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as Record<string, unknown> | undefined;
    const productId = String(body?.productId ?? "");
    const email = String(body?.email ?? "").toLowerCase().trim();
    if (!productId || !body?.rating) return reply.status(400).send({ code: "BAD_REQUEST", message: "productId and rating required" });
    if (!email) return reply.status(400).send({ code: "BAD_REQUEST", message: "Email required for purchase verification" });

    // Check if user has purchased this product
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT items FROM "Order" WHERE "customerEmail" = $1`,
      email,
    );
    let hasPurchased = false;
    for (const o of orders) {
      const items = typeof o.items === "string" ? JSON.parse(o.items) : (o.items ?? []);
      const found = (items as any[]).some((item: any) =>
        (item.productId === productId || item.name === productId || String(item.id ?? "") === productId)
      );
      if (found) { hasPurchased = true; break; }
    }
    if (!hasPurchased) {
      return reply.status(403).send({ code: "NOT_PURCHASED", message: "You can only review products you have purchased" });
    }

    // Check for existing review from this email on this product
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingReview: any = await (prisma as any).productReview.findFirst({
      where: { productId, email },
    });
    if (existingReview) {
      return reply.status(409).send({ code: "ALREADY_REVIEWED", message: "You have already reviewed this product" });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const review = await (prisma as any).productReview.create({
        data: {
          productId,
          rating: Number(body.rating),
          title: String(body.title ?? ""),
          content: String(body.content ?? ""),
          author: String(body.author ?? "Anonymous"),
          email,
          status: "pending",
          images: body.images ?? [],
          videos: body.videos ?? [],
          orderId: String(body.orderId ?? ""),
        },
      });
      return await reply.status(201).send({ data: review, message: "Review submitted for approval. It will appear once approved." });
    } catch { return reply.status(500).send({ code: "ERROR", message: "Failed to submit review" }); }
  });

  // GET /api/v1/reviews/check?productId=X&email=Y — check if user can review
  server.get("/api/v1/reviews/check", async (request: FastifyRequest, reply: FastifyReply) => {
    const q = (request.query as Record<string, string>) ?? {};
    const productId = q.productId;
    const email = (q.email ?? "").toLowerCase().trim();
    if (!productId || !email) return reply.send({ canReview: false, reason: "Missing params" });

    // Check purchase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT items FROM "Order" WHERE "customerEmail" = $1`,
      email,
    );
    let hasPurchased = false;
    for (const o of orders) {
      const items = typeof o.items === "string" ? JSON.parse(o.items) : (o.items ?? []);
      if ((items as any[]).some((item: any) =>
        (item.productId === productId || item.name === productId || String(item.id ?? "") === productId)
      )) { hasPurchased = true; break; }
    }
    if (!hasPurchased) return reply.send({ canReview: false, reason: "Purchase required to review" });

    // Check existing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).productReview.findFirst({ where: { productId, email } });
    if (existing) return reply.send({ canReview: false, reason: "Already reviewed", existingReview: existing });

    return await reply.send({ canReview: true });
  });

  server.get("/api/v1/reviews/:productId", async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { productId: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviews = await (prisma as any).productReview.findMany({
      where: { productId: decodeURIComponent(params.productId), status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return await reply.send({ data: reviews });
  });

  // =========================================================================
  // Cart & Checkout
  // =========================================================================

  const carts = new Map<string, { items: { productId: string; name: string; price: number; qty: number; image: string }[]; updatedAt: string }>();

  server.get("/api/v1/commerce/cart", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const userId = ((request as unknown as Record<string, string>).userId) ?? "anonymous";
    const cart = carts.get(userId) ?? { items: [], updatedAt: new Date().toISOString() };
    const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
    return await reply.send({ data: { ...cart, total, itemCount: cart.items.length } });
  });

  server.post("/api/v1/commerce/cart/add", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const userId = ((request as unknown as Record<string, string>).userId) ?? "anonymous";
    const body = request.body as Record<string, unknown> | undefined;
    if (!body?.productId) return reply.status(400).send({ code: "BAD_REQUEST", message: "productId required" });

    // Check stock availability
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma as any).product.findFirst({ where: { name: String(body.productId) } });
    if (product && (product.stockStatus === "outofstock" || Number(product.stockQty ?? 10) <= 0)) {
      return reply.status(400).send({ code: "OUT_OF_STOCK", message: "This product is currently unavailable" });
    }

    const cart = carts.get(userId) ?? { items: [], updatedAt: "" };
    const existing = cart.items.find((i) => i.productId === String(body.productId));
    if (existing) {
      existing.qty += Number(body.qty ?? 1);
    } else {
      cart.items.push({
        productId: String(body.productId),
        name: String(body.name ?? "Product"),
        price: Number(body.price ?? 0),
        qty: Number(body.qty ?? 1),
        image: String(body.image ?? ""),
      });
    }
    cart.updatedAt = new Date().toISOString();
    carts.set(userId, cart);
    const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
    return await reply.send({ data: { ...cart, total, itemCount: cart.items.length } });
  });

  server.post("/api/v1/commerce/cart/remove", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const userId = ((request as unknown as Record<string, string>).userId) ?? "anonymous";
    const body = request.body as Record<string, unknown> | undefined;
    const cart = carts.get(userId);
    if (cart) {
      cart.items = cart.items.filter((i) => i.productId !== String(body?.productId));
      cart.updatedAt = new Date().toISOString();
      carts.set(userId, cart);
    }
    const c = carts.get(userId) ?? { items: [], updatedAt: "" };
    return await reply.send({ data: { ...c, total: c.items.reduce((s, i) => s + i.price * i.qty, 0), itemCount: c.items.length } });
  });

  server.post("/api/v1/commerce/cart/sync", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const userId = ((request as unknown as Record<string, string>).userId) ?? "anonymous";
    const body = request.body as Record<string, unknown> | undefined;
    const items = (body?.items as any[]) ?? [];
    const cartItems = items.map((i: any) => ({
      productId: String(i.name ?? i.productId ?? ""),
      name: String(i.name ?? ""),
      price: Number(i.price ?? 0),
      qty: Number(i.qty ?? 1),
      image: String(i.img ?? i.image ?? ""),
    }));
    carts.set(userId, { items: cartItems, updatedAt: new Date().toISOString() });
    const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    return await reply.send({ data: { items: cartItems, total, itemCount: cartItems.length } });
  });

  server.post("/api/v1/commerce/checkout", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const userId = ((request as unknown as Record<string, string>).userId) ?? "anonymous";
    const cart = carts.get(userId);
    if (!cart || cart.items.length === 0) {
      return reply.status(400).send({ code: "EMPTY_CART", message: "Cart is empty" });
    }
    const body = request.body as Record<string, unknown> | undefined;
    const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
    const orderData = {
      id: `order_${Date.now()}`,
      orderNumber: `EXT-${String(Date.now()).slice(-6)}`,
      customerEmail: String(body?.email ?? "customer@example.com"),
      items: cart.items,
      total,
      status: "confirmed",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).$queryRawUnsafe(
      `INSERT INTO "Order" (id, "orderNumber", "customerEmail", items, total, status, "createdAt") VALUES ($1, $2, $3, $4::jsonb, $5, $6, NOW())`,
      orderData.id, orderData.orderNumber, orderData.customerEmail, JSON.stringify(orderData.items), orderData.total, orderData.status,
    );

    await prisma.auditLog.create({
      data: {
        action: "order.placed",
        resource: `order:${orderData.id}`,
        outcome: "success",
        details: { total, items: cart.items.length } as any,
      },
    });

    carts.delete(userId);
    // Send order confirmation email
    try {
      const emailHtml = `<h2>Order Confirmed — ${orderData.orderNumber}</h2><p>Thank you for your order!</p><table><tr><td>Order</td><td>${orderData.orderNumber}</td></tr><tr><td>Total</td><td>₹${total.toLocaleString("en-IN")}</td></tr><tr><td>Items</td><td>${cart.items.length}</td></tr></table><p>We'll notify you when your order ships.</p>`;
      const emailBody = JSON.stringify({
        from: "noreply@extora.dev",
        subject: `Order Confirmed — ${orderData.orderNumber}`,
        html: emailHtml,
      });
       
      await Promise.race([
        fetch(`${process.env.SMTP_HOST ? `http://${process.env.SMTP_HOST}:8025` : "http://mailhog:8025"}/api/v1/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: [orderData.customerEmail],
            ...JSON.parse(emailBody),
          }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
      ]).catch(() => {});
    } catch { /* email optional */ }
    return await reply.send({ data: { ...orderData, createdAt: new Date().toISOString() } });
  });

  // GET /api/v1/orders/track?orderNumber=EXT-XXXXXX&email=customer@example.com — public tracking
  server.get("/api/v1/orders/track", async (request: FastifyRequest, reply: FastifyReply) => {
    const q = (request.query as Record<string, string>) ?? {};
    const orderNumber = q.orderNumber;
    const email = q.email;
    if (!orderNumber || !email) {
      return reply.status(400).send({ code: "MISSING_PARAMS", message: "orderNumber and email required" });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "Order" WHERE "orderNumber" = $1 AND "customerEmail" = $2 LIMIT 1`,
      orderNumber, email,
    );
    if (!rows.length) return reply.status(404).send({ code: "NOT_FOUND", message: "Order not found" });
    return await reply.send({ data: rows[0] });
  });

  // POST /api/v1/coupons/validate — validate coupon code
  server.post("/api/v1/coupons/validate", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as Record<string, unknown> | undefined;
    const code = String(body?.code ?? "").trim().toUpperCase();
    const orderTotal = Number(body?.orderTotal ?? 0);
    if (!code || orderTotal <= 0) {
      return reply.status(400).send({ code: "INVALID", message: "Missing code or invalid order total" });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "Coupon" WHERE code = $1 AND "isActive" = true AND ("expiresAt" IS NULL OR "expiresAt" > NOW()) LIMIT 1`,
      code,
    );
    if (!rows.length) return reply.status(404).send({ code: "NOT_FOUND", message: "Invalid or expired coupon" });
    const coupon = rows[0];
    if (coupon.minOrder && orderTotal < coupon.minOrder) {
      return reply.send({ valid: false, message: `Minimum order of ₹${coupon.minOrder} required` });
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return reply.send({ valid: false, message: "Coupon usage limit reached" });
    }
    let discount = coupon.type === "fixed" ? Number(coupon.value) : Math.round(orderTotal * Number(coupon.value) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
    return await reply.send({ valid: true, discount, code: coupon.code, message: `₹${discount} off applied!` });
  });

  // ── ANALYTICS & REPORTS ──

  // GET /api/v1/analytics/dashboard — dashboard summary stats
  server.get("/api/v1/analytics/dashboard", async (request, reply) => {
    await authenticate(request, reply, prisma);
    const p = prisma as any;
    let totalOrders = 0, totalRevenue = 0;
    try {
      const orderStats = await p.$queryRawUnsafe(`SELECT COUNT(*) as cnt, COALESCE(SUM(total),0) as rev FROM "Order"`) as any[];
      totalOrders = Number(orderStats?.[0]?.cnt ?? 0);
      totalRevenue = Number(orderStats?.[0]?.rev ?? 0);
    } catch { /* Order table may not exist */ }
    const [totalProducts, totalUsers, publishedProducts, outOfStockProducts, lowStockProducts] = await Promise.all([
      p.product.count().catch(() => 0),
      p.user.count().catch(() => 0),
      p.product.count({ where: { status: "published" } }).catch(() => 0),
      p.product.count({ where: { stockStatus: "outofstock" } }).catch(() => 0),
      p.product.count({ where: { OR: [{ stockStatus: "low" }, { stockQty: { lte: 5, gt: 0 } }] } }).catch(() => 0),
    ]);
    return await reply.send({
      success: true,
      data: { totalProducts: totalProducts ?? 0, totalOrders, totalUsers: totalUsers ?? 0, totalRevenue,
        publishedProducts: publishedProducts ?? 0, outOfStockProducts: outOfStockProducts ?? 0, lowStockProducts: lowStockProducts ?? 0 },
    });
  });

  // GET /api/v1/analytics/top-products — best selling products
  server.get("/api/v1/analytics/top-products", async (request, reply) => {
    await authenticate(request, reply, prisma);
    const limit = Math.min(Number((request.query as any).limit ?? 10), 50);
    const p = prisma as any;

    let orders: any[] = [];
    try { orders = await p.$queryRawUnsafe(`SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 500`) as any[]; } catch { /* no orders */ }

    const productSales: Record<string, { name: string; slug: string; price: number; qty: number; revenue: number; category: string; brand: string; rating: number; reviews: number }> = {};

    for (const order of orders) {
      let items: any[] = [];
      try { items = typeof order.items === "string" ? JSON.parse(order.items) : (Array.isArray(order.items) ? order.items : []); } catch { continue; }
      for (const item of items) {
        const name = String(item.name ?? item.productId ?? "");
        if (!productSales[name]) productSales[name] = { name, slug: item.slug ?? "", price: Number(item.price ?? 0), qty: 0, revenue: 0, category: item.category ?? "", brand: item.brand ?? "", rating: 0, reviews: 0 };
        productSales[name].qty += Number(item.qty ?? 1);
        productSales[name].revenue += Number(item.price ?? 0) * Number(item.qty ?? 1);
      }
    }

    // Merge with product data for rating info
    if (Object.keys(productSales).length > 0) {
      const products = await p.product.findMany({ where: { status: "published" } }).catch(() => []) as any[];
      for (const prod of products) {
        const name = String(prod.name);
        if (productSales[name]) {
          productSales[name].rating = Number(prod.rating ?? 0);
          productSales[name].reviews = Number(prod.reviews ?? 0);
        }
      }
      const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
      return await reply.send({ success: true, data: sorted });
    }

    // Fallback: use top rated products
    const products = await p.product.findMany({ where: { status: "published" }, orderBy: { rating: "desc" }, take: limit }).catch(() => []) as any[];
    return await reply.send({
      success: true,
      data: products.map((prod: any) => ({
        name: prod.name, slug: prod.slug, price: Number(prod.price ?? 0),
        qty: 0, revenue: 0, category: prod.category ?? "", brand: prod.brand ?? "",
        rating: Number(prod.rating ?? 0), reviews: Number(prod.reviews ?? 0),
      })),
    });
  });

  // GET /api/v1/analytics/sales-summary — sales over time
  server.get("/api/v1/analytics/sales-summary", async (request, reply) => {
    await authenticate(request, reply, prisma);
    const period = String((request.query as any).period ?? "daily");
    const p = prisma as any;
    let orders: any[] = [];
    try { orders = await p.$queryRawUnsafe(`SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 365`) as any[]; } catch { /* no orders */ }

    const buckets: Record<string, { orders: number; revenue: number }> = {};
    for (const order of orders) {
      const d = new Date(order.createdAt as string);
      let key: string;
      if (period === "weekly") { const start = new Date(d); start.setDate(d.getDate() - d.getDay()); key = start.toISOString().slice(0, 10); }
      else if (period === "monthly") key = d.toISOString().slice(0, 7);
      else key = d.toISOString().slice(0, 10);
      if (!buckets[key]) buckets[key] = { orders: 0, revenue: 0 };
      const b = buckets[key]!;
      b.orders++;
      b.revenue += Number(order.total ?? 0);
    }
    const data = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b)).slice(-30)
      .map(([date, val]) => ({ date, orders: val.orders, revenue: val.revenue }));
    return await reply.send({ success: true, data });
  });

  // GET /api/v1/analytics/category-sales — sales by category
  server.get("/api/v1/analytics/category-sales", async (request, reply) => {
    await authenticate(request, reply, prisma);
    const p = prisma as any;
    const products = await p.product.findMany({ where: { status: "published" } }).catch(() => []) as any[];
    const categorySales: Record<string, { count: number; revenue: number }> = {};
    for (const prod of products) {
      const cat = String(prod.category ?? "Uncategorized");
      if (!categorySales[cat]) categorySales[cat] = { count: 0, revenue: 0 };
      categorySales[cat].count++;
    }
    // Add revenue from orders
    const orders = await p.$queryRawUnsafe(`SELECT * FROM "Order" LIMIT 500`) as any[];
    for (const order of orders) {
      const items = (order.items && typeof order.items === "object" ? (Array.isArray(order.items) ? order.items : JSON.parse(String(order.items ?? "[]"))) : []) as any[];
      for (const item of items) {
        const cat = String(item.category ?? "Uncategorized");
        if (!categorySales[cat]) categorySales[cat] = { count: 0, revenue: 0 };
        categorySales[cat].revenue += Number(item.price ?? 0) * Number(item.qty ?? 1);
      }
    }
    const data = Object.entries(categorySales).map(([category, val]) => ({ category, ...val }));
    return await reply.send({ success: true, data });
  });

  // GET /api/v1/analytics/inventory-status — inventory overview
  server.get("/api/v1/analytics/inventory-status", async (request, reply) => {
    await authenticate(request, reply, prisma);
    const p = prisma as any;
    const [total, inStock, outOfStock, lowStock, totalStockValue] = await Promise.all([
      p.product.count().catch(() => 0),
      p.product.count({ where: { stockStatus: "instock", stockQty: { gt: 0 } } }).catch(() => 0),
      p.product.count({ where: { stockStatus: "outofstock" } }).catch(() => 0),
      p.product.count({ where: { OR: [{ stockStatus: "low" }, { stockQty: { lte: 5, gt: 0 } }] } }).catch(() => 0),
      p.product.aggregate({ _sum: { price: true } }).catch(() => ({ _sum: { price: 0 } })),
    ]);
    return await reply.send({
      success: true,
      data: {
        totalProducts: total ?? 0,
        inStock: inStock ?? 0,
        outOfStock: outOfStock ?? 0,
        lowStock: lowStock ?? 0,
        estimatedInventoryValue: ((totalStockValue)?._sum?.price ?? 0),
      },
    });
  });

  // GET /api/v1/analytics/recent-orders — recent orders list
  server.get("/api/v1/analytics/recent-orders", async (request, reply) => {
    await authenticate(request, reply, prisma);
    const limit = Math.min(Number((request.query as any).limit ?? 20), 50);
    const p = prisma as any;
    const orders = await p.$queryRawUnsafe(`SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT ${limit}`) as any[];
    const data = orders.map((o: any) => ({
      id: o.id, orderNumber: o.orderNumber, email: o.email, total: Number(o.total ?? 0),
      status: o.status, items: typeof o.items === "string" ? JSON.parse(o.items).length : (Array.isArray(o.items) ? o.items.length : 0),
      createdAt: o.createdAt,
    }));
    return await reply.send({ success: true, data });
  });

  // ── [PLUGIN: SEO] Meta Tags CRUD ──
  server.get("/api/v1/seo/meta", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const { resourceType, resourceId } = request.query as { resourceType?: string; resourceId?: string };
    try {
      const id = `${resourceType ?? "product"}_${resourceId ?? ""}`;
      const meta = await (prisma as any).seoMeta.findUnique({ where: { id } });
      return await reply.send({ success: true, data: meta });
    } catch {
      return await reply.send({ success: true, data: null });
    }
  });

  server.post("/api/v1/seo/meta", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply, prisma);
    const { resourceType, resourceId, title, description, keywords, ogTitle, ogDescription, ogImage, noIndex, focusKeyword } = request.body as Record<string, unknown>;
    if (!resourceType || !resourceId) return await reply.status(400).send({ code: "MISSING_FIELDS", message: "resourceType and resourceId required" });
    try {
      const id = `${resourceType}_${resourceId}`;
      const fo = typeof focusKeyword === "string" ? focusKeyword : null;
      await (prisma as any).seoMeta.upsert({
        where: { id },
        create: { id, resourceType, resourceId, title, description, keywords, ogTitle, ogDescription, ogImage, noIndex: !!noIndex, focusKeyword: fo },
        update: { title, description, keywords, ogTitle, ogDescription, ogImage, noIndex: !!noIndex, focusKeyword: fo },
      });
      return await reply.send({ success: true, message: "SEO meta saved" });
    } catch (e: any) {
      return await reply.status(500).send({ code: "DB_ERROR", message: e?.message ?? "Failed to save meta" });
    }
  });
}
