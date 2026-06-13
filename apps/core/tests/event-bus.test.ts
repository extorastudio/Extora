import { describe, it, expect } from "vitest";
import { CoreEventBus } from "../src/event-bus/bus.js";
import type { PrismaClient } from "@prisma/client";

const mockPrisma = {
  event: {
    create: async () => {},
    findMany: async () => [],
  },
} as unknown as PrismaClient;

describe("CoreEventBus", () => {
  it("should subscribe and publish events", async () => {
    const bus = new CoreEventBus(mockPrisma);
    const received: unknown[] = [];

    bus.subscribe("test.event", async (payload: unknown) => {
      received.push(payload);
    });

    await bus.publish("test.event", { message: "hello" });
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ message: "hello" });
  });

  it("should handle multiple subscribers for the same event", async () => {
    const bus = new CoreEventBus(mockPrisma);
    const received: unknown[] = [];

    bus.subscribe("test.multi", async (p: unknown) => { received.push(`a:${(p as Record<string, unknown>).msg}`); });
    bus.subscribe("test.multi", async (p: unknown) => { received.push(`b:${(p as Record<string, unknown>).msg}`); });

    await bus.publish("test.multi", { msg: "hi" });
    expect(received).toHaveLength(2);
  });

  it("should execute subscribers in priority order", async () => {
    const bus = new CoreEventBus(mockPrisma);
    const order: number[] = [];

    bus.subscribe("test.order", async () => { order.push(2); }, "test", 20);
    bus.subscribe("test.order", async () => { order.push(1); }, "test", 10);
    bus.subscribe("test.order", async () => { order.push(3); }, "test", 30);

    await bus.publish("test.order", {});
    expect(order).toEqual([1, 2, 3]);
  });

  it("should return 0 subscribers for unknown event", () => {
    const bus = new CoreEventBus(mockPrisma);
    expect(bus.getSubscriberCount("nonexistent")).toBe(0);
  });

  it("should unsubscribe handlers", async () => {
    const bus = new CoreEventBus(mockPrisma);
    const received: unknown[] = [];
    const handler = async (p: unknown) => { received.push(p); };

    bus.subscribe("test.unsub", handler);
    bus.unsubscribe("test.unsub", handler);

    await bus.publish("test.unsub", { msg: "no" });
    expect(received).toHaveLength(0);
  });

  it("should list all event types", () => {
    const bus = new CoreEventBus(mockPrisma);
    bus.subscribe("a.event", async () => {});
    bus.subscribe("b.event", async () => {});
    bus.subscribe("a.event", async () => {});

    const types = bus.getAllEventTypes();
    expect(types).toContain("a.event");
    expect(types).toContain("b.event");
    expect(types).toHaveLength(2);
  });
});
