import { describe, it, expect } from "vitest";

interface AnalyticsEvent {
  id: string;
  eventType: string;
  pageUrl?: string;
  visitorId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

describe("Analytics Event Tracking", () => {
  const events: AnalyticsEvent[] = [];

  function track(event: Omit<AnalyticsEvent, "id" | "createdAt">): AnalyticsEvent {
    const tracked: AnalyticsEvent = {
      id: `event_${Date.now()}`,
      ...event,
      createdAt: new Date().toISOString(),
    };
    events.push(tracked);
    return tracked;
  }

  beforeEach(() => {
    events.length = 0;
  });

  it("should track page view events", () => {
    const event = track({
      eventType: "page_view",
      pageUrl: "/products",
      visitorId: "visitor_123",
      metadata: { referrer: "google.com" },
    });

    expect(events.length).toBe(1);
    expect(event.eventType).toBe("page_view");
    expect(event.pageUrl).toBe("/products");
  });

  it("should track custom events", () => {
    track({
      eventType: "button_click",
      metadata: { buttonId: "signup", page: "/home" },
    });

    expect(events.length).toBe(1);
    expect(events[0]!.eventType).toBe("button_click");
  });

  it("should track ecommerce events", () => {
    track({
      eventType: "purchase",
      visitorId: "visitor_456",
      metadata: {
        orderId: "EXT-0001",
        total: 99.99,
        currency: "USD",
        products: ["W-001", "W-002"],
      },
    });

    expect(events[0]!.eventType).toBe("purchase");
    const meta = events[0]!.metadata;
    expect(meta.orderId).toBe("EXT-0001");
    expect(meta.total).toBe(99.99);
  });

  it("should query events by type", () => {
    track({ eventType: "page_view", metadata: {} });
    track({ eventType: "page_view", metadata: {} });
    track({ eventType: "click", metadata: {} });

    const pageViews = events.filter((e) => e.eventType === "page_view");
    expect(pageViews.length).toBe(2);
  });

  it("should query events by visitor", () => {
    track({ eventType: "page_view", visitorId: "v1", metadata: {} });
    track({ eventType: "click", visitorId: "v1", metadata: {} });
    track({ eventType: "page_view", visitorId: "v2", metadata: {} });

    const v1Events = events.filter((e) => e.visitorId === "v1");
    expect(v1Events.length).toBe(2);
  });

  it("should calculate event counts", () => {
    track({ eventType: "page_view", metadata: {} });
    track({ eventType: "page_view", metadata: {} });
    track({ eventType: "click", metadata: {} });
    track({ eventType: "purchase", metadata: {} });

    const counts = new Map<string, number>();
    for (const event of events) {
      counts.set(event.eventType, (counts.get(event.eventType) ?? 0) + 1);
    }

    expect(counts.get("page_view")).toBe(2);
    expect(counts.get("click")).toBe(1);
    expect(counts.get("purchase")).toBe(1);
  });
});
