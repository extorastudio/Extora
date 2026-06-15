# Extora Developer Guide

A complete walkthrough for building plugins on the Extora platform.

---

## Quick Start

### Prerequisites
- Node.js 22+
- pnpm 9+
- Docker Desktop (for local development)

### Installation

```bash
git clone https://github.com/Rishi2727/Extora.git
cd Extora
pnpm install
pnpm docker:up          # Start PostgreSQL, Redis, MinIO, OpenSearch
cp .env.example .env     # Configure environment
pnpm dev                 # Start Core + Studio
```

Visit `http://localhost:3000/api/v1/system/health` to verify the Core is running.
Visit `http://localhost:5173` for the Studio admin UI.

---

## Creating Your First Plugin

### Step 1: Scaffold

```bash
extora create plugin my-awesome-plugin
```

This creates:
```
plugins/my-awesome-plugin/
├── extora.json        # Plugin manifest
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── src/
    └── index.ts        # Plugin source code
```

### Step 2: Understand the Manifest

`extora.json` defines your plugin's identity and capabilities:

```jsonc
{
  "name": "my-awesome-plugin",
  "version": "0.0.0",
  "type": "plugin",
  "title": "My Awesome Plugin",
  "author": { "name": "Developer" },
  "extora": { "core": ">=1.0.0 <2.0.0" },
  "permissions": ["database:read", "user:read"],
  "entry": { "server": "dist/index.js" },
  "hooks": {
    "actions": ["user.registered"],
    "filters": ["content.before_save"]
  }
}
```

### Step 3: Write the Plugin

```typescript
import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

export default class MyAwesomePlugin extends BasePlugin {
  override manifest: PluginManifest = {
    name: "my-awesome-plugin",
    version: "0.0.0",
    type: "plugin",
    title: "My Awesome Plugin",
    author: { name: "Developer" },
    license: "UNLICENSED",
    extora: { core: ">=1.0.0 <2.0.0" },
    permissions: ["database:read"],
    entry: { server: "dist/index.js" },
  };

  override async onInstall(): Promise<void> {
    const db = this.db.getPluginDb("my-plugin");
    await db.createTable("my_table", {
      id: "TEXT PRIMARY KEY",
      name: "TEXT NOT NULL",
    });
    this.logger.info("Plugin installed");
  }

  override async onActivate(): Promise<void> {
    this.addAction("user.registered", async (user) => {
      this.logger.info("New user registered!");
    });
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("Plugin deactivated");
  }
}
```

### Step 4: Build & Test

```bash
cd plugins/my-awesome-plugin
extora build           # Compile TypeScript
extora test            # Run tests
extora dev             # Start development server
```

---

## Plugin Lifecycle

Every plugin goes through these stages:

| Stage | Method | When Called |
|---|---|---|
| **Install** | `onInstall()` | First time plugin is installed |
| **Activate** | `onActivate()` | Every time plugin starts |
| **Deactivate** | `onDeactivate()` | Plugin is stopped |
| **Uninstall** | `onUninstall()` | Plugin is removed |
| **Update** | `onUpdate(prev)` | New version installed |

---

## Using the SDK

### Database Access

```typescript
const db = this.db.getPluginDb("my-plugin");
await db.createTable("my_table", { id: "TEXT PRIMARY KEY" });
await db.insert("my_table", { id: "1", name: "test" });
const rows = await db.select("my_table", { id: "1" });
```

### Hook System

```typescript
// Register an action hook (fire-and-forget)
this.addAction("user.registered", async (user) => {
  await this.sendWelcomeEmail(user.email);
});

// Register a filter hook (modify data)
this.addFilter("content.before_save", async (content) => {
  return { ...content, updated_at: new Date().toISOString() };
});
```

### Event Bus

```typescript
// Publish events
await this.publishEvent("order.placed", {
  orderId: "123",
  total: 99.99,
});

// Subscribe to events
this.subscribeEvent("payment.received", async (payment) => {
  this.logger.info("Payment received!");
});
```

### Configuration

```typescript
import { getConfig, setConfig } from "@extora/sdk/config";

const apiKey = await getConfig<string>("my-plugin.api_key");
await setConfig("my-plugin.api_key", "sk-xxx", true); // isSecret=true
```

### API Routes

```typescript
import { createRouter } from "@extora/sdk/api";

const router = createRouter("my-plugin");
router
  .get("/api/v1/my-plugin/data", async (req, reply) => {
    return { data: [] };
  })
  .post("/api/v1/my-plugin/data", async (req, reply) => {
    return { created: true };
  });
```

### Studio UI Integration

```typescript
import { registerSlot, STUDIO_SLOTS } from "@extora/sdk/studio";

registerSlot(STUDIO_SLOTS.DASHBOARD_WIDGET, "MyWidget", 10);
```

---

## Testing Plugins

Use the SDK's mock factories for unit testing:

```typescript
import { describe, it, expect } from "vitest";
import { createMockLogger, createMockEventBus } from "@extora/sdk/testing";
import MyPlugin from "../src/index";

describe("MyPlugin", () => {
  it("should register hooks on activate", async () => {
    const plugin = new MyPlugin();
    const eventBus = createMockEventBus();

    plugin._injectContext({
      pluginName: "test",
      logger: createMockLogger(),
      eventBus,
      // ... other mocks
    });

    await plugin.onActivate();
    // Verify hooks registered
  });
});
```

---

## Project Structure

```
Extora/
├── apps/
│   ├── core/           # Extora Core Runtime
│   ├── studio/         # Admin UI (React + Vite)
│   └── cli/            # Command-line interface
├── packages/
│   ├── sdk/            # @extora/sdk
│   └── types/          # @extora/types
├── plugins/
│   ├── auth/           # Authentication
│   ├── cms/            # Content management
│   ├── commerce/       # Ecommerce
│   ├── forms/          # Form builder
│   ├── seo/            # SEO tools
│   └── analytics/      # Analytics tracking
├── themes/
│   ├── default/
│   └── admin/
├── starters/
│   ├── blog/
│   ├── ecommerce/
│   ├── saas/
│   └── portfolio/
├── examples/
│   └── hello-extora/   # Example plugin
└── docker/
    ├── docker-compose.dev.yml
    └── docker-compose.prod.yml
```

---

## Development Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all code |
| `pnpm typecheck` | Type-check all packages |
| `pnpm docker:up` | Start Docker services |
| `pnpm docker:down` | Stop Docker services |

---

## Deployment

### Development
```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

### Production
```bash
cp .env.example .env     # Fill in secrets
docker compose -f docker/docker-compose.prod.yml up -d
```

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

### Authentication
- `POST /auth/login` — Login
- `POST /auth/register` — Register
- `POST /auth/logout` — Logout
- `POST /auth/refresh` — Refresh token
- `GET /auth/session` — Get session

### Plugins
- `GET /plugins` — List plugins
- `POST /plugins/:name/activate` — Activate
- `POST /plugins/:name/deactivate` — Deactivate

### Users
- `GET /users` — List users

### System
- `GET /system/health` — Health check
- `GET /system/info` — System info
- `GET /system/hooks` — Registered hooks

### Themes
- `GET /themes` — List themes
- `POST /themes/:name/activate` — Activate

### Configuration
- `GET /config` — Get configuration

---

## SDK Exports

| Subpath | Contents |
|---|---|
| `@extora/sdk` | BasePlugin + all exports |
| `@extora/sdk/testing` | Mock factories |
| `@extora/sdk/database` | BaseMigration, createMigrationRunner |
| `@extora/sdk/hooks` | addAction, addFilter, removeAction, removeFilter |
| `@extora/sdk/events` | publishEvent, subscribeEvent |
| `@extora/sdk/config` | getConfig, setConfig |
| `@extora/sdk/api` | createRouter, middleware builders |
| `@extora/sdk/cli` | registerCliCommand, createCliCommand |
| `@extora/sdk/studio` | registerSlot, registerRoute, STUDIO_SLOTS |

---

## Next Steps

1. Read the [Mega Blueprint](EXTORA_MEGA_BLUEPRINT_v2.0.md) for architecture
2. Check the [Development Journal](EXTORA_DEVELOPMENT_JOURNAL.md) for progress
3. See [examples/hello-extora](examples/hello-extora) for a working plugin
4. Read [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
