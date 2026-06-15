# AGENTS.md — Extora Development Instructions

This file provides instructions for AI coding agents (OpenCode, Claude, Codex, etc.) working on the Extora project.

---

## PROJECT OVERVIEW

**Extora** is a TypeScript-first plugin ecosystem platform. It is NOT a CMS, ERP, or website builder. It is the operating system for web software.

**Repository:** `extorastudio/Extora` (GitHub)
**Blueprint:** `EXTORA_MEGA_BLUEPRINT_v2.0.md`
**Journal:** `EXTORA_DEVELOPMENT_JOURNAL.md`
**License:** MIT (Core, SDK, CLI, Plugins) + Proprietary (Studio, Commerce, Cloud)

---

## MONOREPO STRUCTURE

```
Extora/
├── apps/           # Applications
│   ├── core/       # Runtime engine (Node.js + Fastify + Prisma)
│   ├── studio/     # Admin UI (React + Vite + Tailwind)
│   └── cli/        # CLI tool (Commander.js)
├── packages/       # Shared libraries
│   ├── sdk/        # @extora/sdk — 10 subpath exports
│   ├── types/      # @extora/types — Shared TypeScript interfaces
│   ├── utils/      # @extora/utils
│   ├── ui/         # @extora/ui
│   └── config/     # @extora/config
├── plugins/        # Official plugins (MIT licensed except Commerce)
│   ├── auth/       # Authentication
│   ├── cms/        # Content management
│   ├── commerce/   # Ecommerce (PROPRIETARY)
│   ├── forms/      # Form builder
│   ├── seo/        # SEO tools
│   └── analytics/  # Analytics tracking
├── themes/         # Official themes
├── starters/       # Starter kits
├── docker/         # Docker configurations
├── examples/       # Example plugins
└── scripts/        # Utility scripts
```

---

## CRITICAL RULES

### 1. NEVER PUSH UNTIL ALL CHECKS PASS LOCALLY

```bash
# Run ALL of these before pushing. If any fail, DO NOT PUSH.
pnpm install --frozen-lockfile    # Must pass
pnpm lint                          # Must have 0 errors
pnpm typecheck                     # Must pass for all packages
pnpm test                          # All tests must pass
pnpm build                         # All builds must pass
```

### 2. SINGLE COMMIT PER PHASE

Combine code changes + journal updates into ONE commit. Push once per phase/module.

```bash
git add -A
git commit -m "feat: Phase X — description\n\nJournal updated"
git push origin main
```

### 3. JOURNAL AFTER EVERY STEP

After every significant code change, append to `EXTORA_DEVELOPMENT_JOURNAL.md`:
- Date and duration
- Files created/modified
- What was built
- Verification results
- NEVER delete old journal entries

### 4. NEVER PUSH IF CI WILL FAIL

The CI pipeline runs `pnpm lint`, `pnpm build`, and `pnpm test`. If any of these fail locally, DO NOT PUSH. Fix the issue first.

---

## DEVELOPMENT COMMANDS

```bash
pnpm install                    # Install deps
pnpm dev                        # Start all apps
pnpm build                      # Build all packages
pnpm test                       # Run all tests
pnpm lint                       # Lint all code
pnpm typecheck                  # Type-check all packages
pnpm docker:up                  # Start dev Docker services
pnpm docker:down                # Stop Docker services

# Individual packages
pnpm --filter @extora/core test
pnpm --filter @extora/sdk build
pnpm --filter @extora/studio dev
```

---

## CODE CONVENTIONS

### TypeScript
- Strict mode enabled (`tsconfig.base.json`)
- Use `import type` for type-only imports
- No non-null assertions (`!`) unless suppressed
- No `any` - use `unknown` with proper narrowing
- File extensions: `.ts` for source, `.tsx` for React
- Import paths use `.js` extension (for ESM compatibility)

### ESLint
- Flat config (`eslint.config.mjs`)
- Strict type-checked rules (with Prisma exceptions)
- Test files relaxed rules (no-require-await, no-empty-function off)
- CLI files: `no-console` off

### Testing
- Vitest for all tests
- Test files: `tests/*.test.ts`
- Use descriptive test names
- Mock PrismaClient with `as unknown as PrismaClient`
- Use SDK mock factories (`createMockEventBus`, etc.)

### Git
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- Branch: `main` (trunk-based)
- No force pushes

---

## ARCHITECTURE PATTERNS

### Plugin Development Pattern
```typescript
import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

export default class MyPlugin extends BasePlugin {
  override manifest: PluginManifest = { /* ... */ };
  override async onInstall(): Promise<void> { /* Create tables */ }
  override async onActivate(): Promise<void> { /* Register hooks */ }
  override async onDeactivate(): Promise<void> { /* Cleanup */ }
}
```

### Database Access
```typescript
const db = this.db.getPluginDb("my-plugin");
await db.createTable("my_table", { id: "TEXT PRIMARY KEY" });
```

### Hook Registration
```typescript
this.addAction("user.registered", async (user) => { /* ... */ });
this.addFilter("content.before_save", async (content) => { return { ...content }; });
```

### Event Publishing
```typescript
await this.publishEvent("order.placed", { orderId: "123", total: 99.99 });
```

---

## COMMON PITFALLS

1. **Prisma types appear as `any`**: ESLint no-unsafe-* rules are disabled globally because Prisma's generated types use complex generics.

2. **tsconfig `include` needs tests for lint**: Test files must be in tsconfig include for ESLint project service. But NOT for build tsconfig.

3. **`packageManager` field**: Required by Turborepo. Must stay in root `package.json`.

4. **Plugin builds**: Plugin tsconfigs must `include` only `src/**/*.ts` for build. Tests are excluded.

5. **Corepack issues**: On macOS Homebrew Node.js 22.13.1, corepack has signature verification bug. Use direct pnpm binary path.

6. **Commerce is proprietary**: Do NOT commit commerce changes with MIT license. Keep `UNLICENSED`.

---

## TEST COUNTS (as of last update)

| Component | Tests | Test Files |
|---|---|---|
| Core | 94 | 12 |
| SDK | 53 | 8 |
| CLI | 8 | 1 |
| Commerce | 81 | 11 |
| CMS | 33 | 6 |
| Forms | 25 | 6 |
| SEO | 12 | 3 |
| Analytics | 9 | 2 |
| **Total** | **315** | **47** |

---

## WHAT TO BUILD NEXT

### Priority 1 — Core Features
- [ ] Commerce API integration tests (Fastify inject)
- [ ] Forms public submission endpoint test
- [ ] CLI `extora serve` command
- [ ] Studio component tests

### Priority 2 — Fixes
- [ ] Docker verification (start services, test health endpoint)
- [ ] Studio build in turbo pipeline
- [ ] Prisma migration on clean DB

### Priority 3 — New Features
- [ ] Extora Registry (private npm)
- [ ] GraphQL support in Core
- [ ] WebSocket support in Core
- [ ] Marketplace publisher dashboard
