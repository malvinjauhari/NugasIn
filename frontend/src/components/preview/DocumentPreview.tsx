import type { PreviewDocument } from "./types";
import { ElementRenderer } from "./ElementRenderer";

interface DocumentPreviewProps {
  document: PreviewDocument;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const { metadata, page_settings, styles, sections } = document;

  // Calculate page dimensions in pixels (approximate)
  const pageWidth = page_settings.paper === "a4" ? 210 : 216; // mm
  const pageHeight = page_settings.paper === "a4" ? 297 : 279; // mm
  const isLandscape = page_settings.orientation === "landscape";
  const width = isLandscape ? pageHeight : pageWidth;
  const height = isLandscape ? pageWidth : pageHeight;

  return (
    <div className="mx-auto max-w-[210mm]">
      {/* Cover page */}
      <div
        className="bg-white shadow-lg border border-border mb-8"
        style={{
          width: `${width}mm`,
          minHeight: `${height}mm`,
          padding: `${page_settings.margin_top_cm}cm ${page_settings.margin_right_cm}cm ${page_settings.margin_bottom_cm}cm ${page_settings.margin_left_cm}cm`,
          margin: "0 auto",
        }}
      >
        <CoverPage metadata={metadata} />
      </div>

      {/* Content sections */}
      {sections.map((section, i) => (
        <div
          key={i}
          className="bg-white shadow-lg border border-border mb-8"
          style={{
            width: `${width}mm`,
            minHeight: `${height}mm`,
            padding: `${page_settings.margin_top_cm}cm ${page_settings.margin_right_cm}cm ${page_settings.margin_bottom_cm}cm ${page_settings.margin_left_cm}cm`,
            margin: "0 auto",
          }}
        >
          {section.elements.map((element, j) => (
            <ElementRenderer
              key={j}
              element={element}
              headingStyles={styles.headings}
              bodyStyle={styles.body}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CoverPageProps {
  metadata: PreviewDocument["metadata"];
}

function CoverPage({ metadata }: CoverPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      {/* Logo placeholder */}
      <div className="w-20 h-20 mb-8 bg-muted rounded-full flex items-center justify-center text-xs text-muted-foreground">
        Logo
      </div>

      {/* Title */}
      <h1 className="text-lg font-bold uppercase mb-8">
        {metadata.module || metadata.title || "Judul Dokumen"}
      </h1>

      {/* Student info */}
      <div className="text-sm space-y-1 mb-12">
        <p>{metadata.author || "Nama Mahasiswa"}</p>
        <p>{metadata.nim || "NIM"}</p>
        <p>{metadata.class_name || "Kelas"}</p>
      </div>

      {/* Institution info */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>{metadata.program || "Program Studi"}</p>
        <p>{metadata.faculty || "Fakultas"}</p>
        <p>{metadata.institution || "Telkom University"}</p>
        <p>{metadata.year || new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
