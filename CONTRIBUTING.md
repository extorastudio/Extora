# Contributing to Extora

Thank you for your interest in contributing! Extora is a community-driven project, and we welcome contributions of all kinds.

## Getting Started

### Prerequisites

- **Node.js 22+** ([nvm](https://github.com/nvm-sh/nvm) recommended)
- **pnpm 9+** (`npm install -g pnpm`)
- **Docker Desktop** (for local development services)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Rishi2727/Extora_Studio.git
cd Extora_Studio

# Install dependencies
pnpm install

# Start Docker services (PostgreSQL, Redis, MinIO, OpenSearch)
pnpm docker:up

# Copy environment file
cp .env.example .env

# Start development
pnpm dev
```

## Monorepo Structure

```
Extora_Studio/
├── apps/           # Applications (core, studio, cli, marketplace, etc.)
├── packages/       # Shared libraries (types, sdk, utils, ui, config)
├── plugins/        # Official plugins (auth, cms, commerce, forms)
├── themes/         # Official themes
├── starters/       # Starter kit templates
└── docker/         # Docker configurations
```

## Development Workflow

### Branches

- `main` — Production-ready code
- Feature branches — `feat/description`
- Fix branches — `fix/description`

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(core): add plugin dependency resolver
fix(cli): handle missing extora.json gracefully
docs(sdk): document hook registration API
test(core): add event bus unit tests
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `perf`

### Pull Request Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Ensure CI passes (`pnpm lint && pnpm typecheck && pnpm test`)
5. Submit a PR with:
   - Linked issue(s)
   - Description of changes
   - Screenshots/videos (if UI changes)
   - Breaking change notice (if applicable)

### Code Quality

Before submitting a PR, ensure:

```bash
pnpm lint          # ESLint — zero errors
pnpm typecheck     # TypeScript — zero errors
pnpm format:check  # Prettier — zero changes
pnpm test          # All tests pass
```

## Where to Contribute

| Area | Good First Issues | Description |
|---|---|---|
| `packages/types` | Add missing type definitions | Shared TypeScript interfaces |
| `apps/core` | Plugin loader, auth, API engine | Core runtime |
| `apps/studio` | Dashboard, user management | Admin UI |
| `plugins/*` | Official plugin features | Auth, CMS, Commerce, Forms |
| `docs` | Documentation, tutorials | User-facing docs |

## Community

- [GitHub Discussions](https://github.com/Rishi2727/Extora_Studio/discussions)
- Report bugs via [GitHub Issues](https://github.com/Rishi2727/Extora_Studio/issues)
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## License

By contributing, you agree that your contributions will be licensed under the
project's proprietary license. See [LICENSE](LICENSE) for details.
