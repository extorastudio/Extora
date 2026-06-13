import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { HardDrive, Download, Clock, Plus } from "lucide-react";

interface Backup {
  id: string;
  type?: string;
  size?: number;
  note?: string;
  status: string;
  createdAt: string;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const { data } = await apiClient.get("/backups");
        setBackups(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        // Backups endpoint may not be implemented yet
        setBackups([]);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchBackups();
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Backups</h2>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Create Backup
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading backups...</div>
      ) : backups.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <HardDrive className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">No backups found</p>
          <p className="mt-1 text-sm text-gray-500">Create your first backup to protect your data</p>
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map((backup) => (
            <div key={backup.id} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                <HardDrive className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{backup.type ?? "Full Backup"}</p>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(backup.createdAt).toLocaleString()}
                  </span>
                  {backup.size && <span>{formatBytes(backup.size)}</span>}
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${backup.status === "completed" ? "bg-green-900/40 text-green-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                {backup.status}
              </span>
              <button className="rounded p-2 text-gray-400 hover:bg-gray-800 hover:text-white" title="Download">
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h3 className="mb-2 font-medium text-white">Backup Schedule</h3>
        <p className="text-sm text-gray-400">Configure automatic backup schedules in Settings</p>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
