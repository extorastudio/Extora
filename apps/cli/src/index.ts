#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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
      entry: { server: "dist/server/index.js" },
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
