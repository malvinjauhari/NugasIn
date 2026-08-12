"""Makalah Akademik specific generator."""

from __future__ import annotations

from pathlib import Path

from engine.models.document import Document
from engine.templates.loader import load_template, template_to_document

from .docx import DocxGenerator


class MakalahGenerator(DocxGenerator):
    """Generator specific to Makalah Akademik documents."""

    def generate_from_metadata(
        self, metadata: dict, output_path: Path, template_dir: Path | None = None
    ) -> Path:
        """Generate a Makalah document from metadata.

        Args:
            metadata: Dictionary with document metadata.
            output_path: Path to save the generated DOCX.
            template_dir: Path to template directory (uses default if None).

        Returns:
            Path to the generated file.
        """
        if template_dir is None:
            template_dir = Path(__file__).parent.parent.parent / "templates" / "makalah"

        template = load_template(template_dir)
        document = template_to_document(template, metadata)

        # Build the standard Makalah structure
        self._build_makalah_structure(document)

        return self.generate(document, output_path)

    def _build_makalah_structure(self, document: Document) -> None:
        """Build the standard Makalah document structure."""
        # Cover section
        cover = document.add_section("Cover")
        cover.elements.clear()

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

        # Kata Pengantar
        kata_pengantar = document.add_section("Kata Pengantar")
        document.add_heading("KATA PENGANTAR", level=1, section=kata_pengantar)
        document.add_paragraph(
            "Puji syukur kami panjutkan ke hadirat Tuhan Yang Maha Esa atas segala "
            "berkat dan rahmat-Nya sehingga kami dapat menyelesaikan makalah ini dengan baik.",
            section=kata_pengantar,
        )
        document.add_paragraph(
            "Makalah ini membahas tentang topik yang kami anggap penting untuk "
            "dipelajari dan dipahami. Kami menyadari bahwa makalah ini masih "
            "jauh dari sempurna, oleh karena itu kritik dan saran yang "
            "membangun sangat kami harapkan.",
            section=kata_pengantar,
        )
        document.add_paragraph(
            "Semoga makalah ini dapat bermanfaat bagi pembaca.",
            section=kata_pengantar,
        )

        # Daftar Isi
        daftar_isi = document.add_section("Daftar Isi")
        document.add_heading("DAFTAR ISI", level=1, section=daftar_isi)

        # Daftar Gambar
        daftar_gambar = document.add_section("Daftar Gambar")
        document.add_heading("DAFTAR GAMBAR", level=1, section=daftar_gambar)

        # Daftar Tabel
        daftar_tabel = document.add_section("Daftar Tabel")
        document.add_heading("DAFTAR TABEL", level=1, section=daftar_tabel)

        # BAB I PENDAHULUAN
        bab1 = document.add_section("BAB I PENDAHULUAN")
        document.add_heading("BAB I PENDAHULUAN", level=1, section=bab1)
        document.add_heading("1.1 Latar Belakang", level=2, section=bab1)
        document.add_paragraph("Isi latar belakang di sini.", section=bab1)
        document.add_heading("1.2 Rumusan Masalah", level=2, section=bab1)
        document.add_paragraph("Isi rumusan masalah di sini.", section=bab1)
        document.add_heading("1.3 Tujuan Penulisan", level=2, section=bab1)
        document.add_paragraph("Isi tujuan penulisan di sini.", section=bab1)

        # BAB II PEMBAHASAN
        bab2 = document.add_section("BAB II PEMBAHASAN")
        document.add_heading("BAB II PEMBAHASAN", level=1, section=bab2)
        document.add_heading("2.1 Kajian Teori", level=2, section=bab2)
        document.add_paragraph("Isi kajian teori di sini.", section=bab2)
        document.add_heading("2.2 Analisis Masalah", level=2, section=bab2)
        document.add_paragraph("Isi analisis masalah di sini.", section=bab2)

        # BAB III PENUTUP
        bab3 = document.add_section("BAB III PENUTUP")
        document.add_heading("BAB III PENUTUP", level=1, section=bab3)
        document.add_heading("3.1 Kesimpulan", level=2, section=bab3)
        document.add_paragraph("Isi kesimpulan di sini.", section=bab3)
        document.add_heading("3.2 Saran", level=2, section=bab3)
        document.add_paragraph("Isi saran di sini.", section=bab3)

        # Daftar Pustaka
        daftar_pustaka = document.add_section("Daftar Pustaka")
        document.add_heading("DAFTAR PUSTAKA", level=1, section=daftar_pustaka)
        document.add_paragraph("Isi daftar pustaka di sini.", section=daftar_pustaka)
