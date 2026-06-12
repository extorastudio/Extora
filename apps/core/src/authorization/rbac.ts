import type { FastifyRequest, FastifyReply } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { verifyAccessToken, hashToken } from "../auth/jwt.js";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient,
): Promise<void> {
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return reply.status(401).send({
      code: "UNAUTHORIZED",
      message: "Authentication required. Provide a Bearer token.",
    });
  }

  const token = auth.slice(7);
  const tokenHash = hashToken(token);

  try {
    verifyAccessToken(token);
  } catch {
    return reply.status(401).send({
      code: "INVALID_TOKEN",
      message: "Access token is invalid or expired",
    });
  }

  const session = await prisma.session.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
    include: {
      user: {
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session?.user) {
    return reply.status(401).send({
      code: "SESSION_EXPIRED",
      message: "Session expired or revoked. Please log in again.",
    });
  }

  (request as AuthenticatedRequest).user = session.user;
  (request as AuthenticatedRequest).session = session;
}

export async function authorize(
  request: FastifyRequest,
  reply: FastifyReply,
  _prisma: PrismaClient,
  requiredResource: string,
  requiredAction: string,
): Promise<void> {
  const authReq = request as AuthenticatedRequest;
  if (!authReq.user) {
    return reply.status(401).send({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  // SUPER_ADMIN always has access
  if (authReq.user.role === "SUPER_ADMIN") {
    return;
  }

  let hasPermission = false;

  // authReq.user is guaranteed non-null by guard above
  for (const userRole of authReq.user.userRoles) {
    for (const rolePerm of userRole.role.permissions) {
      const perm = rolePerm.permission;
      if (perm.resource === requiredResource && perm.action === requiredAction) {
        hasPermission = true;
        break;
      }
      // Wildcard resource access
      if (perm.resource === "*" && (perm.action === requiredAction || perm.action === "*")) {
        hasPermission = true;
        break;
      }
    }
    if (hasPermission) break;
  }

  if (!hasPermission) {
    return reply.status(403).send({
      code: "FORBIDDEN",
      message: `Missing required permission: ${requiredResource}:${requiredAction}`,
      required: `${requiredResource}:${requiredAction}`,
    });
  }
}

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    userRoles: {
      role: {
        name: string;
        permissions: {
          permission: {
            resource: string;
            action: string;
          };
        }[];
      };
    }[];
  };
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
    [key: string]: unknown;
  };
}
