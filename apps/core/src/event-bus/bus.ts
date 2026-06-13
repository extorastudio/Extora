import type { EventPayload, EventBus, EventStore } from "@extora/types";
import type { PrismaClient } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Prisma } from "@prisma/client";

type EventHandler = (payload: unknown) => Promise<void>;

interface Subscription {
  handler: EventHandler;
  source?: string;
  priority: number;
}

export class CoreEventBus implements EventBus {
  private subscribers = new Map<string, Subscription[]>();
  private readonly eventStore: CoreEventStore;

  constructor(prisma: PrismaClient) {
    this.eventStore = new CoreEventStore(prisma);
  }

  async publish(type: string, payload: unknown, source?: string): Promise<void> {
    const event: EventPayload = {
      type,
      payload,
      source,
      timestamp: new Date(),
    };

    this.eventStore.append(event).catch((err: unknown) => {
      console.error(`Failed to persist event "${type}":`, err);
    });

    const subs = this.subscribers.get(type);
    if (!subs || subs.length === 0) return;

    const sorted = [...subs].sort((a, b) => a.priority - b.priority);

    await Promise.allSettled(
      sorted.map((sub) =>
        sub.handler(payload).catch((err: unknown) => {
          console.error(`Event handler for "${type}" (source: ${sub.source ?? "unknown"}) failed:`, err);
        }),
      ),
    );
  }

  subscribe(
    type: string,
    handler: EventHandler,
    source?: string,
    priority = 10,
  ): void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.subscribers.get(type)!.push({ handler, source, priority });
  }

  unsubscribe(type: string, handler: EventHandler): void {
    const subs = this.subscribers.get(type);
    if (!subs) return;
    this.subscribers.set(
      type,
      subs.filter((s) => s.handler !== handler),
    );
  }

  getSubscriberCount(type: string): number {
    return this.subscribers.get(type)?.length ?? 0;
  }

  getAllEventTypes(): string[] {
    return Array.from(this.subscribers.keys());
  }

  async getEventHistory(
    type?: string,
    from?: Date,
    limit = 100,
  ): Promise<EventPayload[]> {
    return this.eventStore.getEvents(type, from, undefined, limit);
  }
}

class CoreEventStore implements EventStore {
  constructor(private readonly prisma: PrismaClient) {}

  async append(event: EventPayload): Promise<void> {
    await this.prisma.event.create({
      data: {
        type: event.type,
        payload: event.payload as Prisma.InputJsonValue,
        source: event.source,
        createdAt: event.timestamp,
      },
    });
  }

  async getEvents(
    type?: string,
    from?: Date,
    to?: Date,
    limit = 100,
  ): Promise<EventPayload[]> {
    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const createdAt: Record<string, Date> = {};
    if (from) createdAt.gte = from;
    if (to) createdAt.lte = to;
    if (Object.keys(createdAt).length > 0) where.createdAt = createdAt;

    const rows = await this.prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map((row: Record<string, unknown>) => ({
      type: row.type as string,
      payload: row.payload,
      source: (row.source ?? undefined) as string | undefined,
      timestamp: row.createdAt as Date,
    }));
  }
}
