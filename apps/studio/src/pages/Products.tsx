import { useEffect, useState } from "react";
import apiClient from "../api/client";
import {
  Package, Plus, Save, Trash2, RefreshCw, Send, Image, Settings, Upload,
  Truck, Layers, Link2, Tag, DollarSign, Box, FolderTree,
  Tags, Shield, Grid3X3, MessageSquare, Globe
} from "lucide-react";
import { TableSkeleton } from "../components/ui/Skeleton";

interface ProductData {
  id?: string;
  slug: string;
  name: string;
  type: string;
  status: string;
  description: string;
  shortDesc: string;
  sku: string;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  costPrice: number | null;
  category: string;
  categories: string[];
  tags: string[];
  images: string[];
  videoUrl: string;
  brand: string;
  manageStock: boolean;
  stockQty: number;
  stockStatus: string;
  weight: number | null;
  taxStatus: string;
  dealType: string | null;
  dealValue: number | null;
  dealLabel: string | null;
  discountType: string | null;
  discountValue: number | null;
  comboItems: { id: string; name: string; qty: number; discount: number }[];
  upSellIds: string[];
  crossSellIds: string[];
  relatedIds: string[];
  metaData: Record<string, unknown>;
}

const EMPTY_PRODUCT: ProductData = {
  slug: "",
  name: "", type: "simple", status: "draft", description: "", shortDesc: "",
  sku: "", price: 0, regularPrice: 0, salePrice: null, costPrice: null,
  category: "General", categories: [], tags: [], images: [], videoUrl: "", brand: "",
  manageStock: false, stockQty: 0, stockStatus: "instock", weight: null, taxStatus: "taxable",
  dealType: null, dealValue: null, dealLabel: null, discountType: null, discountValue: null,
  comboItems: [], upSellIds: [], crossSellIds: [], relatedIds: [], metaData: {},
};

const TABS = [
  { id: "general", icon: Settings, label: "General" },
  { id: "pricing", icon: DollarSign, label: "Pricing" },
  { id: "inventory", icon: Box, label: "Inventory" },
  { id: "shipping", icon: Truck, label: "Shipping" },
  { id: "media", icon: Image, label: "Media" },
  { id: "linked", icon: Link2, label: "Linked" },
  { id: "deals", icon: Tag, label: "Deals" },
  { id: "advanced", icon: Layers, label: "Advanced" },
  { id: "seo", icon: Globe, label: "SEO" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-gray-800 text-gray-300" },
  { value: "pending", label: "Pending Review", color: "bg-yellow-900/40 text-yellow-400" },
  { value: "published", label: "Published", color: "bg-green-900/40 text-green-400" },
  { value: "scheduled", label: "Scheduled", color: "bg-blue-900/40 text-blue-400" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<ProductData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [filterStatus, setFilterStatus] = useState("");
  const [subTab, setSubTab] = useState("products");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoOgTitle, setSeoOgTitle] = useState("");
  const [seoOgDesc, setSeoOgDesc] = useState("");
  const [seoOgImage, setSeoOgImage] = useState("");
  const [seoNoIndex, setSeoNoIndex] = useState(false);
  const [seoFocusKw, setSeoFocusKw] = useState("");
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoMsg, setSeoMsg] = useState("");

  const fetchSeoMeta = async (slug: string) => {
    if (!slug) return;
    try {
      const r = await apiClient.get(`/seo/meta?resourceType=product&resourceId=${encodeURIComponent(slug)}`);
      const d = (r.data)?.data ?? r.data ?? {};
      if (d?.title !== undefined) {
        setSeoTitle(d.title ?? ""); setSeoDesc(d.description ?? ""); setSeoKeywords(d.keywords ?? "");
        setSeoOgTitle(d.ogTitle ?? ""); setSeoOgDesc(d.ogDescription ?? ""); setSeoOgImage(d.ogImage ?? "");
        setSeoNoIndex(!!d.noIndex);
      } else { resetSeo(); }
    } catch { resetSeo(); }
  };
  const resetSeo = () => { setSeoTitle(""); setSeoDesc(""); setSeoKeywords(""); setSeoOgTitle(""); setSeoOgDesc(""); setSeoOgImage(""); setSeoNoIndex(false); };
  const saveSeoMeta = async () => {
    if (!editing) return;
    setSeoSaving(true); setSeoMsg("");
    try {
      await apiClient.post("/seo/meta", { resourceType: "product", resourceId: editing.slug, title: seoTitle, description: seoDesc, keywords: seoKeywords, ogTitle: seoOgTitle, ogDescription: seoOgDesc, ogImage: seoOgImage, noIndex: seoNoIndex, focusKeyword: seoFocusKw });
      setSeoMsg("SEO saved ✓");
      setTimeout(() => setSeoMsg(""), 2000);
    } catch { setSeoMsg("Failed to save"); }
    setSeoSaving(false);
  };

  useEffect(() => {
    const syncTab = () => {
      const hash = window.location.hash.slice(2);
      const validTabs = ["products", "categories", "brands", "tags", "attributes", "reviews"];
      if (validTabs.includes(hash)) setSubTab(hash);
      else setSubTab("products");
    };
    syncTab();
    window.addEventListener("hashchange", syncTab);
    return () => window.removeEventListener("hashchange", syncTab);
  }, []);
  useEffect(() => { if (editing) { void fetchSeoMeta(editing.slug); } else { resetSeo(); } }, [editing?.slug]);
  const [taxonomies, setTaxonomies] = useState<{ id: string; name: string; slug: string; description: string }[]>([]);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxEdit, setTaxEdit] = useState<{ id?: string; name: string; description: string } | null>(null);
  const [taxShowForm, setTaxShowForm] = useState(false);

  const SUB_TABS = [
    { id: "products", icon: Package, label: "All Products" },
    { id: "categories", icon: FolderTree, label: "Categories" },
    { id: "brands", icon: Shield, label: "Brands" },
    { id: "tags", icon: Tags, label: "Tags" },
    { id: "attributes", icon: Grid3X3, label: "Attributes" },
    { id: "reviews", icon: MessageSquare, label: "Reviews" },
  ];

  const fetchTaxonomies = async (type: string) => {
    setTaxLoading(true);
    try {
      const { data } = await apiClient.get(`/commerce/${type}`);
      setTaxonomies(Array.isArray(data) ? data : data.data ?? []);
    } finally { setTaxLoading(false); }
  };

  useEffect(() => {
    if (subTab !== "products") void fetchTaxonomies(subTab);
  }, [subTab]);

  const handleTaxSave = async () => {
    if (!taxEdit?.name.trim()) return;
    try {
      if (taxEdit.id) {
        await apiClient.patch(`/commerce/${subTab}/${encodeURIComponent(taxEdit.id)}`, taxEdit);
      } else {
        await apiClient.post(`/commerce/${subTab}`, taxEdit);
      }
      setTaxShowForm(false); setTaxEdit(null); void fetchTaxonomies(subTab);
    } catch (err: unknown) { console.error("Save failed", err); }
  };

  const handleTaxDelete = async (id: string) => {
    try { await apiClient.delete(`/commerce/${subTab}/${encodeURIComponent(id)}`); void fetchTaxonomies(subTab); }
    catch (err: unknown) { console.error("Delete failed", err); }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/commerce/products");
      setProducts(Array.isArray(data) ? data : data.data ?? []);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { void fetchProducts(); }, []);

  const handleSave = async () => {
    if (!editing?.name.trim()) return;
    try {
      if (editing.id) {
        await apiClient.patch(`/commerce/products/${encodeURIComponent(editing.id)}`, editing);
      } else {
        await apiClient.post("/commerce/products", editing);
      }
      setShowForm(false); setEditing(null); void fetchProducts();
    } catch (err: unknown) { console.error("Save failed", err); }
  };

  const toggleStatus = async (p: ProductData) => {
    const newStatus = p.status === "published" ? "draft" : "published";
    await apiClient.patch(`/commerce/products/${encodeURIComponent(p.id!)}`, { status: newStatus });
    void fetchProducts();
  };

  const handleDelete = async (id: string) => {
    try { await apiClient.delete(`/commerce/products/${encodeURIComponent(id)}`); void fetchProducts(); }
    catch (err: unknown) { console.error("Delete failed", err); }
  };

  const update = (field: string, value: unknown) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  const addImage = () => {
    if (!editing) return;
    const url = prompt("Enter image URL (or use Upload to pick a file):");
    if (url) update("images", [...editing.images, url]);
  };

  const handleFileUpload = async (type: "image" | "video") => {
    if (!editing) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "video" ? "video/*" : "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const token = localStorage.getItem("at");
      if (!token) { alert("Please sign in first"); return; }
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/v1/media/upload", { method: "POST", headers: { Authorization: "Bearer " + token }, body: form });
        const data = await res.json() as { url?: string; data?: { url?: string } };
        const uploadedUrl = data.url ?? data.data?.url ?? "";
        if (uploadedUrl) {
          if (type === "image") update("images", [...editing.images, uploadedUrl]);
          else update("videoUrl", uploadedUrl);
        }
      } catch { alert("Upload failed. Check network or file size."); }
    };
    input.click();
  };

  const removeImage = (idx: number) => {
    if (!editing) return;
    const imgs = [...editing.images];
    imgs.splice(idx, 1);
    update("images", imgs);
  };

  const addComboItem = () => {
    if (!editing) return;
    update("comboItems", [...editing.comboItems, { id: `c${Date.now()}`, name: "", qty: 1, discount: 0 }]);
  };

  const updateComboItem = (idx: number, field: string, value: unknown) => {
    if (!editing) return;
    const items = [...editing.comboItems];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (items[idx] as any)[field] = value;
    update("comboItems", items);
  };

  const removeComboItem = (idx: number) => {
    if (!editing) return;
    const items = [...editing.comboItems];
    items.splice(idx, 1);
    update("comboItems", items);
  };

  const renderField = (label: string, field: string, type = "text", opts?: Record<string, unknown>) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-400">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={String((editing?.[field as keyof ProductData] as string | number | null) ?? "")}
          onChange={(e) => { update(field, e.target.value); }}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          rows={4}
          {...opts}
        />
      ) : type === "number" ? (
        <input
          type="number"
          value={editing?.[field as keyof ProductData] as number ?? ""}
          onChange={(e) => { update(field, Number(e.target.value)); }}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          step="0.01"
          {...opts}
        />
      ) : type === "select" ? (
        <select
          value={(editing?.[field as keyof ProductData] as string) ?? ""}
          onChange={(e) => { update(field, e.target.value); }}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          {(opts?.options as { value: string; label: string }[])?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={Boolean(editing?.[field as keyof ProductData] ?? false)}
            onChange={(e) => { update(field, e.target.checked); }}
            className="rounded border-gray-600 bg-gray-800"
          />
          {label}
        </label>
      ) : (
        <input
          type={type}
          value={String((editing?.[field as keyof ProductData] as string | number | null) ?? "")}
          onChange={(e) => { update(field, e.target.value); }}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          {...opts}
        />
      )}
    </div>
  );

  const filtered = filterStatus ? products.filter((p) => p.status === filterStatus) : products;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <button onClick={() => void fetchProducts()} className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { setEditing({ ...EMPTY_PRODUCT }); setShowForm(true); setActiveTab("general"); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="mb-6 flex border-b border-gray-700 overflow-x-auto">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setSubTab(tab.id); setShowForm(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              subTab === tab.id ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Taxonomy Management (Categories, Brands, Tags, Attributes, Reviews) */}
      {subTab !== "products" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white capitalize">{subTab}</h3>
            <button
              onClick={() => { setTaxEdit({ name: "", description: "" }); setTaxShowForm(true); }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Add {subTab === "categories" ? "Category" : subTab === "brands" ? "Brand" : subTab === "tags" ? "Tag" : subTab === "attributes" ? "Attribute" : ""}
            </button>
          </div>

          {taxShowForm && taxEdit && (
            <div className="mb-4 rounded-xl border border-gray-700 bg-gray-900 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Name *</label>
                  <input
                    type="text" value={taxEdit.name}
                    onChange={(e) => { setTaxEdit({ ...taxEdit, name: e.target.value }); }}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                    placeholder={subTab === "categories" ? "Electronics" : subTab === "brands" ? "Nike" : subTab === "tags" ? "Best Seller" : "Color"}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Description</label>
                  <input
                    type="text" value={taxEdit.description}
                    onChange={(e) => { setTaxEdit({ ...taxEdit, description: e.target.value }); }}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => void handleTaxSave()} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"><Save className="h-3.5 w-3.5" /> Save</button>
                <button onClick={() => { setTaxShowForm(false); setTaxEdit(null); }} className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800">Cancel</button>
              </div>
            </div>
          )}

          {taxLoading ? (
            <TableSkeleton rows={3} />
          ) : taxonomies.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-gray-600" />
              <p className="text-gray-400">No {subTab} yet</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-800">
              <table className="w-full">
                <thead><tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-800">
                  {taxonomies.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-900/30">
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{item.slug}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 truncate max-w-[200px]">{item.description || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setTaxEdit({ id: item.id, name: item.name, description: item.description }); setTaxShowForm(true); }} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-blue-400"><Settings className="h-4 w-4" /></button>
                        <button onClick={() => void handleTaxDelete(item.id)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Form (only when products sub-tab) */}
      {subTab === "products" && showForm && editing && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900">
          {/* Tab Bar */}
          <div className="flex border-b border-gray-700 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("Product Name *", "name")}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Status</label>
                  <select
                    value={editing.status}
                    onChange={(e) => { update("status", e.target.value); }}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                  >
                    {STATUS_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Product Type</label>
                  <select value={editing.type} onChange={(e) => { update("type", e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
                    <option value="simple">Simple Product</option>
                    <option value="variable">Variable Product</option>
                    <option value="combo">Combo / Bundle</option>
                    <option value="digital">Digital / Downloadable</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
                {renderField("SKU", "sku")}
                {renderField("Brand", "brand")}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Category</label>
                  <select value={editing.category} onChange={(e) => { update("category", e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
                    <option>General</option><option>Electronics</option><option>Fashion</option>
                    <option>Home & Kitchen</option><option>Books</option><option>Sports</option>
                    <option>Toys</option><option>Health</option><option>Beauty</option>
                    <option>Automotive</option><option>Grocery</option>
                  </select>
                </div>
                {renderField("Tags (comma separated)", "tags", "text", { placeholder: "best-seller, new, sale" })}
                {renderField("Short Description", "shortDesc", "textarea")}
                {renderField("Full Description (HTML)", "description", "textarea")}
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === "pricing" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField("Regular Price ($)", "regularPrice", "number")}
                {renderField("Sale Price ($)", "salePrice", "number")}
                {renderField("Cost Price ($)", "costPrice", "number")}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Tax Status</label>
                  <select value={editing.taxStatus} onChange={(e) => { update("taxStatus", e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
                    <option value="taxable">Taxable</option>
                    <option value="shipping">Shipping Only</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="col-span-3 p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <p className="mb-3 text-sm font-medium text-gray-300">Bulk Pricing (installed via Discount Plugin)</p>
                  <p className="text-xs text-gray-500">
                    {editing.discountType ? `${editing.discountType}: ${editing.discountValue}` : "No discount rules set. Enable discount plugin to add."}
                  </p>
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-3">{renderField("Enable stock management", "manageStock", "checkbox")}</div>
                {editing.manageStock && (
                  <>
                    {renderField("Stock Quantity", "stockQty", "number")}
                    {renderField("Low Stock Threshold", "lowStockQty", "number")}
                    {renderField("Min Order Quantity", "minQty", "number")}
                    {renderField("Max Order Quantity", "maxQty", "number")}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-400">Stock Status</label>
                      <select value={editing.stockStatus} onChange={(e) => { update("stockStatus", e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
                        <option value="instock">In Stock</option>
                        <option value="outofstock">Out of Stock</option>
                        <option value="onbackorder">On Backorder</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="col-span-3 p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <p className="text-sm font-medium text-gray-300">Inventory Tracking</p>
                  <p className="text-xs text-gray-500">Inventory plugin provides: barcode scanning, warehouse management, batch tracking</p>
                </div>
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === "shipping" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField("Weight (kg)", "weight", "number")}
                <div className="col-span-3 p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <p className="text-sm font-medium text-gray-300">Shipping Settings</p>
                  <p className="text-xs text-gray-500">Activate Commerce plugin to set shipping classes, zones, and rates</p>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === "media" && (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={addImage} className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 border border-gray-700">
                    <Image className="h-4 w-4" /> Add Image URL
                  </button>
                  <button onClick={() => handleFileUpload("image")} className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-600 border border-blue-600">
                    <Upload className="h-4 w-4" /> Upload Image
                  </button>
                  <span className="text-xs text-gray-500">{editing.images.length} images</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {editing.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg border border-gray-700 overflow-hidden">
                      <img src={img} alt="" className="w-full h-32 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='132'><rect fill='%231f2937' width='200' height='132'/><text fill='%236b7280' x='50%25' y='50%25' text-anchor='middle'>No Image</text></svg>"; }} />
                      <button onClick={() => { removeImage(idx); }} className="absolute top-1 right-1 rounded bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Video</label>
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => handleFileUpload("video")} className="flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-sm text-white hover:bg-purple-600 border border-purple-600">
                      <Upload className="h-4 w-4" /> Upload Video
                    </button>
                    <span className="text-xs text-gray-500">or paste URL below</span>
                  </div>
                  {renderField("Video URL (YouTube or local path)", "videoUrl", "text", { placeholder: "https://youtube.com/watch?v=... or /storage/extora/uploads/video.mp4" })}
                  {editing.videoUrl && (
                    <div className="mt-2 p-3 rounded-lg border border-gray-700 bg-gray-800/50">
                      <span className="text-xs text-green-400">✓ Video set: {editing.videoUrl.length > 60 ? editing.videoUrl.slice(0,60) + "..." : editing.videoUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Linked Products Tab */}
            {activeTab === "linked" && (
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <h3 className="mb-2 text-sm font-medium text-gray-300">Up-Sells</h3>
                  <p className="text-xs text-gray-500">Products you recommend instead of this one. Shown on product page.</p>
                  {renderField("Up-Sell Product IDs (comma separated)", "upSellIds", "text", { placeholder: "prod_1, prod_2" })}
                </div>
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <h3 className="mb-2 text-sm font-medium text-gray-300">Cross-Sells</h3>
                  <p className="text-xs text-gray-500">Products displayed in cart alongside this product.</p>
                  {renderField("Cross-Sell Product IDs (comma separated)", "crossSellIds", "text", { placeholder: "prod_1, prod_2" })}
                </div>
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <h3 className="mb-2 text-sm font-medium text-gray-300">Related</h3>
                  <p className="text-xs text-gray-500">Similar products shown below product detail.</p>
                  {renderField("Related Product IDs (comma separated)", "relatedIds", "text", { placeholder: "prod_1, prod_2" })}
                </div>
              </div>
            )}

            {/* Deals Tab */}
            {activeTab === "deals" && (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400">Deal Type</label>
                    <select
                      value={editing.dealType ?? ""}
                      onChange={(e) => { update("dealType", e.target.value || null); }}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                    >
                      <option value="">None</option>
                      <option value="flash_sale">Flash Sale</option>
                      <option value="daily_deal">Daily Deal</option>
                      <option value="clearance">Clearance</option>
                      <option value="bogo">Buy One Get One</option>
                      <option value="bundle_discount">Bundle Discount</option>
                    </select>
                  </div>
                  {editing.dealType && (
                    <>
                      {renderField("Deal Label", "dealLabel")}
                      {renderField(`${editing.dealType === "bogo" ? "Discount %" : "Deal Value (${" + "number"})"}`, "dealValue", "number")}
                    </>
                  )}
                </div>

                {/* Combo Products */}
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-300">Combo / Bundle Items</h3>
                    <button onClick={addComboItem} className="flex items-center gap-1 rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600">
                      <Plus className="h-3 w-3" /> Add Item
                    </button>
                  </div>
                  {editing.comboItems.length === 0 ? (
                    <p className="text-xs text-gray-500">No combo items. Add products to create a bundle.</p>
                  ) : (
                    <div className="space-y-2">
                      {editing.comboItems.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            value={item.name}
                            onChange={(e) => { updateComboItem(idx, "name", e.target.value); }}
                            className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-xs text-white"
                            placeholder="Product name"
                          />
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => { updateComboItem(idx, "qty", Number(e.target.value)); }}
                            className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-xs text-white"
                            min={1}
                          />
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => { updateComboItem(idx, "discount", Number(e.target.value)); }}
                            className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-xs text-white"
                            min={0}
                            max={100}
                          />
                          <span className="text-xs text-gray-500">% off</span>
                          <button onClick={() => { removeComboItem(idx); }} className="text-gray-500 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === "advanced" && (
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <h3 className="mb-2 text-sm font-medium text-gray-300">Plugin Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <PluginToggle name="Discount Rules" active={!!editing.discountType} />
                    <PluginToggle name="Combo Builder" active={editing.comboItems.length > 0} />
                    <PluginToggle name="Deals Engine" active={!!editing.dealType} />
                    <PluginToggle name="Up-Sells" active={editing.upSellIds.length > 0} />
                    <PluginToggle name="Cross-Sells" active={editing.crossSellIds.length > 0} />
                    <PluginToggle name="Inventory Track" active={editing.manageStock} />
                    <PluginToggle name="Digital Downloads" active={editing.type === "digital"} />
                    <PluginToggle name="Video Gallery" active={!!editing.videoUrl} />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-6 flex items-center gap-3 border-t border-gray-700 pt-4">
              <button onClick={() => void handleSave()} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <Save className="h-4 w-4" /> Save Product
              </button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product List Table */}
      {subTab === "products" && !showForm && (
        <>
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            {filterStatus ? (
              <span>Filtered: <strong>{filterStatus}</strong> ({filtered.length} products) <button onClick={() => { setFilterStatus(""); }} className="text-blue-400 ml-1">Clear</button></span>
            ) : (
              <span>{products.length} products total</span>
            )}
          </div>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-gray-600" />
              <p className="text-gray-400">No products found</p>
              <p className="mt-1 text-sm text-gray-500">{filterStatus ? `No ${filterStatus} products` : "Click 'Add Product' to create one"}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Deals</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-900/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                            {product.images?.length > 0 ? (
                              <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <Package className="h-5 w-5 text-gray-500" />
            )}

                        {/* SEO Tab */}
            {activeTab === "seo" && editing && (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-semibold text-white">SEO Settings</span>
                </div>

                {/* Google Preview */}
                <div className="rounded-lg border border-gray-600 bg-gray-900/50 p-4">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">🔍 Google Preview</h4>
                  <div className="font-[Arial] space-y-0.5">
                    <div className="text-blue-400 text-base font-medium truncate">{seoTitle || editing.name || "Product"}</div>
                    <div className="text-green-700 text-xs">https://extora.in/product-{editing.slug || "..."}</div>
                    <div className="text-gray-300 text-xs leading-relaxed">{seoDesc || editing.description?.slice(0, 156) || "No description set"}</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">SEO Title</label>
                    <span className={`text-xs ${(seoTitle??"").length >= 30 && (seoTitle??"").length <= 60 ? "text-green-400" : "text-yellow-400"}`}>{(seoTitle??"").length}/60</span>
                  </div>
                  <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                    placeholder={editing.name + " — Buy Online at Best Price | Extora"}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-gray-400">Meta Description</label>
                    <span className={`text-xs ${(seoDesc??"").length >= 120 && (seoDesc??"").length <= 160 ? "text-green-400" : "text-yellow-400"}`}>{(seoDesc??"").length}/160</span>
                  </div>
                  <textarea rows={3} value={seoDesc} onChange={e => setSeoDesc(e.target.value)}
                    placeholder="Buy online at best price. Free delivery, easy returns."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-y" />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Focus Keyword</label>
                  <input type="text" value={seoFocusKw} onChange={e => setSeoFocusKw(e.target.value)}
                    placeholder="Enter primary keyword"
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Keywords (comma separated)</label>
                  <input type="text" value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)}
                    placeholder="buy online, best price, free delivery"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">📱 Social (Open Graph)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs text-gray-400 mb-1 block">OG Title</label><input type="text" value={seoOgTitle} onChange={e => setSeoOgTitle(e.target.value)} placeholder="Same as SEO title" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" /></div>
                    <div><label className="text-xs text-gray-400 mb-1 block">OG Image URL</label><input type="text" value={seoOgImage} onChange={e => setSeoOgImage(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" /></div>
                    <div className="md:col-span-2"><label className="text-xs text-gray-400 mb-1 block">OG Description</label><textarea rows={2} value={seoOgDesc} onChange={e => setSeoOgDesc(e.target.value)} placeholder="Same as meta description" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-y" /></div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
                    <input type="checkbox" checked={seoNoIndex} onChange={e => setSeoNoIndex(e.target.checked)} className="accent-red-500" /> Noindex
                  </label>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-700 pt-3">
                  <button onClick={() => void saveSeoMeta()} disabled={seoSaving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50">
                    {seoSaving ? "Saving..." : "💾 Save SEO"}
                  </button>
                  {seoMsg && <span className="text-sm text-green-400">{seoMsg}</span>}
                </div>
              </div>
            )}



                          </div>
                          <div>
                            <p className="font-medium text-white">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sku || "—"} · {product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300 capitalize">{product.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        ${product.price?.toFixed(2) ?? "—"}
                        {product.salePrice && product.salePrice > 0 && (
                          <span className="ml-1 text-xs text-green-400 line-through">${product.salePrice.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_OPTIONS.find((s) => s.value === product.status)?.color ?? "bg-gray-800 text-gray-300"}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.dealType ? (
                          <span className="rounded-full bg-purple-900/40 px-2 py-0.5 text-xs text-purple-400">{product.dealType}</span>
                        ) : product.comboItems?.length > 0 ? (
                          <span className="rounded-full bg-blue-900/40 px-2 py-0.5 text-xs text-blue-400">combo {product.comboItems.length}</span>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => void toggleStatus(product)} title="Toggle publish" className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-green-400">
                            <Send className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setEditing({ ...product, images: [...product.images], comboItems: [...product.comboItems] }); setShowForm(true); setActiveTab("general"); }} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-blue-400">
                            <Settings className="h-4 w-4" />
                          </button>
                          <button onClick={() => { if (product.id) void handleDelete(product.id); }} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PluginToggle({ name, active }: { name: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded p-2 ${active ? "bg-green-900/20 border border-green-800" : "bg-gray-800/50 border border-gray-700"}`}>
      <div className={`h-2 w-2 rounded-full ${active ? "bg-green-400" : "bg-gray-600"}`} />
      <span className={active ? "text-green-400" : "text-gray-500"}>{name}</span>
    </div>
  );
}
