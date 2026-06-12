# Extora Founder Blueprint v1.0

**Document Classification:** Internal — Founders, Core Team, Strategic Partners
**Version:** 1.0
**Last Updated:** June 2026
**Status:** Pre-Seed / Architectural Planning

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Philosophy](#3-product-philosophy)
4. [Product Scope](#4-product-scope)
5. [Competitive Analysis](#5-competitive-analysis)
6. [Extora Product Architecture](#6-extora-product-architecture)
7. [Extora Studio Specification](#7-extora-studio-specification)
8. [Extora Core Specification](#8-extora-core-specification)
9. [Plugin Ecosystem Architecture](#9-plugin-ecosystem-architecture)
10. [Theme Ecosystem Architecture](#10-theme-ecosystem-architecture)
11. [Marketplace Architecture](#11-marketplace-architecture)
12. [Developer Experience](#12-developer-experience)
13. [Security Architecture](#13-security-architecture)
14. [Infrastructure Architecture](#14-infrastructure-architecture)
15. [Open Source Strategy](#15-open-source-strategy)
16. [Governance Model](#16-governance-model)
17. [Monetization Strategy](#17-monetization-strategy)
18. [Product Roadmap](#18-product-roadmap)
19. [Risks and Challenges](#19-risks-and-challenges)
20. [Success Metrics](#20-success-metrics)
21. [Appendices](#appendices)

---

## 1. Executive Summary

### 1.1 Product Vision

Extora is a universal software runtime platform where every piece of functionality — from an ecommerce cart to an authentication provider to a full ERP module — is a pluggable, composable, TypeScript-native package. Extora is not another CMS or application framework. It is the **operating system for web software**, capable of powering a personal blog, a SaaS product, a government portal, or a multi-billion-dollar marketplace, all from the same core runtime.

### 1.2 Mission Statement

> To create the world's most extensible, secure, and developer-friendly software platform where any digital experience can be assembled from plugins and themes — without sacrificing performance, security, or scalability at any scale.

### 1.3 Long-Term Goals (10-Year Horizon)

1. **100,000+ Plugins** in the Extora Marketplace, spanning every conceivable domain (CMS, commerce, analytics, AI, IoT, collaboration, identity, finance, education, health).
2. **10 Million+ Active Installations** across self-hosted, cloud-hosted, and enterprise deployments.
3. **$500M+ Annual Marketplace GMV** through plugin/theme sales, cloud hosting, and enterprise licensing.
4. **Become the default answer** for "How do I build X on the web?" — replacing fragmented choices of CMS, framework, and SaaS with a single, composable platform.
5. **Industry-standard plugin model** adopted beyond Extora itself, influencing how web software is packaged and distributed.

### 1.4 Market Positioning

Extora sits at the intersection of three massive markets:

| Market | TAM (2030 est.) | Extora's Angle |
|---|---|---|
| CMS / Web Experience Platforms | $30B+ | Plugin-first, no lock-in |
| Low-Code / No-Code Platforms | $80B+ | Developer-first, extensible |
| PaaS / Cloud Application Platforms | $160B+ | Self-hosted or cloud, open core |

Extora competes not by being "a better WordPress" or "a better Strapi," but by being the **platform on which the next WordPress, Shopify, or Odoo could itself be built as a plugin**.

---

## 2. Problem Statement

### 2.1 Current Limitations of WordPress

1. **Monolithic Legacy Codebase.** WordPress's core is procedural PHP with 20+ years of backward-compatibility constraints. Every new feature risks breaking the ecosystem. Modernization efforts (Gutenberg, REST API) are bolted onto a foundation never designed for them.
2. **Plugin Chaos.** No formal plugin isolation, dependency resolution, or sandboxing. Plugins can conflict, crash sites, leak data, and create security vulnerabilities with zero guardrails. The `wp-content/plugins` flat directory model doesn't scale.
3. **No Native Type System.** WordPress has no concept of typing, interfaces, or contracts. Plugin developers operate by convention and hope. There is no formal API contract between plugins and core or between plugins and other plugins.
4. **Developer Experience Gap.** No native CLI, no SDK, no first-class testing framework, no package manager integration, no modern build tooling. Developers coming from Laravel, Next.js, or Rails find WordPress development primitive.
5. **Weak Multi-Tenancy.** WordPress multisite is a thin layer over single-site architecture. True multi-tenant SaaS hosting of WordPress is operationally painful.
6. **Content-Model Rigidity.** Posts, pages, and custom post types are the only data model. Custom database tables, complex relationships, and polymorphic data require plugins to reinvent ORMs and storage layers.

### 2.2 Current Limitations of Modern Frameworks

1. **Framework Lock-In.** Next.js, Remix, Nuxt, SvelteKit, and Laravel each have their own paradigms. Building a plugin for one framework does not transfer to another. The ecosystem is fragmented.
2. **No Plugin Economy.** Frameworks are excellent for building applications but provide no marketplace, no upgrade mechanism, no licensing model, and no discovery surface for extensions.
3. **Build-vs-Buy Dilemma.** Every project starts from scratch or assembles a bespoke stack. There is no "app store" model for web application functionality.
4. **Operational Burden.** Deploying, monitoring, scaling, backing up, and securing a custom-built application requires significant DevOps expertise that most businesses and developers lack.
5. **No Unified Admin Experience.** Custom applications require building admin panels, user management, permissions, and dashboards from scratch. These are solved problems that should be platform features, not per-project features.

### 2.3 Why Extora Should Exist

The market is bifurcated between **ecosystem platforms** (WordPress, Shopify) that sacrifice developer experience and architectural purity for market reach, and **modern frameworks** (Next.js, Laravel) that sacrifice ecosystem and discoverability for developer experience. There is no platform that delivers both. Extora bridges this gap by creating a platform where:

- The plugin model is a **first-class architectural primitive**, not an afterthought.
- Every plugin operates under **formal contracts** (TypeScript interfaces) with dependency resolution, isolation, and sandboxing.
- The **marketplace is native to the platform**, not a bolt-on.
- The **developer experience rivals modern frameworks** with SDK, CLI, templates, testing, and CI/CD integration.
- The **runtime scales from a Raspberry Pi to a Kubernetes cluster** without architectural changes.

---

## 3. Product Philosophy

### 3.1 Plugin First

Every feature, service, and integration in Extora is or could be a plugin. The core runtime does almost nothing except load, orchestrate, and secure plugins. Even essential features like authentication, media management, and the admin UI are plugins. This forces architectural discipline: if the core team can't build a feature as a plugin, the plugin system isn't good enough.

### 3.2 API First

Every interaction — admin UI, CLI, SDK, third-party integration — goes through the same versioned, documented, strongly-typed API. There is no "admin-only" code path. There is no "internal only" function that bypasses the API. This ensures that anything the Studio UI can do, the CLI, SDK, or an external system can also do.

### 3.3 TypeScript First

The platform runtime, SDK, CLI, and all official plugins are written in TypeScript. The plugin contract system leverages TypeScript's type system as a formal specification language. Plugin developers write TypeScript and get compile-time guarantees about API compatibility. Extora's event system, hook system, and configuration system are all strongly typed end-to-end.

### 3.4 Container First

Every Extora deployment runs in containers from day one. The development environment uses Docker Compose. Production deployments use Docker with a Kubernetes migration path. The container model ensures consistent environments, clean isolation, and cloud-native deployment patterns.

### 3.5 Security First

Security is architected from the start, not retrofitted. Every plugin declares its required permissions. Every plugin runs with principle of least privilege. The plugin sandbox prevents filesystem escape, network exfiltration, and cross-plugin data access. The marketplace performs automated security scanning, dependency auditing, and malware detection before any package is published.

### 3.6 Marketplace First

The marketplace is not a website that lists plugins. It is a core platform service with a documented API, CLI integration, and in-Studio browsing. Plugin discovery, purchase, installation, activation, and updates all flow through the marketplace API. The marketplace is designed to handle commercial transactions (paid plugins, subscriptions, licensing) from day one.

---

## 4. Product Scope

### 4.1 What Extora Is

- A **plugin runtime platform** that loads, orchestrates, isolates, and secures plugins.
- An **administrative interface** (Studio) for managing installations, users, plugins, themes, content, and configuration.
- A **marketplace** for discovering, purchasing, and distributing plugins and themes.
- An **SDK and CLI** for building, testing, publishing, and managing plugins and themes.
- A **cloud hosting platform** for managed Extora deployments.
- An **enterprise solution** for large-scale, compliance-heavy, multi-tenant deployments.
- A **composable application framework** where plugins can build upon each other's APIs.

### 4.2 What Extora Is Not

- **Not a CMS.** Content management is a plugin (or set of plugins). Out of the box, Extora has no concept of pages, posts, or media — plugins provide these.
- **Not an ERP.** ERP functionality can be built as plugins, but Extora itself has no ERP-specific code.
- **Not an ecommerce platform.** Commerce functionality (carts, payments, inventory) is provided by plugins.
- **Not a website builder.** Visual page building is a plugin capability, not a core feature.
- **Not a low-code platform targeting non-developers.** Extora is developer-first. Non-developer tooling (visual builders, no-code workflows) can be built as plugins by the ecosystem.
- **Not a SaaS-only platform.** Self-hosting is a first-class deployment model with full feature parity.

### 4.3 Target Audience

| Segment | Description | Primary Need |
|---|---|---|
| **Plugin Developers** | Independent developers, agencies, ISVs | Build and monetize plugins |
| **Theme Developers** | Designers, agencies, freelancers | Build and monetize themes |
| **Solution Integrators** | Agencies, system integrators, consultants | Assemble custom solutions from plugins |
| **Business Owners** | SMB owners, ecommerce operators | Run a business website/application |
| **Enterprise IT** | Large organizations, government | Compliant, scalable, multi-tenant platforms |
| **SaaS Builders** | Startup founders, product teams | Build SaaS products on Extora |
| **Community Contributors** | Open source contributors | Improve the platform itself |

### 4.4 Primary Use Cases

1. **Content-Driven Websites** — Blogs, magazines, news sites, documentation portals.
2. **Ecommerce Platforms** — Online stores, marketplaces, subscription commerce, digital downloads.
3. **Business Applications** — CRMs, project management, invoicing, HR systems, asset management.
4. **SaaS Products** — Multi-tenant SaaS applications built as Extora plugins, sold to end customers.
5. **Community Portals** — Forums, membership sites, learning management systems, social networks.
6. **Enterprise Portals** — Intranets, knowledge bases, workflow automation, compliance dashboards.
7. **Headless Backends** — API-only deployments powering mobile apps, static sites, IoT devices.
8. **Government & Institutional** — Public-facing portals, citizen services, transparency platforms.

---

## 5. Competitive Analysis

### 5.1 Comparison Matrix

| Platform | Architecture Model | Plugin Model | Developer Experience | Type Safety | Marketplace | Self-Hosted | Multi-Tenant | Extora Advantage |
|---|---|---|---|---|---|---|---|---|
| **WordPress** | Monolithic PHP | Flat, unisolated | Weak (no CLI/SDK) | None (PHP) | Yes (wp.org) | Yes | Weak (Multisite) | Isolation, typing, DX, modern stack |
| **Strapi** | Headless CMS (Node) | Plugin system exists | Good (Node/TS) | Partial | Marketplace (Strapi Market) | Yes | No (Enterprise only) | Universal plugins (not CMS-locked), broader scope |
| **Directus** | Headless CMS (Node) | Extensions (hooks/endpoints) | Good (Vue/Node) | Partial | No true marketplace | Yes | No (Cloud only) | True plugin marketplace, broader scope |
| **Odoo** | Monolithic ERP (Python) | Module system | Weak for non-ERP | None | App Store (proprietary) | Yes (Community) | Yes (native) | Modern stack, open ecosystem, not ERP-locked |
| **Drupal** | Monolithic PHP | Module system | Weak | None | Yes (drupal.org) | Yes | Weak | Modern stack, typing, better DX |
| **Joomla** | Monolithic PHP | Extensions | Weak | None | Yes | Yes | No | Modern stack, significantly better architecture |
| **Shopify** | Proprietary SaaS | App store | Good (for apps) | Partial | Yes (App Store) | No | SaaS only | Self-hosted option, broader scope than commerce |
| **Headless CMS (Contentful, Sanity, etc.)** | SaaS CMS | Limited extensions | Varies | Varies | Limited | Rarely | SaaS only | Self-hosted, universal plugin model |
| **Next.js / Modern Frameworks** | Frontend/Fullstack framework | No plugin model | Excellent | Yes (TS) | No | N/A | N/A | Ecosystem + marketplace + admin UI |

### 5.2 Extora's Unique Positioning

- **Only platform** that combines a modern TypeScript stack, a formal plugin isolation model, a first-class marketplace, self-hosting, and a universal application scope.
- **Only platform** where the admin UI, API, CLI, and SDK are all first-class and equivalent interfaces to the same underlying system.
- **Only platform** where the plugin model is designed from the ground up for 100,000+ plugins coexisting safely.

---

## 6. Extora Product Architecture

### 6.1 Architectural Overview

Extora is composed of seven primary subsystems:

```
┌──────────────────────────────────────────────────────────────────┐
│                        EXTORA ECOSYSTEM                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Extora       │  │ Extora       │  │ Extora               │   │
│  │ Studio       │  │ CLI          │  │ Marketplace (Web)    │   │
│  │ (Admin UI)   │  │ (Dev Tool)   │  │ (Storefront + API)   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         │    REST / WS    │      REST API        │   REST API    │
│         └─────────────────┼──────────────────────┘               │
│                           │                                      │
│                    ┌──────▼──────┐                               │
│                    │ Extora Core │                               │
│                    │  (Runtime)  │                               │
│                    └──────┬──────┘                               │
│                           │                                      │
│         ┌─────────────────┼─────────────────┐                   │
│         │                 │                 │                    │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐            │
│  │ PostgreSQL  │  │   Redis     │  │   MinIO     │            │
│  │ (Primary DB)│  │  (Cache/    │  │ (Object     │            │
│  │             │  │   Queue)    │  │  Storage)   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Extora SDK   │  │ Extora Cloud │  │ Extora Enterprise    │   │
│  │ (Dev Library)│  │ (Hosting)    │  │ (Compliance/Scale)   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Subsystem Descriptions

#### Extora Studio
The browser-based administrative interface. A single-page application (React) that communicates with Extora Core exclusively through the REST API and WebSocket connections. Provides system management, user administration, plugin/theme management, content management, configuration, monitoring, backup/restore, and deployment orchestration.

#### Extora Core
The runtime engine. A Node.js/TypeScript process that loads plugins, manages the lifecycle, enforces security policies, routes API requests, manages the event bus and hook system, handles authentication/authorization, and coordinates all platform services. Core itself is a thin orchestrator; nearly all functionality comes from plugins.

#### Extora SDK
The developer toolkit. A TypeScript library (`@extora/sdk`) that provides:
- Type definitions for all Core APIs
- Plugin base classes and interfaces
- Testing utilities and mock Core environment
- Build tooling and bundling configuration
- Documentation generation from TypeScript types

#### Extora CLI
The command-line interface. A Node.js CLI (`extora`) for:
- Scaffolding plugins and themes (`extora create plugin`)
- Running local development environment (`extora dev`)
- Building and packaging plugins (`extora build`, `extora package`)
- Publishing to marketplace (`extora publish`)
- Managing installations (`extora plugin install`, `extora update`)
- Generating types, migrations, and test stubs

#### Extora Marketplace
The plugin and theme distribution platform. A web application and API that provides:
- Plugin and theme listing, search, and discovery
- Version management and release channels (stable, beta, alpha)
- Purchase and licensing flows (free, one-time, subscription)
- Automated security scanning and code analysis
- Review and rating system
- Dependency graph visualization and compatibility checking

#### Extora Cloud
The managed hosting platform. Provides:
- One-click Extora deployment
- Automatic updates and security patches
- Managed PostgreSQL, Redis, MinIO
- Automatic scaling and failover
- Backup and disaster recovery
- SSL certificate management
- CDN integration
- Usage-based pricing

#### Extora Enterprise
The enterprise-grade offering. Adds:
- SAML/OIDC/SSO integration
- Multi-tenancy with tenant isolation
- Advanced audit logging and compliance reporting
- Role-based access control with custom roles
- SLA-backed support
- On-premises deployment support
- Dedicated infrastructure
- Custom plugin review and approval workflows

---

## 7. Extora Studio Specification

### 7.1 Responsibilities

Extora Studio is the primary administrative interface for Extora installations. It serves as:
- The system management dashboard
- The plugin and theme management interface
- The content and data management interface (via content plugins)
- The configuration and settings interface
- The monitoring and health dashboard
- The backup, restore, and disaster recovery interface
- The deployment orchestration interface

### 7.2 Feature Set

#### 7.2.1 Dashboard
- System health overview (CPU, memory, disk, database connections, cache hit ratio)
- Active plugin count and status
- Pending updates (core, plugins, themes)
- Recent activity feed (user logins, plugin installs, configuration changes)
- Quick actions (create user, add plugin, view logs)

#### 7.2.2 User Management
- User CRUD with profile management
- Role management (built-in: Super Admin, Admin, Editor, Author, Viewer)
- Custom role creation with granular permission assignment
- Team/group management (for multi-user content workflows)
- API key management (create, revoke, scope, rate limit)
- Session management (view active sessions, force logout)
- Authentication provider configuration (local, OAuth, SAML, LDAP)

#### 7.2.3 Plugin Management
- Plugin browser (search, filter by category, rating, compatibility)
- Install from marketplace or upload `.extora` package file
- Activate, deactivate, uninstall with dependency checking
- Plugin settings (per-plugin configuration pages provided by plugins)
- Plugin update management (automatic, manual, rollback)
- Plugin dependency graph visualization
- Plugin health status (memory usage, error rate, response time)
- Plugin permission audit (review what permissions each plugin has)

#### 7.2.4 Theme Management
- Theme browser and installer (same UX as plugins)
- Theme activation with live preview
- Theme customization (colors, typography, layout, provided by themes)
- Theme override management (child theme equivalent)

#### 7.2.5 Configuration Management
- Environment-based configuration (development, staging, production)
- Configuration import/export (JSON/YAML)
- Configuration version history with diff view
- Sensitive value masking (secrets, API keys)
- Configuration validation with schema enforcement
- Bulk configuration editing

#### 7.2.6 Service Management
- Database status and connection pool monitoring
- Cache management (Redis flush, key inspection, hit/miss analytics)
- Object storage management (MinIO bucket browser, quota monitoring)
- Search engine configuration and index management (OpenSearch)
- Email service configuration and test
- Queue management (job monitoring, failed job retry, queue depth)

#### 7.2.7 Backup System
- Full system backup (database + file storage + configuration)
- Incremental backup support
- Scheduled automatic backups (hourly, daily, weekly, monthly)
- Backup retention policies
- Offsite backup destination configuration (S3, GCS, Azure Blob)
- Backup encryption at rest and in transit
- Backup integrity verification
- Point-in-time recovery support

#### 7.2.8 Restore System
- Backup browser with search and filtering
- Selective restore (specific plugins, specific database tables, specific files)
- Full system restore
- Pre-restore validation (compatibility check, storage check)
- Restore dry-run mode
- Restore progress tracking and logging
- Post-restore health check

#### 7.2.9 Monitoring
- Real-time metrics dashboard (requests/sec, error rate, latency percentiles)
- Plugin-level performance monitoring
- Database query performance analytics
- Cache efficiency metrics
- Error tracking with stack traces and context
- Alert configuration (CPU > 80%, error rate spike, disk > 90%)
- Alert channels (email, Slack, webhook, PagerDuty)
- Uptime monitoring integration

#### 7.2.10 Deployment
- Environment management (dev, staging, production)
- Deployment history with rollback capability
- Plugin deployment (promote plugin version across environments)
- Configuration deployment (promote configuration changes across environments)
- Deployment scheduling and approval workflows
- Post-deployment smoke tests
- Deployment audit log

### 7.3 Screen Architecture (Information Architecture)

```
Studio
├── Dashboard
│   ├── Overview
│   ├── Analytics (if analytics plugin installed)
│   └── Activity Feed
├── Users
│   ├── All Users
│   ├── Roles
│   ├── Teams
│   ├── API Keys
│   └── Sessions
├── Plugins
│   ├── Installed
│   ├── Marketplace (browse)
│   ├── Updates
│   └── Plugin Settings (per-plugin)
├── Themes
│   ├── Installed
│   ├── Marketplace (browse)
│   └── Customize (per-theme)
├── Content (provided by content plugins)
│   ├── Pages
│   ├── Posts
│   ├── Media
│   └── Custom Types
├── Configuration
│   ├── General
│   ├── Environment
│   ├── Services
│   └── Advanced
├── Services
│   ├── Database
│   ├── Cache
│   ├── Storage
│   ├── Search
│   └── Email
├── Backup & Restore
│   ├── Backups
│   ├── Schedule
│   ├── Restore
│   └── Settings
├── Monitoring
│   ├── Metrics
│   ├── Logs
│   ├── Alerts
│   └── Performance
├── Deployment
│   ├── Environments
│   ├── History
│   └── Settings
└── System
    ├── Updates (Core)
    ├── Health
    ├── Information
    └── Tools (cache clear, reindex, etc.)
```

### 7.4 Key User Flows

#### 7.4.1 New Installation Setup Flow
1. User navigates to Extora instance URL
2. Setup wizard: language selection, admin account creation
3. Setup wizard: database configuration (or confirm defaults)
4. Setup wizard: site name, description, timezone
5. Setup wizard: install recommended starter plugins (optional)
6. Redirect to Studio Dashboard

#### 7.4.2 Plugin Installation Flow
1. User navigates to Plugins → Marketplace
2. Searches/browses for desired plugin
3. Views plugin details (description, ratings, compatibility, dependencies, pricing)
4. Clicks "Install" (or "Purchase" for paid plugins)
5. System checks dependencies, resolves them, warns of conflicts
6. Plugin downloads, extracts, and registers with Core
7. System displays permissions required by plugin; user confirms
8. Plugin activates; success notification shown

#### 7.4.3 Backup and Restore Flow
1. User navigates to Backup & Restore → Backups
2. Clicks "Create Backup"
3. Selects backup scope: Full / Database Only / Files Only / Configuration Only
4. Optionally adds backup note/description
5. Confirms; backup job is queued
6. Progress displayed in real-time
7. Backup appears in backup list with metadata
8. To restore: user clicks "Restore" on a backup entry
9. Pre-restore validation runs; results displayed
10. User confirms restore; system enters maintenance mode
11. Restore executes; progress displayed
12. Post-restore health check runs; system exits maintenance mode
13. User is redirected to Dashboard

---

## 8. Extora Core Specification

### 8.1 Architectural Principles

1. **Core does almost nothing.** Core is an orchestrator and security boundary. All functionality beyond the absolute minimum comes from plugins.
2. **All APIs are versioned.** Every public API has a version (`v1`, `v2`) and breaking changes require major version bumps with deprecation periods.
3. **Everything is a plugin.** Authentication, the admin UI, media handling, even the database migration system — all are plugins.
4. **Hot-reload capable.** Plugins can be installed, updated, activated, and deactivated without full system restart.

### 8.2 Core Subsystems

#### 8.2.1 Authentication Engine
- Pluggable authentication providers (local password, OAuth 2.0, OIDC, SAML, LDAP, WebAuthn/Passkeys)
- JWT-based session management with refresh token rotation
- Multi-factor authentication (TOTP, SMS, email, hardware key)
- Brute-force protection with progressive rate limiting
- Account lockout and recovery flows
- Device/session fingerprinting and anomaly detection
- API key authentication with scoped permissions

#### 8.2.2 Authorization Engine
- Attribute-Based Access Control (ABAC) as the core model, with Role-Based Access Control (RBAC) as a configurable layer
- Permission resolution: `subject + resource + action + environment → allow/deny`
- Permission inheritance and override
- Plugin-declared custom permissions and resource types
- Policy evaluation at API boundary, plugin boundary, and data access layer
- Permission caching with real-time invalidation
- Audit log integration (every authorization decision is logged)

#### 8.2.3 Plugin Loader
- Plugin discovery: scans registered plugin directories and database for installed plugins
- Dependency resolution: builds directed acyclic graph of plugin dependencies, detects cycles, resolves version constraints (semver)
- Load ordering: topological sort of dependency graph; plugins loaded in dependency order
- Lifecycle management: `load` → `install` → `activate` → `deactivate` → `uninstall`
- Isolation: each plugin runs in its own context with restricted access to Core APIs
- Health monitoring: periodic health checks; unresponsive plugins can be automatically deactivated
- Error boundaries: plugin crash does not crash Core; plugin errors are caught, logged, and reported

#### 8.2.4 Theme Loader
- Theme discovery similar to plugin discovery
- Theme activation with asset pipeline (CSS/JS compilation, minification, cache busting)
- Theme inheritance/override (child themes)
- Template resolution (theme → parent theme → default)
- Component override at granular level (header, footer, sidebar, page template, etc.)
- Theme settings API for customization

#### 8.2.5 Event Bus
- Publish-subscribe event system with typed event contracts
- Synchronous and asynchronous event handlers
- Event priority/ordering
- Event sourcing pattern: all events are persisted to event store for replay/audit
- Event versioning and schema evolution
- Dead letter queue for failed event processing
- Cross-plugin communication channel via events (with permission checks)

#### 8.2.6 Hook System
- Action hooks (do something at a point in the lifecycle)
- Filter hooks (modify data passing through a point in the lifecycle)
- Typed hook signatures (input type, output type, context type)
- Hook priority with integer ordering
- Hook removal and replacement
- Hook deprecation notices
- Performance monitoring of hook execution (slow hook detection)

#### 8.2.7 Configuration Manager
- Hierarchical configuration resolution (default → environment → database → runtime override)
- Typed configuration schema (JSON Schema with TypeScript types)
- Configuration change detection and notification
- Encrypted configuration values for secrets
- Configuration history with versioning and diff
- Configuration validation on write
- Hot configuration reload (config changes take effect without restart where possible)

#### 8.2.8 Media Manager
- Abstract storage backend interface (local filesystem, S3, GCS, Azure, MinIO)
- Image processing pipeline (resize, crop, format conversion, optimization)
- Metadata extraction and storage (EXIF, IPTC, XMP)
- Access control with signed URLs for private media
- CDN integration for public media
- Duplicate detection and deduplication
- Media library API with search, filter, and bulk operations
- Video and audio transcoding (via plugins)

#### 8.2.9 API Engine
- REST API with OpenAPI 3.1 specification auto-generation
- GraphQL endpoint with automatic schema generation from registered types
- WebSocket API for real-time events and subscriptions
- Request validation against typed schemas
- Rate limiting (per user, per API key, per IP, per endpoint)
- Response caching with tag-based invalidation
- API versioning (URL path: `/api/v1/...`)
- Pagination, sorting, filtering, field selection, and expansion (sparse fieldsets)
- Batch request processing
- API usage analytics and metering

---

## 9. Plugin Ecosystem Architecture

### 9.1 Plugin Lifecycle

```
                    ┌──────────┐
                    │  Created  │  (scaffolded via CLI)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Developed │  (local development with `extora dev`)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Tested   │  (unit, integration, e2e tests)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Packaged │  (`extora build` → `.extora` file)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Published │  (`extora publish` → Marketplace)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Reviewed │  (automated + manual review)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Listed   │  (available in Marketplace)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Installed │  (user installs via Studio/CLI)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Activated │  (loaded into Core runtime)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Running  │  (active, serving requests)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Updated  │  (new version installed)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │Deactivated│  (unloaded from Core)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │Uninstalled│  (removed from system)
                    └──────────┘
```

### 9.2 Plugin Manifest (`extora.json`)

Every plugin MUST include a manifest file at its root:

```jsonc
{
  "name": "@vendor/plugin-name",
  "version": "1.0.0",
  "type": "plugin",
  "title": "Human-Readable Plugin Name",
  "description": "A brief description of what this plugin does.",
  "author": {
    "name": "Vendor Name",
    "email": "support@vendor.com",
    "url": "https://vendor.com"
  },
  "license": "MIT",
  "icon": "assets/icon.svg",
  "screenshots": ["assets/screenshot-1.png"],
  "categories": ["commerce", "payment"],
  "keywords": ["stripe", "payment", "checkout"],
  "homepage": "https://vendor.com/plugin-name",
  "repository": "https://github.com/vendor/plugin-name",
  "documentation": "https://docs.vendor.com/plugin-name",
  "extora": {
    "core": ">=1.0.0 <2.0.0",
    "engine": ">=1.0.0"
  },
  "dependencies": {
    "@extora/auth": ">=1.0.0 <2.0.0",
    "@vendor/another-plugin": "^2.1.0"
  },
  "optionalDependencies": {
    "@extora/search": ">=1.0.0"
  },
  "conflicts": {
    "@competitor/similar-plugin": "*"
  },
  "permissions": [
    "database:read",
    "database:write",
    "http:outbound",
    "storage:read",
    "storage:write",
    "user:read"
  ],
  "entry": {
    "server": "dist/server/index.js",
    "studio": "dist/studio/index.js",
    "cli": "dist/cli/index.js"
  },
  "hooks": {
    "actions": ["user.registered", "order.completed"],
    "filters": ["email.template", "checkout.total"],
    "events": ["payment.received", "subscription.cancelled"]
  },
  "api": {
    "rest": {
      "endpoints": ["/api/v1/plugin-name/*"]
    },
    "graphql": {
      "types": ["dist/graphql/schema.graphql"]
    }
  },
  "database": {
    "migrations": "dist/migrations/",
    "seeds": "dist/seeds/"
  },
  "config": {
    "schema": "dist/config/schema.json"
  },
  "minimum": {
    "memory": "64MB",
    "cpu": "0.1",
    "disk": "10MB"
  }
}
```

### 9.3 Plugin Dependency Resolution

- Semantic versioning (semver) with standard operators (`^`, `~`, `>=`, `<`, `*`)
- Recursive dependency resolution: if Plugin A requires Plugin B, and Plugin B requires Plugin C, all three are installed
- Dependency deduplication: if two plugins require different versions of the same dependency, the resolver attempts to find a compatible version that satisfies both; if impossible, installation is blocked with a detailed conflict report
- Circular dependency detection: installation is blocked if a circular dependency is detected
- Optional dependencies: installed if available and compatible; silently skipped if not
- Peer dependencies: a plugin may declare that it expects a host plugin to provide certain functionality (e.g., a payment gateway plugin expects a commerce plugin)

### 9.4 Plugin Installation Flow (Technical)

1. Package downloaded from Marketplace or uploaded locally
2. SHA-256 checksum verified against Marketplace signature
3. Package extracted to a sandboxed staging directory
4. Manifest parsed and validated
5. Dependency resolution executed
6. Permissions declaration reviewed against system policy
7. Security scanning (static analysis, known vulnerability check)
8. If all checks pass: plugin files moved to permanent plugin directory
9. Database migrations executed (in transaction, with rollback on failure)
10. Plugin registered in Core database
11. Plugin activated

### 9.5 Plugin Upgrades

1. New version downloaded; checksum verified
2. Current version's state snapshot created (for rollback)
3. Plugin deactivated
4. New version's files replace old version's files
5. New version's migrations executed (determine delta from last applied migration)
6. Plugin reactivated
7. Health check performed
8. On failure: automatic rollback to previous version + snapshot state

### 9.6 Plugin Isolation

Each plugin runs with:
- **Separate Node.js VM context** (using `node:vm` with restricted globals) or **separate Worker thread**
- **Filesystem access restricted** to its own plugin directory and explicitly granted paths
- **Network access restricted** to explicitly declared outbound hosts and ports
- **Database access mediated** through Core's database abstraction layer with permission-scoped queries
- **Memory and CPU limits** enforced by the runtime with automatic throttling
- **No direct access** to other plugins' data, files, or memory space

### 9.7 Plugin Permissions

Every plugin declares required permissions in its manifest. Permissions are categorized:

| Category | Examples |
|---|---|
| `database:*` | `database:read`, `database:write`, `database:schema` |
| `http:*` | `http:outbound`, `http:outbound:stripe.com` |
| `storage:*` | `storage:read`, `storage:write`, `storage:delete` |
| `user:*` | `user:read`, `user:write`, `user:email` |
| `system:*` | `system:config`, `system:cron`, `system:queue` |
| `plugin:*` | `plugin:install`, `plugin:activate`, `plugin:configure` |
| `hook:*` | `hook:register`, `hook:execute`, `hook:modify` |
| `event:*` | `event:publish`, `event:subscribe` |

Permissions are enforced at the API gateway, plugin boundary, and database abstraction layer. A plugin attempting an operation without declared permission receives a `403 Forbidden` with a clear error message indicating the missing permission.

### 9.8 Plugin Sandboxing

- **Filesystem sandboxing:** Plugins cannot access files outside their allowed paths using `fs` module overrides
- **Network sandboxing:** Outbound HTTP requests are intercepted and validated against declared hosts
- **Process sandboxing:** Plugins cannot spawn child processes or access `child_process`, `worker_threads` (except Core-managed workers)
- **Module sandboxing:** Plugins can only import modules declared in their own `node_modules` and Core-approved shared modules; importing arbitrary npm packages at runtime is blocked
- **Resource limits:** CPU time, memory, and disk I/O are monitored; excessive usage triggers throttling or deactivation
- **Code integrity:** Plugin code is loaded from the verified package; runtime code injection or `eval` usage in plugin context is blocked (Content Security Policy enforced)

---

## 10. Theme Ecosystem Architecture

### 10.1 Theme Model

Themes in Extora are a specialized type of plugin. A theme is a plugin with `"type": "theme"` in its manifest that provides:
- Layout templates (rendered server-side)
- Static assets (CSS, JavaScript, images, fonts)
- Component overrides (can override any component registered by other plugins)
- Configuration for visual customization (colors, typography, spacing, etc.)

### 10.2 Theme Inheritance

```
Base Theme
    │
    ▼
Child Theme (overrides templates, styles, components)
    │
    ▼
User Customizations (stored in database, highest priority)
```

### 10.3 Theme Engine

- Server-side rendering with streaming support
- Template language: JSX/TSX (native to TypeScript ecosystem)
- Component registration system: plugins register React/Vue/Svelte components that themes can override
- Asset pipeline: automatic bundling, minification, code splitting, cache-busting hashes
- CSS strategy: CSS Modules, Tailwind, or styled-components — theme author's choice; Core provides CSS variable system for dynamic theming
- Responsive images: automatic `srcset` generation for theme-specified image breakpoints
- Internationalization: theme strings are extracted for translation

### 10.4 Theme Marketplace Considerations

- Themes undergo the same security review as plugins
- Theme monetization: free, one-time purchase, subscription (for updates and support)
- Theme preview: interactive preview before purchase/activation
- Theme compatibility: declared compatibility with specific plugins (e.g., "Optimized for @extora/commerce")

---

## 11. Marketplace Architecture

### 11.1 Marketplace as a Platform Service

The marketplace is not a separate website. It is a core Extora service that:
- Has a public API endpoint for browsing, searching, and downloading packages
- Has an administrative API for publishers to manage their listings
- Is browsable from within Extora Studio
- Is queryable from the Extora CLI
- Handles all commercial transactions (payment processing, license generation, revenue distribution)

### 11.2 Marketplace Data Model

```
Publisher
  ├── id, name, email, verified_status, payout_method
  ├── has_many: Packages

Package
  ├── id, name (@vendor/name), title, description, type (plugin|theme)
  ├── categories[], keywords[], icon, screenshots[]
  ├── license, homepage, repository, documentation
  ├── is_paid, pricing_model (free|one_time|subscription)
  ├── price (USD), subscription_interval (monthly|yearly)
  ├── belongs_to: Publisher
  ├── has_many: Versions

Version
  ├── id, version (semver), changelog
  ├── extora_core_constraint, extora_engine_constraint
  ├── dependencies (JSON), permissions (JSON)
  ├── package_file_url, checksum_sha256, size_bytes
  ├── status (draft|review|published|rejected|deprecated|revoked)
  ├── release_channel (alpha|beta|stable)
  ├── download_count
  ├── belongs_to: Package

Review
  ├── id, rating (1-5), title, body
  ├── belongs_to: User, Version

SecurityScan
  ├── id, scan_type, findings[], severity, passed
  ├── belongs_to: Version

License
  ├── id, license_key, type (per-site|per-domain|unlimited)
  ├── status (active|expired|revoked)
  ├── expires_at, seats
  ├── belongs_to: User/Organization, Package

Transaction
  ├── id, amount, currency, status
  ├── publisher_payout, platform_fee
  ├── belongs_to: User, Package
```

### 11.3 Marketplace Submission Flow

1. Developer publishes package via CLI: `extora publish`
2. Package uploaded to Marketplace staging area
3. Automated checks executed:
   - Manifest validation
   - Static code analysis (ESLint, TypeScript strict mode)
   - Dependency vulnerability scan (`npm audit`, Snyk)
   - Malware signature scan
   - Permission declaration audit (over-privilege detection)
   - Bundle size check and optimization recommendations
   - Compatibility matrix generation (tested against multiple Core versions)
4. If all automated checks pass: package enters review queue
5. Human/moderated review (for first publication and major updates):
   - Code quality review
   - Security review
   - UX review (screenshots, description accuracy)
   - License compliance check
6. Package published to specified release channel
7. Publisher notified; package immediately searchable in Marketplace

### 11.4 Marketplace Revenue Model

- **Free plugins:** No transaction fees
- **Paid plugins (one-time):** 15% platform fee (industry standard, aligned with Apple/Google app stores pre-2020), 85% to developer
- **Paid plugins (subscription):** 15% platform fee first year, 10% subsequent years; 85-90% to developer
- **Enterprise partnerships:** Custom revenue share for high-volume publishers
- **Marketplace advertising:** Optional promoted listings (clearly marked as sponsored)

---

## 12. Developer Experience

### 12.1 Extora SDK (`@extora/sdk`)

The SDK is a TypeScript library that provides everything a developer needs to build Extora plugins and themes:

```typescript
// Core type definitions
import type { Plugin, PluginContext, HookHandler, EventPayload } from '@extora/sdk';

// Plugin base class
import { BasePlugin } from '@extora/sdk';

// Testing utilities
import { createMockCore, MockDatabase, MockStorage } from '@extora/sdk/testing';

// Type-safe hook registration
import { addAction, addFilter, removeAction, removeFilter } from '@extora/sdk';

// Configuration helpers
import { defineConfig, validateConfig } from '@extora/sdk/config';

// Database helpers
import { Migration, Schema, QueryBuilder } from '@extora/sdk/database';

// API endpoint helpers
import { Router, middleware, validate } from '@extora/sdk/api';

// CLI helpers
import { Command, registerCommand, output } from '@extora/sdk/cli';
```

### 12.2 Extora CLI

```bash
# Create a new plugin
extora create plugin my-awesome-plugin
# or: extora create theme my-awesome-theme

# Start local development with hot reload
extora dev

# Build plugin for production
extora build

# Run tests
extora test
extora test --watch
extora test --coverage

# Lint and format
extora lint
extora format

# Package plugin for distribution
extora package

# Publish to Marketplace
extora publish
extora publish --channel beta

# Manage local Extora installation
extora plugin install @vendor/plugin-name
extora plugin update @vendor/plugin-name
extora plugin list
extora plugin activate @vendor/plugin-name
extora plugin deactivate @vendor/plugin-name

# Generate code stubs
extora generate migration create_users_table
extora generate api-endpoint users
extora generate hook user.registered

# Docker management
extora docker up       # Start local development environment
extora docker down     # Stop
extora docker reset    # Reset to clean state

# Debugging
extora logs            # Tail Core logs
extora logs --plugin @vendor/plugin-name  # Tail plugin-specific logs
extora shell           # Interactive REPL with Core context
```

### 12.3 Project Templates

```
Official Templates:
  extora create plugin my-plugin          (Basic plugin)
  extora create plugin my-plugin --api    (Plugin with REST endpoints)
  extora create plugin my-plugin --admin  (Plugin with Studio pages)
  extora create plugin my-plugin --full   (Full-featured plugin template)
  extora create theme my-theme            (Basic theme)
  extora create theme my-theme --commerce (Commerce-optimized theme)
  extora create saas my-saas              (SaaS application template)
  extora create integration my-integration (Third-party integration template)
```

### 12.4 Documentation Strategy

- **Developer Portal** (`docs.extora.dev`): Comprehensive documentation site
  - Getting Started guide (5-minute quickstart)
  - Core Concepts deep-dive
  - API Reference (auto-generated from TypeScript types)
  - Plugin Development Guide
  - Theme Development Guide
  - Marketplace Publishing Guide
  - Tutorials with complete example projects
  - Migration guides (from WordPress, Strapi, custom stacks)
  - Video tutorials for visual learners
- **Interactive API Explorer:** Swagger UI + GraphiQL embedded in docs
- **TypeDoc Integration:** All SDK documentation auto-generated from source code
- **Community Docs:** User-contributed guides, tutorials, and recipes (GitHub-based)

### 12.5 Testing Framework

- **Unit Testing:** Jest (or Vitest) with `@extora/sdk/testing` providing mock Core environment
- **Integration Testing:** Docker-based Extora instance with test plugins; API-level testing with supertest
- **E2E Testing:** Playwright tests against a full Extora instance including Studio
- **Plugin Testing Matrix:** Marketplace CI runs plugin tests against multiple Core versions and reports compatibility
- **Performance Testing:** k6/Artillery load testing scripts as part of SDK template

### 12.6 Versioning Strategy

- **Core:** Strict semantic versioning. Major versions may contain breaking API changes; supported for 18 months after next major release. LTS releases supported for 3 years.
- **SDK:** Versions mirror Core versions. Backward-compatible within major version.
- **Plugins:** Follow semver. Declare Core version constraint in manifest.
- **API:** Versioned independently (`/api/v1/`, `/api/v2/`). Deprecation announced 6 months before removal.
- **Marketplace Packages:** Every version of every package is immutable once published. Versions can be deprecated or revoked (for security issues) but never deleted.

---

## 13. Security Architecture

### 13.1 Authentication

- **Local Authentication:** bcrypt/argon2 password hashing, configurable work factors
- **OAuth 2.0 / OIDC:** Full OIDC RP implementation; supports Google, GitHub, Microsoft, Apple, and custom providers
- **SAML 2.0:** Enterprise SSO integration
- **LDAP / Active Directory:** Enterprise directory integration
- **WebAuthn / Passkeys:** Passwordless authentication with biometric support
- **JWT Sessions:** Short-lived access tokens (15 min), longer-lived refresh tokens with rotation and reuse detection
- **API Keys:** Scoped, revocable, with usage tracking and anomaly detection

### 13.2 Authorization

- **Policy as Code:** Authorization policies written in a declarative policy language (Rego/OPA or custom DSL), stored in version control
- **Policy Evaluation Points (PEP):** Enforce at API gateway, plugin boundary, data access layer
- **Policy Decision Point (PDP):** Centralized authorization service that evaluates policies
- **Policy Information Point (PIP):** Retrieves attributes about subject, resource, and environment
- **Default Deny:** Any operation not explicitly allowed by policy is denied

### 13.3 Secrets Management

- **Never in code:** Secrets must be injected via environment variables, mounted files (Docker secrets / Kubernetes secrets), or external vault (HashiCorp Vault integration)
- **Configuration encryption:** Secrets stored in Extora configuration are encrypted at rest (AES-256-GCM) with key derivation from master key
- **Master key:** Stored in environment variable or external KMS; never stored in database
- **Plugin secrets:** Plugins can request secure secret storage through Core API; secrets encrypted with plugin-specific keys
- **Secret rotation:** API for scheduled and on-demand secret rotation

### 13.4 Audit Logs

- **Immutable audit trail:** All security-relevant events logged to append-only audit storage
- **Events captured:** Authentication attempts (success/failure), authorization decisions (allow/deny), configuration changes, plugin installations/updates/removals, user CRUD, permission changes, data export, backup operations
- **Log format:** Structured JSON with standardized schema (timestamp, actor, action, resource, outcome, context, IP, user agent)
- **Log retention:** Configurable; defaults to 90 days online, 7 years archived
- **Log integrity:** Cryptographic chain (hash chain / Merkle tree) for tamper detection
- **SIEM integration:** Syslog, Splunk, Elastic Stack compatible output

### 13.5 Secure Plugin Model

- **Principle of Least Privilege:** Plugins declare minimum required permissions; Core enforces them
- **Capability-Based Security:** Instead of broad "admin" access, plugins request specific capabilities
- **Runtime Verification:** At plugin load time and during execution, Core verifies that plugin code matches the published and reviewed package (integrity check)
- **Update Verification:** Plugin updates require re-review (automated + optional manual) before going live on user installations
- **Plugin-to-Plugin Communication:** Mediated through Core's event bus; plugins cannot directly call each other's code or access each other's data without explicit permission
- **Deprecation and Revocation:** Marketplace can globally revoke a plugin version (e.g., critical CVE); all installations are notified and can auto-update or auto-deactivate

### 13.6 Package Validation

- **Integrity:** Every package is SHA-256 hashed; hash published and verified on download
- **Signature:** Packages signed by publisher's private key; signature verified by Marketplace and Core; Marketplace countersigns
- **Provenance:** Build provenance metadata (SLSA / Sigstore) — where was the package built, from what source, using what toolchain
- **Software Bill of Materials (SBOM):** Every package includes an SBOM (SPDX or CycloneDX) listing all dependencies and their versions

### 13.7 Supply Chain Security

- **Dependency Pinning:** All dependencies must be pinned to exact versions in lockfile
- **Automated Vulnerability Scanning:** Every package version scanned against CVE databases (GitHub Advisory, OSV, Snyk) on publish and periodically thereafter
- **Dependency Firewall:** Marketplace can block publication of packages with known critical vulnerabilities
- **Proactive Notification:** If a published package is found to have a new vulnerability, publisher and all installations are notified
- **SBOM Aggregation:** Core generates aggregate SBOM for the entire installation (all plugins + all their dependencies)
- **Zero-Trust Registry:** npm packages used by plugins are proxied through Extora's registry with additional scanning and caching

---

## 14. Infrastructure Architecture

### 14.1 Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js 22+ (LTS) | Mature, fast, TypeScript-native runtime |
| **Primary Database** | PostgreSQL 16+ | ACID compliance, JSON/JSONB support, full-text search, row-level security, mature ecosystem |
| **Cache & Queue** | Redis 7+ (Valkey-compatible) | In-memory cache, pub/sub, job queues (BullMQ), session store, rate limiter backend |
| **Object Storage** | MinIO (S3-compatible) | Self-hosted S3-compatible storage; also supports AWS S3, GCS, Azure Blob |
| **Reverse Proxy** | Nginx (or Caddy) | TLS termination, static file serving, rate limiting, WebSocket proxying |
| **Search Engine** | OpenSearch (Elasticsearch-compatible) | Full-text search, analytics, log aggregation, APM, observability |
| **Container Runtime** | Docker + Docker Compose | Development and single-server production deployment |
| **Orchestration (Future)** | Kubernetes (k3s for edge) | Multi-node production, auto-scaling, rolling updates, service mesh |
| **CI/CD** | GitHub Actions (OSS) + proprietary pipeline | Build, test, scan, package, publish, deploy |
| **Monitoring** | Prometheus + Grafana (metrics) + OpenSearch (logs) | Open source, industry standard, extensible |
| **Tracing** | OpenTelemetry | Vendor-neutral distributed tracing |

### 14.2 Deployment Architecture (Single-Node / Docker Compose)

```
                    ┌──────────────────────┐
                    │       Internet        │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Nginx (443/TLS)    │
                    │   Rate Limiting       │
                    │   Static Assets       │
                    └──────────┬───────────┘
                               │
               ┌───────────────┼───────────────┐
               │               │               │
    ┌──────────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │ Extora Core     │ │ Extora     │ │ Extora     │
    │ (API + Runtime) │ │ Core       │ │ Core       │
    │ Instance 1      │ │ Instance 2 │ │ Instance N │
    └──────────┬──────┘ └─────┬──────┘ └─────┬──────┘
               │              │              │
               └──────────────┼──────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
  ┌──────▼──────┐    ┌───────▼───────┐   ┌───────▼──────┐
  │ PostgreSQL  │    │ Redis/Valkey  │   │    MinIO     │
  │  (Primary)  │    │ (Cache/Queue) │   │   (Storage)  │
  └─────────────┘    └───────────────┘   └──────────────┘
                              │
                    ┌─────────▼──────────┐
                    │    OpenSearch      │
                    │  (Search + Logs)   │
                    └────────────────────┘
```

### 14.3 Deployment Architecture (Multi-Node / Kubernetes — Year 3+)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Kubernetes Cluster                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Ingress       │  │   Cert Manager  │  │   External DNS  │      │
│  │ (Nginx/Traefik) │  │ (Auto TLS)      │  │                 │      │
│  └────────┬────────┘  └─────────────────┘  └─────────────────┘      │
│           │                                                          │
│  ┌────────▼────────────────────────────────────────────────────┐     │
│  │                    Extora Core (Deployment)                   │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │     │
│  │  │  Pod 1   │  │  Pod 2   │  │  Pod 3   │  │  Pod N   │    │     │
│  │  │ (HPA)    │  │          │  │          │  │          │    │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ PostgreSQL   │ │ Redis       │ │ MinIO       │ │ OpenSearch  │  │
│  │ Operator     │ │ Cluster     │ │ Operator    │ │ Cluster     │  │
│  │ (HA + BDR)   │ │ (Sentinel)  │ │ (Dist.)     │ │ (HA)        │  │
│  └──────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Observability Stack                               │   │
│  │  Prometheus │ Grafana │ OpenTelemetry │ AlertManager          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 14.4 Database Design Principles

- **Multi-Tenancy:** Tenant ID column on all tables; row-level security (RLS) policies enforce tenant isolation
- **Migrations:** Idempotent, versioned, transactional migrations with up/down support
- **Plugin Tables:** Each plugin can create its own database tables in a `plugin_<plugin_name>_` namespace to avoid collisions
- **Indexing:** Core enforces index naming conventions; automated index recommendation based on query patterns (via `pg_stat_statements`)
- **Connection Pooling:** PgBouncer in production for connection management
- **Backup:** Continuous WAL archiving for point-in-time recovery; daily full backups to MinIO/S3

---

## 15. Open Source Strategy

### 15.1 Open Core Business Model

Extora follows the **Open Core** model, similar to GitLab, Supabase, and Odoo. The core runtime, SDK, CLI, and essential plugins are open source under a permissive license. Premium features related to management, hosting, enterprise compliance, and marketplace operations are source-available or proprietary.

### 15.2 Public Repositories (Open Source — MIT License)

| Repository | Description | License |
|---|---|---|
| `extora-core` | The core runtime engine. Plugin loader, event bus, hook system, API engine, configuration manager, authentication/authorization engine. | MIT |
| `extora-sdk` | Developer toolkit. Type definitions, base classes, testing utilities, build tooling. | MIT |
| `extora-cli` | Command-line interface. Scaffolding, development server, build, publish, manage. | MIT |
| `extora-docs` | Documentation site source. Developer portal, API reference, guides, tutorials. | MIT (content: CC-BY 4.0) |
| `extora-core-plugins` | Essential plugins maintained by Core team: authentication, basic content types, media manager, admin API. | MIT |
| `extora-docker` | Docker Compose configurations, Dockerfiles, and container tooling. | MIT |

### 15.3 Private Repositories (Source Available / Proprietary)

| Repository | Description | License |
|---|---|---|
| `extora-studio` | The browser-based administrative interface. | Extora Community License (source available, free for non-commercial, paid for commercial) |
| `extora-marketplace` | Marketplace platform (storefront, publisher portal, payment processing, review system, automated scanning pipeline). | Proprietary |
| `extora-cloud` | Managed hosting platform infrastructure and orchestration. | Proprietary |
| `extora-enterprise` | Enterprise features: SSO/SAML, multi-tenancy, advanced RBAC, compliance reporting, dedicated infrastructure tooling. | Proprietary (with source available for audit) |

### 15.4 Rationale for Open Core

1. **Developer Trust and Adoption:** Open source Core, SDK, and CLI removes barriers to entry. Developers can inspect, modify, and contribute to the platform. This builds the community that creates plugins — which is Extora's primary value.
2. **Ecosystem Network Effects:** The more developers building on Extora, the more plugins in the marketplace, the more users adopting, the more developers attracted. An open core fuels this flywheel.
3. **Commoditize the Complement:** The Core runtime is the complement to the Marketplace, Cloud, and Enterprise offerings. Making Core open source makes it ubiquitous, which increases the addressable market for the commercial products.
4. **Enterprise Trust:** Large organizations need source access for security audits, compliance, and business continuity. Open Core provides this without making everything free.
5. **Sustainable Monetization:** The proprietary layers (Studio premium features, Marketplace, Cloud, Enterprise) generate revenue that funds Core development. This avoids the "open source burnout" where maintainers are underfunded.
6. **Preventing Fragmentation:** By keeping Marketplace and Cloud proprietary, Extora prevents the harmful fork scenario where a competitor copies the business model without contributing back.

---

## 16. Governance Model

### 16.1 Organizational Structure

```
                        Extora Foundation (Non-Profit)
                                │
                ┌───────────────┼───────────────┐
                │               │               │
          Core Maintainers   Technical        Community
          (5-7 people)      Steering         Managers
                            Committee        (2-3 people)
                            (TSC)
                │
        ┌───────┼───────┐
        │       │       │
    Committers  Contributors  Community
    (20-50)     (unlimited)   Members (unlimited)
```

### 16.2 Role Definitions

#### Extora Foundation
The non-profit legal entity that holds the Extora trademark, owns the open source repositories, and ensures the project remains true to its mission. Funded by a percentage of Extora Inc.'s revenue. Governed by a board including community representatives, Core team members, and independent directors.

#### Core Maintainers
Full-time (employed by Extora Inc. or sponsored) engineers responsible for:
- Setting technical direction and architecture
- Reviewing and merging pull requests to Core repositories
- Managing the release process
- Maintaining CI/CD infrastructure
- Security incident response
- Onboarding and mentoring committers

#### Technical Steering Committee (TSC)
Composed of Core Maintainers and elected Committer representatives. Responsible for:
- RFC (Request for Comments) process for major changes
- Technical decision-making when consensus cannot be reached
- Deprecation and breaking change policy enforcement
- Plugin ecosystem standards and API design guidelines

#### Committers
Trusted community contributors with merge access to specific repositories:
- Nominated by existing Committers or Core Maintainers
- Must demonstrate sustained, high-quality contributions
- Responsible for reviewing and merging contributions in their area
- Participate in TSC elections

#### Contributors
Anyone who contributes code, documentation, bug reports, translations, or community support. No formal process required — just submit a pull request or issue.

#### Community Members
Anyone using Extora, participating in forums, or attending community events.

### 16.3 Pull Request Workflow

```
1. Contributor forks repository
2. Contributor creates feature branch
3. Contributor submits PR with:
   - Linked issue(s)
   - Description of changes
   - Screenshots/videos (if UI changes)
   - Breaking change notice (if applicable)
   - Test coverage report
4. Automated CI runs:
   - Linting (ESLint, Prettier)
   - Type checking (TypeScript strict)
   - Unit tests
   - Integration tests
   - Bundle size analysis
   - License compliance check
5. At least 1 Committer reviews (2 for Core / security-sensitive code)
6. All review threads resolved
7. CI passing
8. Committer merges (squash or rebase, per repo policy)
9. Changes automatically deployed to canary/development environment
10. Merge triggers changelog generation
```

### 16.4 Release Workflow

```
Release Channels:
  - canary: Every merge to main (automated, no version bump)
  - beta: Weekly or bi-weekly (manual trigger, pre-release semver)
  - stable: Monthly (manual, tested, with release notes)
  - lts: Every 6 months, supported for 18-36 months

Release Process:
  1. Release Manager nominated for the cycle
  2. Release branch created from main
  3. Release candidate (RC) tagged
  4. RC deployed to staging environment
  5. Smoke tests and regression tests executed
  6. Community testing period (1 week for stable, 2 weeks for LTS)
  7. Bug fixes backported to release branch
  8. Final release tagged and signed
  9. Docker images built and pushed
  10. Release notes published
  11. SDK and CLI updated to match new Core version
  12. Plugin compatibility matrix updated
  13. Marketplace updated with compatible Core versions
  14. All installations notified of available update
```

### 16.5 Decision-Making Process

- **RFC Process:** Major changes (new subsystems, breaking API changes, architectural shifts) require an RFC. RFC is published as a GitHub Discussion or dedicated RFC repository. Community feedback period of minimum 2 weeks. TSC votes on acceptance.
- **Lazy Consensus:** For non-controversial changes, if no objections are raised within 72 hours, the change is considered approved.
- **Voting:** For controversial decisions, TSC members vote. Simple majority wins. Tie broken by Core Maintainer consensus.
- **Code of Conduct:** All participants must follow the Extora Community Code of Conduct. Violations handled by Community Managers with escalation to Foundation board.

---

## 17. Monetization Strategy

### 17.1 Revenue Streams

| Stream | Description | Projected Contribution (Year 5) |
|---|---|---|
| **Marketplace Revenue Share** | 15% of plugin/theme sales (one-time), 15%/10% (subscription first year/subsequent) | 35% |
| **Cloud Hosting** | Managed Extora hosting with tiered pricing based on resources and scale | 30% |
| **Enterprise Licenses** | Annual per-seat or per-instance licensing for enterprise features (SSO, RBAC, multi-tenancy, audit, SLA) | 20% |
| **Premium Plugins (1st Party)** | Extora-built premium plugins (commerce, advanced analytics, AI, workflow automation) | 10% |
| **Support Contracts** | Priority support, dedicated support engineers, SLAs | 3% |
| **Marketplace Advertising** | Promoted listings, featured placements (clearly marked) | 2% |

### 17.2 Cloud Hosting Pricing Tiers (Illustrative)

| Tier | Price/Month | Resources | Target |
|---|---|---|---|
| **Starter** | $29 | 1 vCPU, 2GB RAM, 10GB storage, 50GB bandwidth | Personal blogs, small sites |
| **Professional** | $99 | 2 vCPU, 4GB RAM, 50GB storage, 200GB bandwidth | Business sites, portfolios |
| **Business** | $299 | 4 vCPU, 8GB RAM, 100GB storage, 500GB bandwidth, Redis cache | Ecommerce, membership sites |
| **Scale** | $999 | 8 vCPU, 16GB RAM, 250GB storage, 2TB bandwidth, Redis, OpenSearch, auto-scaling | High-traffic sites, SaaS |
| **Enterprise** | Custom | Dedicated infrastructure, multi-tenancy, SSO, SLA, audit, compliance | Large orgs, government |

### 17.3 Enterprise Licensing

- **Per-Instance:** Annual license per Extora instance
- **Per-Seat:** For Studio users (administrators, content editors)
- **Unlimited:** Flat annual fee for unlimited instances and users within an organization
- **White-Label:** Additional fee for rebranding Extora Studio as the organization's own platform
- **On-Premises:** Self-hosted enterprise deployments with support for air-gapped environments

### 17.4 Why This Model Works

1. **Aligned Incentives:** If plugins sell well, Extora earns more. Extora invests in making the marketplace successful, which helps developers, which attracts more users, which attracts more developers.
2. **Low Barrier to Entry:** Open source Core + free tier of plugins = zero-cost adoption path. Users upgrade when they need scale, compliance, or premium features.
3. **Predictable Revenue:** Subscription-based (Cloud, Enterprise) provides recurring revenue that funds sustained investment.
4. **No Lock-In:** Self-hosted open source users can always migrate to their own infrastructure. Extora competes on value, not lock-in.

---

## 18. Product Roadmap

### 18.1 Year 1 — Foundation ("The Runtime")

**Q1-Q2: Core Architecture**
- Extora Core v1.0: Plugin loader, event bus, hook system, configuration manager, API engine
- Extora SDK v1.0: Type definitions, base classes, testing utilities
- Extora CLI v1.0: Scaffold, dev server, build, package
- Authentication system (local + OAuth)
- Authorization system (RBAC baseline)
- PostgreSQL schema and migration framework
- Docker Compose development environment
- CI/CD pipeline for Core repositories

**Q3-Q4: Studio + Marketplace MVP**
- Extora Studio v1.0: Dashboard, user management, plugin management, configuration
- Plugin installation, activation, deactivation, update workflows
- Extora Marketplace MVP: Package upload, review queue, listing, search, download
- Open source repositories public on GitHub
- Developer documentation (Getting Started, API Reference, Plugin Development Guide)
- Official essential plugins: authentication, basic CMS (pages, posts), media manager
- 5-10 community-contributed plugins as proof of ecosystem viability

**Key Milestones:**
- [ ] Core can load and run plugins with isolation
- [ ] A user can create a blog-style website using Extora + plugins
- [ ] First community plugin published to Marketplace by non-Extora developer
- [ ] 1,000 GitHub stars on `extora-core`

### 18.2 Year 2 — Ecosystem ("The Marketplace")

**Q1-Q2: Marketplace Maturity**
- Paid plugins and themes (payment processing, licensing, revenue distribution)
- Automated security scanning pipeline (static analysis, vulnerability scan, malware detection)
- Review and rating system
- Plugin dependency graph with conflict detection
- License key management and validation
- Publisher dashboard (sales, analytics, support tickets)
- Plugin analytics (installs, active installs, churn, version adoption)

**Q3-Q4: Cloud + Enterprise Foundations**
- Extora Cloud Alpha: Managed hosting for early access users
- One-click deployment, automatic updates, managed infrastructure
- Extora Enterprise Alpha: SSO/SAML, advanced RBAC, multi-tenancy
- Extora Studio v2.0: Backup/restore system, monitoring dashboard, deployment tools
- Performance optimization (Core benchmark suite, plugin performance profiling)
- 50+ plugins in Marketplace with at least 10 paid plugins

**Key Milestones:**
- [ ] First $1,000 in Marketplace GMV
- [ ] 50 plugins in Marketplace
- [ ] 500 active installations
- [ ] 10 paying Cloud customers
- [ ] First Enterprise pilot customer
- [ ] 10,000 GitHub stars across all public repositories

### 18.3 Year 3 — Scale ("The Platform")

**Q1-Q2: Platform Hardening**
- Kubernetes deployment support (Helm charts, operator)
- Horizontal scaling for Core (stateless, Redis-backed session store)
- Multi-region Cloud hosting (US, EU, APAC)
- Advanced caching strategies (CDN integration, edge caching, query result caching)
- Database sharding and read replicas for Cloud and Enterprise
- Plugin marketplace reaches 200+ plugins

**Q3-Q4: Advanced Features**
- AI/Native Plugin SDK (LLM integration, embeddings, RAG pipelines as first-class plugins)
- Workflow automation plugin (drag-and-drop automation builder)
- Real-time collaboration (WebSocket-based multi-user editing)
- Extora Studio v3.0: Advanced analytics, customizable dashboards, workflow builder
- Enterprise: Compliance certifications (SOC 2, ISO 27001, GDPR compliance toolkit)
- Internationalization framework for plugins and themes
- Extora community conference (virtual or hybrid)

**Key Milestones:**
- [ ] 200+ plugins in Marketplace
- [ ] 10,000 active installations
- [ ] $1M+ annual recurring revenue
- [ ] 10 Enterprise customers
- [ ] 50,000 GitHub stars
- [ ] Dedicated community management team

### 18.4 Year 5 — Ecosystem Dominance ("The Standard")

**Platform Maturity**
- 1,000+ plugins in Marketplace covering every major domain
- Extora becomes the default recommendation for "How should I build a web application?"
- Major brands and government agencies running on Extora Enterprise
- Extora Cloud hosts 50,000+ installations
- Vertical-specific distributions: Extora Commerce, Extora Gov, Extora Edu, Extora Health
- Plugin developer ecosystem: agencies specializing in Extora, dedicated Extora conferences, Extora-certified developer program

**Business Maturity**
- $50M+ annual revenue
- 100+ employees
- Series B/C funded (or profitable and self-sustaining)
- Strategic partnerships with major cloud providers
- Extora Foundation fully independent with board overseeing governance

**Key Milestones:**
- [ ] 1,000+ plugins
- [ ] 100,000+ active installations
- [ ] $50M+ ARR
- [ ] 200+ employees
- [ ] Used by Fortune 500 companies

---

## 19. Risks and Challenges

### 19.1 Technical Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Plugin isolation failure** — Plugins bypassing sandbox, accessing other plugins' data | Critical | Defense-in-depth: VM contexts, filesystem restrictions, database RLS, CSP; regular third-party security audits; bug bounty program |
| **Performance degradation at scale** — Too many plugins causing Core slowdown | High | Plugin performance profiling built into Core; lazy loading; performance budgets enforced by Marketplace; benchmark suite with regression detection |
| **Dependency hell** — Complex plugin dependency graphs causing resolution failures | High | Robust semver resolver with conflict detection; optional dependencies; ecosystem standards for loose coupling; plugin composition over inheritance |
| **Database scalability** — PostgreSQL single-node bottleneck | Medium | Read replicas from day 1 in Cloud; sharding strategy designed early; plugin data isolation enables per-tenant/per-plugin sharding |
| **API versioning complexity** — Supporting multiple API versions simultaneously | Medium | Strict versioning policy; deprecation tooling; automated compatibility testing; only support latest + previous major version |
| **TypeScript ecosystem churn** — Runtime, bundler, package manager changes | Medium | Lockstep testing with ecosystem; conservative adoption of new tooling; Docker-based hermetic builds |

### 19.2 Community Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Failure to attract plugin developers** — Chicken-and-egg: no plugins → no users → no developers | Critical | Invest in DX from day 1; personally recruit initial plugin developers; fund development of essential plugins; create plugin developer grant program |
| **Toxic community dynamics** — Harassment, gatekeeping, contributor burnout | High | Strong Code of Conduct; dedicated community management team; clear governance; recognition programs; contributor onboarding program |
| **Core team burnout** — Founders and early team overwhelmed | High | Hire aggressively after seed funding; clear responsibilities; sustainable pace culture; no "hero" culture |
| **Forking and fragmentation** — Competitor forks open source Core | Medium | Keep proprietary layers (Marketplace, Cloud) closed; build network effects that make the official ecosystem more valuable; trademark enforcement |

### 19.3 Adoption Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **WordPress is "good enough"** — Target audience doesn't see need to switch | High | Don't compete on "better blog." Compete on "build anything." Target greenfield projects and developers dissatisfied with WordPress limitations |
| **Framework lock-in preference** — Developers prefer building from scratch | Medium | Show productivity gains; plugin ecosystem means less code to write; focus on the "build vs. buy" value proposition |
| **Enterprise risk aversion** — Large orgs won't adopt unproven platform | Medium | Enterprise pilot program with white-glove onboarding; compliance certifications; reference customers; partner with system integrators |
| **Learning curve** — New paradigm is unfamiliar | Low-Medium | Invest heavily in documentation, tutorials, and examples; "Getting Started in 5 Minutes"; migration guides from familiar platforms |

### 19.4 Competition Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **WordPress adopts modern architecture** — WordPress 7.0+ modernizes to TypeScript/React/REST | Medium | WordPress's backward compatibility commitment prevents fundamental architectural change; Extora starts with clean slate |
| **Major tech company enters space** — Google, Microsoft, or Vercel creates plugin ecosystem platform | Medium | Move fast; build network effects; open source advantage; community ownership vs. corporate control |
| **Shopify expands to general CMS/app platform** | Low-Medium | Shopify's commerce DNA limits general-purpose adoption; self-hosting requirement excludes Shopify |
| **Strapi/Directus add robust plugin marketplaces** | Medium | They are CMS-first; Extora is platform-first with broader scope; superior plugin isolation and typing |

---

## 20. Success Metrics

### 20.1 Community Growth KPIs

| Metric | Year 1 Target | Year 3 Target | Year 5 Target |
|---|---|---|---|
| GitHub Stars (all repos) | 10,000 | 50,000 | 200,000 |
| Active Contributors (monthly) | 25 | 200 | 1,000 |
| Committers (with merge rights) | 5 | 30 | 100 |
| Community Forum Members | 1,000 | 25,000 | 200,000 |
| Discord/Slack Members | 500 | 15,000 | 100,000 |
| Community Meetups (global) | 5 | 50 | 200 |

### 20.2 Plugin Growth KPIs

| Metric | Year 1 Target | Year 3 Target | Year 5 Target |
|---|---|---|---|
| Total Plugins in Marketplace | 50 | 500 | 5,000 |
| Active Plugin Developers | 30 | 400 | 3,000 |
| Paid Plugins | 5 | 100 | 1,000 |
| Average Plugin Quality Score | N/A (baseline) | 4.0/5.0 | 4.2/5.0 |
| Plugin Update Frequency (median days between releases) | 30 | 21 | 14 |
| Critical Vulnerabilities in Marketplace | 0 | 0 | 0 |

### 20.3 Marketplace Growth KPIs

| Metric | Year 1 Target | Year 3 Target | Year 5 Target |
|---|---|---|---|
| Monthly GMV | $500 | $100,000 | $5,000,000 |
| Monthly Transactions | 20 | 5,000 | 200,000 |
| Publisher Payouts (total) | $425 | $850,000 | $42,500,000 |
| Platform Revenue from Marketplace | $75 | $150,000 | $7,500,000 |
| Free Plugin Downloads | 5,000 | 1,000,000 | 50,000,000 |

### 20.4 Revenue Growth KPIs

| Metric | Year 1 Target | Year 3 Target | Year 5 Target |
|---|---|---|---|
| Annual Recurring Revenue (ARR) | $10,000 | $5,000,000 | $100,000,000 |
| Cloud Customers | 20 | 2,000 | 50,000 |
| Enterprise Customers | 2 | 50 | 500 |
| Revenue per Employee | N/A (seed) | $200,000 | $500,000 |
| Gross Margin | N/A | 70%+ | 80%+ |

### 20.5 Adoption KPIs

| Metric | Year 1 Target | Year 3 Target | Year 5 Target |
|---|---|---|---|
| Active Installations (all types) | 500 | 25,000 | 500,000 |
| Self-Hosted Installations | 480 | 18,000 | 300,000 |
| Cloud-Hosted Installations | 20 | 7,000 | 200,000 |
| Enterprise Deployments | 2 | 50 | 500 |
| Daily Active Studio Users | 200 | 50,000 | 2,000,000 |
| API Requests/Day (aggregate) | 100,000 | 100,000,000 | 5,000,000,000 |
| NPS Score | Baseline | 40+ | 50+ |
| Countries with Active Installations | 10 | 80 | 150+ |

### 20.6 North Star Metric

> **Weekly Active Plugin Developers (WAPD)**
>
> The number of unique developers who build, test, or publish an Extora plugin or theme in a given week. This single metric captures ecosystem health: more developers → more plugins → more users → more value for everyone. All product, community, and business decisions should be evaluated against their impact on WAPD.

---

## Appendices

### Appendix A: Glossary & Terminology

| Term | Definition |
|---|---|
| **Extora Core** | The runtime engine that loads and orchestrates plugins |
| **Extora Studio** | The browser-based administrative interface |
| **Extora SDK** | Developer toolkit for building plugins and themes |
| **Extora CLI** | Command-line interface for development and management |
| **Extora Marketplace** | Platform for discovering, purchasing, and distributing plugins/themes |
| **Extora Cloud** | Managed hosting platform |
| **Extora Enterprise** | Enterprise-grade platform with compliance and advanced features |
| **Plugin** | A package that extends Extora functionality |
| **Theme** | A specialized plugin that controls visual presentation |
| **Hook** | A point in the lifecycle where plugins can execute code (action) or modify data (filter) |
| **Event** | A message published to the event bus for cross-plugin communication |
| **Manifest** | `extora.json` — metadata file declaring plugin identity, dependencies, and permissions |
| **Package** | A distributable archive (`.extora` file) containing a plugin or theme |
| **Publisher** | An individual or organization that publishes packages to the Marketplace |
| **Tenant** | An isolated instance within a multi-tenant Extora deployment |
| **Open Core** | Business model where core functionality is open source and premium features are proprietary |
| **GMV** | Gross Merchandise Volume — total dollar value of sales through the Marketplace |
| **ARR** | Annual Recurring Revenue |
| **WAPD** | Weekly Active Plugin Developers — Extora's North Star Metric |

### Appendix B: Extora Inc. Founding Principles

1. **Plugins over features.** Every feature request should be answered with: "Can this be a plugin?" If not, fix the plugin system.
2. **Community over corporation.** The Extora Foundation ensures the project outlasts any single company. The community is the moat.
3. **Developer experience is a feature.** Speed, clarity, and joy in development are non-negotiable. Slow tooling, confusing APIs, and bad error messages are bugs.
4. **Security is not optional.** Every design decision must consider the security implications for 100,000+ plugins and millions of users.
5. **Open wins.** Open source, open standards, open APIs, open governance. Where proprietary is necessary, be transparent about why.
6. **Ship to learn.** Perfect is the enemy of shipped. Release early, gather feedback, iterate. Never let architecture astronautics prevent real-world learning.
7. **Long-term thinking.** Every decision — code, community, business — should be evaluated against the 10-year horizon. Short-term gains that compromise long-term health are rejected.
8. **Respect the ecosystem.** Extora exists because of plugin and theme developers. Their success is Extora's success. Revenue models, tooling, and community structures must serve their interests as much as Extora's.

### Appendix C: Document Maintenance

This document is the living blueprint for Extora. It should be reviewed quarterly by the founding team and updated as the product, market, and community evolve. The vision is immutable; the implementation details are adaptable.

**Review Cadence:** Quarterly (January, April, July, October)
**Owner:** Extora Founder / CEO
**Approvers:** Core Maintainers, TSC

---

*End of Extora Founder Blueprint v1.0*
