import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

export default class ProductAnalyticsPlugin extends BasePlugin {
  override manifest: PluginManifest = {
    name: "@extora/product-analytics",
    version: "1.0.0",
    type: "plugin",
    title: "Product Analytics & Reports",
    description: "Amazon-style product analytics dashboard with sales reports, inventory analysis, top products, revenue charts, and performance metrics",
    author: { name: "Extora Team", email: "plugins@extora.dev" },
    license: "MIT",
    extora: { core: ">=0.3.0" },
    dependencies: { "@extora/commerce": ">=0.0.0" },
    permissions: ["db:read", "db:write"],
    entry: { server: "./src/index.ts" },
    hooks: {
      actions: ["analytics.product_view", "analytics.product_purchase"],
      filters: ["analytics.get_dashboard_stats", "analytics.get_top_products"],
    },
    api: { rest: { endpoints: ["/api/v1/analytics/*"] } },
  };

  override async onInstall(): Promise<void> {
    this.logger.info("Product Analytics plugin installed — dashboard, reports, insights ready");
  }

  override async onActivate(): Promise<void> {
    this.addAction("analytics.product_view", async (event: unknown) => {
      const e = event as { productId?: string; slug?: string };
      this.logger.debug(`Product viewed: ${e.slug ?? e.productId ?? "unknown"}`);
    });

    this.addAction("analytics.product_purchase", async (event: unknown) => {
      const e = event as { productId?: string; name?: string; revenue?: number };
      this.logger.info(`Purchase: ${e.name ?? e.productId ?? "unknown"} — ₹${e.revenue ?? 0}`);
    });

    this.addFilter("analytics.get_dashboard_stats", async (data: unknown) => {
      return data;
    });

    this.logger.info("Product Analytics plugin activated");
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("Product Analytics plugin deactivated");
  }
}
