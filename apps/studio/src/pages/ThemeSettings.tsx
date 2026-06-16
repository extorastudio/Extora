import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Save, Download, Upload, RotateCcw } from "lucide-react";

interface ThemeSettings {
  siteName: string; siteTagline: string; logoUrl: string; faviconUrl: string;
  primaryColor: string; secondaryColor: string; bgColor: string; textColor: string;
  headerFont: string; bodyFont: string; baseFontSize: string;
  footerText: string; footerLayout: string;
  shopColumns: string; shopPerPage: string; shopSort: string;
  blogLayout: string; blogExcerpt: string;
  facebook: string; twitter: string; instagram: string; youtube: string; linkedin: string;
  gaId: string; fbPixel: string;
  customCss: string; customJs: string;
  maintenanceMode: boolean; maintenanceMsg: string;
  lazyLoad: boolean; minifyAssets: boolean;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  siteName: "My Extora Site", siteTagline: "Built with Extora", logoUrl: "", faviconUrl: "",
  primaryColor: "#1a1a2e", secondaryColor: "#16213e", bgColor: "#f8f9fa", textColor: "#1a1a2e",
  headerFont: "Inter, sans-serif", bodyFont: "Inter, sans-serif", baseFontSize: "16",
  footerText: "Powered by Extora", footerLayout: "4-column",
  shopColumns: "4", shopPerPage: "12", shopSort: "default",
  blogLayout: "grid", blogExcerpt: "55",
  facebook: "", twitter: "", instagram: "", youtube: "", linkedin: "",
  gaId: "", fbPixel: "",
  customCss: "", customJs: "",
  maintenanceMode: false, maintenanceMsg: "Site under maintenance. We'll be back soon!",
  lazyLoad: true, minifyAssets: true,
};

const PANELS: { id: string; label: string }[] = [
  { id: "general", label: "General" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "header", label: "Header & Footer" },
  { id: "shop", label: "Shop" },
  { id: "blog", label: "Blog" },
  { id: "social", label: "Social Profiles" },
  { id: "api", label: "API Integration" },
  { id: "code", label: "Custom CSS/JS" },
  { id: "performance", label: "Performance" },
  { id: "maintenance", label: "Maintenance" },
  { id: "tools", label: "Import/Export" },
];

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState("general");
  const [msg, setMsg] = useState("");

  useEffect(() => { void fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await apiClient.get("/theme/settings");
      setSettings({ ...DEFAULT_SETTINGS, ...(data.data ?? {}) as Partial<ThemeSettings> });
    } finally { setIsLoading(false); }
  };

  const update = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true); setMsg("");
    try {
      await apiClient.post("/theme/settings", { settings });
      setMsg("Settings saved!");
    } catch { setMsg("Save failed"); }
    finally { setSaving(false); setTimeout(() => { setMsg(""); }, 3000); }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "extora-theme-settings.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(ev.target?.result as string) }); setMsg("Imported!"); }
        catch { setMsg("Invalid file"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = async () => {
    if (!confirm("Reset ALL theme settings to defaults?")) return;
    try { await apiClient.post("/theme/reset", {}); setSettings(DEFAULT_SETTINGS); setMsg("Reset to defaults"); }
    catch { setMsg("Reset failed"); }
  };

  const field = (label: string, key: string, type = "text", opts?: Record<string, unknown>) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-400">{label}</label>
      {type === "color" ? (
        <div className="flex gap-2">
          <input type="color" value={String(settings[key as keyof ThemeSettings] ?? "")} onChange={(e) => { update(key, e.target.value); }} className="h-9 w-14 rounded border border-gray-700 bg-gray-800 cursor-pointer" />
          <input type="text" value={String(settings[key as keyof ThemeSettings] ?? "")} onChange={(e) => { update(key, e.target.value); }} className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white font-mono" />
        </div>
      ) : type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={Boolean(settings[key as keyof ThemeSettings])} onChange={(e) => { update(key, e.target.checked); }} className="rounded border-gray-600 bg-gray-800" /> {label}
        </label>
      ) : type === "textarea" ? (
        <textarea value={String(settings[key as keyof ThemeSettings] ?? "")} onChange={(e) => { update(key, e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white font-mono" rows={6} {...opts} />
      ) : type === "select" ? (
        <select value={String(settings[key as keyof ThemeSettings] ?? "")} onChange={(e) => { update(key, e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
          {(opts?.options as string[])?.map((o) => (<option key={o} value={o}>{o}</option>))}
        </select>
      ) : (
        <input type={type} value={String(settings[key as keyof ThemeSettings] ?? "")} onChange={(e) => { update(key, e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" {...opts} />
      )}
    </div>
  );

  if (isLoading) return <div className="py-12 text-center text-gray-400">Loading theme settings...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Theme Settings</h2>
        <div className="flex items-center gap-2">
          {msg && <span className="text-xs text-green-400">{msg}</span>}
          <button onClick={() => void saveSettings()} disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-6">
        {/* Panel Nav */}
        <div className="space-y-0.5">
          {PANELS.map((p) => (
            <button key={p.id} onClick={() => { setActivePanel(p.id); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activePanel === p.id ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          {/* General */}
          {activePanel === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Site Name", "siteName")}
              {field("Site Tagline", "siteTagline")}
              {field("Logo URL", "logoUrl")}
              {field("Favicon URL", "faviconUrl")}
            </div>
          )}

          {/* Colors */}
          {activePanel === "colors" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Primary Color", "primaryColor", "color")}
              {field("Secondary Color", "secondaryColor", "color")}
              {field("Background Color", "bgColor", "color")}
              {field("Text Color", "textColor", "color")}
              <div className="col-span-2 p-4 rounded-lg border border-gray-700" style={{ background: settings.bgColor }}>
                <p style={{ color: settings.textColor, fontFamily: settings.bodyFont }}>Preview Text — Lorem ipsum dolor sit amet.</p>
                <button className="mt-3 px-4 py-2 rounded-lg text-white text-sm" style={{ background: settings.primaryColor }}>Primary Button</button>
                <button className="mt-3 ml-3 px-4 py-2 rounded-lg text-white text-sm" style={{ background: settings.secondaryColor }}>Secondary Button</button>
              </div>
            </div>
          )}

          {/* Typography */}
          {activePanel === "typography" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Header Font", "headerFont", "select", { options: ["Inter, sans-serif", "Georgia, serif", "system-ui, sans-serif", "Roboto, sans-serif", "Poppins, sans-serif"] })}
              {field("Body Font", "bodyFont", "select", { options: ["Inter, sans-serif", "Georgia, serif", "system-ui, sans-serif", "Roboto, sans-serif", "Poppins, sans-serif"] })}
              {field("Base Font Size (px)", "baseFontSize", "number")}
            </div>
          )}

          {/* Header & Footer */}
          {activePanel === "header" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Footer Copyright Text", "footerText")}
              {field("Footer Layout", "footerLayout", "select", { options: ["1-column", "2-column", "3-column", "4-column"] })}
            </div>
          )}

          {/* Shop */}
          {activePanel === "shop" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {field("Products Per Page", "shopPerPage", "number")}
              {field("Default Columns", "shopColumns", "select", { options: ["2", "3", "4", "5"] })}
              {field("Default Sort", "shopSort", "select", { options: ["default", "price-asc", "price-desc", "newest", "rating"] })}
            </div>
          )}

          {/* Blog */}
          {activePanel === "blog" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Blog Layout", "blogLayout", "select", { options: ["grid", "list", "masonry"] })}
              {field("Excerpt Length (words)", "blogExcerpt", "number")}
            </div>
          )}

          {/* Social */}
          {activePanel === "social" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Facebook URL", "facebook")}
              {field("Twitter URL", "twitter")}
              {field("Instagram URL", "instagram")}
              {field("YouTube URL", "youtube")}
              {field("LinkedIn URL", "linkedin")}
            </div>
          )}

          {/* API */}
          {activePanel === "api" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("Google Analytics ID", "gaId", "text", { placeholder: "G-XXXXXXXXXX" })}
              {field("Facebook Pixel ID", "fbPixel", "text", { placeholder: "1234567890" })}
            </div>
          )}

          {/* Custom CSS/JS */}
          {activePanel === "code" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Custom CSS</label>
                <textarea value={settings.customCss} onChange={(e) => { update("customCss", e.target.value); }} className="w-full min-h-[150px] rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-green-400 font-mono" placeholder="/* Add your custom CSS */" spellCheck={false} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Custom JavaScript</label>
                <textarea value={settings.customJs} onChange={(e) => { update("customJs", e.target.value); }} className="w-full min-h-[150px] rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-yellow-400 font-mono" placeholder="// Add your custom JS" spellCheck={false} />
              </div>
            </div>
          )}

          {/* Performance */}
          {activePanel === "performance" && (
            <div className="space-y-3">
              {field("Enable Lazy Loading", "lazyLoad", "checkbox")}
              {field("Minify Assets", "minifyAssets", "checkbox")}
            </div>
          )}

          {/* Maintenance */}
          {activePanel === "maintenance" && (
            <div className="space-y-4">
              {field("Enable Maintenance Mode", "maintenanceMode", "checkbox")}
              {settings.maintenanceMode && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Maintenance Message</label>
                  <textarea value={settings.maintenanceMsg} onChange={(e) => { update("maintenanceMsg", e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" rows={3} />
                </div>
              )}
            </div>
          )}

          {/* Import / Export */}
          {activePanel === "tools" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button onClick={handleExport} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                  <Download className="h-4 w-4" /> Export Settings
                </button>
                <button onClick={handleImport} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Upload className="h-4 w-4" /> Import Settings
                </button>
                <button onClick={() => void handleReset()} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                  <RotateCcw className="h-4 w-4" /> Reset to Defaults
                </button>
              </div>
              <p className="text-xs text-gray-500">Export saves current settings as JSON. Import loads from a previously exported file. Reset restores factory defaults.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
