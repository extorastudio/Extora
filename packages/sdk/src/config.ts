import type { ConfigManager } from "@extora/types";

let _config: ConfigManager | null = null;

export function setConfigManager(manager: ConfigManager): void {
  _config = manager;
}

export async function getConfig<T = unknown>(key: string): Promise<T | undefined> {
  if (!_config) return undefined;
  return _config.get<T>(key);
}

export async function setConfig<T = unknown>(
  key: string,
  value: T,
  isSecret = false,
): Promise<void> {
  if (!_config) return;
  await _config.set(key, value, isSecret);
}
