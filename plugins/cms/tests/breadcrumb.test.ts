import { describe, it, expect } from "vitest";
interface Crumb { label: string; url: string; }
describe("CMS Breadcrumb Builder", () => {
  function build(path: string): Crumb[] {
    const parts = path.split("/").filter(Boolean);
    return [{label:"Home",url:"/"},...parts.map((p,i)=>({label:p.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase()),url:"/"+parts.slice(0,i+1).join("/")}))];
  }
  it("should build breadcrumb from path", () => { const bc = build("/blog/tech/extora"); expect(bc.length).toBe(4); expect(bc[3]!.label).toBe("Extora"); });
  it("should have home as first crumb", () => { expect(build("/about")[0]!.label).toBe("Home"); });
});
