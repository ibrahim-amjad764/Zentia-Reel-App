import { create } from "zustand";

type StoreState = {
  dark: boolean;
  toggleDark: () => void;
};

export const useStore = create<StoreState>((set) => ({
  dark: true, // default theme
  toggleDark: () =>
    set((state) => ({ dark: !state.dark })), // toggle theme
}));