import type { PluginContext } from "@extora/types";

export default async function shippingPlugin(ctx: PluginContext) {
  const { server, prisma, logger } = ctx;

  logger.info("[Shipping] Plugin loaded");

  // Ensure DB table exists
  try {
    await (prisma as any).$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ShippingConfig" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'flat',
        baseCharge FLOAT DEFAULT 0,
        freeAbove FLOAT DEFAULT 499,
        perKgCharge FLOAT DEFAULT 0,
        extraChargeEnabled BOOLEAN DEFAULT false,
        extraChargePercent FLOAT DEFAULT 0,
        extraChargeFixed FLOAT DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        zones JSONB DEFAULT '[]',
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    // Seed default shipping config
    await (prisma as any).$executeRawUnsafe(`
      INSERT INTO "ShippingConfig" (name, type, "baseCharge", "freeAbove", "extraChargeEnabled")
      VALUES ('Standard Delivery', 'flat', 49, 499, false)
      ON CONFLICT DO NOTHING
    `);
  } catch (e: any) {
    logger.warn(`[Shipping] DB setup: ${e.message}`);
  }

  // GET /api/v1/shipping/config — get shipping configuration
  server.get("/api/v1/shipping/config", async (_request: any, reply: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "ShippingConfig" WHERE "isActive" = true ORDER BY "createdAt" DESC LIMIT 1`
    );
    return reply.send({ data: rows[0] || { baseCharge: 49, freeAbove: 499, extraChargeEnabled: false } });
  });

  // POST /api/v1/shipping/config — save shipping configuration
  server.post("/api/v1/shipping/config", async (request: any, reply: any) => {
    const body = request.body || {};
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).$executeRawUnsafe(`
        INSERT INTO "ShippingConfig" (name, type, "baseCharge", "freeAbove", "perKgCharge", "extraChargeEnabled", "extraChargePercent", "extraChargeFixed", zones)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      `, String(body.name || "Standard Delivery"), String(body.type || "flat"),
        Number(body.baseCharge ?? 49), Number(body.freeAbove ?? 499),
        Number(body.perKgCharge ?? 0), body.extraChargeEnabled === true,
        Number(body.extraChargePercent ?? 0), Number(body.extraChargeFixed ?? 0),
        JSON.stringify(body.zones || []));
      return reply.send({ data: { success: true } });
    } catch (e: any) {
      return reply.status(500).send({ code: "ERROR", message: e.message });
    }
  });

  // GET /api/v1/shipping/calculate?amount=1000&pincode=110001
  server.get("/api/v1/shipping/calculate", async (request: any, reply: any) => {
    const orderAmount = Number(request.query?.amount || 0);
    const pincode = (request.query?.pincode || "").trim();

    try {
      // Get shipping config
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configRows: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT * FROM "ShippingConfig" WHERE "isActive" = true ORDER BY "createdAt" DESC LIMIT 1`
      );
      const config = configRows[0] || { baseCharge: 49, freeAbove: 499, extraChargeEnabled: false, extraChargePercent: 0, extraChargeFixed: 0 };

      let charge = 0;
      if (orderAmount >= (config.freeAbove || 499)) {
        charge = 0;
      } else {
        charge = config.baseCharge || 49;
      }

      // Check pincode for extra charges
      let extraCharge = 0;
      if (pincode && pincode.length === 6) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pinRows: any[] = await (prisma as any).$queryRawUnsafe(
          `SELECT "extraCharge" FROM "Pincode" WHERE pincode = $1 AND "isServiceable" = true LIMIT 1`, pincode
        );
        if (pinRows.length && pinRows[0].extraCharge) {
          extraCharge = Number(pinRows[0].extraCharge);
        }
      }

      if (config.extraChargeEnabled && config.extraChargePercent > 0) {
        extraCharge += Math.round(orderAmount * config.extraChargePercent / 100);
      }
      if (config.extraChargeEnabled && config.extraChargeFixed > 0) {
        extraCharge += config.extraChargeFixed;
      }

      return reply.send({ data: {
        shippingCharge: charge,
        extraCharge: extraCharge,
        totalCharge: charge + extraCharge,
        freeShipping: charge === 0,
        message: charge === 0 ? "FREE Delivery" : `₹${charge} delivery charge`,
      }});
    } catch (e: any) {
      return reply.status(500).send({ code: "ERROR", message: e.message });
    }
  });
}
