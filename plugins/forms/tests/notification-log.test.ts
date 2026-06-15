import { describe, it, expect } from "vitest";
interface Notification { id: string; type: string; sent: boolean; timestamp: string; }
describe("Forms Notification Log", () => {
  const log: Notification[] = [{id:"n1",type:"email",sent:true,timestamp:"2026-01-01"},{id:"n2",type:"webhook",sent:false,timestamp:"2026-01-02"},{id:"n3",type:"email",sent:true,timestamp:"2026-01-03"}];
  function sentCount(): number { return log.filter(n=>n.sent).length; }
  function failedCount(): number { return log.filter(n=>!n.sent).length; }
  it("should count sent notifications", () => { expect(sentCount()).toBe(2); });
  it("should count failed notifications", () => { expect(failedCount()).toBe(1); });
});
