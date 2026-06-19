import { useState } from "react";
import apiClient from "../api/client";
import {
  Layout, Type, Image, Square, Sparkles, ShoppingBag, Columns,
  Trash2, Save, MoveUp, MoveDown, Eye, Plus, Grid3X3, Film,
  List, Layers, PanelTop, PanelBottom
} from "lucide-react";

interface Element {
  id: string; type: string; content: Record<string, string>;
}

interface Category {
  id: string; label: string; icon: React.ComponentType<{ className?: string }>;
  elements: { type: string; label: string; icon: React.ComponentType<{ className?: string }>; defaults: Record<string, string> }[];
}

const CATEGORIES: Category[] = [
  {
    id: "layout", label: "Layout", icon: Layout,
    elements: [
      { type: "section", label: "Section", icon: PanelTop, defaults: { bgColor: "transparent", padding: "40", gap: "20" } },
      { type: "columns2", label: "2 Columns", icon: Columns, defaults: { leftText: "Left column", rightText: "Right column", gap: "24" } },
      { type: "columns3", label: "3 Columns", icon: Grid3X3, defaults: { col1: "Column 1", col2: "Column 2", col3: "Column 3", gap: "16" } },
      { type: "spacer", label: "Spacer", icon: PanelBottom, defaults: { height: "40" } },
      { type: "divider", label: "Divider", icon: Layers, defaults: { color: "#e7e7e7", thickness: "1" } },
    ],
  },
  {
    id: "content", label: "Content", icon: Type,
    elements: [
      { type: "heading", label: "Heading", icon: Type, defaults: { text: "Section Heading", level: "h2", align: "center", color: "#0f1111" } },
      { type: "text", label: "Text Block", icon: List, defaults: { text: "Your text content here...", align: "left", size: "16", color: "#333" } },
      { type: "button", label: "Button", icon: Square, defaults: { text: "Shop Now", url: "#", bgColor: "#ffd814", textColor: "#0f1111", align: "center", size: "16" } },
      { type: "hero", label: "Hero Banner", icon: Sparkles, defaults: { title: "Welcome", subtitle: "Discover amazing products", bgColor: "#232f3e", textColor: "white", height: "300" } },
    ],
  },
  {
    id: "media", label: "Media", icon: Image,
    elements: [
      { type: "image", label: "Image", icon: Image, defaults: { src: "https://picsum.photos/800/400", alt: "Image", width: "100%", borderRadius: "8" } },
      { type: "video", label: "Video", icon: Film, defaults: { src: "", poster: "", width: "100%", height: "400" } },
      { type: "gallery", label: "Gallery", icon: Grid3X3, defaults: { images: "", columns: "3", gap: "8" } },
    ],
  },
  {
    id: "commerce", label: "Commerce", icon: ShoppingBag,
    elements: [
      { type: "products", label: "Product Grid", icon: ShoppingBag, defaults: { count: "8", columns: "4", category: "", sort: "newest" } },
      { type: "deals", label: "Deals Banner", icon: Sparkles, defaults: { title: "Today's Deals", subtitle: "Up to 50% off", bgColor: "#cc0c39" } },
      { type: "categories", label: "Category Cards", icon: Grid3X3, defaults: { count: "6", columns: "3" } },
    ],
  },
];

export default function BuilderPage() {
  const [elements, setElements] = useState<Element[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("layout");
  const [pageTitle, setPageTitle] = useState("New Page");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const findDefaults = (type: string) => {
    for (const cat of CATEGORIES) {
      const el = cat.elements.find((e) => e.type === type);
      if (el) return el.defaults;
    }
    return {};
  };

  const addElement = (type: string) => {
    const defaults = findDefaults(type);
    const el: Element = { id: `el_${Date.now()}`, type, content: { ...defaults } };
    setElements([...elements, el]);
    setSelected(el.id);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter((e) => e.id !== id));
    if (selected === id) setSelected(null);
  };

  const updateElement = (id: string, key: string, value: string) => {
    setElements(elements.map((e) => (e.id === id ? { ...e, content: { ...e.content, [key]: value } } : e)));
  };

  const moveElement = (id: string, dir: number) => {
    const idx = elements.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= elements.length) return;
    const copy = [...elements];
    const temp = copy[idx]!;
    copy[idx] = copy[newIdx]!;
    copy[newIdx] = temp;
    setElements(copy);
  };

  const clearAll = () => { if (elements.length === 0 || confirm("Clear all elements?")) { setElements([]); setSelected(null); } };

  const saveAsContent = async () => {
    if (!pageTitle.trim()) { setMsg("Enter a page title"); return; }
    setSaving(true); setMsg("");
    try {
      const slug = (pageSlug ?? pageTitle).toLowerCase().replace(/\s+/g, "-");
      await apiClient.post("/content", { title: pageTitle, slug, body: JSON.stringify({ elements, v: "1.0" }), excerpt: `Built with Page Builder — ${elements.length} elements`, type: "page", status: "published" });
      setMsg(`Saved! Publish site to see it live`);
    } catch { setMsg("Save failed"); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  };

  const selectedEl = elements.find((e) => e.id === selected);
  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  const renderPreview = (el: Element) => {
    const c = el.content;
    switch (el.type) {
      case "heading": return `<${c.level ?? "h2"} style="text-align:${c.align};color:${c.color};font-weight:700;margin:8px 0">${c.text}</${c.level ?? "h2"}>`;
      case "text": return `<p style="text-align:${c.align};font-size:${c.size}px;color:${c.color};line-height:1.7">${c.text}</p>`;
      case "button": return `<div style="text-align:${c.align};padding:12px 0"><a href="${c.url}" style="display:inline-block;padding:12px 32px;background:${c.bgColor};color:${c.textColor};border-radius:8px;text-decoration:none;font-weight:600;font-size:${c.size}px">${c.text}</a></div>`;
      case "image": return `<img src="${c.src}" alt="${c.alt}" style="width:${c.width};border-radius:${c.borderRadius}px;margin:12px 0" />`;
      case "video": return `<div style="padding:12px 0"><video src="${c.src}" poster="${c.poster}" controls style="width:${c.width};height:${c.height}px;border-radius:8px"></video></div>`;
      case "gallery": return `<div style="display:grid;grid-template-columns:repeat(${c.columns},1fr);gap:${c.gap}px;padding:12px 0"><div style="background:#eee;height:150px;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px">Gallery Image</div>`.repeat(Number(c.columns ?? 3)) + "</div>";
      case "hero": return `<div style="background:${c.bgColor};color:${c.textColor};padding:80px 40px;text-align:center;border-radius:8px;min-height:${c.height ?? 300}px;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:12px 0"><h2 style="font-size:2.2rem;margin:0 0 8px">${c.title}</h2><p style="font-size:1.2rem;opacity:0.9;margin:0">${c.subtitle}</p></div>`;
      case "products": return `<div style="padding:12px;text-align:center;border:2px dashed #ddd;border-radius:8px;color:#999">Product Grid · ${c.count} items · ${c.columns} columns · Sort: ${c.sort}</div>`;
      case "deals": return `<div style="background:${c.bgColor};color:white;padding:40px;text-align:center;border-radius:8px;margin:12px 0"><h2 style="font-size:1.8rem">${c.title}</h2><p style="opacity:0.9">${c.subtitle}</p></div>`;
      case "categories": return `<div style="padding:12px;text-align:center;border:2px dashed #ddd;border-radius:8px;color:#999">Category Cards · ${c.count} categories · ${c.columns} columns</div>`;
      case "spacer": return `<div style="height:${c.height}px"></div>`;
      case "divider": return `<hr style="border:none;border-top:${c.thickness}px solid ${c.color};margin:12px 0" />`;
      case "columns2": return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:${c.gap}px;padding:12px 0"><div style="padding:20px;background:#f8f8f8;border-radius:4px">${c.leftText}</div><div style="padding:20px;background:#f8f8f8;border-radius:4px">${c.rightText}</div></div>`;
      case "columns3": return `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:${c.gap}px;padding:12px 0">${[1,2,3].map((n) => `<div style="padding:16px;background:#f8f8f8;border-radius:4px">${c[`col${n}`] ?? `Column ${n}`}</div>`).join("")}</div>`;
      case "section": return `<div style="background:${c.bgColor};padding:${c.padding}px 0;border-radius:0;min-height:100px"></div>`;
      default: return "";
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Page Builder</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${previewMode ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}><Eye className="h-3.5 w-3.5" /> {previewMode ? "Editor" : "Preview"}</button>
          <input type="text" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-44 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white" placeholder="Page Title" />
          <button onClick={clearAll} className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-500 hover:text-red-400">Clear</button>
          <button onClick={() => void saveAsContent()} disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Page"}</button>
        </div>
      </div>

      {msg && <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.includes("fail") ? "border-red-800 bg-red-900/20 text-red-400" : "border-green-800 bg-green-900/20 text-green-400"}`}>{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr,260px] gap-4">
        {/* LEFT: Element Palette with Tabs */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden h-fit">
          <div className="flex border-b border-gray-800">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${activeCategory === cat.id ? "bg-blue-600/20 text-blue-400 border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"}`}>
                <cat.icon className="h-3.5 w-3.5" /> {cat.label}
              </button>
            ))}
          </div>
          <div className="p-2 space-y-1">
            {activeCat?.elements.map((el) => (
              <button key={el.type} onClick={() => addElement(el.type)} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-left group">
                <el.icon className="h-4 w-4 text-gray-500 group-hover:text-blue-400" />
                <span className="flex-1">{el.label}</span>
                <Plus className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-400" />
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Content Area */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 min-h-[550px] p-6">
          {elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500" style={{ minHeight: "400px" }}>
              <Layout className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Start Building</p>
              <p className="text-sm mt-1">Add elements from the left panel</p>
              <p className="text-xs mt-3 text-gray-600">Layout · Content · Media · Commerce</p>
            </div>
          ) : previewMode ? (
            <div className="bg-white rounded-lg p-6" dangerouslySetInnerHTML={{ __html: elements.map(renderPreview).join("") }} />
          ) : (
            <div className="space-y-3">
              {elements.map((el, idx) => {
                const cat = CATEGORIES.find((c) => c.elements.some((e) => e.type === el.type));
                const elDef = cat?.elements.find((e) => e.type === el.type);
                return (
                  <div key={el.id} className={`group relative rounded-lg border-2 transition-all ${selected === el.id ? "border-blue-500 bg-blue-900/10 ring-1 ring-blue-500/50" : "border-gray-700/50 hover:border-gray-500 bg-gray-800/30"}`} onClick={() => setSelected(el.id)}>
                    <div className="absolute -top-3 left-3 flex items-center gap-1.5 rounded-full bg-gray-800 border border-gray-700 px-2.5 py-0.5 text-[10px] font-medium text-gray-400 z-10">
                      {elDef && <elDef.icon className="h-3 w-3" />}
                      {elDef?.label ?? el.type}
                      <span className="text-gray-600">#{idx + 1}</span>
                    </div>
                    <div className="absolute -top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-gray-800 rounded-full border border-gray-700 px-1">
                      <button onClick={(e) => { e.stopPropagation(); moveElement(el.id, -1); }} className="rounded p-1 text-gray-500 hover:text-white"><MoveUp className="h-3 w-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveElement(el.id, 1); }} className="rounded p-1 text-gray-500 hover:text-white"><MoveDown className="h-3 w-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="rounded p-1 text-gray-500 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    <div className="p-4 pt-4 text-sm text-gray-300 min-h-[40px]" dangerouslySetInnerHTML={{ __html: renderPreview(el) }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Settings Panel */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 h-fit space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Element Settings</h3>
          {selectedEl ? (
            <div className="space-y-2">
              {Object.entries(selectedEl.content).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">{key.replace(/([A-Z])/g, " $1").trim()}</label>
                  {key.includes("Color") || key === "color" || key === "bgColor" || key === "textColor" ? (
                    <div className="flex gap-1">
                      <input type="color" value={value} onChange={(e) => updateElement(selectedEl.id, key, e.target.value)} className="h-8 w-10 rounded border border-gray-700 bg-gray-800 cursor-pointer" />
                      <input type="text" value={value} onChange={(e) => updateElement(selectedEl.id, key, e.target.value)} className="flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white font-mono" />
                    </div>
                  ) : key === "align" ? (
                    <div className="flex gap-1">
                      {["left", "center", "right"].map((a) => (
                        <button key={a} onClick={() => updateElement(selectedEl.id, key, a)} className={`flex-1 rounded py-1.5 text-[10px] font-medium capitalize ${value === a ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{a}</button>
                      ))}
                    </div>
                  ) : key === "level" ? (
                    <div className="flex gap-1">
                      {["h1", "h2", "h3", "h4"].map((l) => (
                        <button key={l} onClick={() => updateElement(selectedEl.id, key, l)} className={`flex-1 rounded py-1.5 text-[10px] font-bold uppercase ${value === l ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{l}</button>
                      ))}
                    </div>
                  ) : key === "sort" ? (
                    <select value={value} onChange={(e) => updateElement(selectedEl.id, key, e.target.value)} className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-white">
                      <option value="newest">Newest</option><option value="popular">Popular</option><option value="price-asc">Price Low→High</option><option value="price-desc">Price High→Low</option>
                    </select>
                  ) : (
                    <input type={key.includes("height") || key.includes("size") || key.includes("count") || key.includes("columns") || key.includes("gap") || key.includes("padding") || key.includes("thickness") ? "number" : "text"} value={value} onChange={(e) => updateElement(selectedEl.id, key, e.target.value)} className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-white" />
                  )}
                </div>
              ))}
              <button onClick={() => removeElement(selectedEl.id)} className="w-full rounded-lg bg-red-600/20 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-600/30 mt-3"><Trash2 className="h-3.5 w-3.5 inline mr-1" /> Remove</button>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-8 text-center leading-relaxed">Select an element<br />to edit its properties</p>
          )}
        </div>
      </div>
    </div>
  );
}
