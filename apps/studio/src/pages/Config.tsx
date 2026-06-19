import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Settings, Shield, Database, Globe, HardDrive, RefreshCw, Save } from "lucide-react";

export default function ConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await apiClient.get("/config");
        setConfig(data as Record<string, string>);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    void fetch();
  }, []);

  const sections = [
    {
      title: "System", icon: Settings,
      keys: ["NODE_ENV", "PORT", "LOG_LEVEL", "CORS_ORIGIN", "STORAGE_BACKEND"],
    },
    {
      title: "Security", icon: Shield,
      keys: ["SESSION_TTL", "REFRESH_TOKEN_TTL", "JWT_SECRET", "ENCRYPTION_KEY"],
    },
    {
      title: "Database", icon: Database,
      keys: ["DATABASE_URL"],
    },
    {
      title: "Services", icon: Globe,
      keys: ["REDIS_URL", "OPENSEARCH_URL", "SMTP_HOST", "SMTP_PORT"],
    },
    {
      title: "Storage", icon: HardDrive,
      keys: ["S3_ENDPOINT", "S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY", "S3_FORCE_PATH_STYLE"],
    },
  ];

  const handleExport = () => {
    const safe: Record<string, string> = {};
    for (const [k, v] of Object.entries(config)) {
      safe[k] = k.includes("SECRET") || k.includes("KEY") || k.includes("PASSWORD") ? "********" : v;
    }
    const blob = new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "extora-config.json"; a.click();
    URL.revokeObjectURL(a.href);
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Configuration</h2>
        <div className="py-12 text-center text-gray-400">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Configuration</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Save className="h-4 w-4" /> Export Config
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-800 bg-gray-900/50">
              <section.icon className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-800/50">
              {section.keys.map((key) => {
                const value = config[key] ?? "—";
                const isSecret = key.includes("SECRET") || key.includes("KEY") || key.includes("PASSWORD");
                return (
                  <div key={key} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-gray-400 font-mono">{key}</span>
                    <span className={`text-sm font-mono ${isSecret ? "text-gray-600" : "text-white"}`}>
                      {isSecret ? "••••••••" : value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
