import { BasePlugin, BaseMigration } from "@extora/sdk";
import { createMigrationRunner } from "@extora/sdk/database";
import type { PluginManifest } from "@extora/types";

const manifest: PluginManifest = {
  name: "@extora/cms",
  version: "0.0.0",
  type: "plugin",
  title: "Extora CMS",
  description: "Headless content management — custom types, entries, revisions",
  author: { name: "Extora Team", email: "team@extora.dev" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0 <2.0.0" },
  permissions: [
    "database:read", "database:write", "database:schema",
    "storage:read", "storage:write", "user:read",
  ],
  entry: { server: "dist/index.js", studio: "dist/studio/index.js" },
  hooks: {
    actions: ["content.created", "content.updated", "content.deleted", "content.published"],
    filters: ["content.before_save", "content.after_fetch", "content.query"],
  },
  api: { rest: { endpoints: ["/api/v1/content/*"] } },
  database: { migrations: "dist/migrations/" },
};

// =========================================================================
// Migrations
// =========================================================================

class CreateContentTypesTable extends BaseMigration {
  override name = "0001_create_content_types";
  override version = "0.0.0";
  override async up(): Promise<void> {}
  override async down(): Promise<void> {}
}

class CreateContentEntriesTable extends BaseMigration {
  override name = "0002_create_content_entries";
  override version = "0.0.0";
  override async up(): Promise<void> {}
  override async down(): Promise<void> {}
}

class CreateContentRevisionsTable extends BaseMigration {
  override name = "0003_create_content_revisions";
  override version = "0.0.0";
  override async up(): Promise<void> {}
  override async down(): Promise<void> {}
}

// =========================================================================
// CMS Plugin Class
// =========================================================================

export default class CmsPlugin extends BasePlugin {
  override manifest = manifest;

  override async onInstall(): Promise<void> {
    const runner = createMigrationRunner("@extora/cms");
    runner.register(new CreateContentTypesTable());
    runner.register(new CreateContentEntriesTable());
    runner.register(new CreateContentRevisionsTable());
    await runner.runPending();

    const db = this.db.getPluginDb("cms");
    await db.createTable("plugin_cms_content_types", {
      id: "TEXT PRIMARY KEY",
      name: "TEXT NOT NULL UNIQUE",
      title: "TEXT NOT NULL",
      fields: "JSONB DEFAULT '[]'",
      created_at: "TIMESTAMP DEFAULT NOW()",
    });
    await db.createTable("plugin_cms_content_entries", {
      id: "TEXT PRIMARY KEY",
      content_type_id: "TEXT NOT NULL",
      slug: "TEXT NOT NULL",
      title: "TEXT NOT NULL",
      data: "JSONB DEFAULT '{}'",
      status: "TEXT DEFAULT 'draft'",
      created_at: "TIMESTAMP DEFAULT NOW()",
    });

    this.logger.info("CMS plugin installed — content tables created");
  }

  override async onActivate(): Promise<void> {
    this.addFilter("content.before_save", async (entry: unknown) => {
      const e = entry as Record<string, unknown>;
      return { ...e, updated_at: new Date().toISOString() };
    });

    this.addAction("content.published", async (entry: unknown) => {
      const e = entry as Record<string, unknown>;
      await this.publishEvent("content.published", {
        id: e.id,
        type: e.content_type_id,
        title: e.title,
      });
    });

    this.logger.info("CMS plugin activated");
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("CMS plugin deactivated");
  }
}
