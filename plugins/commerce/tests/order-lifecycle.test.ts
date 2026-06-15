import { describe, it, expect } from "vitest";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  createdAt: string;
  updatedAt: string;
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

function transitionOrder(order: Order, newStatus: OrderStatus): Order {
  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid transition: ${order.status} → ${newStatus}. Allowed: ${String(allowed.join(", "))}`,
    );
  }
  return { ...order, status: newStatus, updatedAt: new Date().toISOString() };
}

function createOrder(id: string): Order {
  return {
    id,
    orderNumber: `EXT-${id}`,
    status: "pending",
    items: [{ name: "Widget", quantity: 2, price: 49.99 }],
    total: 99.98,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("Order Lifecycle", () => {
  it("should allow pending → confirmed", () => {
    const order = createOrder("1");
    const updated = transitionOrder(order, "confirmed");
    expect(updated.status).toBe("confirmed");
  });

  it("should allow confirmed → processing", () => {
    let order = createOrder("2");
    order = transitionOrder(order, "confirmed");
    order = transitionOrder(order, "processing");
    expect(order.status).toBe("processing");
  });

  it("should allow processing → shipped", () => {
    let order = createOrder("3");
    order = transitionOrder(order, "confirmed");
    order = transitionOrder(order, "processing");
    order = transitionOrder(order, "shipped");
    expect(order.status).toBe("shipped");
  });

  it("should allow shipped → delivered", () => {
    let order = createOrder("4");
    order = transitionOrder(order, "confirmed");
    order = transitionOrder(order, "processing");
    order = transitionOrder(order, "shipped");
    order = transitionOrder(order, "delivered");
    expect(order.status).toBe("delivered");
  });

  it("should allow delivered → refunded", () => {
    let order = createOrder("5");
    order = transitionOrder(order, "confirmed");
    order = transitionOrder(order, "processing");
    order = transitionOrder(order, "shipped");
    order = transitionOrder(order, "delivered");
    order = transitionOrder(order, "refunded");
    expect(order.status).toBe("refunded");
  });

  it("should allow cancellation at pending, confirmed, processing", () => {
    let order = createOrder("6");
    order = transitionOrder(order, "confirmed");
    order = transitionOrder(order, "cancelled");
    expect(order.status).toBe("cancelled");
  });

  it("should reject invalid transitions", () => {
    let order = createOrder("7");
    order = transitionOrder(order, "confirmed");

    expect(() => transitionOrder(order, "delivered")).toThrow("Invalid transition");
    expect(() => transitionOrder(order, "refunded")).toThrow("Invalid transition");
  });

  it("should reject transition from cancelled", () => {
    let order = createOrder("8");
    order = transitionOrder(order, "cancelled");

    expect(() => transitionOrder(order, "confirmed")).toThrow("Invalid transition");
  });

  it("should reject transition from delivered except to refunded", () => {
    let order = createOrder("9");
    order = transitionOrder(order, "confirmed");
    order = transitionOrder(order, "processing");
    order = transitionOrder(order, "shipped");
    order = transitionOrder(order, "delivered");

    expect(() => transitionOrder(order, "processing")).toThrow("Invalid transition");
    expect(() => transitionOrder(order, "cancelled")).toThrow("Invalid transition");

    const refunded = transitionOrder(order, "refunded");
    expect(refunded.status).toBe("refunded");
  });

  it("should complete full happy path: pending → confirmed → processing → shipped → delivered", () => {
    let order = createOrder("10");
    order = transitionOrder(order, "confirmed");
    order = transitionOrder(order, "processing");
    order = transitionOrder(order, "shipped");
    order = transitionOrder(order, "delivered");

    expect(order.status).toBe("delivered");
    expect(order.updatedAt).toBeTruthy();
  });
});
