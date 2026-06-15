import { describe, it, expect } from "vitest";
interface ImportRow { title: string; status: string; category?: string; }
function validateImport(rows: ImportRow[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []; const validStatuses = ["draft","published","archived"];
  rows.forEach((r,i) => { if(!r.title) errors.push(`Row ${i+1}: missing title`); if(!validStatuses.includes(r.status)) errors.push(`Row ${i+1}: invalid status`); });
  return { valid: errors.length===0, errors };
}
describe("CMS Import Validation", () => {
  it("should accept valid import", () => { expect(validateImport([{title:"A",status:"draft"}]).valid).toBe(true); });
  it("should reject missing title", () => { expect(validateImport([{title:"",status:"draft"}]).errors.length).toBe(1); });
  it("should reject invalid status", () => { expect(validateImport([{title:"A",status:"deleted"}]).errors.length).toBe(1); });
});
