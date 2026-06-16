/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useState, useRef, useCallback } from "react";
import apiClient from "../api/client";
import { Image, Plus, Trash2, RefreshCw, Copy, Check, X, Upload, FileText, Film, File, Music } from "lucide-react";
import { GridSkeleton } from "../components/ui/Skeleton";

interface MediaItem {
  id: string; filename: string; originalName: string; mimeType: string;
  size: number; width: number | null; height: number | null; url: string;
  thumbnailUrl: string | null; createdAt: string;
}

function getFileType(mime: string): "image" | "video" | "audio" | "pdf" | "doc" | "sheet" | "slide" | "archive" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("word") || mime.includes("document") || mime.includes("msword")) return "doc";
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv")) return "sheet";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "slide";
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar") || mime.includes("gz")) return "archive";
  return "other";
}

function FileIcon({ type, className }: { type: ReturnType<typeof getFileType>; className?: string }) {
  switch (type) {
    case "image": return <Image className={className} />;
    case "video": return <Film className={className} />;
    case "audio": return <Music className={className} />;
    case "pdf": return <FileText className={className} />;
    case "doc": return <FileText className={className} />;
    case "sheet": return <File className={className} />;
    case "slide": return <File className={className} />;
    case "archive": return <File className={className} />;
    default: return <FileText className={className} />;
  }
}

function fileTypeLabel(type: ReturnType<typeof getFileType>): string {
  switch (type) {
    case "image": return "Image";
    case "video": return "Video";
    case "audio": return "Audio";
    case "pdf": return "PDF";
    case "doc": return "Document";
    case "sheet": return "Spreadsheet";
    case "slide": return "Presentation";
    case "archive": return "Archive";
    default: return "File";
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<"file" | "url">("file");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ file: string; percent: number; loaded: number; total: number; speed: string } | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/media");
      setItems(Array.isArray(data) ? data : data.data ?? []);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void fetchMedia(); }, [fetchMedia]);

  const handleFileUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    let done = 0;
    let lastLoaded = 0;
    let lastTime = Date.now();

    for (const file of uploadFiles) {
      try {
        setUploadProgress({ file: file.name, percent: 0, loaded: 0, total: file.size, speed: "0 KB/s" });
        setUploadedCount(done);
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/v1/media/upload");
          const token = localStorage.getItem("accessToken") ?? "";
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const now = Date.now();
              const dt = (now - lastTime) / 1000;
              const speed = dt > 0 ? ((e.loaded - lastLoaded) / dt) : 0;
              lastLoaded = e.loaded; lastTime = now;
              const spd = speed > 1048576 ? `${(speed / 1048576).toFixed(1)} MB/s` : speed > 1024 ? `${(speed / 1024).toFixed(0)} KB/s` : `${speed.toFixed(0)} B/s`;
              setUploadProgress({ file: file.name, percent: Math.round((e.loaded / e.total) * 100), loaded: e.loaded, total: e.total, speed: spd });
            }
          };
          xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { done++; setUploadedCount(done); resolve(); } else reject(new Error(`Status ${xhr.status}`)); };
          xhr.onerror = () => reject(new Error("Network error"));
          const form = new FormData();
          form.append("file", file);
          xhr.send(form);
        });
      } catch { /* skip failed file */ }
    }
    setUploading(false); setUploadProgress(null); setUploadFiles([]); setShowAdd(false);
    void fetchMedia();
  };

  const handleUrlAdd = async () => {
    if (!newUrl.trim()) return;
    try { await apiClient.post("/media", { url: newUrl, filename: newName || (newUrl.split("/").pop() ?? "media"), originalName: newName || (newUrl.split("/").pop() ?? "media"), mimeType: "image/png", size: 0 }); setNewUrl(""); setNewName(""); setShowAdd(false); void fetchMedia(); }
    catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try { await apiClient.delete(`/media/${encodeURIComponent(id)}`); void fetchMedia(); } catch { /* ignore */ }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => { setCopied(url); setTimeout(() => setCopied(null), 2000); }).catch(() => {});
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files) setUploadFiles((prev) => [...prev, ...Array.from(files)]);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Media Library</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { void fetchMedia(); }} className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => { setShowAdd(true); setAddMode("file"); }} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add Media
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Add Media</h3>
            <button onClick={() => { setShowAdd(false); setUploadFiles([]); }} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setAddMode("file")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${addMode === "file" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}><Upload className="h-3.5 w-3.5 inline mr-1" /> Upload Files</button>
            <button onClick={() => setAddMode("url")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${addMode === "url" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}><Image className="h-3.5 w-3.5 inline mr-1" /> From URL</button>
          </div>

          {addMode === "file" ? (
            <>
              <div className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-blue-400 bg-blue-900/20" : "border-gray-600 hover:border-gray-500"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                <p className="text-sm text-gray-400">Drop files here or click to browse</p>
                <p className="text-xs text-gray-500 mt-1">Images, Video, Audio, PDF, Docs, Archives — up to 500 MB</p>
                <input ref={fileInputRef} type="file" multiple accept="*" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
              </div>

              {uploadFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {uploadFiles.map((f, i) => {
                    const ftype = f.type.startsWith("image/") ? "image" : f.type.startsWith("video/") ? "video" : f.type.startsWith("audio/") ? "audio" : "other";
                    return (
                      <div key={i} className="relative group rounded-lg border border-gray-700 bg-gray-800 overflow-hidden">
                        <div className="aspect-square flex items-center justify-center bg-gray-900 p-2">
                          {ftype === "image" ? <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover rounded" /> :
                           ftype === "video" ? <video src={URL.createObjectURL(f)} className="w-full h-full object-cover rounded" muted /> :
                           <FileIcon type={ftype === "audio" ? "audio" : "other"} className="h-10 w-10 text-gray-500" />}
                        </div>
                        <div className="p-1.5">
                          <p className="text-xs text-gray-300 truncate">{f.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ftype === "image" ? "bg-green-900/40 text-green-400" : ftype === "video" ? "bg-purple-900/40 text-purple-400" : "bg-gray-700 text-gray-400"}`}>
                            {ftype.toUpperCase()} · {formatSize(f.size)}
                          </span>
                        </div>
                        <button onClick={() => setUploadFiles(uploadFiles.filter((_, j) => j !== i))} className="absolute top-1 right-1 rounded bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                      </div>
                    );
                  })}
                </div>
              )}

              {uploadProgress && (
                <div className="mt-4 rounded-xl border border-blue-800 bg-blue-900/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-sm font-medium text-white truncate max-w-[300px]">{uploadProgress.file}</span>
                    </div>
                    <span className="text-sm font-bold text-blue-400">{uploadProgress.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-out" style={{ width: `${uploadProgress.percent}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{formatSize(uploadProgress.loaded)} / {formatSize(uploadProgress.total)}</span>
                    <span className="text-xs text-gray-500">{uploadProgress.speed}</span>
                  </div>
                  {uploadedCount > 0 && <p className="text-xs text-green-400 mt-2">{uploadedCount} of {uploadFiles.length} uploaded</p>}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button onClick={() => { void handleFileUpload(); }} disabled={uploading || uploadFiles.length === 0} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {uploading ? `${uploadProgress ? uploadProgress.percent : 0}% Uploading...` : `Upload ${uploadFiles.length} file${uploadFiles.length !== 1 ? "s" : ""}`}
                </button>
                <button onClick={() => { if (!uploading) { setShowAdd(false); setUploadFiles([]); } }} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 disabled:opacity-30" disabled={uploading}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Image/Video URL *</label>
                  <input type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" placeholder="https://example.com/image.jpg" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Display Name</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" placeholder="My Image" />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => { void handleUrlAdd(); }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Add to Library</button>
                <button onClick={() => setShowAdd(false)} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800">Cancel</button>
              </div>
            </>
          )}
        </div>
      )}

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <Image className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">Media library is empty</p>
          <p className="mt-1 text-sm text-gray-500">Upload images, videos, audio, documents and more</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item) => {
            const ftype = getFileType(item.mimeType);
            return (
              <div key={item.id} className="group relative rounded-lg border border-gray-800 bg-gray-900 overflow-hidden cursor-pointer" onClick={() => setSelected(item)}>
                <div className="aspect-square flex items-center justify-center bg-gray-800 p-3">
                  {ftype === "image" ? (
                    <img src={item.url} alt={item.filename} className="w-full h-full object-cover rounded" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : ftype === "video" ? (
                    <video src={item.url} className="w-full h-full object-cover rounded" preload="metadata" muted />
                  ) : ftype === "audio" ? (
                    <div className="flex flex-col items-center gap-1">
                      <Music className="h-8 w-8 text-yellow-400" />
                      <span className="text-[10px] text-yellow-400 font-medium">AUDIO</span>
                    </div>
                  ) : ftype === "pdf" ? (
                    <div className="flex flex-col items-center gap-1">
                      <FileText className="h-8 w-8 text-red-400" />
                      <span className="text-[10px] text-red-400 font-medium">PDF</span>
                    </div>
                  ) : ftype === "doc" ? (
                    <div className="flex flex-col items-center gap-1">
                      <FileText className="h-8 w-8 text-blue-400" />
                      <span className="text-[10px] text-blue-400 font-medium">DOC</span>
                    </div>
                  ) : ftype === "sheet" ? (
                    <div className="flex flex-col items-center gap-1">
                      <File className="h-8 w-8 text-green-400" />
                      <span className="text-[10px] text-green-400 font-medium">SHEET</span>
                    </div>
                  ) : ftype === "slide" ? (
                    <div className="flex flex-col items-center gap-1">
                      <File className="h-8 w-8 text-orange-400" />
                      <span className="text-[10px] text-orange-400 font-medium">SLIDE</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <FileText className="h-8 w-8 text-gray-500" />
                      <span className="text-[10px] text-gray-500 font-medium">FILE</span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-300 truncate">{item.filename}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400">{fileTypeLabel(ftype)}</span>
                    <span className="text-[10px] text-gray-500">{formatSize(item.size)}</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }} className="rounded bg-gray-700 p-2 text-white hover:bg-gray-600" title="Copy URL">
                    {copied === item.url ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); void handleDelete(item.id); }} className="rounded bg-red-600 p-2 text-white hover:bg-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
          <div className="max-w-3xl w-full max-h-[90vh] rounded-xl border border-gray-700 bg-gray-900 p-6 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selected.filename}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex items-center justify-center bg-gray-800 rounded-lg p-4 mb-4 min-h-[200px]">
              {getFileType(selected.mimeType) === "image" ? (
                <img src={selected.url} alt={selected.filename} className="max-h-[400px] max-w-full rounded object-contain" />
              ) : getFileType(selected.mimeType) === "video" ? (
                <video controls className="max-h-[400px] max-w-full rounded"><source src={selected.url} type={selected.mimeType} /></video>
              ) : getFileType(selected.mimeType) === "audio" ? (
                <div className="text-center py-12"><Music className="h-16 w-16 text-yellow-400 mx-auto mb-4" /><audio controls className="w-full max-w-md"><source src={selected.url} type={selected.mimeType} /></audio></div>
              ) : getFileType(selected.mimeType) === "pdf" ? (
                <div className="text-center py-12"><FileText className="h-16 w-16 text-red-400 mx-auto mb-4" /><p className="text-gray-400 mb-2">PDF Document</p><a href={selected.url} target="_blank" rel="noreferrer" className="text-blue-400 text-sm underline">Open in new tab</a></div>
              ) : (
                <div className="text-center py-12"><FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" /><p className="text-gray-400">{fileTypeLabel(getFileType(selected.mimeType))}</p><a href={selected.url} download className="mt-2 inline-block text-blue-400 text-sm underline">Download file</a></div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-gray-500 text-xs">Type</p><span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-300">{fileTypeLabel(getFileType(selected.mimeType))}</span></div>
              <div><p className="text-gray-500 text-xs">MIME</p><p className="text-gray-300">{selected.mimeType}</p></div>
              <div><p className="text-gray-500 text-xs">Size</p><p className="text-gray-300">{formatSize(selected.size)}</p></div>
              <div><p className="text-gray-500 text-xs">Added</p><p className="text-gray-300">{new Date(selected.createdAt).toLocaleDateString()}</p></div>
              <div><button onClick={() => copyUrl(selected.url)} className="rounded bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-600">{copied === selected.url ? "Copied!" : "Copy URL"}</button></div>
              <div><a href={selected.url} download className="rounded bg-green-700 px-3 py-1.5 text-xs text-white hover:bg-green-600 inline-block">Download</a></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
