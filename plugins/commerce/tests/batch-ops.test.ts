import { describe, it, expect } from "vitest";

interface Order { id: string; status: string; total: number; }

describe("Commerce Batch Operations", () => {
  const orders: Order[] = [
    { id: "1", status: "pending", total: 100 },
    { id: "2", status: "confirmed", total: 200 },
    { id: "3", status: "processing", total: 300 },
    { id: "4", status: "shipped", total: 400 },
  ];

  function batchUpdateStatus(ids: string[], status: string): number {
    let c = 0;
    for (const o of orders) { if (ids.includes(o.id)) { o.status = status; c++; } }
    return c;
  }

  function getRevenueByStatus(filter: string[]): number {
    return orders.filter(o => filter.includes(o.status)).reduce((s, o) => s + o.total, 0);
  }

  it("should batch update order statuses", () => {
    const c = batchUpdateStatus(["1", "2", "3"], "cancelled");
    expect(c).toBe(3);
    expect(orders[0]!.status).toBe("cancelled");
  });

  it("should calculate revenue by status", () => {
    const revenue = getRevenueByStatus(["shipped"]);
    expect(revenue).toBe(400);
  });

  it("should calculate multi-status revenue", () => {
    const revenue = getRevenueByStatus(["shipped", "processing"]);
    expect(revenue).toBe(700);
  });
});
