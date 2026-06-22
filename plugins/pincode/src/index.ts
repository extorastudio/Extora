import type { PluginContext } from "@extora/types";

export default async function pincodePlugin(ctx: PluginContext) {
  const { server, prisma, logger } = ctx;

  logger.info("[Pincode] Plugin loaded");

  // Ensure DB table exists
  try {
    await (prisma as any).$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Pincode" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        pincode TEXT NOT NULL UNIQUE,
        city TEXT DEFAULT '',
        state TEXT DEFAULT '',
        isServiceable BOOLEAN DEFAULT true,
        deliveryDays INT DEFAULT 3,
        extraCharge FLOAT DEFAULT 0,
        codAvailable BOOLEAN DEFAULT true,
        prepaidAvailable BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    // Seed some metro pincodes
    await (prisma as any).$executeRawUnsafe(`
      INSERT INTO "Pincode" (pincode, city, state, isServiceable, deliveryDays, extraCharge, codAvailable)
      VALUES 
        ('110001', 'New Delhi', 'Delhi', true, 2, 0, true),
        ('400001', 'Mumbai', 'Maharashtra', true, 2, 0, true),
        ('700001', 'Kolkata', 'West Bengal', true, 3, 0, true),
        ('600001', 'Chennai', 'Tamil Nadu', true, 3, 0, true),
        ('560001', 'Bangalore', 'Karnataka', true, 2, 0, true),
        ('500001', 'Hyderabad', 'Telangana', true, 2, 0, true),
        ('380001', 'Ahmedabad', 'Gujarat', true, 2, 0, true),
        ('411001', 'Pune', 'Maharashtra', true, 2, 0, true),
        ('302001', 'Jaipur', 'Rajasthan', true, 3, 0, true),
        ('226001', 'Lucknow', 'Uttar Pradesh', true, 3, 0, true)
      ON CONFLICT (pincode) DO NOTHING
    `);
  } catch (e: any) {
    logger.warn(`[Pincode] DB setup: ${e.message}`);
  }

  // GET /api/v1/pincode/check?pincode=110001 — check if pincode is serviceable
  server.get("/api/v1/pincode/check", async (request: any, reply: any) => {
    const pincode = (request.query?.pincode || "").trim();
    if (!pincode || pincode.length !== 6) {
      return reply.send({ data: { serviceable: false, message: "Enter a valid 6-digit pincode" } });
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT * FROM "Pincode" WHERE pincode = $1 LIMIT 1`, pincode
      );
      if (rows.length && rows[0].isServiceable) {
        const r = rows[0];
        return reply.send({ data: {
          serviceable: true, pincode: r.pincode, city: r.city, state: r.state,
          deliveryDays: r.deliveryDays, extraCharge: r.extraCharge,
          codAvailable: r.codAvailable,
          message: `Delivery available to ${r.city}, ${r.state} in ${r.deliveryDays} days`,
        }});
      }
      return reply.send({ data: { serviceable: false, message: "Delivery not available to this pincode" } });
    } catch (e: any) {
      return reply.status(500).send({ code: "ERROR", message: e.message });
    }
  });

  // POST /api/v1/pincode — add/update pincode
  server.post("/api/v1/pincode", async (request: any, reply: any) => {
    const body = request.body || {};
    const pincode = String(body.pincode || "").trim();
    if (!pincode || pincode.length !== 6) {
      return reply.status(400).send({ code: "INVALID", message: "Valid 6-digit pincode required" });
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).$executeRawUnsafe(`
        INSERT INTO "Pincode" (pincode, city, state, "isServiceable", "deliveryDays", "extraCharge", "codAvailable", "prepaidAvailable")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (pincode) DO UPDATE SET city=$2, state=$3, "isServiceable"=$4, "deliveryDays"=$5, "extraCharge"=$6, "codAvailable"=$7, "prepaidAvailable"=$8
      `, pincode, String(body.city || ""), String(body.state || ""),
        body.isServiceable !== false, Number(body.deliveryDays || 3),
        Number(body.extraCharge || 0), body.codAvailable !== false,
        body.prepaidAvailable !== false);
      return reply.send({ data: { pincode, success: true } });
    } catch (e: any) {
      return reply.status(500).send({ code: "ERROR", message: e.message });
    }
  });

  // GET /api/v1/pincode — list all pincodes
  server.get("/api/v1/pincode", async (_request: any, reply: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await (prisma as any).$queryRawUnsafe(
      `SELECT * FROM "Pincode" ORDER BY pincode ASC`
    );
    return reply.send({ data: rows });
  });

  // DELETE /api/v1/pincode/:pincode
  server.delete("/api/v1/pincode/:pincode", async (request: any, reply: any) => {
    const pincode = request.params?.pincode;
    if (!pincode) return reply.status(400).send({ code: "MISSING", message: "Pincode required" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).$executeRawUnsafe(`DELETE FROM "Pincode" WHERE pincode = $1`, pincode);
    return reply.send({ data: { deleted: true } });
  });
}
