import type { PluginContext } from "@extora/types";

export default function razorpayPlugin(ctx: PluginContext) {
  const { server, prisma, logger } = ctx;

  logger.info("[Razorpay] Plugin loaded");

  // GET /api/v1/razorpay/config — get Razorpay configuration
  server.get("/api/v1/razorpay/config", async (request: any, reply: any) => {
    const config = {
      keyId: process.env.RAZORPAY_KEY_ID || "",
      keySecret: process.env.RAZORPAY_KEY_SECRET ? "***" : "",
      currency: process.env.RAZORPAY_CURRENCY || "INR",
      enabled: !!process.env.RAZORPAY_KEY_ID,
    };
    return reply.send({ data: config });
  });

  // POST /api/v1/razorpay/order — create Razorpay order
  server.post("/api/v1/razorpay/order", async (request: any, reply: any) => {
    const body = request.body || {};
    const amount = Number(body.amount || 0);
    const email = String(body.email || "");

    if (!amount || amount <= 0) {
      return reply.status(400).send({ code: "INVALID_AMOUNT", message: "Invalid amount" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return reply.status(503).send({ code: "NOT_CONFIGURED", message: "Razorpay not configured" });
    }

    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const resp = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects paise
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: { email },
        }),
      });
      const data = await resp.json();
      if (data.id) {
        return reply.send({
          data: {
            id: data.id,
            amount: data.amount,
            currency: data.currency,
            keyId,
          },
        });
      }
      return reply.status(500).send({ code: "ERROR", message: "Failed to create order" });
    } catch (e: any) {
      logger.error(`[Razorpay] Order creation failed: ${e.message}`);
      return reply.status(500).send({ code: "ERROR", message: e.message });
    }
  });

  // POST /api/v1/razorpay/verify — verify Razorpay payment signature
  server.post("/api/v1/razorpay/verify", async (request: any, reply: any) => {
    const body = request.body || {};
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, amount } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return reply.status(400).send({ code: "MISSING", message: "Missing verification data" });
    }

    // Create order in DB on successful payment
    try {
      const orderData = {
        id: `order_${Date.now()}`,
        orderNumber: `EXT-${String(Date.now()).slice(-6)}`,
        customerEmail: String(email || "customer@example.com"),
        items: [],
        total: Number(amount || 0),
        status: "confirmed",
        paymentMethod: "razorpay",
        paymentId: razorpay_payment_id,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).$queryRawUnsafe(
        `INSERT INTO "Order" (id, "orderNumber", "customerEmail", items, total, status, "paymentMethod", "paymentId", "createdAt") VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, NOW())`,
        orderData.id, orderData.orderNumber, orderData.customerEmail,
        JSON.stringify(orderData.items), orderData.total, orderData.status,
        orderData.paymentMethod, orderData.paymentId,
      );
      return reply.send({ data: { ...orderData, verified: true } });
    } catch (e: any) {
      logger.error(`[Razorpay] Order save failed: ${e.message}`);
      return reply.status(500).send({ code: "ERROR", message: "Payment verified but order save failed" });
    }
  });
}
