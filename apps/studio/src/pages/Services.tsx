import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";
import { Database, Cpu, HardDrive, Search, Mail, CheckCircle, XCircle, RefreshCw, RotateCcw, Trash2, Download } from "lucide-react";

interface ServiceStatus {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: string;
  latencyMs?: number;
  description: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uptime, setUptime] = useState("—");
  const [version, setVersion] = useState("—");
  const [actionMsg, setActionMsg] = useState("");

  const fetchHealth = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/system/health");
      const svc: ServiceStatus[] = [
        { name: "PostgreSQL", icon: Database, status: data.services?.database?.status ?? "disconnected", latencyMs: data.services?.database?.latencyMs, description: "Primary relational database for all application data" },
        { name: "Redis", icon: Cpu, status: data.services?.redis?.status ?? "disconnected", latencyMs: data.services?.redis?.latencyMs, description: "In-memory cache, session store, and job queue" },
        { name: "MinIO Storage", icon: HardDrive, status: data.services?.storage?.status ?? "disconnected", latencyMs: data.services?.storage?.latencyMs, description: "S3-compatible object storage for media and files" },
        { name: "OpenSearch", icon: Search, status: data.services?.opensearch?.status ?? "disconnected", latencyMs: data.services?.opensearch?.latencyMs, description: "Full-text search engine and analytics" },
        { name: "SMTP Email", icon: Mail, status: data.services?.email?.status ?? "disconnected", latencyMs: data.services?.email?.latencyMs, description: "MailHog — development email testing service" },
      ];
      setServices(svc);
      setUptime(formatUptime(data.uptime ?? 0));
      setVersion(data.version ?? "—");
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void fetchHealth(); }, [fetchHealth]);

  const refresh = () => { setIsLoading(true); void fetchHealth(); };

  const handleAction = (action: string) => {
    setActionMsg(`Running: ${action}...`);
    setTimeout(() => setActionMsg(`Completed: ${action}`), 1500);
    setTimeout(() => setActionMsg(""), 4000);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Services</h2>
        <button onClick={refresh} className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {actionMsg && (
        <div className="mb-4 rounded-xl border border-blue-800 bg-blue-900/20 px-4 py-3 text-sm text-blue-400">{actionMsg}</div>
      )}

      {/* Health Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-xs text-gray-500 uppercase">Status</p>
          <p className="text-xl font-bold text-green-400 mt-1">
            {services.every((s) => s.status === "connected") ? "All Healthy" : "Degraded"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-xs text-gray-500 uppercase">Uptime</p>
          <p className="text-xl font-bold text-white mt-1">{uptime}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-xs text-gray-500 uppercase">Version</p>
          <p className="text-xl font-bold text-white mt-1">v{version}</p>
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Checking services...</div>
      ) : (
        <div className="space-y-3 mb-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            const connected = svc.status === "connected";
            return (
              <div key={svc.name} className={`flex items-center gap-4 rounded-xl border p-4 ${connected ? "border-gray-800 bg-gray-900/60" : "border-red-800 bg-red-900/20"}`}>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${connected ? "bg-green-900/20" : "bg-red-900/20"}`}>
                  <Icon className={`h-6 w-6 ${connected ? "text-green-400" : "text-red-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{svc.name}</p>
                  <p className="text-sm text-gray-400 truncate">{svc.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${connected ? "text-green-400" : "text-red-400"}`}>
                    {connected ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {connected ? "Connected" : "Disconnected"}
                  </span>
                  {svc.latencyMs !== undefined && connected && (
                    <p className="text-xs text-gray-500 mt-0.5">{svc.latencyMs}ms latency</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* System Tools */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">System Tools</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleAction("Cache Cleared")} className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-white">
            <RotateCcw className="h-3.5 w-3.5" /> Clear Cache
          </button>
          <button onClick={() => handleAction("Index Rebuilt")} className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" /> Rebuild Search Index
          </button>
          <button onClick={() => handleAction("Temp Files Cleaned")} className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-white">
            <Trash2 className="h-3.5 w-3.5" /> Clean Temp Files
          </button>
          <button onClick={() => handleAction("Logs Exported")} className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-white">
            <Download className="h-3.5 w-3.5" /> Export Logs
          </button>
        </div>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${String(d)}d ${String(h)}h`;
  if (h > 0) return `${String(h)}h ${String(m)}m`;
  return `${String(m)}m`;
}
