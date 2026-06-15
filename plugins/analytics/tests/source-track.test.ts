import { describe, it, expect } from "vitest";
interface Visit { source: string; url: string; }
describe("Analytics Source Tracking", () => {
  const visits: Visit[] = [{source:"google",url:"/home"},{source:"direct",url:"/home"},{source:"twitter",url:"/products"},{source:"google",url:"/about"}];
  function bySource(source: string): Visit[] { return visits.filter(v=>v.source===source); }
  it("should count google referrals", () => { expect(bySource("google").length).toBe(2); });
  it("should count direct traffic", () => { expect(bySource("direct").length).toBe(1); });
});
