import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Download, Upload, Database, FileJson, Shield, Clock, Package } from "lucide-react";

export default function BackupsPage() {
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState("");
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("extora_last_backup");
    if (t) setLastBackup(t);
  }, []);

  const exportData = async (type: string) => {
    setExporting(true); setMsg("");
    try {
      const urls: Record<string, string> = {
        products: "/commerce/products",
        content: "/content",
        media: "/media",
        settings: "/theme/settings",
        categories: "/commerce/categories",
        brands: "/commerce/brands",
        tags: "/commerce/tags",
      };

      const results: Record<string, unknown> = { exportedAt: new Date().toISOString(), type: "extora-backup" };

      if (type === "full") {
        for (const [key, url] of Object.entries(urls)) {
          try { const { data } = await apiClient.get(url); results[key] = data.data ?? data; } catch { results[key] = []; }
        }
      } else {
        const url = urls[type] ?? "/commerce/products";
        try { const { data } = await apiClient.get(url); results[type] = data.data ?? data; } catch { results[type] = []; }
      }

      const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `extora-${type}-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);

      const now = new Date().toLocaleString();
      localStorage.setItem("extora_last_backup", now);
      setLastBackup(now);
      setMsg(`${type} backup downloaded`);
    } catch { setMsg("Export failed"); }
    finally { setExporting(false); setTimeout(() => setMsg(""), 3000); }
  };

  const restoreBackup = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setExporting(true); setMsg("");

      try {
        const text = await file.text();
        const backup = JSON.parse(text) as Record<string, unknown>;

        if (backup.type !== "extora-backup") {
          setMsg("Invalid backup file");
          return;
        }

        let restored = 0;
        if (Array.isArray(backup.products)) {
          for (const p of backup.products as Record<string, unknown>[]) {
            try { await apiClient.post("/commerce/products", p); restored++; } catch { /* skip */ }
          }
        }
        if (Array.isArray(backup.content)) {
          for (const c of backup.content as Record<string, unknown>[]) {
            try { await apiClient.post("/content", c); restored++; } catch { /* skip */ }
          }
        }

        const now = new Date().toLocaleString();
        localStorage.setItem("extora_last_backup", now);
        setLastBackup(now);
        setMsg(`Restored ${restored} items`);
      } catch { setMsg("Restore failed"); }
      finally { setExporting(false); setTimeout(() => setMsg(""), 4000); }
    };
    input.click();
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Backups</h2>

      {msg && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.includes("fail") ? "border-red-800 bg-red-900/20 text-red-400" : "border-green-800 bg-green-900/20 text-green-400"}`}>
          {msg}
        </div>
      )}

      {/* Last Backup Info */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Last Backup</p>
            <p className="text-lg font-semibold text-white">{lastBackup ?? "Never"}</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Export Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <BackupCard
            icon={Package}
            title="Full Site Backup"
            desc="Products, content, settings, media"
            color="blue"
            disabled={exporting}
            onClick={() => { void exportData("full"); }}
          />
          <BackupCard
            icon={Database}
            title="Products Only"
            desc="All products with categories, brands, tags"
            color="green"
            disabled={exporting}
            onClick={() => { void exportData("products"); }}
          />
          <BackupCard
            icon={FileJson}
            title="Content Only"
            desc="Pages, blog posts, content entries"
            color="purple"
            disabled={exporting}
            onClick={() => { void exportData("content"); }}
          />
          <BackupCard
            icon={Shield}
            title="Settings Only"
            desc="Theme settings, system config"
            color="yellow"
            disabled={exporting}
            onClick={() => { void exportData("settings"); }}
          />
          <BackupCard
            icon={FileJson}
            title="Categories & Taxonomies"
            desc="Categories, brands, tags"
            color="pink"
            disabled={exporting}
            onClick={() => { void exportData("categories"); }}
          />
          <BackupCard
            icon={Database}
            title="Media Library"
            desc="All uploaded media files metadata"
            color="orange"
            disabled={exporting}
            onClick={() => { void exportData("media"); }}
          />
        </div>
      </div>

      {/* Restore */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Restore Backup</h3>
        <p className="text-xs text-gray-500 mb-4">Import a previously exported Extora backup file (.json). Products and content will be recreated.</p>
        <button
          onClick={restoreBackup}
          disabled={exporting}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-all active:scale-95"
        >
          <Upload className="h-4 w-4" /> {exporting ? "Restoring..." : "Restore from File"}
        </button>
      </div>
    </div>
  );
}

function BackupCard({ icon: Icon, title, desc, color, disabled, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; desc: string; color: string;
  disabled: boolean; onClick: () => void;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30",
    green: "bg-green-600/20 text-green-400 hover:bg-green-600/30",
    purple: "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30",
    yellow: "bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30",
    pink: "bg-pink-600/20 text-pink-400 hover:bg-pink-600/30",
    orange: "bg-orange-600/20 text-orange-400 hover:bg-orange-600/30",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-xl border border-gray-800 p-4 text-left transition-all disabled:opacity-50 active:scale-[0.98] ${colorMap[color] ?? colorMap.blue}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <Download className="h-4 w-4 ml-auto mt-2 opacity-50" />
    </button>
  );
}
