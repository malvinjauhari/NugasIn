/**
 * Document store — manages document state.
 *
 * The document model is the single source of truth.
 * This store holds the current document being edited.
 */

import { create } from "zustand";

export interface Metadata {
  title: string;
  subtitle: string;
  author: string;
  nim: string;
  class_name: string;
  program: string;
  faculty: string;
  institution: string;
  year: number;
  lecturer: string;
  assistant: string;
  group: string;
  module: string;
  additional: Record<string, string>;
}

export interface PageSettings {
  paper: "a4" | "letter" | "legal";
  orientation: "portrait" | "landscape";
  margin_left_cm: number;
  margin_top_cm: number;
  margin_right_cm: number;
  margin_bottom_cm: number;
}

export interface DocumentState {
  metadata: Metadata;
  pageSettings: PageSettings;
  templateName: string | null;
  isDirty: boolean;
  isValid: boolean;
}

interface DocumentActions {
  setMetadata: (metadata: Partial<Metadata>) => void;
  setPageSettings: (settings: Partial<PageSettings>) => void;
  setTemplateName: (name: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsValid: (valid: boolean) => void;
  reset: () => void;
}

const defaultMetadata: Metadata = {
  title: "",
  subtitle: "",
  author: "",
  nim: "",
  class_name: "",
  program: "",
  faculty: "",
  institution: "Telkom University",
  year: new Date().getFullYear(),
  lecturer: "",
  assistant: "",
  group: "",
  module: "",
  additional: {},
};

const defaultPageSettings: PageSettings = {
  paper: "a4",
  orientation: "portrait",
  margin_left_cm: 4.0,
  margin_top_cm: 3.0,
  margin_right_cm: 3.0,
  margin_bottom_cm: 3.0,
};

const initialState: DocumentState = {
  metadata: { ...defaultMetadata },
  pageSettings: { ...defaultPageSettings },
  templateName: null,
  isDirty: false,
  isValid: true,
};

export const useDocumentStore = create<DocumentState & DocumentActions>((set) => ({
  ...initialState,

  setMetadata: (metadata) =>
    set((state) => ({
      metadata: { ...state.metadata, ...metadata },
      isDirty: true,
    })),

  setPageSettings: (settings) =>
    set((state) => ({
      pageSettings: { ...state.pageSettings, ...settings },
      isDirty: true,
    })),

  setTemplateName: (name) => set({ templateName: name, isDirty: true }),

  setIsDirty: (dirty) => set({ isDirty: dirty }),

  setIsValid: (valid) => set({ isValid: valid }),

  reset: () => set({ ...initialState }),
}));
