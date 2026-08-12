/**
 * API client for communicating with the Python FastAPI backend.
 *
 * This will be used by the Tauri bridge in Phase 7.
 * For now, it defines the interface that the backend will implement.
 */

import type { TemplateDefinition, ValidationResult } from "./types";

const API_BASE = "http://localhost:8000";

export async function fetchTemplates(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/templates`);
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
}

export async function fetchTemplate(name: string): Promise<TemplateDefinition> {
  const response = await fetch(`${API_BASE}/templates/${name}`);
  if (!response.ok) throw new Error(`Failed to fetch template: ${name}`);
  return response.json();
}

export async function generateDocument(
  templateName: string,
  metadata: Record<string, unknown>
): Promise<{ document_id: string }> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template: templateName, metadata }),
  });
  if (!response.ok) throw new Error("Failed to generate document");
  return response.json();
}

export async function validateDocument(documentId: string): Promise<ValidationResult> {
  const response = await fetch(`${API_BASE}/validate/${documentId}`);
  if (!response.ok) throw new Error("Failed to validate document");
  return response.json();
}

export async function exportDocument(documentId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/export/${documentId}`);
  if (!response.ok) throw new Error("Failed to export document");
  return response.blob();
}
