"""Tests for document models."""

from engine.models import (
    Alignment,
    Document,
    ElementType,
    Font,
    Heading,
    HeadingLevel,
    Metadata,
    Orientation,
    PageBreak,
    PageSettings,
    PaperSize,
    Paragraph,
    Styles,
)


class TestEnums:
    def test_paper_size(self) -> None:
        assert PaperSize.A4 == "a4"
        assert PaperSize.A4.value == "a4"

    def test_orientation(self) -> None:
        assert Orientation.PORTRAIT == "portrait"
        assert Orientation.LANDSCAPE == "landscape"

    def test_alignment(self) -> None:
        assert Alignment.JUSTIFY == "justify"

    def test_heading_level(self) -> None:
        assert HeadingLevel.H1 == 1
        assert HeadingLevel.H2 == 2

    def test_element_type(self) -> None:
        assert ElementType.PARAGRAPH == "paragraph"
        assert ElementType.HEADING == "heading"
        assert ElementType.TABLE == "table"


class TestFont:
    def test_default_font(self) -> None:
        font = Font()
        assert font.name == "Times New Roman"
        assert font.size_pt == 12.0
        assert font.bold is False

    def test_custom_font(self) -> None:
        font = Font(name="Arial", size_pt=10, bold=True)
        assert font.name == "Arial"
        assert font.size_pt == 10.0
        assert font.bold is True


class TestPageSettings:
    def test_default_page(self) -> None:
        page = PageSettings()
        assert page.paper == PaperSize.A4
        assert page.orientation == Orientation.PORTRAIT
        assert page.margin_left_cm == 4.0
        assert page.margin_top_cm == 3.0

    def test_custom_page(self) -> None:
        page = PageSettings(orientation=Orientation.LANDSCAPE, margin_left_cm=2.0)
        assert page.orientation == Orientation.LANDSCAPE
        assert page.margin_left_cm == 2.0


class TestMetadata:
    def test_default_metadata(self) -> None:
        meta = Metadata()
        assert meta.institution == "Telkom University"
        assert meta.year == 2026

    def test_custom_metadata(self) -> None:
        meta = Metadata(title="My Report", author="John", nim="12345")
        assert meta.title == "My Report"
        assert meta.author == "John"
        assert meta.nim == "12345"


class TestDocument:
    def test_create_empty(self) -> None:
        doc = Document()
        assert doc.sections == []
        assert doc.page_settings.paper == PaperSize.A4

    def test_add_section(self) -> None:
        doc = Document()
        section = doc.add_section("Test Section")
        assert len(doc.sections) == 1
        assert section.title == "Test Section"

    def test_add_paragraph(self) -> None:
        doc = Document()
        doc.add_paragraph("Hello world")
        assert len(doc.sections) == 1
        assert len(doc.sections[0].elements) == 1
        assert isinstance(doc.sections[0].elements[0], Paragraph)
        assert doc.sections[0].elements[0].text == "Hello world"

    def test_add_heading(self) -> None:
        doc = Document()
        heading = doc.add_heading("Introduction", level=1)
        assert isinstance(heading, Heading)
        assert heading.level == 1
        assert heading.text == "Introduction"

    def test_add_page_break(self) -> None:
        doc = Document()
        doc.add_paragraph("Before break")
        pb = doc.add_page_break()
        doc.add_paragraph("After break")
        assert isinstance(pb, PageBreak)
        assert len(doc.sections[0].elements) == 3

    def test_multiple_sections(self) -> None:
        doc = Document()
        s1 = doc.add_section("Section 1")
        doc.add_paragraph("Para 1", section=s1)
        s2 = doc.add_section("Section 2")
        doc.add_paragraph("Para 2", section=s2)
        assert len(doc.sections) == 2
        assert len(s1.elements) == 1
        assert len(s2.elements) == 1

    def test_serialization(self) -> None:
        doc = Document()
        doc.add_paragraph("Test")
        data = doc.model_dump()
        assert "metadata" in data
        assert "page_settings" in data
        assert "sections" in data


class TestStyles:
    def test_default_body_style(self) -> None:
        styles = Styles()
        assert styles.body.font.name == "Times New Roman"
        assert styles.body.line_spacing == 1.5

    def test_get_heading_style(self) -> None:
        headings = [
            {"level": 1, "font": {"name": "Times New Roman", "size_pt": 14, "bold": True}},
            {"level": 2, "font": {"name": "Times New Roman", "size_pt": 12, "bold": True}},
        ]
        styles = Styles(headings=headings)  # type: ignore[arg-type]
        h1 = styles.get_heading_style(1)
        h2 = styles.get_heading_style(2)
        h3 = styles.get_heading_style(3)
        assert h1 is not None
        assert h1.font.size_pt == 14.0
        assert h2 is not None
        assert h3 is None
