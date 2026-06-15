import { describe, it, expect } from "vitest";
interface Job { id: string; name: string; status: string; attempts: number; }
class SimpleQueue { private jobs: Job[] = []; add(name: string): Job { const j: Job = { id: `j_${this.jobs.length+1}`, name, status: "waiting", attempts: 0 }; this.jobs.push(j); return j; }
  process(): Job|null { const j = this.jobs.find(j => j.status==="waiting"); if (j) { j.status="active"; j.attempts++; } return j??null; }
  complete(id: string): void { const j = this.jobs.find(j=>j.id===id); if(j) j.status="completed"; }
  fail(id: string): void { const j = this.jobs.find(j=>j.id===id); if(j) j.status="failed"; }
  getStats() { return { waiting: this.jobs.filter(j=>j.status==="waiting").length, active: this.jobs.filter(j=>j.status==="active").length, completed: this.jobs.filter(j=>j.status==="completed").length, failed: this.jobs.filter(j=>j.status==="failed").length }; }
}
describe("Queue System", () => {
  const q = new SimpleQueue();
  it("should add job", () => { const j = q.add("send_email"); expect(j.status).toBe("waiting"); });
  it("should process next job", () => { q.add("gen_report"); const j = q.process(); expect(j?.status).toBe("active"); });
  it("should complete job", () => { const j = q.add("cleanup"); q.process(); q.complete(j.id); const stats = q.getStats(); expect(stats.completed).toBeGreaterThanOrEqual(1); });
  it("should fail job", () => { const j = q.add("risky"); q.process(); q.fail(j.id); expect(q.getStats().failed).toBeGreaterThanOrEqual(1); });
});
