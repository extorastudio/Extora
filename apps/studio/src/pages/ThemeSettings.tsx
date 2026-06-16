import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Save, Download, Upload, RotateCcw, Eye, Palette, Type, Layout, ShoppingBag, Globe, Code, Shield } from "lucide-react";

interface ThemeSettings {
  siteName: string; siteTagline: string; logoUrl: string; faviconUrl: string;
  primaryColor: string; accentColor: string; bgColor: string; textColor: string; linkColor: string;
  headerFont: string; bodyFont: string; baseFontSize: string; headingWeight: string;
  headerStyle: string; headerSticky: boolean; headerSearch: boolean; headerCart: boolean;
  footerLayout: string; footerText: string; footerBg: string;
  productColumns: string; productGap: string; productImageHeight: string; productHover: string;
  showRating: boolean; showBadge: boolean; showQuickView: boolean;
  shopPerPage: string; shopSort: string;
  customCss: string; customJs: string;
  facebook: string; twitter: string; instagram: string; youtube: string;
  gaId: string; fbPixel: string;
  maintenanceMode: boolean; maintenanceMsg: string;
}

const DEFAULT: ThemeSettings = {
  siteName: "Extora Shop", siteTagline: "Great products, great prices", logoUrl: "", faviconUrl: "",
  primaryColor: "#131921", accentColor: "#febd69", bgColor: "#eaeded", textColor: "#0f1111", linkColor: "#007185",
  headerFont: "Arial, sans-serif", bodyFont: "Arial, sans-serif", baseFontSize: "16", headingWeight: "700",
  headerStyle: "dark", headerSticky: true, headerSearch: true, headerCart: true,
  footerLayout: "4-col", footerText: "Powered by Extora", footerBg: "#232f3e",
  productColumns: "4", productGap: "16", productImageHeight: "220", productHover: "shadow",
  showRating: true, showBadge: true, showQuickView: false,
  shopPerPage: "12", shopSort: "default",
  customCss: "", customJs: "",
  facebook: "", twitter: "", instagram: "", youtube: "",
  gaId: "", fbPixel: "",
  maintenanceMode: false, maintenanceMsg: "Under maintenance. We'll be back soon!",
};

const PANELS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "Site Identity", icon: Globe },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "header", label: "Header", icon: Layout },
  { id: "footer", label: "Footer", icon: Layout },
  { id: "products", label: "Product Display", icon: ShoppingBag },
  { id: "code", label: "Custom CSS/JS", icon: Code },
  { id: "social", label: "Social & API", icon: Globe },
  { id: "maintenance", label: "Maintenance", icon: Shield },
  { id: "tools", label: "Import/Export", icon: Upload },
];

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState("general");
  const [msg, setMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { void fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await apiClient.get("/theme/settings");
      setSettings({ ...DEFAULT, ...(data.data ?? {}) as Partial<ThemeSettings> });
    } finally { setIsLoading(false); }
  };

  const update = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true); setMsg("");
    try { await apiClient.post("/theme/settings", { settings }); setMsg("All settings saved!"); }
    catch { setMsg("Save failed"); }
    finally { setSaving(false); setTimeout(() => { setMsg(""); }, 3000); }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "extora-theme.json"; a.click();
  };

  const handleImport = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { try { setSettings({ ...DEFAULT, ...JSON.parse(ev.target?.result as string) }); setMsg("Imported!"); } catch { setMsg("Invalid file"); } };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => { if (confirm("Reset all?")) { setSettings(DEFAULT); setMsg("Reset to defaults"); } };

  const f = (label: string, key: string, type = "text", extra?: Record<string, unknown>) => {
    const val = settings[key as keyof ThemeSettings];
    return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-300 uppercase tracking-wide">{label}</label>
        {type === "color" ? (
          <div className="flex gap-2 items-center">
            <input type="color" value={String(val)} onChange={(e) => { update(key, e.target.value); }} className="h-10 w-12 rounded border border-gray-700 bg-gray-800 cursor-pointer" />
            <input type="text" value={String(val)} onChange={(e) => { update(key, e.target.value); }} className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white font-mono" />
          </div>
        ) : type === "switch" ? (
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`relative w-10 h-5 rounded-full transition-colors ${val ? "bg-blue-600" : "bg-gray-700"}`} onClick={() => { update(key, !val); }}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${val ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-gray-400">{label}</span>
          </label>
        ) : type === "select" ? (
          <select value={String(val)} onChange={(e) => { update(key, e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
            {(extra?.options as string[])?.map((o: string) => (<option key={o} value={o}>{o}</option>))}
          </select>
        ) : type === "textarea" ? (
          <textarea value={String(val)} onChange={(e) => { update(key, e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white font-mono" rows={6} {...extra} />
        ) : type === "number" ? (
          <input type="number" value={Number(val)} onChange={(e) => { update(key, e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" {...extra} />
        ) : (
          <input type="text" value={String(val)} onChange={(e) => { update(key, e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" {...extra} />
        )}
      </div>
    );
  };


  if (isLoading) return <div className="py-12 text-center text-gray-400">Loading theme settings...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Theme Settings</h2>
        <div className="flex items-center gap-2">
          {msg && <span className="text-xs text-green-400">{msg}</span>}
          <button onClick={() => { setShowPreview(!showPreview); }} className="flex items-center gap-1 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
          <button onClick={() => void saveSettings()} disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-0.5">
          {PANELS.map((p) => (
            <button key={p.id} onClick={() => { setActivePanel(p.id); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activePanel === p.id ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"}`}>
              <p.icon className="h-4 w-4" /> {p.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
            {activePanel === "general" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Site Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {f("Site Name", "siteName")}
                  {f("Tagline", "siteTagline")}
                  {f("Logo URL", "logoUrl", "text", { placeholder: "/storage/extora/uploads/logo.png" })}
                  {f("Favicon URL", "faviconUrl")}
                </div>
              </>
            )}

            {activePanel === "colors" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Color Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {f("Primary (Header)", "primaryColor", "color")}
                  {f("Accent (Buttons)", "accentColor", "color")}
                  {f("Background", "bgColor", "color")}
                  {f("Text Color", "textColor", "color")}
                  {f("Link Color", "linkColor", "color")}
                  {f("Footer BG", "footerBg", "color")}
                </div>
                <div className="p-4 rounded-lg border border-gray-700 space-y-1.5" style={{ background: settings.bgColor }}>
                  <div className="flex items-center justify-between p-2 rounded" style={{ background: settings.primaryColor }}>
                    <span className="text-sm font-bold" style={{ color: settings.accentColor }}>extora.shop</span>
                    <span className="text-xs" style={{ color: "white" }}>Header Preview</span>
                  </div>
                  <div className="p-2">
                    <p style={{ color: settings.textColor, fontFamily: settings.bodyFont }}>Sample content text — {settings.siteTagline}</p>
                    <a href="##" style={{ color: settings.linkColor, fontSize: "14px" }}>Sample link →</a>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 rounded text-xs text-white" style={{ background: settings.accentColor }}>Button</span>
                  </div>
                </div>
              </>
            )}

            {activePanel === "typography" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {f("Header Font", "headerFont", "select", { options: ["Arial, sans-serif", "Georgia, serif", "Inter, sans-serif", "Roboto, sans-serif", "Poppins, sans-serif", "Playfair Display, serif"] })}
                  {f("Body Font", "bodyFont", "select", { options: ["Arial, sans-serif", "Georgia, serif", "Inter, sans-serif", "Roboto, sans-serif", "Poppins, sans-serif", "Playfair Display, serif"] })}
                  {f("Base Font Size (px)", "baseFontSize", "number")}
                  {f("Heading Weight", "headingWeight", "select", { options: ["400", "500", "600", "700", "800", "900"] })}
                </div>
                <div className="p-4 rounded-lg border border-gray-700" style={{ backgroundColor: settings.bgColor }}>
                  <h2 style={{ fontFamily: settings.headerFont, fontWeight: settings.headingWeight, color: settings.textColor, fontSize: "1.5rem" }}>Heading Sample</h2>
                  <p style={{ fontFamily: settings.bodyFont, color: settings.textColor, fontSize: `${settings.baseFontSize}px`, marginTop: "8px" }}>Body text sample. The quick brown fox jumps over the lazy dog. This shows your chosen font and size settings.</p>
                  <p style={{ fontFamily: settings.bodyFont, color: settings.linkColor, fontSize: "14px", marginTop: "8px" }}>Link example →</p>
                </div>
              </>
            )}

            {activePanel === "header" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Header Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {f("Header Style", "headerStyle", "select", { options: ["dark", "light", "transparent", "gradient"] })}
                  {f("Enable Search Bar", "headerSearch", "switch")}
                  {f("Show Cart Icon", "headerCart", "switch")}
                  {f("Sticky Header", "headerSticky", "switch")}
                </div>
                <div className="p-3 rounded-lg mt-2" style={{ background: settings.headerStyle === "light" ? "white" : settings.primaryColor }}>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold" style={{ color: settings.headerStyle === "light" ? settings.primaryColor : settings.accentColor }}>extora</span>
                    {settings.headerSearch && <div className="flex-1 h-8 rounded bg-white/20" />}
                    {settings.headerCart && <span style={{ color: settings.headerStyle === "light" ? settings.textColor : "white" }}>Cart</span>}
                  </div>
                </div>
              </>
            )}

            {activePanel === "footer" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Footer Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {f("Layout", "footerLayout", "select", { options: ["1-col", "2-col", "3-col", "4-col"] })}
                  {f("Copyright Text", "footerText")}
                  {f("Background Color", "footerBg", "color")}
                </div>
                <div className="p-4 rounded-lg mt-2 text-center" style={{ background: settings.footerBg }}>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${settings.footerLayout.split("-")[0]}, 1fr)` }}>
                    {Array.from({ length: Number(settings.footerLayout.split("-")[0]) }).map((_, i) => (
                      <div key={i}><div className="h-3 w-20 rounded bg-white/10 mb-2 mx-auto" /><div className="h-2 w-16 rounded bg-white/5 mx-auto" /></div>
                    ))}
                  </div>
                  <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.6)" }}>{settings.footerText}</p>
                </div>
              </>
            )}

            {activePanel === "products" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Product Display</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-300 uppercase tracking-wide">Desktop Columns</label>
                    <div className="flex gap-2">
                      {["2","3","4","5","6"].map((n) => (
                        <button key={n} onClick={() => { update("productColumns", n); }} className={`w-10 h-10 rounded-lg text-sm font-medium ${settings.productColumns === n ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{n}</button>
                      ))}
                    </div>
                  </div>
                  {f("Image Height (px)", "productImageHeight", "number")}
                  {f("Gap (px)", "productGap", "number")}
                  {f("Hover Effect", "productHover", "select", { options: ["shadow", "zoom", "border", "none"] })}
                  {f("Show Star Rating", "showRating", "switch")}
                  {f("Show Sale Badge", "showBadge", "switch")}
                  {f("Show Quick View", "showQuickView", "switch")}
                  {f("Products Per Page", "shopPerPage", "number")}
                  {f("Default Sort", "shopSort", "select", { options: ["default", "price-asc", "price-desc", "newest", "rating", "bestselling"] })}
                </div>
              </>
            )}

            {activePanel === "code" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Custom Code</h3>
                {f("Custom CSS", "customCss", "textarea", { placeholder: "/* Add your CSS here */", style: { color: "#86efac" } })}
                {f("Custom JavaScript", "customJs", "textarea", { placeholder: "// Add your JS here", style: { color: "#fde047" } })}
              </>
            )}

            {activePanel === "social" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Social & Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {f("Facebook URL", "facebook")}
                  {f("Twitter URL", "twitter")}
                  {f("Instagram URL", "instagram")}
                  {f("YouTube URL", "youtube")}
                  {f("Google Analytics ID", "gaId", "text", { placeholder: "G-XXXXXXXXXX" })}
                  {f("Facebook Pixel ID", "fbPixel", "text", { placeholder: "1234567890" })}
                </div>
              </>
            )}

            {activePanel === "maintenance" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Maintenance Mode</h3>
                {f("Enable Maintenance Mode", "maintenanceMode", "switch")}
                {settings.maintenanceMode && f("Message", "maintenanceMsg", "textarea")}
              </>
            )}

            {activePanel === "tools" && (
              <>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Import / Export / Reset</h3>
                <p className="text-xs text-gray-500 mb-4">Export saves all settings as JSON. Import loads from file. Reset restores defaults.</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleExport} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"><Download className="h-4 w-4" /> Export</button>
                  <button onClick={handleImport} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Upload className="h-4 w-4" /> Import</button>
                  <button onClick={handleReset} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"><RotateCcw className="h-4 w-4" /> Reset Defaults</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
