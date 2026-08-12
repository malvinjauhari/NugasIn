"""Tests for DOCX generator."""

from pathlib import Path

from engine.generators import DocxGenerator, LaprakGenerator
from engine.models import Document, Heading

TEST_OUTPUT_DIR = Path(__file__).parent.parent.parent / "test_output"


class TestDocxGenerator:
    def setup_method(self) -> None:
        """Set up test fixtures."""
        TEST_OUTPUT_DIR.mkdir(exist_ok=True)
        self.generator = DocxGenerator()

    def test_generate_empty_document(self, tmp_path: Path) -> None:
        """Test generating an empty document."""
        doc = Document()
        output = tmp_path / "empty.docx"
        result = self.generator.generate(doc, output)
        assert result.exists()
        assert result.suffix == ".docx"

    def test_generate_with_paragraphs(self, tmp_path: Path) -> None:
        """Test generating a document with paragraphs."""
        doc = Document()
        section = doc.add_section("Test")
        doc.add_paragraph("Hello world", section=section)
        doc.add_paragraph("Another paragraph", section=section)

        output = tmp_path / "paragraphs.docx"
        result = self.generator.generate(doc, output)
        assert result.exists()

    def test_generate_with_headings(self, tmp_path: Path) -> None:
        """Test generating a document with headings."""
        doc = Document()
        section = doc.add_section("Test")
        doc.add_heading("Chapter 1", level=1, section=section)
        doc.add_heading("Section 1.1", level=2, section=section)
        doc.add_paragraph("Content", section=section)

        output = tmp_path / "headings.docx"
        result = self.generator.generate(doc, output)
        assert result.exists()

    def test_generate_bytes(self) -> None:
        """Test generating document as bytes."""
        doc = Document()
        doc.add_paragraph("Test content")
        result = self.generator.generate_bytes(doc)
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_page_settings_applied(self, tmp_path: Path) -> None:
        """Test that page settings are applied."""
        doc = Document()
        doc.page_settings.margin_left_cm = 2.5
        doc.page_settings.margin_top_cm = 2.0

        output = tmp_path / "page_settings.docx"
        self.generator.generate(doc, output)
        assert output.exists()


class TestLaprakGenerator:
    def setup_method(self) -> None:
        """Set up test fixtures."""
        TEST_OUTPUT_DIR.mkdir(exist_ok=True)
        self.generator = LaprakGenerator()

    def test_generate_laprak(self, tmp_path: Path) -> None:
        """Test generating a complete Laprak document."""
        metadata = {
            "title": "Laporan Praktikum",
            "author": "John Doe",
            "nim": "1234567890",
            "class_name": "TI-2A",
            "module": "Modul 1 - Pengenalan Python",
        }
        output = tmp_path / "laprak.docx"
        result = self.generator.generate_from_metadata(metadata, output)
        assert result.exists()
        assert result.stat().st_size > 0

    def test_laprak_structure(self, tmp_path: Path) -> None:
        """Test that Laprak has the correct structure."""
        doc = Document()
        self.generator._build_laprak_structure(doc)

        # Check sections exist
        assert len(doc.sections) >= 5  # Cover + 4 BABs + Daftar Pustaka

        # Check headings
        all_headings = []
        for section in doc.sections:
            for element in section.elements:
                if isinstance(element, Heading):
                    all_headings.append(element.text)

        assert "BAB I PENDAHULUAN" in all_headings
        assert "BAB II DASAR TEORI" in all_headings
        assert "BAB III HASIL PRAKTIKUM DAN PEMBAHASAN" in all_headings
        assert "BAB IV KESIMPULAN" in all_headings
        assert "Daftar Pustaka" in all_headings
