import { describe, it, expect } from "vitest";
interface Zone { id: string; name: string; countries: string[]; rate: number; }
describe("Shipping Zones", () => {
  const zones: Zone[] = [{id:"z1",name:"US Domestic",countries:["US"],rate:5.99},{id:"z2",name:"EU",countries:["DE","FR","IT"],rate:15.99}];
  function findZone(country: string): Zone|undefined { return zones.find(z=>z.countries.includes(country)); }
  it("should find US zone", () => { expect(findZone("US")?.rate).toBe(5.99); });
  it("should find EU zone for Germany", () => { expect(findZone("DE")?.rate).toBe(15.99); });
  it("should return undefined for uncovered", () => { expect(findZone("JP")).toBeUndefined(); });
});
