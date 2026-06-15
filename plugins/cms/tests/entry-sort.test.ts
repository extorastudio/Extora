import { describe, it, expect } from "vitest";

interface Entry { id: string; title: string; status: string; createdAt: string; updatedAt: string; }

describe("Entry Sorting & Pagination", () => {
  const entries: Entry[] = [
    { id: "1", title: "C", status: "published", createdAt: "2026-03-01", updatedAt: "2026-03-10" },
    { id: "2", title: "A", status: "draft", createdAt: "2026-01-01", updatedAt: "2026-02-01" },
    { id: "3", title: "B", status: "published", createdAt: "2026-02-01", updatedAt: "2026-03-05" },
  ];

  it("should sort by title ascending", () => {
    const sorted = [...entries].sort((a, b) => a.title.localeCompare(b.title));
    expect(sorted.map(e => e.title)).toEqual(["A", "B", "C"]);
  });

  it("should sort by createdAt descending", () => {
    const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    expect(sorted[0]!.id).toBe("1");
  });

  it("should filter by multiple statuses", () => {
    const filtered = entries.filter(e => e.status === "published" || e.status === "draft");
    expect(filtered.length).toBe(3);
  });

  it("should paginate page 2", () => {
    const page = 2; const limit = 2;
    const result = entries.slice((page-1)*limit, page*limit);
    expect(result.length).toBe(1);
    expect(result[0]!.id).toBe("3");
  });
});
