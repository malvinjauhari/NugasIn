/**
 * UI store — manages UI state (panel sizes, active tabs, etc.).
 */

import { create } from "zustand";

export type ConfigTab = "template" | "metadata" | "assets" | "formatting";

interface UIState {
  configTab: ConfigTab;
  isConfigOpen: boolean;
  isGenerating: boolean;
  validationErrors: string[];
}

interface UIActions {
  setConfigTab: (tab: ConfigTab) => void;
  toggleConfig: () => void;
  setIsGenerating: (generating: boolean) => void;
  setValidationErrors: (errors: string[]) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  configTab: "template",
  isConfigOpen: true,
  isGenerating: false,
  validationErrors: [],

  setConfigTab: (tab) => set({ configTab: tab }),
  toggleConfig: () => set((state) => ({ isConfigOpen: !state.isConfigOpen })),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
}));
