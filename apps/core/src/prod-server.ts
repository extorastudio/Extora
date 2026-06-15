/**
 * Extora Production Server
 *
 * Serves both the Core REST API and Studio static files from a single process.
 * This is the unified build that gets packaged for all platforms.
 */

import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const studioDist = path.resolve(__dirname, "../../studio/dist");
const port = parseInt(process.env.PORT ?? "3000", 10);

async function main(): Promise<void> {
  const server = Fastify({ logger: true });

  // Serve Studio static files (if built)
  if (fs.existsSync(studioDist)) {
    await server.register(fastifyStatic, {
      root: studioDist,
      prefix: "/",
      wildcard: false,
    });

    // SPA fallback — serve index.html for non-API routes
    server.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api/")) {
        return reply.status(404).send({ error: "Not found" });
      }
      return reply.sendFile("index.html");
    });
  } else {
    server.get("/", async (_req, reply) => {
      return reply.send({
        name: "Extora",
        version: process.env.EXTORA_VERSION ?? "0.1.0",
        message: "Studio not built. Run: cd apps/studio && npm run build",
      });
    });
  }

  // API health check
  server.get("/api/v1/system/health", async () => ({
    status: "ok",
    version: process.env.EXTORA_VERSION ?? "0.1.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  try {
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`\n  Extora v${process.env.EXTORA_VERSION ?? "0.1.0"} ready`);
    console.log(`  Studio: http://localhost:${port}`);
    console.log(`  API:    http://localhost:${port}/api/v1/system/health\n`);
  } catch (err: unknown) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

main().catch((err: unknown) => { console.error(err); process.exit(1); });
