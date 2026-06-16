import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Package, Plus, Save, Trash2, RefreshCw } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  inStock: boolean;
  sku: string;
  imageUrl: string;
}

const DEFAULT_PRODUCT: Product = {
  id: "",
  name: "",
  price: 0,
  category: "General",
  description: "",
  inStock: true,
  sku: "",
  imageUrl: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/commerce/products");
      setProducts(Array.isArray(data) ? data : data.data ?? data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim() || editing.price <= 0) return;

    try {
      await apiClient.post("/commerce/products", editing);
      setShowForm(false);
      setEditing(null);
      void fetchProducts();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      console.error(axiosErr.response?.data?.message ?? "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/commerce/products/${encodeURIComponent(id)}`);
      void fetchProducts();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      console.error(axiosErr.response?.data?.message ?? "Delete failed");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchProducts()}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { setEditing({ ...DEFAULT_PRODUCT }); setShowForm(true); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {showForm && editing && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {editing.id ? "Edit Product" : "New Product"}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Name *</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => { setEditing({ ...editing, name: e.target.value }); }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">SKU</label>
              <input
                type="text"
                value={editing.sku}
                onChange={(e) => { setEditing({ ...editing, sku: e.target.value }); }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="SKU-001"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Price *</label>
              <input
                type="number"
                value={editing.price || ""}
                onChange={(e) => { setEditing({ ...editing, price: Number(e.target.value) }); }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="99.99"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Category</label>
              <select
                value={editing.category}
                onChange={(e) => { setEditing({ ...editing, category: e.target.value }); }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option>General</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home & Kitchen</option>
                <option>Books</option>
                <option>Sports</option>
                <option>Toys</option>
                <option>Health</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Image URL</label>
              <input
                type="text"
                value={editing.imageUrl}
                onChange={(e) => { setEditing({ ...editing, imageUrl: e.target.value }); }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={editing.inStock}
                  onChange={(e) => { setEditing({ ...editing, inStock: e.target.checked }); }}
                  className="rounded border-gray-600 bg-gray-800"
                />
                In Stock
              </label>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-gray-400">Description</label>
            <textarea
              value={editing.description}
              onChange={(e) => { setEditing({ ...editing, description: e.target.value }); }}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Product description..."
            />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => void handleSave()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" /> Save
            </button>
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">No products yet</p>
          <p className="mt-1 text-sm text-gray-500">Click "Add Product" to create your first product</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-900/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">{product.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.inStock ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                      {product.inStock ? "In Stock" : "Out"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => void handleDelete(product.id)}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
