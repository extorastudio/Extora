import { describe, it, expect } from "vitest";

interface RefundRequest { orderId: string; amount: number; reason: string; status: "pending"|"approved"|"rejected"|"completed"; }

function processRefund(request: RefundRequest, orderTotal: number): RefundRequest {
  if (request.amount > orderTotal) {
    return { ...request, status: "rejected" };
  }
  if (request.amount <= 0) {
    return { ...request, status: "rejected" };
  }
  return { ...request, status: "approved" };
}

describe("Commerce Refund Flow", () => {
  it("should approve valid refund", () => {
    const result = processRefund({ orderId: "o1", amount: 50, reason: "damaged", status: "pending" }, 100);
    expect(result.status).toBe("approved");
  });

  it("should approve full refund", () => {
    const result = processRefund({ orderId: "o2", amount: 100, reason: "wrong item", status: "pending" }, 100);
    expect(result.status).toBe("approved");
  });

  it("should reject refund exceeding order total", () => {
    const result = processRefund({ orderId: "o3", amount: 150, reason: "changed mind", status: "pending" }, 100);
    expect(result.status).toBe("rejected");
  });

  it("should reject zero or negative refund", () => {
    const result = processRefund({ orderId: "o4", amount: 0, reason: "test", status: "pending" }, 100);
    expect(result.status).toBe("rejected");
  });
});
