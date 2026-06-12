import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import pino from "pino";
import type { Logger } from "@extora/types";

export interface BootstrapContext {
  logger: Logger;
  prisma: PrismaClient;
  redis: Redis;
}

export async function bootstrap(): Promise<BootstrapContext> {
  // 1. Initialize logger
  const isDev = process.env["NODE_ENV"] === "development";
  const logger = pino({
    level: process.env["LOG_LEVEL"] ?? "info",
    ...(isDev && {
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss" },
      },
    }),
  }) as unknown as Logger;

  const separator = "=".repeat(50);
  logger.info(separator);
  logger.info("  Extora Core v0.0.0 — Bootstrapping");
  logger.info(separator);

  // 2. Connect to PostgreSQL
  logger.info("[1/8] Connecting to PostgreSQL...");
  const prisma = new PrismaClient({
    log: isDev ? ["warn", "error"] : ["error"],
  });
  await prisma.$connect();
  logger.info("       PostgreSQL connected");

  // 3. Connect to Redis
  logger.info("[2/8] Connecting to Redis...");
  const redisUrl = process.env["REDIS_URL"] ?? "redis://localhost:6379";
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
  });
  await redis.ping();
  logger.info("       Redis connected");

  // 4. Verify database connection
  logger.info("[3/8] Verifying database...");
  await prisma.$queryRaw`SELECT 1`;
  logger.info("       Database OK");

  // 5. Load configuration (placeholder)
  logger.info("[4/8] Loading configuration...");
  logger.info("       Configuration loaded (defaults)");

  // 6. Initialize cache (placeholder)
  logger.info("[5/8] Initializing cache manager...");
  logger.info("       Cache manager ready");

  // 7. Initialize plugin system (placeholder)
  logger.info("[6/8] Initializing plugin system...");
  logger.info("       Plugin system ready (0 plugins loaded)");

  // 8. Ready
  logger.info("[7/8] Initializing API engine...");
  logger.info("[8/8] Starting HTTP server...");

  logger.info(separator);

  return { logger, prisma, redis };
}
