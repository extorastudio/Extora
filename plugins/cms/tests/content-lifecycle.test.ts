import { describe, it, expect } from "vitest";

interface ContentType {
  name: string;
  title: string;
  fields: Array<{ name: string; label: string; type: string }>;
}

interface ContentEntry {
  id: string;
  contentType: string;
  title: string;
  status: string;
  data: Record<string, unknown>;
  createdAt: string;
}

describe("CMS Content Lifecycle", () => {
  const types = new Map<string, ContentType>();
  const entries = new Map<string, ContentEntry[]>();
  const revisions = new Map<string, ContentEntry[]>();

  function createEntryId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  it("should create a content type", () => {
    const type: ContentType = {
      name: "blog_post",
      title: "Blog Posts",
      fields: [
        { name: "featured_image", label: "Featured Image", type: "media" },
        { name: "excerpt", label: "Excerpt", type: "textarea" },
      ],
    };
    types.set(type.name, type);
    entries.set(type.name, []);

    expect(types.has("blog_post")).toBe(true);
    expect(types.get("blog_post")!.fields.length).toBe(2);
  });

  it("should create a content entry", () => {
    const entry: ContentEntry = {
      id: createEntryId(),
      contentType: "blog_post",
      title: "My First Post",
      status: "draft",
      data: {
        body: "Hello World!",
        featured_image: "media_123",
        excerpt: "An introduction",
      },
      createdAt: new Date().toISOString(),
    };

    const existing = entries.get("blog_post") ?? [];
    existing.push(entry);
    entries.set("blog_post", existing);

    expect(existing.length).toBe(1);
    expect(existing[0]!.title).toBe("My First Post");
    expect(existing[0]!.status).toBe("draft");
  });

  it("should update an entry and track revisions", () => {
    const existing = entries.get("blog_post") ?? [];
    const entry = existing[0]!;

    const updated: ContentEntry = {
      ...entry,
      title: "My First Post (Updated)",
      status: "published",
      data: { ...entry.data, body: "Hello World! (Edited)" },
    };

    // Track revision before update
    const revs = revisions.get(entry.id) ?? [];
    revs.push({ ...entry });
    revisions.set(entry.id, revs);

    existing[0] = updated;
    entries.set("blog_post", existing);

    expect(existing[0]!.title).toBe("My First Post (Updated)");
    expect(existing[0]!.status).toBe("published");
    expect(revisions.get(entry.id)!.length).toBe(1);
    expect(revisions.get(entry.id)![0]!.title).toBe("My First Post");
  });

  it("should list entries by type", () => {
    // Add second entry
    const entry2: ContentEntry = {
      id: createEntryId(),
      contentType: "blog_post",
      title: "Second Post",
      status: "draft",
      data: { body: "Post #2" },
      createdAt: new Date().toISOString(),
    };

    const existing = entries.get("blog_post") ?? [];
    existing.push(entry2);
    entries.set("blog_post", existing);

    const all = entries.get("blog_post") ?? [];
    expect(all.length).toBe(2);
    expect(all[1]!.title).toBe("Second Post");
  });

  it("should filter entries by status", () => {
    const all = entries.get("blog_post") ?? [];
    const published = all.filter((e) => e.status === "published");
    const drafts = all.filter((e) => e.status === "draft");

    expect(published.length).toBe(1);
    expect(drafts.length).toBe(1);
  });

  it("should delete an entry", () => {
    const all = entries.get("blog_post") ?? [];
    const filtered = all.filter((e) => e.title !== "Second Post");
    entries.set("blog_post", filtered);

    expect(entries.get("blog_post")!.length).toBe(1);
  });
});
