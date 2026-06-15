#!/usr/bin/env node
import "dotenv/config";
import Fastify from "fastify";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import crypto from "node:crypto";

// =========================================================================
// Types
// =========================================================================

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  license?: string;
  dist: { tarball: string; shasum: string; size: number };
  scanStatus: "pending" | "scanning" | "passed" | "failed" | "blocked";
  scanResults?: ScanResult[];
  downloadCount: number;
  publishedAt: string;
}

interface ScanResult {
  scanner: string;
  passed: boolean;
  findings: ScanFinding[];
  scannedAt: string;
}

interface ScanFinding {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  cve?: string;
}

interface PolicyRule {
  type: "allow" | "block";
  pattern: string;
  reason: string;
}

// =========================================================================
// In-Memory Stores
// =========================================================================

const packageStore = new Map<string, PackageInfo[]>();
const policyRules: PolicyRule[] = [
  { type: "block", pattern: "malware-*", reason: "Known malware package" },
  { type: "allow", pattern: "@extora/*", reason: "Official Extora package" },
];
const blockedLicenses = new Set(["GPL-3.0", "AGPL-3.0"]);
const downloadCounts = new Map<string, number>();

// =========================================================================
// Security Scanner
// =========================================================================

function scanPackage(packageName: string, version: string, license?: string): ScanResult {
  const findings: ScanFinding[] = [];

  // License check
  if (license && blockedLicenses.has(license)) {
    findings.push({
      severity: "high",
      title: "Blocked license",
      description: `License ${license} is blocked by policy`,
    });
  }

  // Known vulnerability check (simulated)
  const knownVulnerabilities: Record<string, { version: string; cve: string; desc: string }[]> = {
    "lodash": [{ version: "<4.17.21", cve: "CVE-2021-23337", desc: "Command injection" }],
    "axios": [{ version: "<1.7.0", cve: "CVE-2024-12345", desc: "SSRF vulnerability" }],
  };

  const vulns = knownVulnerabilities[packageName];
  if (vulns) {
    for (const vuln of vulns) {
      findings.push({
        severity: "high",
        title: vuln.desc,
        cve: vuln.cve,
        description: `Affects versions ${vuln.version}`,
      });
    }
  }

  // Malware scan (simulated — checks for suspicious patterns in package name)
  if (packageName.includes("malware") || packageName.includes("crypto-miner")) {
    findings.push({
      severity: "critical",
      title: "Malware detected",
      description: "Package matches known malware signatures",
    });
  }

  const passed = findings.length === 0;

  return {
    scanner: "extora-security-scanner",
    passed,
    findings,
    scannedAt: new Date().toISOString(),
  };
}

// =========================================================================
// Policy Engine
// =========================================================================

function checkPolicy(packageName: string): { allowed: boolean; reason?: string } {
  for (const rule of policyRules) {
    const regex = new RegExp("^" + rule.pattern.replace("*", ".*") + "$");
    if (regex.test(packageName)) {
      return { allowed: rule.type === "allow", reason: rule.reason };
    }
  }
  return { allowed: true };
}

// =========================================================================
// Server
// =========================================================================

async function main(): Promise<void> {
  const server: FastifyInstance = Fastify({ logger: false });
  const port = parseInt(process.env.PORT ?? "4873", 10);

  // Health check
  server.get("/-/health", async () => ({
    status: "ok",
    version: "0.0.0",
    packages: packageStore.size,
    rules: policyRules.length,
  }));

  // Search packages
  server.get("/-/v1/search", async (request: FastifyRequest) => {
    const { text } = request.query as { text?: string };
    const results: { name: string; version: string; description?: string }[] = [];

    for (const [name, versions] of packageStore) {
      if (!text || name.includes(text)) {
        const latest = versions[versions.length - 1];
        if (latest) {
          results.push({ name, version: latest.version, description: latest.description });
        }
      }
    }

    return { objects: results.map((r) => ({ package: r })), total: results.length };
  });

  // Get package metadata (npm-compatible format)
  server.get("/:name", async (request: FastifyRequest, reply: FastifyReply) => {
    const { name } = request.params as { name: string };
    const versions = packageStore.get(name);

    if (!versions || versions.length === 0) {
      return reply.status(404).send({ error: "Package not found" });
    }

    const latest = versions[versions.length - 1]!;

    // Increment download count
    const count = downloadCounts.get(name) ?? 0;
    downloadCounts.set(name, count + 1);

    return {
      name,
      "dist-tags": { latest: latest.version },
      versions: Object.fromEntries(versions.map((v) => [v.version, v])),
      time: Object.fromEntries(versions.map((v) => [v.version, v.publishedAt])),
    };
  });

  // Get package version
  server.get("/:name/:version", async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, version } = request.params as { name: string; version: string };
    const versions = packageStore.get(name);
    const pkg = versions?.find((v) => v.version === version);

    if (!pkg) {
      return reply.status(404).send({ error: "Version not found" });
    }

    return pkg;
  });

  // Publish package (simplified — no auth for MVP)
  server.put("/:name", async (request: FastifyRequest, reply: FastifyReply) => {
    const { name } = request.params as { name: string };
    const body = request.body as {
      versions?: Record<string, { version: string; description?: string; license?: string; dist?: { tarball?: string; shasum?: string; size?: number } }>;
    };

    // Policy check
    const policy = checkPolicy(name);
    if (!policy.allowed) {
      return reply.status(403).send({ error: `Package blocked: ${policy.reason}` });
    }

    const entries = body.versions ?? {};
    const newVersions: PackageInfo[] = [];

    for (const [ver, data] of Object.entries(entries)) {
      // Security scan
      const scanResult = scanPackage(name, ver, data.license);

      const pkg: PackageInfo = {
        name,
        version: ver,
        description: data.description,
        license: data.license,
        dist: {
          tarball: data.dist?.tarball ?? `https://registry.extora.dev/${name}/-/${name}-${ver}.tgz`,
          shasum: data.dist?.shasum ?? crypto.randomBytes(20).toString("hex"),
          size: data.dist?.size ?? 0,
        },
        scanStatus: scanResult.passed ? "passed" : "failed",
        scanResults: [scanResult],
        downloadCount: 0,
        publishedAt: new Date().toISOString(),
      };

      newVersions.push(pkg);
    }

    const existing = packageStore.get(name) ?? [];
    // Remove old versions of same version number
    const filtered = existing.filter((v) => !newVersions.find((nv) => nv.version === v.version));
    packageStore.set(name, [...filtered, ...newVersions]);

    return { ok: true, versions: newVersions.map((v) => v.version) };
  });

  // Get scan results
  server.get("/-/scan/:name/:version", async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, version } = request.params as { name: string; version: string };
    const versions = packageStore.get(name);
    const pkg = versions?.find((v) => v.version === version);

    if (!pkg) {
      return reply.status(404).send({ error: "Package not found" });
    }

    return {
      name,
      version,
      scanStatus: pkg.scanStatus,
      results: pkg.scanResults ?? [],
    };
  });

  // Policy management (admin)
  server.get("/-/admin/policies", async () => ({
    rules: policyRules,
    blockedLicenses: Array.from(blockedLicenses),
  }));

  server.post("/-/admin/policies", async (request: FastifyRequest) => {
    const body = request.body as PolicyRule;
    policyRules.push(body);
    return { ok: true, total: policyRules.length };
  });

  // Stats
  server.get("/-/stats", async () => ({
    totalPackages: packageStore.size,
    totalDownloads: Array.from(downloadCounts.values()).reduce((a, b) => a + b, 0),
    rules: policyRules.length,
    blockedLicenses: Array.from(blockedLicenses),
  }));

  try {
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Extora Registry v0.0.0 ready on http://0.0.0.0:${String(port)}`);
    console.log(`  Health: http://0.0.0.0:${String(port)}/-/health`);
  } catch (err: unknown) {
    console.error("Failed to start registry:", err);
    process.exit(1);
  }
}

main().catch((err: unknown) => { console.error(err); process.exit(1); });
