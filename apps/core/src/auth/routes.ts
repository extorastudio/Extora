import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken, hashToken } from "./jwt.js";
import type { User } from "@extora/types";

// Validation schemas
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required").max(100),
});

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export function registerAuthRoutes(server: FastifyInstance, prisma: PrismaClient): void {
  // POST /api/v1/auth/login
  server.post("/api/v1/auth/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = LoginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user?.passwordHash) {
      return reply.status(401).send({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return reply.status(403).send({
        code: "ACCOUNT_DISABLED",
        message: "Account is disabled. Contact your administrator.",
      });
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    // Create session tokens
    const accessResult = createAccessToken(user as User);
    const refreshResult = createRefreshToken(user.id);

    // Store session
    const expiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000);
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(accessResult.token),
        refreshToken: hashToken(refreshResult.token),
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "auth.login",
        resource: `user:${user.id}`,
        outcome: "success",
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      },
    });

    return reply.send({
      accessToken: accessResult.token,
      refreshToken: refreshResult.token,
      expiresIn: accessResult.expiresIn,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  });

  // POST /api/v1/auth/register
  server.post("/api/v1/auth/register", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = RegisterSchema.parse(request.body);

    const strength = validatePasswordStrength(body.password);
    if (!strength.valid) {
      return reply.status(400).send({
        code: "WEAK_PASSWORD",
        message: strength.message,
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      return reply.status(409).send({
        code: "EMAIL_EXISTS",
        message: "A user with this email already exists",
      });
    }

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        displayName: body.displayName,
        role: "VIEWER",
      },
    });

    // Assign default VIEWER role
    const viewerRole = await prisma.roleDefinition.findUnique({
      where: { name: "VIEWER" },
    });

    if (!viewerRole) {
      // Create VIEWER role if it doesn't exist
      const newRole = await prisma.roleDefinition.create({
        data: {
          name: "VIEWER",
          description: "Default role for new users",
          isSystem: true,
        },
      });

      const readPermissions = await prisma.permission.findMany({
        where: { action: "read" },
      });

      for (const perm of readPermissions) {
        await prisma.rolePermission.create({
          data: { roleId: newRole.id, permissionId: perm.id },
        });
      }

      await prisma.userRole.create({
        data: { userId: user.id, roleId: newRole.id },
      });
    } else {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: viewerRole.id },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "auth.register",
        resource: `user:${user.id}`,
        outcome: "success",
        ipAddress: request.ip,
      },
    });

    return reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  });

  // POST /api/v1/auth/logout
  server.post("/api/v1/auth/logout", async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = request.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ code: "UNAUTHORIZED", message: "Missing token" });
    }

    const token = auth.slice(7);
    const tokenHash = hashToken(token);

    await prisma.session.deleteMany({
      where: { tokenHash },
    });

    return reply.send({ success: true });
  });

  // POST /api/v1/auth/refresh
  server.post("/api/v1/auth/refresh", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = RefreshSchema.parse(request.body);

    try {
      verifyRefreshToken(body.refreshToken);
    } catch {
      return reply.status(401).send({
        code: "INVALID_REFRESH_TOKEN",
        message: "Refresh token is invalid or expired",
      });
    }

    const refreshHash = hashToken(body.refreshToken);

    const session = await prisma.session.findFirst({
      where: { refreshToken: refreshHash },
      include: { user: true },
    });

    if (!session?.user) {
      return reply.status(401).send({
        code: "INVALID_REFRESH_TOKEN",
        message: "Refresh token not found or revoked",
      });
    }

    // Rotate tokens: delete old session, create new
    await prisma.session.delete({ where: { id: session.id } });

    const user = session.user;
    const accessResult = createAccessToken(user as User);
    const refreshResult = createRefreshToken(user.id);

    const expiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000);
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(accessResult.token),
        refreshToken: hashToken(refreshResult.token),
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
        expiresAt,
      },
    });

    return reply.send({
      accessToken: accessResult.token,
      refreshToken: refreshResult.token,
      expiresIn: accessResult.expiresIn,
    });
  });

  // GET /api/v1/auth/session
  server.get("/api/v1/auth/session", async (request: FastifyRequest, reply: FastifyReply) => {
    const auth = request.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ code: "UNAUTHORIZED", message: "Missing token" });
    }

    const token = auth.slice(7);
    const tokenHash = hashToken(token);

    const session = await prisma.session.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!session?.user) {
      return reply.status(401).send({ code: "UNAUTHORIZED", message: "Session expired" });
    }

    return reply.send({
      user: {
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.displayName,
        role: session.user.role,
        avatarUrl: session.user.avatarUrl,
      },
      session: {
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
    });
  });
}
