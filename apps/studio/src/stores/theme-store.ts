import { create } from "zustand";
import apiClient from "../api/client";

interface Theme {
  id: string;
  name: string;
  title: string;
  version: string;
  author: string;
  isActive: boolean;
  installedAt: string;
}

interface ThemeStore {
  themes: Theme[];
  isLoading: boolean;
  fetchThemes: () => Promise<void>;
  activateTheme: (name: string) => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  themes: [],
  isLoading: false,

  fetchThemes: async () => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get("/themes");
      set({ themes: Array.isArray(data) ? data : data.data ?? [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  activateTheme: async (name: string) => {
    await apiClient.post(`/themes/${name}/activate`);
    await get().fetchThemes();
  },
}));
