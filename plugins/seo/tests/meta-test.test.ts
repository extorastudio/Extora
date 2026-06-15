import { describe, it, expect } from "vitest";

interface SeoMeta {
  title?: string; description?: string; keywords?: string;
  ogTitle?: string; ogDescription?: string; ogImage?: string;
  canonicalUrl?: string; noIndex: boolean;
}

function generateMetaTags(meta: SeoMeta): string[] {
  const tags: string[] = [];
  if (meta.title) tags.push(`<title>${meta.title}</title>`);
  if (meta.description) tags.push(`<meta name="description" content="${meta.description}">`);
  if (meta.keywords) tags.push(`<meta name="keywords" content="${meta.keywords}">`);
  if (meta.ogTitle) tags.push(`<meta property="og:title" content="${meta.ogTitle}">`);
  if (meta.ogDescription) tags.push(`<meta property="og:description" content="${meta.ogDescription}">`);
  if (meta.ogImage) tags.push(`<meta property="og:image" content="${meta.ogImage}">`);
  if (meta.canonicalUrl) tags.push(`<link rel="canonical" href="${meta.canonicalUrl}">`);
  if (meta.noIndex) tags.push('<meta name="robots" content="noindex, nofollow">');
  return tags;
}

function generateSitemap(urls: Array<{ url: string; lastmod: string; priority: number }>): string {
  const entries = urls.map(u =>
    `  <url><loc>${u.url}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n${entries}\n</urlset>`;
}

describe("SEO Meta Generator", () => {
  it("should generate title tag", () => {
    const tags = generateMetaTags({ title: "My Page", noIndex: false });
    expect(tags).toContain("<title>My Page</title>");
  });

  it("should generate all meta tags", () => {
    const tags = generateMetaTags({
      title: "Test", description: "Desc", keywords: "key,word",
      ogTitle: "OG Title", ogDescription: "OG Desc", ogImage: "img.jpg",
      canonicalUrl: "https://example.com", noIndex: false,
    });
    expect(tags.length).toBe(7);
  });

  it("should include robots noindex when noIndex is true", () => {
    const tags = generateMetaTags({ title: "Hidden", noIndex: true });
    expect(tags.some(t => t.includes("noindex"))).toBe(true);
  });

  it("should not include robots when noIndex is false", () => {
    const tags = generateMetaTags({ title: "Public", noIndex: false });
    expect(tags.some(t => t.includes("noindex"))).toBe(false);
  });

  it("should generate sitemap XML", () => {
    const sitemap = generateSitemap([
      { url: "https://example.com", lastmod: "2026-01-01", priority: 1.0 },
      { url: "https://example.com/about", lastmod: "2026-02-01", priority: 0.8 },
    ]);
    expect(sitemap).toContain("<urlset>");
    expect(sitemap).toContain("<priority>1</priority>");
    expect(sitemap).toContain("<priority>0.8</priority>");
  });
});
