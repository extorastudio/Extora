import crypto from "node:crypto";
import { createSigner, createVerifier } from "fast-jwt";
import type { User } from "@extora/types";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const SESSION_TTL = process.env.SESSION_TTL ?? "15m";
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL ?? "7d";

interface AccessTokenPayload {
  sub: string;
  role: string;
  type: "access";
  jti: string;
}

interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
  jti: string;
}

const signAccess = createSigner({
  key: JWT_SECRET,
  expiresIn: SESSION_TTL,
  algorithm: "HS256",
});

const signRefresh = createSigner({
  key: JWT_SECRET,
  expiresIn: REFRESH_TTL,
  algorithm: "HS256",
});

const verify = createVerifier({
  key: JWT_SECRET,
  algorithms: ["HS256"],
});

export function createAccessToken(user: User): { token: string; expiresIn: number } {
  const jti = crypto.randomUUID();
  const payload: Omit<AccessTokenPayload, "jti"> & { jti: string } = {
    sub: user.id,
    role: user.role,
    type: "access" as const,
    jti,
  };
  return {
    token: signAccess(payload),
    expiresIn: parseDurationToSeconds(SESSION_TTL),
  };
}

export function createRefreshToken(userId: string): { token: string; expiresIn: number } {
  const jti = crypto.randomUUID();
  const payload: Omit<RefreshTokenPayload, "jti"> & { jti: string } = {
    sub: userId,
    type: "refresh" as const,
    jti,
  };
  return {
    token: signRefresh(payload),
    expiresIn: parseDurationToSeconds(REFRESH_TTL),
  };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return verify(token) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return verify(token) as RefreshTokenPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseDurationToSeconds(duration: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration);
  if (!match) return 900;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guaranteed by guard above
  const value = parseInt(match[1]!, 10);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guaranteed by guard above
  const unit = match[2]!;
  switch (unit) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 86400;
    default: return 900;
  }
}

export { SESSION_TTL, REFRESH_TTL };
