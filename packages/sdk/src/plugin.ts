import type {
  PluginManifest,
  PluginContext,
  PluginLifecycle,
  Logger,
  DatabaseClient,
  CacheManager,
  ConfigManager,
} from "@extora/types";

export abstract class BasePlugin implements PluginLifecycle {
  abstract manifest: PluginManifest;

  protected context!: PluginContext;

  _injectContext(ctx: PluginContext): void {
    this.context = ctx;
  }

  async onInstall(): Promise<void> {}
  async onActivate(): Promise<void> {}
  async onDeactivate(): Promise<void> {}
  async onUninstall(): Promise<void> {}
  async onUpdate(_previousVersion: string): Promise<void> {}

  protected get logger(): Logger {
    return this.context.logger;
  }

  protected get db(): DatabaseClient {
    return this.context.database;
  }

  protected get cache(): CacheManager {
    return this.context.cache;
  }

  protected get config(): ConfigManager {
    return this.context.config;
  }

  protected async publishEvent<T>(type: string, payload: T): Promise<void> {
    await this.context.eventBus.publish(type, payload, this.manifest.name);
  }

  protected subscribeEvent<T>(
    type: string,
    handler: (payload: T) => Promise<void>,
  ): void {
    this.context.eventBus.subscribe(type, handler as (p: unknown) => Promise<void>, this.manifest.name);
  }

  protected addAction(
    hookName: string,
    callback: (...args: unknown[]) => Promise<void> | void,
    priority?: number,
  ): void {
    this.context.hooks.addAction(hookName, callback, priority, this.manifest.name);
  }

  protected addFilter<T>(
    hookName: string,
    callback: (value: T, ...args: unknown[]) => Promise<T> | T,
    priority?: number,
  ): void {
    this.context.hooks.addFilter(hookName, callback, priority, this.manifest.name);
  }
}
