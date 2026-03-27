import { create } from "zustand";
export const useStore = create((set) => ({
    dark: true, // default theme
    toggleDark: () => set((state) => ({ dark: !state.dark })), // toggle theme
}));
