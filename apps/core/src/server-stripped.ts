import crypto from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import type { BootstrapContext } from "./bootstrap.js";

export async function createServer(ctx: BootstrapContext): Promise<FastifyInstance> {
  const server = Fastify({ logger: false, trustProxy: true });
  await server.register(cors, { origin: "*" });
  
  server.get("/api/v1/system/health", async () => ({
    status: "ok", version: "0.0.0", uptime: process.uptime(), timestamp: new Date().toISOString()
  }));
  
  return server;
}
