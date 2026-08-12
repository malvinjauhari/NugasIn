import { useState } from "react";
import { useDocumentStore, useUIStore } from "../../stores";
import type { FormattingState, HeadingFormat, SectionPageNumberingConfig } from "../../stores";
import { API_BASE } from "../../lib/api";

const FONT_OPTIONS = [
  "Times New Roman",
  "Arial",
  "Calibri",
  "Cambria",
  "Garamond",
  "Georgia",
  "Courier New",
  "Verdana",
];

const SECTION_NAMES: Record<string, string> = {
  Cover: "Cover",
  "Kata Pengantar": "Kata Pengantar",
  "Daftar Isi": "Daftar Isi",
  "Daftar Gambar": "Daftar Gambar",
  "Daftar Tabel": "Daftar Tabel",
  "BAB I PENDAHULUAN": "BAB I",
  "BAB II DASAR TEORI": "BAB II",
  "BAB II PEMBAHASAN": "BAB II",
  "BAB III HASIL PRAKTIKUM DAN PEMBAHASAN": "BAB III",
  "BAB III PENUTUP": "BAB III",
  "BAB IV KESIMPULAN": "BAB IV",
  "Daftar Pustaka": "Daftar Pustaka",
};

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        {title}
        <span className="text-muted-foreground">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background"
      />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-border"
      />
      {label}
    </label>
  );
}

function TypographySection() {
  const { formatting, setFormatting } = useDocumentStore();
  const t = formatting.typography;

  return (
    <CollapsibleSection title="Tipografi" defaultOpen>
      <SelectField
        label="Font Family"
        value={t.font_family}
        onChange={(v) => setFormatting({ typography: { ...t, font_family: v } })}
        options={FONT_OPTIONS.map((f) => ({ value: f, label: f }))}
      />
      <NumberField
        label="Font Size (pt)"
        value={t.font_size}
        onChange={(v) => setFormatting({ typography: { ...t, font_size: v } })}
        min={6}
        max={72}
      />
      <div className="flex gap-3">
        <CheckboxField
          label="Bold"
          checked={t.bold}
          onChange={(v) => setFormatting({ typography: { ...t, bold: v } })}
        />
        <CheckboxField
          label="Italic"
          checked={t.italic}
          onChange={(v) => setFormatting({ typography: { ...t, italic: v } })}
        />
      </div>
      <SelectField
        label="Alignment"
        value={t.alignment}
        onChange={(v) =>
          setFormatting({
            typography: { ...t, alignment: v as FormattingState["typography"]["alignment"] },
          })
        }
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
          { value: "justify", label: "Justify" },
        ]}
      />
    </CollapsibleSection>
  );
}

function ParagraphSection() {
  const { formatting, setFormatting } = useDocumentStore();
  const p = formatting.paragraph;

  return (
    <CollapsibleSection title="Paragraf">
      <NumberField
        label="Line Spacing"
        value={p.line_spacing}
        onChange={(v) => setFormatting({ paragraph: { ...p, line_spacing: v } })}
        min={0.5}
        max={3}
        step={0.1}
      />
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Space Before (pt)"
          value={p.space_before_pt}
          onChange={(v) => setFormatting({ paragraph: { ...p, space_before_pt: v } })}
          min={0}
          max={72}
        />
        <NumberField
          label="Space After (pt)"
          value={p.space_after_pt}
          onChange={(v) => setFormatting({ paragraph: { ...p, space_after_pt: v } })}
          min={0}
          max={72}
        />
      </div>
      <NumberField
        label="First-line Indent (cm)"
        value={p.first_line_indent_cm}
        onChange={(v) => setFormatting({ paragraph: { ...p, first_line_indent_cm: v } })}
        min={0}
        max={5}
      />
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Left Indent (cm)"
          value={p.left_indent_cm}
          onChange={(v) => setFormatting({ paragraph: { ...p, left_indent_cm: v } })}
          min={0}
          max={5}
        />
        <NumberField
          label="Right Indent (cm)"
          value={p.right_indent_cm}
          onChange={(v) => setFormatting({ paragraph: { ...p, right_indent_cm: v } })}
          min={0}
          max={5}
        />
      </div>
    </CollapsibleSection>
  );
}

function HeadingItem({ heading }: { heading: HeadingFormat }) {
  const { setHeadingFormat } = useDocumentStore();
  const [isOpen, setIsOpen] = useState(false);

  const update = (partial: Partial<HeadingFormat>) => setHeadingFormat(heading.level, partial);

  return (
    <div className="border border-border rounded-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-medium hover:bg-muted/30 transition-colors"
      >
        <span>
          H{heading.level} — {heading.font_family} {heading.font_size}pt
          {heading.bold ? " Bold" : ""}
        </span>
        <span className="text-muted-foreground">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="px-2 pb-2 space-y-2 border-t border-border">
          <div className="pt-2" />
          <SelectField
            label="Font"
            value={heading.font_family}
            onChange={(v) => update({ font_family: v })}
            options={FONT_OPTIONS.map((f) => ({ value: f, label: f }))}
          />
          <NumberField
            label="Size (pt)"
            value={heading.font_size}
            onChange={(v) => update({ font_size: v })}
            min={6}
            max={72}
          />
          <div className="flex gap-3">
            <CheckboxField
              label="Bold"
              checked={heading.bold}
              onChange={(v) => update({ bold: v })}
            />
            <CheckboxField
              label="Italic"
              checked={heading.italic}
              onChange={(v) => update({ italic: v })}
            />
          </div>
          <SelectField
            label="Alignment"
            value={heading.alignment}
            onChange={(v) => update({ alignment: v as HeadingFormat["alignment"] })}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Space Before (pt)"
              value={heading.space_before_pt}
              onChange={(v) => update({ space_before_pt: v })}
              min={0}
              max={72}
            />
            <NumberField
              label="Space After (pt)"
              value={heading.space_after_pt}
              onChange={(v) => update({ space_after_pt: v })}
              min={0}
              max={72}
            />
          </div>
          <SelectField
            label="Numbering"
            value={heading.numbering_format}
            onChange={(v) => update({ numbering_format: v })}
            options={[
              { value: "none", label: "None" },
              { value: "decimal", label: "1, 2, 3" },
              { value: "lower_roman", label: "i, ii, iii" },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function HeadingsSection() {
  const { formatting } = useDocumentStore();

  return (
    <CollapsibleSection title="Headings">
      <div className="space-y-2">
        {formatting.headings.map((h) => (
          <HeadingItem key={h.level} heading={h} />
        ))}
      </div>
    </CollapsibleSection>
  );
}

function PageSection() {
  const { formatting, setFormatting } = useDocumentStore();
  const p = formatting.page;

  return (
    <CollapsibleSection title="Halaman" defaultOpen>
      <SelectField
        label="Paper Size"
        value={p.paper}
        onChange={(v) => setFormatting({ page: { ...p, paper: v as FormattingState["page"]["paper"] } })}
        options={[
          { value: "a4", label: "A4 (210 × 297 mm)" },
          { value: "letter", label: "Letter (216 × 279 mm)" },
          { value: "legal", label: "Legal (216 × 356 mm)" },
        ]}
      />
      <SelectField
        label="Orientation"
        value={p.orientation}
        onChange={(v) =>
          setFormatting({ page: { ...p, orientation: v as FormattingState["page"]["orientation"] } })
        }
        options={[
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Top (cm)"
          value={p.margin_top_cm}
          onChange={(v) => setFormatting({ page: { ...p, margin_top_cm: v } })}
          min={0}
          max={10}
        />
        <NumberField
          label="Bottom (cm)"
          value={p.margin_bottom_cm}
          onChange={(v) => setFormatting({ page: { ...p, margin_bottom_cm: v } })}
          min={0}
          max={10}
        />
        <NumberField
          label="Left (cm)"
          value={p.margin_left_cm}
          onChange={(v) => setFormatting({ page: { ...p, margin_left_cm: v } })}
          min={0}
          max={10}
        />
        <NumberField
          label="Right (cm)"
          value={p.margin_right_cm}
          onChange={(v) => setFormatting({ page: { ...p, margin_right_cm: v } })}
          min={0}
          max={10}
        />
      </div>
    </CollapsibleSection>
  );
}

function PageNumbersSection() {
  const { formatting, setFormatting, setSectionPageNumbering } = useDocumentStore();
  const pn = formatting.pageNumbers;

  const POSITION_OPTIONS = [
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  // Get section titles from document or use defaults
  const sectionTitles = Object.keys(SECTION_NAMES);

  return (
    <CollapsibleSection title="Nomor Halaman">
      <CheckboxField
        label="Enable Page Numbers"
        checked={pn.enabled}
        onChange={(v) => setFormatting({ pageNumbers: { ...pn, enabled: v } })}
      />
      {pn.enabled && (
        <>
          <SelectField
            label="Format"
            value={pn.format}
            onChange={(v) =>
              setFormatting({
                pageNumbers: { ...pn, format: v as FormattingState["pageNumbers"]["format"] },
              })
            }
            options={[
              { value: "decimal", label: "1, 2, 3" },
              { value: "lower_roman", label: "i, ii, iii" },
              { value: "upper_roman", label: "I, II, III" },
            ]}
          />
          <SelectField
            label="Position"
            value={pn.position}
            onChange={(v) =>
              setFormatting({
                pageNumbers: { ...pn, position: v as FormattingState["pageNumbers"]["position"] },
              })
            }
            options={POSITION_OPTIONS}
          />
          <CheckboxField
            label="Different first page"
            checked={pn.different_first_page}
            onChange={(v) => setFormatting({ pageNumbers: { ...pn, different_first_page: v } })}
          />

          {/* Per-section numbering */}
          <div className="pt-2 border-t border-border">
            <label className="text-[11px] font-medium text-muted-foreground">
              Per-Section Numbering
            </label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {sectionTitles.map((title) => {
                const cfg = formatting.sectionPageNumbers[title] ?? {
                  enabled: false,
                  format: "decimal" as const,
                  numbering_type: "none" as const,
                };
                const update = (partial: Partial<SectionPageNumberingConfig>) =>
                  setSectionPageNumbering(title, { ...cfg, ...partial });

                return (
                  <div key={title} className="p-2 border border-border rounded-md text-[11px]">
                    <div className="font-medium mb-1">{SECTION_NAMES[title] ?? title}</div>
                    <CheckboxField
                      label="Enable"
                      checked={cfg.enabled}
                      onChange={(v) => update({ enabled: v })}
                    />
                    {cfg.enabled && (
                      <div className="mt-1 space-y-1">
                        <SelectField
                          label="Type"
                          value={cfg.numbering_type}
                          onChange={(v) =>
                            update({ numbering_type: v as SectionPageNumberingConfig["numbering_type"] })
                          }
                          options={[
                            { value: "none", label: "None" },
                            { value: "roman", label: "Roman" },
                            { value: "arabic", label: "Arabic" },
                            { value: "continue", label: "Continue" },
                          ]}
                        />
                        {cfg.numbering_type !== "continue" && cfg.numbering_type !== "none" && (
                          <SelectField
                            label="Format"
                            value={cfg.format}
                            onChange={(v) =>
                              update({ format: v as SectionPageNumberingConfig["format"] })
                            }
                            options={[
                              { value: "decimal", label: "1, 2, 3" },
                              { value: "lower_roman", label: "i, ii, iii" },
                              { value: "upper_roman", label: "I, II, III" },
                            ]}
                          />
                        )}
                        {cfg.numbering_type !== "continue" && cfg.numbering_type !== "none" && (
                          <NumberField
                            label="Start Value"
                            value={cfg.start_value ?? 1}
                            onChange={(v) => update({ start_value: v })}
                            min={1}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}

function TablesSection() {
  const { formatting, setFormatting } = useDocumentStore();
  const t = formatting.tables;

  return (
    <CollapsibleSection title="Tabel">
      <SelectField
        label="Alignment"
        value={t.alignment}
        onChange={(v) => setFormatting({ tables: { ...t, alignment: v as FormattingState["tables"]["alignment"] } })}
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ]}
      />
      <NumberField
        label="Width (%)"
        value={t.width_percent}
        onChange={(v) => setFormatting({ tables: { ...t, width_percent: v } })}
        min={10}
        max={100}
      />
      <NumberField
        label="Border Width (pt)"
        value={t.border_width_pt}
        onChange={(v) => setFormatting({ tables: { ...t, border_width_pt: v } })}
        min={0}
        max={3}
        step={0.1}
      />
      <CheckboxField
        label="Header Bold"
        checked={t.header_bold}
        onChange={(v) => setFormatting({ tables: { ...t, header_bold: v } })}
      />
      <NumberField
        label="Cell Padding (pt)"
        value={t.cell_padding_pt}
        onChange={(v) => setFormatting({ tables: { ...t, cell_padding_pt: v } })}
        min={0}
        max={20}
      />
    </CollapsibleSection>
  );
}

function ImagesSection() {
  const { formatting, setFormatting } = useDocumentStore();
  const i = formatting.images;

  return (
    <CollapsibleSection title="Gambar">
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Max Width (cm)"
          value={i.max_width_cm}
          onChange={(v) => setFormatting({ images: { ...i, max_width_cm: v } })}
          min={1}
          max={21}
        />
        <NumberField
          label="Max Height (cm)"
          value={i.max_height_cm}
          onChange={(v) => setFormatting({ images: { ...i, max_height_cm: v } })}
          min={1}
          max={29}
        />
      </div>
      <SelectField
        label="Alignment"
        value={i.alignment}
        onChange={(v) => setFormatting({ images: { ...i, alignment: v as FormattingState["images"]["alignment"] } })}
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ]}
      />
    </CollapsibleSection>
  );
}

function HeaderFooterSection() {
  const { formatting, setFormatting } = useDocumentStore();
  const hf = formatting.headerFooter;

  return (
    <CollapsibleSection title="Header & Footer">
      <div className="space-y-3">
        {/* Header */}
        <div className="space-y-2">
          <CheckboxField
            label="Enable Header"
            checked={hf.header_enabled}
            onChange={(v) => setFormatting({ headerFooter: { ...hf, header_enabled: v } })}
          />
          {hf.header_enabled && (
            <>
              <input
                type="text"
                value={hf.header_content}
                onChange={(e) =>
                  setFormatting({ headerFooter: { ...hf, header_content: e.target.value } })
                }
                placeholder="Header content"
                className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background"
              />
              <SelectField
                label="Header Alignment"
                value={hf.header_alignment}
                onChange={(v) =>
                  setFormatting({
                    headerFooter: {
                      ...hf,
                      header_alignment: v as FormattingState["headerFooter"]["header_alignment"],
                    },
                  })
                }
                options={[
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right", label: "Right" },
                ]}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-2">
          <CheckboxField
            label="Enable Footer"
            checked={hf.footer_enabled}
            onChange={(v) => setFormatting({ headerFooter: { ...hf, footer_enabled: v } })}
          />
          {hf.footer_enabled && (
            <>
              <input
                type="text"
                value={hf.footer_content}
                onChange={(e) =>
                  setFormatting({ headerFooter: { ...hf, footer_content: e.target.value } })
                }
                placeholder="Footer content"
                className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background"
              />
              <SelectField
                label="Footer Alignment"
                value={hf.footer_alignment}
                onChange={(v) =>
                  setFormatting({
                    headerFooter: {
                      ...hf,
                      footer_alignment: v as FormattingState["headerFooter"]["footer_alignment"],
                    },
                  })
                }
                options={[
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                  { value: "right", label: "Right" },
                ]}
              />
            </>
          )}
        </div>

        <CheckboxField
          label="Different first page"
          checked={hf.different_first_page}
          onChange={(v) => setFormatting({ headerFooter: { ...hf, different_first_page: v } })}
        />
      </div>
    </CollapsibleSection>
  );
}

export function FormattingPanel() {
  const { formatting, documentId, templateName } = useDocumentStore();
  const { setIsGenerating } = useUIStore();
  const [applyStatus, setApplyStatus] = useState<"idle" | "applying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApply = async () => {
    if (!documentId) {
      setErrorMsg("Generate a document first before applying formatting.");
      return;
    }

    setIsGenerating(true);
    setApplyStatus("applying");
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_BASE}/formatting/${documentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatting),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to apply formatting");
      }

      setApplyStatus("success");
      setTimeout(() => setApplyStatus("idle"), 2000);
    } catch (err) {
      setApplyStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-0">
      {!templateName && (
        <p className="text-xs text-muted-foreground px-3 py-2">
          Pilih template terlebih dahulu
        </p>
      )}

      {templateName && (
        <>
          <PageSection />
          <PageNumbersSection />
          <TypographySection />
          <ParagraphSection />
          <HeadingsSection />
          <TablesSection />
          <ImagesSection />
          <HeaderFooterSection />

          {/* Apply button */}
          <div className="p-3 sticky bottom-0 bg-background border-t border-border">
            {errorMsg && <p className="text-[11px] text-destructive mb-2">{errorMsg}</p>}
            {applyStatus === "success" && (
              <p className="text-[11px] text-green-600 mb-2">Formatting applied!</p>
            )}
            <button
              onClick={handleApply}
              disabled={!documentId || applyStatus === "applying"}
              className="w-full px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {applyStatus === "applying" ? "Applying..." : "Apply Formatting"}
            </button>
            {!documentId && (
              <p className="text-[10px] text-muted-foreground mt-1 text-center">
                Export document first to enable Apply
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
