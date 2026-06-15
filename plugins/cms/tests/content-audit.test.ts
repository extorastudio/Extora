import { describe, it, expect } from "vitest";
interface AuditEntry { id: string; action: string; userId: string; timestamp: string; }
describe("Content Audit Log", () => {
  const log: AuditEntry[] = [{id:"1",action:"created",userId:"u1",timestamp:"2026-01-01"},{id:"2",action:"updated",userId:"u1",timestamp:"2026-01-02"},{id:"3",action:"deleted",userId:"u2",timestamp:"2026-01-03"}];
  function byUser(userId: string): AuditEntry[] { return log.filter(e=>e.userId===userId); }
  function byAction(action: string): AuditEntry[] { return log.filter(e=>e.action===action); }
  it("should filter by user", () => { expect(byUser("u1").length).toBe(2); });
  it("should filter by action", () => { expect(byAction("deleted").length).toBe(1); });
});
