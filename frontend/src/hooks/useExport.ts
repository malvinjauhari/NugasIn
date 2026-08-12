/**
 * Export hook — handles document export via the FastAPI backend.
 */

import { useCallback, useState } from "react";
import { useDocumentStore } from "../stores";
import {
  API_BASE,
  checkServerConnection,
  generateDocument,
  validateDocument,
  exportDocument,
} from "../lib/api";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { metadata, templateName, formatting, setDocumentId } = useDocumentStore();

  const exportDoc = useCallback(async () => {
    if (!templateName) {
      setError("Pilih template terlebih dahulu");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // 0. Check server connection first
      const serverUp = await checkServerConnection();
      if (!serverUp) {
        setError(
          "Python server belum berjalan. Jalankan: ./scripts/dev-server.sh"
        );
        setIsExporting(false);
        return;
      }

      // 1. Generate document
      const { document_id } = await generateDocument(
        templateName,
        metadata as unknown as Record<string, unknown>
      );

      // Store document ID for formatting apply
      setDocumentId(document_id);

      // 2. Apply formatting to the generated document
      try {
        const formatResponse = await fetch(`${API_BASE}/formatting/${document_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formatting),
        });

        if (!formatResponse.ok) {
          console.warn("Formatting apply failed, continuing with template defaults");
        }
      } catch {
        console.warn("Formatting apply failed, continuing with template defaults");
      }

      // 3. Validate
      const validation = await validateDocument(document_id);
      if (!validation.is_valid) {
        const errors = validation.issues
          .filter((i) => i.severity === "error")
          .map((i) => i.message)
          .join(", ");
        setError(`Validasi gagal: ${errors}`);
        setIsExporting(false);
        return;
      }

      // 4. Export as DOCX blob and trigger download
      const blob = await exportDocument(document_id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${metadata.title || metadata.module || "document"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export gagal");
    } finally {
      setIsExporting(false);
    }
  }, [templateName, metadata, formatting, setDocumentId]);

  return { exportDoc, isExporting, error };
}
