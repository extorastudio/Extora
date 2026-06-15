import { createRouter } from "@extora/sdk/api";

interface SeoMeta {
  id: string;
  resourceType: string;
  resourceId: string;
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  createdAt: string;
}

const metaStore = new Map<string, SeoMeta>();

function createId(): string {
  return `seo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createSeoRouter() {
  return createRouter("seo")
    .get("/api/v1/seo/meta/:type/:id", async (req) => {
      const params = (req as unknown as Record<string, unknown>).params as Record<string, string>;
      const key = `${params.type}:${params.id}`;
      const meta = metaStore.get(key);

      if (!meta) {
        return { data: { resourceType: params.type, resourceId: params.id, noIndex: false } };
      }

      return { data: meta };
    })
    .post("/api/v1/seo/meta", async (req) => {
      const body = (req as unknown as Record<string, unknown>).body as Record<string, unknown>;
      const key = `${String(body.resourceType)}:${String(body.resourceId)}`;
      const existing = metaStore.get(key);
      const id = existing?.id ?? createId();

      const meta: SeoMeta = {
        id,
        resourceType: String(body.resourceType),
        resourceId: String(body.resourceId),
        title: body.title as string | undefined,
        description: body.description as string | undefined,
        keywords: body.keywords as string | undefined,
        ogTitle: body.ogTitle as string | undefined,
        ogDescription: body.ogDescription as string | undefined,
        ogImage: body.ogImage as string | undefined,
        canonicalUrl: body.canonicalUrl as string | undefined,
        noIndex: Boolean(body.noIndex),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };

      metaStore.set(key, meta);
      return { data: meta };
    })
    .get("/api/v1/seo/sitemap", async () => {
      const entries: { url: string; lastModified: string; priority: number }[] = [];

      for (const [, meta] of metaStore) {
        if (!meta.noIndex) {
          entries.push({
            url: `/${meta.resourceType}/${meta.resourceId}`,
            lastModified: meta.createdAt,
            priority: meta.resourceType === "page" ? 1.0 : 0.8,
          });
        }
      }

      return { data: entries };
    })
    .get("/api/v1/seo/robots", async () => {
      return {
        data: {
          rules: ["User-agent: *", "Allow: /", "Sitemap: /sitemap.xml"],
        },
      };
    });
}
