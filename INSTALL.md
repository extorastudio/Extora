# Extora — Installation & Quick Start

## Platform Support

| Platform | Method | Status |
|---|---|---|
| **Docker** | `docker pull extorastudio/extora-core` | ✅ Ready |
| **Linux** | npm/pnpm install | ✅ Ready |
| **macOS** | npm/pnpm install | ✅ Ready |
| **Windows** | npm/pnpm install (WSL recommended) | ✅ Ready |

---

## Installation

### Option 1: Docker (Recommended)

```bash
# Pull the image
docker pull {username}/extora-core:latest

# Run with Docker Compose
curl -O https://raw.githubusercontent.com/extorastudio/Extora/main/docker/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:3000/api/v1/system/health
```

### Option 2: npm Global Install

```bash
# Install CLI globally
npm install -g @extora/cli

# Create a new plugin
extora create plugin my-plugin

# Start development
cd plugins/my-plugin
extora dev
```

### Option 3: pnpm (Monorepo Development)

```bash
# Clone the repository
git clone https://github.com/extorastudio/Extora.git
cd Extora

# Install dependencies
pnpm install

# Start Docker services (PostgreSQL, Redis, MinIO, OpenSearch)
pnpm docker:up

# Set up environment
cp .env.example .env

# Start development
pnpm dev
```

### Option 4: From Source

```bash
git clone https://github.com/extorastudio/Extora.git
cd Extora

# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start Core server
node apps/core/dist/index.js
```

---

## Platform-Specific Notes

### Windows
- Use **WSL 2** for Docker support
- Install Node.js 22+ from [nodejs.org](https://nodejs.org)
- PowerShell commands work the same as bash

### macOS
```bash
# Install Docker Desktop
brew install --cask docker

# Install Node.js
brew install node@22

# Install pnpm
npm install -g pnpm
```

### Linux (Ubuntu/Debian)
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm
```

---

## Quick Start — Building Your First Plugin

```bash
# 1. Install CLI
npm install -g @extora/cli

# 2. Create a plugin
extora create plugin hello-extora

# 3. Navigate to plugin
cd plugins/hello-extora

# 4. Start dev server
extora dev

# 5. Build for production
extora build

# 6. Package for distribution
extora package

# 7. Run tests
extora test
```

---

## Docker Services

```bash
# Start all services
docker compose -f docker/docker-compose.dev.yml up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

## Development Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all 559 tests |
| `pnpm lint` | Lint all code |
| `pnpm typecheck` | Type-check all packages |
| `pnpm docker:up` | Start Docker services |
| `pnpm docker:down` | Stop Docker services |

---

## SDK Usage

```typescript
import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

export default class MyPlugin extends BasePlugin {
  override manifest: PluginManifest = {
    name: "my-plugin",
    version: "1.0.0",
    type: "plugin",
    title: "My Plugin",
    author: { name: "Developer" },
    license: "MIT",
    extora: { core: ">=1.0.0" },
    permissions: ["database:read"],
    entry: { server: "dist/index.js" },
  };

  override async onInstall(): Promise<void> {
    const db = this.db.getPluginDb("my-plugin");
    await db.createTable("my_table", { id: "TEXT PRIMARY KEY" });
  }

  override async onActivate(): Promise<void> {
    this.addAction("user.registered", async (user) => {
      this.logger.info("New user!");
    });
  }
}
```

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/system/health` | GET | No | Health check |
| `/system/info` | GET | No | System information |
| `/auth/login` | POST | No | Login |
| `/auth/register` | POST | No | Register |
| `/plugins` | GET | Yes | List plugins |
| `/users` | GET | Yes | List users |
| `/themes` | GET | Yes | List themes |
| `/config` | GET | Yes | Get configuration |

---

## Requirements

- **Node.js** 22+ 
- **pnpm** 9+ (for monorepo development)
- **Docker** 24+ (for full development environment)
- **PostgreSQL** 16+ (or via Docker)
- **Redis** 7+ (or via Docker)
