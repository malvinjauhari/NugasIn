"""Logbook Tugas Besar specific generator."""

from __future__ import annotations

from pathlib import Path

from engine.models.document import Document, Heading, Paragraph, Table, TableCell
from engine.templates.loader import load_template, template_to_document

from .docx import DocxGenerator


class LogbookGenerator(DocxGenerator):
    """Generator specific to Logbook Tugas Besar documents."""

    def generate_from_metadata(
        self, metadata: dict, output_path: Path, template_dir: Path | None = None
    ) -> Path:
        """Generate a Logbook document from metadata.

        Args:
            metadata: Dictionary with document metadata.
            output_path: Path to save the generated DOCX.
            template_dir: Path to template directory (uses default if None).

        Returns:
            Path to the generated file.
        """
        if template_dir is None:
            template_dir = Path(__file__).parent.parent.parent / "templates" / "logbook"

        template = load_template(template_dir)
        document = template_to_document(template, metadata)

        # Build the standard Logbook structure
        self._build_logbook_structure(document)

        return self.generate(document, output_path)

    def _build_logbook_structure(self, document: Document) -> None:
        """Build the standard Logbook document structure."""
        metadata = document.metadata

        # Header section with metadata
        header_section = document.add_section("Header")
        document.add_heading("LOGBOOK TUGAS BESAR", level=1, section=header_section)

        # Metadata table
        metadata_rows = [
            [TableCell(text="Mata Kuliah", bold=True), TableCell(text=metadata.module or "")],
            [TableCell(text="Judul Tugas Besar", bold=True), TableCell(text=metadata.title or "")],
            [TableCell(text="Kelompok", bold=True), TableCell(text=metadata.group or "")],
            [TableCell(text="Kelas", bold=True), TableCell(text=metadata.class_name or "")],
            [TableCell(text="Nama Anggota", bold=True), TableCell(text=metadata.author or "")],
            [TableCell(text="NIM", bold=True), TableCell(text=metadata.nim or "")],
        ]
        document.sections[-1].elements.append(
            Table(rows=metadata_rows, header_row=False)
        )

        # Progress log table
        table_section = document.add_section("Logbook Table")
        document.add_heading("LOGBOOK Aktivitas", level=1, section=table_section)

        # Column headers
        headers = [
            "No.",
            "Hari, Tanggal",
            "Aktivitas / Progres Pengerjaan",
            "Anggota yang Hadir",
            "Kendala",
            "Solusi",
            "Paraf",
        ]

        header_row = [TableCell(text=h, bold=True) for h in headers]

        # Sample rows (empty for user to fill)
        sample_rows = [
            [TableCell(text=str(i)) for i in range(1, 6)]
            + [TableCell(text="") for _ in range(1)]
            for _ in range(5)
        ]

        # Create the main logbook table
        all_rows = [header_row] + [
            [
                TableCell(text="1"),
                TableCell(text=""),
                TableCell(text=""),
                TableCell(text=""),
                TableCell(text=""),
                TableCell(text=""),
                TableCell(text=""),
            ]
            for _ in range(10)
        ]

        table_section.elements.append(
            Table(
                rows=all_rows,
                header_row=True,
                col_widths_cm=[1.0, 2.5, 5.0, 3.0, 3.0, 3.0, 2.0],
            )
        )
