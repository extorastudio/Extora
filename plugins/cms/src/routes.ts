import { createRouter } from "@extora/sdk/api";

interface ContentType {
  name: string;
  title: string;
  description?: string;
  fields: ContentField[];
  createdAt: string;
}

interface ContentField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  defaultValue?: unknown;
}

interface ContentEntry {
  id: string;
  contentType: string;
  slug: string;
  title: string;
  data: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory stores (backed by DB tables in production)
const contentTypes = new Map<string, ContentType>();
const contentEntries = new Map<string, ContentEntry[]>();
const revisions = new Map<string, ContentEntry[]>();

function createId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// =========================================================================
// Content Type Routes
// =========================================================================

export function createContentTypeRouter() {
  return createRouter("cms")
    .get("/api/v1/content/types", async () => ({
      data: Array.from(contentTypes.values()),
    }))
    .get("/api/v1/content/types/:name", async (req) => {
      const name = ((req as unknown as Record<string, unknown>).params as Record<string, string>).name ?? "";
      const ct = contentTypes.get(name);
      if (!ct) throw httpError(404, `Content type "${name}" not found`);
      return { data: ct };
    })
    .post("/api/v1/content/types", async (req) => {
      const body = (req as unknown as Record<string, unknown>).body as ContentType;
      const ct: ContentType = {
        name: body.name,
        title: body.title,
        description: body.description,
        fields: body.fields ?? [],
        createdAt: new Date().toISOString(),
      };
      contentTypes.set(ct.name, ct);
      contentEntries.set(ct.name, []);
      return { data: ct };
    });
}

// =========================================================================
// Content Entry Routes
// =========================================================================

export function createContentEntryRouter() {
  return createRouter("cms")
    .get("/api/v1/content/:type", async (req) => {
      const type = ((req as unknown as Record<string, unknown>).params as Record<string, string>).type ?? "";
      const entries = contentEntries.get(type) ?? [];
      return { data: entries, pagination: { total: entries.length, page: 1, limit: 20 } };
    })
    .get("/api/v1/content/:type/:id", async (req) => {
      const params = (req as unknown as Record<string, unknown>).params as Record<string, string>;
      const type = params.type ?? "";
      const id = params.id ?? "";
      const entries = contentEntries.get(type) ?? [];
      const entry = entries.find((e) => e.id === id);
      if (!entry) throw httpError(404, "Content entry not found");
      return { data: entry };
    })
    .post("/api/v1/content/:type", async (req) => {
      const params = (req as unknown as Record<string, unknown>).params as Record<string, string>;
      const body = (req as unknown as Record<string, unknown>).body as Record<string, unknown>;
      const type = params.type ?? "";

      if (!contentTypes.has(type)) {
        throw httpError(404, `Content type "${type}" not found`);
      }

      const entry: ContentEntry = {
        id: createId(),
        contentType: type,
        slug: (body.slug as string) ?? createId(),
        title: (body.title as string) ?? "Untitled",
        data: (body.data as Record<string, unknown>) ?? {},
        status: (body.status as ContentEntry["status"]) ?? "draft",
        authorId: body.authorId as string | undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const entries = contentEntries.get(type) ?? [];
      entries.push(entry);
      contentEntries.set(type, entries);

      // Track revision
      const revs = revisions.get(entry.id) ?? [];
      revs.push({ ...entry });
      revisions.set(entry.id, revs);

      return { data: entry };
    })
    .patch("/api/v1/content/:type/:id", async (req) => {
      const params = (req as unknown as Record<string, unknown>).params as Record<string, string>;
      const body = (req as unknown as Record<string, unknown>).body as Record<string, unknown>;
      const type = params.type ?? "";
      const id = params.id ?? "";

      const entries = contentEntries.get(type) ?? [];
      const index = entries.findIndex((e) => e.id === id);
      if (index === -1) throw httpError(404, "Content entry not found");

      const existing = entries[index]!;
      const updated: ContentEntry = {
        ...existing,
        title: (body.title as string) ?? existing.title,
        data: { ...existing.data, ...((body.data as Record<string, unknown>) ?? {}) },
        status: (body.status as ContentEntry["status"]) ?? existing.status,
        updatedAt: new Date().toISOString(),
      };

      entries[index] = updated;
      contentEntries.set(type, entries);

      // Add revision
      const revs = revisions.get(id) ?? [];
      revs.push({ ...updated });
      revisions.set(id, revs);

      return { data: updated };
    })
    .get("/api/v1/content/:type/:id/revisions", async (req) => {
      const params = (req as unknown as Record<string, unknown>).params as Record<string, string>;
      const id = params.id ?? "";
      const revs = revisions.get(id) ?? [];
      return { data: revs };
    })
    .delete("/api/v1/content/:type/:id", async (req) => {
      const params = (req as unknown as Record<string, unknown>).params as Record<string, string>;
      const type = params.type ?? "";
      const id = params.id ?? "";

      const entries = contentEntries.get(type) ?? [];
      const filtered = entries.filter((e) => e.id !== id);
      contentEntries.set(type, filtered);

      return { data: { deleted: true } };
    });
}

function httpError(statusCode: number, message: string): Error {
  return Object.assign(new Error(message), { statusCode });
}
