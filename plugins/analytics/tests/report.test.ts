import { describe, it, expect } from "vitest";

interface PageView { pageUrl: string; visitorId: string; timestamp: string; }
interface Report { totalVisitors: number; totalPageViews: number; topPages: Array<{url:string;views:number}>; }

function generateReport(events: PageView[]): Report {
  const visitors = new Set(events.map(e => e.visitorId));
  const pageCounts = new Map<string, number>();
  for (const e of events) {
    pageCounts.set(e.pageUrl, (pageCounts.get(e.pageUrl) ?? 0) + 1);
  }
  const topPages = Array.from(pageCounts.entries())
    .map(([url, views]) => ({ url, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return { totalVisitors: visitors.size, totalPageViews: events.length, topPages };
}

describe("Analytics Report", () => {
  const events: PageView[] = [
    { pageUrl: "/home", visitorId: "v1", timestamp: "2026-01-01" },
    { pageUrl: "/products", visitorId: "v1", timestamp: "2026-01-01" },
    { pageUrl: "/home", visitorId: "v2", timestamp: "2026-01-02" },
    { pageUrl: "/home", visitorId: "v3", timestamp: "2026-01-02" },
    { pageUrl: "/about", visitorId: "v2", timestamp: "2026-01-02" },
  ];

  it("should count unique visitors", () => {
    const report = generateReport(events);
    expect(report.totalVisitors).toBe(3);
  });

  it("should count total page views", () => {
    const report = generateReport(events);
    expect(report.totalPageViews).toBe(5);
  });

  it("should find top pages", () => {
    const report = generateReport(events);
    expect(report.topPages[0]!.url).toBe("/home");
    expect(report.topPages[0]!.views).toBe(3);
  });

  it("should handle empty events", () => {
    const report = generateReport([]);
    expect(report.totalVisitors).toBe(0);
    expect(report.topPages.length).toBe(0);
  });
});
