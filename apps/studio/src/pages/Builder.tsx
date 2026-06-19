import { useState } from "react";
import apiClient from "../api/client";
import { Layout, Type, Image, Columns, Sparkles, ShoppingBag, Square, GripVertical, Trash2, Plus, Save, MoveUp, MoveDown, Eye } from "lucide-react";

interface BuilderElement {
  id: string;
  type: string;
  content: Record<string, string>;
}

const ELEMENTS: { type: string; label: string; icon: React.ComponentType<{ className?: string }>; defaultContent: Record<string, string> }[] = [
  { type: "text", label: "Text Block", icon: Type, defaultContent: { text: "Add your text here...", align: "left", size: "16", color: "#0f1111" } },
  { type: "heading", label: "Heading", icon: Type, defaultContent: { text: "Section Heading", level: "h2", align: "left", color: "#0f1111" } },
  { type: "image", label: "Image", icon: Image, defaultContent: { src: "https://picsum.photos/800/400", alt: "Image", width: "100%", borderRadius: "8" } },
  { type: "button", label: "Button", icon: Square, defaultContent: { text: "Click Me", url: "#", color: "#ffd814", textColor: "#0f1111", align: "left", size: "16" } },
  { type: "spacer", label: "Spacer", icon: Layout, defaultContent: { height: "40" } },
  { type: "columns2", label: "2 Columns", icon: Columns, defaultContent: { leftText: "Left column content", rightText: "Right column content", gap: "24" } },
  { type: "hero", label: "Hero Banner", icon: Sparkles, defaultContent: { title: "Welcome to Our Store", subtitle: "Discover amazing products at great prices", bgColor: "#232f3e", textColor: "white" } },
  { type: "products", label: "Product Grid", icon: ShoppingBag, defaultContent: { count: "4", columns: "4" } },
  { type: "divider", label: "Divider", icon: Layout, defaultContent: { color: "#e7e7e7", thickness: "1" } },
];

export default function BuilderPage() {
  const [elements, setElements] = useState<BuilderElement[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("New Page");
  const [pageSlug, setPageSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const addElement = (type: string) => {
    const template = ELEMENTS.find((e) => e.type === type);
    if (!template) return;
    const el: BuilderElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      content: { ...template.defaultContent },
    };
    setElements([...elements, el]);
    setSelected(el.id);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter((e) => e.id !== id));
    if (selected === id) setSelected(null);
  };

  const updateElement = (id: string, key: string, value: string) => {
    setElements(elements.map((e) => e.id === id ? { ...e, content: { ...e.content, [key]: value } } : e));
  };

  const moveElement = (id: string, direction: number) => {
    const idx = elements.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= elements.length) return;
    const copy = [...elements];
    const temp = copy[idx]!;
    copy[idx] = copy[newIdx]!;
    copy[newIdx] = temp;
    setElements(copy);
  };

  const saveAsContent = async () => {
    if (!pageTitle.trim()) { setMsg("Enter a page title"); return; }
    setSaving(true); setMsg("");
    try {
      const slug = pageSlug || pageTitle.toLowerCase().replace(/\s+/g, "-");
      await apiClient.post("/content", {
        title: pageTitle,
        slug,
        body: JSON.stringify({ elements, version: "1.0" }),
        excerpt: `Built with Extora Page Builder — ${elements.length} elements`,
        type: "page",
        status: "published",
      });
      setMsg(`Saved as "${pageTitle}" — Publish site to see it live`);
    } catch { setMsg("Save failed"); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  };

  const selectedEl = elements.find((e) => e.id === selected);

  const renderPreview = (el: BuilderElement) => {
    const c = el.content;
    switch (el.type) {
      case "text": return `<div style="text-align:${c.align ?? "left"};font-size:${c.size ?? "16"}px;color:${c.color ?? "#0f1111"};padding:12px 0">${c.text ?? ""}</div>`;
      case "heading": return `<${c.level ?? "h2"} style="text-align:${c.align ?? "left"};color:${c.color ?? "#0f1111"};margin:12px 0;font-weight:700">${c.text ?? ""}</${c.level ?? "h2"}>`;
      case "image": return `<div style="padding:12px 0"><img src="${c.src ?? ""}" alt="${c.alt ?? ""}" style="width:${c.width ?? "100%"};border-radius:${c.borderRadius ?? "8"}px" /></div>`;
      case "button": return `<div style="text-align:${c.align ?? "left"};padding:12px 0"><a href="${c.url ?? "#"}" style="display:inline-block;padding:${Math.round(Number(c.size ?? 16) * 0.6)}px ${Number(c.size ?? 16) * 1.5}px;background:${c.color ?? "#ffd814"};color:${c.textColor ?? "#0f1111"};border-radius:8px;text-decoration:none;font-weight:600;font-size:${c.size ?? 16}px">${c.text ?? ""}</a></div>`;
      case "spacer": return `<div style="height:${c.height ?? "40"}px"></div>`;
      case "columns2": return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:${c.gap ?? "24"}px;padding:12px 0"><div>${c.leftText ?? ""}</div><div>${c.rightText ?? ""}</div></div>`;
      case "hero": return `<div style="background:${c.bgColor ?? "#232f3e"};color:${c.textColor ?? "white"};padding:60px 40px;text-align:center;border-radius:8px;margin:12px 0"><h2 style="font-size:2rem;margin-bottom:8px">${c.title ?? ""}</h2><p style="font-size:1.2rem;opacity:0.9">${c.subtitle ?? ""}</p></div>`;
      case "products": return `<div style="padding:12px 0;color:#565959;text-align:center;border:2px dashed #e7e7e7;border-radius:8px;padding:30px"><p>Product Grid — ${c.count ?? "4"} products, ${c.columns ?? "4"} columns</p><p style="font-size:12px">Rendered on published site</p></div>`;
      case "divider": return `<hr style="border:0;border-top:${c.thickness ?? "1"}px solid ${c.color ?? "#e7e7e7"};margin:12px 0" />`;
      default: return "";
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Page Builder</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${previewMode ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>
            <Eye className="h-3.5 w-3.5" /> {previewMode ? "Edit" : "Preview"}
          </button>
          <input type="text" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-48 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white" placeholder="Page Title" />
          <input type="text" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} className="w-36 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white" placeholder="slug" />
          <button onClick={() => void saveAsContent()} disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Page"}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.includes("fail") ? "border-red-800 bg-red-900/20 text-red-400" : "border-green-800 bg-green-900/20 text-green-400"}`}>{msg}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr,280px] gap-4">
        {/* Element Palette */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 h-fit space-y-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Elements</h3>
          {ELEMENTS.map((el) => (
            <button key={el.type} onClick={() => addElement(el.type)} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-left">
              <el.icon className="h-4 w-4 text-gray-500" />
              <span>{el.label}</span>
              <Plus className="h-3.5 w-3.5 ml-auto text-gray-600" />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 min-h-[500px] p-6">
          {elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
              <Layout className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm">Add elements from the left panel</p>
              <p className="text-xs mt-1">Click an element type to add it to your page</p>
            </div>
          ) : previewMode ? (
            <div className="bg-white rounded-lg p-6 min-h-[400px]" dangerouslySetInnerHTML={{ __html: elements.map(renderPreview).join("") }} />
          ) : (
            <div className="space-y-3">
              {elements.map((el, idx) => (
                <div key={el.id} className={`group relative rounded-lg border-2 p-4 cursor-pointer transition-all ${selected === el.id ? "border-blue-500 bg-blue-900/10" : "border-gray-700 hover:border-gray-500 bg-gray-800/50"}`} onClick={() => setSelected(el.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-400 uppercase">{ELEMENTS.find((e) => e.type === el.type)?.label ?? el.type}</span>
                      <span className="text-[10px] text-gray-600">#{idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); moveElement(el.id, -1); }} className="rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-white"><MoveUp className="h-3.5 w-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveElement(el.id, 1); }} className="rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-white"><MoveDown className="h-3.5 w-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="rounded p-1 text-gray-500 hover:bg-red-600 hover:text-white"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 bg-gray-900/50 rounded p-3" dangerouslySetInnerHTML={{ __html: renderPreview(el) }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 h-fit space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Element Settings</h3>
          {selectedEl ? (
            <div className="space-y-2">
              {Object.entries(selectedEl?.content).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">{key}</label>
                  {key === "color" || key === "bgColor" || key === "textColor" ? (
                    <div className="flex gap-1">
                      <input type="color" value={value} onChange={(e) => updateElement(selectedEl.id, key, e.target.value)} className="h-8 w-10 rounded border border-gray-700 bg-gray-800 cursor-pointer" />
                      <input type="text" value={value} onChange={(e) => updateElement(selectedEl.id, key, e.target.value)} className="flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white font-mono" />
                    </div>
                  ) : key === "align" ? (
                    <div className="flex gap-1">
                      {["left", "center", "right"].map((a) => (
                        <button key={a} onClick={() => updateElement(selectedEl.id, key, a)} className={`flex-1 rounded py-1 text-[10px] font-medium capitalize ${value === a ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>{a}</button>
                      ))}
                    </div>
                  ) : (
                    <input type="text" value={value} onChange={(e) => updateElement(selectedEl.id, key, e.target.value)} className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-white" />
                  )}
                </div>
              ))}
              <button onClick={() => removeElement(selectedEl.id)} className="w-full rounded-lg bg-red-600/20 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-600/30 mt-3">
                <Trash2 className="h-3.5 w-3.5 inline mr-1" /> Remove Element
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-8 text-center">Select an element to edit its properties</p>
          )}
        </div>
      </div>
    </div>
  );
}
