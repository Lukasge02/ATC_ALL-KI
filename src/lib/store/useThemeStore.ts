import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ThemeMode } from "../types";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "../constants";

interface ThemeState {
  mode: ThemeMode;
  systemTheme: "light" | "dark";
  actualTheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  setSystemTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: DEFAULT_SETTINGS.theme,
      systemTheme: "light",
      actualTheme: "light",

      setMode: (mode: ThemeMode) => {
        set({ mode });
        const { systemTheme } = get();
        const actualTheme = mode === "system" ? systemTheme : mode;
        set({ actualTheme });
        updateDocumentTheme(actualTheme);
      },

      setSystemTheme: (systemTheme: "light" | "dark") => {
        set({ systemTheme });
        const { mode } = get();
        if (mode === "system") {
          set({ actualTheme: systemTheme });
          updateDocumentTheme(systemTheme);
        }
      },

      toggleTheme: () => {
        const { mode } = get();
        const newMode = mode === "light" ? "dark" : "light";
        get().setMode(newMode);
      },

      initializeTheme: () => {
        // Detect system theme
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        
        set({ systemTheme });
        
        const { mode } = get();
        const actualTheme = mode === "system" ? systemTheme : mode;
        set({ actualTheme });
        updateDocumentTheme(actualTheme);

        // Listen for system theme changes
        mediaQuery.addEventListener("change", (e) => {
          get().setSystemTheme(e.matches ? "dark" : "light");
        });
      },
    }),
    {
      name: STORAGE_KEYS.theme,
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

function updateDocumentTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}