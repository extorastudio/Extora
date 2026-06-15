import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

const manifest: PluginManifest = {
  name: "@extora/seo",
  version: "0.0.0",
  type: "plugin",
  title: "Extora SEO",
  description: "Search engine optimization — meta tags, sitemaps, structured data",
  author: { name: "Extora Team", email: "team@extora.dev" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0 <2.0.0" },
  dependencies: { "@extora/cms": ">=1.0.0" },
  permissions: ["database:read", "database:write", "http:outbound:*"],
  entry: { server: "dist/index.js", studio: "dist/studio/index.js" },
  hooks: {
    actions: ["content.published", "content.updated"],
    filters: ["seo.meta_tags", "seo.sitemap", "seo.robots"],
  },
};

export default class SeoPlugin extends BasePlugin {
  override manifest = manifest;

  override async onInstall(): Promise<void> {
    const db = this.db.getPluginDb("seo");
    await db.createTable("plugin_seo_meta", {
      id: "TEXT PRIMARY KEY",
      resource_type: "TEXT NOT NULL",
      resource_id: "TEXT NOT NULL",
      title: "TEXT",
      description: "TEXT",
      keywords: "TEXT",
      og_title: "TEXT",
      og_description: "TEXT",
      og_image: "TEXT",
      canonical_url: "TEXT",
      no_index: "BOOLEAN DEFAULT false",
      created_at: "TIMESTAMP DEFAULT NOW()",
      updated_at: "TIMESTAMP DEFAULT NOW()",
    });
    this.logger.info("SEO plugin installed — meta table created");
  }

  override async onActivate(): Promise<void> {
    this.addFilter("seo.meta_tags", async (meta: unknown) => {
      const m = meta as Record<string, unknown>;
      return {
        ...m,
        generator: "Extora SEO",
        robots: m.no_index ? "noindex, nofollow" : "index, follow",
      };
    });

    this.addFilter("seo.robots", async (robots: unknown) => {
      const r = robots as { rules?: string[] };
      return {
        rules: r.rules ?? ["User-agent: *", "Allow: /"],
        sitemap: "/sitemap.xml",
      };
    });

    this.addAction("content.published", async (content: unknown) => {
      const c = content as { id?: string; title?: string };
      await this.publishEvent("seo.content_indexed", {
        resourceId: c.id,
        title: c.title,
        indexedAt: new Date().toISOString(),
      });
    });

    this.logger.info("SEO plugin activated");
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("SEO plugin deactivated");
  }
}
