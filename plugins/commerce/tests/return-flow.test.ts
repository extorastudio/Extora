import { describe, it, expect } from "vitest";

interface ReturnRequest { id: string; orderId: string; items: string[]; reason: string; status: "pending"|"approved"|"received"|"completed"|"rejected"; }

function createReturn(orderId: string, items: string[], reason: string): ReturnRequest {
  return { id: `ret_${Date.now()}`, orderId, items, reason, status: "pending" };
}

function approveReturn(req: ReturnRequest): void { req.status = "approved"; }
function markReceived(req: ReturnRequest): void { req.status = "received"; }
function completeReturn(req: ReturnRequest): void { req.status = "completed"; }
function rejectReturn(req: ReturnRequest): void { req.status = "rejected"; }

describe("Commerce Returns", () => {
  it("should create return request", () => {
    const ret = createReturn("o1", ["SKU-1"], "Damaged");
    expect(ret.status).toBe("pending");
    expect(ret.items).toContain("SKU-1");
  });

  it("should follow return lifecycle", () => {
    const ret = createReturn("o2", ["SKU-2"], "Wrong size");
    approveReturn(ret);
    expect(ret.status).toBe("approved");
    markReceived(ret);
    expect(ret.status).toBe("received");
    completeReturn(ret);
    expect(ret.status).toBe("completed");
  });

  it("should reject returns", () => {
    const ret = createReturn("o3", ["SKU-3"], "Changed mind");
    rejectReturn(ret);
    expect(ret.status).toBe("rejected");
  });

  it("should handle multi-item returns", () => {
    const ret = createReturn("o4", ["SKU-A", "SKU-B"], "Defective");
    expect(ret.items.length).toBe(2);
  });
});
