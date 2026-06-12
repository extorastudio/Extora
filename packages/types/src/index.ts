// =============================================================================
// @extora/types — Shared TypeScript Interfaces for the Extora Ecosystem
// =============================================================================

// ---------------------------------------------------------------------------
// Plugin Types
// ---------------------------------------------------------------------------

export interface PluginAuthor {
  name: string;
  email?: string;
  url?: string;
}

export interface PluginManifest {
  name: string;
  version: string;
  type: "plugin" | "theme";
  title: string;
  description?: string;
  author: PluginAuthor;
  license: string;
  icon?: string;
  screenshots?: string[];
  categories?: string[];
  keywords?: string[];
  homepage?: string;
  repository?: string;
  documentation?: string;
  extora: {
    core: string;
    engine?: string;
  };
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
  config?: {
    schema?: string;
  };
  minimum?: {
    memory?: string;
    cpu?: string;
    disk?: string;
  };
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

// ---------------------------------------------------------------------------
// Hook Types
// ---------------------------------------------------------------------------

export type HookPriority = number;

export type ActionCallback = (...args: unknown[]) => Promise<void> | void;

export type FilterCallback<T = unknown> = (
  value: T,
  ...args: unknown[]
) => Promise<T> | T;

export interface HookEntry {
  callback: ActionCallback | FilterCallback;
  priority: HookPriority;
  plugin: string;
}

// ---------------------------------------------------------------------------
// Event Types
// ---------------------------------------------------------------------------

export interface EventPayload {
  type: string;
  payload: unknown;
  source?: string;
  timestamp: Date;
}

export interface EventBus {
  publish(type: string, payload: unknown, source?: string): Promise<void>;
  subscribe(
    type: string,
    handler: (payload: unknown) => Promise<void>,
    source?: string,
  ): void;
  unsubscribe(type: string, handler: (...args: unknown[]) => unknown): void;
}

export interface EventStore {
  append(event: EventPayload): Promise<void>;
  getEvents(
    type?: string,
    from?: Date,
    to?: Date,
    limit?: number,
  ): Promise<EventPayload[]>;
}

// ---------------------------------------------------------------------------
// Hook System Types
// ---------------------------------------------------------------------------

export interface HookRegistry {
  addAction(
    hookName: string,
    callback: ActionCallback,
    priority?: HookPriority,
    plugin?: string,
  ): void;
  doAction(hookName: string, ...args: unknown[]): Promise<void>;
  removeAction(hookName: string, callback: ActionCallback): void;

  addFilter<T>(
    hookName: string,
    callback: FilterCallback<T>,
    priority?: HookPriority,
    plugin?: string,
  ): void;
  applyFilters<T>(hookName: string, value: T, ...args: unknown[]): Promise<T>;
  removeFilter<T>(hookName: string, callback: FilterCallback<T>): void;

  getRegisteredHooks(): Map<string, { actions: number; filters: number }>;
}

// ---------------------------------------------------------------------------
// Logger Types
// ---------------------------------------------------------------------------

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

// ---------------------------------------------------------------------------
// Database Types
// ---------------------------------------------------------------------------

export interface DatabaseClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: (tx: DatabaseClient) => Promise<T>): Promise<T>;
  // Plugin-scoped database access
  getPluginDb(pluginName: string): PluginDatabaseClient;
}

export interface PluginDatabaseClient {
  createTable(name: string, columns: Record<string, string>): Promise<void>;
  dropTable(name: string): Promise<void>;
  insert<T = Record<string, unknown>>(table: string, data: T): Promise<T>;
  update<T = Record<string, unknown>>(
    table: string,
    where: Record<string, unknown>,
    data: Partial<T>,
  ): Promise<T[]>;
  delete(table: string, where: Record<string, unknown>): Promise<number>;
  select<T = Record<string, unknown>>(
    table: string,
    where?: Record<string, unknown>,
    options?: QueryOptions,
  ): Promise<T[]>;
  count(table: string, where?: Record<string, unknown>): Promise<number>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  select?: string[];
}

// ---------------------------------------------------------------------------
// Cache Types
// ---------------------------------------------------------------------------

export interface CacheManager {
  get<T = unknown>(key: string): Promise<T | null>;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T narrows value type for callers
  set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getOrSet<T = unknown>(
    key: string,
    factory: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T>;
  invalidateByTag(tag: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Config Types
// ---------------------------------------------------------------------------

export interface ConfigManager {
  get<T = unknown>(key: string): Promise<T | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T narrows value type for callers
  set<T = unknown>(key: string, value: T, isSecret?: boolean): Promise<void>;
  has(key: string): Promise<boolean>;
  del(key: string): Promise<void>;
  getAll(): Promise<Record<string, unknown>>;
  getHistory(key: string): Promise<ConfigHistoryEntry[]>;
}

export interface ConfigHistoryEntry {
  key: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy?: string;
  changedAt: Date;
}

// ---------------------------------------------------------------------------
// User & Auth Types
// ---------------------------------------------------------------------------

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "AUTHOR" | "VIEWER";

export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export interface AuthIdentity {
  id: string;
  userId: string;
  provider: string;
  providerUserId: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Permission & RBAC Types
// ---------------------------------------------------------------------------

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Permission[];
}

// ---------------------------------------------------------------------------
// Plugin Runtime Types
// ---------------------------------------------------------------------------

export interface LoadedPlugin {
  manifest: PluginManifest;
  instance: PluginLifecycle;
  sandbox: PluginSandbox;
  loadOrder: number;
}

export interface PluginSandbox {
  execute<T>(code: string, context?: Record<string, unknown>): Promise<T>;
  dispose(): void;
}

export interface PluginResolverResult {
  resolved: LoadedPlugin[];
  unresolved: string[];
  conflicts: PluginConflict[];
  errors: string[];
}

export interface PluginConflict {
  pluginA: string;
  pluginB: string;
  dependency: string;
  requiredByA: string;
  requiredByB: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Migration Types
// ---------------------------------------------------------------------------

export interface Migration {
  name: string;
  version: string;
  up(): Promise<void>;
  down(): Promise<void>;
}

export interface MigrationRunner {
  register(migration: Migration): void;
  runPending(): Promise<void>;
  rollback(steps: number): Promise<void>;
  status(): Promise<MigrationStatus[]>;
}

export interface MigrationStatus {
  name: string;
  version: string;
  applied: boolean;
  appliedAt: Date | null;
}

// ---------------------------------------------------------------------------
// API Types
// ---------------------------------------------------------------------------

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  handler: ApiHandler;
  middleware?: ApiMiddleware[];
  schema?: {
    body?: unknown;
    query?: unknown;
    params?: unknown;
    response?: Record<number, unknown>;
  };
}

export type ApiHandler = (
  request: ApiRequest,
  reply: ApiReply,
) => Promise<unknown>;

export type ApiMiddleware = (
  request: ApiRequest,
  reply: ApiReply,
) => Promise<void>;

export interface ApiRequest {
  body: unknown;
  query: Record<string, string>;
  params: Record<string, string>;
  headers: Record<string, string>;
  user?: User;
  session?: Session;
}

export interface ApiReply {
  status(code: number): ApiReply;
  send(data: unknown): void;
  header(key: string, value: string): ApiReply;
}

// ---------------------------------------------------------------------------
// Media Types
// ---------------------------------------------------------------------------

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  storageBackend: string;
  url: string;
  thumbnailUrl: string | null;
  metadata: Record<string, unknown> | null;
  uploadedBy: string | null;
  createdAt: Date;
}

export interface MediaTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp" | "avif";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  position?: "center" | "top" | "right" | "bottom" | "left";
}

// ---------------------------------------------------------------------------
// Queue / Job Types
// ---------------------------------------------------------------------------

export interface JobDefinition {
  queue: string;
  name: string;
  data: unknown;
  priority?: number;
  delay?: number;
  maxAttempts?: number;
}

export interface JobResult {
  id: string;
  status: "waiting" | "active" | "completed" | "failed" | "delayed";
  attempts: number;
  error: string | null;
  completedAt: Date | null;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

// ---------------------------------------------------------------------------
// Search Types
// ---------------------------------------------------------------------------

export interface SearchQuery {
  index: string;
  query: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
  sort?: Record<string, "asc" | "desc">;
}

export interface SearchResult<T = unknown> {
  hits: { id: string; score: number; data: T }[];
  total: number;
  page: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Pagination Types
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ---------------------------------------------------------------------------
// Error Types
// ---------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export class ExtoraError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ExtoraError";
  }
}
