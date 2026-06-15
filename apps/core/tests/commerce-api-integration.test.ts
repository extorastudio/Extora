import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { registerAdminRoutes } from "../src/admin-routes";
import { createAccessToken, hashToken } from "../src/auth/jwt";

const mockUser = { id: "u1", email: "admin@extora.dev", displayName: "Admin", role: "SUPER_ADMIN" as const, isActive: true, emailVerified: null, avatarUrl: null, lastLoginAt: null, createdAt: new Date(), updatedAt: new Date() };
const accessToken = createAccessToken(mockUser);
const tokenHash = hashToken(accessToken.token);

const mockPrisma = {
  plugin: { findMany: async () => [], findUnique: async () => null, update: async () => ({}), },
  theme: { findMany: async () => [], findUnique: async () => null, updateMany: async () => ({}), update: async () => ({}), },
  user: { findMany: async () => [] },
  systemConfig: { findMany: async () => [] },
  session: { findFirst: async () => ({ id: "s", userId: "u1", tokenHash, expiresAt: new Date(Date.now()+3600000), user: { id:"u1", email:"a@b.com", role:"SUPER_ADMIN", displayName:"A", isActive:true, userRoles:[{role:{name:"SA",permissions:[{permission:{resource:"*",action:"*"}}]}}] } }) },
  auditLog: { create: async () => ({}) },
  $queryRaw: async () => [],
  $connect: async () => {},
} as unknown as PrismaClient;

let server: FastifyInstance;

beforeAll(async () => {
  server = Fastify({ logger: false });
  registerAdminRoutes(server, mockPrisma);
  await server.ready();
});

afterAll(async () => await server.close());

describe("Commerce Admin API Integration", () => {
  const authHeader = { authorization: `Bearer ${accessToken.token}` };

  it("should list plugins (empty)", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/plugins", headers: authHeader });
    expect(res.statusCode).toBe(200);
  });

  it("should list users (empty)", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/users", headers: authHeader });
    expect(res.statusCode).toBe(200);
  });

  it("should list themes (empty)", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/themes", headers: authHeader });
    expect(res.statusCode).toBe(200);
  });

  it("should get config with env defaults", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/config", headers: authHeader });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as Record<string, unknown>;
    expect(body.NODE_ENV).toBeDefined();
    expect(body.PORT).toBeDefined();
  });

  it("should reject unauthenticated requests", async () => {
    const res = await server.inject({ method: "GET", url: "/api/v1/plugins" });
    expect(res.statusCode).toBe(401);
  });

  it("should return 404 for unknown plugin activate", async () => {
    const res = await server.inject({ method: "POST", url: "/api/v1/plugins/nonexistent/activate", headers: authHeader });
    expect(res.statusCode).toBe(404);
  });
});
