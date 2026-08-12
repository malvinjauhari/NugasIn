import { useDocumentStore } from "../../stores";
import { DocumentPreview } from "../preview";
import type { PreviewDocument } from "../preview";

export function PreviewPanel() {
  const { metadata, templateName, pageSettings } = useDocumentStore();

  // Build preview document from store state
  const previewDoc: PreviewDocument = {
    metadata,
    page_settings: pageSettings,
    styles: {
      body: {
        font: { name: "Times New Roman", size_pt: 12, bold: false, italic: false },
        alignment: "justify",
        line_spacing: 1.5,
        first_line_indent_cm: 1.27,
      },
      headings: [
        { level: 1, font: { name: "Times New Roman", size_pt: 14, bold: true, italic: false }, alignment: "center" },
        { level: 2, font: { name: "Times New Roman", size_pt: 12, bold: true, italic: false }, alignment: "left" },
      ],
    },
    sections: templateName
      ? [
          {
            title: "BAB I PENDAHULUAN",
            elements: [
              { type: "heading", level: 1, text: "BAB I PENDAHULUAN" },
              { type: "heading", level: 2, text: "1.1 Tujuan Praktikum", numbering: "1.1" },
              { type: "paragraph", text: "Isi tujuan praktikum di sini." },
              { type: "heading", level: 2, text: "1.2 Alat dan Bahan", numbering: "1.2" },
              { type: "paragraph", text: "Isi alat dan bahan di sini." },
            ],
          },
          {
            title: "BAB II DASAR TEORI",
            elements: [
              { type: "heading", level: 1, text: "BAB II DASAR TEORI" },
              { type: "paragraph", text: "Isi dasar teori di sini." },
            ],
          },
          {
            title: "BAB III HASIL PRAKTIKUM DAN PEMBAHASAN",
            elements: [
              { type: "heading", level: 1, text: "BAB III HASIL PRAKTIKUM DAN PEMBAHASAN" },
              { type: "heading", level: 2, text: "3.1 Source Code", numbering: "3.1" },
              { type: "paragraph", text: "Sertakan source code di sini." },
              { type: "heading", level: 2, text: "3.2 Screenshot Output", numbering: "3.2" },
              { type: "paragraph", text: "Sertakan screenshot output di sini." },
              { type: "heading", level: 2, text: "3.3 Analisis dan Pembahasan", numbering: "3.3" },
              { type: "paragraph", text: "Isi analisis dan pembahasan di sini." },
            ],
          },
          {
            title: "BAB IV KESIMPULAN",
            elements: [
              { type: "heading", level: 1, text: "BAB IV KESIMPULAN" },
              { type: "paragraph", text: "Isi kesimpulan di sini." },
            ],
          },
          {
            title: "Daftar Pustaka",
            elements: [
              { type: "heading", level: 1, text: "Daftar Pustaka" },
              { type: "paragraph", text: "Isi daftar pustaka di sini." },
            ],
          },
        ]
      : [],
  };

  return (
    <main className="flex-1 overflow-auto bg-muted/20 p-8">
      {!templateName ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Pilih template untuk memulai
        </div>
      ) : (
        <DocumentPreview document={previewDoc} />
      )}
    </main>
  );
}
