import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { FileText, Plus, Save, Trash2, RefreshCw, Send } from "lucide-react";
import { TableSkeleton } from "../components/ui/Skeleton";

interface ContentEntry {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_ENTRY: Partial<ContentEntry> = {
  title: "",
  body: "",
  excerpt: "",
  type: "page",
  status: "draft",
};

export default function ContentPage() {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ContentEntry> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("");

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const url = filterType ? `/content?type=${filterType}` : "/content";
      const { data } = await apiClient.get(url);
      setEntries(Array.isArray(data) ? data : data.data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchEntries();
  }, [filterType]);

  const handleSave = async () => {
    if (!editing?.title?.trim()) return;
    try {
      if (editing.id) {
        await apiClient.patch(`/content/${encodeURIComponent(editing.id)}`, editing);
      } else {
        await apiClient.post("/content", editing);
      }
      setShowForm(false);
      setEditing(null);
      void fetchEntries();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      console.error(axiosErr.response?.data?.message ?? "Save failed");
    }
  };

  const toggleStatus = async (entry: ContentEntry) => {
    const newStatus = entry.status === "published" ? "draft" : "published";
    await apiClient.patch(`/content/${encodeURIComponent(entry.id)}`, { status: newStatus });
    void fetchEntries();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/content/${encodeURIComponent(id)}`);
      void fetchEntries();
    } catch (err: unknown) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Content</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="page">Pages</option>
            <option value="post">Blog Posts</option>
            <option value="product_desc">Product Descriptions</option>
          </select>
          <button
            onClick={() => void fetchEntries()}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { setEditing({ ...DEFAULT_ENTRY }); setShowForm(true); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Entry
          </button>
        </div>
      </div>

      {showForm && editing && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {editing.id ? "Edit Entry" : "New Entry"}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Title *</label>
              <input
                type="text"
                value={editing.title ?? ""}
                onChange={(e) => { setEditing({ ...editing, title: e.target.value }); }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="Entry title"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Type</label>
              <select
                value={editing.type ?? "page"}
                onChange={(e) => { setEditing({ ...editing, type: e.target.value }); }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="page">Page</option>
                <option value="post">Blog Post</option>
                <option value="product_desc">Product Description</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Status</label>
              <select
                value={editing.status ?? "draft"}
                onChange={(e) => { setEditing({ ...editing, status: e.target.value }); }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Excerpt</label>
              <input
                type="text"
                value={editing.excerpt ?? ""}
                onChange={(e) => { setEditing({ ...editing, excerpt: e.target.value }); }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="Short description"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-gray-400">Content (HTML)</label>
            <textarea
              value={editing.body ?? ""}
              onChange={(e) => { setEditing({ ...editing, body: e.target.value }); }}
              className="w-full min-h-[200px] rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none font-mono"
              placeholder="<h1>Hello World</h1><p>Your content here...</p>"
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
        <TableSkeleton rows={5} />
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">No content entries yet</p>
          <p className="mt-1 text-sm text-gray-500">Create pages, blog posts, or product descriptions</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-900/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{entry.title}</p>
                      <p className="text-xs text-gray-500">/{entry.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300 capitalize">{entry.type.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${entry.status === "published" ? "bg-green-900/40 text-green-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(entry.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => void toggleStatus(entry)}
                        title={entry.status === "published" ? "Unpublish" : "Publish"}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-green-400"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setEditing(entry); setShowForm(true); }}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-blue-400"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(entry.id)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400"
                      >
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
    </div>
  );
}
