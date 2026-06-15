import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";
import { createMigrationRunner, BaseMigration } from "@extora/sdk/database";

const manifest: PluginManifest = {
  name: "@extora/auth",
  version: "0.0.0",
  type: "plugin",
  title: "Extora Authentication",
  author: { name: "Extora Team", email: "team@extora.dev" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0 <2.0.0" },
  permissions: ["database:read", "database:write", "user:read", "user:write"],
  entry: { server: "dist/index.js" },
  hooks: {
    actions: ["user.registered", "user.login", "user.logout"],
    filters: ["auth.token_payload"],
  },
  api: { rest: { endpoints: ["/api/v1/auth/*"] } },
  database: { migrations: "dist/migrations/" },
};

class InitialMigration extends BaseMigration {
  override name = "0001_initial_auth_tables";
  override version = "0.0.0";

  override async up(): Promise<void> {
    // Create auth-specific tables via the plugin database client
    const db = this.context?.database.getPluginDb("auth");
    if (!db) return;

    await db.createTable("plugin_auth_providers", {
      id: "TEXT PRIMARY KEY",
      name: "TEXT NOT NULL UNIQUE",
      type: "TEXT NOT NULL",
      config: "JSONB DEFAULT '{}'",
      is_enabled: "BOOLEAN DEFAULT false",
      created_at: "TIMESTAMP DEFAULT NOW()",
    });
  }

  override async down(): Promise<void> {
    const db = this.context?.database.getPluginDb("auth");
    if (!db) return;
    await db.dropTable("plugin_auth_providers");
  }
}

export default class AuthPlugin extends BasePlugin {
  override manifest = manifest;
  private migrations = createMigrationRunner("@extora/auth");

  override async onInstall(): Promise<void> {
    this.migrations.register(new InitialMigration());
    await this.migrations.runPending();
    this.logger.info("Auth plugin installed");
  }

  override async onActivate(): Promise<void> {
    this.addAction("user.registered", async (user: unknown) => {
      this.logger.info(`New user registered: ${String((user as { email?: string })?.email ?? "unknown")}`);
    });
    this.logger.info("Auth plugin activated");
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("Auth plugin deactivated");
  }
}
