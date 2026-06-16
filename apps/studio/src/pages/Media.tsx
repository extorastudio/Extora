import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Image, Plus, Trash2, RefreshCw, Copy, Check, X } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/media");
      setItems(Array.isArray(data) ? data : data.data ?? []);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { void fetchMedia(); }, []);

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.exec(newUrl) ?? newUrl.includes("youtube") ?? newUrl.includes("vimeo");
    try {
      await apiClient.post("/media", {
        url: newUrl,
        filename: newName || // eslint-disable-next-line
    newUrl.split("/").pop() || "media",
        originalName: newName || // eslint-disable-next-line
    newUrl.split("/").pop() || "media",
        mimeType: isVideo ? "video/mp4" : "image/png",
        size: 0,
        width: 800,
        height: 600,
      });
      setShowAdd(false);
      setNewUrl("");
      setNewName("");
      void fetchMedia();
    } catch (err: unknown) { console.error("Upload failed", err); }
  };

  const handleDelete = async (id: string) => {
    try { await apiClient.delete(`/media/${encodeURIComponent(id)}`); void fetchMedia(); }
    catch (err: unknown) { console.error("Delete failed", err); }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => { setCopied(url); setTimeout(() => { setCopied(null); }, 2000); }).catch(() => { /* ignore */ });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isVideo = (item: MediaItem) => item.mimeType.startsWith("video") || item.url.includes("youtube") || item.url.includes("vimeo");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Media Library</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => void fetchMedia()} className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => { setShowAdd(true); }} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add Media
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Add Media</h3>
            <button onClick={() => { setShowAdd(false); }} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Image/Video URL *</label>
              <input type="text" value={newUrl} onChange={(e) => { setNewUrl(e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" placeholder="https://example.com/image.jpg" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Display Name</label>
              <input type="text" value={newName} onChange={(e) => { setNewName(e.target.value); }} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" placeholder="My Image" />
            </div>
          </div>
          {newUrl && (
            <div className="mt-4 p-3 rounded-lg border border-gray-700 bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-2">Preview:</p>
              {/\.(mp4|webm|ogg|mov)(\?|$)/i.exec(newUrl) ?? newUrl.includes("youtube") ? (
                <p className="text-sm text-blue-400">Video URL — will embed on site</p>
              ) : (
                <img src={newUrl} alt="Preview" className="max-h-40 rounded object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button onClick={() => void handleAdd()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Add to Library</button>
            <button onClick={() => { setShowAdd(false); }} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading media library...</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <Image className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">Media library is empty</p>
          <p className="mt-1 text-sm text-gray-500">Add images and videos to use in your content</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-lg border border-gray-800 bg-gray-900 overflow-hidden cursor-pointer" onClick={() => { setSelected(item); }}>
              <div className="aspect-square flex items-center justify-center bg-gray-800">
                {isVideo(item) ? (
                  <div className="flex flex-col items-center gap-1 text-gray-500">
                    <Image className="h-8 w-8" />
                    <span className="text-xs">VIDEO</span>
                  </div>
                ) : (
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-300 truncate">{item.filename}</p>
                <p className="text-xs text-gray-500">{formatSize(item.size)}</p>
              </div>
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }} className="rounded bg-gray-700 p-2 text-white hover:bg-gray-600" title="Copy URL">
                  {copied === item.url ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); void handleDelete(item.id); }} className="rounded bg-red-600 p-2 text-white hover:bg-red-500" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => { setSelected(null); }}>
          <div className="max-w-3xl w-full max-h-[85vh] rounded-xl border border-gray-700 bg-gray-900 p-6 overflow-auto" onClick={(e) => { e.stopPropagation(); }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selected.filename}</h3>
              <button onClick={() => { setSelected(null); }} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex items-center justify-center bg-gray-800 rounded-lg p-4 mb-4">
              {isVideo(selected) ? (
                selected.url.includes("youtube") ? (
                  <iframe width="100%" height="400" src={selected.url.replace("watch?v=", "embed/")} allowFullScreen className="rounded" />
                ) : (
                  <video controls className="max-h-[400px] max-w-full rounded"><source src={selected.url} /></video>
                )
              ) : (
                <img src={selected.url} alt={selected.filename} className="max-h-[400px] max-w-full rounded object-contain" />
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-gray-500 text-xs">URL</p><p className="text-gray-300 truncate">{selected.url}</p></div>
              <div><p className="text-gray-500 text-xs">Type</p><p className="text-gray-300">{selected.mimeType}</p></div>
              <div><p className="text-gray-500 text-xs">Size</p><p className="text-gray-300">{formatSize(selected.size)}</p></div>
              <div><p className="text-gray-500 text-xs">Dimensions</p><p className="text-gray-300">{selected.width}×{selected.height}</p></div>
              <div><p className="text-gray-500 text-xs">Added</p><p className="text-gray-300">{new Date(selected.createdAt).toLocaleDateString()}</p></div>
              <div>
                <button onClick={() => { copyUrl(selected.url); }} className="rounded bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-600">
                  {copied === selected.url ? "Copied!" : "Copy URL"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
