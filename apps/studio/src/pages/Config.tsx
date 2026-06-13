import { Settings, Shield, Server } from "lucide-react";

interface ConfigItem {
  key: string;
  value: string;
  isSecret?: boolean;
}

const SECTIONS: { title: string; icon: React.ComponentType<{ className?: string }>; items: ConfigItem[] }[] = [
  {
    title: "General",
    icon: Settings,
    items: [
      { key: "NODE_ENV", value: "development" },
      { key: "PORT", value: "3000" },
      { key: "LOG_LEVEL", value: "info" },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    items: [
      { key: "SESSION_TTL", value: "15m" },
      { key: "REFRESH_TOKEN_TTL", value: "7d" },
      { key: "JWT_SECRET", value: "********", isSecret: true },
      { key: "ENCRYPTION_KEY", value: "********", isSecret: true },
    ],
  },
  {
    title: "Services",
    icon: Server,
    items: [
      { key: "DATABASE_URL", value: "postgresql://extora:***@localhost:5432/extora", isSecret: true },
      { key: "REDIS_URL", value: "redis://localhost:6379" },
      { key: "STORAGE_BACKEND", value: "local" },
    ],
  },
];

export default function ConfigPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Configuration</h2>
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-xl border border-gray-800 bg-gray-900">
            <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-3">
              <section.icon className="h-4 w-4 text-gray-400" />
              <h3 className="font-medium text-white">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-gray-400">{item.key}</span>
                  <span className={`font-mono text-sm ${item.isSecret ? "text-gray-500" : "text-white"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
