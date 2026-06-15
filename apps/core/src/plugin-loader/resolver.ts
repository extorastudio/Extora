import type { PluginManifest, PluginLifecycle, PluginSandbox, PluginResolverResult, PluginConflict } from "@extora/types";

interface ResolvedPlugin {
  manifest: PluginManifest;
  loadOrder: number;
}

export function resolveDependencies(
  plugins: PluginManifest[],
  installed: Map<string, string>,
): PluginResolverResult {
  const pluginMap = new Map<string, PluginManifest>();
  for (const p of plugins) {
    pluginMap.set(p.name, p);
  }

  const errors: string[] = [];
  const unresolved: string[] = [];
  const conflicts: PluginConflict[] = [];

  // Check that all declared dependencies are available
  for (const plugin of plugins) {
    for (const [depName] of Object.entries(plugin.dependencies ?? {})) {
      if (!pluginMap.has(depName) && !installed.has(depName)) {
        unresolved.push(depName);
        errors.push(`Plugin "${plugin.name}" requires "${depName}" which is not installed`);
      }
    }
  }

  if (errors.length > 0) {
    return { resolved: [], unresolved, conflicts, errors };
  }

  // Build adjacency list
  const graph = new Map<string, string[]>();
  for (const plugin of plugins) {
    const deps = Object.keys(plugin.dependencies ?? {});
    graph.set(plugin.name, deps);
  }

  // Detect cycles
  const cycle = detectCycle(graph);
  if (cycle) {
    return {
      resolved: [],
      unresolved,
      conflicts,
      errors: [`Circular dependency detected: ${cycle.join(" → ")}`],
    };
  }

  // Topological sort
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const order: string[] = [];

  function visit(name: string): boolean {
    if (visited.has(name)) return true;
    if (visiting.has(name)) return false;

    visiting.add(name);
    const deps = graph.get(name) ?? [];
    for (const dep of deps) {
      // Only recurse into deps that are in the plugin set (skip installed-only deps)
      if (pluginMap.has(dep)) {
        if (!visit(dep)) return false;
      }
    }
    visiting.delete(name);
    visited.add(name);
    order.push(name);
    return true;
  }

  for (const name of graph.keys()) {
    visit(name);
  }

  // Version constraint check for installed plugins
  for (const [depName, requiredVersion] of installed) {
    const plugin = pluginMap.get(depName);
    if (!plugin) continue;

    if (!satisfiesVersion(plugin.version, requiredVersion)) {
      conflicts.push({
        pluginA: depName,
        pluginB: "system",
        dependency: depName,
        requiredByA: requiredVersion,
        requiredByB: plugin.version,
        reason: `Installed version ${plugin.version} does not satisfy requirement ${requiredVersion}`,
      });
    }
  }



  const resolved: ResolvedPlugin[] = order.map((name, index) => ({
    manifest: pluginMap.get(name)!,
    loadOrder: index,
  }));

  const loaded = resolved.map((r) => ({
    manifest: r.manifest,
    instance: undefined as unknown as PluginLifecycle,
    sandbox: undefined as unknown as PluginSandbox,
    loadOrder: r.loadOrder,
  }));

  return {
    resolved: loaded,
    unresolved,
    conflicts,
    errors: conflicts.length > 0 ? conflicts.map((c) => c.reason) : [],
  };
}

function detectCycle(graph: Map<string, string[]>): string[] | null {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();

  for (const node of graph.keys()) {
    color.set(node, WHITE);
  }

  const stack: string[] = [];

  function dfs(node: string): boolean {
    color.set(node, GRAY);
    stack.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      const c = color.get(neighbor) ?? WHITE;
      if (c === GRAY) {
        const cycle = stack.slice(stack.indexOf(neighbor));
        cycle.push(neighbor);
        return true; // found cycle
      }
      if (c === WHITE && dfs(neighbor)) {
        return true;
      }
    }

    color.set(node, BLACK);
    stack.pop();
    return false;
  }

  for (const node of graph.keys()) {
    if ((color.get(node) ?? WHITE) === WHITE) {
      if (dfs(node)) {
        return stack;
      }
    }
  }

  return null;
}

function satisfiesVersion(actual: string, required: string): boolean {
  // Simple semver check: support ^, >=, <, ~ operators
  const actualParts = actual.replace(/^[^0-9]*/, "").split(".").map(Number);
  const actualMajor = actualParts[0] ?? 0;
  const actualMinor = actualParts[1] ?? 0;

  if (required === "*") return true;

  if (required.startsWith(">=")) {
    const reqParts = required.slice(2).split(".").map(Number);
    return compareVersions(actualParts, reqParts) >= 0;
  }

  if (required.startsWith("<=")) {
    const reqParts = required.slice(2).split(".").map(Number);
    return compareVersions(actualParts, reqParts) <= 0;
  }

  if (required.startsWith(">")) {
    const reqParts = required.slice(1).split(".").map(Number);
    return compareVersions(actualParts, reqParts) > 0;
  }

  if (required.startsWith("<")) {
    const reqParts = required.slice(1).split(".").map(Number);
    return compareVersions(actualParts, reqParts) < 0;
  }

  if (required.startsWith("^")) {
    const reqParts = required.slice(1).split(".").map(Number);
    const reqMajor = reqParts[0] ?? 0;
    return actualMajor === reqMajor && compareVersions(actualParts, reqParts) >= 0;
  }

  if (required.startsWith("~")) {
    const reqParts = required.slice(1).split(".").map(Number);
    const reqMajor = reqParts[0] ?? 0;
    const reqMinor = reqParts[1] ?? 0;
    return actualMajor === reqMajor && actualMinor === reqMinor && compareVersions(actualParts, reqParts) >= 0;
  }

  // Exact version match
  return actual === required;
}

function compareVersions(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const aVal = a[i] ?? 0;
    const bVal = b[i] ?? 0;
    if (aVal > bVal) return 1;
    if (aVal < bVal) return -1;
  }
  return 0;
}
