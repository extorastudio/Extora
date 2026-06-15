import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../src/auth/password";
import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken, hashToken } from "../src/auth/jwt";
import type { User } from "@extora/types";

const mockUser: User = {
  id: "flow-user-1", email: "user@extora.dev", displayName: "Flow User",
  role: "EDITOR", isActive: true, emailVerified: null, avatarUrl: null,
  lastLoginAt: null, createdAt: new Date(), updatedAt: new Date(),
};

describe("Auth Flow Integration", () => {
  it("should complete register → verify → login → refresh cycle", async () => {
    // Step 1: Validate + hash password
    const strength = validatePasswordStrength("SecurePass1");
    expect(strength.valid).toBe(true);
    const hash = await hashPassword("SecurePass1");

    // Step 2: Verify password
    const valid = await verifyPassword("SecurePass1", hash);
    expect(valid).toBe(true);

    // Step 3: Create access + refresh tokens
    const access = createAccessToken(mockUser);
    const refresh = createRefreshToken(mockUser.id);

    // Step 4: Verify access token
    const accessPayload = verifyAccessToken(access.token);
    expect(accessPayload.sub).toBe(mockUser.id);
    expect(accessPayload.role).toBe("EDITOR");

    // Step 5: Verify refresh token
    const refreshPayload = verifyRefreshToken(refresh.token);
    expect(refreshPayload.sub).toBe(mockUser.id);

    // Step 6: Hash tokens for session storage
    const accessHash = hashToken(access.token);
    expect(accessHash).toHaveLength(64);
  });

  it("should reject wrong password", async () => {
    const hash = await hashPassword("CorrectPass1");
    const wrong = await verifyPassword("WrongPass1", hash);
    expect(wrong).toBe(false);
  });

  it("should reject weak passwords", () => {
    expect(validatePasswordStrength("short").valid).toBe(false);
    expect(validatePasswordStrength("nouppercase1").valid).toBe(false);
    expect(validatePasswordStrength("NOLOWERCASE1").valid).toBe(false);
  });

  it("should generate unique sessions", () => {
    const t1 = createAccessToken(mockUser);
    const t2 = createAccessToken(mockUser);
    expect(hashToken(t1.token)).not.toBe(hashToken(t2.token));
  });
});
