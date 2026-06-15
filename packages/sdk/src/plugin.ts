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
}
