# EXTORA MEGA BLUEPRINT v2.0

**Document Classification:** Extora Core Team · Strategic Partners
**Version:** 2.0
**Last Updated:** June 2026
**Status:** Development-Ready
**Replaces:** Extora Founder Blueprint v1.0
**Total Components Defined:** 15

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Philosophy](#3-product-philosophy)
4. [Product Scope](#4-product-scope)
5. [Competitive Analysis](#5-competitive-analysis)
6. [Complete Product Architecture](#6-complete-product-architecture)
7. [Monorepo Structure](#7-monorepo-structure)
8. [Technology Decision Records](#8-technology-decision-records)
9. [Extora Core — Technical Specification](#9-extora-core--technical-specification)
10. [Extora Studio — Technical Specification](#10-extora-studio--technical-specification)
11. [Extora SDK — Complete Specification](#11-extora-sdk--complete-specification)
12. [Extora CLI — Complete Specification](#12-extora-cli--complete-specification)
13. [Extora Registry — Architecture](#13-extora-registry--architecture)
14. [Extora Auth — Plugin Specification](#14-extora-auth--plugin-specification)
15. [Extora CMS — Plugin Specification](#15-extora-cms--plugin-specification)
16. [Extora Commerce — Plugin Specification](#16-extora-commerce--plugin-specification)
17. [Extora Forms — Plugin Specification](#17-extora-forms--plugin-specification)
18. [Extora Starter Kits — Specification](#18-extora-starter-kits--specification)
19. [Extora Marketplace — Architecture v2](#19-extora-marketplace--architecture-v2)
20. [Extora Cloud — Architecture](#20-extora-cloud--architecture)
21. [Extora Enterprise — Architecture](#21-extora-enterprise--architecture)
22. [Extora Docs — Platform Specification](#22-extora-docs--platform-specification)
23. [Development Phases — Execution Plan](#23-development-phases--execution-plan)
24. [Security Architecture](#24-security-architecture)
25. [Infrastructure Architecture](#25-infrastructure-architecture)
26. [Open Source Strategy](#26-open-source-strategy)
27. [Governance Model](#27-governance-model)
28. [Monetization Strategy](#28-monetization-strategy)
29. [Product Roadmap](#29-product-roadmap)
30. [Risks and Challenges](#30-risks-and-challenges)
31. [Success Metrics](#31-success-metrics)
32. [Appendices](#32-appendices)

---

## 1. Executive Summary

### 1.1 Product Vision

Extora is a universal software runtime platform where every piece of functionality — from an ecommerce cart to an authentication provider to a full ERP module — is a pluggable, composable, TypeScript-native package. Extora is not another CMS or application framework. It is the **operating system for web software**, capable of powering a personal blog, a SaaS product, a government portal, or a multi-billion-dollar marketplace, all from the same core runtime.

### 1.2 Mission Statement

> To create the world's most extensible, secure, and developer-friendly software platform where any digital experience can be assembled from plugins and themes — without sacrificing performance, security, or scalability at any scale.

### 1.3 Long-Term Goals (10-Year Horizon)

1. **100,000+ Plugins** spanning every domain (CMS, commerce, analytics, AI, IoT, collaboration, identity, finance, education, health)
2. **10 Million+ Active Installations** across self-hosted, cloud, and enterprise
3. **$500M+ Annual Marketplace GMV**
4. **Become the default answer** for "How do I build X on the web?"
5. **Industry-standard plugin model** adopted beyond Extora itself

### 1.4 Market Positioning

| Market | TAM (2030 est.) | Extora's Angle |
|---|---|---|
| CMS / Web Experience Platforms | $30B+ | Plugin-first, no lock-in |
| Low-Code / No-Code Platforms | $80B+ | Developer-first, extensible |
| PaaS / Cloud Application Platforms | $160B+ | Self-hosted or cloud, open core |

---

## 2. Problem Statement

### 2.1 WordPress Limitations
Monolithic PHP, unisolated plugins, no type system, weak DX, weak multi-tenancy, content-model rigidity.

### 2.2 Modern Framework Limitations
Framework lock-in, no plugin economy, build-vs-buy dilemma, operational burden, no unified admin.

### 2.3 Why Extora
Bridges ecosystem platforms (WordPress) and modern frameworks (Next.js). Plugin model is a first-class architectural primitive. Marketplace is native. DX rivals modern frameworks. Scales from Raspberry Pi to Kubernetes.

---

## 3. Product Philosophy

1. **Plugin First** — Every feature is or could be a plugin
2. **API First** — Single versioned API for all interfaces
3. **TypeScript First** — End-to-end strong typing
4. **Container First** — Docker from dev to prod
5. **Security First** — Architected, not retrofitted
6. **Marketplace First** — Native, not bolted on

---

## 4. Product Scope

### What Extora Is
Plugin runtime platform, administrative interface (Studio), marketplace, SDK + CLI, cloud hosting, enterprise solution, composable application framework.

### What Extora Is Not
Not a CMS, not an ERP, not ecommerce, not a website builder, not low-code for non-developers, not SaaS-only.

### Target Audience
Plugin Developers, Theme Developers, Solution Integrators, Business Owners, Enterprise IT, SaaS Builders, Community Contributors.

### Primary Use Cases
Content websites, ecommerce platforms, business applications, SaaS products, community portals, enterprise portals, headless backends, government portals.

---

## 5. Competitive Analysis

| Platform | Architect. | Plugin Model | DX | Type Safety | Marketplace | Self-Host | Multi-Tenant |
|---|---|---|---|---|---|---|---|
| WordPress | Mono PHP | Flat, unisolated | Weak | None | Yes | Yes | Weak |
| Strapi | Headless CMS | Plugin system | Good | Partial | Yes | Yes | No |
| Directus | Headless CMS | Extensions | Good | Partial | No | Yes | No |
| Odoo | Mono ERP | Modules | Weak | None | Yes | Yes | Yes |
| Shopify | Proprietary SaaS | App store | Good | Partial | Yes | No | SaaS |
| **Extora** | **Plugin Runtime** | **Isolated, typed, sandboxed** | **Excellent** | **Full TS** | **Yes (native)** | **Yes** | **Yes** |

---

## 6. Complete Product Architecture

### 6.1 Ecosystem Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              EXTORA ECOSYSTEM v2.0                                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ╔══════════════════════════════════════════════════════════════════════════════╗ │
│  ║                         DEVELOPER TOOLCHAIN                                   ║ │
│  ║  ┌──────────┐  ┌──────────┐  ┌────────────────┐  ┌─────────────────────┐    ║ │
│  ║  │   CLI    │  │   SDK    │  │  Starter Kits  │  │    Extora Docs      │    ║ │
│  ║  │ @extora/ │  │ @extora/ │  │ (Blog, Ecom,   │  │ (docs.extora.dev)   │    ║ │
│  ║  │   cli    │  │   sdk    │  │  SaaS, Portf.) │  │                     │    ║ │
│  ║  └────┬─────┘  └────┬─────┘  └───────┬────────┘  └──────────┬──────────┘    ║ │
│  ╚═══════╪═════════════╪════════════════╪══════════════════════╪════════════════╝ │
│          │             │                │                      │                  │
│          │        ┌────▼────────┐       │                      │                  │
│          │        │  Registry   │◄──────┘                      │                  │
│          │        │  (Private   │                               │                  │
│          │        │   npm/pkg)  │                               │                  │
│          │        └──────┬──────┘                               │                  │
│          │               │                                      │                  │
│  ╔═══════▼═══════════════▼══════════════════════════════════════▼════════════════╗ │
│  ║                      EXTORA CORE (Runtime Engine)                              ║ │
│  ║  Plugin Loader | Event Bus | Hook System | API Engine | Auth | Config Mgr     ║ │
│  ║  Media Mgr | DB Abstraction | Queue System | Cache Mgr | Logger | Sandbox   ║ │
│  ║  Technology: Node.js 22 · TypeScript 5.7 · Fastify · Prisma · BullMQ · Zod    ║ │
│  ╚══════════╤════════════════════════════════════════════════════════════════════╝ │
│             │                                                                      │
│  ╔══════════╩════════════════════════════════════════════════════════════════════╗ │
│  ║                    ADMINISTRATION & DISTRIBUTION                               ║ │
│  ║  ┌───────────────┐  ┌────────────────┐  ┌───────────┐  ┌──────────────────┐  ║ │
│  ║  │    Studio     │  │  Marketplace   │  │   Cloud   │  │   Enterprise     │  ║ │
│  ║  │  (Admin UI)   │  │  (Store + API) │  │ (Hosting) │  │  (Compliance)    │  ║ │
│  ║  │  React · Vite ·│  │  Next.js ·     │  │  K8s ·    │  │  SSO · SAML ·   │  ║ │
│  ║  │  Tailwind     │  │  PostgreSQL    │  │  Multi-AZ │  │  Multi-Tenant    │  ║ │
│  ║  └───────────────┘  └────────────────┘  └───────────┘  └──────────────────┘  ║ │
│  ╚═══════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                   │
│  ╔══════════════════════════════════════════════════════════════════════════════╗ │
│  ║                     FIRST-PARTY OFFICIAL PLUGINS                              ║ │
│  ║  ┌──────┐  ┌──────┐  ┌──────────┐  ┌────────┐  ┌───────┐  ┌─────────────┐  ║ │
│  ║  │ Auth │  │ CMS  │  │ Commerce │  │ Forms  │  │  SEO  │  │  Analytics  │  ║ │
│  ║  │ v1.0 │  │ v1.0 │  │   v1.0   │  │ v1.0   │  │  Y2   │  │    Y3       │  ║ │
│  ║  └──────┘  └──────┘  └──────────┘  └────────┘  └───────┘  └─────────────┘  ║ │
│  ╚══════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                   │
│  ╔══════════════════════════════════════════════════════════════════════════════╗ │
│  ║                      INFRASTRUCTURE LAYER                                     ║ │
│  ║  ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐ ┌────────┐ ║ │
│  ║  │PostgreSQL│ │ Redis  │ │ MinIO  │ │ Nginx  │ │  OpenSearch  │ │ Docker │ ║ │
│  ║  │   16+    │ │  7+    │ │  (S3)  │ │/Caddy  │ │              │ │ /K8s   │ ║ │
│  ║  └──────────┘ └────────┘ └────────┘ └────────┘ └──────────────┘ └────────┘ ║ │
│  ╚══════════════════════════════════════════════════════════════════════════════╝ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Component Ownership Matrix

| Component | Repository | License | Team |
|---|---|---|---|
| Extora Core | `extora-core` (public) | MIT | Core Team |
| Extora Studio | `extora-studio` (private) | Community License | Studio Team |
| Extora SDK | `extora-sdk` (public) | MIT | Core Team |
| Extora CLI | `extora-cli` (public) | MIT | DX Team |
| Extora Registry | `extora-registry` (private) | Proprietary | Infra Team |
| Extora Marketplace | `extora-marketplace` (private) | Proprietary | Platform Team |
| Extora Cloud | `extora-cloud` (private) | Proprietary | Infra Team |
| Extora Enterprise | `extora-enterprise` (private) | Proprietary | Enterprise Team |
| Extora Docs | `extora-docs` (public) | MIT / CC-BY | DX Team |
| Extora Auth | `extora-auth` (public) | MIT | Core Team |
| Extora CMS | `extora-cms` (public) | MIT | CMS Team |
| Extora Commerce | `extora-commerce` (private) | Proprietary | Commerce Team |
| Extora Forms | `extora-forms` (public) | MIT | CMS Team |
| Extora Starter Kits | `extora-starters` (public) | MIT | DX Team |

---

## 7. Monorepo Structure

### 7.1 Complete Directory Tree

```
extora/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   ├── security-scan.yml
│   │   └── preview-deploy.yml
│   ├── ISSUE_TEMPLATE/
│   └── CODEOWNERS
│
├── apps/
│   ├── core/                         # Extora Core Runtime
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── bootstrap.ts
│   │   │   ├── server.ts
│   │   │   ├── plugin-loader/        # loader.ts, sandbox.ts, resolver.ts, lifecycle.ts
│   │   │   ├── event-bus/            # bus.ts, event-store.ts
│   │   │   ├── hooks/                # registry.ts, executor.ts
│   │   │   ├── api/                  # router.ts, middleware/, graphql.ts
│   │   │   ├── auth/                 # jwt.ts, oauth.ts, mfa.ts
│   │   │   ├── authorization/        # rbac.ts, abac.ts
│   │   │   ├── config/
│   │   │   ├── database/
│   │   │   ├── media/
│   │   │   ├── queue/
│   │   │   ├── cache/
│   │   │   ├── logger/
│   │   │   └── telemetry/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── studio/                       # Extora Studio (Admin UI)
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   ├── api/client.ts
│   │   │   ├── stores/               # auth-store, plugin-store, config-store, etc.
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn/ui
│   │   │   │   ├── layout/
│   │   │   │   └── shared/
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── users/
│   │   │   │   ├── plugins/
│   │   │   │   ├── themes/
│   │   │   │   ├── content/
│   │   │   │   ├── config/
│   │   │   │   ├── services/
│   │   │   │   ├── backup/
│   │   │   │   ├── monitoring/
│   │   │   │   ├── deployment/
│   │   │   │   └── system/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── i18n/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── cli/                          # Extora CLI
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── commands/
│   │   │   │   ├── create.ts
│   │   │   │   ├── dev.ts
│   │   │   │   ├── build.ts
│   │   │   │   ├── test.ts
│   │   │   │   ├── publish.ts
│   │   │   │   ├── plugin.ts
│   │   │   │   ├── docker.ts
│   │   │   │   ├── generate.ts
│   │   │   │   └── shell.ts
│   │   │   ├── templates/
│   │   │   │   ├── plugin-basic/
│   │   │   │   ├── plugin-api/
│   │   │   │   ├── plugin-admin/
│   │   │   │   ├── plugin-full/
│   │   │   │   ├── theme-basic/
│   │   │   │   └── starter/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── marketplace/                  # Marketplace Web App
│   ├── registry/                     # Private npm Registry
│   ├── cloud/                        # Cloud Hosting Platform
│   ├── enterprise/                   # Enterprise Features
│   └── docs/                         # Documentation Platform
│
├── packages/
│   ├── sdk/                          # @extora/sdk
│   │   └── src/
│   │       ├── index.ts
│   │       ├── plugin.ts
│   │       ├── hooks.ts
│   │       ├── events.ts
│   │       ├── database.ts
│   │       ├── api.ts
│   │       ├── config.ts
│   │       ├── cli.ts
│   │       ├── studio.ts
│   │       └── testing/
│   ├── types/                        # @extora/types
│   ├── utils/                        # @extora/utils
│   ├── ui/                           # @extora/ui (shared React components)
│   └── config/                       # @extora/config
│
├── plugins/
│   ├── auth/                         # @extora/auth
│   ├── cms/                          # @extora/cms
│   ├── commerce/                     # @extora/commerce
│   ├── forms/                        # @extora/forms
│   ├── seo/                          # @extora/seo (Year 2)
│   └── analytics/                    # @extora/analytics (Year 3)
│
├── themes/
│   ├── default/
│   └── admin/
│
├── starters/
│   ├── blog/
│   ├── ecommerce/
│   ├── saas/
│   ├── portfolio/
│   └── docs/
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── Dockerfile.core
│   └── Dockerfile.studio
│
├── scripts/
│   ├── setup.sh
│   ├── dev.sh
│   ├── build.sh
│   ├── test.sh
│   └── release.sh
│
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .eslintrc.js
├── .prettierrc
├── .gitignore
└── README.md
```

### 7.2 Workspace Configuration

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "plugins/*"
  - "themes/*"
  - "starters/*"
```

**`turbo.json` (key tasks):**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["tsconfig.base.json"],
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["build"] },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
    "format": {}
  }
}
```

---

## 8. Technology Decision Records

### TDR-001: Fastify over Express
**Decision:** Fastify. **Rationale:** 2x faster, built-in schema validation, first-class TypeScript, plugin architecture mirrors Extora's own model.

### TDR-002: Prisma over TypeORM/Drizzle
**Decision:** Prisma. **Rationale:** Best-in-class TS integration, auto-generated types, migration system. Drizzle considered for v2 if bundle size critical.

### TDR-003: pnpm over npm/yarn
**Decision:** pnpm. **Rationale:** Strict dependency resolution (prevents phantom deps), disk-efficient, fastest installs, native workspace protocol.

### TDR-004: Turborepo over Nx/Lerna
**Decision:** Turborepo. **Rationale:** Simpler config, excellent caching, Vercel backing. Nx adds complexity not yet needed.

### TDR-005: Zustand over Redux
**Decision:** Zustand. **Rationale:** Minimal boilerplate, TS-first, no provider wrapping. Redux overkill for admin panel.

### TDR-006: Tailwind CSS + shadcn/ui over MUI/Ant Design
**Decision:** Tailwind + shadcn/ui. **Rationale:** Own the components (copy-paste), accessible, unstyled. MUI too opinionated/heavy.

### TDR-007: BullMQ over RabbitMQ
**Decision:** BullMQ. **Rationale:** Redis-backed (one less infra component), excellent TS support, sufficient for first 5 years.

### TDR-008: Vite over Webpack
**Decision:** Vite. **Rationale:** 10-100x faster dev, native ESM, simpler config.

### TDR-009: Vitest over Jest
**Decision:** Vitest. **Rationale:** Native ESM, Vite-compatible, faster, Jest API compatible.

### TDR-010: PostgreSQL over MySQL/MongoDB
**Decision:** PostgreSQL. **Rationale:** ACID, JSON/JSONB, full-text search, RLS for multi-tenancy, best Prisma support.

### TDR-011: Zod over Yup/Joi
**Decision:** Zod. **Rationale:** TS-first (types inferred from schemas), composable, Fastify integration, used everywhere.

---

## 9. Extora Core — Technical Specification

### 9.1 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 22 LTS |
| Language | TypeScript | 5.7+ |
| HTTP Framework | Fastify | 5.x |
| ORM | Prisma | 6.x |
| Validation | Zod | 3.x |
| Queue | BullMQ | 5.x |
| Cache Client | ioredis | 5.x |
| Object Storage | @aws-sdk/client-s3 | 3.x |
| Logging | pino | 9.x |
| Telemetry | @opentelemetry/* | Latest |
| Testing | Vitest | 2.x |
| Package Manager | pnpm | 9.x |

### 9.2 Core Bootstrap Sequence

```
1. Load environment variables (dotenv)
2. Initialize logger (pino)
3. Initialize OpenTelemetry SDK
4. Load core configuration (defaults -> env -> database -> runtime)
5. Connect to PostgreSQL (Prisma client)
6. Connect to Redis (ioredis)
7. Run pending database migrations (Prisma migrate)
8. Initialize cache manager
9. Initialize queue manager (BullMQ)
10. Initialize event bus
11. Initialize hook system
12. Initialize media manager
13. Discover installed plugins from database
14. Resolve plugin dependency graph (topological sort)
15. Load plugins in dependency order (with sandboxing)
16. Execute plugin `onInstall` hooks (for newly installed plugins)
17. Execute plugin `onActivate` hooks
18. Initialize API engine (register plugin routes + middleware)
19. Start Fastify server (HTTP + WebSocket)
20. Execute `onBootComplete` hook
21. Start health check endpoint
22. Log "Extora Core vX.Y.Z ready on port N"
```

### 9.3 Core Database Schema (`schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- Users & Authentication ---

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?
  displayName   String
  avatarUrl     String?
  role          Role      @default(VIEWER)
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  apiKeys       ApiKey[]
  identities    AuthIdentity[]
  mfaMethods    MfaMethod[]
  auditLogs     AuditLog[]
}

enum Role {
  SUPER_ADMIN
  ADMIN
  EDITOR
  AUTHOR
  VIEWER
}

model Session {
  id           String    @id @default(cuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash    String    @unique
  refreshToken String?   @unique
  ipAddress    String?
  userAgent    String?
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  @@index([userId])
  @@index([tokenHash])
}

model ApiKey {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  keyPrefix   String
  keyHash     String    @unique
  scopes      Json      @default("[]")
  expiresAt   DateTime?
  lastUsedAt  DateTime?
  createdAt   DateTime  @default(now())
  revokedAt   DateTime?
  @@index([userId])
  @@index([keyHash])
}

model AuthIdentity {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider       String   // google, github, microsoft, apple, saml, ldap
  providerUserId String
  providerData   Json?
  createdAt      DateTime @default(now())
  @@unique([provider, providerUserId])
}

model MfaMethod {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  type       String    // totp, sms, email, webauthn
  secret     String?
  isEnabled  Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  @@index([userId])
}

// --- Roles & Permissions ---

model Permission {
  id          String   @id @default(cuid())
  resource    String   // "user", "plugin", "content", "system"
  action      String   // "create", "read", "update", "delete", "manage"
  description String?
  createdAt   DateTime @default(now())
  rolePermissions RolePermission[]
  @@unique([resource, action])
}

model RolePermission {
  roleId       String
  role         RoleDefinition  @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permissionId String
  permission   Permission      @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
}

model RoleDefinition {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  permissions RolePermission[]
  users       UserRole[]
}

model UserRole {
  userId String
  user   User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  roleId String
  role   RoleDefinition @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@id([userId, roleId])
}

// --- Plugins ---

model Plugin {
  id            String    @id @default(cuid())
  name          String    @unique  // @vendor/plugin-name
  title         String
  description   String?
  version       String
  type          String    @default("plugin")  // plugin | theme
  author        String
  authorEmail   String?
  license       String    @default("MIT")
  entryServer   String?
  entryStudio   String?
  entryCli      String?
  manifest      Json
  permissions   Json      @default("[]")
  dependencies  Json      @default("{}")
  isActive      Boolean   @default(false)
  isSystem      Boolean   @default(false)
  checksum      String?
  installedAt   DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  configs       PluginConfig[]
  migrations    PluginMigration[]
}

model PluginConfig {
  id        String   @id @default(cuid())
  pluginId  String
  plugin    Plugin   @relation(fields: [pluginId], references: [id], onDelete: Cascade)
  key       String
  value     Json
  isSecret  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([pluginId, key])
}

model PluginMigration {
  id         String   @id @default(cuid())
  pluginId   String
  plugin     Plugin   @relation(fields: [pluginId], references: [id], onDelete: Cascade)
  name       String
  version    String
  appliedAt  DateTime @default(now())
  @@unique([pluginId, name])
}

// --- Themes ---

model Theme {
  id          String    @id @default(cuid())
  name        String    @unique
  title       String
  version     String
  author      String
  isActive    Boolean   @default(false)
  manifest    Json
  installedAt DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  configs     ThemeConfig[]
}

model ThemeConfig {
  id       String   @id @default(cuid())
  themeId  String
  theme    Theme    @relation(fields: [themeId], references: [id], onDelete: Cascade)
  key      String
  value    Json
  isSecret Boolean  @default(false)
  @@unique([themeId, key])
}

// --- Configuration ---

model SystemConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  isSecret  Boolean  @default(false)
  updatedAt DateTime @updatedAt
}

model ConfigHistory {
  id         String   @id @default(cuid())
  configKey  String
  oldValue   Json?
  newValue   Json
  changedBy  String?
  changedAt  DateTime @default(now())
  @@index([configKey])
}

// --- Events ---

model Event {
  id         String   @id @default(cuid())
  type       String
  payload    Json
  source     String?
  tenantId   String?
  createdAt  DateTime @default(now())
  @@index([type])
  @@index([source])
  @@index([tenantId])
  @@index([createdAt])
}

// --- Audit Logs ---

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action     String
  resource   String
  outcome    String   // success | failure | denied
  details    Json?
  ipAddress  String?
  userAgent  String?
  tenantId   String?
  createdAt  DateTime @default(now())
  @@index([userId])
  @@index([action])
  @@index([resource])
  @@index([createdAt])
}

// --- Media ---

model Media {
  id              String   @id @default(cuid())
  filename        String
  originalName    String
  mimeType        String
  size            Int
  width           Int?
  height          Int?
  storageBackend  String   @default("local")
  storagePath     String
  url             String
  thumbnailUrl    String?
  metadata        Json?
  uploadedBy      String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([mimeType])
  @@index([uploadedBy])
}

// --- Job Queue ---

model Job {
  id          String   @id @default(cuid())
  queue       String
  name        String
  data        Json
  status      String   @default("waiting")
  priority    Int      @default(0)
  attempts    Int      @default(0)
  maxAttempts Int      @default(3)
  error       String?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now())
  @@index([queue, status])
}

// --- Rate Limiting ---

model RateLimit {
  id        String   @id @default(cuid())
  key       String   @unique
  points    Int      @default(0)
  expiresAt DateTime
  @@index([key])
  @@index([expiresAt])
}
```

### 9.4 Core API Endpoints

```
Base Path: /api/v1

=== AUTHENTICATION ===
POST   /auth/login              Login with email/password
POST   /auth/register           Register new user
POST   /auth/logout             Invalidate session
POST   /auth/refresh            Refresh access token
POST   /auth/verify-email       Verify email with token
POST   /auth/reset-password     Request password reset
POST   /auth/reset-password/confirm  Confirm password reset
POST   /auth/mfa/setup          Setup MFA (TOTP)
POST   /auth/mfa/verify         Verify MFA code
GET    /auth/oauth/:provider    Initiate OAuth flow
GET    /auth/oauth/:provider/callback  OAuth callback
GET    /auth/session            Get current session info

=== USERS ===
GET    /users                   List users (paginated)
GET    /users/:id               Get user by ID
POST   /users                   Create user
PATCH  /users/:id               Update user
DELETE /users/:id               Delete user (soft)
GET    /users/:id/sessions      Get user sessions
DELETE /users/:id/sessions/:sid Revoke session

=== ROLES & PERMISSIONS ===
GET    /roles                   List roles
POST   /roles                   Create role
PATCH  /roles/:id               Update role
DELETE /roles/:id               Delete role
GET    /permissions             List permissions
GET    /roles/:id/permissions   Get role permissions
PUT    /roles/:id/permissions   Set role permissions

=== PLUGINS ===
GET    /plugins                 List installed plugins
GET    /plugins/:name           Get plugin details
POST   /plugins/install         Install plugin
POST   /plugins/:name/activate  Activate plugin
POST   /plugins/:name/deactivate Deactivate plugin
POST   /plugins/:name/update    Update plugin
DELETE /plugins/:name           Uninstall plugin
GET    /plugins/:name/config    Get plugin config
PUT    /plugins/:name/config    Update plugin config
GET    /plugins/:name/health    Plugin health check

=== THEMES ===
GET    /themes                  List installed themes
GET    /themes/:name            Get theme details
POST   /themes/install          Install theme
POST   /themes/:name/activate   Activate theme
DELETE /themes/:name            Uninstall theme

=== CONFIGURATION ===
GET    /config                  Get all system config
GET    /config/:key             Get specific config
PUT    /config/:key             Set config value
GET    /config/history          Get config change history
POST   /config/export           Export configuration
POST   /config/import           Import configuration

=== MEDIA ===
GET    /media                   List media (paginated)
POST   /media/upload            Upload file(s)
GET    /media/:id               Get media metadata
GET    /media/:id/file          Get media file/stream
DELETE /media/:id               Delete media
POST   /media/:id/transform     Transform image (resize/crop)

=== SYSTEM ===
GET    /system/health           Health check
GET    /system/info             System information
GET    /system/metrics          Prometheus metrics
GET    /system/logs             Recent log entries
POST   /system/cache/clear      Clear cache
POST   /system/maintenance/on   Enable maintenance mode
POST   /system/maintenance/off  Disable maintenance mode
GET    /system/updates          Check for updates

=== BACKUP & RESTORE ===
GET    /backups                 List backups
POST   /backups                 Create backup
GET    /backups/:id             Get backup details
POST   /backups/:id/restore     Restore backup
DELETE /backups/:id             Delete backup

=== MARKETPLACE (Core-side proxy) ===
GET    /marketplace/search      Search plugins/themes
GET    /marketplace/package/:name  Get package info
GET    /marketplace/categories  List categories

=== WEBHOOKS ===
GET    /webhooks                List webhooks
POST   /webhooks                Create webhook
PATCH  /webhooks/:id            Update webhook
DELETE /webhooks/:id            Delete webhook
GET    /webhooks/:id/deliveries Delivery history
```

### 9.5 Environment Variables

```bash
# --- Required ---
DATABASE_URL=postgresql://user:pass@localhost:5432/extora
REDIS_URL=redis://localhost:6379
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENCRYPTION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# --- Optional with defaults ---
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=*
SESSION_TTL=15m
REFRESH_TOKEN_TTL=7d
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m

# --- Object Storage ---
STORAGE_BACKEND=local
STORAGE_LOCAL_PATH=./storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=extora
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# --- Search ---
OPENSEARCH_URL=http://localhost:9200

# --- Email ---
SMTP_HOST=smtp.example.com
SMTP_PORT=587
EMAIL_FROM=noreply@extora.dev

# --- Marketplace ---
MARKETPLACE_API_URL=https://marketplace.extora.dev/api

# --- Registry ---
REGISTRY_URL=https://registry.extora.dev

# --- Telemetry ---
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=extora-core
```

---

## 10. Extora Studio — Technical Specification

### 10.1 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19 |
| Build Tool | Vite | 6.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui | Latest |
| State Management | Zustand | 5.x |
| Server State | TanStack Query | 5.x |
| Routing | TanStack Router | 1.x |
| Forms | React Hook Form | 7.x |
| Icons | Lucide React | Latest |
| Charts | Recharts | 2.x |
| Tables | TanStack Table | 8.x |
| Code Editor | Monaco Editor | Latest |
| Testing | Vitest + Playwright | Latest |

### 10.2 Studio Routing Map

```
Route                           Page Component          Required Permission
=============================================================================
/                               Dashboard               viewer
/login                          Login                   none
/setup                          Setup Wizard            none

/users                          UserList                user:read
/users/:id                      UserDetail              user:read
/users/:id/edit                 UserEdit                user:write
/roles                          RoleList                role:read
/roles/:id                      RoleDetail              role:read
/api-keys                       ApiKeyList              user:read

/plugins                        PluginList              plugin:read
/plugins/marketplace            PluginMarketplace       plugin:install
/plugins/:name                  PluginDetail            plugin:read
/plugins/:name/settings         PluginSettings          plugin:configure

/themes                         ThemeList               theme:read
/themes/marketplace             ThemeMarketplace        theme:install
/themes/:name                   ThemeDetail             theme:read
/themes/:name/customize         ThemeCustomize          theme:configure

/content                        ContentDashboard        content:read
/content/:type                  ContentTypeList         content:read
/content/:type/new              ContentEntryNew         content:write
/content/:type/:id              ContentEntryEdit        content:write
/media                          MediaLibrary            media:read

/config                         ConfigGeneral          config:read
/config/environment             ConfigEnvironment      config:read
/config/services                ConfigServices         config:read
/config/advanced                ConfigAdvanced         config:read

/services/database              ServiceDatabase        system:read
/services/cache                 ServiceCache           system:read
/services/storage               ServiceStorage         system:read
/services/search                ServiceSearch          system:read
/services/email                 ServiceEmail           system:read

/backups                        BackupList             backup:read
/backups/:id                    BackupDetail           backup:read
/backups/schedule               BackupSchedule         backup:write

/monitoring/metrics             MonitoringMetrics      system:read
/monitoring/logs                MonitoringLogs         system:read
/monitoring/alerts              MonitoringAlerts       system:read

/deployment                     DeploymentDashboard     deploy:read
/deployment/history             DeploymentHistory      deploy:read

/system/updates                 SystemUpdates          system:update
/system/health                  SystemHealth           system:read
/system/info                    SystemInfo             system:read
/system/tools                   SystemTools            system:read

/profile                        UserProfile            (authenticated)
```

### 10.3 State Management (Zustand Stores)

```typescript
// stores/auth-store.ts
interface AuthStore {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// stores/plugin-store.ts
interface PluginStore {
  plugins: Plugin[];
  installedPlugins: Map<string, Plugin>;
  activePlugins: Set<string>;
  isLoading: boolean;
  fetchPlugins: () => Promise<void>;
  installPlugin: (name: string) => Promise<void>;
  activatePlugin: (name: string) => Promise<void>;
  deactivatePlugin: (name: string) => Promise<void>;
  uninstallPlugin: (name: string) => Promise<void>;
}

// stores/notification-store.ts
interface NotificationStore {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
}

// stores/config-store.ts
interface ConfigStore {
  config: Record<string, any>;
  isLoading: boolean;
  fetchConfig: () => Promise<void>;
  updateConfig: (key: string, value: any) => Promise<void>;
}

// stores/backup-store.ts
interface BackupStore {
  backups: Backup[];
  isLoading: boolean;
  isCreating: boolean;
  isRestoring: boolean;
  restoreProgress: number;
  fetchBackups: () => Promise<void>;
  createBackup: (scope: BackupScope) => Promise<void>;
  restoreBackup: (id: string) => Promise<void>;
}
```

### 10.4 Component Architecture (Atomic Design)

```
atoms/     Button, Input, Label, Badge, Avatar, Icon, Spinner, Toggle, Chip
molecules/ SearchBar, DataTable, Pagination, FormField, ConfirmDialog,
           DropdownMenu, Breadcrumb, StatCard, StatusBadge, FileUploader,
           JsonEditor, CodeBlock, ColorPicker, DateRangePicker
organisms/ Navbar, Sidebar, UserTable, PluginCard, PluginGrid,
           MetricsChart, LogViewer, BackupTimeline, ConfigEditor,
           PermissionMatrix, RoleEditor, ThemePreview, MediaGrid
templates/ DashboardLayout, SettingsLayout, ContentLayout, WizardLayout,
           AuthLayout, FullPageLayout, SplitPaneLayout
pages/     Dashboard, Users, Plugins, Themes, Content, Config,
           Services, Backups, Monitoring, Deployment, System
```

### 10.5 Studio Plugin System (UI Extensions)

Plugins extend Studio UI via three mechanisms:

1. **Slot-Based Registration:** Plugins register React components into named slots.
   Slots: `sidebar.nav`, `dashboard.widget`, `content.editor.toolbar`, `user.profile.tab`, `settings.section`

2. **Route Registration:** Plugins register new routes in Studio navigation.

3. **iFrame Isolation:** Untrusted plugin UIs render in sandboxed iframes with postMessage API.

---

## 11. Extora SDK — Complete Specification

### 11.1 Package Surface

```typescript
export * from '@extora/sdk/plugin';
export * from '@extora/sdk/hooks';
export * from '@extora/sdk/events';
export * from '@extora/sdk/database';
export * from '@extora/sdk/api';
export * from '@extora/sdk/config';
export * from '@extora/sdk/cli';
export * from '@extora/sdk/studio';
export * from '@extora/sdk/testing';
export * from '@extora/types';
```

### 11.2 Plugin Base Class

```typescript
export abstract class BasePlugin implements PluginLifecycle {
  abstract manifest: PluginManifest;
  protected context!: PluginContext;

  _injectContext(ctx: PluginContext): void { this.context = ctx; }

  async onInstall(): Promise<void> {}
  async onActivate(): Promise<void> {}
  async onDeactivate(): Promise<void> {}
  async onUninstall(): Promise<void> {}
  async onUpdate(previousVersion: string): Promise<void> {}

  get logger() { return this.context.logger; }
  get db() { return this.context.database; }
  get cache() { return this.context.cache; }

  async publishEvent<T>(type: string, payload: T): Promise<void> {
    return this.context.eventBus.publish(type, payload, this.manifest.name);
  }

  subscribeEvent<T>(type: string, handler: (payload: T) => Promise<void>): void {
    return this.context.eventBus.subscribe(type, handler, this.manifest.name);
  }
}
```

### 11.3 Hook Registration API

```typescript
export function addAction(
  hookName: string,
  callback: (...args: any[]) => Promise<void> | void,
  priority?: HookPriority
): void;

export function addFilter<T>(
  hookName: string,
  callback: (value: T, ...args: any[]) => Promise<T> | T,
  priority?: HookPriority
): void;

export function removeAction(hookName: string, callback: Function): void;
export function removeFilter(hookName: string, callback: Function): void;
export function doAction(hookName: string, ...args: any[]): Promise<void>;
export function applyFilters<T>(hookName: string, value: T, ...args: any[]): Promise<T>;
```

### 11.4 Database Helpers

```typescript
export abstract class BaseMigration implements Migration {
  abstract name: string;
  abstract version: string;
  abstract up(db: PrismaClient): Promise<void>;
  abstract down(db: PrismaClient): Promise<void>;
}

export function createMigrationRunner(pluginName: string): {
  register: (migration: BaseMigration) => void;
  runPending: (db: PrismaClient) => Promise<void>;
  rollback: (db: PrismaClient, steps: number) => Promise<void>;
};
```

### 11.5 API Endpoint Helpers

```typescript
export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  schema?: { body?: z.ZodType; query?: z.ZodType; params?: z.ZodType; response?: Record<number, z.ZodType> };
  handler: (request: FastifyRequest, reply: FastifyReply) => Promise<any>;
  middleware?: Array<(request: FastifyRequest, reply: FastifyReply) => Promise<void>>;
}

export function registerRoutes(
  server: FastifyInstance, pluginName: string, routes: RouteDefinition[]
): void;
```

### 11.6 Testing Utilities

```typescript
export interface MockCore {
  database: PrismaClient;
  eventBus: EventBus;
  hooks: HookRegistry;
  cache: CacheManager;
  logger: MockLogger;
  config: Record<string, any>;
}

export function createMockCore(overrides?: Partial<MockCore>): MockCore;

export function createTestPlugin<T extends BasePlugin>(
  PluginClass: new () => T, mockCore?: Partial<MockCore>
): { plugin: T; core: MockCore; activate: () => Promise<void> };

export function createTestServer(options?: {
  plugins?: BasePlugin[];
}): Promise<{ server: FastifyInstance; url: string; close: () => Promise<void> }>;
```

---

## 12. Extora CLI — Complete Specification

### 12.1 Command Tree

```
extora
├── create <type> <name> [options]
│   ├── type: plugin | theme | starter
│   ├── options: --api, --admin, --full, --commerce
│   └── extora create plugin my-plugin
│
├── dev [--port, --host, --inspect]
├── build [--watch, --minify, --sourcemap]
├── test [--watch, --coverage, --ui]
├── lint [--fix]
├── format [--check]
├── package                              (creates .extora package)
├── publish [--channel alpha|beta|stable]
│
├── plugin <command> [args]
│   ├── install <name>[@version]
│   ├── update <name>
│   ├── uninstall <name>
│   ├── list
│   ├── activate <name>
│   └── deactivate <name>
│
├── theme <command> [args]
│   ├── install <name>
│   ├── activate <name>
│   └── list
│
├── generate <type> <name> [options]
│   ├── type: migration | api-endpoint | hook | event | component | page
│   └── extora generate migration create_users
│
├── docker up | down | reset
├── logs [--plugin, --level, --follow]
├── shell                                (interactive REPL)
├── config get | set | list
└── upgrade
```

### 12.2 `extora dev` Architecture

```
1. Read extora.json from current directory
2. Validate manifest
3. Start Docker Compose services (PostgreSQL, Redis, MinIO, OpenSearch)
4. Wait for health checks
5. Run database migrations
6. Start Extora Core in development mode (tsx watch)
7. If plugin has Studio entry:
   a. Start Vite dev server
   b. Configure proxy to Core API
8. Watch source files for changes:
   a. Server file change -> recompile + hot-reload plugin
   b. Studio file change -> HMR
9. Display dev URLs:
   - Core API: http://localhost:3000
   - Studio: http://localhost:5173
   - API Docs: http://localhost:3000/docs
```

---

## 13. Extora Registry — Architecture

### 13.1 Purpose

Extora Registry is a private npm-compatible package registry. Every npm package installed as a dependency of any Extora plugin passes through the Registry for security scanning, caching, and policy enforcement.

### 13.2 Architecture Flow

```
Developer runs: npm install (or extora build)
         |
         v
   CLI/pnpm ---- configured with registry.extora.dev as npm registry
         |
         v
   +---------------------------------------------------+
   |              EXTORA REGISTRY                       |
   |                                                    |
   |  [Proxy Layer] -> [Scanner] -> [Policy Engine]    |
   |       |               |              |             |
   |       v               v              v             |
   |  [Upstream npm]  [Scan Results DB]  [Cache]       |
   |                                                    |
   |  Storage Backend: MinIO (local + proxied pkgs)    |
   +---------------------------------------------------+
```

### 13.3 Security Scanning Pipeline

```
Package Download
    |
    v
1. Manifest Check -> Validate package.json
2. License Scan   -> Check against allowlist/blocklist
3. CVE Scan       -> OSV / GitHub Advisory DB (Snyk)
4. Malware Scan   -> Obfuscated code, suspicious network calls, crypto mining
5. Dependency Tree Audit -> Recursive scan of all transitive deps
6. Policy Decision -> ALLOW / BLOCK / WARN
7. Cache & Serve  -> Store in MinIO, update scan results DB
```

### 13.4 Registry Database Schema

```prisma
model RegistryPackage {
  id            String   @id @default(cuid())
  name          String   @unique
  version       String
  description   String?
  license       String?
  repository    String?
  manifest      Json
  tgzUrl        String
  tgzSize       Int
  tgzSha256     String
  isLocal       Boolean  @default(false)
  scanStatus    String   @default("pending")
  scanResults   Json?
  downloadCount Int      @default(0)
  publishedAt   DateTime @default(now())
  createdAt     DateTime @default(now())
  @@index([name])
  @@index([scanStatus])
}

model RegistryScanResult {
  id        String   @id @default(cuid())
  packageId String
  scanner   String   // osv, snyk, malware, license
  passed    Boolean
  findings  Json
  scannedAt DateTime @default(now())
  @@index([packageId])
}
```

---

## 14. Extora Auth — Plugin Specification

### 14.1 Plugin Manifest

```jsonc
{
  "name": "@extora/auth",
  "version": "1.0.0",
  "type": "plugin",
  "title": "Extora Authentication",
  "description": "Core authentication plugin — local password, OAuth, SAML, MFA",
  "author": { "name": "Extora Team", "email": "team@extora.dev" },
  "license": "MIT",
  "extora": { "core": ">=1.0.0 <2.0.0" },
  "permissions": ["database:read", "database:write", "user:read", "user:write", "system:config", "http:outbound"],
  "entry": { "server": "dist/server/index.js", "studio": "dist/studio/index.js" },
  "hooks": {
    "actions": ["user.registered", "user.login", "user.logout", "user.password_reset"],
    "filters": ["user.can_register", "auth.token_payload"],
    "events": ["auth.login.success", "auth.login.failed", "auth.mfa.required"]
  },
  "api": { "rest": { "endpoints": ["/api/v1/auth/*"] } },
  "database": { "migrations": "dist/migrations/" }
}
```

### 14.2 Auth Plugin-Specific Tables

```sql
-- plugin_auth_providers
CREATE TABLE plugin_auth_providers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  type        VARCHAR(50) NOT NULL,
  config      JSONB NOT NULL DEFAULT '{}',
  is_enabled  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- plugin_auth_oauth_states (OAuth CSRF protection)
CREATE TABLE plugin_auth_oauth_states (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state       VARCHAR(255) NOT NULL UNIQUE,
  provider    VARCHAR(100) NOT NULL,
  redirect_to TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- plugin_auth_password_resets
CREATE TABLE plugin_auth_password_resets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- plugin_auth_email_verifications
CREATE TABLE plugin_auth_email_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  email       VARCHAR(255) NOT NULL,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- plugin_auth_rate_limits (brute force protection)
CREATE TABLE plugin_auth_rate_limits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier  VARCHAR(255) NOT NULL,
  action      VARCHAR(50) NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 1,
  blocked_until TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(identifier, action)
);
```

### 14.3 Auth API Endpoints

```
POST   /api/v1/auth/login            { email, password, mfaCode? } -> { accessToken, refreshToken, user }
POST   /api/v1/auth/register         { email, password, displayName } -> { user }
POST   /api/v1/auth/logout           Bearer token -> { success }
POST   /api/v1/auth/refresh          { refreshToken } -> { accessToken, refreshToken }
POST   /api/v1/auth/verify-email     { token } -> { success }
POST   /api/v1/auth/reset-password   { email } -> { message }
POST   /api/v1/auth/reset-password/confirm { token, newPassword } -> { success }
POST   /api/v1/auth/mfa/setup        -> { secret, qrCodeUrl }
POST   /api/v1/auth/mfa/verify       { code } -> { success, recoveryCodes }
GET    /api/v1/auth/oauth/:provider  -> 302 Redirect
GET    /api/v1/auth/oauth/:provider/callback -> { accessToken, refreshToken, user }
GET    /api/v1/auth/providers        -> { providers: [...] }
GET    /api/v1/auth/session          -> { user, session, permissions }
```

---

## 15. Extora CMS — Plugin Specification

### 15.1 Plugin Manifest

```jsonc
{
  "name": "@extora/cms",
  "version": "1.0.0",
  "type": "plugin",
  "title": "Extora CMS",
  "description": "Headless content management — custom types, revisions, media, API",
  "license": "MIT",
  "extora": { "core": ">=1.0.0 <2.0.0" },
  "optionalDependencies": { "@extora/search": ">=1.0.0" },
  "permissions": ["database:read", "database:write", "database:schema", "storage:read", "storage:write", "user:read"],
  "entry": { "server": "dist/server/index.js", "studio": "dist/studio/index.js" },
  "hooks": {
    "actions": ["content.created", "content.updated", "content.deleted", "content.published"],
    "filters": ["content.before_save", "content.after_fetch", "content.query"]
  },
  "api": { "rest": { "endpoints": ["/api/v1/content/*"] }, "graphql": { "types": ["dist/graphql/schema.graphql"] } }
}
```

### 15.2 CMS Database Schema

```prisma
model ContentType {
  id          String   @id @default(cuid())
  name        String   @unique
  title       String
  description String?
  fields      Json
  settings    Json     @default("{}")
  isSystem    Boolean  @default(false)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  entries     ContentEntry[]
}

model ContentEntry {
  id            String   @id @default(cuid())
  contentTypeId String
  contentType   ContentType @relation(fields: [contentTypeId], references: [id], onDelete: Cascade)
  slug          String
  title         String
  data          Json
  status        String   @default("draft")  // draft | published | archived
  locale        String   @default("en")
  authorId      String?
  parentId      String?
  parent        ContentEntry?  @relation("ContentHierarchy", fields: [parentId], references: [id])
  children      ContentEntry[] @relation("ContentHierarchy")
  publishedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  revisions     ContentRevision[]
  @@unique([contentTypeId, slug, locale])
  @@index([contentTypeId, status])
}

model ContentRevision {
  id        String   @id @default(cuid())
  entryId   String
  entry     ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
  version   Int
  data      Json
  authorId  String?
  note      String?
  createdAt DateTime @default(now())
  @@index([entryId])
}
```

### 15.3 CMS API Endpoints

```
# Content Types
GET    /api/v1/content/types
POST   /api/v1/content/types
GET    /api/v1/content/types/:typeName
PATCH  /api/v1/content/types/:typeName
DELETE /api/v1/content/types/:typeName

# Content Entries
GET    /api/v1/content/:type          ?status=draft&page=1&limit=20&sort=-createdAt
GET    /api/v1/content/:type/:id
POST   /api/v1/content/:type
PATCH  /api/v1/content/:type/:id
DELETE /api/v1/content/:type/:id

# Revisions
GET    /api/v1/content/:type/:id/revisions
GET    /api/v1/content/:type/:id/revisions/:version
POST   /api/v1/content/:type/:id/revisions/:version/restore

# Bulk Operations
POST   /api/v1/content/:type/bulk    { action: "publish"|"archive"|"delete", ids: [...] }
```

### 15.4 Field Types Reference

| Type | Storage | Validation | Studio UI |
|---|---|---|---|
| `text` | String | minLength, maxLength, pattern | Input |
| `richtext` | String | allowedTags | Rich Text Editor |
| `number` | Int/Float | min, max, step | Number Input |
| `date` | DateTime | minDate, maxDate | DatePicker |
| `boolean` | Boolean | — | Toggle |
| `media` | String (media ID) | allowedTypes, maxSize | MediaPicker |
| `relation` | String/[] | contentType, multiple | RelationPicker |
| `json` | Json | schema | JSON Editor |
| `email` | String | — | Email Input |
| `url` | String | allowedProtocols | URL Input |
| `enum` | String | options[] | Select |
| `markdown` | String | — | Markdown Editor |
## 16. Extora Commerce — Plugin Specification

### 16.1 Domain Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                       COMMERCE DOMAIN MODEL                          │
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐    │
│  │ Product  │   │ Category │   │  Brand   │   │  Inventory   │    │
│  └────┬─────┘   └──────────┘   └──────────┘   └──────────────┘    │
│       │                                                             │
│  ┌────▼─────┐                                                       │
│  │ Variant  │ (SKU, price, stock, attributes: size, color)          │
│  └────┬─────┘                                                       │
│       │                                                             │
│  ┌────▼─────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐   │
│  │ Cart     │──>│CartItem  │   │ Discount │   │   Coupon     │   │
│  └────┬─────┘   └──────────┘   └────┬─────┘   └──────┬───────┘   │
│       │                             │                │            │
│  ┌────▼─────┐                ┌─────▼──────┐   ┌─────▼──────┐     │
│  │  Order   │◄───────────────│OrderItem   │   │CouponUsage │     │
│  └────┬─────┘                └────────────┘   └────────────┘     │
│       │                                                             │
│  ┌────▼─────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐   │
│  │ Payment  │   │ Shipment │   │   Tax    │   │  Customer    │   │
│  └──────────┘   └──────────┘   └──────────┘   └──────────────┘   │
│                                                                     │
│  Extension Points (plugin interfaces):                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │PaymentGateway│  │ShippingProvider│  │  TaxProvider  │            │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### 16.2 Commerce Core Tables (Prisma)

```prisma
// Products
model CommerceProduct {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?
  status          String   @default("draft")  // draft | published | archived
  type            String   @default("simple") // simple | variable | virtual | downloadable
  categoryId      String?
  category        CommerceCategory? @relation(fields: [categoryId], references: [id])
  images          Json     @default("[]")
  featured        Boolean  @default(false)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  variants        CommerceVariant[]
  @@index([status])
  @@index([categoryId])
}

// Variants
model CommerceVariant {
  id             String   @id @default(cuid())
  productId      String
  product        CommerceProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku            String   @unique
  barcode        String?
  price          Float
  compareAtPrice Float?
  costPrice      Float?
  currency       String   @default("USD")
  attributes     Json
  weight         Float?
  isDefault      Boolean  @default(false)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  inventory      CommerceInventory?
  cartItems      CommerceCartItem[]
  orderItems     CommerceOrderItem[]
  @@index([productId])
}

// Inventory
model CommerceInventory {
  id               String   @id @default(cuid())
  variantId        String   @unique
  variant          CommerceVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  quantity         Int      @default(0)
  reservedQty      Int      @default(0)
  lowStockThreshold Int     @default(5)
  isTracked        Boolean  @default(true)
  allowBackorder   Boolean  @default(false)
  updatedAt        DateTime @updatedAt
}

// Categories
model CommerceCategory {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  parentId    String?
  parent      CommerceCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    CommerceCategory[] @relation("CategoryHierarchy")
  sortOrder   Int      @default(0)
  products    CommerceProduct[]
  @@index([parentId])
}

// Cart
model CommerceCart {
  id           String   @id @default(cuid())
  userId       String?
  sessionId    String?
  currency     String   @default("USD")
  items        CommerceCartItem[]
  discountTotal Float   @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([userId])
  @@index([sessionId])
}

model CommerceCartItem {
  id         String   @id @default(cuid())
  cartId     String
  cart       CommerceCart @relation(fields: [cartId], references: [id], onDelete: Cascade)
  variantId  String
  variant    CommerceVariant @relation(fields: [variantId], references: [id])
  quantity   Int
  unitPrice  Float
  totalPrice Float
}

// Orders
model CommerceOrder {
  id              String   @id @default(cuid())
  orderNumber     String   @unique
  userId          String?
  customerEmail   String
  customerName    String?
  status          String   @default("pending")
  subtotal        Float
  discountTotal   Float    @default(0)
  taxTotal        Float    @default(0)
  shippingTotal   Float    @default(0)
  grandTotal      Float
  currency        String   @default("USD")
  shippingAddress Json?
  billingAddress  Json?
  notes           String?
  metadata        Json     @default("{}")
  placedAt        DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  items           CommerceOrderItem[]
  payments        CommercePayment[]
  shipments       CommerceShipment[]
  @@index([userId])
  @@index([status])
}

model CommerceOrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       CommerceOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variantId   String
  variant     CommerceVariant @relation(fields: [variantId], references: [id])
  name        String
  sku         String
  quantity    Int
  unitPrice   Float
  totalPrice  Float
  attributes  Json
}

// Payments
model CommercePayment {
  id                   String   @id @default(cuid())
  orderId              String
  order                CommerceOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  gateway              String   // stripe, paypal, razorpay
  gatewayTransactionId String?
  amount               Float
  currency             String   @default("USD")
  status               String   @default("pending")
  method               String?
  metadata             Json     @default("{}")
  refundedAmount       Float    @default(0)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  @@index([orderId])
}

// Shipments
model CommerceShipment {
  id              String   @id @default(cuid())
  orderId         String
  order           CommerceOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  provider        String
  trackingNumber  String?
  trackingUrl     String?
  status          String   @default("pending")
  items           Json
  shippedAt       DateTime?
  deliveredAt     DateTime?
}

// Coupons
model CommerceCoupon {
  id             String   @id @default(cuid())
  code           String   @unique
  description    String?
  type           String   // percentage | fixed_amount | free_shipping
  value          Float
  minOrderAmount Float?
  maxUses        Int?
  currentUses    Int      @default(0)
  isActive       Boolean  @default(true)
  startsAt       DateTime?
  expiresAt      DateTime?
  appliesTo      Json?
  createdAt      DateTime @default(now())
  usages         CommerceCouponUsage[]
  @@index([code])
}

model CommerceCouponUsage {
  id        String   @id @default(cuid())
  couponId  String
  coupon    CommerceCoupon @relation(fields: [couponId], references: [id], onDelete: Cascade)
  orderId   String?
  userId    String?
  usedAt    DateTime @default(now())
}

// Tax Rules
model CommerceTaxRule {
  id          String   @id @default(cuid())
  name        String
  countryCode String
  stateCode   String?
  zipCode     String?
  rate        Float
  isActive    Boolean  @default(true)
  priority    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 16.3 Commerce API Endpoints

```
# Products
GET    /api/v1/commerce/products          ?page=1&limit=20&category=slug&status=published
GET    /api/v1/commerce/products/:id
POST   /api/v1/commerce/products
PATCH  /api/v1/commerce/products/:id
DELETE /api/v1/commerce/products/:id

# Variants
GET    /api/v1/commerce/products/:id/variants
POST   /api/v1/commerce/products/:id/variants
PATCH  /api/v1/commerce/variants/:variantId
DELETE /api/v1/commerce/variants/:variantId

# Categories
GET    /api/v1/commerce/categories
POST   /api/v1/commerce/categories
PATCH  /api/v1/commerce/categories/:id
DELETE /api/v1/commerce/categories/:id

# Cart
GET    /api/v1/commerce/cart
POST   /api/v1/commerce/cart/items         { variantId, quantity }
PATCH  /api/v1/commerce/cart/items/:id     { quantity }
DELETE /api/v1/commerce/cart/items/:id
POST   /api/v1/commerce/cart/coupon        { code }
DELETE /api/v1/commerce/cart/coupon

# Checkout & Orders
POST   /api/v1/commerce/checkout           { shippingAddress, billingAddress, paymentMethod }
GET    /api/v1/commerce/orders             (admin) ?page=1&status=processing
GET    /api/v1/commerce/orders/:id
PATCH  /api/v1/commerce/orders/:id/status  { status, note }
GET    /api/v1/commerce/orders/mine        (customer)

# Coupons
GET    /api/v1/commerce/coupons
POST   /api/v1/commerce/coupons
PATCH  /api/v1/commerce/coupons/:id
DELETE /api/v1/commerce/coupons/:id
POST   /api/v1/commerce/coupons/validate   { code, cartTotal }

# Tax Rules
GET    /api/v1/commerce/tax-rules
POST   /api/v1/commerce/tax-rules
PATCH  /api/v1/commerce/tax-rules/:id
DELETE /api/v1/commerce/tax-rules/:id

# Shipping
GET    /api/v1/commerce/shipping/methods
GET    /api/v1/commerce/shipping/zones
POST   /api/v1/commerce/shipping/zones
```

### 16.4 Extension Interfaces (for Third-Party Plugins)

```typescript
interface PaymentGatewayPlugin {
  id: string;
  name: string;
  supportedCurrencies: string[];
  supportedMethods: string[];
  createPaymentIntent(order: CommerceOrder): Promise<PaymentIntent>;
  capturePayment(payment: CommercePayment): Promise<PaymentResult>;
  refundPayment(payment: CommercePayment, amount?: number): Promise<RefundResult>;
  handleWebhook(payload: any, signature: string): Promise<void>;
}

interface ShippingProviderPlugin {
  id: string;
  name: string;
  getRates(order: CommerceOrder, destination: Address): Promise<ShippingRate[]>;
  createShipment(order: CommerceOrder, rateId: string): Promise<Shipment>;
  getTracking(shipmentId: string): Promise<TrackingInfo>;
  cancelShipment(shipmentId: string): Promise<void>;
}

interface TaxProviderPlugin {
  id: string;
  name: string;
  calculateTax(order: CommerceOrder): Promise<TaxCalculation>;
  validateAddress(address: Address): Promise<AddressValidation>;
}
```

---

## 17. Extora Forms — Plugin Specification

### 17.1 Plugin Manifest

```jsonc
{
  "name": "@extora/forms",
  "version": "1.0.0",
  "type": "plugin",
  "title": "Extora Forms",
  "description": "Drag-and-drop form builder with submissions, notifications, webhooks",
  "extora": { "core": ">=1.0.0 <2.0.0" },
  "permissions": ["database:read", "database:write", "storage:write", "http:outbound"],
  "entry": { "server": "dist/server/index.js", "studio": "dist/studio/index.js" },
  "hooks": {
    "actions": ["form.submitted", "form.submission_created"],
    "filters": ["form.before_submit", "form.email.template"]
  }
}
```

### 17.2 Forms Database Schema

```prisma
model Form {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?
  status          String   @default("draft")  // draft | published | closed
  fields          Json
  settings        Json     @default("{}")
  // { submitButtonText, successMessage, redirectUrl, sendEmail, emailTo,
  //   emailSubject, storeSubmissions, spamProtection, maxSubmissions, closeDate }
  submissionsCount Int     @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  submissions      FormSubmission[]
  webhooks         FormWebhook[]
  @@index([slug])
}

model FormSubmission {
  id        String   @id @default(cuid())
  formId    String
  form      Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  data      Json
  files     Json?
  ipAddress String?
  userAgent String?
  userId    String?
  isRead    Boolean  @default(false)
  isSpam    Boolean  @default(false)
  notes     String?
  createdAt DateTime @default(now())
  @@index([formId])
  @@index([formId, createdAt])
}

model FormWebhook {
  id         String   @id @default(cuid())
  formId     String
  form       Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  url        String
  secret     String?
  isActive   Boolean  @default(true)
  deliveries FormWebhookDelivery[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model FormWebhookDelivery {
  id             String   @id @default(cuid())
  webhookId      String
  webhook        FormWebhook @relation(fields: [webhookId], references: [id], onDelete: Cascade)
  submissionId   String?
  requestBody    String
  responseStatus Int?
  responseBody   String?
  success        Boolean
  errorMessage   String?
  durationMs     Int?
  createdAt      DateTime @default(now())
}
```

### 17.3 Form Field Types

| Type | Description | Type | Description |
|---|---|---|---|
| `text` | Single line input | `checkbox` | Checkbox group |
| `textarea` | Multi-line text | `radio` | Radio group |
| `email` | Email validation | `file` | File upload |
| `number` | Numeric input | `richtext` | Rich text editor |
| `date` | Date picker | `hidden` | Hidden values |
| `phone` | Phone number | `html` | Static HTML block |
| `url` | URL input | `rating` | Star rating |
| `select` | Dropdown | `signature` | Handwritten sig |
| `toggle` | On/off switch | `address` | Structured address |
| `color` | Color picker | `payment` | Payment collection |

### 17.4 Forms API Endpoints

```
# Form Management
GET    /api/v1/forms                     ?status=published&page=1
GET    /api/v1/forms/:id
POST   /api/v1/forms
PATCH  /api/v1/forms/:id
DELETE /api/v1/forms/:id
POST   /api/v1/forms/:id/duplicate

# Submissions
GET    /api/v1/forms/:id/submissions     ?page=1&sort=-createdAt
GET    /api/v1/forms/:id/submissions/:sid
DELETE /api/v1/forms/:id/submissions/:sid
POST   /api/v1/forms/:id/submissions/bulk { action, ids: [...] }
GET    /api/v1/forms/:id/submissions/export  ?format=csv|json|excel

# Public Submission (no auth required)
POST   /api/v1/forms/:slug/submit        { field_name: value, ... }

# Webhooks
GET    /api/v1/forms/:id/webhooks
POST   /api/v1/forms/:id/webhooks
PATCH  /api/v1/forms/:id/webhooks/:wid
DELETE /api/v1/forms/:id/webhooks/:wid
```

### 17.5 Spam Protection Strategies

1. **Honeypot:** Hidden field bots fill; if filled -> spam
2. **reCAPTCHA v3:** Invisible score-based CAPTCHA
3. **Rate Limiting:** Max X submissions per IP per time window
4. **Akismet Integration:** (future) Third-party spam detection

### 17.6 Embedding

```html
<!-- JavaScript Embed -->
<script src="https://my-instance.com/api/v1/forms/embed.js"></script>
<div data-extora-form="contact-us"></div>

<!-- iFrame -->
<iframe src="https://my-instance.com/forms/contact-us/embed"
        width="100%" height="600" frameborder="0"></iframe>

<!-- React Component -->
import { ExtoraForm } from '@extora/forms/react';
<ExtoraForm slug="contact-us" instanceUrl="https://my-instance.com" />
```

---

## 18. Extora Starter Kits — Specification

### 18.1 Concept

Starter Kits are pre-configured Extora installations bundling Core + specific plugins + theme + seed data for "5-minute setup."

### 18.2 Starter Kit Types

| Kit | Plugins | Theme | Seed Data |
|---|---|---|---|
| **Blog** | Core, Auth, CMS, SEO | Blog Theme | Sample posts, categories |
| **Ecommerce** | Core, Auth, CMS, Commerce, Stripe | Store Theme | Sample products |
| **SaaS** | Core, Auth, CMS, Billing, Multi-Tenant | SaaS Theme | Sample plans |
| **Portfolio** | Core, Auth, CMS, Forms | Portfolio Theme | Sample projects |
| **Documentation** | Core, Auth, CMS, Search | Docs Theme | Sample docs |
| **Headless API** | Core, Auth, CMS | None | Sample content types |
| **Minimal** | Core only | Default Theme | Nothing |

### 18.3 Starter Kit Manifest (`starter.json`)

```jsonc
{
  "name": "extora-starter-blog",
  "version": "1.0.0",
  "title": "Blog Starter Kit",
  "description": "Start a blog with Extora",
  "extora": { "core": ">=1.0.0" },
  "plugins": {
    "@extora/auth": "^1.0.0",
    "@extora/cms": "^1.0.0",
    "@extora/seo": "^1.0.0"
  },
  "theme": {
    "name": "@extora/blog-theme",
    "version": "^1.0.0"
  },
  "config": {
    "site.name": "My Blog",
    "site.description": "Powered by Extora",
    "cms.defaultStatus": "published"
  },
  "seedData": {
    "contentTypes": "./seed/content-types.json",
    "entries": "./seed/entries.json"
  },
  "postInstall": {
    "message": "Blog is ready! Visit /studio to start writing."
  }
}
```

### 18.4 CLI Command

```bash
extora create starter blog
# Clones template, installs deps, starts Core, installs plugins, imports seeds
# Opens Studio at http://localhost:3000/studio
```

---

## 19. Extora Marketplace — Architecture v2

### 19.1 Marketplace Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     EXTORA MARKETPLACE                        │
│                                                               │
│  Storefront (marketplace.extora.dev)                          │
│  Publisher Dashboard                                          │
│  Admin Panel                                                 │
│           │                                                    │
│           v                                                    │
│  Marketplace REST API                                         │
│           │                                                    │
│  ┌────────┼─────────────────────────────────────────┐        │
│  │        │                                         │        │
│  v        v              v              v                      │
│  Package  Payment Engine Review Engine Security Scanner       │
│  Manager  (Stripe Connect)              License Manager       │
│  │        │              │              │                     │
│  v        v              v              v                      │
│  MinIO    Stripe         PostgreSQL     Analytics Engine       │
│  (PKGs)                                                     │
└──────────────────────────────────────────────────────────────┘
```

### 19.2 Marketplace API Endpoints

```
# Public
GET    /api/v1/packages              ?search=&category=&type=&sort=&page=
GET    /api/v1/packages/:name
GET    /api/v1/packages/:name/versions
GET    /api/v1/packages/:name/reviews
GET    /api/v1/categories
GET    /api/v1/stats

# Publisher (authenticated)
GET    /api/v1/publisher/packages
POST   /api/v1/publisher/packages
PUT    /api/v1/publisher/packages/:name
POST   /api/v1/publisher/packages/:name/versions
GET    /api/v1/publisher/analytics
GET    /api/v1/publisher/payouts

# Admin (Marketplace staff)
GET    /api/v1/admin/review-queue
POST   /api/v1/admin/review-queue/:id/approve
POST   /api/v1/admin/review-queue/:id/reject
DELETE /api/v1/admin/packages/:name  (revoke)
GET    /api/v1/admin/analytics

# License
POST   /api/v1/licenses/validate      { licenseKey, domain, packageName }
POST   /api/v1/licenses/activate      { licenseKey, domain }
POST   /api/v1/licenses/deactivate    { licenseKey }
```

### 19.3 Revenue Share Model

| Type | Platform Fee | Developer |
|---|---|---|
| Free plugins | 0% | 100% |
| One-time purchase | 15% | 85% |
| Subscription (Year 1) | 15% | 85% |
| Subscription (Year 2+) | 10% | 90% |
| Enterprise partnership | Custom | Negotiated |

---

## 20. Extora Cloud — Architecture

### 20.1 Cloud Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      EXTORA CLOUD                             │
│                                                               │
│  Cloud API / Control Plane                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │Tenant Mgr│ │Billing   │ │Orch. Mgr │ │Monitoring    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│                                                               │
│  Tenant Deployments                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐            │
│  │ Tenant A            │  │ Tenant B            │            │
│  │ ┌───────┐ ┌───────┐ │  │ ┌───────┐ ┌───────┐ │            │
│  │ │Core   │ │Studio │ │  │ │Core   │ │Studio │ │            │
│  │ │Pod    │ │Pod    │ │  │ │Pod    │ │Pod    │ │            │
│  │ └───────┘ └───────┘ │  │ └───────┘ └───────┘ │            │
│  │ ┌───────┐           │  │ ┌───────┐           │            │
│  │ │DB     │(dedicated │  │ │DB     │(shared DB │            │
│  │ │Pod    │ schema)   │  │ │Schema │ with RLS) │            │
│  │ └───────┘           │  │ └───────┘           │            │
│  └─────────────────────┘  └─────────────────────┘            │
│                                                               │
│  Shared Services: PG Cluster | Redis Cluster | MinIO | CDN  │
└──────────────────────────────────────────────────────────────┘
```

### 20.2 Tenant Isolation Strategies

| Tier | DB Strategy | Resource Isolation |
|---|---|---|
| Starter/Pro | Shared DB, Row-Level Security | Shared Core pod, limits |
| Business | Dedicated DB schema | Dedicated Core pod |
| Scale/Enterprise | Dedicated DB instance | Dedicated namespace + resources |

### 20.3 Auto-Scaling Rules

- **Scale Up:** CPU > 70% for 5 min -> +1 replica (max 10)
- **Scale Down:** CPU < 30% for 10 min -> -1 replica (min 1)
- **Database:** Connection pool > 80% -> trigger read replica
- **Storage:** Disk usage > 80% -> auto-expand + alert

### 20.4 Cloud Pricing Tiers

| Tier | Price/Month | Resources | Target |
|---|---|---|---|
| Starter | $29 | 1 vCPU, 2GB RAM, 10GB | Personal blogs |
| Professional | $99 | 2 vCPU, 4GB RAM, 50GB | Business sites |
| Business | $299 | 4 vCPU, 8GB RAM, 100GB + Redis | Ecommerce |
| Scale | $999 | 8 vCPU, 16GB RAM, 250GB + Redis + OS | High-traffic |
| Enterprise | Custom | Dedicated infra, SSO, SLA | Large orgs |

---

## 21. Extora Enterprise — Architecture

### 21.1 Enterprise Features

| Feature | Description |
|---|---|
| **SSO/SAML/OIDC** | Enterprise identity integration |
| **Multi-Tenancy** | Isolated tenants with admin hierarchy |
| **Advanced RBAC** | Custom roles, ABAC policies (OPA/Rego) |
| **Audit & Compliance** | Immutable audit trail, compliance reports |
| **SLA Support** | 99.9% uptime, 24/7 support, PagerDuty |
| **Air-Gapped Deploy** | On-prem, no internet dependency |
| **White-Label** | Rebrand Studio with org branding |
| **Dedicated Infra** | Isolated Kubernetes cluster |
| **Custom Plugin Review** | Organization-specific approval workflow |
| **Data Residency** | Choose data storage region (US, EU, APAC) |

### 21.2 Enterprise Licensing

- **Per-Instance:** Annual license per Extora instance
- **Per-Seat:** For Studio users (administrators, editors)
- **Unlimited:** Flat annual fee for unlimited within org
- **White-Label:** Additional fee for rebranding
- **On-Premises:** Self-hosted + air-gapped support

---

## 22. Extora Docs — Platform Specification

### 22.1 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nextra / VitePress |
| Hosting | Vercel / Cloudflare Pages |
| Search | Algolia / Pagefind |
| API Docs | TypeDoc (auto-generated) |
| Playground | Swagger UI + GraphiQL |
| Versioning | Git-based, one folder per major version |

### 22.2 Docs Information Architecture

```
docs.extora.dev
├── Getting Started
│   ├── Quickstart (5 min)
│   ├── Installation
│   ├── Creating Your First Plugin
│   └── Creating Your First Theme
├── Core Concepts
│   ├── Plugin Architecture
│   ├── Hook System
│   ├── Event System
│   ├── Auth & Authorization
│   └── Configuration System
├── Plugin Development
│   ├── Manifest Reference
│   ├── Plugin Lifecycle
│   ├── Server-Side Dev
│   ├── Studio UI Dev
│   ├── CLI Command Dev
│   ├── Database Migrations
│   ├── Testing Plugins
│   └── Publishing
├── Official Plugins
│   ├── Auth
│   ├── CMS
│   ├── Commerce
│   └── Forms
├── API Reference
│   ├── REST API (auto-generated)
│   ├── GraphQL API
│   └── WebSocket API
├── SDK Reference (TypeDoc)
├── CLI Reference
├── Deployment
│   ├── Docker Compose
│   ├── Kubernetes
│   ├── Cloud
│   └── Enterprise
├── Tutorials
│   ├── Build a Blog
│   ├── Build an Ecommerce Store
│   ├── Build a SaaS Product
│   └── Migrate from WordPress
├── Community
│   ├── Contributing Guide
│   ├── Code of Conduct
│   ├── Governance
│   └── Showcase
└── Changelog (per version)
```

---

## 23. Development Phases — Execution Plan

### 23.1 Phase Timeline Overview

```
Year 1                                     Year 2
|------------------------------------------|-----------------------------|
|                                          |                             |
| P0: Foundation      P1: Core MVP         | P6: Marketplace MVP         |
| [M1--M2]            [M3--M6]             | [M12--M16]                  |
|                                          |                             |
|       P2: CLI+SDK    P3: Studio MVP      |  P7: Forms   P8: Commerce  |
|       [M4--M8]       [M7--M10]           |  [M14--17]   [M16--M22]    |
|                                          |                             |
|              P4: Auth Plugin             |  P9: Starter Kits           |
|              [M9--M11]                   |  [M18--M22]                 |
|                                          |                             |
|                     P5: CMS Plugin       |  P10: Cloud Alpha           |
|                     [M10--M14]           |  [M18--M24]                 |
|                                          |                             |
|  P11: Docs Platform [ongoing from M1 -------------------------------->|
|                                                  P12: Enterprise [Y3+] |
└────────────────────────────────────────────────────────────────────────┘
```

### 23.2 Detailed Phase Specifications

#### Phase 0: Foundation (Months 1-2) | Team: 2-3

- [ ] Monorepo setup (Turborepo + pnpm)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker Compose dev environment (PG, Redis, MinIO, OpenSearch)
- [ ] ESLint + Prettier + TS strict config
- [ ] Vitest testing setup
- [ ] Commitlint + Semantic Release setup
- [ ] `@extora/types` package
- [ ] `@extora/config` package
- [ ] README.md + CONTRIBUTING.md

#### Phase 1: Core MVP (Months 3-6) | Team: 3-4

- [ ] Fastify HTTP server with health check
- [ ] Prisma schema + initial migration (all core tables)
- [ ] Configuration manager (env + DB + file)
- [ ] Plugin loader (discovery, dependency resolution, lifecycle, sandboxing)
- [ ] Event bus (pub/sub, event store)
- [ ] Hook system (actions + filters, typed)
- [ ] Auth engine (password, JWT, refresh tokens, MFA setup)
- [ ] Authorization engine (RBAC)
- [ ] API engine (route registration, middleware, rate limiting)
- [ ] Session management + API key management
- [ ] Media manager (local + S3/MinIO backend)
- [ ] Logger (pino + OpenTelemetry)
- [ ] Core API endpoints: auth, users, plugins, config, system, media, backups

#### Phase 2: CLI + SDK + Registry (Months 4-8) | Team: 2-3

- [ ] `@extora/sdk` v0.1 (base classes, hook API, event API, db, testing)
- [ ] `@extora/cli` v0.1 (create, dev, build, test, package, publish)
- [ ] Plugin templates (basic, api, admin, full)
- [ ] Theme template
- [ ] `extora dev` with hot reload
- [ ] Extora Registry MVP (proxy + scan + cache)
- [ ] Registry security scanning (CVE + malware + license)

#### Phase 3: Studio MVP (Months 7-10) | Team: 3-4

- [ ] Vite + React 19 + Tailwind + shadcn/ui setup
- [ ] TanStack Router + TanStack Query
- [ ] Zustand stores (auth, plugins, config, notifications, backup)
- [ ] Login page + auth flow + setup wizard
- [ ] Dashboard (health, activity, quick actions)
- [ ] User management (CRUD, roles, API keys, sessions)
- [ ] Plugin management (install, activate, deactivate, update, uninstall)
- [ ] Theme management (install, activate, customize)
- [ ] Configuration management (environment, services, advanced)
- [ ] Studio plugin slot system (UI extensions)
- [ ] Dark mode + i18n framework

#### Phase 4: Auth Plugin (Months 9-11) | Team: 1-2

- [ ] Local password auth with email verification
- [ ] OAuth providers (Google, GitHub, Microsoft, Apple)
- [ ] MFA (TOTP with recovery codes)
- [ ] Password reset flow with email
- [ ] Brute force protection (rate limiting + progressive backoff)
- [ ] Auth Studio UI pages (login, register, MFA setup, profile)

#### Phase 5: CMS Plugin (Months 10-14) | Team: 3-4

- [ ] Content type builder (Studio UI)
- [ ] Content entry CRUD API with advanced filtering
- [ ] All field types (text, richtext, number, date, media, relation, json, email, url, enum, markdown)
- [ ] Content revisions with diff and restore
- [ ] Publishing workflow (draft -> published -> archived)
- [ ] Media library integration
- [ ] GraphQL schema auto-generation
- [ ] Bulk operations

#### Phase 6: Marketplace MVP (Months 12-16) | Team: 3-4

- [ ] Package upload and storage (MinIO)
- [ ] Publisher registration, verification, onboarding (Stripe Connect)
- [ ] Package listing, search, browse, categories
- [ ] Automated security review pipeline
- [ ] Manual review queue for first publications
- [ ] `extora publish` CLI integration
- [ ] Studio Marketplace browser
- [ ] Rating and review system

#### Phase 7: Forms Plugin (Months 14-17) | Team: 2-3

- [ ] Drag-and-drop form builder (Studio UI)
- [ ] All 20 field types
- [ ] Conditional logic (show/hide fields)
- [ ] Email notifications (admin + user)
- [ ] Webhook integration
- [ ] Spam protection (honeypot, reCAPTCHA)
- [ ] Embed script (JS + iframe + React)

#### Phase 8: Commerce Plugin (Months 16-22) | Team: 4-5

- [ ] Product management (CRUD + variants + inventory)
- [ ] Category management (hierarchical)
- [ ] Cart system (session-based, persistent)
- [ ] Checkout flow (address, shipping, payment)
- [ ] Order management (full lifecycle)
- [ ] Payment gateway interface + Stripe integration
- [ ] Shipping provider interface
- [ ] Tax engine (rules by country/state)
- [ ] Coupons and discounts (percentage, fixed, free shipping)
- [ ] Commerce Studio UI (product editor, order mgmt, analytics)

#### Phase 9: Starter Kits (Months 18-22) | Team: 2

- [ ] Blog Starter
- [ ] Ecommerce Starter
- [ ] SaaS Starter
- [ ] Portfolio Starter
- [ ] Documentation Starter
- [ ] Headless API Starter
- [ ] `extora create starter <name>` CLI command

#### Phase 10: Cloud Alpha (Months 18-24) | Team: 3-4

- [ ] Kubernetes deployment (Helm charts, operator)
- [ ] Tenant provisioning API
- [ ] Billing integration (Stripe)
- [ ] Auto-scaling (HPA)
- [ ] Monitoring + Alerting (Prometheus, Grafana, PagerDuty)
- [ ] Backup automation (scheduled, incremental, offsite)
- [ ] Cloud management dashboard
- [ ] Multi-region support (US, EU, APAC)

#### Phase 11: Docs Platform (Ongoing, Month 1+) | Team: 1-2 + writer

- [ ] Nextra/VitePress setup
- [ ] Getting Started guide
- [ ] API Reference (TypeDoc auto-generated)
- [ ] Plugin + Theme Development Guides
- [ ] Official Plugin docs (Auth, CMS, Commerce, Forms)
- [ ] Tutorials with complete examples
- [ ] Migration guides (WordPress, Strapi)
- [ ] Interactive API Explorer (Swagger + GraphiQL)
- [ ] Community contribution guide

#### Phase 12: Enterprise (Year 3+) | Team: 3-4

- [ ] SAML/OIDC SSO
- [ ] Multi-tenancy (full isolation)
- [ ] Advanced audit + compliance reports
- [ ] SOC 2 Type II certification
- [ ] ISO 27001 certification
- [ ] Air-gapped deployment support
- [ ] White-label configuration
- [ ] Dedicated infrastructure

### 23.3 Team Growth Plan

| Year | Total Engineers | Core | Studio | Plugins | Infra/Cloud | DX/Docs | Enterprise |
|---|---|---|---|---|---|---|---|
| Year 1 | 6-10 | 3-4 | 3-4 | 3-4 (shared) | 1-2 | 1-2 | — |
| Year 2 | 15-25 | 4-5 | 4-5 | 5-8 | 3-4 | 2-3 | — |
| Year 3 | 30-50 | 5-7 | 5-7 | 8-12 | 5-7 | 3-4 | 3-4 |
| Year 5 | 100+ | 10+ | 10+ | 20+ | 15+ | 8+ | 10+ |

---

## 24. Security Architecture

### 24.1 Authentication
- Local: bcrypt/argon2, configurable work factors
- OAuth 2.0 / OIDC: Full RP implementation (Google, GitHub, Microsoft, Apple, custom)
- SAML 2.0: Enterprise SSO
- LDAP/Active Directory: Enterprise directory
- WebAuthn/Passkeys: Passwordless + biometric
- JWT: Short-lived access tokens (15 min), refresh tokens with rotation and reuse detection
- API Keys: Scoped, revocable, with usage tracking and anomaly detection

### 24.2 Authorization
- **Policy as Code:** OPA/Rego or custom DSL, stored in version control
- **Policy Evaluation Points (PEP):** API gateway, plugin boundary, data access layer
- **Policy Decision Point (PDP):** Centralized authorization service
- **Default Deny:** Any operation not explicitly allowed is denied
- ABAC core with RBAC as configurable layer

### 24.3 Secrets Management
- Never in code — env vars, Docker secrets, or Vault integration
- Config encryption at rest (AES-256-GCM) with key derivation from master key
- Master key in environment or external KMS; never in database
- Plugin-specific secret storage through Core API

### 24.4 Audit Logs
- Immutable append-only audit trail
- Structured JSON with standardized schema: timestamp, actor, action, resource, outcome, context, IP
- Retention: 90 days online, 7 years archived
- Cryptographic chain (hash chain / Merkle tree) for tamper detection
- SIEM integration: Syslog, Splunk, Elastic Stack

### 24.5 Secure Plugin Model
- **Principle of Least Privilege:** Plugins declare minimum permissions; Core enforces
- **Capability-Based Security:** Specific capabilities, not broad roles
- **Runtime Integrity Verification:** Code matches published, reviewed package
- **Plugin-to-Plugin Communication:** Core event bus only; no direct access
- **Global Version Revocation:** Marketplace revokes versions (CVE); all installations notified

### 24.6 Supply Chain Security
- **SBOM (SPDX/CycloneDX):** Every package includes dependency inventory
- **Dependency Pinning:** Exact versions in lockfile
- **Automated CVE Scanning:** On publish + periodic thereafter
- **Build Provenance:** SLSA / Sigstore attestation
- **Zero-Trust Registry:** All npm packages proxied through Extora Registry with scanning

---

## 25. Infrastructure Architecture

### 25.1 Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| Runtime | Node.js 22 LTS | Mature, fast, TS-native |
| Database | PostgreSQL 16+ | ACID, JSON/JSONB, RLS, best Prisma support |
| Cache & Queue | Redis 7+ (Valkey) | In-memory cache, pub/sub, BullMQ |
| Object Storage | MinIO (S3-compatible) | Self-hosted or cloud S3 |
| Reverse Proxy | Nginx / Caddy | TLS, static files, rate limiting |
| Search | OpenSearch | Full-text, analytics, log aggregation |
| Containers | Docker + Compose | Dev + single-server prod |
| Orchestration | Kubernetes (k3s) | Multi-node, auto-scaling (Year 3+) |
| CI/CD | GitHub Actions | Build, test, scan, publish |
| Monitoring | Prometheus + Grafana + OTEL | Open source, industry standard |

### 25.2 Single-Node Deployment (Docker Compose)

```
Internet -> Nginx (443/TLS) -> Extora Core (1-N instances)
                                   |
        PostgreSQL  |  Redis/Valkey  |  MinIO  |  OpenSearch
         (Primary)  |  (Cache/Queue) | (Storage)| (Search + Logs)
```

### 25.3 Multi-Node Deployment (Kubernetes — Year 3+)

```
K8s Cluster
├── Ingress (Nginx/Traefik) + Cert Manager + External DNS
├── Extora Core Deployment (HPA, 1-N pods)
├── PostgreSQL Operator (HA)
├── Redis Cluster (Sentinel)
├── MinIO Operator (Distributed)
├── OpenSearch Cluster (HA)
└── Observability: Prometheus | Grafana | OTEL Collector | AlertManager
```

### 25.4 Database Design Principles

- **Multi-Tenancy:** Tenant ID column + Row-Level Security policies
- **Migrations:** Idempotent, versioned, transactional (up/down)
- **Plugin Tables:** `plugin_<name>_` namespace for plugin-owned tables
- **Connection Pooling:** PgBouncer in production
- **Backup:** Continuous WAL archiving + daily full backups to MinIO/S3

---

## 26. Open Source Strategy

### 26.1 Open Core Business Model

Extora follows the **Open Core** model (GitLab, Supabase, Odoo). Core runtime, SDK, CLI, and essential plugins are open source (MIT). Premium features related to management, hosting, enterprise compliance, and marketplace operations are proprietary.

### 26.2 Public Repositories (MIT License)

| Repository | Description |
|---|---|
| `extora-core` | Core runtime engine |
| `extora-sdk` | Developer toolkit |
| `extora-cli` | Command-line interface |
| `extora-docs` | Documentation platform (content: CC-BY 4.0) |
| `extora-core-plugins` | Auth, CMS, Forms, SEO |
| `extora-docker` | Docker configurations + Dockerfiles |
| `extora-starters` | Starter kit templates |

### 26.3 Private Repositories (Proprietary)

| Repository | Description |
|---|---|
| `extora-studio` | Admin UI (Community License: free non-commercial, paid commercial) |
| `extora-marketplace` | Marketplace platform |
| `extora-cloud` | Cloud hosting infrastructure |
| `extora-enterprise` | Enterprise features (source available for audit) |
| `extora-commerce` | Commerce plugin (revenue-generating, protected) |

### 26.4 Rationale

1. **Developer Trust:** Open Core removes barriers. Developers inspect, modify, contribute.
2. **Network Effects:** More developers -> more plugins -> more users -> more developers.
3. **Commoditize the Complement:** Core is the complement to commercial offerings.
4. **Enterprise Trust:** Source access for audits, compliance, continuity.
5. **Sustainable Funding:** Proprietary layers fund Core development.
6. **Prevent Fragmentation:** Marketplace + Cloud proprietary prevents harmful forks.

---

## 27. Governance Model

### 27.1 Organizational Structure

```
Extora Foundation (Non-Profit)
        |
Core Maintainers (5-7) --- Technical Steering Committee (TSC) --- Community Managers (2-3)
        |
Committers (20-50) --- Contributors (unlimited) --- Community Members (unlimited)
```

### 27.2 Role Definitions

- **Extora Foundation:** Non-profit holding trademark, owns OSS repos, ensures mission. Board: community reps, core team, independent directors.
- **Core Maintainers:** Full-time engineers. Technical direction, PR review, release management, CI/CD, security incidents, committer mentoring.
- **TSC:** Core Maintainers + elected Committers. RFC process, technical decisions, deprecation policy, plugin ecosystem standards.
- **Committers:** Trusted community contributors with merge access. Nominated based on sustained quality contributions.
- **Contributors:** Anyone contributing code, docs, bugs, translations, or support.

### 27.3 PR Workflow

```
1. Fork -> feature branch -> PR with linked issue, description, screenshots, test report
2. CI: lint, typecheck, unit tests, integration tests, bundle analysis, license check
3. 1 Committer review (2 for Core/security)
4. All threads resolved, CI green
5. Committer merges (squash/rebase)
6. Auto-deploy to canary; changelog generated
```

### 27.4 Release Workflow

**Channels:** canary (every merge) | beta (weekly) | stable (monthly) | lts (6-monthly, 18-36mo support)

**Process:** Release Manager nominated -> RC tagged -> staging deploy -> smoke tests -> community testing (1-2 weeks) -> backport fixes -> final tag -> Docker images -> release notes -> SDK/CLI update -> compatibility matrix -> installations notified

### 27.5 Decision Making

- **RFC:** Major changes require RFC (GitHub Discussion, 2-week community feedback, TSC vote)
- **Lazy Consensus:** No objections in 72 hours = approved
- **Voting:** TSC simple majority; tie broken by Core Maintainers
- **Code of Conduct:** Enforced by Community Managers, escalated to Foundation

---

## 28. Monetization Strategy

### 28.1 Revenue Streams

| Stream | Description | Year 5 Contribution |
|---|---|---|
| **Marketplace Revenue Share** | 15% one-time, 15%/10% subscription | 35% |
| **Cloud Hosting** | Managed hosting, tiered pricing | 30% |
| **Enterprise Licenses** | SSO, RBAC, multi-tenancy, audit, SLA | 20% |
| **Premium Plugins (1P)** | Commerce, Analytics, AI, Workflow | 10% |
| **Support Contracts** | Priority support, SLAs | 3% |
| **Marketplace Advertising** | Promoted listings | 2% |

### 28.2 Why This Model Works

1. **Aligned Incentives:** Plugins sell -> Extora earns -> invests in marketplace -> developers succeed
2. **Low Barrier:** Open source Core + free plugins = zero-cost adoption
3. **Predictable Revenue:** Cloud + Enterprise subscriptions fund sustained investment
4. **No Lock-In:** Self-hosted users can migrate; Extora competes on value

---

## 29. Product Roadmap

### Year 1 — Foundation ("The Runtime")
- **Q1-Q2:** Core v1.0, SDK v1.0, CLI v1.0, Auth engine, RBAC, PG schema, Docker env, CI/CD
- **Q3-Q4:** Studio v1.0, Marketplace MVP, OSS repos public, Dev docs, 5-10 community plugins
- **Milestones:** Core loads plugins with isolation, blog possible via plugins, first community plugin, 1K GitHub stars

### Year 2 — Ecosystem ("The Marketplace")
- **Q1-Q2:** Paid plugins/themes, security scanning, reviews, dependency graph, license keys, publisher analytics
- **Q3-Q4:** Cloud Alpha, Enterprise Alpha (SSO, RBAC, MT), Studio v2.0 (backup, monitoring, deploy), 50+ plugins
- **Milestones:** First $1K GMV, 50 plugins, 500 installs, 10 Cloud customers, 1st Enterprise pilot, 10K stars

### Year 3 — Scale ("The Platform")
- **Q1-Q2:** K8s deployment, horizontal scaling, multi-region Cloud, advanced caching, DB sharding
- **Q3-Q4:** AI/Native plugin SDK, workflow automation, real-time collab, Studio v3.0, SOC 2, ISO 27001, i18n
- **Milestones:** 200+ plugins, 10K installs, $1M+ ARR, 10 Enterprise customers, 50K stars

### Year 5 — Dominance ("The Standard")
- 1,000+ plugins, Extora becomes default recommendation
- Major brands/government on Enterprise, 50K+ Cloud installations
- Vertical distributions: Commerce, Gov, Edu, Health
- $50M+ ARR, 100+ employees, Series B/C or profitable
- Extora Foundation fully independent

---

## 30. Risks and Challenges

### 30.1 Technical Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Plugin isolation failure | Critical | Defense-in-depth: VM contexts, FS restrictions, DB RLS, CSP; 3rd-party audits; bug bounty |
| Performance at scale | High | Plugin perf profiling, lazy loading, perf budgets, benchmark regression suite |
| Dependency hell | High | Robust semver resolver, optional deps, loose coupling standards |
| DB scalability bottleneck | Medium | Read replicas day 1, sharding strategy, plugin data isolation |
| API versioning complexity | Medium | Strict versioning, deprecation tooling, max 2 supported versions |
| TS ecosystem churn | Medium | Lockstep testing, conservative adoption, Docker hermetic builds |

### 30.2 Community Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Chicken-and-egg (no plugins) | Critical | Invest DX, recruit initial devs, fund essential plugins, dev grant program |
| Toxic community | High | Strong CoC, community management team, clear governance |
| Core team burnout | High | Hire post-seed, clear responsibilities, sustainable pace |
| Forking/fragmentation | Medium | Proprietary layers, network effects, trademark enforcement |

### 30.3 Adoption Risks

| Risk | Severity | Mitigation |
|---|---|---|
| "WordPress is good enough" | High | Compete on "build anything," target greenfield, showcase productivity |
| Framework lock-in preference | Medium | Plugin ecosystem = less code, "build vs. buy" value prop |
| Enterprise risk aversion | Medium | White-glove onboarding, compliance certs, reference customers, SI partners |
| Learning curve | Low-Medium | Heavy docs investment, 5-min quickstart, migration guides |

### 30.4 Competition Risks

| Risk | Severity | Mitigation |
|---|---|---|
| WordPress modernizes | Medium | Backward-compat prevents fundamental change; Extora starts clean |
| Major tech company enters | Medium | Move fast, network effects, open source advantage |
| Shopify expands scope | Low-Medium | Commerce DNA limits general-purpose; self-hosting requirement |
| Strapi/Directus marketplaces | Medium | They're CMS-first; Extora is platform-first with superior plugin model |

---

## 31. Success Metrics

### 31.1 Community Growth KPIs

| Metric | Year 1 | Year 3 | Year 5 |
|---|---|---|---|
| GitHub Stars (all repos) | 10,000 | 50,000 | 200,000 |
| Active Contributors (monthly) | 25 | 200 | 1,000 |
| Committers | 5 | 30 | 100 |
| Forum Members | 1,000 | 25,000 | 200,000 |
| Discord/Slack Members | 500 | 15,000 | 100,000 |
| Community Meetups (global) | 5 | 50 | 200 |

### 31.2 Plugin Growth KPIs

| Metric | Year 1 | Year 3 | Year 5 |
|---|---|---|---|
| Total Plugins | 50 | 500 | 5,000 |
| Active Plugin Developers | 30 | 400 | 3,000 |
| Paid Plugins | 5 | 100 | 1,000 |
| Avg Plugin Quality Score | Baseline | 4.0/5.0 | 4.2/5.0 |
| Critical Vulnerabilities | 0 | 0 | 0 |

### 31.3 Marketplace Growth KPIs

| Metric | Year 1 | Year 3 | Year 5 |
|---|---|---|---|
| Monthly GMV | $500 | $100,000 | $5,000,000 |
| Monthly Transactions | 20 | 5,000 | 200,000 |
| Publisher Payouts (total) | $425 | $850,000 | $42,500,000 |
| Platform Revenue (MP) | $75 | $150,000 | $7,500,000 |

### 31.4 Revenue Growth KPIs

| Metric | Year 1 | Year 3 | Year 5 |
|---|---|---|---|
| Annual Recurring Revenue | $10,000 | $5,000,000 | $100,000,000 |
| Cloud Customers | 20 | 2,000 | 50,000 |
| Enterprise Customers | 2 | 50 | 500 |
| Gross Margin | N/A | 70%+ | 80%+ |

### 31.5 Adoption KPIs

| Metric | Year 1 | Year 3 | Year 5 |
|---|---|---|---|
| Active Installations | 500 | 25,000 | 500,000 |
| Self-Hosted Installations | 480 | 18,000 | 300,000 |
| Cloud-Hosted Installations | 20 | 7,000 | 200,000 |
| Enterprise Deployments | 2 | 50 | 500 |
| Daily Active Studio Users | 200 | 50,000 | 2,000,000 |
| NPS Score | Baseline | 40+ | 50+ |
| Countries with Installations | 10 | 80 | 150+ |

### 31.6 North Star Metric

> **Weekly Active Plugin Developers (WAPD)**
>
> The number of unique developers who build, test, or publish an Extora plugin or theme in a given week. This single metric captures ecosystem health: more developers -> more plugins -> more users -> more value. All product, community, and business decisions should be evaluated against their impact on WAPD.

---

## 32. Appendices

### Appendix A: Glossary

| Term | Definition |
|---|---|
| **Extora Core** | Runtime engine that loads and orchestrates plugins |
| **Extora Studio** | Browser-based administrative interface |
| **Extora SDK** | Developer toolkit for building plugins/themes |
| **Extora CLI** | Command-line interface for development and management |
| **Extora Registry** | Private npm-compatible package registry with security scanning |
| **Extora Marketplace** | Platform for discovering, purchasing, distributing plugins/themes |
| **Extora Cloud** | Managed hosting platform |
| **Extora Enterprise** | Enterprise-grade platform with compliance and advanced features |
| **Plugin** | Package that extends Extora functionality |
| **Theme** | Specialized plugin controlling visual presentation |
| **Hook** | Lifecycle point where plugins execute code (action) or modify data (filter) |
| **Event** | Message published to event bus for cross-plugin communication |
| **Manifest** | `extora.json` — metadata declaring identity, dependencies, permissions |
| **Package** | Distributable `.extora` archive containing a plugin or theme |
| **Publisher** | Individual/organization publishing packages to Marketplace |
| **Tenant** | Isolated instance within multi-tenant deployment |
| **Open Core** | Business model: core OSS, premium features proprietary |
| **GMV** | Gross Merchandise Volume — total sales through Marketplace |
| **ARR** | Annual Recurring Revenue |
| **WAPD** | Weekly Active Plugin Developers — North Star Metric |
| **SBOM** | Software Bill of Materials — dependency inventory |
| **RLS** | Row-Level Security — PostgreSQL feature for tenant isolation |
| **HPA** | Horizontal Pod Autoscaler — Kubernetes auto-scaling |

### Appendix B: Extora Founding Principles

1. **Plugins over features.** Every feature request: "Can this be a plugin?" If not, fix the plugin system.
2. **Community over corporation.** The Foundation ensures the project outlasts any company.
3. **Developer experience is a feature.** Speed, clarity, and joy in development are non-negotiable.
4. **Security is not optional.** Every design considers security for 100K+ plugins and millions of users.
5. **Open wins.** Open source, open standards, open APIs, open governance. Transparent about proprietary.
6. **Ship to learn.** Perfect is the enemy of shipped. Release early, iterate.
7. **Long-term thinking.** Every decision evaluated against 10-year horizon.
8. **Respect the ecosystem.** Plugin/theme developer success is Extora's success.

### Appendix C: Document Maintenance

- **Review Cadence:** Quarterly (Jan, Apr, Jul, Oct)
- **Owner:** Extora Founder / CEO
- **Approvers:** Core Maintainers, TSC
- **This document is the living blueprint. Vision is immutable; implementation adapts.**

### Appendix D: Quick Reference — All API Endpoints

| Core Endpoints | Auth | Users | Roles | Plugins | Themes | Config | Media | System | Backups | Webhooks |
|---|---|---|---|---|---|---|---|---|---|---|
| Auth | 12 | — | — | — | — | — | — | — | — | — |
| Users | — | 9 | — | — | — | — | — | — | — | — |
| Roles | — | — | 6 | — | — | — | — | — | — | — |
| Plugins | — | — | — | 11 | — | — | — | — | — | — |
| Themes | — | — | — | — | 6 | — | — | — | — | — |
| Config | — | — | — | — | — | 6 | — | — | — | — |
| Media | — | — | — | — | — | — | 6 | — | — | — |
| System | — | — | — | — | — | — | — | 9 | — | — |
| Backups | — | — | — | — | — | — | — | — | 7 | — |
| Webhooks | — | — | — | — | — | — | — | — | — | 5 |
| Marketplace | — | — | — | — | — | — | — | — | — | 4 |
| **Subtotal** | **12** | **9** | **6** | **11** | **6** | **6** | **6** | **9** | **7** | **9** |

| Plugin Endpoints | Auth | CMS | Commerce | Forms |
|---|---|---|---|---|
| Auth-specific | 14 | — | — | — |
| CMS | — | 12 | — | — |
| Commerce | — | — | 24 | — |
| Forms | — | — | — | 14 |
| **Subtotal** | **14** | **12** | **24** | **14** |

**Total API Endpoints (Core + Plugins): ~120+**

---

*End of Extora Mega Blueprint v2.0*

*Next: EXTORA_QUICKSTART_DEVELOPMENT.md — First 30 Days of Coding*
