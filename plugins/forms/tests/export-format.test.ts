import { describe, it, expect } from "vitest";

interface Submission { id: string; data: Record<string, unknown>; createdAt: string; }

function exportCSV(submissions: Submission[]): string {
  if (submissions.length === 0) return "";
  const keys = Object.keys(submissions[0]!.data);
  const header = keys.join(",");
  const rows = submissions.map(s => keys.map(k => JSON.stringify(s.data[k] ?? "")).join(","));
  return [header, ...rows].join("\n");
}

function exportJSON(submissions: Submission[]): string {
  return JSON.stringify(submissions.map(s => ({ id: s.id, ...s.data, submittedAt: s.createdAt })));
}

describe("Forms Export", () => {
  const subs: Submission[] = [
    { id: "1", data: { name: "Alice", email: "a@b.com" }, createdAt: "2026-01-01" },
    { id: "2", data: { name: "Bob", email: "b@c.com" }, createdAt: "2026-02-01" },
  ];

  it("should export as CSV", () => {
    const csv = exportCSV(subs);
    expect(csv).toContain("name,email");
    expect(csv).toContain("Alice");
  });

  it("should export as JSON", () => {
    const json = exportJSON(subs);
    const parsed = JSON.parse(json) as unknown[];
    expect(parsed.length).toBe(2);
    expect((parsed[0] as Record<string,unknown>).name).toBe("Alice");
  });

  it("should handle empty submissions", () => {
    expect(exportCSV([])).toBe("");
    expect(exportJSON([])).toBe("[]");
  });
});
