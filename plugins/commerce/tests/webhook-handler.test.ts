import { describe, it, expect } from "vitest";
describe("Commerce Webhook Handler", () => {
  const logs: Array<{ event: string; payload: unknown }> = [];
  function handleWebhook(event: string, payload: unknown, secret: string): boolean { if (secret !== "whsec_test") return false; logs.push({ event, payload }); return true; }
  it("should accept valid webhook", () => { expect(handleWebhook("payment.succeeded", { id: "pi_1" }, "whsec_test")).toBe(true); expect(logs.length).toBe(1); });
  it("should reject invalid secret", () => { expect(handleWebhook("order.created", { id: "o1" }, "wrong")).toBe(false); });
  it("should log multiple events", () => { handleWebhook("a", {}, "whsec_test"); handleWebhook("b", {}, "whsec_test"); expect(logs.length).toBe(3); });
});
