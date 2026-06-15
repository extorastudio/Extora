import { describe, it, expect } from "vitest";
interface GeoVisit { country: string; city: string; views: number; }
describe("Analytics Geo Location", () => {
  const visits: GeoVisit[] = [{country:"US",city:"NYC",views:100},{country:"US",city:"LA",views:50},{country:"UK",city:"London",views:75}];
  function byCountry(c: string): number { return visits.filter(v=>v.country===c).reduce((s,v)=>s+v.views,0); }
  it("should count US views", () => { expect(byCountry("US")).toBe(150); });
  it("should count UK views", () => { expect(byCountry("UK")).toBe(75); });
});
