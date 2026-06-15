import { describe, it, expect } from "vitest";

interface Revision { version: number; data: Record<string,unknown>; createdAt: string; }

function diffRevisions(r1: Revision, r2: Revision): Record<string, { before: unknown; after: unknown }> {
  const changes: Record<string, { before: unknown; after: unknown }> = {};
  const allKeys = new Set([...Object.keys(r1.data), ...Object.keys(r2.data)]);
  for (const key of allKeys) {
    if (JSON.stringify(r1.data[key]) !== JSON.stringify(r2.data[key])) {
      changes[key] = { before: r1.data[key], after: r2.data[key] };
    }
  }
  return changes;
}

describe("CMS Revision Diff", () => {
  const rev1: Revision = { version: 1, data: { title: "Hello", body: "World", status: "draft" }, createdAt: "2026-01-01" };
  const rev2: Revision = { version: 2, data: { title: "Hello Updated", body: "World", status: "published" }, createdAt: "2026-02-01" };

  it("should detect changed fields", () => {
    const diff = diffRevisions(rev1, rev2);
    expect(Object.keys(diff)).toContain("title");
    expect(Object.keys(diff)).toContain("status");
  });

  it("should not flag unchanged fields", () => {
    const diff = diffRevisions(rev1, rev2);
    expect(Object.keys(diff)).not.toContain("body");
  });

  it("should show before/after values", () => {
    const diff = diffRevisions(rev1, rev2);
    expect(diff.title?.before).toBe("Hello");
    expect(diff.title?.after).toBe("Hello Updated");
  });
});
