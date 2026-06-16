import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import type { Logger } from "@extora/types";
import { PluginManifestSchema, type ValidatedManifest } from "./plugin-loader/manifest.js";

const CWD = process.cwd();
const PLUGINS_DIR = existsSync(join(CWD, "plugins"))
  ? join(CWD, "plugins")
  : join(CWD, "..", "..", "plugins");
const THEMES_DIR = existsSync(join(CWD, "themes"))
  ? join(CWD, "themes")
  : join(CWD, "..", "..", "themes");

export interface InstallResult {
  success: boolean;
  manifest: ValidatedManifest;
  message: string;
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function saveManifestFile(dir: string, manifest: ValidatedManifest): Promise<void> {
  const manifestPath = join(dir, "extora.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
}

export async function installPlugin(
  prisma: PrismaClient,
  logger: Logger,
  manifest: ValidatedManifest,
): Promise<InstallResult> {
  ensureDir(PLUGINS_DIR);

  const existing = await prisma.plugin.findUnique({ where: { name: manifest.name } });
  if (existing) {
    return {
      success: false,
      manifest,
      message: `Plugin "${manifest.name}" is already installed (v${existing.version}). Update coming soon.`,
    };
  }

  const pluginDir = join(PLUGINS_DIR, manifest.name.split("/").pop() ?? manifest.name);
  await mkdir(pluginDir, { recursive: true });

  const enriched = {
    ...manifest,
    entry: {
      server: manifest.entry.server ?? "./src/index.ts",
      studio: manifest.entry.studio,
      cli: manifest.entry.cli,
    },
    permissions: manifest.permissions,
    dependencies: manifest.dependencies,
  };

  await saveManifestFile(pluginDir, enriched);

  await prisma.plugin.create({
    data: {
      name: enriched.name,
      title: enriched.title,
      description: enriched.description ?? null,
      version: enriched.version,
      type: enriched.type,
      author: enriched.author.name,
      authorEmail: enriched.author.email ?? null,
      license: enriched.license,
      entryServer: enriched.entry.server,
      entryStudio: enriched.entry.studio,
      entryCli: enriched.entry.cli,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      manifest: enriched as any,
      permissions: enriched.permissions,
      dependencies: enriched.dependencies,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "plugin.install",
      resource: `plugin:${enriched.name}`,
      outcome: "success",
      details: { version: enriched.version } as any,
    },
  });

  logger.info(`Plugin installed: ${enriched.name} v${enriched.version}`);

  return { success: true, manifest: enriched, message: "Plugin installed. Restart server to activate." };
}

export async function uninstallPlugin(
  prisma: PrismaClient,
  logger: Logger,
  name: string,
): Promise<{ success: boolean; message: string }> {
  const plugin = await prisma.plugin.findUnique({ where: { name } });
  if (!plugin) {
    return { success: false, message: `Plugin "${name}" not found` };
  }

  await prisma.pluginConfig.deleteMany({ where: { pluginId: plugin.id } });
  await prisma.pluginMigration.deleteMany({ where: { pluginId: plugin.id } });
  await prisma.plugin.delete({ where: { name } });

  const pluginDirName = name.split("/").pop() ?? name;
  const pluginDir = join(PLUGINS_DIR, pluginDirName);
  if (existsSync(pluginDir)) {
    await rm(pluginDir, { recursive: true, force: true });
  }

  await prisma.auditLog.create({
    data: {
      action: "plugin.uninstall",
      resource: `plugin:${name}`,
      outcome: "success",
    },
  });

  logger.info(`Plugin uninstalled: ${name}`);

  return { success: true, message: `Plugin "${name}" uninstalled.` };
}

export async function installTheme(
  prisma: PrismaClient,
  logger: Logger,
  manifest: ValidatedManifest,
): Promise<InstallResult> {
  ensureDir(THEMES_DIR);

  const existing = await prisma.theme.findUnique({ where: { name: manifest.name } });
  if (existing) {
    return {
      success: false,
      manifest,
      message: `Theme "${manifest.name}" is already installed (v${existing.version}).`,
    };
  }

  const themeDir = join(THEMES_DIR, manifest.name.split("/").pop() ?? manifest.name);
  await mkdir(themeDir, { recursive: true });

  const enriched = { ...manifest, type: "theme" as const };
  await saveManifestFile(themeDir, enriched);

  await prisma.theme.create({
    data: {
      name: enriched.name,
      title: enriched.title,
      version: enriched.version,
      author: enriched.author.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      manifest: enriched as any,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "theme.install",
      resource: `theme:${enriched.name}`,
      outcome: "success",
      details: { version: enriched.version } as any,
    },
  });

  logger.info(`Theme installed: ${enriched.name} v${enriched.version}`);

  return { success: true, manifest: enriched, message: "Theme installed." };
}

export async function uninstallTheme(
  prisma: PrismaClient,
  logger: Logger,
  name: string,
): Promise<{ success: boolean; message: string }> {
  const theme = await prisma.theme.findUnique({ where: { name } });
  if (!theme) {
    return { success: false, message: `Theme "${name}" not found` };
  }

  await prisma.themeConfig.deleteMany({ where: { themeId: theme.id } });
  await prisma.theme.delete({ where: { name } });

  const themeDirName = name.split("/").pop() ?? name;
  const themeDir = join(THEMES_DIR, themeDirName);
  if (existsSync(themeDir)) {
    await rm(themeDir, { recursive: true, force: true });
  }

  await prisma.auditLog.create({
    data: {
      action: "theme.uninstall",
      resource: `theme:${name}`,
      outcome: "success",
    },
  });

  logger.info(`Theme uninstalled: ${name}`);

  return { success: true, message: `Theme "${name}" uninstalled.` };
}

export async function discoverAndRegisterLocalPlugins(
  prisma: PrismaClient,
  logger: Logger,
): Promise<number> {
  ensureDir(PLUGINS_DIR);
  let count = 0;

  const entries = await readdir(PLUGINS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = join(PLUGINS_DIR, entry.name, "extora.json");
    if (!existsSync(manifestPath)) continue;

    try {
      const raw = await readFile(manifestPath, "utf-8");
      const parsed = JSON.parse(raw) as unknown;
      const manifest = PluginManifestSchema.parse(parsed);

      const existing = await prisma.plugin.findUnique({ where: { name: manifest.name } });
      if (!existing) {
        await prisma.plugin.create({
          data: {
            name: manifest.name,
            title: manifest.title,
            description: manifest.description ?? null,
            version: manifest.version,
            type: manifest.type,
            author: manifest.author.name,
            authorEmail: manifest.author.email ?? null,
            license: manifest.license,
            entryServer: manifest.entry.server,
            entryStudio: manifest.entry.studio,
            entryCli: manifest.entry.cli,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            manifest: manifest as any,
            permissions: manifest.permissions,
            dependencies: manifest.dependencies,
          },
        });
        count++;
        logger.info(`Registered plugin from filesystem: ${manifest.name}`);
      }
    } catch {
      logger.warn(`Failed to register plugin from ${entry.name}`);
    }
  }

  return count;
}

export async function discoverAndRegisterLocalThemes(
  prisma: PrismaClient,
  logger: Logger,
): Promise<number> {
  ensureDir(THEMES_DIR);
  let count = 0;

  const entries = await readdir(THEMES_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = join(THEMES_DIR, entry.name, "extora.json");
    if (!existsSync(manifestPath)) continue;

    try {
      const raw = await readFile(manifestPath, "utf-8");
      const parsed = JSON.parse(raw) as unknown;
      const manifest = PluginManifestSchema.parse(parsed);

      const existing = await prisma.theme.findUnique({ where: { name: manifest.name } });
      if (!existing) {
        await prisma.theme.create({
          data: {
            name: manifest.name,
            title: manifest.title,
            version: manifest.version,
            author: manifest.author.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            manifest: manifest as any,
          },
        });
        count++;
        logger.info(`Registered theme from filesystem: ${manifest.name}`);
      }
    } catch {
      logger.warn(`Failed to register theme from ${entry.name}`);
    }
  }

  return count;
}
