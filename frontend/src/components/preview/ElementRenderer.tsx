import type { PreviewHeading, PreviewParagraph, PreviewImage, PreviewTable, PreviewElement } from "./types";

interface HeadingRendererProps {
  element: PreviewHeading;
  headingStyles?: Array<{ level: number; font: { name: string; size_pt: number; bold: boolean }; alignment: string }>;
}

export function HeadingRenderer({ element, headingStyles }: HeadingRendererProps) {
  const style = headingStyles?.find((s) => s.level === element.level);
  const fontName = style?.font.name || "Times New Roman";
  const fontSize = style?.font.size_pt || 14;
  const alignment = style?.alignment || "left";

  const text = element.numbering ? `${element.numbering} ${element.text}` : element.text;

  return (
    <div
      className="mb-3"
      style={{
        fontFamily: fontName,
        fontSize: `${fontSize}pt`,
        fontWeight: "bold",
        textAlign: alignment as "left" | "center" | "right",
      }}
    >
      {text}
    </div>
  );
}

interface ParagraphRendererProps {
  element: PreviewParagraph;
  bodyStyle?: { font: { name: string; size_pt: number }; alignment: string; line_spacing: number; first_line_indent_cm?: number };
}

export function ParagraphRenderer({ element, bodyStyle }: ParagraphRendererProps) {
  const fontName = bodyStyle?.font.name || "Times New Roman";
  const fontSize = bodyStyle?.font.size_pt || 12;
  const alignment = bodyStyle?.alignment || "justify";
  const lineSpacing = bodyStyle?.line_spacing || 1.5;
  const indent = bodyStyle?.first_line_indent_cm || 0;

  return (
    <div
      className="mb-2"
      style={{
        fontFamily: fontName,
        fontSize: `${fontSize}pt`,
        textAlign: alignment as "left" | "center" | "right" | "justify",
        lineHeight: lineSpacing,
        textIndent: indent > 0 ? `${indent}cm` : undefined,
      }}
    >
      {element.text}
    </div>
  );
}

interface ImageRendererProps {
  element: PreviewImage;
}

export function ImageRenderer({ element }: ImageRendererProps) {
  return (
    <div className="my-4 text-center">
      {element.src ? (
        <img
          src={element.src}
          alt={element.alt}
          className="max-w-full mx-auto"
          style={{
            maxWidth: element.width_cm ? `${element.width_cm}cm` : "100%",
            maxHeight: element.height_cm ? `${element.height_cm}cm` : "auto",
          }}
        />
      ) : (
        <div className="w-32 h-20 mx-auto bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
          Gambar
        </div>
      )}
      {element.caption && (
        <p className="mt-2 text-xs italic text-muted-foreground">{element.caption}</p>
      )}
    </div>
  );
}

interface TableRendererProps {
  element: PreviewTable;
  tableStyle?: { font: { name: string; size_pt: number }; border_width_pt: number };
}

export function TableRenderer({ element, tableStyle }: TableRendererProps) {
  const fontName = tableStyle?.font.name || "Times New Roman";
  const fontSize = tableStyle?.font.size_pt || 10;

  if (!element.rows.length) return null;

  return (
    <div className="my-4 overflow-x-auto">
      <table
        className="w-full border-collapse"
        style={{ fontFamily: fontName, fontSize: `${fontSize}pt` }}
      >
        <tbody>
          {element.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border border-border px-2 py-1"
                  style={{ fontWeight: cell.bold ? "bold" : "normal" }}
                >
                  {cell.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ElementRendererProps {
  element: PreviewElement;
  headingStyles?: Array<{ level: number; font: { name: string; size_pt: number; bold: boolean }; alignment: string }>;
  bodyStyle?: { font: { name: string; size_pt: number }; alignment: string; line_spacing: number; first_line_indent_cm?: number };
  tableStyle?: { font: { name: string; size_pt: number }; border_width_pt: number };
}

export function ElementRenderer({ element, headingStyles, bodyStyle, tableStyle }: ElementRendererProps) {
  switch (element.type) {
    case "heading":
      return <HeadingRenderer element={element} headingStyles={headingStyles} />;
    case "paragraph":
      return <ParagraphRenderer element={element} bodyStyle={bodyStyle} />;
    case "image":
      return <ImageRenderer element={element} />;
    case "table":
      return <TableRenderer element={element} tableStyle={tableStyle} />;
    case "page_break":
      return <div className="page-break border-t border-dashed border-border my-8" />;
    default:
      return null;
  }
}
