import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

export const PluginManifestSchema = z.object({
  name: z.string().regex(/^@[\w-]+\/[\w-]+$/, "Plugin name must follow @scope/name format"),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/, "Version must be valid semver"),
  type: z.enum(["plugin", "theme"]).default("plugin"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  author: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
  }),
  license: z.string().default("UNLICENSED"),
  icon: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  documentation: z.string().url().optional(),
  extora: z.object({
    core: z.string(),
    engine: z.string().optional(),
  }),
  dependencies: z.record(z.string(), z.string()).optional().default({}),
  optionalDependencies: z.record(z.string(), z.string()).optional().default({}),
  conflicts: z.record(z.string(), z.string()).optional().default({}),
  permissions: z.array(z.string()).default([]),
  entry: z.object({
    server: z.string().optional(),
    studio: z.string().optional(),
    cli: z.string().optional(),
  }),
  hooks: z.object({
    actions: z.array(z.string()).optional(),
    filters: z.array(z.string()).optional(),
    events: z.array(z.string()).optional(),
  }).optional(),
  api: z.object({
    rest: z.object({ endpoints: z.array(z.string()) }).optional(),
    graphql: z.object({ types: z.array(z.string()) }).optional(),
  }).optional(),
  database: z.object({
    migrations: z.string().optional(),
    seeds: z.string().optional(),
  }).optional(),
  config: z.object({
    schema: z.string().optional(),
  }).optional(),
  minimum: z.object({
    memory: z.string().optional(),
    cpu: z.string().optional(),
    disk: z.string().optional(),
  }).optional(),
});

export type ValidatedManifest = z.infer<typeof PluginManifestSchema>;

export async function loadManifest(pluginPath: string): Promise<ValidatedManifest> {
  const manifestPath = join(pluginPath, "extora.json");
  const raw = await readFile(manifestPath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  return PluginManifestSchema.parse(parsed);
}

export async function tryLoadManifest(pluginPath: string): Promise<ValidatedManifest | null> {
  try {
    return await loadManifest(pluginPath);
  } catch {
    return null;
  }
}

export function validateManifest(raw: unknown): ValidatedManifest {
  return PluginManifestSchema.parse(raw);
}
