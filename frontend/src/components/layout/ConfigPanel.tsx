import { TemplateSelector, MetadataForm } from "../config/TemplateSelector";
import { FormattingPanel } from "../config/FormattingPanel";
import { useDocumentStore, useUIStore } from "../../stores";
import type { ConfigTab } from "../../stores";
import type { TemplateField } from "../../lib/types";

const TABS: { key: ConfigTab; label: string }[] = [
  { key: "template", label: "Template" },
  { key: "metadata", label: "Informasi" },
  { key: "assets", label: "Aset" },
  { key: "formatting", label: "Format" },
];

const LAPRAK_FIELDS: TemplateField[] = [
  { key: "module", label: "Modul / Judul Praktikum", type: "text", required: true },
  { key: "author", label: "Nama Mahasiswa", type: "text", required: true },
  { key: "nim", label: "NIM", type: "text", required: true },
  { key: "class_name", label: "Kelas", type: "text", required: true },
  { key: "assistant", label: "Asprak / Praktikan", type: "text", required: false },
  { key: "program", label: "Program Studi", type: "text", required: false },
  { key: "faculty", label: "Fakultas", type: "text", required: false },
  { key: "institution", label: "Universitas", type: "text", required: false, default: "Telkom University" },
  { key: "year", label: "Tahun", type: "number", required: false, default: 2026 },
];

const MAKALAH_FIELDS: TemplateField[] = [
  { key: "title", label: "Judul Makalah", type: "text", required: true },
  { key: "author", label: "Nama Mahasiswa", type: "text", required: true },
  { key: "nim", label: "NIM", type: "text", required: true },
  { key: "class_name", label: "Kelas", type: "text", required: false },
  { key: "lecturer", label: "Dosen Pengampu", type: "text", required: true },
  { key: "program", label: "Program Studi", type: "text", required: false },
  { key: "faculty", label: "Fakultas", type: "text", required: false },
  { key: "institution", label: "Universitas", type: "text", required: false, default: "Telkom University" },
  { key: "year", label: "Tahun", type: "number", required: false, default: 2026 },
];

const LOGBOOK_FIELDS: TemplateField[] = [
  { key: "module", label: "Mata Kuliah", type: "text", required: true },
  { key: "title", label: "Judul Tugas Besar", type: "text", required: true },
  { key: "group", label: "Kelompok", type: "text", required: true },
  { key: "class_name", label: "Kelas", type: "text", required: true },
  { key: "author", label: "Nama Anggota", type: "text", required: true },
  { key: "nim", label: "NIM", type: "text", required: true },
];

function getFieldsForTemplate(templateName: string | null): TemplateField[] {
  switch (templateName) {
    case "laprak":
      return LAPRAK_FIELDS;
    case "makalah":
      return MAKALAH_FIELDS;
    case "logbook":
      return LOGBOOK_FIELDS;
    default:
      return [];
  }
}

export function ConfigPanel() {
  const { configTab, setConfigTab } = useUIStore();
  const { templateName } = useDocumentStore();

  const fields = getFieldsForTemplate(templateName);

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
              <MetadataForm fields={fields} />
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
        {configTab === "formatting" && <FormattingPanel />}
      </div>
    </aside>
  );
}
