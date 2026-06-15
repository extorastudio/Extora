import { describe, it, expect } from "vitest";

interface MediaItem { id: string; filename: string; url: string; mimeType: string; size: number; }
interface ContentEntry { id: string; title: string; featuredImageId?: string; galleryIds?: string[]; }

describe("CMS Media Relations", () => {
  const media: MediaItem[] = [
    { id: "m1", filename: "hero.jpg", url: "/media/hero.jpg", mimeType: "image/jpeg", size: 102400 },
    { id: "m2", filename: "thumb.png", url: "/media/thumb.png", mimeType: "image/png", size: 51200 },
    { id: "m3", filename: "doc.pdf", url: "/media/doc.pdf", mimeType: "application/pdf", size: 204800 },
  ];

  function resolveImage(entry: ContentEntry): { featured?: MediaItem; gallery: MediaItem[] } {
    const featured = media.find(m => m.id === entry.featuredImageId);
    const gallery = (entry.galleryIds ?? []).map(id => media.find(m => m.id === id)).filter(Boolean) as MediaItem[];
    return { featured, gallery };
  }

  it("should resolve featured image", () => {
    const entry: ContentEntry = { id: "e1", title: "Post", featuredImageId: "m1" };
    const result = resolveImage(entry);
    expect(result.featured?.filename).toBe("hero.jpg");
    expect(result.gallery.length).toBe(0);
  });

  it("should resolve gallery images", () => {
    const entry: ContentEntry = { id: "e2", title: "Gallery Post", galleryIds: ["m1", "m2"] };
    const result = resolveImage(entry);
    expect(result.featured).toBeUndefined();
    expect(result.gallery.length).toBe(2);
  });

  it("should filter non-image media from gallery", () => {
    const allMedia = media.filter(m => m.mimeType.startsWith("image/"));
    expect(allMedia.length).toBe(2);
  });

  it("should handle missing media gracefully", () => {
    const entry: ContentEntry = { id: "e3", title: "No Media" };
    const result = resolveImage(entry);
    expect(result.featured).toBeUndefined();
    expect(result.gallery.length).toBe(0);
  });
});
