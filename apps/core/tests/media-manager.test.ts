import { describe, it, expect } from "vitest";
interface MediaItem { id: string; filename: string; mime: string; size: number; width?: number; height?: number; }
class MediaStore { private items: MediaItem[] = []; upload(item: Omit<MediaItem,"id">): MediaItem { const m: MediaItem = { id: `m_${this.items.length+1}`, ...item }; this.items.push(m); return m; }
  getAll(): MediaItem[] { return [...this.items]; }
  getById(id: string): MediaItem|undefined { return this.items.find(i=>i.id===id); }
  deleteById(id: string): void { this.items = this.items.filter(i=>i.id!==id); }
  isImage(item: MediaItem): boolean { return item.mime.startsWith("image/"); } }
describe("Media Manager", () => {
  const store = new MediaStore();
  it("should upload media", () => { const m = store.upload({filename:"test.jpg",mime:"image/jpeg",size:1024}); expect(m.id).toBe("m_1"); });
  it("should list all media", () => { store.upload({filename:"doc.pdf",mime:"application/pdf",size:2048}); expect(store.getAll().length).toBe(2); });
  it("should find by id", () => { expect(store.getById("m_1")?.filename).toBe("test.jpg"); });
  it("should delete media", () => { store.deleteById("m_2"); expect(store.getAll().length).toBe(1); });
  it("should detect image type", () => { expect(store.isImage({id:"",filename:"",mime:"image/png",size:0})).toBe(true); expect(store.isImage({id:"",filename:"",mime:"application/pdf",size:0})).toBe(false); });
});
