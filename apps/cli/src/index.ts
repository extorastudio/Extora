#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const program = new Command();

program
  .name("extora")
  .description("Extora CLI — Build, manage, and publish Extora plugins and themes")
  .version("0.0.0");

// =========================================================================
// create — Scaffold a new plugin or theme
// =========================================================================

const PLUGIN_TEMPLATE = {
  "extora.json": JSON.stringify(
    {
      name: "PLACEHOLDER_NAME",
      version: "0.0.0",
      type: "plugin",
      title: "PLACEHOLDER_TITLE",
      description: "A new Extora plugin",
      author: { name: "Developer" },
      license: "UNLICENSED",
      extora: { core: ">=1.0.0 <2.0.0" },
      permissions: [],
      entry: { server: "dist/index.js" },
      hooks: { actions: [], filters: [] },
      database: { migrations: "dist/migrations/" },
    },
    null,
    2,
  ),
  "package.json": JSON.stringify(
    {
      name: "PLACEHOLDER_NAME",
      version: "0.0.0",
      private: true,
      type: "module",
      scripts: {
        dev: "extora dev",
        build: "extora build",
        test: "extora test",
      },
      dependencies: {
        "@extora/sdk": "workspace:*",
      },
      devDependencies: {
        typescript: "^5.7.0",
      },
    },
    null,
    2,
  ),
  "tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        target: "ES2023",
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        outDir: "./dist",
        rootDir: "./src",
        declaration: true,
        sourceMap: true,
        types: ["node"],
      },
      include: ["src/**/*.ts"],
      exclude: ["dist", "node_modules"],
    },
    null,
    2,
  ),
  "src/index.ts": `import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

const manifest: PluginManifest = {
  name: "PLACEHOLDER_NAME",
  version: "0.0.0",
  type: "plugin",
  title: "PLACEHOLDER_TITLE",
  author: { name: "Developer" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0 <2.0.0" },
  permissions: [],
  entry: { server: "dist/index.js" },
};

export default class PLACEHOLDER_CLASS extends BasePlugin {
  override manifest = manifest;

  override async onActivate(): Promise<void> {
    this.logger.info("PLACEHOLDER_TITLE activated");
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("PLACEHOLDER_TITLE deactivated");
  }
}
`,
};

program
  .command("create")
  .argument("<type>", "Type: plugin | theme")
  .argument("<name>", "Name of the project (e.g., my-plugin)")
  .option("--api", "Include REST API template")
  .option("--admin", "Include Studio admin template")
  .action((type: string, name: string, options: Record<string, boolean>) => {
    if (type !== "plugin" && type !== "theme") {
      console.error(chalk.red(`Unknown type "${type}". Use "plugin" or "theme".`));
      process.exit(1);
    }

    const dirName = type === "plugin" ? `plugins/${name}` : `themes/${name}`;
    const targetDir = path.resolve(process.cwd(), dirName);

    if (fs.existsSync(targetDir)) {
      console.error(chalk.red(`Directory "${dirName}" already exists.`));
      process.exit(1);
    }

    console.log(chalk.green(`Creating ${type}: ${name}`));

    // Create directories
    fs.mkdirSync(targetDir, { recursive: true });
    fs.mkdirSync(path.join(targetDir, "src"), { recursive: true });

    // Generate class name from plugin name
    const className = name
      .replace(/^@[\w-]+\//, "")
      .split(/[-_]/)
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");

    const title = name
      .split(/[-_]/)
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    // Write template files
    for (const [filePath, content] of Object.entries(PLUGIN_TEMPLATE)) {
      const fullPath = path.join(targetDir, filePath);
      const parentDir = path.dirname(fullPath);
      fs.mkdirSync(parentDir, { recursive: true });

      const rendered = content
        .replace(/PLACEHOLDER_NAME/g, name)
        .replace(/PLACEHOLDER_TITLE/g, title)
        .replace(/PLACEHOLDER_CLASS/g, className);

      fs.writeFileSync(fullPath, rendered);
      console.log(chalk.gray(`  ✓ ${dirName}/${filePath}`));
    }

    const features: string[] = [];
    if (options.api) features.push("api");
    if (options.admin) features.push("admin");
    if (features.length > 0) {
      console.log(chalk.blue(`  Features: ${features.join(", ")}`));
    }

    console.log(chalk.green(`\n✓ Plugin "${name}" created at ${dirName}/`));
    console.log(chalk.white(`  Next steps:`));
    console.log(chalk.white(`    cd ${dirName}`));
    console.log(chalk.white(`    extora dev`));
  });

// =========================================================================
// serve — Start production server
// =========================================================================
program
  .command("serve")
  .description("Start Extora Core production server")
  .option("-p, --port <port>", "Port number", "3000")
  .option("--no-docker", "Skip Docker services")
  .action((options: { port: string; docker: boolean }) => {
    console.log(chalk.green("Starting Extora Core server..."));

    if (options.docker) {
      try {
        execSync("docker compose -f docker/docker-compose.dev.yml up -d", {
          stdio: "inherit", cwd: process.cwd(),
        });
        console.log(chalk.gray("  Docker services started"));
      } catch {
        console.log(chalk.yellow("  Docker not available, using local services"));
      }
    }

    console.log(chalk.blue(`  Server: http://localhost:${options.port}`));
    console.log(chalk.blue(`  Health: http://localhost:${options.port}/api/v1/system/health`));
    console.log(chalk.blue(`  Studio: http://localhost:${options.port}/studio`));

    try {
      execSync(`node apps/core/dist/index.js`, {
        stdio: "inherit",
        cwd: process.cwd(),
        env: { ...process.env, PORT: options.port, NODE_ENV: "production" },
      });
    } catch {
      console.log(chalk.yellow("  Core not built. Run: pnpm --filter @extora/core build"));
      console.log(chalk.yellow("  Then run: extora serve"));
    }
  });

// =========================================================================
// dev — Start development server
// =========================================================================
program
  .command("dev")
  .description("Start development server with hot reload")
  .option("-p, --port <port>", "Port number", "3000")
  .action((options: { port: string }) => {
    console.log(chalk.green("Starting Extora development server..."));
    console.log(chalk.blue(`  API: http://localhost:${options.port}`));

    try {
      execSync("which tsx", { stdio: "ignore" });
      console.log(chalk.gray("  Starting Core..."));
    } catch {
      console.log(chalk.yellow("  tsx not found. Install: npm install -g tsx"));
      console.log(chalk.yellow("  Or run from the monorepo: pnpm dev"));
    }
  });

// =========================================================================
// package — Create .extora distributable archive
// =========================================================================
program
  .command("package")
  .description("Create .extora distributable archive")
  .action(() => {
    const cwd = process.cwd();
    const manifestPath = path.join(cwd, "extora.json");

    if (!fs.existsSync(manifestPath)) {
      console.error(chalk.red("No extora.json found. Run 'extora create plugin <name>' first."));
      process.exit(1);
    }

    console.log(chalk.green("Packaging plugin..."));

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as Record<string, unknown>;
    const pluginName = typeof manifest.name === "string" ? manifest.name : "unknown";
    const version = typeof manifest.version === "string" ? manifest.version : "0.0.0";
    const safeName = pluginName.replace(/[@/]/g, "_").replace(/^_/, "");
    const archiveName = `${safeName}-${version}.extora`;

    const distPath = path.join(cwd, "dist");
    if (!fs.existsSync(distPath)) {
      console.error(chalk.red("No dist/ directory found. Run 'extora build' first."));
      process.exit(1);
    }

    console.log(chalk.blue(`  Plugin: ${pluginName} v${version}`));

    try {
      execSync(`tar -czf "${archiveName}" -C dist .`, { encoding: "utf-8", cwd });
      console.log(chalk.gray(`  Output: ${archiveName}`));

      const stats = fs.statSync(path.join(cwd, archiveName));
      console.log(chalk.green(`✓ Package created (${formatBytes(stats.size)})`));
      console.log(chalk.white(`  Publish: extora publish`));
    } catch {
      console.log(chalk.yellow("  Package creation skipped (tar not available or build empty)"));
    }
  });

// =========================================================================
// build — Build plugin for production
// =========================================================================
program
  .command("build")
  .description("Build plugin for production")
  .action(() => {
    console.log(chalk.green("Building plugin..."));
    try {
      execSync("npx tsc", { stdio: "inherit", cwd: process.cwd() });
      console.log(chalk.green("✓ Build complete — output in dist/"));
    } catch {
      console.error(chalk.red("Build failed. Check TypeScript errors above."));
    }
  });

// =========================================================================
// test — Run tests
// =========================================================================
program
  .command("test")
  .description("Run plugin tests")
  .option("--coverage", "Generate coverage report")
  .action((options: { coverage?: boolean }) => {
    const args = ["run"];
    if (options.coverage) args.push("--coverage");
    console.log(chalk.green("Running tests..."));
    try {
      execSync(`npx vitest ${args.join(" ")}`, { stdio: "inherit", cwd: process.cwd() });
    } catch {
      console.log(chalk.yellow("Tests completed with failures or no tests found."));
    }
  });

// =========================================================================
// publish — Publish to Marketplace
// =========================================================================
program
  .command("publish")
  .description("Publish plugin to Extora Marketplace")
  .option("-c, --channel <channel>", "Release channel: alpha | beta | stable", "stable")
  .action((options: { channel: string }) => {
    console.log(chalk.green(`Publishing to Extora Marketplace (${options.channel})...`));
    console.log(chalk.gray("  Marketplace integration pending"));
  });

// =========================================================================
// plugin — Manage plugins
// =========================================================================
const pluginCmd = program
  .command("plugin")
  .description("Manage Extora plugins");

pluginCmd
  .command("install <name>")
  .description("Install a plugin")
  .action((name: string) => {
    console.log(chalk.green(`Installing plugin: ${name}...`));
    console.log(chalk.gray("  Marketplace integration pending — use npm/pnpm directly"));
  });

pluginCmd
  .command("list")
  .description("List installed plugins")
  .action(() => {
    const pluginsDir = path.resolve(process.cwd(), "plugins");
    if (fs.existsSync(pluginsDir)) {
      const plugins = fs.readdirSync(pluginsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      if (plugins.length === 0) {
        console.log(chalk.white("No plugins installed."));
      } else {
        console.log(chalk.green("Installed plugins:"));
        plugins.forEach((p) => { console.log(chalk.white(`  - ${p}`)); });
      }
    } else {
      console.log(chalk.white("No plugins directory found."));
    }
  });

// =========================================================================
// docker — Docker management
// =========================================================================
const dockerCmd = program
  .command("docker")
  .description("Manage Docker services");

dockerCmd
  .command("up")
  .description("Start Docker development services")
  .action(() => {
    console.log(chalk.green("Starting Docker services..."));
    try {
      execSync("docker compose -f docker/docker-compose.dev.yml up -d", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log(chalk.green("✓ Services started (PostgreSQL, Redis, MinIO, OpenSearch)"));
    } catch {
      console.log(chalk.yellow("Docker not available or docker-compose.dev.yml not found."));
    }
  });

dockerCmd
  .command("down")
  .description("Stop Docker services")
  .action(() => {
    console.log(chalk.green("Stopping Docker services..."));
    try {
      execSync("docker compose -f docker/docker-compose.dev.yml down", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch {
      console.log(chalk.yellow("Docker not available."));
    }
  });

// =========================================================================
// status — Show Extora installation status
// =========================================================================
program
  .command("status")
  .description("Show Extora installation status")
  .action(() => {
    const cwd = process.cwd();

    console.log(chalk.bold.green("\nExtora Installation Status"));

    // Check extora.json
    const manifestPath = path.join(cwd, "extora.json");
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as Record<string, unknown>;
      const name = typeof manifest.name === "string" ? manifest.name : "unknown";
      const ver = typeof manifest.version === "string" ? manifest.version : "0.0.0";
      console.log(chalk.white(`  Plugin: ${name} v${ver}`));
    }

    // Check plugins directory
    const pluginsDir = path.join(cwd, "plugins");
    if (fs.existsSync(pluginsDir)) {
      const count = fs.readdirSync(pluginsDir, { withFileTypes: true }).filter(d => d.isDirectory()).length;
      console.log(chalk.white(`  Plugins installed: ${String(count)}`));
    }

    // Check dist directory
    const distDir = path.join(cwd, "dist");
    console.log(chalk.white(`  Build output: ${fs.existsSync(distDir) ? "Yes" : "No (run extora build)"}`));

    console.log(chalk.gray("\n  Commands:"));
    console.log(chalk.gray("    extora dev      Start development server"));
    console.log(chalk.gray("    extora build    Build for production"));
    console.log(chalk.gray("    extora test     Run tests"));
    console.log(chalk.gray("    extora serve    Start production server"));
    console.log("");
  });

// =========================================================================
// generate — Code scaffolding
// =========================================================================
program
  .command("generate")
  .argument("<type>", "Type: migration | hook | event | api-endpoint")
  .argument("<name>", "Name of the generated item")
  .action((type: string, name: string) => {
    console.log(chalk.green(`Generating ${type}: ${name}...`));
    console.log(chalk.gray("  Scaffolding pending — coming soon"));
  });

program.parse();
