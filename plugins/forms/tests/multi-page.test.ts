import { describe, it, expect } from "vitest";
interface FormPage { name: string; fields: string[]; }
describe("Multi-Page Forms", () => {
  const pages: FormPage[] = [{name:"Page 1",fields:["name","email"]},{name:"Page 2",fields:["address","phone"]},{name:"Page 3",fields:["message"]}];
  function getCurrentPage(pageIdx: number): FormPage|undefined { return pages[pageIdx]; }
  function isLastPage(idx: number): boolean { return idx === pages.length - 1; }
  it("should navigate pages", () => { expect(getCurrentPage(0)?.name).toBe("Page 1"); expect(getCurrentPage(2)?.name).toBe("Page 3"); });
  it("should detect last page", () => { expect(isLastPage(0)).toBe(false); expect(isLastPage(2)).toBe(true); });
  it("should collect all fields across pages", () => { const all = pages.flatMap(p=>p.fields); expect(all.length).toBe(5); });
});
