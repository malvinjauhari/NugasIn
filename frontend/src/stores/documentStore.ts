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

export interface HeadingFormat {
  level: number;
  font_family: string;
  font_size: number;
  bold: boolean;
  italic: boolean;
  alignment: "left" | "center" | "right";
  space_before_pt: number;
  space_after_pt: number;
  numbering_format: string;
}

export interface SectionPageNumberingConfig {
  enabled: boolean;
  format: "decimal" | "lower_roman" | "upper_roman";
  numbering_type: "none" | "roman" | "arabic" | "continue";
  start_value?: number;
}

export interface FormattingState {
  page: {
    paper: "a4" | "letter" | "legal";
    orientation: "portrait" | "landscape";
    margin_top_cm: number;
    margin_bottom_cm: number;
    margin_left_cm: number;
    margin_right_cm: number;
  };
  pageNumbers: {
    enabled: boolean;
    format: "decimal" | "lower_roman" | "upper_roman";
    position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
    different_first_page: boolean;
  };
  sectionPageNumbers: Record<string, SectionPageNumberingConfig>;
  typography: {
    font_family: string;
    font_size: number;
    bold: boolean;
    italic: boolean;
    alignment: "left" | "center" | "right" | "justify";
  };
  paragraph: {
    line_spacing: number;
    space_before_pt: number;
    space_after_pt: number;
    first_line_indent_cm: number;
    left_indent_cm: number;
    right_indent_cm: number;
  };
  headings: HeadingFormat[];
  tables: {
    alignment: "left" | "center" | "right";
    width_percent: number;
    border_width_pt: number;
    header_bold: boolean;
    header_background: string;
    cell_padding_pt: number;
  };
  images: {
    max_width_cm: number;
    max_height_cm: number;
    alignment: "left" | "center" | "right";
  };
  headerFooter: {
    header_enabled: boolean;
    header_content: string;
    header_alignment: "left" | "center" | "right";
    footer_enabled: boolean;
    footer_content: string;
    footer_alignment: "left" | "center" | "right";
    different_first_page: boolean;
  };
}

export interface DocumentState {
  metadata: Metadata;
  pageSettings: PageSettings;
  templateName: string | null;
  documentId: string | null;
  formatting: FormattingState;
  isDirty: boolean;
  isValid: boolean;
}

interface DocumentActions {
  setMetadata: (metadata: Partial<Metadata>) => void;
  setPageSettings: (settings: Partial<PageSettings>) => void;
  setTemplateName: (name: string | null) => void;
  setDocumentId: (id: string | null) => void;
  setFormatting: (formatting: Partial<FormattingState>) => void;
  setHeadingFormat: (level: number, heading: Partial<HeadingFormat>) => void;
  setSectionPageNumbering: (sectionTitle: string, config: SectionPageNumberingConfig) => void;
  initFormattingFromTemplate: (templateDef: Record<string, unknown>) => void;
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

const defaultFormatting: FormattingState = {
  page: {
    paper: "a4",
    orientation: "portrait",
    margin_top_cm: 3.0,
    margin_bottom_cm: 3.0,
    margin_left_cm: 4.0,
    margin_right_cm: 3.0,
  },
  pageNumbers: {
    enabled: true,
    format: "decimal",
    position: "bottom-center",
    different_first_page: false,
  },
  sectionPageNumbers: {},
  typography: {
    font_family: "Times New Roman",
    font_size: 12,
    bold: false,
    italic: false,
    alignment: "justify",
  },
  paragraph: {
    line_spacing: 1.5,
    space_before_pt: 0,
    space_after_pt: 0,
    first_line_indent_cm: 1.27,
    left_indent_cm: 0,
    right_indent_cm: 0,
  },
  headings: [
    {
      level: 1,
      font_family: "Times New Roman",
      font_size: 14,
      bold: true,
      italic: false,
      alignment: "center",
      space_before_pt: 24,
      space_after_pt: 12,
      numbering_format: "none",
    },
    {
      level: 2,
      font_family: "Times New Roman",
      font_size: 12,
      bold: true,
      italic: false,
      alignment: "left",
      space_before_pt: 12,
      space_after_pt: 6,
      numbering_format: "decimal",
    },
    {
      level: 3,
      font_family: "Times New Roman",
      font_size: 12,
      bold: true,
      italic: false,
      alignment: "left",
      space_before_pt: 12,
      space_after_pt: 6,
      numbering_format: "none",
    },
    {
      level: 4,
      font_family: "Times New Roman",
      font_size: 12,
      bold: true,
      italic: false,
      alignment: "left",
      space_before_pt: 12,
      space_after_pt: 6,
      numbering_format: "none",
    },
  ],
  tables: {
    alignment: "center",
    width_percent: 100,
    border_width_pt: 0.5,
    header_bold: true,
    header_background: "",
    cell_padding_pt: 4,
  },
  images: {
    max_width_cm: 15,
    max_height_cm: 20,
    alignment: "center",
  },
  headerFooter: {
    header_enabled: false,
    header_content: "",
    header_alignment: "center",
    footer_enabled: true,
    footer_content: "",
    footer_alignment: "center",
    different_first_page: false,
  },
};

const initialState: DocumentState = {
  metadata: { ...defaultMetadata },
  pageSettings: { ...defaultPageSettings },
  templateName: null,
  documentId: null,
  formatting: { ...defaultFormatting },
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

  setDocumentId: (id) => set({ documentId: id }),

  setFormatting: (formatting) =>
    set((state) => ({
      formatting: { ...state.formatting, ...formatting },
      isDirty: true,
    })),

  setHeadingFormat: (level, heading) =>
    set((state) => {
      const headings = state.formatting.headings.map((h) =>
        h.level === level ? { ...h, ...heading } : h
      );
      return {
        formatting: { ...state.formatting, headings },
        isDirty: true,
      };
    }),

  setSectionPageNumbering: (sectionTitle, config) =>
    set((state) => ({
      formatting: {
        ...state.formatting,
        sectionPageNumbers: {
          ...state.formatting.sectionPageNumbers,
          [sectionTitle]: config,
        },
      },
      isDirty: true,
    })),

  initFormattingFromTemplate: (templateDef) =>
    set((state) => {
      const page = (templateDef as Record<string, unknown>).page as Record<string, unknown> | undefined;
      const styles = (templateDef as Record<string, unknown>).styles as Record<string, unknown> | undefined;
      const bodyCfg = (styles?.body ?? {}) as Record<string, unknown>;
      const fontCfg = (bodyCfg.font ?? {}) as Record<string, unknown>;
      const headingsCfg = (styles?.headings ?? []) as Array<Record<string, unknown>>;
      const margins = (page?.margins ?? {}) as Record<string, unknown>;
      const tableCfg = (styles?.table ?? {}) as Record<string, unknown>;
      const tableFont = (tableCfg.font ?? {}) as Record<string, unknown>;

      const newFormatting = { ...state.formatting };

      // Page settings
      newFormatting.page = {
        paper: (page?.paper as "a4" | "letter" | "legal") ?? "a4",
        orientation: (page?.orientation as "portrait" | "landscape") ?? "portrait",
        margin_top_cm: (margins.top as number) ?? 3.0,
        margin_bottom_cm: (margins.bottom as number) ?? 3.0,
        margin_left_cm: (margins.left as number) ?? 4.0,
        margin_right_cm: (margins.right as number) ?? 3.0,
      };

      // Typography
      newFormatting.typography = {
        font_family: (fontCfg.name as string) ?? "Times New Roman",
        font_size: (fontCfg.size as number) ?? 12,
        bold: (fontCfg.bold as boolean) ?? false,
        italic: (fontCfg.italic as boolean) ?? false,
        alignment: (bodyCfg.alignment as FormattingState["typography"]["alignment"]) ?? "justify",
      };

      // Paragraph
      newFormatting.paragraph = {
        line_spacing: (bodyCfg.line_spacing as number) ?? 1.5,
        space_before_pt: 0,
        space_after_pt: 0,
        first_line_indent_cm: (bodyCfg.first_line_indent_cm as number) ?? 1.27,
        left_indent_cm: 0,
        right_indent_cm: 0,
      };

      // Headings
      newFormatting.headings = headingsCfg.map((h) => ({
        level: (h.level as number) ?? 1,
        font_family: ((h.font as Record<string, unknown>)?.name as string) ?? "Times New Roman",
        font_size: ((h.font as Record<string, unknown>)?.size as number) ?? 14,
        bold: ((h.font as Record<string, unknown>)?.bold as boolean) ?? true,
        italic: ((h.font as Record<string, unknown>)?.italic as boolean) ?? false,
        alignment: (h.alignment as HeadingFormat["alignment"]) ?? "left",
        space_before_pt: (h.space_before_pt as number) ?? 12,
        space_after_pt: (h.space_after_pt as number) ?? 6,
        numbering_format: (h.numbering_format as string) ?? "none",
      }));

      // Ensure H3 and H4 exist
      const existingLevels = new Set(newFormatting.headings.map((h) => h.level));
      for (let lvl = 3; lvl <= 4; lvl++) {
        if (!existingLevels.has(lvl)) {
          newFormatting.headings.push({
            level: lvl,
            font_family: "Times New Roman",
            font_size: 12,
            bold: true,
            italic: false,
            alignment: "left",
            space_before_pt: 12,
            space_after_pt: 6,
            numbering_format: "none",
          });
        }
      }

      // Tables
      newFormatting.tables = {
        alignment: "center",
        width_percent: 100,
        border_width_pt: (tableCfg.border_width_pt as number) ?? 0.5,
        header_bold: (tableCfg.header_bold as boolean) ?? true,
        header_background: (tableCfg.header_background as string) ?? "",
        cell_padding_pt: (tableCfg.cell_padding_pt as number) ?? 4,
      };

      // Sort headings by level
      newFormatting.headings.sort((a, b) => a.level - b.level);

      return { formatting: newFormatting };
    }),

  setIsDirty: (dirty) => set({ isDirty: dirty }),

  setIsValid: (valid) => set({ isValid: valid }),

  reset: () => set({ ...initialState }),
}));
