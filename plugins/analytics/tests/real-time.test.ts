import { describe, it, expect } from "vitest";

interface RealtimeEvent { type: string; data: Record<string,unknown>; timestamp: string; }

describe("Analytics Real-time Events", () => {
  const events: RealtimeEvent[] = [];

  function pushEvent(type: string, data: Record<string,unknown>): void {
    events.push({ type, data, timestamp: new Date().toISOString() });
  }

  it("should push real-time event", () => {
    pushEvent("page_view", { url: "/home" });
    expect(events.length).toBe(1);
    expect(events[0]!.type).toBe("page_view");
  });

  it("should push multiple events in order", () => {
    events.length = 0;
    pushEvent("click", { button: "signup" });
    pushEvent("scroll", { depth: 75 });
    expect(events.length).toBe(2);
    expect(events[0]!.type).toBe("click");
    expect(events[1]!.type).toBe("scroll");
  });
});
