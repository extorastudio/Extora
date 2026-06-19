import React, { useEffect, useState } from "react";
import { Search, Save, X, Globe, Eye, EyeOff, CheckCircle, RefreshCw } from "lucide-react";

interface Product { id: string; name: string; slug: string; category: string; status: string; }
interface SeoMeta { resourceType: string; resourceId: string; title?: string; description?: string; keywords?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; noIndex?: boolean; }

export default function SeoSettingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [meta, setMeta] = useState<SeoMeta>({ resourceType: "product", resourceId: "" });
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [seoList, setSeoList] = useState<Record<string, SeoMeta>>({});

  const token = localStorage.getItem("at") ?? "";
  const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/commerce/products?status=published", { headers: H });
      const data = await res.json();
      const prods = (data.data ?? data.products ?? []) as Product[];
      setProducts(prods);

      // Fetch SEO meta for all products
      const metaMap: Record<string, SeoMeta> = {};
      for (const p of prods.slice(0, 50)) {
        try {
          const mr = await fetch(`/api/v1/seo/meta?resourceType=product&resourceId=${encodeURIComponent(p.slug)}`, { headers: H });
          const md = await mr.json();
          if (md.success && md.data) metaMap[p.slug] = md.data;
        } catch { /* skip */ }
      }
      setSeoList(metaMap);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { void fetchAll(); }, []);

  const openEditor = async (product: Product) => {
    setEditing(product);
    setMetaLoaded(false);
    setMeta({ resourceType: "product", resourceId: product.slug });
    try {
      const r = await fetch(`/api/v1/seo/meta?resourceType=product&resourceId=${encodeURIComponent(product.slug)}`, { headers: H });
      const d = await r.json();
      if (d.success && d.data) {
        setMeta({ resourceType: "product", resourceId: product.slug, ...d.data });
      }
    } catch { /* no meta yet */ }
    setMetaLoaded(true);
  };

  const saveMeta = async () => {
    setSaving(true); setMsg("");
    try {
      const r = await fetch("/api/v1/seo/meta", { method: "POST", headers: H, body: JSON.stringify(meta) });
      const d = await r.json();
      if (d.success) {
        setMsg("SEO meta saved successfully!");
        setSeoList((prev) => ({ ...prev, [meta.resourceId]: meta }));
        setTimeout(() => { setEditing(null); setMsg(""); }, 1500);
      } else {
        setMsg(`Error: ${d.message ?? "Unknown"}`);
      }
    } catch { setMsg("Network error"); }
    setSaving(false);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const hasMeta = (slug: string) => ((seoList[slug]?.title ?? seoList[slug]?.description) ?? "").length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Globe className="h-6 w-6 text-green-400" /> SEO Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Manage meta titles, descriptions, keywords and Open Graph tags for all pages</p>
        </div>
        <button onClick={() => void fetchAll()} className="flex items-center gap-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {msg && (
        <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${msg.includes("Error") ? "bg-red-900/30 text-red-300 border border-red-800" : "bg-green-900/30 text-green-300 border border-green-800"}`}>
          <CheckCircle className="h-4 w-4" /> {msg}
        </div>
      )}

      {/* Global SEO Defaults */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Global SEO Defaults</h3>
        <p className="text-xs text-gray-500 mb-3">These apply to all pages. Individual product SEO settings override these defaults.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Default Meta Title Template</label>
            <input type="text" defaultValue="%page_title% — %site_name%" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" readOnly />
            <span className="text-xs text-gray-600 mt-0.5 block">Uses: %page_title%, %site_name%, %category%</span>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Default Meta Description</label>
            <input type="text" defaultValue="Shop %category% products online at %site_name%. Best prices, fast delivery, easy returns." className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" readOnly />
          </div>
        </div>
      </div>

      {/* Product List + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-1 rounded-xl border border-gray-700 bg-gray-800/50 p-5">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..." className="w-full rounded-lg border border-gray-700 bg-gray-900 pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500" />
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filtered.map(p => (
              <button key={p.id} onClick={() => void openEditor(p)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between gap-2 transition-colors ${editing?.id === p.id ? "bg-blue-900/40 text-white ring-1 ring-blue-500/50" : "text-gray-300 hover:bg-gray-700/50"}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{p.name}</div>
                  <div className="text-xs text-gray-500 truncate">{p.category || "No category"}</div>
                </div>
                {hasMeta(p.slug) ? (
                  <Eye className="h-3 w-3 text-green-400 flex-shrink-0" />
                ) : (
                  <EyeOff className="h-3 w-3 text-gray-600 flex-shrink-0" />
                )}
              </button>
            ))}
            {loading && <p className="text-gray-500 text-sm p-4 text-center">Loading products...</p>}
            {!loading && filtered.length === 0 && <p className="text-gray-500 text-sm p-4 text-center">No products found</p>}
          </div>
        </div>

        {/* SEO Editor */}
        <div className="lg:col-span-2 rounded-xl border border-gray-700 bg-gray-800/50 p-5">
          {!editing ? (
            <div className="text-center py-16">
              <Globe className="mx-auto h-10 w-10 text-gray-600 mb-2" />
              <p className="text-gray-400">Select a product to edit its SEO settings</p>
              <p className="text-sm text-gray-500 mt-1">Products with custom meta will show a green eye icon</p>
            </div>
          ) : !metaLoaded ? (
            <div className="animate-pulse space-y-3 p-4">
              {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-700 rounded w-3/4" />)}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Editing: {editing.name}</h3>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Meta Title</label>
                  <input type="text" value={meta.title ?? ""} onChange={e => setMeta({ ...meta, title: e.target.value })}
                    placeholder={`${editing.name} — Buy Online at Best Price`}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600" />
                  <span className="text-xs text-gray-600 block mt-0.5">
                    Recommended: 50-60 chars. Current: {(meta.title ?? "").length} chars
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                  <textarea rows={3} value={meta.description ?? ""} onChange={e => setMeta({ ...meta, description: e.target.value })}
                    placeholder="Buy {product name} online at best price. Free delivery, easy returns, cash on delivery available."
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 resize-y" />
                  <span className="text-xs text-gray-600 block">Recommended: 150-160 chars. Current: {(meta.description ?? "").length} chars</span>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Keywords (comma separated)</label>
                  <input type="text" value={meta.keywords ?? ""} onChange={e => setMeta({ ...meta, keywords: e.target.value })}
                    placeholder="buy product online, best price, free delivery"
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600" />
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Social Media (Open Graph)</h4>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">OG Title</label>
                      <input type="text" value={meta.ogTitle ?? ""} onChange={e => setMeta({ ...meta, ogTitle: e.target.value })}
                        placeholder="Same as meta title"
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">OG Image URL</label>
                      <input type="text" value={meta.ogImage ?? ""} onChange={e => setMeta({ ...meta, ogImage: e.target.value })}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">OG Description</label>
                    <textarea rows={2} value={meta.ogDescription ?? ""} onChange={e => setMeta({ ...meta, ogDescription: e.target.value })}
                      placeholder="Same as meta description"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 resize-y" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!meta.noIndex} onChange={e => setMeta({ ...meta, noIndex: e.target.checked })}
                      className="accent-red-500" />
                    <span className="text-sm text-gray-300">Noindex (hide from search engines)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button onClick={() => void saveMeta()} disabled={saving}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50">
                  <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save SEO Meta"}
                </button>
                <button onClick={() => setEditing(null)}
                  className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
