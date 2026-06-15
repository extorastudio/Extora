import type {
  Logger,
  DatabaseClient,
  CacheManager,
  EventBus,
  HookRegistry,
  ConfigManager,
  MediaItem,
  PaginatedResponse,
} from "@extora/types";

export function createMockLogger(): Logger {
  return {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    child: () => createMockLogger(),
  };
}

export function createMockEventBus(): EventBus {
  const events: { type: string; payload: unknown }[] = [];
  const handlers = new Map<string, ((p: unknown) => Promise<void>)[]>();

  return {
    async publish(type: string, payload: unknown): Promise<void> {
      events.push({ type, payload });
      const subs = handlers.get(type);
      if (subs) {
        await Promise.all(subs.map((h) => h(payload)));
      }
    },
    subscribe(
      type: string,
      handler: (p: unknown) => Promise<void>,
    ): void {
      if (!handlers.has(type)) handlers.set(type, []);
      handlers.get(type)!.push(handler);
    },
    unsubscribe(type: string, handler: (...args: unknown[]) => unknown): void {
      const subs = handlers.get(type);
      if (subs) {
        handlers.set(type, subs.filter((h) => h !== handler));
      }
    },
  };
}

export function createMockDatabase(): DatabaseClient {
  const store = new Map<string, unknown[]>();

  return {
    async query<T = unknown>(_sql: string, _params?: unknown[]): Promise<T[]> {
      return [] as T[];
    },
    async transaction<T>(fn: (tx: DatabaseClient) => Promise<T>): Promise<T> {
      return fn(createMockDatabase());
    },
    getPluginDb() {
      return {
        createTable: async () => {},
        dropTable: async () => {},
        insert: async <T>(_table: string, data: T) => data,
        update: async <T>(_table: string, _where: Record<string, unknown>, data: Partial<T>) => [data as T],
        delete: async (_table: string, _where: Record<string, unknown>) => 0,
        select: async <T>(table: string, _where?: Record<string, unknown>) => (store.get(table) as T[]) ?? [],
        count: async (_table: string, _where?: Record<string, unknown>) => 0,
      };
    },
  };
}

export function createMockCache(): CacheManager {
  const store = new Map<string, { value: unknown; expiresAt: number }>();

  return {
    async get<T>(key: string): Promise<T | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        store.delete(key);
        return null;
      }
      return entry.value as T;
    },
    async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
      store.set(key, {
        value,
        expiresAt: ttlMs ? Date.now() + ttlMs : Infinity,
      });
    },
    async del(key: string): Promise<void> {
      store.delete(key);
    },
    async has(key: string): Promise<boolean> {
      return store.has(key);
    },
    async clear(): Promise<void> {
      store.clear();
    },
    async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> {
      const existing = await this.get<T>(key);
      if (existing !== null) return existing;
      const value = await factory();
      await this.set(key, value, ttlMs);
      return value;
    },
    async invalidateByTag(_tag: string): Promise<void> {},
  };
}

export function createMockConfig(): ConfigManager {
  const store = new Map<string, unknown>();

  return {
    async get<T>(key: string): Promise<T | undefined> {
      return store.get(key) as T;
    },
    async set<T>(key: string, value: T): Promise<void> {
      store.set(key, value);
    },
    async has(key: string): Promise<boolean> {
      return store.has(key);
    },
    async del(key: string): Promise<void> {
      store.delete(key);
    },
    async getAll(): Promise<Record<string, unknown>> {
      return Object.fromEntries(store);
    },
    async getHistory(): Promise<[]> {
      return [];
    },
  };
}

export function createMockHookRegistry(): HookRegistry {
  const actions = new Map<string, ((...args: unknown[]) => Promise<void> | void)[]>();
  const filters = new Map<string, ((v: unknown, ...a: unknown[]) => Promise<unknown> | unknown)[]>();

  return {
    addAction(name: string, cb: (...args: unknown[]) => Promise<void> | void): void {
      if (!actions.has(name)) actions.set(name, []);
      actions.get(name)!.push(cb);
    },
    async doAction(name: string, ...args: unknown[]): Promise<void> {
      for (const cb of actions.get(name) ?? []) {
        await cb(...args);
      }
    },
    removeAction(name: string, cb: (...args: unknown[]) => Promise<void> | void): void {
      const list = actions.get(name);
      if (list) actions.set(name, list.filter((c) => c !== cb));
    },
    addFilter<T>(name: string, cb: (v: T, ...a: unknown[]) => Promise<T> | T): void {
      if (!filters.has(name)) filters.set(name, []);
      filters.get(name)!.push(cb as (v: unknown, ...a: unknown[]) => Promise<unknown> | unknown);
    },
    async applyFilters<T>(name: string, value: T, ...args: unknown[]): Promise<T> {
      let result: unknown = value;
      for (const cb of filters.get(name) ?? []) {
        result = await cb(result, ...args);
      }
      return result as T;
    },
    removeFilter<T>(name: string, cb: (v: T, ...a: unknown[]) => Promise<T> | T): void {
      const list = filters.get(name);
      if (list) filters.set(name, list.filter((c) => c !== cb));
    },
    getRegisteredHooks() {
      const result = new Map<string, { actions: number; filters: number }>();
      for (const [n, a] of actions) result.set(n, { actions: a.length, filters: 0 });
      for (const [n, f] of filters) {
        result.set(n, { actions: result.get(n)?.actions ?? 0, filters: f.length });
      }
      return result;
    },
  };
}

export function createMockMediaItem(overrides?: Partial<MediaItem>): MediaItem {
  return {
    id: "mock-media-1",
    filename: "test.jpg",
    originalName: "test.jpg",
    mimeType: "image/jpeg",
    size: 1024,
    width: 800,
    height: 600,
    storageBackend: "local",
    url: "/media/test.jpg",
    thumbnailUrl: null,
    metadata: null,
    uploadedBy: null,
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockPaginatedResponse<T>(data: T[]): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: 1,
      limit: 20,
      total: data.length,
      totalPages: Math.ceil(data.length / 20),
      hasNext: false,
      hasPrev: false,
    },
  };
}
