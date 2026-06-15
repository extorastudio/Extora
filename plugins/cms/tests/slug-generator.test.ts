import { describe, it, expect } from "vitest";

function generateSlug(title: string, existing: string[] = []): string {
  let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let base = slug;
  let counter = 1;
  while (existing.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

describe("Slug Generator", () => {
  it("should generate basic slug", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(generateSlug("What's New?")).toBe("what-s-new");
  });

  it("should handle multiple spaces", () => {
    expect(generateSlug("  My   Post  ")).toBe("my-post");
  });

  it("should generate unique slugs", () => {
    const existing = ["hello-world", "hello-world-1"];
    expect(generateSlug("Hello World", existing)).toBe("hello-world-2");
  });

  it("should keep incrementing until unique", () => {
    const existing = ["test", "test-1", "test-2", "test-3"];
    expect(generateSlug("Test", existing)).toBe("test-4");
  });
});
