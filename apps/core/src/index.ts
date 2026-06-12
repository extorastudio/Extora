import "dotenv/config";
import { bootstrap } from "./bootstrap.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const ctx = await bootstrap();
  const server = await createServer(ctx);

  const port = parseInt(process.env["PORT"] ?? "3000", 10);
  const host = process.env["HOST"] ?? "0.0.0.0";

  try {
    await server.listen({ port, host });
    ctx.logger.info(`Extora Core v0.0.0 ready on http://${host}:${port}`);
    ctx.logger.info(`Health check: http://${host}:${port}/api/v1/system/health`);
    ctx.logger.info(`API docs: http://${host}:${port}/docs`);
  } catch (err) {
    ctx.logger.error("Failed to start server", { error: String(err) });
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    ctx.logger.info(`Received ${signal}, shutting down gracefully...`);
    await server.close();
    await ctx.prisma.$disconnect();
    ctx.logger.info("Shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});
