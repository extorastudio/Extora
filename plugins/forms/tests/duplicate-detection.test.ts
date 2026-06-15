import { describe, it, expect } from "vitest";
interface Submission { id: string; email: string; formId: string; createdAt: string; }
describe("Forms Duplicate Detection", () => {
  const subs: Submission[] = [{id:"s1",email:"a@b.com",formId:"f1",createdAt:"2026-01-01"}];
  function isDuplicate(email: string, formId: string, windowMs: number): boolean { const now = Date.now(); return subs.some(s=>s.email===email&&s.formId===formId&&(now-new Date(s.createdAt).getTime())<windowMs); }
  it("should detect recent duplicate", () => { expect(isDuplicate("a@b.com","f1",86400000)).toBe(true); });
  it("should allow new submission", () => { expect(isDuplicate("new@b.com","f1",86400000)).toBe(false); });
});
