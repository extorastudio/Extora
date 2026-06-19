# AGENTS.md — Extora Development Instructions

This file provides instructions for AI coding agents (OpenCode, Claude, Codex, etc.) working on the Extora project.

---

## PROJECT OVERVIEW

**Extora** is a TypeScript-first plugin ecosystem platform — the operating system for web software. Think WordPress + Shopify as a unified plugin runtime.

**Repository:** `extorastudio/Extora` (GitHub) · Branch: `main` (trunk-based)
**Blueprint:** `EXTORA_MEGA_BLUEPRINT_v2.0.md`
**Journal:** `EXTORA_DEVELOPMENT_JOURNAL.md`
**License:** MIT (Core, SDK, CLI, Plugins) + Proprietary (Studio, Commerce, Cloud)

---

## CRITICAL RULES

### 1. NEVER PUSH UNTIL ALL CHECKS PASS
```bash
corepack disable 2>/dev/null  # Required on macOS Homebrew Node
pnpm lint -- --fix             # 0 errors required
pnpm typecheck                 # 0 errors required
pnpm test                      # All must pass
```

### 2. DEVELOPMENT WORKFLOW (Follow this order)

Every change follows this exact sequence:
```bash
# 1. Make changes to source files
# 2. Compile TypeScript
cd apps/core && npx tsc

# 3. Build Studio (if UI changes)
cd apps/studio && npx vite build

# 4. Run all CI checks from project root
pnpm lint && pnpm typecheck && pnpm test

# 5. Rebuild Docker containers
docker compose -f docker/docker-compose.full.yml down
docker compose -f docker/docker-compose.full.yml up -d --build

# 6. Seed MinIO bucket (after fresh start)
docker exec extora-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec extora-minio mc mb local/extora
docker exec extora-minio mc anonymous set public local/extora

# 7. Test via curl — verify endpoints work
TOKEN=$(curl -s -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@extora.dev","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")

# 8. Publish site to sync generated HTML
curl -s -X POST -H "Authorization: Bearer $TOKEN" http://localhost/api/v1/site/publish

# 9. Commit journal + code together
git add -A
git commit -m "feat: Phase X — description"
git push origin main
```

### 3. JOURNAL AFTER EVERY STEP

Append to `EXTORA_DEVELOPMENT_JOURNAL.md` after every significant change:
- Date, duration, files created/modified
- What was built + verification results
- NEVER delete or overwrite old entries — append only

### 4. SINGLE COMMIT PER PHASE

Code changes + journal updates in ONE commit. Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`.

---

## DEVELOPMENT COMMANDS

```bash
# Root commands
pnpm install --no-frozen-lockfile  # Install deps (use when adding new packages)
pnpm lint                           # Lint all (0 errors required)
pnpm typecheck                      # Type-check all
pnpm test                           # Run all tests
pnpm build                          # Build all packages

# Core (backend — Fastify + Prisma)
cd apps/core
npx tsc                             # Compile TypeScript
npx prisma generate                 # Regenerate Prisma client after schema changes
npx prisma db push                  # Push schema changes to dev DB

# Studio (frontend — React + Vite + Tailwind)
cd apps/studio
npx vite build                      # Production build (output to dist/)
npx vite --port 5173                # Dev server

# Docker
docker compose -f docker/docker-compose.full.yml up -d          # Start all 7 services
docker compose -f docker/docker-compose.full.yml down            # Stop all
docker compose -f docker/docker-compose.full.yml up -d --build   # Rebuild + start
docker logs extora-core                                          # Core logs
docker exec extora-postgres psql -U extora -d extora -c "..."    # DB query
```

---

## MONOREPO STRUCTURE

```
apps/core/src/           # Core runtime: Fastify server, Prisma, auth, plugins
  ├── admin-routes.ts    # ALL admin API routes (plugins, users, products, content, media, theme)
  ├── server.ts          # Fastify setup, CORS, multipart, health checks, GraphQL
  ├── bootstrap.ts       # Startup: PG, Redis, event bus, hooks, plugin discovery
  ├── publishing/        # Static site generator (Amazon-style HTML)
  ├── plugin-loader/     # Filesystem plugin discovery + sandboxing
  ├── auth/              # JWT auth + password hashing
  ├── authorization/     # RBAC: authenticate() + authorize()
  └── hooks/             # Action/filter hook registry
apps/studio/src/         # React admin panel (Vite + Tailwind + Zustand)
  ├── pages/             # 11 pages: Dashboard, Products, Content, Media, Users, etc.
  ├── components/layout/ # DashboardLayout with sidebar + 9 nav items
  └── stores/            # Zustand: auth-store, plugin-store, theme-store
plugins/                 # 7 official plugins (extora.json + src/)
themes/                  # 3 official themes (amazon, admin, default)
docker/                  # Dockerfile.core, Dockerfile.studio, nginx.conf, compose files
```

---

## ARCHITECTURE: HOW THINGS CONNECT

### WordPress-Like Routing
```
http://localhost/              → Published website (static HTML from /usr/share/nginx/published/)
http://localhost/admin-panel/  → Extora Studio (React SPA, Vite base: /admin-panel/)
http://localhost/api/v1/       → REST API (nginx → core:3000)
http://localhost/storage/      → MinIO files (nginx → minio:9000, anonymous read)
```

### Published Site Pipeline
```
Admin Panel → API → PostgreSQL (products, content, categories)
    ↓
Publish Site (POST /api/v1/site/publish)
    ↓
publishing/engine.ts reads DB → generates static HTML
    ↓
written to /app/apps/core/published/ (shared volume with nginx)
    ↓
nginx serves at http://localhost/
```

### Media Upload Pipeline
```
Browser → multipart/form-data → nginx (500MB limit, unbuffered) → Core @multipart
    ↓
PutObjectCommand → MinIO bucket (UUID-named key)
    ↓
Prisma Media table (url: /storage/extora/uploads/{uuid}.ext)
    ↓
nginx /storage/ proxy → MinIO (anonymous reads, no credentials exposed)
```

---

## ARCHITECTURE: WHAT GOES WHERE

Every feature, component, or change MUST be categorized into one of three layers. This determines where the code lives and how it's managed:

### 1. Core/Studio (Platform Layer)
**Location:** `apps/core/src/`, `apps/studio/src/`, `packages/`
**What belongs here:** Platform infrastructure that ALL plugins/themes depend on.
- Fastify server, Prisma schema, auth engine, RBAC, event bus, hooks
- Admin panel shell (sidebar, routing, layout)
- Publishing engine, plugin loader, bootstrap
- Media upload (generic), system config, monitoring, backups
- **Version in:** `package.json` (root + apps/core + apps/studio)
- **No version bump needed unless:** New API endpoints, schema changes, breaking changes

### 2. Plugin-Specific (Feature Layer)
**Location:** `plugins/<name>/`
**What belongs here:** All business logic and features.
- Commerce: products, categories, cart, checkout, orders, brands, tags
- CMS: content entries, builder elements, page types
- Forms: form builder, submissions, email notifications
- SEO: meta tags, sitemap, structured data
- Analytics: tracking, reports, dashboards
- Product-Analytics: sales reports, inventory analysis
- Auth: OAuth providers, MFA, password policies
- **Version in:** `plugins/<name>/extora.json` (MUST bump on every change)
- **When disabled:** All features from this plugin must disappear from BOTH admin panel AND published site
- **When enabled:** All features reappear

### 3. Theme-Specific (Presentation Layer)
**Location:** `themes/<name>/`
**What belongs here:** Visual presentation and layout.
- Gallery layout, zoom effects, thumbnail navigation
- Color schemes, typography, spacing
- Product card designs, button styles, badges
- Header/footer layouts, mobile responsive breakpoints
- Loading skeletons, empty states, announcement bars
- **Version in:** `themes/<name>/extora.json` (MUST bump on every change)
- **Can override:** Plugin default templates via filter hooks

### VERSIONING RULES
- **Plugin updated:** MUST bump version in `plugins/<name>/extora.json`
- **Theme updated:** MUST bump version in `themes/<name>/extora.json`
- **Core updated:** Bump root `package.json` version
- **Studio updated:** Bump `apps/studio/package.json` version
- **Version format:** Semver (major.minor.patch) — `1.0.0` → `1.0.1` (patch), `1.1.0` (minor), `2.0.0` (major)

### JOURNAL RULES
- Update `EXTORA_DEVELOPMENT_JOURNAL.md` after **every** change
- Include: Phase number, date, duration, files changed, what was built, verification
- Append only — never delete or overwrite old entries
- Single commit per phase (code + journal together)
- Build + deploy + CI verification must be documented

---

## CODE CONVENTIONS & GOTCHAS

### Prisma — Always use `as any` for new/unknown models
The generated Prisma client won't recognize newly added models until regenerate. Use:
```typescript
const products = await (prisma as any).product.findMany({ ... });
```
Also use `as any` for `details`, `manifest`, `metadata` JSON fields.

### Fastify v5 — `onRequest` hooks MUST be async
Even if the hook has no `await`, wrap it with `async` and add `await Promise.resolve()`:
```typescript
server.addHook("onRequest", async (request: FastifyRequest) => {
  await Promise.resolve(); // required to satisfy both Fastify v5 AND eslint require-await
  ctx.logger.debug(`${request.method} ${request.url}`);
});
```
Sync hooks silently block ALL HTTP in Fastify v5.

### ESLint — Relaxed rules for complex files
When adding new backend routes or complex UI pages, add the file pattern to:
`eslint.config.mjs` → `files: [...]` array → gets these rules disabled:
`require-await`, `no-empty-function`, `no-non-null-assertion`, `restrict-template-expressions`,
`no-unnecessary-condition`, `no-base-to-string`, `no-confusing-void-expression`, `no-misused-promises`

**Always add `apps/studio/src/**/*.tsx`** (not just `.ts`) to match TSX files.

### Prisma Schema Changes — Use raw SQL in Docker
Prisma `db push` and `migrate` often fail with drift. Use direct PostgreSQL:
```bash
docker exec extora-postgres psql -U extora -d extora -c "
  CREATE TABLE IF NOT EXISTS \"NewModel\" (...);
  ALTER TABLE \"ExistingModel\" ADD COLUMN IF NOT EXISTS field TYPE DEFAULT ...;
"
```
Then update `prisma/schema.prisma` and run `npx prisma generate`.

### Studio Build
- `vite.config.ts` has `base: "/admin-panel/"` — ALL asset paths use this prefix
- Always run `npx vite build` after source changes — dist/ must be rebuilt for Docker
- Studio is served by nginx at `/admin-panel/` location

### Docker Rebuild
- Core: `docker compose up -d --build core` (rebuilds apps/core + dependencies)
- Nginx: `docker compose up -d --build nginx` (rebuilds studio dist + nginx config)
- Full: `docker compose up -d --build` (rebuilds everything)
- **Core image uses pre-built dist/** — always `npx tsc` before rebuilding

### Admin Credentials
- Email: `admin@extora.dev` · Password: `admin123`
- Seeded via `apps/core/prisma/seed.ts`
- SUPER_ADMIN role skips all RBAC permission checks

### Corepack Issues
On macOS Homebrew Node.js 22.13.1, corepack signature verification is broken:
```bash
corepack disable 2>/dev/null  # Do this once per session
```
Then `pnpm` works directly without corepack.

---

## API ENDPOINTS (Key routes)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/v1/auth/login` | Login → accessToken + refreshToken |
| GET | `/api/v1/system/health` | Health (PG, Redis, S3, OpenSearch, SMTP) |
| GET/POST/DELETE | `/api/v1/commerce/products` | Product CRUD |
| PATCH | `/api/v1/commerce/products/:id` | Product update |
| GET/POST/DELETE | `/api/v1/commerce/categories` | Category CRUD |
| GET/POST/DELETE | `/api/v1/commerce/brands` | Brand CRUD |
| GET/POST/DELETE | `/api/v1/commerce/tags` | Tag CRUD |
| GET/POST/DELETE | `/api/v1/content` | Content entry CRUD |
| GET/POST/DELETE | `/api/v1/media` | Media library CRUD |
| POST | `/api/v1/media/upload` | Multipart file → MinIO/S3 |
| POST | `/api/v1/site/publish` | Generate static HTML |
| GET/POST | `/api/v1/theme/settings` | Theme settings |
| GET | `/api/v1/plugins` | List installed plugins |
| GET | `/api/v1/themes` | List installed themes |

---

## CURRENT METRICS

| Component | Tests | Test Files |
|---|---|---|
| Core | 137 | 14+ |
| SDK | 58 | 9 |
| CLI | 13 | 1 |
| Commerce | 167 | 11 |
| CMS | 70 | 6 |
| Forms | 58 | 6 |
| SEO | 22 | 3 |
| Analytics | 23 | 2 |
| Registry | 6 | 1 |
| Cloud | 7 | 1 |
| Enterprise | 2 | 1 |
| Others | ~150 | ~60 |
| **Total** | **~716** | **~120** |

- **Commits:** 178+ | **Files:** 340+
- **Docker:** 7 containers (nginx, core, postgres, redis, minio, opensearch, mailhog) — all healthy
- **5 services:** database, redis, storage, opensearch, email — all connected
- **5 plugins auto-registered:** auth, cms, commerce, forms, seo
