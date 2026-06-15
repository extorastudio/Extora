import { describe, it, expect } from "vitest";

function generateOgImage(title: string, logo?: string): string {
  const parts: string[] = [];
  parts.push(`<meta property="og:title" content="${title}">`);
  if (logo) parts.push(`<meta property="og:image" content="${logo}">`);
  parts.push('<meta property="og:type" content="website">');
  return parts.join("\n");
}

describe("SEO OG Image Generator", () => {
  it("should generate og:title", () => {
    const html = generateOgImage("My Site");
    expect(html).toContain("og:title");
    expect(html).toContain("My Site");
  });

  it("should include og:image when logo provided", () => {
    const html = generateOgImage("Site", "logo.png");
    expect(html).toContain('content="logo.png"');
  });

  it("should not include og:image when no logo", () => {
    const html = generateOgImage("Site");
    expect(html).not.toContain("og:image");
  });
});
