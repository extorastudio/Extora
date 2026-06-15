import { describe, it, expect } from "vitest";
interface DailyRevenue { date: string; total: number; orders: number; }
describe("Revenue Chart", () => {
  const data: DailyRevenue[] = [{date:"2026-01-01",total:500,orders:5},{date:"2026-01-02",total:1200,orders:10},{date:"2026-01-03",total:300,orders:2}];
  function totalRevenue(): number { return data.reduce((s,d)=>s+d.total,0); }
  function avgOrderValue(): number { const t = data.reduce((s,d)=>s+d.total,0); const o = data.reduce((s,d)=>s+d.orders,0); return o>0?Math.round(t/o*100)/100:0; }
  it("should sum total revenue", () => { expect(totalRevenue()).toBe(2000); });
  it("should calculate avg order value", () => { expect(avgOrderValue()).toBeCloseTo(117.65,1); });
});
