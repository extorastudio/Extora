import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Activity, BarChart3, Clock } from "lucide-react";

interface SystemInfo {
  version: string;
  nodeVersion: string;
  platform: string;
  pid: number;
  uptime: number;
  memory: { heapUsed: string; heapTotal: string; rss: string };
}

export default function MonitoringPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const { data } = await apiClient.get("/system/info");
        setInfo(data);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchInfo();
  }, []);

  const uptimeFormatted = info ? formatUptime(info.uptime) : "—";

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Monitoring</h2>
      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading metrics...</div>
      ) : info ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={Clock} label="Uptime" value={uptimeFormatted} />
            <MetricCard icon={Activity} label="Process ID" value={String(info.pid)} />
            <MetricCard icon={BarChart3} label="Heap Used" value={info.memory.heapUsed} />
            <MetricCard icon={BarChart3} label="RSS Memory" value={info.memory.rss} />
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="mb-4 font-medium text-white">System Information</h3>
            <div className="space-y-2">
              <InfoRow label="Extora Version" value={`v${info.version}`} />
              <InfoRow label="Node.js" value={info.nodeVersion} />
              <InfoRow label="Platform" value={info.platform} />
              <InfoRow label="Heap Total" value={info.memory.heapTotal} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${String(d)}d ${String(h)}h ${String(m)}m`;
  if (h > 0) return `${String(h)}h ${String(m)}m`;
  return `${String(m)}m`;
}
