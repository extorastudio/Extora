import type { ActionCallback, FilterCallback, HookPriority } from "@extora/types";

let _hookRegistry: {
  addAction: (n: string, c: ActionCallback, p?: HookPriority, pl?: string) => void;
  addFilter: <T>(n: string, c: FilterCallback<T>, p?: HookPriority, pl?: string) => void;
  removeAction: (n: string, c: ActionCallback) => void;
  removeFilter: <T>(n: string, c: FilterCallback<T>) => void;
} | null = null;

export function setHookRegistry(registry: typeof _hookRegistry): void {
  _hookRegistry = registry;
}

export function addAction(
  hookName: string,
  callback: ActionCallback,
  priority: HookPriority = 10,
  plugin?: string,
): void {
  _hookRegistry?.addAction(hookName, callback, priority, plugin);
}

export function addFilter<T>(
  hookName: string,
  callback: FilterCallback<T>,
  priority: HookPriority = 10,
  plugin?: string,
): void {
  _hookRegistry?.addFilter(hookName, callback, priority, plugin);
}

export function removeAction(hookName: string, callback: ActionCallback): void {
  _hookRegistry?.removeAction(hookName, callback);
}

export function removeFilter<T>(hookName: string, callback: FilterCallback<T>): void {
  _hookRegistry?.removeFilter(hookName, callback);
}
