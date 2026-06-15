import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_SRC = path.resolve(__dirname, "../src/index.ts");
const CLI = `npx tsx ${CLI_SRC}`;

function run(args: string, cwd?: string): string {
  try {
    return execSync(`cd ${cwd ?? "/tmp"} && ${CLI} ${args}`, { encoding: "utf-8", stdio: "pipe" });
  } catch (err: unknown) { return (err as { stdout?: string })?.stdout ?? ""; }
}

describe("CLI Commands", () => {
  it("should show version", () => {
    expect(run("--version")).toContain("0.0.0");
  });

  it("should show help for plugin command", () => {
    const out = run("plugin --help");
    expect(out).toContain("Manage");
  });

  it("should show help for docker command", () => {
    const out = run("docker --help");
    expect(out).toContain("Manage");
  });

  it("should show help for generate command", () => {
    const out = run("generate --help");
    expect(out.toLowerCase()).toContain("generat");
  });

  it("should show help for publish command", () => {
    const out = run("publish --help");
    expect(out).toContain("Publish");
  });
});
