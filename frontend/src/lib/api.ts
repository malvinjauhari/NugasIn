/**
 * API client for communicating with the Python FastAPI backend.
 */

import type { TemplateDefinition, ValidationResult } from "./types";

const API_BASE = "http://localhost:8000";
const FETCH_TIMEOUT = 10000; // 10 seconds

export { API_BASE };

/**
 * Check if the Python API server is reachable.
 */
export async function checkServerConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${API_BASE}/templates`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Wrapped fetch with timeout and error handling.
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => response.statusText);
      throw new Error(`API error ${response.status}: ${detail}`);
    }

    return response.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Server timeout — the request took too long");
    }
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to the Python server. Start it with: ./scripts/dev-server.sh"
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchTemplates(): Promise<string[]> {
  return apiFetch<string[]>(`${API_BASE}/templates`);
}

export async function fetchTemplate(name: string): Promise<TemplateDefinition> {
  return apiFetch<TemplateDefinition>(`${API_BASE}/templates/${name}`);
}

export async function generateDocument(
  templateName: string,
  metadata: Record<string, unknown>
): Promise<{ document_id: string }> {
  return apiFetch<{ document_id: string }>(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template: templateName, metadata }),
  });
}

export async function validateDocument(documentId: string): Promise<ValidationResult> {
  return apiFetch<ValidationResult>(`${API_BASE}/validate/${documentId}`);
}

export async function exportDocument(documentId: string): Promise<Blob> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE}/export/${documentId}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Decode base64 content to blob
    const binaryString = atob(data.content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Export timeout — the server took too long");
    }
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to the Python server. Start it with: ./scripts/dev-server.sh"
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
