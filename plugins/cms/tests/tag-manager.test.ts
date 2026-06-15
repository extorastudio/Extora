import { describe, it, expect } from "vitest";

interface Tag { id: string; name: string; slug: string; count: number; }

function createTag(name: string, existing: Tag[]): Tag {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const dup = existing.find(t => t.name === name);
  if (dup) return dup;
  const tag: Tag = { id: `t_${existing.length+1}`, name, slug, count: 0 };
  existing.push(tag);
  return tag;
}

function incrementTagCount(tag: Tag): void { tag.count++; }

describe("CMS Tag Manager", () => {
  const tags: Tag[] = [];

  it("should create new tag", () => {
    const tag = createTag("Technology", tags);
    expect(tag.name).toBe("Technology");
    expect(tag.slug).toBe("technology");
    expect(tags.length).toBe(1);
  });

  it("should not duplicate tags", () => {
    const tag1 = createTag("Design", tags);
    const tag2 = createTag("Design", tags);
    expect(tag1).toBe(tag2);
    expect(tags.length).toBe(2);
  });

  it("should increment tag count", () => {
    const tag = createTag("Business", tags);
    incrementTagCount(tag);
    incrementTagCount(tag);
    incrementTagCount(tag);
    expect(tag.count).toBe(3);
  });
});
