"""DOCX generator using python-docx."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Any

from docx import Document as DocxDocument
from docx.enum.section import WD_ORIENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm, Pt

from engine.models.document import (
    Document,
    Heading,
    Image,
    List,
    PageBreak,
    Paragraph,
    Table,
)
from engine.models.enums import Alignment, Orientation

from .base import BaseGenerator


class DocxGenerator(BaseGenerator):
    """Generates DOCX files from Document model using python-docx."""

    def generate(self, document: Document, output_path: Path) -> Path:
        """Generate a DOCX file from the Document model."""
        docx = self._build_document(document)
        docx.save(str(output_path))
        return output_path

    def generate_bytes(self, document: Document) -> bytes:
        """Generate DOCX as bytes."""
        docx = self._build_document(document)
        buffer = BytesIO()
        docx.save(buffer)
        return buffer.getvalue()

    def _build_document(self, document: Document) -> DocxDocument:
        """Build a python-docx Document from our Document model."""
        docx = DocxDocument()

        self._setup_page(docx, document)
        self._setup_styles(docx, document)
        self._setup_header_footer(docx, document)
        self._add_content(docx, document)

        return docx

    def _setup_page(self, docx: DocxDocument, document: Document) -> None:
        """Configure page settings."""
        section = docx.sections[0]

        # Paper size (A4 is default in python-docx)
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)

        # Orientation
        if document.page_settings.orientation == Orientation.LANDSCAPE:
            section.orientation = WD_ORIENT.LANDSCAPE
            section.page_width = Cm(29.7)
            section.page_height = Cm(21.0)
        else:
            section.orientation = WD_ORIENT.PORTRAIT

        # Margins
        section.left_margin = Cm(document.page_settings.margin_left_cm)
        section.top_margin = Cm(document.page_settings.margin_top_cm)
        section.right_margin = Cm(document.page_settings.margin_right_cm)
        section.bottom_margin = Cm(document.page_settings.margin_bottom_cm)

    def _setup_styles(self, docx: DocxDocument, document: Document) -> None:
        """Configure document styles."""
        styles = docx.styles

        # Normal style
        normal = styles["Normal"]
        normal.font.name = document.styles.body.font.name
        normal.font.size = Pt(document.styles.body.font.size_pt)
        normal.paragraph_format.line_spacing = document.styles.body.line_spacing

        if document.styles.body.first_line_indent_cm:
            normal.paragraph_format.first_line_indent = Cm(
                document.styles.body.first_line_indent_cm
            )

        # Heading styles
        for heading_style in document.styles.headings:
            style_name = f"Heading {heading_style.level}"
            if style_name in styles:
                style = styles[style_name]
                style.font.name = heading_style.font.name
                style.font.size = Pt(heading_style.font.size_pt)
                style.font.bold = heading_style.font.bold
                style.paragraph_format.space_before = Pt(heading_style.space_before_pt)
                style.paragraph_format.space_after = Pt(heading_style.space_after_pt)

                if heading_style.alignment == Alignment.CENTER:
                    style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
                elif heading_style.alignment == Alignment.LEFT:
                    style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
                elif heading_style.alignment == Alignment.RIGHT:
                    style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                elif heading_style.alignment == Alignment.JUSTIFY:
                    style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    def _setup_header_footer(self, docx: DocxDocument, document: Document) -> None:
        """Configure headers and footers."""
        section = docx.sections[0]

        # Header
        if document.header.enabled:
            header = section.header
            header.is_linked_to_previous = False
            para = header.paragraphs[0]
            para.text = document.header.content
            para.style = docx.styles["Header"]

        # Footer with page numbers
        if document.footer.enabled:
            footer = section.footer
            footer.is_linked_to_previous = False
            para = footer.paragraphs[0]

            if document.footer.page_numbers.enabled:
                self._add_page_number(para, document.footer.page_numbers.format)
            else:
                para.text = document.footer.content

    def _add_page_number(self, para: Any, format_type: str) -> None:
        """Add a page number field to a paragraph."""
        from docx.oxml import OxmlElement
        from docx.oxml.ns import qn

        # Create the page number field
        run = para.add_run()
        fld_char = OxmlElement("w:fldChar")
        fld_char.set(qn("w:fldCharType"), "begin")
        run._element.append(fld_char)

        run2 = para.add_run()
        instr_text = OxmlElement("w:instrText")
        instr_text.set(qn("xml:space"), "preserve")
        if format_type == "lower_roman":
            instr_text.text = " PAGE \\* ROMAN "
        elif format_type == "upper_roman":
            instr_text.text = " PAGE \\* ROMAN "
        else:
            instr_text.text = " PAGE "
        run2._element.append(instr_text)

        run3 = para.add_run()
        fld_char2 = OxmlElement("w:fldChar")
        fld_char2.set(qn("w:fldCharType"), "end")
        run3._element.append(fld_char2)

    def _add_content(self, docx: DocxDocument, document: Document) -> None:
        """Add all content sections to the document."""
        for i, section in enumerate(document.sections):
            if i > 0:
                # Add page break between sections (except first)
                docx.add_page_break()

            for element in section.elements:
                self._add_element(docx, element, document)

    def _add_element(self, docx: DocxDocument, element: Any, document: Document) -> None:
        """Add a single element to the document."""
        if isinstance(element, Paragraph):
            self._add_paragraph(docx, element, document)
        elif isinstance(element, Heading):
            self._add_heading(docx, element, document)
        elif isinstance(element, PageBreak):
            docx.add_page_break()
        elif isinstance(element, Table):
            self._add_table(docx, element, document)
        elif isinstance(element, Image):
            self._add_image(docx, element, document)
        elif isinstance(element, List):
            self._add_list(docx, element, document)

    def _add_paragraph(
        self, docx: DocxDocument, paragraph: Paragraph, document: Document
    ) -> None:
        """Add a paragraph element."""
        para = docx.add_paragraph(paragraph.text)

        # Apply body style
        para.style = docx.styles["Normal"]

        # Apply alignment
        alignment = document.styles.body.alignment
        if paragraph.style_override and paragraph.style_override.alignment:
            alignment = paragraph.style_override.alignment

        if alignment == Alignment.CENTER:
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        elif alignment == Alignment.LEFT:
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
        elif alignment == Alignment.RIGHT:
            para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        elif alignment == Alignment.JUSTIFY:
            para.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    def _add_heading(
        self, docx: DocxDocument, heading: Heading, document: Document
    ) -> None:
        """Add a heading element."""
        # Determine heading level
        level = min(heading.level, 9)  # Word supports max heading level 9

        # Get the style name
        style_name = f"Heading {level}"
        if style_name not in docx.styles:
            style_name = "Normal"

        # Add the heading with numbering prefix if specified
        text = heading.text
        if heading.numbering:
            text = f"{heading.numbering} {heading.text}"

        para = docx.add_paragraph(text)
        para.style = docx.styles[style_name]

    def _add_table(
        self, docx: DocxDocument, table: Table, document: Document
    ) -> None:
        """Add a table element."""
        if not table.rows:
            return

        # Create table
        num_rows = len(table.rows)
        num_cols = len(table.rows[0]) if table.rows else 0
        if num_cols == 0:
            return

        tbl = docx.add_table(rows=num_rows, cols=num_cols)
        tbl.style = "Table Grid"

        # Populate cells
        for i, row_data in enumerate(table.rows):
            for j, cell_data in enumerate(row_data):
                if j < num_cols:
                    cell = tbl.cell(i, j)
                    cell.text = cell_data.text
                    if cell_data.bold:
                        for paragraph in cell.paragraphs:
                            for run in paragraph.runs:
                                run.bold = True

    def _add_image(
        self, docx: DocxDocument, image: Image, document: Document
    ) -> None:
        """Add an image element."""
        if not image.path or not Path(image.path).exists():
            return

        para = docx.add_paragraph()
        run = para.add_run()

        width = Cm(image.width_cm) if image.width_cm else None
        height = Cm(image.height_cm) if image.height_cm else None

        run.add_picture(image.path, width=width, height=height)

        # Add caption if specified
        if image.caption:
            caption_para = docx.add_paragraph(image.caption)
            caption_para.style = docx.styles["Normal"]
            caption_para.alignment = WD_ALIGN_PARAGRAPH.CENTER

    def _add_list(
        self, docx: DocxDocument, list_element: List, document: Document
    ) -> None:
        """Add a list element."""
        for item in list_element.items:
            if list_element.numbered:
                docx.add_paragraph(item, style="List Number")
            else:
                docx.add_paragraph(item, style="List Bullet")
