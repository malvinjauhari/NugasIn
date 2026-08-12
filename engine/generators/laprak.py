"""Laprak (Laporan Praktikum) specific generator."""

from __future__ import annotations

from pathlib import Path

from engine.models.document import Document
from engine.templates.loader import load_template, template_to_document

from .docx import DocxGenerator


class LaprakGenerator(DocxGenerator):
    """Generator specific to Laporan Praktikum documents."""

    def generate_from_metadata(
        self, metadata: dict, output_path: Path, template_dir: Path | None = None
    ) -> Path:
        """Generate a Laprak document from metadata.

        Args:
            metadata: Dictionary with document metadata.
            output_path: Path to save the generated DOCX.
            template_dir: Path to template directory (uses default if None).

        Returns:
            Path to the generated file.
        """
        if template_dir is None:
            template_dir = Path(__file__).parent.parent.parent / "templates" / "laprak"

        template = load_template(template_dir)
        document = template_to_document(template, metadata)

        # Build the standard Laprak structure
        self._build_laprak_structure(document)

        return self.generate(document, output_path)

    def _build_laprak_structure(self, document: Document) -> None:
        """Build the standard Laprak document structure."""
        # Cover section
        cover = document.add_section("Cover")
        cover.elements.clear()  # Clear any auto-added elements

        # Add logo if provided
        logo_path = document.metadata.logo_path
        if logo_path and Path(logo_path).exists():
            from engine.models.document import Image
            from engine.models.styles import ImageStyle

            cover.elements.append(
                Image(
                    src=logo_path,
                    alt="Logo Universitas",
                    style=ImageStyle(alignment="center"),
                )
            )

        # BAB I PENDAHULUAN
        bab1 = document.add_section("BAB I PENDAHULUAN")
        document.add_heading("BAB I PENDAHULUAN", level=1, section=bab1)
        document.add_heading("1.1 Tujuan Praktikum", level=2, section=bab1)
        document.add_paragraph("Isi tujuan praktikum di sini.", section=bab1)
        document.add_heading("1.2 Alat dan Bahan", level=2, section=bab1)
        document.add_paragraph("Isi alat dan bahan di sini.", section=bab1)

        # BAB II DASAR TEORI
        bab2 = document.add_section("BAB II DASAR TEORI")
        document.add_heading("BAB II DASAR TEORI", level=1, section=bab2)
        document.add_paragraph("Isi dasar teori di sini.", section=bab2)

        # BAB III HASIL PRAKTIKUM DAN PEMBAHASAN
        bab3 = document.add_section("BAB III HASIL PRAKTIKUM DAN PEMBAHASAN")
        document.add_heading("BAB III HASIL PRAKTIKUM DAN PEMBAHASAN", level=1, section=bab3)
        document.add_heading("3.1 Source Code", level=2, section=bab3)
        document.add_paragraph("Sertakan source code di sini.", section=bab3)
        document.add_heading("3.2 Screenshot Output", level=2, section=bab3)
        document.add_paragraph("Sertakan screenshot output di sini.", section=bab3)
        document.add_heading("3.3 Analisis dan Pembahasan", level=2, section=bab3)
        document.add_paragraph("Isi analisis dan pembahasan di sini.", section=bab3)

        # BAB IV KESIMPULAN
        bab4 = document.add_section("BAB IV KESIMPULAN")
        document.add_heading("BAB IV KESIMPULAN", level=1, section=bab4)
        document.add_paragraph("Isi kesimpulan di sini.", section=bab4)

        # Daftar Pustaka
        ref = document.add_section("Daftar Pustaka")
        document.add_heading("Daftar Pustaka", level=1, section=ref)
        document.add_paragraph("Isi daftar pustaka di sini.", section=ref)
