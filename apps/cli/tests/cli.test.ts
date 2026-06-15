import { describe, it, expect, afterEach } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_SRC = path.resolve(__dirname, "../src/index.ts");
const CLI = `npx tsx ${CLI_SRC}`;
const TEST_DIR = path.resolve("/tmp/extora-cli-test");

function run(args: string): string {
  try {
    return execSync(`cd ${TEST_DIR} && ${CLI} ${args}`, {
      encoding: "utf-8",
      stdio: "pipe",
    });
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string; message?: string };
    return (execErr.stdout ?? "") + (execErr.stderr ?? "");
  }
}

function resetTestDir(): void {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

describe("Extora CLI", () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("create plugin", () => {
    it("should scaffold a plugin directory with all files", () => {
      resetTestDir();
      const output = run("create plugin my-plugin");
      expect(output).toContain("Creating plugin: my-plugin");
      expect(output).toContain("extora.json");
      expect(output).toContain("package.json");
      expect(output).toContain("tsconfig.json");
      expect(output).toContain("src/index.ts");

      const pluginDir = path.join(TEST_DIR, "plugins/my-plugin");
      expect(fs.existsSync(pluginDir)).toBe(true);
      expect(fs.existsSync(path.join(pluginDir, "extora.json"))).toBe(true);
      expect(fs.existsSync(path.join(pluginDir, "src/index.ts"))).toBe(true);
    });

    it("should generate valid extora.json", () => {
      resetTestDir();
      run("create plugin my-test-plugin");

      const manifestPath = path.join(TEST_DIR, "plugins/my-test-plugin/extora.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as Record<string, unknown>;
      expect(manifest.name).toBe("my-test-plugin");
      expect(manifest.version).toBe("0.0.0");
      expect(manifest.type).toBe("plugin");
      expect(manifest.title).toBe("My Test Plugin");
    });

    it("should generate TypeScript source with class name", () => {
      resetTestDir();
      run("create plugin my-awesome-plugin");

      const sourcePath = path.join(TEST_DIR, "plugins/my-awesome-plugin/src/index.ts");
      const source = fs.readFileSync(sourcePath, "utf-8");
      expect(source).toContain("class MyAwesomePlugin extends BasePlugin");
      expect(source).toContain('name: "my-awesome-plugin"');
    });

    it("should reject existing directory", () => {
      resetTestDir();
      run("create plugin test");
      const output = run("create plugin test");
      expect(output).toContain("already exists");
    });

    it("should reject invalid type", () => {
      resetTestDir();
      const output = run("create invalid-type test");
      expect(output).toContain("Unknown type");
    });
  });

  describe("plugin list", () => {
    it("should list installed plugins", () => {
      resetTestDir();
      run("create plugin plugin-a");
      run("create plugin plugin-b");

      const output = run("plugin list");
      expect(output).toContain("plugin-a");
      expect(output).toContain("plugin-b");
    });

    it("should show empty message when no plugins", () => {
      resetTestDir();
      const output = run("plugin list");
      expect(output).toContain("No plugins");
    });
  });

  describe("version", () => {
    it("should show version", () => {
      resetTestDir();
      const output = run("--version");
      expect(output).toContain("0.0.0");
    });
  });
});
