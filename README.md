# Extora

[![CI](https://github.com/extora/extora/actions/workflows/ci.yml/badge.svg)](https://github.com/extora/extora/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Build Anything. Plugin Everything.**

Extora is a TypeScript-first plugin ecosystem platform. It is the operating system for web software — capable of powering a personal blog, a SaaS product, a government portal, or a multi-billion-dollar marketplace, all from the same core runtime.

> **Status:** Pre-Seed / Phase 0 — Foundation  
> **Blueprint:** [Extora Mega Blueprint v2.0](EXTORA_MEGA_BLUEPRINT_v2.0.md)

---

## Architecture

Extora is composed of 15 components organized in a pnpm + Turborepo monorepo:

| Layer | Components |
|---|---|
| **Developer Toolchain** | CLI, SDK, Starter Kits, Docs |
| **Runtime Engine** | Core (plugin loader, event bus, hook system, API engine, auth, sandboxing) |
| **Admin & Distribution** | Studio, Marketplace, Cloud, Enterprise |
| **Ecosystem Registry** | Private npm-compatible registry with security scanning |
| **Official Plugins** | Auth, CMS, Commerce, Forms, SEO, Analytics |
| **Infrastructure** | PostgreSQL, Redis, MinIO, Nginx, OpenSearch, Docker/K8s |

## Quick Start

```bash
# Prerequisites: Node.js 22+, pnpm 9+, Docker Desktop

# Clone and install
git clone https://github.com/extora/extora.git
cd extora

# Install dependencies
pnpm install

# Start development services (PostgreSQL, Redis, MinIO, OpenSearch)
pnpm docker:up

# Set up environment
cp .env.example .env

# Start development
pnpm dev
```

Visit `http://localhost:3000/api/v1/system/health` to verify.

## Development

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm format` | Format all files with Prettier |
| `pnpm docker:up` | Start Docker development services |
| `pnpm docker:down` | Stop Docker services |

## Documentation

- [Mega Blueprint v2.0](EXTORA_MEGA_BLUEPRINT_v2.0.md) — Complete architecture & specification
- [Quickstart Development Guide](EXTORA_QUICKSTART_DEVELOPMENT.md) — First 30 days of coding
- [Architecture Diagrams](EXTORA_ARCHITECTURE_DIAGRAMS.md) — System diagrams reference
- [Founder Blueprint v1.0](EXTORA_FOUNDER_BLUEPRINT_v1.0.md) — Original founding document

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, commit conventions, and pull request process.

## License

Core components are licensed under [MIT](LICENSE). See individual packages for details. Marketplace, Cloud, and Enterprise components are proprietary.
