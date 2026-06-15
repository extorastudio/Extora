import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

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

export default class AuthPlugin extends BasePlugin {
  override manifest = manifest;

  override async onInstall(): Promise<void> {
    const db = this.db.getPluginDb("auth");

    await db.createTable("plugin_auth_providers", {
      id: "TEXT PRIMARY KEY",
      name: "TEXT NOT NULL UNIQUE",
      type: "TEXT NOT NULL",
      config: "JSONB DEFAULT '{}'",
      is_enabled: "BOOLEAN DEFAULT false",
      created_at: "TIMESTAMP DEFAULT NOW()",
    });

    this.logger.info("Auth plugin installed");
  }

  override async onActivate(): Promise<void> {
    this.addAction("user.registered", async (user: unknown) => {
      this.logger.info(`New user registered: ${String((user as { email?: string })?.email ?? "unknown")}`);
    });

    this.addAction("user.login", async (user: unknown) => {
      const u = user as { id?: string };
      await this.publishEvent("auth.login.success", { userId: u.id });
    });

    this.logger.info("Auth plugin activated");
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("Auth plugin deactivated");
  }
}
