/**
 * TypeScript types matching the Python engine models.
 */

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  required: boolean;
  default?: string | number;
  options?: string[];
}

export interface TemplateDefinition {
  name: string;
  display_name: string;
  description: string;
  version: string;
  page: {
    paper: string;
    orientation: string;
    margins: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    };
  };
  styles: {
    body: {
      font: { name: string; size: number };
      alignment: string;
      line_spacing: number;
    };
    headings: Array<{
      level: number;
      font: { name: string; size: number; bold: boolean };
      alignment: string;
    }>;
  };
  structure: Array<{
    title: string;
    type: string;
    heading_level?: number;
    numbering?: string;
    elements?: Array<{
      type: string;
      level?: number;
      text?: string;
      numbering?: string;
    }>;
  }>;
  metadata_fields: TemplateField[];
}

export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  field?: string;
  section?: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  is_valid: boolean;
}
