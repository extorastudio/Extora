import { describe, it, expect } from "vitest";
interface DraftEntry { id: string; title: string; published?: { title: string; }; }
describe("CMS Draft vs Published", () => {
  function hasChanges(draft: DraftEntry): boolean { return !!draft.published && draft.title !== draft.published.title; }
  it("should detect changes", () => { expect(hasChanges({id:"1",title:"New",published:{title:"Old"}})).toBe(true); });
  it("should not flag same content", () => { expect(hasChanges({id:"2",title:"Same",published:{title:"Same"}})).toBe(false); });
});
