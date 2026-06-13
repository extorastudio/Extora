/* eslint-disable @typescript-eslint/no-require-imports -- require() is essential for sandboxed dynamic module loading */
/* eslint-disable @typescript-eslint/no-empty-function -- empty no-op methods are intentional for sandbox restrictions */
import { createContext, runInContext, type Context } from "node:vm";
import type { PluginManifest, PluginSandbox } from "@extora/types";

interface SandboxOptions {
  manifest: PluginManifest;
  allowedPaths: string[];
  allowedHosts: string[];
  memoryLimitMB: number;
  cpuLimit: number;
}

export function createPluginSandbox(options: SandboxOptions): PluginSandbox {
  const { manifest, allowedHosts } = options;

  const restrictedConsole = {
    log: (..._args: unknown[]) => { /* noop */ },
    warn: (...args: unknown[]) => { console.warn(`[${manifest.name}]`, ...args); },
    error: (...args: unknown[]) => { console.error(`[${manifest.name}]`, ...args); },
    info: (..._args: unknown[]) => { /* noop */ },
    debug: (..._args: unknown[]) => { /* noop */ },
  };

  const allowedModules = getAllowedModules(manifest.permissions);

  function restrictedRequire(moduleName: string): unknown {
    if (allowedModules.has(moduleName)) {
      return require(moduleName);
    }

    const blockedModules = new Set([
      "child_process", "worker_threads", "cluster", "fs", "net",
      "dgram", "tls", "http", "https", "os", "process", "vm",
    ]);

    if (blockedModules.has(moduleName)) {
      throw new Error(
        `Plugin "${manifest.name}" cannot require "${moduleName}". ` +
          "Add required permissions to extora.json.",
      );
    }

    const safeModules = new Set([
      "path", "url", "crypto", "buffer", "stream", "util", "zlib", "events", "assert",
    ]);

    if (safeModules.has(moduleName)) {
      return require(moduleName);
    }

    throw new Error(
      `Plugin "${manifest.name}" attempted to require restricted module: ${moduleName}`,
    );
  }

  function restrictedFetch(input: string, init?: RequestInit): Promise<Response> {
    if (!allowedHosts.some((host) => input.includes(host))) {
      throw new Error(
        `Plugin "${manifest.name}" cannot make request to ${input}. ` +
          `Allowed hosts: ${allowedHosts.join(", ") || "none"}`,
      );
    }
    return fetch(input, init);
  }

  function restrictedSetTimeout(
    cb: (...args: unknown[]) => void,
    ms: number,
    ...args: unknown[]
  ): NodeJS.Timeout {
    const clamped = ms < 0 ? 0 : ms > 30_000 ? 30_000 : ms;
    return setTimeout(cb, clamped, ...args);
  }

  const sandboxObject: Record<string, unknown> = {
    console: restrictedConsole,
    require: restrictedRequire,
    fetch: restrictedFetch,
    setTimeout: restrictedSetTimeout,
    clearTimeout,
    setInterval: restrictedSetTimeout,
    clearInterval,
    Buffer,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    JSON,
    Math,
    Date,
    RegExp,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Promise,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Symbol,
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    ReferenceError,
    Intl,
  };

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T provides consumer type safety
  function execute<T>(code: string, ctx?: Record<string, unknown>): T {
    const executionContext = { ...sandboxObject, ...ctx };
    const vmContext: Context = createContext(executionContext, {
      name: `extora-plugin-${manifest.name}-exec`,
      codeGeneration: { strings: false, wasm: false },
    });
    return runInContext(code, vmContext, {
      filename: `plugin:${manifest.name}`,
      timeout: 10_000,
    }) as T;
  }

  return {
    execute,
    dispose: () => {},
  };
}

function getAllowedModules(permissions: string[]): Set<string> {
  const modules = new Set<string>();

  modules.add("@extora/sdk");
  modules.add("@extora/types");

  for (const perm of permissions) {
    if (perm === "http:outbound") {
      modules.add("https");
    }
  }

  return modules;
}
