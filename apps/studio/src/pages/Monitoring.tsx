import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Activity, BarChart3, Clock, Cpu, HardDrive, Database, Wifi, Globe, Server } from "lucide-react";

interface SystemInfo {
  version: string; nodeVersion: string; platform: string; pid: number;
  uptime: number; memory: { heapUsed: string; heapTotal: string; rss: string };
}

interface HealthService { status: string; latencyMs?: number; }

export default function MonitoringPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [health, setHealth] = useState<Record<string, HealthService> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, healthRes] = await Promise.all([
          apiClient.get("/system/info"),
          apiClient.get("/system/health"),
        ]);
        setInfo(infoRes.data as SystemInfo);
        setHealth((healthRes.data as { services: Record<string, HealthService> }).services);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    void fetchData();
  }, []);

  const services = [
    { key: "database", label: "PostgreSQL", icon: Database },
    { key: "redis", label: "Redis Cache", icon: Cpu },
    { key: "storage", label: "MinIO Storage", icon: HardDrive },
    { key: "opensearch", label: "OpenSearch", icon: Wifi },
    { key: "email", label: "SMTP Email", icon: Globe },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Monitoring</h2>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading system data...</div>
      ) : (
        <div className="space-y-6">
          {/* Service Status */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><Server className="h-4 w-4 text-blue-400" /> Service Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {health && services.map((svc) => {
                const s = health[svc.key];
                const connected = s?.status === "connected";
                return (
                  <div key={svc.key} className={`rounded-xl border p-4 text-center ${connected ? "border-green-800 bg-green-900/20" : "border-red-800 bg-red-900/20"}`}>
                    <svc.icon className={`mx-auto h-6 w-6 mb-2 ${connected ? "text-green-400" : "text-red-400"}`} />
                    <p className={`text-sm font-medium ${connected ? "text-green-400" : "text-red-400"}`}>{svc.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{connected ? `${s.latencyMs ?? 0}ms` : "Disconnected"}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Metrics */}
          {info && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard icon={Clock} label="Uptime" value={formatUptime(info.uptime)} />
                <MetricCard icon={Activity} label="Process ID" value={String(info.pid)} />
                <MetricCard icon={BarChart3} label="Heap Used" value={info.memory.heapUsed} />
                <MetricCard icon={BarChart3} label="RSS Memory" value={info.memory.rss} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">System Info</h3>
                  <div className="space-y-2">
                    <InfoRow label="Extora Version" value={`v${info.version}`} />
                    <InfoRow label="Node.js" value={info.nodeVersion} />
                    <InfoRow label="Platform" value={info.platform} />
                    <InfoRow label="Architecture" value="x64" />
                    <InfoRow label="Heap Total" value={info.memory.heapTotal} />
                  </div>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Memory Usage</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Heap Used</span><span>{info.memory.heapUsed}</span></div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: "45%" }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Heap Total</span><span>{info.memory.heapTotal}</span></div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: "60%" }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1"><span>RSS</span><span>{info.memory.rss}</span></div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: "35%" }} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
      <div className="flex items-center gap-2 text-sm text-gray-400"><Icon className="h-4 w-4" /> {label}</div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between"><span className="text-sm text-gray-400">{label}</span><span className="text-sm text-white">{value}</span></div>
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
