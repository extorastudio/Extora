import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

export default class AnalyticsPlugin extends BasePlugin {
  override manifest: PluginManifest = {
    name: "@extora/analytics",
    version: "0.0.0",
    type: "plugin",
    title: "Extora Analytics",
    description: "Site analytics and visitor tracking",
    author: { name: "Extora Team", email: "team@extora.dev" },
    license: "UNLICENSED",
    extora: { core: ">=1.0.0 <2.0.0" },
    permissions: ["database:read", "database:write"],
    entry: { server: "dist/index.js", studio: "dist/studio/index.js" },
    hooks: {
      actions: ["analytics.page_view", "analytics.event"],
    },
  };

  override async onInstall(): Promise<void> {
    const db = this.db.getPluginDb("analytics");
    await db.createTable("plugin_analytics_events", {
      id: "TEXT PRIMARY KEY",
      event_type: "TEXT NOT NULL",
      page_url: "TEXT",
      visitor_id: "TEXT",
      metadata: "JSONB DEFAULT '{}'",
      created_at: "TIMESTAMP DEFAULT NOW()",
    });
    this.logger.info("Analytics plugin installed");
  }

  override async onActivate(): Promise<void> {
    this.addAction("analytics.page_view", async (event: unknown) => {
      const e = event as { url?: string };
      this.logger.info(`Page view: ${e.url ?? "unknown"}`);
    });
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("Analytics plugin deactivated");
  }
}
