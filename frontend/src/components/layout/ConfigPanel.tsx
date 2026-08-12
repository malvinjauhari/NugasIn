import { TemplateSelector, MetadataForm } from "../config/TemplateSelector";
import { useDocumentStore, useUIStore } from "../../stores";
import type { ConfigTab } from "../../stores";

const TABS: { key: ConfigTab; label: string }[] = [
  { key: "template", label: "Template" },
  { key: "metadata", label: "Informasi" },
  { key: "assets", label: "Aset" },
  { key: "formatting", label: "Format" },
];

const LAPRAK_FIELDS = [
  { key: "module", label: "Modul / Judul Praktikum", type: "text" as const, required: true },
  { key: "author", label: "Nama Mahasiswa", type: "text" as const, required: true },
  { key: "nim", label: "NIM", type: "text" as const, required: true },
  { key: "class_name", label: "Kelas", type: "text" as const, required: true },
  { key: "assistant", label: "Asprak / Praktikan", type: "text" as const, required: false },
  { key: "program", label: "Program Studi", type: "text" as const, required: false },
  { key: "faculty", label: "Fakultas", type: "text" as const, required: false },
  { key: "institution", label: "Universitas", type: "text" as const, required: false, default: "Telkom University" },
  { key: "year", label: "Tahun", type: "number" as const, required: false, default: 2026 },
];

export function ConfigPanel() {
  const { configTab, setConfigTab } = useUIStore();
  const { templateName } = useDocumentStore();

  return (
    <aside className="w-80 border-r border-border bg-muted/30 flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setConfigTab(tab.key)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              configTab === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {configTab === "template" && <TemplateSelector />}
        {configTab === "metadata" && (
          <>
            {templateName ? (
              <MetadataForm fields={LAPRAK_FIELDS} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Pilih template terlebih dahulu
              </p>
            )}
          </>
        )}
        {configTab === "assets" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Aset</h3>
            <p className="text-sm text-muted-foreground">
              Upload logo dan gambar (coming soon)
            </p>
          </div>
        )}
        {configTab === "formatting" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Format Lanjutan</h3>
            <p className="text-sm text-muted-foreground">
              Pengaturan format lanjutan (coming soon)
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
