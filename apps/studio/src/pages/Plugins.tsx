import { useEffect, useRef, useState } from "react";
import { usePluginStore } from "../stores/plugin-store";
import { Puzzle, ToggleLeft, ToggleRight, RefreshCw, AlertCircle, Package, Download, Trash2, Search, Upload, X, CheckCircle } from "lucide-react";
import { TableSkeleton } from "../components/ui/Skeleton";

export default function PluginsPage() {
  const { plugins, isLoading, error, successMsg, fetchPlugins, togglePlugin, installPlugin, uninstallPlugin, discoverPlugins, clearMsg } = usePluginStore();
  const [showInstall, setShowInstall] = useState(false);
  const [manifestJson, setManifestJson] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => { void fetchPlugins(); }, [fetchPlugins]);

  const handleInstall = async () => {
    try {
      const manifest = JSON.parse(manifestJson);
      if (!manifest.name || !manifest.type) { alert("Manifest must have name and type fields"); return; }
      setInstalling(true);
      await installPlugin(manifest);
      setManifestJson(""); setShowInstall(false);
    } catch { alert("Invalid JSON. Please enter a valid plugin manifest."); }
    setInstalling(false);
  };

  const handleFileUpload = () => {
    const input = fileRef.current;
    if (!input) return;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      setManifestJson(text);
    };
    input.click();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Plugins</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowInstall(!showInstall)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500">
            <Download className="h-4 w-4" /> Install
          </button>
          <button onClick={() => void discoverPlugins()}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
            <Search className="h-4 w-4" /> Discover
          </button>
          <button onClick={() => void fetchPlugins()} disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Success / Error messages */}
      {successMsg && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-green-800 bg-green-900/30 p-3 text-sm text-green-300">
          <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {successMsg}</div>
          <button onClick={clearMsg}><X className="h-4 w-4" /></button>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-300">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</div>
          <button onClick={clearMsg}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Install Form */}
      {showInstall && (
        <div className="mb-4 rounded-xl border border-gray-700 bg-gray-800/50 p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Upload className="h-4 w-4 text-blue-400" /> Install Plugin</h3>
          <div className="flex gap-2 mb-2">
            <button onClick={handleFileUpload} className="flex items-center gap-1 rounded-lg border border-gray-600 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700">
              <Upload className="h-3 w-3" /> Upload extora.json
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" />
            <span className="text-xs text-gray-500 self-center">or paste manifest below</span>
          </div>
          <textarea value={manifestJson} onChange={e => setManifestJson(e.target.value)}
            placeholder='{"name":"@extora/example","version":"1.0.0","type":"plugin","title":"Example Plugin","entry":{"server":"./src/index.ts"},"extora":{"core":">=0.3.0"}}'
            className="w-full h-32 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-y"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={() => void handleInstall()} disabled={installing || !manifestJson.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50">
              {installing ? "Installing..." : "Install Plugin"}
            </button>
            <button onClick={() => { setShowInstall(false); setManifestJson(""); }}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Cancel</button>
          </div>
        </div>
      )}

      {isLoading && plugins.length === 0 ? (
        <TableSkeleton rows={4} />
      ) : plugins.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">No plugins installed</p>
          <p className="mt-1 text-sm text-gray-500">Click "Install" to add a plugin, or "Discover" to scan local files</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${plugin.isActive ? "bg-green-600/20" : "bg-blue-600/20"}`}>
                <Puzzle className={`h-5 w-5 ${plugin.isActive ? "text-green-400" : "text-blue-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{plugin.title}</p>
                <p className="truncate text-sm text-gray-400">{plugin.name} v{plugin.version} by {plugin.author}</p>
                {plugin.description && <p className="text-xs text-gray-500 mt-0.5">{plugin.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plugin.isActive ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                  {plugin.isActive ? "Active" : "Inactive"}
                </span>
                <button onClick={() => void togglePlugin(plugin.name, !plugin.isActive)}
                  className="text-gray-400 hover:text-white" title={plugin.isActive ? "Deactivate" : "Activate"}>
                  {plugin.isActive ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6" />}
                </button>
                <button onClick={() => void uninstallPlugin(plugin.name)}
                  className="text-gray-500 hover:text-red-400 ml-1" title="Uninstall">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
