import { describe, it, expect } from "vitest";
describe("Forms Pagination", () => {
  function paginate(items: unknown[], page: number, limit: number): { data: unknown[]; hasMore: boolean } {
    const start = (page-1)*limit;
    return { data: items.slice(start, start+limit), hasMore: start+limit < items.length };
  }
  const subs = Array.from({length: 25}, (_, i) => ({ id: `s${i+1}`}));
  it("should return first page", () => { const r = paginate(subs, 1, 10); expect(r.data.length).toBe(10); expect(r.hasMore).toBe(true); });
  it("should return last page", () => { const r = paginate(subs, 3, 10); expect(r.data.length).toBe(5); expect(r.hasMore).toBe(false); });
});
