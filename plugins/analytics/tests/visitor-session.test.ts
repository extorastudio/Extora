import { describe, it, expect } from "vitest";

interface VisitorSession {
  visitorId: string; firstSeen: string; lastSeen: string; pageViews: number; events: number;
}

describe("Analytics Visitor Sessions", () => {
  const sessions = new Map<string, VisitorSession>();

  function trackVisit(visitorId: string, pageUrl: string): void {
    const now = new Date().toISOString();
    const existing = sessions.get(visitorId);
    if (existing) {
      existing.lastSeen = now;
      existing.pageViews += 1;
    } else {
      sessions.set(visitorId, { visitorId, firstSeen: now, lastSeen: now, pageViews: 1, events: 0 });
    }
  }

  it("should track new visitor", () => {
    trackVisit("v1", "/home");
    const s = sessions.get("v1");
    expect(s?.pageViews).toBe(1);
    expect(s?.firstSeen).toBe(s?.lastSeen);
  });

  it("should track returning visitor", () => {
    trackVisit("v2", "/home");
    trackVisit("v2", "/products");
    const s = sessions.get("v2");
    expect(s?.pageViews).toBe(2);
  });

  it("should count unique visitors", () => {
    trackVisit("v3", "/");
    trackVisit("v4", "/");
    trackVisit("v5", "/");
    expect(sessions.size).toBeGreaterThanOrEqual(3);
  });
});
