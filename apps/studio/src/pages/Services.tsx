import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Database, Cpu, HardDrive, Search, Mail, CheckCircle, XCircle } from "lucide-react";

interface ServiceStatus {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "connected" | "disconnected";
  latencyMs?: number;
  description: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const { data } = await apiClient.get("/system/health");
        const svc: ServiceStatus[] = [
          { name: "PostgreSQL", icon: Database, status: data.services?.database?.status ?? "disconnected", latencyMs: data.services?.database?.latencyMs, description: "Primary database" },
          { name: "Redis", icon: Cpu, status: data.services?.redis?.status ?? "disconnected", latencyMs: data.services?.redis?.latencyMs, description: "Cache & queue" },
          { name: "Storage", icon: HardDrive, status: data.services?.storage?.status ?? "disconnected", latencyMs: data.services?.storage?.latencyMs, description: "Object storage (MinIO/S3)" },
          { name: "Search", icon: Search, status: data.services?.opensearch?.status ?? "disconnected", latencyMs: data.services?.opensearch?.latencyMs, description: "OpenSearch" },
          { name: "Email", icon: Mail, status: data.services?.email?.status ?? "disconnected", latencyMs: data.services?.email?.latencyMs, description: "SMTP mail service" },
        ];
        setServices(svc);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchHealth();
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Services</h2>
      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Checking services...</div>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${svc.status === "connected" ? "bg-green-900/20" : "bg-red-900/20"}`}>
                <svc.icon className={`h-5 w-5 ${svc.status === "connected" ? "text-green-400" : "text-red-400"}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{svc.name}</p>
                <p className="text-sm text-gray-400">{svc.description}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-sm ${svc.status === "connected" ? "text-green-400" : "text-red-400"}`}>
                  {svc.status === "connected" ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {svc.status}
                </span>
                {svc.latencyMs !== undefined && (
                  <p className="text-xs text-gray-500">{svc.latencyMs}ms</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
