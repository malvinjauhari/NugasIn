/**
 * Preview renderer types — matches the Python document model.
 */

export interface PreviewMetadata {
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
}

export interface PreviewFont {
  name: string;
  size_pt: number;
  bold: boolean;
  italic: boolean;
}

export interface PreviewParagraphStyle {
  font: PreviewFont;
  alignment: "left" | "center" | "right" | "justify";
  line_spacing: number;
  first_line_indent_cm?: number;
}

export interface PreviewHeading {
  type: "heading";
  level: number;
  text: string;
  numbering?: string;
}

export interface PreviewParagraph {
  type: "paragraph";
  text: string;
}

export interface PreviewImage {
  type: "image";
  src: string;
  alt: string;
  width_cm?: number;
  height_cm?: number;
  caption?: string;
}

export interface PreviewTable {
  type: "table";
  rows: Array<Array<{ text: string; bold?: boolean }>>;
  header_row: boolean;
}

export interface PreviewPageBreak {
  type: "page_break";
}

export type PreviewElement = PreviewHeading | PreviewParagraph | PreviewImage | PreviewTable | PreviewPageBreak;

export interface PreviewSection {
  title: string;
  elements: PreviewElement[];
}

export interface PreviewDocument {
  metadata: PreviewMetadata;
  page_settings: {
    paper: string;
    orientation: string;
    margin_left_cm: number;
    margin_top_cm: number;
    margin_right_cm: number;
    margin_bottom_cm: number;
  };
  styles: {
    body: PreviewParagraphStyle;
    headings: Array<{
      level: number;
      font: PreviewFont;
      alignment: string;
    }>;
  };
  sections: PreviewSection[];
}
