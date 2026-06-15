import { describe, it, expect } from "vitest";
interface Submission { id: string; createdAt: string; isSpam: boolean; }
describe("Forms Stats", () => {
  const subs: Submission[] = [{id:"1",createdAt:"2026-01-01",isSpam:false},{id:"2",createdAt:"2026-01-02",isSpam:true},{id:"3",createdAt:"2026-02-01",isSpam:false}];
  function statsByMonth(): Map<string,{total:number,spam:number}> { const m = new Map<string,{total:number,spam:number}>(); for(const s of subs){const key=s.createdAt.slice(0,7); const e=m.get(key)??{total:0,spam:0}; e.total++; if(s.isSpam)e.spam++; m.set(key,e);} return m; }
  it("should count by month", () => { const s = statsByMonth(); expect(s.get("2026-01")?.total).toBe(2); expect(s.get("2026-02")?.total).toBe(1); });
});
