import { describe, it, expect } from "vitest";

interface Entry {
  id: string; title: string; status: string;
  data: Record<string, unknown>; createdAt: string;
}

describe("Content Query & Filtering", () => {
  const entries: Entry[] = [
    { id: "1", title: "Post A", status: "published", data: { category: "tech" }, createdAt: "2026-01-01" },
    { id: "2", title: "Post B", status: "draft", data: { category: "life" }, createdAt: "2026-02-01" },
    { id: "3", title: "Post C", status: "published", data: { category: "tech" }, createdAt: "2026-03-01" },
    { id: "4", title: "Post D", status: "archived", data: { category: "news" }, createdAt: "2026-04-01" },
    { id: "5", title: "Post E", status: "published", data: { category: "tech" }, createdAt: "2026-05-01" },
  ];

  it("should filter by status", () => {
    const published = entries.filter(e => e.status === "published");
    expect(published.length).toBe(3);
  });

  it("should filter by data field", () => {
    const tech = entries.filter(e => e.data.category === "tech");
    expect(tech.length).toBe(3);
  });

  it("should sort by date ascending", () => {
    const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    expect(sorted[0]!.title).toBe("Post A");
    expect(sorted[4]!.title).toBe("Post E");
  });

  it("should sort by date descending", () => {
    const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    expect(sorted[0]!.title).toBe("Post E");
  });

  it("should paginate results", () => {
    const page = 1;
    const limit = 2;
    const pageEntries = entries.slice((page - 1) * limit, page * limit);
    expect(pageEntries.length).toBe(2);
    expect(pageEntries[0]!.title).toBe("Post A");
    expect(pageEntries[1]!.title).toBe("Post B");
  });

  it("should count by status", () => {
    const counts = new Map<string, number>();
    for (const e of entries) {
      counts.set(e.status, (counts.get(e.status) ?? 0) + 1);
    }
    expect(counts.get("published")).toBe(3);
    expect(counts.get("draft")).toBe(1);
    expect(counts.get("archived")).toBe(1);
  });
});
