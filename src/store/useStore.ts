import { create } from "zustand";

type ThemeMode = "light" | "dark";

type StoreState = {
  /**
   * PURPOSE: Single source of truth for UI color mode.
   * The app must NOT follow system preferences; only the dedicated toggle can change this.
   */
  mode: ThemeMode;
  /**
   * PURPOSE: Whether initial mode was loaded from storage (prevents flicker/overwrites).
   */
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  hydrateTheme: () => void;
};

const STORAGE_KEY = "ui:mode";

const applyModeToDom = (mode: ThemeMode) => {
  const root = document.documentElement;
  const shouldBeDark = mode === "dark";
  root.classList.toggle("dark", shouldBeDark);
  console.log("[Theme] Applied mode to DOM:", mode);
};

export const useStore = create<StoreState>((set) => ({
  mode: "dark",
  hydrated: false,
  setMode: (mode) =>
    set(() => {
      console.log("[Theme] setMode called:", mode);
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch (err) {
        console.warn("[Theme] Failed to persist mode:", err);
      }
      applyModeToDom(mode);
      return { mode };
    }),
  toggleMode: () =>
    set((state) => {
      const next: ThemeMode = state.mode === "dark" ? "light" : "dark";
      console.log("[Theme] toggleMode:", state.mode, "→", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (err) {
        console.warn("[Theme] Failed to persist mode:", err);
      }
      applyModeToDom(next);
      return { mode: next };
    }),
  hydrateTheme: () =>
    set((state) => {
      if (state.hydrated) return state;
      let stored: ThemeMode | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        stored = raw === "light" || raw === "dark" ? raw : null;
      } catch (err) {
        console.warn("[Theme] Failed to read persisted mode:", err);
      }

      const mode: ThemeMode = stored ?? "dark";
      console.log("[Theme] hydrateTheme resolved:", { stored, mode });
      applyModeToDom(mode);
      return { mode, hydrated: true };
    }),
}));