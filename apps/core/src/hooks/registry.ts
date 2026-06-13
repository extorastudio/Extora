import type { ActionCallback, FilterCallback, HookEntry, HookRegistry, HookPriority } from "@extora/types";

export class CoreHookRegistry implements HookRegistry {
  private actions = new Map<string, HookEntry[]>();
  private filters = new Map<string, HookEntry[]>();

  addAction(
    hookName: string,
    callback: ActionCallback,
    priority: HookPriority = 10,
    plugin = "core",
  ): void {
    const hooks = this.actions.get(hookName);
    if (hooks) {
      hooks.push({ callback, priority, plugin });
      hooks.sort((a, b) => a.priority - b.priority);
    } else {
      this.actions.set(hookName, [{ callback, priority, plugin }]);
    }
  }

  async doAction(hookName: string, ...args: unknown[]): Promise<void> {
    const hooks = this.actions.get(hookName);
    if (!hooks || hooks.length === 0) return;

    for (const hook of hooks) {
      try {
        await (hook.callback as ActionCallback)(...args);
      } catch (err: unknown) {
        console.error(
          `Action hook "${hookName}" (plugin: ${hook.plugin}) failed:`,
          err,
        );
      }
    }
  }

  removeAction(hookName: string, callback: ActionCallback): void {
    const hooks = this.actions.get(hookName);
    if (!hooks) return;
    this.actions.set(
      hookName,
      hooks.filter((h) => h.callback !== callback),
    );
  }

  addFilter<T>(
    hookName: string,
    callback: FilterCallback<T>,
    priority: HookPriority = 10,
    plugin = "core",
  ): void {
    const hooks = this.filters.get(hookName);
    const entry: HookEntry = {
      callback: callback as FilterCallback,
      priority,
      plugin,
    };
    if (hooks) {
      hooks.push(entry);
      hooks.sort((a, b) => a.priority - b.priority);
    } else {
      this.filters.set(hookName, [entry]);
    }
  }

  async applyFilters<T>(hookName: string, value: T, ...args: unknown[]): Promise<T> {
    const hooks = this.filters.get(hookName);
    if (!hooks || hooks.length === 0) return value;

    let result = value;
    for (const hook of hooks) {
      try {
        result = await (hook.callback as FilterCallback<T>)(result, ...args);
      } catch (err: unknown) {
        console.error(
          `Filter hook "${hookName}" (plugin: ${hook.plugin}) failed:`,
          err,
        );
      }
    }
    return result;
  }

  removeFilter<T>(hookName: string, callback: FilterCallback<T>): void {
    const hooks = this.filters.get(hookName);
    if (!hooks) return;
    this.filters.set(
      hookName,
      hooks.filter((h) => h.callback !== callback),
    );
  }

  getRegisteredHooks(): Map<string, { actions: number; filters: number }> {
    const result = new Map<string, { actions: number; filters: number }>();

    for (const [name, hooks] of this.actions) {
      result.set(name, {
        actions: hooks.length,
        filters: result.get(name)?.filters ?? 0,
      });
    }

    for (const [name, hooks] of this.filters) {
      const existing = result.get(name);
      result.set(name, {
        actions: existing?.actions ?? 0,
        filters: hooks.length,
      });
    }

    return result;
  }

  getActionHooks(name: string): HookEntry[] {
    return this.actions.get(name) ?? [];
  }

  getFilterHooks(name: string): HookEntry[] {
    return this.filters.get(name) ?? [];
  }

  removeAllForPlugin(pluginName: string): void {
    for (const [name, hooks] of this.actions) {
      this.actions.set(name, hooks.filter((h) => h.plugin !== pluginName));
    }
    for (const [name, hooks] of this.filters) {
      this.filters.set(name, hooks.filter((h) => h.plugin !== pluginName));
    }
  }
}
