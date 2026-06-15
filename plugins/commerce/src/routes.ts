import { createRouter } from "@extora/sdk/api";

function httpError(statusCode: number, message: string): Error {
  return Object.assign(new Error(message), { statusCode });
}

interface CartItem {
  variantId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  attributes: Record<string, string>;
}

interface CommerceCart {
  id: string;
  userId?: string;
  currency: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
}

interface CommerceOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  status: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  currency: string;
  shippingAddress?: Record<string, unknown>;
}

interface ApiReq { params: Record<string, string>; body: Record<string, unknown>; userId?: string }

// =========================================================================
// Product Routes
// =========================================================================

export function createProductRouter() {
  const products = new Map<string, unknown>();

  return createRouter("commerce")
    .get("/api/v1/commerce/products", async () => ({
      data: Array.from(products.values()),
    }))
    .get("/api/v1/commerce/products/:id", async (req) => {
      const id = (req as unknown as ApiReq).params.id ?? "";
      const product = products.get(id);
      if (!product) throw httpError(404, "Product not found");
      return { data: product };
    })
    .post("/api/v1/commerce/products", async (req) => {
      const body = (req as unknown as ApiReq).body as { id?: string; name: string };
      const id = body.id ?? `prod_${String(products.size + 1)}`;
      const product = { id, ...body, createdAt: new Date().toISOString() };
      products.set(id, product);
      return { data: product };
    });
}

// =========================================================================
// Cart Routes
// =========================================================================

const carts = new Map<string, CommerceCart>();

export function createCartRouter() {
  return createRouter("commerce")
    .get("/api/v1/commerce/cart", async (req) => {
      const userId = (req as unknown as ApiReq).userId ?? "anonymous";
      const cart = carts.get(userId);
      if (!cart) return { data: createEmptyCart() };
      return { data: cart };
    })
    .post("/api/v1/commerce/cart/items", async (req) => {
      const userId = (req as unknown as ApiReq).userId ?? "anonymous";
      const body = (req as unknown as ApiReq).body as unknown as { variantId: string; name: string; sku: string; quantity: number; unitPrice: number };

      let cart = carts.get(userId);
      if (!cart) {
        cart = createEmptyCart();
        carts.set(userId, cart);
      }

      const item: CartItem = {
        variantId: body.variantId,
        name: body.name,
        sku: body.sku,
        quantity: body.quantity,
        unitPrice: body.unitPrice,
        totalPrice: body.quantity * body.unitPrice,
        attributes: {},
      };

      cart.items.push(item);
      recalculateCart(cart);

      return { data: cart };
    })
    .delete("/api/v1/commerce/cart/items/:variantId", async (req) => {
      const userId = (req as unknown as ApiReq).userId ?? "anonymous";
      const cart = carts.get(userId);
      const variantId = (req as unknown as ApiReq).params.variantId ?? "";

      if (cart) {
        cart.items = cart.items.filter((item: CartItem) => item.variantId !== variantId);
        recalculateCart(cart);
      }

      return { data: cart ?? createEmptyCart() };
    });
}

// =========================================================================
// Order Routes
// =========================================================================

const orders = new Map<string, CommerceOrder>();
let orderSequence = 1000;

export function createOrderRouter() {
  return createRouter("commerce")
    .post("/api/v1/commerce/checkout", async (req) => {
      const userId = (req as unknown as ApiReq).userId ?? "anonymous";
      const cart = carts.get(userId);

      if (!cart || cart.items.length === 0) {
        throw httpError(400, "Cart is empty");
      }

      orderSequence++;
      const orderNumber = `EXT-${String(orderSequence)}`;
      const body = (req as unknown as ApiReq).body as unknown as { customerEmail: string; shippingAddress?: Record<string, unknown> };

      const order: CommerceOrder = {
        id: `order_${String(orderSequence)}`,
        orderNumber,
        userId: userId !== "anonymous" ? userId : undefined,
        customerEmail: body.customerEmail,
        status: "confirmed",
        items: [...cart.items],
        subtotal: cart.subtotal,
        discountTotal: cart.discountTotal,
        taxTotal: cart.taxTotal,
        shippingTotal: cart.shippingTotal,
        grandTotal: cart.grandTotal,
        currency: cart.currency,
        shippingAddress: body.shippingAddress,
      };

      orders.set(order.id, order);
      carts.delete(userId);

      return { data: order };
    })
    .get("/api/v1/commerce/orders", async () => ({
      data: Array.from(orders.values()),
    }))
    .get("/api/v1/commerce/orders/:id", async (req) => {
      const id = (req as unknown as ApiReq).params.id ?? "";
      const order = orders.get(id);
      if (!order) throw httpError(404, "Order not found");
      return { data: order };
    })
    .patch("/api/v1/commerce/orders/:id/status", async (req) => {
      const id = (req as unknown as ApiReq).params.id ?? "";
      const body = (req as unknown as ApiReq).body as unknown as { status: string };
      const order = orders.get(id);

      if (!order) throw httpError(404, "Order not found");

      const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
      if (!validStatuses.includes(body.status)) {
        throw httpError(400, `Invalid status: ${body.status}`);
      }

      order.status = body.status;
      return { data: order };
    });
}

function createEmptyCart(): CommerceCart {
  return {
    id: `cart_${String(Date.now())}`,
    currency: "USD",
    items: [],
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    shippingTotal: 0,
    grandTotal: 0,
  };
}

function recalculateCart(cart: CommerceCart): void {
  cart.subtotal = cart.items.reduce((sum: number, item: CartItem) => sum + item.totalPrice, 0);
  cart.grandTotal = cart.subtotal - cart.discountTotal + cart.taxTotal + cart.shippingTotal;
}
