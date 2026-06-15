import { describe, it, expect } from "vitest";
interface Entry { id: string; title: string; body: string; tags: string[]; }
describe("CMS Content Search", () => {
  const entries: Entry[] = [{id:"1",title:"Hello World",body:"Welcome to my blog",tags:["intro"]},{id:"2",title:"Tech News",body:"Latest tech updates",tags:["tech","news"]}];
  function search(query: string): Entry[] { const q = query.toLowerCase(); return entries.filter(e => e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q) || e.tags.some(t=>t.includes(q))); }
  it("should search by title", () => { expect(search("Hello").length).toBe(1); });
  it("should search by body", () => { expect(search("welcome").length).toBe(1); });
  it("should search by tag", () => { expect(search("tech").length).toBe(1); });
  it("should return empty for no match", () => { expect(search("xyz").length).toBe(0); });
});
