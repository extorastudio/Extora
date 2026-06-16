import { useEffect, useState } from "react";
import apiClient from "../api/client";
import {
  Save, Download, Upload as UploadIcon, RotateCcw, Check,
  Palette, Type, Layout, ShoppingBag, Globe, Code, Shield
} from "lucide-react";
import { PageSkeleton } from "../components/ui/Skeleton";

interface Settings {
  siteName: string; siteTagline: string; logoUrl: string; faviconUrl: string;
  primaryColor: string; accentColor: string; bgColor: string; textColor: string; linkColor: string;
  headerFont: string; bodyFont: string; baseFontSize: string;
  headerStyle: string; headerSticky: boolean; headerSearch: boolean; headerCart: boolean;
  footerLayout: string; footerText: string; footerBg: string;
  productColumns: string; productImageHeight: string; productHover: string;
  showRating: boolean; showBadge: boolean;
  shopPerPage: string; shopSort: string;
  customCss: string; customJs: string;
  facebook: string; twitter: string; instagram: string;
  gaId: string; fbPixel: string;
  maintenanceMode: boolean; maintenanceMsg: string;
};

const DEFAULTS: Settings = {
  siteName: "Extora Shop", siteTagline: "Great products, great prices", logoUrl: "", faviconUrl: "",
  primaryColor: "#131921", accentColor: "#febd69", bgColor: "#eaeded", textColor: "#0f1111", linkColor: "#007185",
  headerFont: "Arial, sans-serif", bodyFont: "Arial, sans-serif", baseFontSize: "16",
  headerStyle: "dark", headerSticky: true, headerSearch: true, headerCart: true,
  footerLayout: "4-col", footerText: "Powered by Extora", footerBg: "#232f3e",
  productColumns: "4", productImageHeight: "220", productHover: "shadow",
  showRating: true, showBadge: true,
  shopPerPage: "12", shopSort: "default",
  customCss: "", customJs: "",
  facebook: "", twitter: "", instagram: "",
  gaId: "", fbPixel: "",
  maintenanceMode: false, maintenanceMsg: "Under maintenance.",
};

const FONTS = ["Arial, sans-serif", "Inter, sans-serif", "Georgia, serif", "Roboto, sans-serif", "Poppins, sans-serif", "Playfair Display, serif"];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${on ? "bg-blue-600" : "bg-gray-600"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-9 w-9 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-colors" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none" />
    </div>
  );
}

export default function ThemeSettingsPage() {
  const [s, ss] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("brand");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiClient.get("/theme/settings")
      .then(({ data }) => ss({ ...DEFAULTS, ...(data.data ?? {}) as Partial<Settings> }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try { await apiClient.post("/theme/settings", { settings: s }); setMsg("Saved!"); }
    catch { setMsg("Failed"); }
    setSaving(false);
    setTimeout(() => setMsg(""), 2500);
  };

  const exp = () => { const b = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "theme.json"; a.click(); };
  const imp = () => { const i = document.createElement("input"); i.type = "file"; i.accept = ".json"; i.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { try { ss({ ...DEFAULTS, ...JSON.parse(ev.target?.result as string) }); setMsg("Imported!"); } catch { setMsg("Invalid"); } }; r.readAsText(f); }; i.click(); };

  const tabs: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "brand", label: "Brand", icon: Globe },
    { id: "colors", label: "Colors", icon: Palette },
    { id: "fonts", label: "Typography", icon: Type },
    { id: "layout", label: "Header & Footer", icon: Layout },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "code", label: "Custom Code", icon: Code },
    { id: "tools", label: "Tools", icon: Shield },
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Theme Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Customize every aspect of your storefront</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="flex items-center gap-1 text-sm text-green-400"><Check className="h-4 w-4" /> {msg}</span>}
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-gray-900 border border-gray-800 w-fit overflow-x-auto max-w-full">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── BRAND ── */}
      {tab === "brand" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Globe className="h-4 w-4 text-blue-400" /> Site Identity</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Site Name</label><input type="text" value={s.siteName} onChange={(e) => ss({ ...s, siteName: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tagline</label><input type="text" value={s.siteTagline} onChange={(e) => ss({ ...s, siteTagline: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Logo URL</label><input type="text" value={s.logoUrl} onChange={(e) => ss({ ...s, logoUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="/storage/uploads/logo.png" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Favicon URL</label><input type="text" value={s.faviconUrl} onChange={(e) => ss({ ...s, faviconUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            </div>
          </div>
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Globe className="h-4 w-4 text-green-400" /> Social & Analytics</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Facebook</label><input type="text" value={s.facebook} onChange={(e) => ss({ ...s, facebook: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Twitter / X</label><input type="text" value={s.twitter} onChange={(e) => ss({ ...s, twitter: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Instagram</label><input type="text" value={s.instagram} onChange={(e) => ss({ ...s, instagram: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Google Analytics ID</label><input type="text" value={s.gaId} onChange={(e) => ss({ ...s, gaId: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="G-XXXXXXXXXX" /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Facebook Pixel ID</label><input type="text" value={s.fbPixel} onChange={(e) => ss({ ...s, fbPixel: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            </div>
          </div>
        </div>
      )}

      {/* ── COLORS ── */}
      {tab === "colors" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6">
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Palette className="h-4 w-4 text-pink-400" /> Color Palette</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Primary (Header)</label><ColorInput value={s.primaryColor} onChange={(v) => ss({ ...s, primaryColor: v })} /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Accent (Buttons)</label><ColorInput value={s.accentColor} onChange={(v) => ss({ ...s, accentColor: v })} /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Background</label><ColorInput value={s.bgColor} onChange={(v) => ss({ ...s, bgColor: v })} /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Text</label><ColorInput value={s.textColor} onChange={(v) => ss({ ...s, textColor: v })} /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Links</label><ColorInput value={s.linkColor} onChange={(v) => ss({ ...s, linkColor: v })} /></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Footer BG</label><ColorInput value={s.footerBg} onChange={(v) => ss({ ...s, footerBg: v })} /></div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-800">
            <div className="flex items-center px-4 py-3 gap-2" style={{ background: s.primaryColor }}>
              <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400/60" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" /><div className="w-2.5 h-2.5 rounded-full bg-green-400/60" /></div>
              <span className="text-xs text-white/60 ml-2">Preview</span>
            </div>
            <div style={{ background: s.bgColor }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ background: s.primaryColor }}>
                <span className="font-bold" style={{ color: s.accentColor }}>extora.shop</span>
                <span className="text-xs text-white/70">Cart</span>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm font-medium" style={{ color: s.textColor, fontFamily: s.bodyFont }}>{s.siteTagline}</p>
                <p className="text-xs" style={{ color: s.linkColor }}>Shop Now →</p>
                <div className="flex gap-2 mt-3">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: s.accentColor, color: "#fff" }}>Add to Cart</span>
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: s.accentColor, color: s.accentColor }}>Details</span>
                </div>
              </div>
              <div className="px-5 py-3" style={{ background: s.footerBg }}>
                <p className="text-xs text-center text-white/60">{s.footerText}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TYPOGRAPHY ── */}
      {tab === "fonts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Type className="h-4 w-4 text-yellow-400" /> Typography</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Heading Font</label><select value={s.headerFont} onChange={(e) => ss({ ...s, headerFont: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none">{FONTS.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Body Font</label><select value={s.bodyFont} onChange={(e) => ss({ ...s, bodyFont: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none">{FONTS.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Base Size (px)</label><input type="number" value={s.baseFontSize} onChange={(e) => ss({ ...s, baseFontSize: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6" style={{ background: s.bgColor }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: s.textColor }}>Live Preview</h3>
            <div style={{ color: s.textColor }}>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: s.headerFont }}>The quick brown fox</h2>
              <p className="leading-relaxed mb-3" style={{ fontFamily: s.bodyFont, fontSize: `${s.baseFontSize}px` }}>Your body text will appear here. The quick brown fox jumps over the lazy dog. This shows how your content will look with the selected font, size, and color.</p>
              <p className="text-xs opacity-60" style={{ fontFamily: s.bodyFont }}>Caption text • Meta information</p>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER & FOOTER ── */}
      {tab === "layout" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Layout className="h-4 w-4 text-purple-400" /> Header</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Style</label>
              <div className="flex gap-2">
                {(["dark", "light", "gradient"] as const).map((v) => (
                  <button key={v} onClick={() => ss({ ...s, headerStyle: v })} className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${s.headerStyle === v ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{v}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Sticky Header</span><Toggle on={s.headerSticky} onChange={(v) => ss({ ...s, headerSticky: v })} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Search Bar</span><Toggle on={s.headerSearch} onChange={(v) => ss({ ...s, headerSearch: v })} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Cart Icon</span><Toggle on={s.headerCart} onChange={(v) => ss({ ...s, headerCart: v })} /></div>
            </div>
          </div>
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Layout className="h-4 w-4 text-purple-400" /> Footer</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Layout</label>
              <div className="flex gap-2">
                {(["1-col", "2-col", "3-col", "4-col"] as const).map((v) => (
                  <button key={v} onClick={() => ss({ ...s, footerLayout: v })} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${s.footerLayout === v ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{v}</button>
                ))}
              </div>
            </div>
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Copyright Text</label><input type="text" value={s.footerText} onChange={(e) => ss({ ...s, footerText: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Background</label><ColorInput value={s.footerBg} onChange={(v) => ss({ ...s, footerBg: v })} /></div>
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === "products" && (
        <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <h3 className="text-base font-semibold text-white flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-green-400" /> Product Display</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Desktop Columns</label>
              <div className="flex gap-1.5">
                {(["2","3","4","5","6"] as const).map((n) => (
                  <button key={n} onClick={() => ss({ ...s, productColumns: n })} className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${s.productColumns === n ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{n}</button>
                ))}
              </div>
            </div>
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Image Height (px)</label><input type="number" value={s.productImageHeight} onChange={(e) => ss({ ...s, productImageHeight: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Hover Effect</label>
              <div className="flex gap-1.5">
                {(["shadow", "zoom", "border", "none"] as const).map((v) => (
                  <button key={v} onClick={() => ss({ ...s, productHover: v })} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${s.productHover === v ? "bg-blue-600 text-white ring-1 ring-blue-400" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{v}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Star Ratings</span><Toggle on={s.showRating} onChange={(v) => ss({ ...s, showRating: v })} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Sale Badge</span><Toggle on={s.showBadge} onChange={(v) => ss({ ...s, showBadge: v })} /></div>
            </div>
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Per Page</label><input type="number" value={s.shopPerPage} onChange={(e) => ss({ ...s, shopPerPage: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Sort Order</label><select value={s.shopSort} onChange={(e) => ss({ ...s, shopSort: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"><option value="default">Default</option><option value="price-asc">Price: Low → High</option><option value="price-desc">Price: High → Low</option><option value="newest">Newest First</option><option value="rating">Top Rated</option></select></div>
          </div>
        </div>
      )}

      {/* ── CODE ── */}
      {tab === "code" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4"><Code className="h-4 w-4 text-green-400" /> Custom CSS</h3>
            <textarea value={s.customCss} onChange={(e) => ss({ ...s, customCss: e.target.value })} className="w-full h-72 bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-sm text-green-400 font-mono focus:border-blue-500 focus:outline-none resize-none" spellCheck={false} placeholder="/* Add your custom CSS */&#10;body {&#10;  /* Your styles here */&#10;}" />
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4"><Code className="h-4 w-4 text-yellow-400" /> Custom JavaScript</h3>
            <textarea value={s.customJs} onChange={(e) => ss({ ...s, customJs: e.target.value })} className="w-full h-72 bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-sm text-yellow-400 font-mono focus:border-blue-500 focus:outline-none resize-none" spellCheck={false} placeholder="// Add your custom JS&#10;console.log('Hello Extora!');" />
          </div>
        </div>
      )}

      {/* ── TOOLS ── */}
      {tab === "tools" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Shield className="h-4 w-4 text-red-400" /> Maintenance Mode</h3>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-300">Enable maintenance</span><Toggle on={s.maintenanceMode} onChange={(v) => ss({ ...s, maintenanceMode: v })} /></div>
            {s.maintenanceMode && <textarea value={s.maintenanceMsg} onChange={(e) => ss({ ...s, maintenanceMsg: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" rows={3} />}
          </div>
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" /> Import / Export / Reset</h3>
            <p className="text-sm text-gray-500">Export saves all settings as JSON. Import loads from a file. Reset restores factory defaults.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={exp} className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-all active:scale-95"><Download className="h-4 w-4" /> Export</button>
              <button onClick={imp} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all active:scale-95"><UploadIcon className="h-4 w-4" /> Import</button>
              <button onClick={() => { if (confirm("Reset all?")) ss(DEFAULTS); }} className="flex items-center gap-2 rounded-xl bg-red-600/20 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-600/30 transition-all active:scale-95"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
