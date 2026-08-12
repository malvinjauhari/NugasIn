import { ConfigPanel } from "./ConfigPanel";
import { PreviewPanel } from "./PreviewPanel";
import { useDocumentStore } from "../../stores";
import { useExport } from "../../hooks/useExport";

export function AppLayout() {
  const { templateName, isDirty } = useDocumentStore();
  const { exportDoc, isExporting, error } = useExport();

  return (
    <div className="flex h-screen bg-background">
      <ConfigPanel />
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <header className="h-12 border-b border-border bg-background flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold">TugasIn</h1>
            {isDirty && (
              <span className="text-xs text-muted-foreground">● Belum tersimpan</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <span className="text-xs text-destructive">{error}</span>
            )}
            <button
              onClick={exportDoc}
              disabled={!templateName || isExporting}
              className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? "Exporting..." : "Export DOCX"}
            </button>
          </div>
        </header>
        <PreviewPanel />
      </div>
    </div>
  );
}
