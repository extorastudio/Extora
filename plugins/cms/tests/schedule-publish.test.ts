import { describe, it, expect } from "vitest";
interface ScheduledEntry { id: string; status: string; scheduledAt?: string; }
describe("CMS Scheduled Publishing", () => {
  function shouldPublishNow(entry: ScheduledEntry): boolean { return entry.status === "draft" && !!entry.scheduledAt && new Date(entry.scheduledAt) <= new Date(); }
  it("should publish when scheduled time passed", () => { expect(shouldPublishNow({ id:"e1", status:"draft", scheduledAt: new Date(Date.now()-10000).toISOString() })).toBe(true); });
  it("should not publish before scheduled time", () => { expect(shouldPublishNow({ id:"e2", status:"draft", scheduledAt: new Date(Date.now()+86400000).toISOString() })).toBe(false); });
  it("should not publish already published", () => { expect(shouldPublishNow({ id:"e3", status:"published", scheduledAt: new Date().toISOString() })).toBe(false); });
});
