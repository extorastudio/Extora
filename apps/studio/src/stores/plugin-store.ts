import { create } from "zustand";
import apiClient from "../api/client";

interface Plugin {
  id: string;
  name: string;
  title: string;
  version: string;
  author: string;
  isActive: boolean;
  description?: string;
  installedAt: string;
}

interface PluginStore {
  plugins: Plugin[];
  isLoading: boolean;
  error: string | null;
  successMsg: string | null;
  fetchPlugins: () => Promise<void>;
  togglePlugin: (name: string, activate: boolean) => Promise<void>;
  installPlugin: (manifest: Record<string, unknown>) => Promise<void>;
  uninstallPlugin: (name: string) => Promise<void>;
  discoverPlugins: () => Promise<void>;
  clearMsg: () => void;
}

export const usePluginStore = create<PluginStore>((set, get) => ({
  plugins: [],
  isLoading: false,
  error: null,
  successMsg: null,

  fetchPlugins: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get("/plugins");
      set({ plugins: Array.isArray(data) ? data : data.data ?? [], isLoading: false });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message ?? "Failed to load plugins";
      set({ error: msg, isLoading: false });
    }
  },

  togglePlugin: async (name: string, activate: boolean) => {
    try {
      if (activate) {
        await apiClient.post(`/plugins/${encodeURIComponent(name)}/activate`, { name });
      } else {
        await apiClient.post(`/plugins/${encodeURIComponent(name)}/deactivate`, { name });
      }
      await get().fetchPlugins();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message ?? "Failed to toggle plugin";
      set({ error: msg });
    }
  },

  installPlugin: async (manifest: Record<string, unknown>) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post("/plugins/install", { manifest });
      set({ successMsg: "Plugin installed successfully" });
      await get().fetchPlugins();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      set({ error: axiosErr.response?.data?.message ?? "Failed to install plugin" });
      set({ isLoading: false });
    }
  },

  uninstallPlugin: async (name: string) => {
    if (!confirm(`Uninstall ${name}? This cannot be undone.`)) return;
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/plugins/${encodeURIComponent(name)}`);
      set({ successMsg: `Plugin "${name}" uninstalled` });
      await get().fetchPlugins();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      set({ error: axiosErr.response?.data?.message ?? "Failed to uninstall plugin" });
      set({ isLoading: false });
    }
  },

  discoverPlugins: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post("/plugins/discover");
      set({ successMsg: `Discovered ${(data)?.discovered ?? data?.plugins?.length ?? 0} new plugins` });
      await get().fetchPlugins();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      set({ error: axiosErr.response?.data?.message ?? "Failed to discover plugins" });
      set({ isLoading: false });
    }
  },

  clearMsg: () => set({ successMsg: null, error: null }),
}));
