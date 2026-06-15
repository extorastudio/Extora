import { describe, it, expect } from "vitest";
import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken } from "../src/auth/jwt";
import type { User } from "@extora/types";

const mockUser: User = {
  id: "user-1",
  email: "admin@extora.dev",
  displayName: "Admin",
  role: "ADMIN",
  isActive: true,
  emailVerified: null,
  avatarUrl: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Auth Token Security", () => {
  it("should generate unique tokens each time", () => {
    const t1 = createAccessToken(mockUser);
    const t2 = createAccessToken(mockUser);
    expect(t1.token).not.toBe(t2.token);
  });

  it("should include JTI in access token", () => {
    const result = createAccessToken(mockUser);
    const payload = verifyAccessToken(result.token);
    expect(payload.jti).toBeDefined();
    expect(payload.jti.length).toBeGreaterThan(0);
  });

  it("should include role in access token", () => {
    const result = createAccessToken(mockUser);
    const payload = verifyAccessToken(result.token);
    expect(payload.role).toBe("ADMIN");
  });

  it("should generate different JTIs for different tokens", () => {
    const t1 = createAccessToken(mockUser);
    const t2 = createAccessToken(mockUser);
    const p1 = verifyAccessToken(t1.token);
    const p2 = verifyAccessToken(t2.token);
    expect(p1.jti).not.toBe(p2.jti);
  });

  it("should create refresh tokens with longer expiry", () => {
    const access = createAccessToken(mockUser);
    const refresh = createRefreshToken(mockUser.id);
    expect(refresh.expiresIn).toBeGreaterThan(access.expiresIn);
  });

  it("should have access token type in payload", () => {
    const result = createAccessToken(mockUser);
    const payload = verifyAccessToken(result.token);
    expect(payload.type).toBe("access");
  });

  it("should have refresh token type in payload", () => {
    const result = createRefreshToken(mockUser.id);
    const payload = verifyRefreshToken(result.token);
    expect(payload.type).toBe("refresh");
  });

  it("should reject tampered tokens", () => {
    const result = createAccessToken(mockUser);
    const tampered = result.token + "tampered";
    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});
