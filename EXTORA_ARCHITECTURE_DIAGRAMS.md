# EXTORA ARCHITECTURE DIAGRAMS v1.0

**Standalone reference of all system diagrams for Extora**
**Use with: Extora Mega Blueprint v2.0**

---

## Diagram 1: Full Ecosystem (All 15 Components)

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
│  ║                                                                               ║ │
│  ║  Plugin Loader │ Event Bus │ Hook System │ API Engine │ Auth │ Config Mgr     ║ │
│  ║  Media Mgr │ DB Abstraction │ Queue System │ Cache Mgr │ Logger │ Sandbox   ║ │
│  ║                                                                               ║ │
│  ║  Technology: Node.js 22 · TypeScript 5.7 · Fastify · Prisma · BullMQ · Zod    ║ │
│  ╚══════════╤════════════════════════════════════════════════════════════════════╝ │
│             │                                                                      │
│  ╔══════════╩════════════════════════════════════════════════════════════════════╗ │
│  ║                    ADMINISTRATION & DISTRIBUTION                               ║ │
│  ║                                                                               ║ │
│  ║  ┌───────────────┐  ┌────────────────┐  ┌───────────┐  ┌──────────────────┐  ║ │
│  ║  │    Studio     │  │  Marketplace   │  │   Cloud   │  │   Enterprise     │  ║ │
│  ║  │  (Admin UI)   │  │  (Store + API) │  │ (Hosting) │  │  (Compliance)    │  ║ │
│  ║  │               │  │                │  │           │  │                  │  ║ │
│  ║  │  React 19     │  │  Next.js       │  │  K8s      │  │  SSO · SAML     │  ║ │
│  ║  │  Tailwind     │  │  PostgreSQL    │  │  Multi-AZ │  │  Multi-Tenant   │  ║ │
│  ║  │  shadcn/ui    │  │  Stripe        │  │  Auto-Sc  │  │  Audit · SLA    │  ║ │
│  ║  └───────────────┘  └────────────────┘  └───────────┘  └──────────────────┘  ║ │
│  ╚═══════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                   │
│  ╔══════════════════════════════════════════════════════════════════════════════╗ │
│  ║                     FIRST-PARTY OFFICIAL PLUGINS                              ║ │
│  ║                                                                              ║ │
│  ║  ┌──────┐  ┌──────┐  ┌──────────┐  ┌────────┐  ┌───────┐  ┌─────────────┐  ║ │
│  ║  │ Auth │  │ CMS  │  │ Commerce │  │ Forms  │  │  SEO  │  │  Analytics  │  ║ │
│  ║  │      │  │      │  │          │  │        │  │       │  │             │  ║ │
│  ║  │ v1.0 │  │ v1.0 │  │   v1.0   │  │ v1.0   │  │  Y2   │  │    Y3       │  ║ │
│  ║  └──────┘  └──────┘  └──────────┘  └────────┘  └───────┘  └─────────────┘  ║ │
│  ╚══════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                   │
│  ╔══════════════════════════════════════════════════════════════════════════════╗ │
│  ║                      INFRASTRUCTURE LAYER                                     ║ │
│  ║                                                                              ║ │
│  ║  ┌──────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐  ┌───────┐ ║ │
│  ║  │PostgreSQL│  │ Redis  │  │ MinIO  │  │ Nginx  │  │OpenSearch│  │ Docker│ ║ │
│  ║  │   16+    │  │  7+    │  │  (S3)  │  │/Caddy  │  │          │  │/K8s   │ ║ │
│  ║  └──────────┘  └────────┘  └────────┘  └────────┘  └──────────┘  └───────┘ ║ │
│  ╚══════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 2: Core Bootstrap Sequence

```
┌─────────────────────────────────────────────────────────────┐
│                 EXTORA CORE BOOTSTRAP                        │
│                  (Startup Sequence)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [1]  Load environment variables (.env)                      │
│        │                                                     │
│  [2]  Initialize Logger (pino)                               │
│        │                                                     │
│  [3]  Initialize OpenTelemetry SDK                           │
│        │                                                     │
│  [4]  Load Core Configuration                                │
│       (defaults → env vars → database → runtime overrides)   │
│        │                                                     │
│  [5]  Connect to PostgreSQL                                  │
│        │                                                     │
│  [6]  Connect to Redis                                       │
│        │                                                     │
│  [7]  Run Pending DB Migrations                              │
│        │                                                     │
│  [8]  Initialize Cache Manager                               │
│        │                                                     │
│  [9]  Initialize Queue Manager (BullMQ)                      │
│        │                                                     │
│ [10]  Initialize Event Bus                                   │
│        │                                                     │
│ [11]  Initialize Hook System                                 │
│        │                                                     │
│ [12]  Initialize Media Manager                               │
│        │                                                     │
│ [13]  Discover Installed Plugins (from database)             │
│        │                                                     │
│ [14]  Resolve Plugin Dependency Graph                        │
│       (topological sort, version check, cycle detection)     │
│        │                                                     │
│ [15]  Load Plugins in Dependency Order                       │
│       (with sandboxing — VM context, FS/net restrictions)    │
│        │                                                     │
│ [16]  Execute onInstall Hooks (new plugins)                  │
│        │                                                     │
│ [17]  Execute onActivate Hooks (all plugins)                 │
│        │                                                     │
│ [18]  Initialize API Engine                                  │
│       (register plugin routes, middleware chain, GraphQL)    │
│        │                                                     │
│ [19]  Start Fastify Server (HTTP + WebSocket)                │
│        │                                                     │
│ [20]  Execute onBootComplete Hook                            │
│        │                                                     │
│ [21]  Start Health Check Endpoint                            │
│        │                                                     │
│ [22]  LOG: "Extora Core vX.Y.Z ready on port N"              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Diagram 3: Plugin Lifecycle State Machine

```
                    ┌──────────┐
                    │  Created  │  (extora create plugin my-plugin)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Developed │  (extora dev — hot reload)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Tested   │  (extora test)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Packaged │  (extora build → .extora file)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Published │  (extora publish → Marketplace)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Reviewed │  (Automated scan + manual review)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Listed   │  (Available in Marketplace)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Installed │  (User installs via Studio/CLI)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ Activated │  (Loaded into Core runtime)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Running  │  (Active, serving requests)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  Updated  │  (New version installed)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │Deactivated│  (Unloaded from Core)
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │Uninstalled│  (Removed from system)
                    └──────────┘
```

---

## Diagram 4: API Request Lifecycle

```
Client Request (HTTP or WebSocket)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX / CADDY                              │
│  TLS Termination, Rate Limiting, Static File Serving            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTIFY SERVER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               MIDDLEWARE PIPELINE                         │  │
│  │                                                           │  │
│  │  [1] CORS Middleware                                     │  │
│  │       │                                                  │  │
│  │  [2] Request ID (trace-id per request)                   │  │
│  │       │                                                  │  │
│  │  [3] Rate Limiter (per user/IP/endpoint)                 │  │
│  │       │                                                  │  │
│  │  [4] Authentication (JWT / API Key)                      │  │
│  │       │                                                  │  │
│  │  [5] Authorization (RBAC/ABAC check)                     │  │
│  │       │                                                  │  │
│  │  [6] Request Validation (Zod schema)                     │  │
│  │       │                                                  │  │
│  │  [7] Pre-Handler Hook (action: "api.request")           │  │
│  │       │                                                  │  │
│  │  [8] Route Handler (core or plugin)                      │  │
│  │       │                                                  │  │
│  │  [9] Post-Handler Hook (action: "api.response")         │  │
│  │       │                                                  │  │
│  │ [10] Response Serialization                              │  │
│  │       │                                                  │  │
│  │ [11] Audit Log (if sensitive operation)                  │  │
│  │       │                                                  │  │
│  │ [12] Response → Client                                   │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Diagram 5: Extora Registry — Package Flow

```
Developer runs: npm install (or extora build)
         │
         ▼
   ┌─────────────┐
   │   CLI/pnpm  │  Configured with registry.extora.dev
   └──────┬──────┘
          │ Request: GET /@extora/cms/-/cms-1.0.0.tgz
          ▼
   ┌──────────────────────────────────────────────────────┐
   │              EXTORA REGISTRY                          │
   │                                                       │
   │  ┌──────────┐                                        │
   │  │  Proxy   │──► Is package in cache?                │
   │  └────┬─────┘                                        │
   │       │                                              │
   │       ├── YES ──────► Serve from MinIO Cache         │
   │       │                                              │
   │       ├── NO ───────► Fetch from upstream npm        │
   │       │                 │                            │
   │       │                 ▼                             │
   │       │           ┌──────────┐                       │
   │       │           │ Scanner  │                       │
   │       │           └────┬─────┘                       │
   │       │                │                              │
   │       │     ┌──────────▼─────────┐                   │
   │       │     │ 1. Manifest Check  │                   │
   │       │     │ 2. License Scan    │                   │
   │       │     │ 3. CVE Scan        │  (Snyk / OSV)    │
   │       │     │ 4. Malware Scan    │                   │
   │       │     │ 5. Dep Tree Audit  │                   │
   │       │     └──────────┬─────────┘                   │
   │       │                │                              │
   │       │     ┌──────────▼─────────┐                   │
   │       │     │  Policy Engine     │                   │
   │       │     │  ALLOW / BLOCK     │                   │
   │       │     └────┬──────┬────────┘                   │
   │       │          │      │                             │
   │       │      ALLOW    BLOCK                           │
   │       │        │       │                              │
   │       │     ┌──▼──┐ ┌──▼──┐                          │
   │       │     │Cache│ │Block│  403 Response             │
   │       │     │MinIO│ │+Log │                           │
   │       │     └──┬──┘ └─────┘                          │
   │       │        │                                      │
   │       └────────┼──────────────────────────────────────│
   │                ▼                                      │
   │  ┌─────────────────────────────────────┐              │
   │  │  MinIO Storage                      │              │
   │  │  ┌──────────────┐  ┌─────────────┐  │              │
   │  │  │Local Packages│  │Proxied Cache │  │              │
   │  │  │(published to │  │(from npm)   │  │              │
   │  │  │ Extora)      │  │             │  │              │
   │  │  └──────────────┘  └─────────────┘  │              │
   │  └─────────────────────────────────────┘              │
   │                                                       │
   └───────────────────────────────────────────────────────┘
```

---

## Diagram 6: Extora Commerce Domain Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                       COMMERCE DOMAIN MODEL                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │ Product  │    │ Category │    │  Brand   │    │  Inventory   │  │
│  │          │    │ (tree)   │    │          │    │  (per SKU)   │  │
│  └────┬─────┘    └──────────┘    └──────────┘    └──────┬───────┘  │
│       │                                                 │          │
│  ┌────▼─────┐          has many ◄───────────────────────┘          │
│  │ Variant  │  (SKU, price, attributes: {size:"XL", color:"Red"})  │
│  └────┬─────┘                                                       │
│       │                                                             │
│       ├──────────────────────────────────────┐                      │
│       │                                      │                      │
│  ┌────▼─────┐    ┌──────────┐    ┌──────────▼──────┐              │
│  │CartItem  │◄───│   Cart   │    │   OrderItem     │              │
│  │          │    │          │    │                 │              │
│  └──────────┘    └──────────┘    └────────┬────────┘              │
│                                           │                        │
│                                     ┌─────▼─────┐                 │
│                                     │   Order   │                 │
│                                     │           │                 │
│                                     └─────┬─────┘                 │
│                                           │                        │
│                         ┌─────────────────┼─────────────────┐      │
│                         │                 │                 │      │
│                    ┌────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐ │
│                    │ Payment  │    │ Shipment  │    │  Coupon   │ │
│                    │          │    │           │    │  Usage    │ │
│                    └──────────┘    └───────────┘    └───────────┘ │
│                                                                     │
│  Order Lifecycle:                                                   │
│  pending → confirmed → processing → shipped → delivered             │
│     │         │                                    │               │
│     └──► cancelled                          completed              │
│                                                                     │
│  Extension Points (Plugin Interfaces):                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐     │
│  │ Payment Gateway   │  │ Shipping Provider │  │ Tax Provider  │    │
│  │ Interface         │  │ Interface         │  │ Interface     │    │
│  └──────────────────┘  └──────────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 7: Single-Node Deployment (Docker Compose)

```
┌──────────────────────────────────────────────────────────────────┐
│                         INTERNET                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │   NGINX / CADDY    │
                  │   Port: 443 (TLS)  │
                  │   Port: 80 → 443   │
                  │   Rate Limiting    │
                  │   Static Assets    │
                  │   WebSocket Proxy  │
                  └─────────┬──────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
  ┌────────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
  │ Extora Core   │  │ Extora     │  │ Extora     │
  │ Instance 1    │  │ Instance 2 │  │ Instance N │
  │ (Port 3000)   │  │ (Port 3001)│  │ (Port 300N)│
  └────────┬──────┘  └─────┬──────┘  └─────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
  ┌──▼──────┐      ┌──────▼───────┐      ┌─────▼──────┐
  │PostgreSQL│      │Redis/Valkey  │      │   MinIO    │
  │Port:5432 │      │Port: 6379    │      │ Port: 9000 │
  │(Primary) │      │(Cache/Queue) │      │ (Storage)  │
  └──────────┘      └──────────────┘      └────────────┘
                           │
                  ┌────────▼──────────┐
                  │   OpenSearch      │
                  │   Port: 9200      │
                  │ (Search + Logs)   │
                  └───────────────────┘
```

---

## Diagram 8: Multi-Node Deployment (Kubernetes — Year 3+)

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
│  │                                                               │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │     │
│  │  │  Pod 1   │  │  Pod 2   │  │  Pod 3   │  │  Pod N   │    │     │
│  │  │          │  │          │  │          │  │          │    │     │
│  │  │ (HPA:    │  │          │  │          │  │          │    │     │
│  │  │ min=1    │  │          │  │          │  │          │    │     │
│  │  │ max=10)  │  │          │  │          │  │          │    │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │     │
│  │                                                               │     │
│  │  Service: extora-core (ClusterIP, Port 3000)                  │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ PostgreSQL   │ │ Redis       │ │ MinIO       │ │ OpenSearch  │  │
│  │ Operator     │ │ Cluster     │ │ Operator    │ │ Cluster     │  │
│  │              │ │             │ │             │ │             │  │
│  │ - Primary    │ │ - Sentinel  │ │ - Distributed│ │ - Master    │  │
│  │ - Replicas   │ │ - Replicas  │ │ - Erasure   │ │ - Data Nodes│  │
│  │ - PgBouncer  │ │             │ │   Coding    │ │             │  │
│  └──────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Observability Stack                               │   │
│  │                                                               │   │
│  │  ┌────────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐  │   │
│  │  │ Prometheus │ │ Grafana  │ │ OpenTelemetry│ │  Alert   │  │   │
│  │  │  (Metrics) │ │(Dashboards│ │  Collector   │ │ Manager  │  │   │
│  │  └────────────┘ └──────────┘ └──────────────┘ └──────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 9: Extora Cloud — Tenant Isolation

```
┌──────────────────────────────────────────────────────────────────────┐
│                         EXTORA CLOUD                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                  Cloud Control Plane                         │     │
│  │                                                              │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │     │
│  │  │Tenant Mgr│  │ Billing  │  │Orch. Mgr │  │Monitoring  │  │     │
│  │  │          │  │(Stripe)  │  │(K8s API) │  │(Prom/Graf) │  │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ╔══════════════════════════════════════════════════════════════╗   │
│  ║                    TENANT DEPLOYMENTS                        ║   │
│  ║                                                              ║   │
│  ║  ┌───────────────────────┐  ┌───────────────────────┐       ║   │
│  ║  │ Tenant A (Scale Tier) │  │ Tenant B (Starter)    │       ║   │
│  ║  │                       │  │                       │       ║   │
│  ║  │ ┌───────┐ ┌────────┐ │  │ ┌───────┐ ┌────────┐  │       ║   │
│  ║  │ │Core   │ │Studio  │ │  │ │Core   │ │Studio  │  │       ║   │
│  ║  │ │Pod (2)│ │Pod (1) │ │  │ │Pod (1)│ │Pod (1) │  │       ║   │
│  ║  │ └───────┘ └────────┘ │  │ └───────┘ └────────┘  │       ║   │
│  ║  │                       │  │                       │       ║   │
│  ║  │ DB: Dedicated Schema  │  │ DB: Shared DB + RLS   │       ║   │
│  ║  │ Redis: Dedicated      │  │ Redis: Shared         │       ║   │
│  ║  │ Storage: Dedicated    │  │ Storage: Shared       │       ║   │
│  ║  └───────────────────────┘  └───────────────────────┘       ║   │
│  ║                                                              ║   │
│  ╚══════════════════════════════════════════════════════════════╝   │
│                                                                      │
│  Shared Services:                                                    │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ CDN (Cloudflare) │ Backup Storage (S3) │ Monitoring │ Logs│        │
│  └─────────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 10: Request Flow — Studio → Core → Plugin

```
┌─────────────────────────────────────────────────────────────────────┐
│              STUDIO -> CORE -> PLUGIN REQUEST FLOW                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────┐     HTTPS      ┌───────────┐    Hook Call     ┌────────────┐
│  │  Studio   │────────────────→│  Core API │─────────────────→│  Plugin    │
│  │ (Browser) │←────────────────│  Engine   │←─────────────────│  (Server   │
│  │           │     JSON        │           │    JSON Return   │   Entry)   │
│  └───────────┘                 └───────────┘                  └────────────┘
│                                      │                                 │
│                               ┌──────┴──────┐                   ┌─────┴──────┐
│                               │ Middleware:  │                   │ Sandbox:   │
│                               │ - Auth       │                   │ - VM ctx   │
│                               │ - Permission │                   │ - FS limit │
│                               │ - Rate Limit │                   │ - Net limit│
│                               │ - Validate   │                   │ - CPU limit│
│                               └─────────────┘                   └────────────┘
│                                                                     │
│  Example: GET /api/v1/content/blog_post?status=published            │
│                                                                     │
│  1. Studio sends request with JWT in Authorization header           │
│  2. Nginx → Core API Engine                                         │
│  3. Middleware: CORS → Rate Limiter → JWT Verify → RBAC Check       │
│  4. Route matched: @extora/cms plugin route                         │
│  5. Request forwarded to CMS plugin (in sandbox)                    │
│  6. CMS queries DB (through Core DB abstraction with RLS)           │
│  7. CMS returns data → JSON serialized → Studio                    │
│  8. Studio renders content list page                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 11: Monorepo Dependency Graph

```
                    ┌──────────────────────────┐
                    │     @extora/types         │
                    │   (Shared TS Interfaces)  │
                    └──────────┬───────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
  ┌───────▼───────┐  ┌────────▼────────┐  ┌────────▼────────┐
  │ @extora/utils │  │  @extora/config  │  │   @extora/ui    │
  │ (Shared Utils)│  │ (Shared Config)  │  │(Shared React UI)│
  └───────┬───────┘  └────────┬────────┘  └────────┬────────┘
          │                    │                    │
  ┌───────▼────────────────────▼────────────────────▼────────┐
  │                     @extora/sdk                            │
  │     (BasePlugin, hooks API, events API, DB helpers,      │
  │      API helpers, config helpers, testing utilities)      │
  └───────────────────────────┬──────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
  ┌───────▼───────┐   ┌───────▼──────┐   ┌───────▼───────┐
  │ @extora/core  │   │ @extora/cli  │   │ @extora/studio│
  │  (Runtime)    │   │  (Dev Tool)  │   │  (Admin UI)   │
  └───────┬───────┘   └──────────────┘   └───────┬───────┘
          │                                       │
  ┌───────▼───────────────────────────────────────▼──────────┐
  │                   PLUGINS LAYER                            │
  │                                                            │
  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────┐ │
  │  │@extora/   │  │@extora/   │  │@extora/   │  │@extora/│ │
  │  │  auth     │  │  cms      │  │ commerce  │  │ forms  │ │
  │  └───────────┘  └───────────┘  └───────────┘  └────────┘ │
  └──────────────────────────────────────────────────────────┘
```

---

## Diagram 12: Development Phases Timeline

```
Year 1                                         Year 2
|──────────────────────────────────────────────|─────────────────────────|
|                                              |                         |
|  [M1────M2]                                 |                         |
|   P0: Foundation                            |                         |
|   - Monorepo, CI/CD                         |                         |
|   - Docker, ESLint, TS                      |                         |
|   - @extora/types                           |                         |
|                                              |                         |
|  [M3────────────M6]                         |                         |
|    P1: Core MVP                             |                         |
|    - Fastify server                         |                         |
|    - Prisma schema                          |                         |
|    - Plugin loader + sandbox                |                         |
|    - Event bus, hook system                 |                         |
|    - Auth engine (JWT, RBAC)                |                         |
|    - Media manager                          |                         |
|    - Core API (50+ endpoints)               |                         |
|                                              |                         |
|  [M4───────────M8]                          |                         |
|    P2: CLI + SDK + Registry                 |                         |
|    - @extora/sdk v0.1                       |                         |
|    - @extora/cli v0.1                       |                         |
|    - Registry MVP                           |                         |
|                                              |                         |
|  [M7──────────M10]                         |                         |
|    P3: Studio MVP                           |                         |
|    - React + Vite + Tailwind + shadcn/ui   |                         |
|    - Zustand stores, TanStack Router        |                         |
|    - Dashboard, Users, Plugins, Config      |                         |
|    - Login, Setup Wizard                    |                         |
|                                              |                         |
|  [M9───────M11]                            |                         |
|    P4: Auth Plugin                          |                         |
|    - Local, OAuth, MFA                      |                         |
|                                              |                         |
|  [M10──────────────M14]                    |                         |
|    P5: CMS Plugin                           |                         |
|    - Content types, entries, revisions      |                         |
|                                              |           P6: Mktplace |
|                                              |           [M12──M16]   |
|                                              |                         |
|                                              |  P7: Forms  P8:Commrc  |
|                                              |  [M14─M17]  [M16─M22]  |
|                                              |                         |
|                                              |  P9: Starters          |
|                                              |  [M18──────M22]         |
|                                              |                         |
|                                              |  P10: Cloud Alpha      |
|                                              |  [M18───────────M24]   |
|                                              |                         |
|  P11: Docs Platform                                                >| Y3
|  [ongoing from M1 ─────────────────────────────────────────────────>|
└──────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 13: Extora Studio — Information Architecture

```
EXPORA STUDIO (Admin UI)
│
├── Dashboard
│   ├── Overview (health, stats, activity)
│   ├── Analytics
│   └── Activity Feed
│
├── Users
│   ├── All Users (CRUD)
│   ├── Roles (CRUD + permissions)
│   ├── Teams
│   ├── API Keys
│   └── Sessions
│
├── Plugins
│   ├── Installed (list, activate, deactivate)
│   ├── Marketplace (browse, search, install)
│   ├── Updates
│   └── Plugin Settings (per-plugin)
│
├── Themes
│   ├── Installed
│   ├── Marketplace
│   └── Customize (per-theme)
│
├── Content (via CMS plugin)
│   ├── Content Types (builder)
│   ├── Entries (per type)
│   └── Media Library
│
├── Configuration
│   ├── General
│   ├── Environment
│   ├── Services
│   └── Advanced
│
├── Services
│   ├── Database
│   ├── Cache
│   ├── Storage
│   ├── Search
│   └── Email
│
├── Backup & Restore
│   ├── Backups List
│   ├── Schedule
│   ├── Restore
│   └── Settings
│
├── Monitoring
│   ├── Metrics
│   ├── Logs
│   ├── Alerts
│   └── Performance
│
├── Deployment
│   ├── Environments
│   ├── History
│   └── Settings
│
└── System
    ├── Updates
    ├── Health
    ├── Information
    └── Tools
```

---

## Diagram 14: Extora Organization Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                  Extora Foundation (Non-Profit)                   │
│  Holds trademark, owns OSS repos, ensures mission               │
│  Board: Community reps + Core team + Independent directors      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐     ┌───────▼───────┐     ┌───────▼───────┐
│ Core          │     │ Technical     │     │ Community     │
│ Maintainers   │     │ Steering      │     │ Managers      │
│ (5-7 people)  │     │ Committee     │     │ (2-3 people)  │
│               │     │ (TSC)         │     │               │
│ - Tech dir.   │     │               │     │ - CoC         │
│ - PR review   │     │ - RFC process │     │ - Forums      │
│ - Releases    │     │ - Decisions   │     │ - Events      │
│ - Security    │     │ - Standards   │     │ - Onboarding  │
└───────┬───────┘     └───────────────┘     └───────────────┘
        │
┌───────┼───────────────────────────────────┐
│       │                                   │
│  ┌────▼────┐  ┌──────────┐  ┌──────────┐ │
│  │Committers│  │Contributors│ │Community │ │
│  │(20-50)  │  │(unlimited)│ │Members   │ │
│  │         │  │           │ │          │ │
│  │Merge    │  │Code, Docs,│ │Users,    │ │
│  │access   │  │Bugs, i18n │ │Forums    │ │
│  └─────────┘  └───────────┘ └──────────┘ │
└───────────────────────────────────────────┘
```

---

*End of Extora Architecture Diagrams v1.0*
*All diagrams are ASCII-art and can be embedded in Markdown documentation*
