import { describe, it, expect } from "vitest";
interface PaymentAttempt { attempt: number; success: boolean; error?: string; }
describe("Payment Retry Logic", () => {
  function retryPayment(attempts: PaymentAttempt[], maxRetries: number): boolean {
    for(let i=0;i<=maxRetries&&i<attempts.length;i++){ if(attempts[i]!.success) return true; }
    return false;
  }
  const attempts: PaymentAttempt[] = [{attempt:1,success:false,error:"timeout"},{attempt:2,success:false,error:"declined"},{attempt:3,success:true}];
  it("should retry up to max", () => { expect(retryPayment(attempts, 2)).toBe(true); });
  it("should fail after max retries", () => { expect(retryPayment(attempts, 0)).toBe(false); });
  it("should succeed on first attempt", () => { expect(retryPayment([{attempt:1,success:true}], 3)).toBe(true); });
});
