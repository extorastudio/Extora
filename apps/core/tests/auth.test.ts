import { describe, it, expect } from "vitest";
import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken, hashToken } from "../src/auth/jwt.js";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../src/auth/password.js";
import type { User } from "@extora/types";

describe("JWT Module", () => {
  const mockUser: User = {
    id: "test-user-123",
    email: "test@extora.dev",
    displayName: "Test User",
    role: "ADMIN" as const,
    isActive: true,
    emailVerified: null,
    avatarUrl: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should create and verify access token", () => {
    const result = createAccessToken(mockUser);
    expect(result.token).toBeTruthy();
    expect(result.expiresIn).toBeGreaterThan(0);

    const payload = verifyAccessToken(result.token);
    expect(payload.sub).toBe(mockUser.id);
    expect(payload.role).toBe(mockUser.role);
    expect(payload.type).toBe("access");
  });

  it("should create and verify refresh token", () => {
    const result = createRefreshToken(mockUser.id);
    expect(result.token).toBeTruthy();
    expect(result.expiresIn).toBeGreaterThan(0);

    const payload = verifyRefreshToken(result.token);
    expect(payload.sub).toBe(mockUser.id);
    expect(payload.type).toBe("refresh");
  });

  it("should reject invalid token", () => {
    expect(() => verifyAccessToken("invalid.token.here")).toThrow();
  });

  it("should hash tokens consistently", () => {
    const hash1 = hashToken("test-token");
    const hash2 = hashToken("test-token");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex is 64 chars
  });

  it("should produce different hashes for different tokens", () => {
    const hash1 = hashToken("token-a");
    const hash2 = hashToken("token-b");
    expect(hash1).not.toBe(hash2);
  });
});

describe("Password Module", () => {
  it("should hash and verify password", async () => {
    const hash = await hashPassword("SecurePass123");
    expect(hash).toMatch(/^\$2[ab]\$/); // bcrypt hash prefix ($2a$ or $2b$)

    const valid = await verifyPassword("SecurePass123", hash);
    expect(valid).toBe(true);
  });

  it("should reject wrong password", async () => {
    const hash = await hashPassword("SecurePass123");
    const valid = await verifyPassword("WrongPass456", hash);
    expect(valid).toBe(false);
  });

  describe("validatePasswordStrength", () => {
    it("should reject short passwords", () => {
      const result = validatePasswordStrength("Ab1");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("8");
    });

    it("should reject password without uppercase", () => {
      const result = validatePasswordStrength("abcdefg1");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("uppercase");
    });

    it("should reject password without lowercase", () => {
      const result = validatePasswordStrength("ABCDEFG1");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("lowercase");
    });

    it("should reject password without number", () => {
      const result = validatePasswordStrength("Abcdefgh");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("number");
    });

    it("should accept strong password", () => {
      const result = validatePasswordStrength("StrongPass1");
      expect(result.valid).toBe(true);
    });
  });
});
