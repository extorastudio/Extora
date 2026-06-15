import { describe, it, expect } from "vitest";
interface Variant { name: string; views: number; conversions: number; }
describe("Forms A/B Testing", () => {
  const variants: Variant[] = [{name:"A",views:1000,conversions:50},{name:"B",views:1000,conversions:75}];
  function rate(v: Variant): number { return v.views>0?Math.round(v.conversions/v.views*10000)/100:0; }
  function winner(): string { return variants.sort((a,b)=>rate(b)-rate(a))[0]!.name; }
  it("should calculate conversion rates", () => { expect(rate(variants[0]!)).toBe(5); expect(rate(variants[1]!)).toBe(7.5); });
  it("should find winning variant", () => { expect(winner()).toBe("B"); });
});
