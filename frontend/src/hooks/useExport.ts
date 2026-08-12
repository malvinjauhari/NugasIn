/**
 * Export hook — handles document export via the FastAPI backend.
 */

import { useCallback, useState } from "react";
import { useDocumentStore } from "../stores";
import { generateDocument, validateDocument, exportDocument } from "../lib/api";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { metadata, templateName } = useDocumentStore();

  const exportDoc = useCallback(async () => {
    if (!templateName) {
      setError("Pilih template terlebih dahulu");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // 1. Generate document
      const { document_id } = await generateDocument(templateName, metadata as unknown as Record<string, unknown>);

      // 2. Validate
      const validation = await validateDocument(document_id);
      if (!validation.is_valid) {
        const errors = validation.issues
          .filter((i) => i.severity === "error")
          .map((i) => i.message)
          .join(", ");
        setError(`Validation failed: ${errors}`);
        setIsExporting(false);
        return;
      }

      // 3. Export
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
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }, [templateName, metadata]);

  return { exportDoc, isExporting, error };
}
