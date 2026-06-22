import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import type { PluginManifest, PluginLifecycle, PluginSandbox, LoadedPlugin } from "@extora/types";
import { tryLoadManifest } from "./manifest.js";
import { resolveDependencies } from "./resolver.js";

const PLUGINS_DIR = join(process.cwd(), "..", "..", "plugins");

export async function discoverPlugins(prisma: PrismaClient): Promise<LoadedPlugin[]> {
  const installed = await prisma.plugin.findMany({
    where: { isActive: false },
  });

  const installedMap = new Map<string, string>();
  for (const plugin of installed) {
    installedMap.set(plugin.name, plugin.version);
  }

  // Discover plugins from filesystem
  const manifests: PluginManifest[] = [];

  try {
    const entries = await readdir(PLUGINS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const pluginPath = join(PLUGINS_DIR, entry.name);
      const manifest = await tryLoadManifest(pluginPath);
      if (manifest) {
        manifests.push(manifest);
      }
    }
  } catch {
    // Plugins directory may not exist yet — that's fine
  }

  // Resolve dependencies
  const result = resolveDependencies(manifests, installedMap);

  if (result.errors.length > 0) {
    console.warn("Plugin dependency resolution warnings:", result.errors);
  }

  // Return only successfully resolved plugins
  const loadedPlugins: LoadedPlugin[] = result.resolved.map((r) => ({
    manifest: r.manifest,
    instance: undefined as unknown as PluginLifecycle,
    sandbox: undefined as unknown as PluginSandbox,
    loadOrder: r.loadOrder,
  }));

  return loadedPlugins;
}

export function getPluginPermissions(manifest: PluginManifest): string[] {
  return manifest.permissions;
}

export function getPluginAllowedHosts(manifest: PluginManifest): string[] {
  const hosts: string[] = [];
  for (const perm of manifest.permissions) {
    if (perm.startsWith("http:outbound:")) {
      hosts.push(perm.slice("http:outbound:".length));
    }
  }
  return hosts;
}
