import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { registerAdminRoutes } from "../src/admin-routes.js";
import { createAccessToken, hashToken } from "../src/auth/jwt.js";

const mockUser = {
  id: "u1",
  email: "admin@extora.dev",
  displayName: "Admin",
  role: "SUPER_ADMIN" as const,
  isActive: true,
  emailVerified: null,
  avatarUrl: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const accessToken = createAccessToken(mockUser);
const tokenHash = hashToken(accessToken.token);

let server: FastifyInstance;

const mockPlugins = [
  { id: "p1", name: "auth-plugin", title: "Auth", version: "1.0.0", author: "Extora", isActive: true, installedAt: new Date(), description: null },
  { id: "p2", name: "cms-plugin", title: "CMS", version: "1.0.0", author: "Extora", isActive: false, installedAt: new Date(), description: null },
];

const mockThemes = [
  { id: "t1", name: "default-theme", title: "Default", version: "1.0.0", author: "Extora", isActive: true, installedAt: new Date() },
];

const mockUsers = [
  { id: "u1", email: "admin@extora.dev", displayName: "Admin", role: "SUPER_ADMIN", isActive: true, createdAt: new Date() },
  { id: "u2", email: "editor@extora.dev", displayName: "Editor", role: "EDITOR", isActive: true, createdAt: new Date() },
];

const mockPrisma = {
  plugin: {
    findMany: async () => mockPlugins,
    findUnique: async (args: { where: { name: string } }) => mockPlugins.find((p) => p.name === args.where.name) ?? null,
    update: async () => mockPlugins[0],
  },
  theme: {
    findMany: async () => mockThemes,
    findUnique: async (args: { where: { name: string } }) => mockThemes.find((t) => t.name === args.where.name) ?? null,
    updateMany: async () => ({}),
    update: async () => mockThemes[0],
  },
  user: {
    findMany: async () => mockUsers,
  },
  systemConfig: {
    findMany: async () => [],
  },
  session: {
    findFirst: async () => ({
      id: "s1",
      userId: "u1",
      tokenHash,
      expiresAt: new Date(Date.now() + 3600000),
      user: {
        id: "u1",
        email: "admin@extora.dev",
        role: "SUPER_ADMIN",
        displayName: "Admin",
        isActive: true,
        userRoles: [{ role: { name: "SUPER_ADMIN", permissions: [{ permission: { resource: "*", action: "*" } }] } }],
      },
    }),
  },
  auditLog: {
    create: async () => ({}),
  },
  $queryRaw: async () => [],
  $connect: async () => {},
} as unknown as PrismaClient;

beforeAll(async () => {
  server = Fastify({ logger: false });
  registerAdminRoutes(server, mockPrisma);
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

function authHeader(): Record<string, string> {
  return { authorization: `Bearer ${accessToken.token}` };
}

describe("Admin API Routes", () => {
  describe("GET /api/v1/plugins", () => {
    it("should return plugin list with auth", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/api/v1/plugins",
        headers: authHeader(),
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as { data: unknown[] };
      expect(body.data).toHaveLength(2);
    });

    it("should reject without auth", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/api/v1/plugins",
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /api/v1/plugins/:name/activate", () => {
    it("should activate a plugin", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/api/v1/plugins/auth-plugin/activate",
        headers: authHeader(),
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload)).toEqual({ success: true });
    });

    it("should return 404 for unknown plugin", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/api/v1/plugins/unknown-plugin/activate",
        headers: authHeader(),
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/users", () => {
    it("should return user list with auth", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/api/v1/users",
        headers: authHeader(),
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as { data: unknown[] };
      expect(body.data).toHaveLength(2);
    });

    it("should reject without auth", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/api/v1/users",
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/themes", () => {
    it("should return theme list with auth", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/api/v1/themes",
        headers: authHeader(),
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as { data: unknown[] };
      expect(body.data).toHaveLength(1);
    });
  });

  describe("POST /api/v1/themes/:name/activate", () => {
    it("should activate a theme", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/api/v1/themes/default-theme/activate",
        headers: authHeader(),
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload)).toEqual({ success: true });
    });

    it("should return 404 for unknown theme", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/api/v1/themes/unknown-theme/activate",
        headers: authHeader(),
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /api/v1/config", () => {
    it("should return config with auth", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/api/v1/config",
        headers: authHeader(),
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as Record<string, unknown>;
      expect(body.NODE_ENV).toBeDefined();
    });
  });
});
