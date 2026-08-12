import { useDocumentStore } from "../../stores";
import { DocumentPreview } from "../preview";
import type { PreviewDocument, PreviewSection } from "../preview";

function getLaprakSections(): PreviewSection[] {
  return [
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
  ];
}

function getMakalahSections(): PreviewSection[] {
  return [
    {
      title: "Kata Pengantar",
      elements: [
        { type: "heading", level: 1, text: "KATA PENGANTAR" },
        {
          type: "paragraph",
          text: "Puji syukur kami panjutkan ke hadirat Tuhan Yang Maha Esa atas segala berkat dan rahmat-Nya sehingga kami dapat menyelesaikan makalah ini dengan baik.",
        },
        {
          type: "paragraph",
          text: "Makalah ini membahas tentang topik yang kami anggap penting untuk dipelajari dan dipahami.",
        },
      ],
    },
    {
      title: "Daftar Isi",
      elements: [{ type: "heading", level: 1, text: "DAFTAR ISI" }],
    },
    {
      title: "Daftar Gambar",
      elements: [{ type: "heading", level: 1, text: "DAFTAR GAMBAR" }],
    },
    {
      title: "Daftar Tabel",
      elements: [{ type: "heading", level: 1, text: "DAFTAR TABEL" }],
    },
    {
      title: "BAB I PENDAHULUAN",
      elements: [
        { type: "heading", level: 1, text: "BAB I PENDAHULUAN" },
        { type: "heading", level: 2, text: "1.1 Latar Belakang", numbering: "1.1" },
        { type: "paragraph", text: "Isi latar belakang di sini." },
        { type: "heading", level: 2, text: "1.2 Rumusan Masalah", numbering: "1.2" },
        { type: "paragraph", text: "Isi rumusan masalah di sini." },
        { type: "heading", level: 2, text: "1.3 Tujuan Penulisan", numbering: "1.3" },
        { type: "paragraph", text: "Isi tujuan penulisan di sini." },
      ],
    },
    {
      title: "BAB II PEMBAHASAN",
      elements: [
        { type: "heading", level: 1, text: "BAB II PEMBAHASAN" },
        { type: "heading", level: 2, text: "2.1 Kajian Teori", numbering: "2.1" },
        { type: "paragraph", text: "Isi kajian teori di sini." },
        { type: "heading", level: 2, text: "2.2 Analisis Masalah", numbering: "2.2" },
        { type: "paragraph", text: "Isi analisis masalah di sini." },
      ],
    },
    {
      title: "BAB III PENUTUP",
      elements: [
        { type: "heading", level: 1, text: "BAB III PENUTUP" },
        { type: "heading", level: 2, text: "3.1 Kesimpulan", numbering: "3.1" },
        { type: "paragraph", text: "Isi kesimpulan di sini." },
        { type: "heading", level: 2, text: "3.2 Saran", numbering: "3.2" },
        { type: "paragraph", text: "Isi saran di sini." },
      ],
    },
    {
      title: "Daftar Pustaka",
      elements: [
        { type: "heading", level: 1, text: "DAFTAR PUSTAKA" },
        { type: "paragraph", text: "Isi daftar pustaka di sini." },
      ],
    },
  ];
}

function getSectionsForTemplate(templateName: string | null): PreviewSection[] {
  switch (templateName) {
    case "laprak":
      return getLaprakSections();
    case "makalah":
      return getMakalahSections();
    default:
      return [];
  }
}

export function PreviewPanel() {
  const { metadata, templateName, pageSettings } = useDocumentStore();

  const sections = getSectionsForTemplate(templateName);

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
    sections,
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
