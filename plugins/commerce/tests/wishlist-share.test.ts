import { describe, it, expect } from "vitest";
describe("Commerce Wishlist Share", () => {
  function generateShareUrl(listId: string, base: string): string { return `${base}/wishlist/${listId}`; }
  it("should generate share URL", () => { expect(generateShareUrl("abc123","https://store.com")).toBe("https://store.com/wishlist/abc123"); });
});
