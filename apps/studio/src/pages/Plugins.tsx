import { useEffect } from "react";
import { usePluginStore } from "../stores/plugin-store";
import { Puzzle, ToggleLeft, ToggleRight, RefreshCw, AlertCircle, Package } from "lucide-react";

export default function PluginsPage() {
  const { plugins, isLoading, error, fetchPlugins, togglePlugin } = usePluginStore();

  useEffect(() => {
    void fetchPlugins();
  }, [fetchPlugins]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Plugins</h2>
        <button
          onClick={() => void fetchPlugins()}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {isLoading && plugins.length === 0 ? (
        <div className="py-12 text-center text-gray-400">Loading plugins...</div>
      ) : plugins.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">No plugins installed</p>
          <p className="mt-1 text-sm text-gray-500">Install plugins from the Marketplace to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                <Puzzle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{plugin.title}</p>
                <p className="truncate text-sm text-gray-400">
                  {plugin.name} v{plugin.version} by {plugin.author}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    plugin.isActive
                      ? "bg-green-900/40 text-green-400"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {plugin.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => void togglePlugin(plugin.name, !plugin.isActive)}
                  className="text-gray-400 hover:text-white"
                  title={plugin.isActive ? "Deactivate" : "Activate"}
                >
                  {plugin.isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
