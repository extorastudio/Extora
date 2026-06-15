import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

const manifest: PluginManifest = {
  name: "@extora/forms",
  version: "0.0.0",
  type: "plugin",
  title: "Extora Forms",
  description: "Drag-and-drop form builder with submissions, notifications, webhooks",
  author: { name: "Extora Team", email: "team@extora.dev" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0 <2.0.0" },
  permissions: ["database:read", "database:write", "storage:write", "http:outbound"],
  entry: { server: "dist/index.js", studio: "dist/studio/index.js" },
  hooks: {
    actions: ["form.submitted", "form.submission_created"],
    filters: ["form.before_submit", "form.email.template"],
  },
  database: { migrations: "dist/migrations/" },
};

export default class FormsPlugin extends BasePlugin {
  override manifest = manifest;

  override async onInstall(): Promise<void> {
    const db = this.db.getPluginDb("forms");

    await db.createTable("plugin_forms_forms", {
      id: "TEXT PRIMARY KEY",
      name: "TEXT NOT NULL",
      slug: "TEXT NOT NULL UNIQUE",
      status: "TEXT DEFAULT 'draft'",
      fields: "JSONB DEFAULT '[]'",
      settings: "JSONB DEFAULT '{}'",
      submissions_count: "INTEGER DEFAULT 0",
      created_at: "TIMESTAMP DEFAULT NOW()",
      updated_at: "TIMESTAMP DEFAULT NOW()",
    });

    await db.createTable("plugin_forms_submissions", {
      id: "TEXT PRIMARY KEY",
      form_id: "TEXT NOT NULL",
      data: "JSONB DEFAULT '{}'",
      files: "JSONB",
      ip_address: "TEXT",
      user_agent: "TEXT",
      is_read: "BOOLEAN DEFAULT false",
      is_spam: "BOOLEAN DEFAULT false",
      created_at: "TIMESTAMP DEFAULT NOW()",
    });

    await db.createTable("plugin_forms_webhooks", {
      id: "TEXT PRIMARY KEY",
      form_id: "TEXT NOT NULL",
      url: "TEXT NOT NULL",
      secret: "TEXT",
      is_active: "BOOLEAN DEFAULT true",
      created_at: "TIMESTAMP DEFAULT NOW()",
    });

    this.logger.info("Forms plugin installed — tables created");
  }

  override async onActivate(): Promise<void> {
    this.addFilter("form.before_submit", async (submission: unknown) => {
      const s = submission as Record<string, unknown>;

      if (s.spam_score !== undefined) {
        return { ...s, is_spam: (s.spam_score as number) > 5 };
      }

      return { ...s, submitted_at: new Date().toISOString() };
    });

    this.addAction("form.submitted", async (submission: unknown) => {
      const s = submission as Record<string, unknown>;
      await this.publishEvent("form.submitted", {
        form_id: s.form_id,
        form_slug: s.form_slug,
        submission_id: s.id,
        ip_address: s.ip_address,
      });

      const slug = typeof s.form_slug === "string" ? s.form_slug : "unknown";
      this.logger.info(`Form submission received for form: ${slug}`);
    });

    this.addFilter("form.email.template", async (template: unknown) => {
      const t = template as Record<string, unknown>;
      const subject = typeof t.subject === "string" ? t.subject : "New Form Submission";
      return {
        ...t,
        subject: `[Extora Forms] ${subject}`,
        footer: "This email was sent by Extora Forms",
      };
    });

    this.logger.info("Forms plugin activated");
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("Forms plugin deactivated");
  }
}
