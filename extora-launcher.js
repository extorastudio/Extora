#!/usr/bin/env node
/**
 * Extora Launcher — XAMPP-Style Control Panel
 *
 * Manages the full Extora stack:
 *   Nginx + Core + PostgreSQL + Redis + MinIO + OpenSearch
 *
 * Usage:
 *   node extora-launcher.js start    — Start all services
 *   node extora-launcher.js stop     — Stop all services
 *   node extora-launcher.js restart  — Restart all services
 *   node extora-launcher.js status   — Check service status
 *   node extora-launcher.js logs     — View logs
 *   node extora-launcher.js open     — Open in browser
 */

import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { platform } from "node:os";

const VERSION = readFileSync(join(import.meta.dirname ?? ".", "VERSION"), "utf-8").trim();

const COMPOSE_FILE = "docker/docker-compose.full.yml";
const BANNER = `
  ███████╗██╗  ██╗████████╗ ██████╗ ██████╗  █████╗
  ██╔════╝╚██╗██╔╝╚══██╔══╝██╔═══██╗██╔══██╗██╔══██╗
  █████╗   ╚███╔╝    ██║   ██║   ██║██████╔╝███████║
  ██╔══╝   ██╔██╗    ██║   ██║   ██║██╔══██╗██╔══██║
  ███████╗██╔╝ ██╗   ██║   ╚██████╔╝██║  ██║██║  ██║
  ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝

     Extora v${VERSION} — Plugin Ecosystem Platform
     http://localhost
`;

const HELP = `
Commands:
  start        Start all services (Nginx, Core, PostgreSQL, Redis, MinIO, OpenSearch)
  stop         Stop all services
  restart      Restart all services
  status       Check service status
  logs         View all service logs
  open         Open Extora Studio in browser
`;

const CMD = process.argv[2] ?? "start";

function docker(args: string): void {
  try {
    execSync(`docker compose -f ${COMPOSE_FILE} ${args}`, { stdio: "inherit" });
  } catch {
    console.error("❌ Docker not found. Install Docker Desktop from https://docker.com");
    process.exit(1);
  }
}

function openBrowser(url: string): void {
  const os = platform();
  try {
    if (os === "darwin") execSync(`open "${url}"`);
    else if (os === "win32") execSync(`start "" "${url}"`);
    else execSync(`xdg-open "${url}" 2>/dev/null || echo "Open ${url} in browser"`);
  } catch {
    console.log(`\n  Open: ${url}\n`);
  }
}

function checkDocker(): boolean {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

console.log(BANNER);

if (!checkDocker()) {
  console.log("❌ Docker is not running.");
  console.log("   Install Docker Desktop: https://docker.com");
  console.log("   Then run: extora-launcher start");
  process.exit(1);
}

switch (CMD) {
  case "start":
    if (!existsSync(COMPOSE_FILE)) {
      console.log("❌ docker-compose.full.yml not found.");
      console.log("   Make sure you're in the Extora directory.");
      process.exit(1);
    }
    console.log("🚀 Starting Extora services...\n");
    docker("up -d");
    console.log("\n⏳ Waiting for services to be healthy...");
    docker("ps");
    console.log("\n✅ Extora is running!");
    console.log("   Studio: http://localhost");
    console.log("   API:    http://localhost/api/v1/system/health");
    console.log("   MinIO:  http://localhost:9001");
    setTimeout(() => openBrowser("http://localhost"), 3000);
    break;

  case "stop":
    console.log("🛑 Stopping Extora services...");
    docker("down");
    console.log("✅ All services stopped.");
    break;

  case "restart":
    console.log("🔄 Restarting Extora...");
    docker("restart");
    console.log("✅ Services restarted.");
    break;

  case "status":
    console.log("📊 Service Status:\n");
    docker("ps");
    break;

  case "logs":
    console.log("📋 Service Logs (Ctrl+C to exit):\n");
    docker("logs -f");
    break;

  case "open":
    openBrowser("http://localhost");
    break;

  default:
    console.log(HELP);
    break;
}
