import { describe, it, expect } from "vitest";
interface FeedItem { title: string; url: string; date: string; }
describe("CMS RSS Feed", () => {
  const items: FeedItem[] = [{title:"Post A",url:"/a",date:"2026-01-01"},{title:"Post B",url:"/b",date:"2026-02-01"}];
  function generateFeed(title: string, items: FeedItem[]): string { const entries = items.map(i=>`<item><title>${i.title}</title><link>${i.url}</link></item>`).join(""); return `<?xml version="1.0"?><rss><channel><title>${title}</title>${entries}</channel></rss>`; }
  it("should generate RSS feed", () => { const feed = generateFeed("My Blog", items); expect(feed).toContain("Post A"); expect(feed).toContain("<rss>"); });
});
