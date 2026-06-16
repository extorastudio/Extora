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
  fetchPlugins: () => Promise<void>;
  togglePlugin: (name: string, activate: boolean) => Promise<void>;
}

export const usePluginStore = create<PluginStore>((set, get) => ({
  plugins: [],
  isLoading: false,
  error: null,

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
}));
