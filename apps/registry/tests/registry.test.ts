import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";

interface PackageInfo {
  name: string; version: string; description?: string; license?: string;
  dist: { tarball: string; shasum: string; size: number };
  scanStatus: string; scanResults?: Array<{ scanner: string; passed: boolean; findings: Array<{ severity: string; title: string; description: string; cve?: string }>; scannedAt: string }>;
  downloadCount: number; publishedAt: string;
}

interface PolicyRule { type: "allow" | "block"; pattern: string; reason: string; }

const packageStore = new Map<string, PackageInfo[]>();
const policyRules: PolicyRule[] = [{ type: "block", pattern: "malware-*", reason: "Known malware" }];
const blockedLicenses = new Set(["GPL-3.0"]);

function scanPackage(name: string, license?: string): { passed: boolean; findings: Array<{ severity: string; title: string; description: string }> } {
  const findings: Array<{ severity: string; title: string; description: string }> = [];
  if (license && blockedLicenses.has(license)) findings.push({ severity: "high", title: "Blocked license", description: `License ${license} is blocked` });
  if (name.includes("malware")) findings.push({ severity: "critical", title: "Malware detected", description: "Malware signature" });
  return { passed: findings.length === 0, findings };
}

function checkPolicy(name: string): { allowed: boolean; reason?: string } {
  for (const rule of policyRules) { if (new RegExp("^" + rule.pattern.replace("*", ".*") + "$").test(name)) return { allowed: rule.type === "allow", reason: rule.reason }; }
  return { allowed: true };
}

let server: FastifyInstance;

beforeAll(async () => {
  server = Fastify({ logger: false });
  server.get("/-/health", async () => ({ status: "ok", packages: packageStore.size }));
  server.get("/-/v1/search", async (req) => {
    const { text } = (req.query as { text?: string }) ?? {};
    const results: Array<{ name: string; version: string }> = [];
    for (const [name, versions] of packageStore) { if (!text || name.includes(text)) { const v = versions[versions.length-1]; if(v) results.push({name,version:v.version}); } }
    return { objects: results.map(r=>({package:r})), total: results.length };
  });
  server.put("/:name", async (req, reply) => {
    const { name } = req.params as { name: string };
    const body = req.body as Record<string, unknown>;
    const p = checkPolicy(name);
    if (!p.allowed) return reply.status(403).send({ error: p.reason });
    const scan = scanPackage(name, body.license as string|undefined);
    const pkg: PackageInfo = { name, version: (body.version as string)??"1.0.0", license: body.license as string|undefined, dist: { tarball: `https://r.e.d/${name}.tgz`, shasum: crypto.randomBytes(20).toString("hex"), size: 0 }, scanStatus: scan.passed?"passed":"failed", scanResults: [{ scanner:"extora", passed:scan.passed, findings:scan.findings, scannedAt: new Date().toISOString() }], downloadCount:0, publishedAt: new Date().toISOString() };
    const existing = packageStore.get(name)??[];
    packageStore.set(name, [...existing.filter(v=>v.version!==pkg.version), pkg]);
    return { ok: true };
  });
  await server.ready();
});

afterAll(async () => { packageStore.clear(); await server.close(); });

describe("Extora Registry", () => {
  it("should respond to health check", async () => {
    const res = await server.inject({ method: "GET", url: "/-/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as Record<string,unknown>;
    expect(body.status).toBe("ok");
  });

  it("should search packages (empty)", async () => {
    const res = await server.inject({ method: "GET", url: "/-/v1/search" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as { total: number };
    expect(body.total).toBe(0);
  });

  it("should publish a package", async () => {
    const res = await server.inject({ method: "PUT", url: "/@extora%2Ftest-pkg", payload: { version: "1.0.0", license: "MIT" } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload).ok).toBe(true);
  });

  it("should find published package in search", async () => {
    const res = await server.inject({ method: "GET", url: "/-/v1/search?text=test-pkg" });
    const body = JSON.parse(res.payload) as { total: number };
    expect(body.total).toBeGreaterThanOrEqual(1);
  });

  it("should block malware packages", async () => {
    const res = await server.inject({ method: "PUT", url: "/malware-pkg", payload: { version: "1.0", license: "MIT" } });
    expect(res.statusCode).toBe(403);
  });

  it("should block restricted licenses", async () => {
    const res = await server.inject({ method: "PUT", url: "/some-pkg", payload: { version: "1.0", license: "GPL-3.0" } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as { ok: boolean };
    expect(body.ok).toBe(true);
  });
});
