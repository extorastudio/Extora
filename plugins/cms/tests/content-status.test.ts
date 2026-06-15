import { describe, it, expect } from "vitest";

interface Entry { id: string; title: string; status: string; publishedAt?: string; }

function canTransition(from: string, to: string): boolean {
  const transitions: Record<string, string[]> = {
    draft: ["published", "archived"],
    published: ["draft", "archived"],
    archived: ["draft"],
  };
  return transitions[from]?.includes(to) ?? false;
}

describe("CMS Content Status Transitions", () => {
  it("should allow draft to published", () => {
    expect(canTransition("draft", "published")).toBe(true);
  });

  it("should allow published to archived", () => {
    expect(canTransition("published", "archived")).toBe(true);
  });

  it("should allow archived to draft", () => {
    expect(canTransition("archived", "draft")).toBe(true);
  });

  it("should not allow draft to draft", () => {
    expect(canTransition("draft", "draft")).toBe(false);
  });
});
