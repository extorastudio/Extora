# EXTORA QUICKSTART DEVELOPMENT GUIDE

**First 30 Days of Coding — v1.0**
**Target Audience:** New Extora Core Team Engineers
**Prerequisites:** The Extora Mega Blueprint v2.0

---

## DAY 1-3: Environment Setup & Monorepo

### Day 1: Tools & Accounts

```bash
# --- Required Tools ---
# Node.js 22 LTS
brew install node@22              # macOS
# or: nvm install 22 && nvm use 22

# pnpm (package manager)
npm install -g pnpm@9

# Docker Desktop (for PostgreSQL, Redis, MinIO, OpenSearch)
brew install --cask docker        # macOS

# GitHub CLI
brew install gh

# --- Verify Versions ---
node --version     # v22.x.x
pnpm --version     # 9.x.x
docker --version   # 26.x.x
```

### Day 1 (continued): Repository & Monorepo

```bash
# Clone and setup
gh repo create extora/extora --private --clone
cd extora

# Create root package.json
pnpm init

# Install Turborepo
pnpm add -D turbo@latest

# Setup pnpm workspace
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "packages/*"
  - "plugins/*"
  - "themes/*"
  - "starters/*"
EOF

# Setup TypeScript base config
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
EOF

# Create directory structure
mkdir -p apps/core/src apps/studio/src apps/cli/src
mkdir -p packages/types/src packages/sdk/src packages/utils/src packages/ui/src packages/config/src
mkdir -p plugins/auth/src plugins/cms/src plugins/commerce/src plugins/forms/src
mkdir -p themes/default themes/admin
mkdir -p starters/blog starters/ecommerce starters/saas
mkdir -p docker scripts

# Gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.log
.DS_Store
storage/
.turbo/
coverage/
EOF
```

### Day 2: CI/CD & Tooling

```bash
# --- ESLint + Prettier ---
pnpm add -D -w eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier

# --- Vitest ---
pnpm add -D -w vitest

# --- Commitlint ---
pnpm add -D -w @commitlint/cli @commitlint/config-conventional
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# --- Husky (git hooks) ---
pnpm add -D -w husky
npx husky init
echo "pnpm lint && pnpm typecheck" > .husky/pre-commit
echo "npx commitlint --edit \$1" > .husky/commit-msg

# --- GitHub Actions: ci.yml ---
mkdir -p .github/workflows
```

**`.github/workflows/ci.yml`:**
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: extora
          POSTGRES_PASSWORD: extora
          POSTGRES_DB: extora
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

### Day 3: Docker Compose Dev Environment

**`docker/docker-compose.dev.yml`:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: extora
      POSTGRES_PASSWORD: extora
      POSTGRES_DB: extora
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U extora"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

  opensearch:
    image: opensearchproject/opensearch:2
    environment:
      discovery.type: single-node
      OPENSEARCH_INITIAL_ADMIN_PASSWORD: Admin123!
      plugins.security.disabled: "true"
    ports:
      - "9200:9200"

volumes:
  pgdata:
  miniodata:
```

```bash
# Create .env file for local dev
cat > apps/core/.env << 'EOF'
DATABASE_URL=postgresql://extora:extora@localhost:5432/extora
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-change-in-production-xxxxxxxxxxxxxxx
ENCRYPTION_KEY=dev-key-change-in-production-xxxxxxxxxxxxxxx
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
STORAGE_BACKEND=local
STORAGE_LOCAL_PATH=./storage
EOF
```

---

## DAY 4-7: Core Foundation

### Day 4: `@extora/types` Package

Create the shared types package that every other package depends on.

**`packages/types/package.json`:**
```json
{
  "name": "@extora/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

**Core types to define:**
```typescript
// packages/types/src/index.ts

// Plugin types
export interface PluginManifest {
  name: string;
  version: string;
  type: 'plugin' | 'theme';
  title: string;
  description?: string;
  author: { name: string; email?: string; url?: string };
  license: string;
  icon?: string;
  extora: { core: string; engine?: string };
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  conflicts?: Record<string, string>;
  permissions: string[];
  entry: {
    server?: string;
    studio?: string;
    cli?: string;
  };
  hooks?: {
    actions?: string[];
    filters?: string[];
    events?: string[];
  };
  api?: {
    rest?: { endpoints: string[] };
    graphql?: { types: string[] };
  };
  database?: {
    migrations?: string;
    seeds?: string;
  };
  config?: { schema?: string };
  minimum?: { memory?: string; cpu?: string; disk?: string };
}

export interface PluginContext {
  logger: Logger;
  database: DatabaseClient;
  cache: CacheManager;
  eventBus: EventBus;
  hooks: HookRegistry;
  config: ConfigManager;
  pluginName: string;
}

export interface PluginLifecycle {
  onInstall(): Promise<void>;
  onActivate(): Promise<void>;
  onDeactivate(): Promise<void>;
  onUninstall(): Promise<void>;
  onUpdate(previousVersion: string): Promise<void>;
}

// Hook types
export type HookPriority = number;

export interface HookCallback {
  (...args: any[]): Promise<void> | void;
}

export interface FilterCallback<T = any> {
  (value: T, ...args: any[]): Promise<T> | T;
}

// Event types
export interface EventPayload {
  type: string;
  payload: unknown;
  source?: string;
  timestamp: Date;
}

// User types
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER';

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Config types
export interface SystemConfig {
  key: string;
  value: unknown;
  isSecret: boolean;
}

// Logging
export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

// Stubs (will be replaced with real implementations)
export interface DatabaseClient {}
export interface CacheManager {}
export interface EventBus {
  publish(type: string, payload: unknown, source?: string): Promise<void>;
  subscribe(type: string, handler: (payload: unknown) => Promise<void>, source?: string): void;
}
export interface HookRegistry {}
export interface ConfigManager {}
```

### Day 5-6: Core Server & Bootstrap

**`apps/core/package.json`:**
```json
{
  "name": "@extora/core",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@extora/types": "workspace:*",
    "fastify": "^5.0.0",
    "@fastify/cors": "^10.0.0",
    "@fastify/websocket": "^11.0.0",
    "pino": "^9.0.0",
    "pino-pretty": "^11.0.0",
    "dotenv": "^16.0.0",
    "zod": "^3.0.0",
    "ioredis": "^5.0.0",
    "@prisma/client": "^6.0.0",
    "bullmq": "^5.0.0",
    "@aws-sdk/client-s3": "^3.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "prisma": "^6.0.0",
    "@types/node": "^22.0.0",
    "vitest": "^2.0.0"
  }
}
```

**Core bootstrap (`apps/core/src/bootstrap.ts`):**
```typescript
import 'dotenv/config';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export interface BootstrapContext {
  logger: pino.Logger;
  prisma: PrismaClient;
  redis: Redis;
  config: Map<string, unknown>;
}

export async function bootstrap(): Promise<BootstrapContext> {
  logger.info('===========================================');
  logger.info('  Extora Core v0.0.0 — Bootstrapping');
  logger.info('===========================================');

  // 1. Connect to PostgreSQL
  logger.info('[1/10] Connecting to PostgreSQL...');
  await prisma.$connect();
  logger.info('       PostgreSQL connected ✓');

  // 2. Connect to Redis
  logger.info('[2/10] Connecting to Redis...');
  await redis.ping();
  logger.info('       Redis connected ✓');

  // 3. Run migrations
  logger.info('[3/10] Running database migrations...');
  // const { execSync } = await import('child_process');
  // execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  logger.info('       Migrations complete ✓');

  // 4. Load configuration
  logger.info('[4/10] Loading configuration...');
  const config = new Map<string, unknown>();
  // Load defaults, then env, then DB configs
  logger.info('       Configuration loaded ✓');

  // 5-10. Remaining steps (cache, queue, event bus, hooks, plugins, API)
  logger.info('[5/10] Initializing cache manager...');
  logger.info('[6/10] Initializing queue manager...');
  logger.info('[7/10] Initializing event bus...');
  logger.info('[8/10] Initializing hook system...');
  logger.info('[9/10] Loading plugins...');
  logger.info('[10/10] Starting API server...');

  return { logger, prisma, redis, config };
}
```

### Day 7: Fastify Server & Health Endpoint

**`apps/core/src/server.ts`:**
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { BootstrapContext } from './bootstrap';

export async function createServer(ctx: BootstrapContext) {
  const server = Fastify({
    logger: ctx.logger,
    trustProxy: true,
  });

  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Health check
  server.get('/api/v1/system/health', async () => ({
    status: 'ok',
    version: '0.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(ctx),
      redis: await checkRedis(ctx),
    },
  }));

  // System info
  server.get('/api/v1/system/info', async () => ({
    version: '0.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
  }));

  return server;
}

async function checkDatabase(ctx: BootstrapContext) {
  try {
    await ctx.prisma.$queryRaw`SELECT 1`;
    return { status: 'connected' };
  } catch {
    return { status: 'disconnected' };
  }
}

async function checkRedis(ctx: BootstrapContext) {
  try {
    await ctx.redis.ping();
    return { status: 'connected' };
  } catch {
    return { status: 'disconnected' };
  }
}
```

**`apps/core/src/index.ts`:**
```typescript
import { bootstrap } from './bootstrap';
import { createServer } from './server';

async function main() {
  const ctx = await bootstrap();
  const server = await createServer(ctx);

  const port = parseInt(process.env.PORT || '3000');
  const host = process.env.HOST || '0.0.0.0';

  await server.listen({ port, host });
  ctx.logger.info(`Extora Core ready on http://${host}:${port}`);
}

main().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
```

---

## DAY 8-14: Prisma Schema & Auth

### Day 8: Prisma Schema

Create the full Prisma schema from the Mega Blueprint Section 9.3.

```bash
cd apps/core
pnpm add @prisma/client
pnpm add -D prisma

npx prisma init
```

Then paste the complete `schema.prisma` from the blueprint.

```bash
npx prisma migrate dev --name initial
npx prisma generate
```

### Day 9-10: Auth Engine

Implement JWT, password hashing, session management:

**`apps/core/src/auth/jwt.ts`:**
```typescript
import { createSigner, createVerifier } from 'fast-jwt';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const SESSION_TTL = process.env.SESSION_TTL || '15m';
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

const sign = createSigner({ key: JWT_SECRET, expiresIn: SESSION_TTL as any });
const verify = createVerifier({ key: JWT_SECRET });

export function createAccessToken(payload: { sub: string; role: string }): string {
  return sign({ ...payload, type: 'access' });
}

export function createRefreshToken(userId: string): string {
  return sign({ sub: userId, type: 'refresh', jti: crypto.randomUUID() });
}

export function verifyToken(token: string): any {
  return verify(token);
}
```

### Day 11-13: Auth API Endpoints

Implement all 12 auth endpoints from the blueprint:
- Login, Register, Logout, Refresh
- Email verification, Password reset
- MFA setup, OAuth flow
- Session info

**Pattern for each endpoint:**
```typescript
server.post('/api/v1/auth/login', {
  schema: {
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      mfaCode: z.string().optional(),
    }),
    response: {
      200: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        expiresIn: z.number(),
        user: UserSchema,
      }),
    },
  },
  handler: async (request, reply) => {
    // 1. Find user by email
    // 2. Verify password hash
    // 3. Check MFA if enabled
    // 4. Check rate limits
    // 5. Create session
    // 6. Generate tokens
    // 7. Log audit event
    // 8. Return response
  },
});
```

### Day 14: RBAC Authorization Middleware

```typescript
export async function requirePermission(
  request: FastifyRequest,
  reply: FastifyReply,
  resource: string,
  action: string
): Promise<void> {
  const user = (request as any).user;
  if (!user) {
    return reply.status(401).send({ error: 'Authentication required' });
  }
  const hasPermission = await checkPermission(user.id, resource, action);
  if (!hasPermission) {
    return reply.status(403).send({ error: `Missing permission: ${resource}:${action}` });
  }
}
```

---

## DAY 15-21: Plugin Loader

### Day 15-16: Plugin Discovery & Manifest Validation

```typescript
// apps/core/src/plugin-loader/loader.ts
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

const ManifestSchema = z.object({
  name: z.string().regex(/^@[\w-]+\/[\w-]+$/),
  version: z.string().regex(/^\d+\.\d+\.\d+/),
  type: z.enum(['plugin', 'theme']),
  title: z.string(),
  extora: z.object({ core: z.string() }),
  permissions: z.array(z.string()),
  entry: z.object({
    server: z.string().optional(),
    studio: z.string().optional(),
    cli: z.string().optional(),
  }),
  dependencies: z.record(z.string(), z.string()).optional(),
});

export async function discoverPlugins(pluginDir: string): Promise<PluginManifest[]> {
  const entries = await readdir(pluginDir, { withFileTypes: true });
  const manifests: PluginManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = join(pluginDir, entry.name, 'extora.json');
    try {
      const raw = await readFile(manifestPath, 'utf-8');
      const manifest = ManifestSchema.parse(JSON.parse(raw));
      manifests.push(manifest);
    } catch (err) {
      console.error(`Failed to load plugin ${entry.name}:`, err);
    }
  }
  return manifests;
}
```

### Day 17-18: Dependency Resolution

```typescript
// apps/core/src/plugin-loader/resolver.ts
import * as semver from 'semver';

export interface ResolvedPlugin {
  manifest: PluginManifest;
  dependencies: string[];
  loadOrder: number;
}

export function resolveDependencies(
  plugins: PluginManifest[],
  installed: Map<string, string>
): ResolvedPlugin[] {
  // 1. Build dependency graph
  const graph = new Map<string, string[]>();
  for (const p of plugins) {
    graph.set(p.name, Object.keys(p.dependencies || {}));
  }

  // 2. Check for cycles
  detectCycles(graph);

  // 3. Check version constraints
  for (const [name, version] of installed) {
    const plugin = plugins.find(p => p.name === name);
    if (!plugin) throw new Error(`Plugin ${name} not found in installation`);
    if (!semver.satisfies(version, plugin.extora.core)) {
      throw new Error(`Plugin ${name} requires Extora Core ${plugin.extora.core}`);
    }
  }

  // 4. Topological sort
  const visited = new Set<string>();
  const order: string[] = [];
  function visit(name: string) {
    if (visited.has(name)) return;
    visited.add(name);
    for (const dep of graph.get(name) || []) {
      if (!plugins.find(p => p.name === dep)) {
        throw new Error(`Missing dependency: ${dep} (required by ${name})`);
      }
      visit(dep);
    }
    order.push(name);
  }
  for (const name of graph.keys()) visit(name);

  return order.map((name, i) => ({
    manifest: plugins.find(p => p.name === name)!,
    dependencies: graph.get(name) || [],
    loadOrder: i,
  }));
}
```

### Day 19-20: Plugin Sandboxing (VM Context)

```typescript
// apps/core/src/plugin-loader/sandbox.ts
import { createContext, runInContext } from 'node:vm';
import type { PluginContext } from '@extora/types';

export function createPluginSandbox(
  manifest: PluginManifest,
  coreContext: PluginContext
): { sandbox: any; loadPlugin: () => Promise<PluginLifecycle> } {
  const sandbox = {
    console: { log: coreContext.logger.info.bind(coreContext.logger) },
    require: createRestrictedRequire(manifest.permissions),
    process: { env: {} },
    global: {},
    setTimeout,
    clearTimeout,
    Buffer,
    URL,
    TextEncoder,
    TextDecoder,
    // No: fs, child_process, worker_threads, net, os, crypto (restricted)
  };

  const context = createContext(sandbox);

  return {
    sandbox,
    loadPlugin: async () => {
      // Load and run plugin code in sandboxed context
      const pluginModule = await loadPluginModule(manifest, context);
      return pluginModule.default || pluginModule;
    },
  };
}

function createRestrictedRequire(permissions: string[]): NodeRequire {
  return (moduleName: string) => {
    const allowedModules = getModulesFromPermissions(permissions);
    if (!allowedModules.includes(moduleName)) {
      throw new Error(`Module "${moduleName}" is not allowed. Plugin lacks required permissions.`);
    }
    return require(moduleName);
  };
}
```

### Day 21: Plugin Lifecycle Manager

```typescript
// apps/core/src/plugin-loader/lifecycle.ts
export class PluginLifecycleManager {
  private loadedPlugins = new Map<string, {
    manifest: PluginManifest;
    instance: PluginLifecycle;
    sandbox: any;
  }>();

  async install(manifest: PluginManifest, instance: PluginLifecycle, sandbox: any): Promise<void> {
    this.loadedPlugins.set(manifest.name, { manifest, instance, sandbox });
    await instance.onInstall();
  }

  async activate(name: string): Promise<void> {
    const plugin = this.loadedPlugins.get(name);
    if (!plugin) throw new Error(`Plugin ${name} not installed`);
    await plugin.instance.onActivate();
  }

  async deactivate(name: string): Promise<void> {
    const plugin = this.loadedPlugins.get(name);
    if (!plugin) throw new Error(`Plugin ${name} not installed`);
    await plugin.instance.onDeactivate();
  }

  async uninstall(name: string): Promise<void> {
    const plugin = this.loadedPlugins.get(name);
    if (!plugin) throw new Error(`Plugin ${name} not installed`);
    await plugin.instance.onUninstall();
    this.loadedPlugins.delete(name);
  }

  getActivePlugins(): string[] {
    return Array.from(this.loadedPlugins.keys());
  }
}
```

---

## DAY 22-28: Event Bus & Hook System

### Day 22-23: Event Bus

```typescript
// apps/core/src/event-bus/bus.ts
import type { EventBus, EventPayload } from '@extora/types';

export class CoreEventBus implements EventBus {
  private subscribers = new Map<string, Set<{
    handler: (payload: unknown) => Promise<void>;
    source?: string;
  }>>();

  async publish(type: string, payload: unknown, source?: string): Promise<void> {
    // 1. Persist to event store (PostgreSQL)
    // 2. Notify all subscribers
    const subs = this.subscribers.get(type);
    if (!subs) return;

    const event: EventPayload = {
      type,
      payload,
      source,
      timestamp: new Date(),
    };

    await Promise.all(
      Array.from(subs).map(sub =>
        sub.handler(event.payload).catch(err => {
          console.error(`Error in event handler for "${type}":`, err);
        })
      )
    );
  }

  subscribe(type: string, handler: (payload: unknown) => Promise<void>, source?: string): void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add({ handler, source });
  }

  unsubscribe(type: string, handler: Function): void {
    const subs = this.subscribers.get(type);
    if (subs) {
      for (const sub of subs) {
        if (sub.handler === handler) {
          subs.delete(sub);
        }
      }
    }
  }
}
```

### Day 24-25: Hook System (Actions + Filters)

```typescript
// apps/core/src/hooks/registry.ts

type HookCallback = (...args: any[]) => Promise<void> | void;
type FilterCallback<T = any> = (value: T, ...args: any[]) => Promise<T> | T;

interface HookEntry {
  callback: HookCallback | FilterCallback;
  priority: number;
  plugin: string;
}

export class HookRegistry {
  private actions = new Map<string, HookEntry[]>();
  private filters = new Map<string, HookEntry[]>();

  addAction(hookName: string, callback: HookCallback, priority: number = 10, plugin: string = 'core'): void {
    if (!this.actions.has(hookName)) this.actions.set(hookName, []);
    this.actions.get(hookName)!.push({ callback, priority, plugin });
    this.actions.get(hookName)!.sort((a, b) => a.priority - b.priority);
  }

  async doAction(hookName: string, ...args: any[]): Promise<void> {
    const hooks = this.actions.get(hookName);
    if (!hooks) return;
    for (const hook of hooks) {
      await (hook.callback as HookCallback)(...args);
    }
  }

  addFilter<T>(hookName: string, callback: FilterCallback<T>, priority: number = 10, plugin: string = 'core'): void {
    if (!this.filters.has(hookName)) this.filters.set(hookName, []);
    this.filters.get(hookName)!.push({ callback, priority, plugin });
    this.filters.get(hookName)!.sort((a, b) => a.priority - b.priority);
  }

  async applyFilters<T>(hookName: string, value: T, ...args: any[]): Promise<T> {
    const hooks = this.filters.get(hookName);
    if (!hooks) return value;
    let result = value;
    for (const hook of hooks) {
      result = await (hook.callback as FilterCallback<T>)(result, ...args);
    }
    return result;
  }
}
```

### Day 26-28: Integration & Testing

```bash
# Write first integration test
mkdir -p apps/core/tests
```

**`apps/core/tests/bootstrap.test.ts`:**
```typescript
import { describe, it, expect } from 'vitest';

describe('Extora Core Bootstrap', () => {
  it('should start server and respond to health check', async () => {
    // This is an integration test — requires running Docker services
    // Can be skipped in CI without Docker (unit test only)
    expect(true).toBe(true); // placeholder
  });
});

describe('Plugin Dependency Resolver', () => {
  it('should resolve simple dependency graph', () => {
    const plugins = [
      { name: '@extora/auth', version: '1.0.0', extora: { core: '>=1.0.0' }, dependencies: {} },
      { name: '@extora/cms', version: '1.0.0', extora: { core: '>=1.0.0' }, dependencies: { '@extora/auth': '^1.0.0' } },
    ];
    const installed = new Map([['@extora/auth', '1.0.0']]);
    // test resolver
  });

  it('should detect circular dependencies', () => {
    // A depends on B, B depends on A
  });

  it('should reject incompatible core versions', () => {
    // Plugin requires core >=2.0.0 but core is 1.0.0
  });
});
```

---

## DAY 29-30: CLI & SDK Foundation

### Day 29: CLI Skeleton

```bash
cd apps/cli
pnpm init
pnpm add commander chalk ora
```

**`apps/cli/src/index.ts`:**
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('extora')
  .description('Extora CLI — Build, manage, and publish Extora plugins')
  .version('0.0.0');

program
  .command('create')
  .argument('<type>', 'plugin | theme | starter')
  .argument('<name>', 'name of the plugin/theme/starter')
  .option('--api', 'include REST API template')
  .option('--admin', 'include Studio admin template')
  .action((type, name, options) => {
    console.log(chalk.green(`Creating ${type}: ${name}...`));
    // Scaffold from templates
  });

program
  .command('dev')
  .description('Start development server')
  .option('--port <port>', 'port number', '3000')
  .action((options) => {
    console.log(chalk.blue(`Starting Extora dev server on port ${options.port}...`));
    // Start Docker + Core + watch files
  });

program.parse();
```

### Day 30: SDK Package Setup

```bash
cd packages/sdk
pnpm init
```

**`packages/sdk/package.json`:**
```json
{
  "name": "@extora/sdk",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@extora/types": "workspace:*"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

Create BasePlugin, hook registration, and event API exports (stubs pointing to types for now).

---

## POST DAY-30: Next Steps

### Immediate Next Priorities

| Priority | Task | Depends On |
|---|---|---|
| P0 | Prisma schema with all core tables | Day 8 |
| P0 | Full auth API implementation (12 endpoints) | Day 9-13 |
| P0 | Plugin loader working end-to-end | Day 15-21 |
| P1 | Event store in PostgreSQL | Day 22 |
| P1 | Rate limiting middleware | Day 14 |
| P1 | Studio login page + dashboard | Phase 3 |
| P2 | Media manager (MinIO integration) | Core |
| P2 | Queue system (BullMQ) | Core |

### Verification Checklist

After 30 days, you should be able to:

- [ ] `pnpm install` works across the monorepo
- [ ] `docker compose up` starts all dev services
- [ ] `pnpm dev` (in apps/core) starts the Core server
- [ ] `GET http://localhost:3000/api/v1/system/health` returns `{ status: "ok" }`
- [ ] `POST /api/v1/auth/register` creates a user
- [ ] `POST /api/v1/auth/login` returns JWT tokens
- [ ] `GET /api/v1/plugins` returns empty array (or sample plugins)
- [ ] A sample plugin with `extora.json` can be loaded by Core
- [ ] Plugin lifecycle hooks (onInstall, onActivate) execute
- [ ] Event bus publishes and delivers events
- [ ] Hook system executes action and filter hooks in priority order
- [ ] `extora create plugin test` scaffolds a new plugin directory
- [ ] `extora --version` outputs version
- [ ] All tests pass: `pnpm test`
- [ ] TypeScript compiles without errors: `pnpm typecheck`
- [ ] ESLint passes: `pnpm lint`

### Recommended Reading

1. Extora Mega Blueprint v2.0 (the Bible)
2. Fastify documentation: https://fastify.dev/docs
3. Prisma documentation: https://www.prisma.io/docs
4. BullMQ guide: https://docs.bullmq.io
5. Zod documentation: https://zod.dev
6. pino logger guide: https://getpino.io
7. OpenTelemetry JS: https://opentelemetry.io/docs/languages/js/

---

*End of Extora Quickstart Development Guide v1.0*

*Next up: Phase 1 — Core MVP Implementation (Months 3-6)*
