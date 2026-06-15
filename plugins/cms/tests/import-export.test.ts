import { describe, it, expect } from "vitest";
interface Entry { id: string; title: string; status: string; }
describe("CMS Import/Export", () => {
  const entries: Entry[] = [{id:"1",title:"Post A",status:"published"},{id:"2",title:"Post B",status:"draft"}];
  function exportJSON(items: Entry[]): string { return JSON.stringify(items); }
  function importJSON(json: string): Entry[] { return JSON.parse(json) as Entry[]; }
  it("should export to JSON", () => { const json = exportJSON(entries); expect(json).toContain("Post A"); });
  it("should import from JSON", () => { const imported = importJSON(exportJSON(entries)); expect(imported.length).toBe(2); });
});
