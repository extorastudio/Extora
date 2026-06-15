import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import pino from "pino";
import type { Logger, EventBus, HookRegistry } from "@extora/types";
import { CoreEventBus } from "./event-bus/bus.js";
import { CoreHookRegistry } from "./hooks/registry.js";
import { discoverPlugins } from "./plugin-loader/loader.js";
import { createPluginSandbox } from "./plugin-loader/sandbox.js";
import type { LoadedPlugin } from "@extora/types";

export interface BootstrapContext {
  logger: Logger;
  prisma: PrismaClient;
  redis: Redis;
  eventBus: EventBus;
  hooks: HookRegistry;
  plugins: LoadedPlugin[];
}

export async function bootstrap(): Promise<BootstrapContext> {
  const isDev = process.env.NODE_ENV === "development";
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "info",
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

  // 1. PostgreSQL
  logger.info("[1/8] Connecting to PostgreSQL...");
  const prisma = new PrismaClient({
    log: isDev ? ["warn", "error"] : ["error"],
  });
  await prisma.$connect();
  logger.info("       PostgreSQL connected");

  // 2. Redis
  logger.info("[2/8] Connecting to Redis...");
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
  });
  await redis.ping();
  logger.info("       Redis connected");

  // 3. Database check
  logger.info("[3/8] Verifying database...");
  await prisma.$queryRaw`SELECT 1`;
  logger.info("       Database OK");

  // 4. Event Bus
  logger.info("[4/8] Initializing event bus...");
  const eventBus = new CoreEventBus(prisma);
  logger.info("       Event bus ready");

  // 5. Hook System
  logger.info("[5/8] Initializing hook system...");
  const hooks = new CoreHookRegistry();
  logger.info("       Hook system ready");

  // 6. Plugin System — discover, load, activate
  logger.info("[6/8] Loading plugins...");
  const loadedPlugins = await discoverPlugins(prisma);
  logger.info(`       Found ${String(loadedPlugins.length)} plugins`);

  for (const plugin of loadedPlugins) {
    try {
      const sandbox = createPluginSandbox({
        manifest: plugin.manifest,
        allowedPaths: [],
        allowedHosts: [],
        memoryLimitMB: 128,
        cpuLimit: 0.5,
      });

      plugin.sandbox = sandbox;

      if (plugin.manifest.name) {
        logger.info(`       → ${plugin.manifest.name} v${plugin.manifest.version}`);
      }
    } catch (err: unknown) {
      logger.error(`Failed to create sandbox for plugin: ${String(err)}`);
    }
  }

  logger.info("       Plugin system ready");

  // 7. API Engine
  logger.info("[7/8] Initializing API engine...");
  logger.info("[8/8] Starting HTTP server...");

  logger.info(separator);

  return { logger, prisma, redis, eventBus, hooks, plugins: loadedPlugins };
}
