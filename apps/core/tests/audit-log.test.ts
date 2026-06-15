import { describe, it, expect } from "vitest";
interface AuditEntry { id: string; userId: string; action: string; resource: string; outcome: string; timestamp: string; }
describe("Audit Log", () => {
  const log: AuditEntry[] = [{id:"a1",userId:"u1",action:"plugin.install",resource:"plugin:auth",outcome:"success",timestamp:"2026-01-01"},{id:"a2",userId:"u1",action:"user.update",resource:"user:u2",outcome:"success",timestamp:"2026-01-02"},{id:"a3",userId:"u2",action:"plugin.install",resource:"plugin:bad",outcome:"denied",timestamp:"2026-01-03"}];
  function byUser(uid: string): AuditEntry[] { return log.filter(e=>e.userId===uid); }
  function denied(): AuditEntry[] { return log.filter(e=>e.outcome==="denied"); }
  it("should filter by user", () => { expect(byUser("u1").length).toBe(2); });
  it("should find denied actions", () => { expect(denied().length).toBe(1); });
});
