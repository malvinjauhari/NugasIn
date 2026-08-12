import { useDocumentStore } from "../../stores";
import type { TemplateField } from "../../lib/types";

const TEMPLATES = [
  {
    name: "laprak",
    display_name: "Laporan Praktikum",
    description: "Template untuk laporan praktikum (Laprak)",
  },
  {
    name: "makalah",
    display_name: "Makalah Akademik",
    description: "Template untuk makalah akademik / MKDU",
  },
  {
    name: "logbook",
    display_name: "Logbook Tugas Besar",
    description: "Template untuk logbook tugas besar",
  },
];

export function TemplateSelector() {
  const { templateName, setTemplateName } = useDocumentStore();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Pilih Template</h3>
      <div className="space-y-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.name}
            onClick={() => setTemplateName(t.name)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              templateName === t.name
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="font-medium text-sm">{t.display_name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface MetadataFormProps {
  fields: TemplateField[];
}

export function MetadataForm({ fields }: MetadataFormProps) {
  const { metadata, setMetadata } = useDocumentStore();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Informasi Dokumen</h3>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              type={field.type === "number" ? "number" : "text"}
              value={String(metadata[field.key as keyof typeof metadata] ?? field.default ?? "")}
              onChange={(e) => {
                const value = field.type === "number" ? Number(e.target.value) : e.target.value;
                setMetadata({ [field.key]: value });
              }}
              placeholder={field.label}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
