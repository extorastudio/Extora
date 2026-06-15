import { describe, it, expect } from "vitest";
describe("Forms File Upload", () => {
  function validateFile(file: { name: string; size: number; type: string }, maxSize: number, allowed: string[]): { valid: boolean; error?: string } {
    if (file.size > maxSize) return { valid: false, error: "File too large" };
    if (!allowed.includes(file.type)) return { valid: false, error: "Invalid file type" };
    return { valid: true };
  }
  it("should accept valid file", () => { expect(validateFile({name:"img.jpg",size:1024,type:"image/jpeg"}, 5*1024*1024, ["image/jpeg","image/png"]).valid).toBe(true); });
  it("should reject oversized file", () => { const r = validateFile({name:"big.jpg",size:10*1024*1024,type:"image/jpeg"}, 5*1024*1024, ["image/jpeg"]); expect(r.valid).toBe(false); expect(r.error).toContain("large"); });
  it("should reject wrong type", () => { const r = validateFile({name:"doc.pdf",size:1024,type:"application/pdf"}, 5*1024*1024, ["image/jpeg"]); expect(r.valid).toBe(false); expect(r.error).toContain("type"); });
});
