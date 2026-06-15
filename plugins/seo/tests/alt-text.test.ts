import { describe, it, expect } from "vitest";
describe("SEO Alt Text Generator", () => {
  function generateAlt(filename: string): string { return filename.replace(/[-_]/g," ").replace(/\.[^.]+$/,"").replace(/\b\w/g,c=>c.toUpperCase()); }
  it("should generate from filename", () => { expect(generateAlt("my-product-image.jpg")).toBe("My Product Image"); });
  it("should handle underscores", () => { expect(generateAlt("hero_banner.png")).toBe("Hero Banner"); });
});
