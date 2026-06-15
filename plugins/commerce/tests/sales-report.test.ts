import { describe, it, expect } from "vitest";
interface Order { id: string; total: number; status: string; createdAt: string; }
describe("Sales Report", () => {
  const orders: Order[] = [
    { id:"o1", total:100, status:"completed", createdAt:"2026-01-01" },
    { id:"o2", total:200, status:"completed", createdAt:"2026-02-01" },
    { id:"o3", total:50, status:"cancelled", createdAt:"2026-03-01" },
  ];
  function report(month: string): { revenue: number; count: number } {
    const filtered = orders.filter(o => o.status === "completed" && o.createdAt.startsWith(month));
    return { revenue: filtered.reduce((s,o)=>s+o.total,0), count: filtered.length };
  }
  it("should report monthly revenue", () => { expect(report("2026-01").revenue).toBe(100); });
  it("should count completed orders", () => { expect(report("2026-02").count).toBe(1); });
  it("should exclude cancelled", () => { expect(report("2026-03").count).toBe(0); });
});
