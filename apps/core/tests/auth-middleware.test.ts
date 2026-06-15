import { describe, it, expect } from "vitest";
describe("Auth Middleware", () => {
  function extractToken(header?: string): string|null { if(!header||!header.startsWith("Bearer ")) return null; return header.slice(7); }
  function validateTokenFormat(token: string): boolean { const parts = token.split("."); return parts.length === 3 && parts.every(p=>p.length>0); }
  it("should extract Bearer token", () => { expect(extractToken("Bearer abc.def.ghi")).toBe("abc.def.ghi"); });
  it("should reject missing header", () => { expect(extractToken(undefined)).toBeNull(); });
  it("should reject wrong format", () => { expect(extractToken("Basic xyz")).toBeNull(); });
  it("should validate JWT format", () => { expect(validateTokenFormat("a.b.c")).toBe(true); expect(validateTokenFormat("invalid")).toBe(false); });
});
