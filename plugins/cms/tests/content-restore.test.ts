import { describe, it, expect } from "vitest";
interface ContentHistory { id: string; title: string; version: number; deletedAt?: string; }
describe("CMS Content Restore", () => {
  const history: ContentHistory[] = [{id:"p1",title:"Original",version:1},{id:"p1",title:"Updated",version:2},{id:"p1",title:"Final",version:3,deletedAt:"2026-06-15"}];
  function getLastActive(): ContentHistory|undefined { return history.filter(h=>!h.deletedAt).sort((a,b)=>b.version-a.version)[0]; }
  it("should find last active version", () => { expect(getLastActive()?.title).toBe("Updated"); });
  it("should restore to previous version", () => { const v = getLastActive(); expect(v?.version).toBe(2); });
});
