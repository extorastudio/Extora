import { describe, it, expect } from "vitest";

interface WsClient { id: string; subscribedEvents: Set<string>; send: (msg: string) => void; }
class WsMock {
  clients = new Map<string, WsClient>();
  register(): WsClient { const c: WsClient = { id: `ws_${this.clients.size+1}`, subscribedEvents: new Set(), send: () => {} }; this.clients.set(c.id, c); return c; }
  remove(id: string): void { this.clients.delete(id); }
  subscribe(cid: string, event: string): void { this.clients.get(cid)?.subscribedEvents.add(event); }
  broadcast(event: string): number { let c=0; for (const cl of this.clients.values()) { if(cl.subscribedEvents.has(event)||cl.subscribedEvents.has("*")) { cl.send(""); c++; } } return c; }
}

describe("WebSocket Mock", () => {
  it("should register client", () => { const w = new WsMock(); const c = w.register(); expect(w.clients.size).toBe(1); });
  it("should subscribe to events", () => { const w = new WsMock(); const c = w.register(); w.subscribe(c.id, "order.placed"); expect(c.subscribedEvents.has("order.placed")).toBe(true); });
  it("should broadcast to subscribers", () => { const w = new WsMock(); const c = w.register(); w.subscribe(c.id, "test"); const sent = w.broadcast("test"); expect(sent).toBe(1); });
});
