"""Tests for document validators."""

from engine.models import Document, Image, Table
from engine.validators import (
    ValidationResult,
    validate_document,
    validate_formatting,
    validate_metadata,
    validate_structure,
)


class TestValidationResult:
    def test_empty_result(self) -> None:
        result = ValidationResult()
        assert result.is_valid
        assert len(result.errors) == 0
        assert len(result.warnings) == 0

    def test_add_error(self) -> None:
        result = ValidationResult()
        result.add_error("E001", "Test error")
        assert not result.is_valid
        assert len(result.errors) == 1
        assert result.errors[0].code == "E001"

    def test_add_warning(self) -> None:
        result = ValidationResult()
        result.add_warning("W001", "Test warning")
        assert result.is_valid  # Warnings don't invalidate
        assert len(result.warnings) == 1

    def test_merge(self) -> None:
        r1 = ValidationResult()
        r1.add_error("E001", "Error 1")
        r2 = ValidationResult()
        r2.add_warning("W001", "Warning 1")
        r1.merge(r2)
        assert len(r1.errors) == 1
        assert len(r1.warnings) == 1


class TestMetadataValidator:
    def test_valid_metadata(self) -> None:
        doc = Document()
        doc.metadata.title = "Test Report"
        doc.metadata.author = "John Doe"
        doc.metadata.nim = "1234567890"
        result = validate_metadata(doc)
        assert result.is_valid

    def test_missing_title(self) -> None:
        doc = Document()
        result = validate_metadata(doc)
        assert result.is_valid  # Warning, not error
        assert len(result.warnings) >= 1

    def test_missing_author(self) -> None:
        doc = Document()
        result = validate_metadata(doc)
        assert any(w.code == "META-002" for w in result.warnings)

    def test_unusual_year(self) -> None:
        doc = Document()
        doc.metadata.year = 1999
        result = validate_metadata(doc)
        assert any(w.code == "META-004" for w in result.warnings)

    def test_required_fields(self) -> None:
        doc = Document()
        fields = [{"key": "author", "label": "Author", "required": True}]
        result = validate_metadata(doc, required_fields=fields)
        assert not result.is_valid
        assert any(e.code == "META-REQ" for e in result.errors)


class TestStructureValidator:
    def test_empty_document(self) -> None:
        doc = Document()
        result = validate_structure(doc)
        assert not result.is_valid
        assert any(e.code == "STRUCT-001" for e in result.errors)

    def test_document_with_sections(self) -> None:
        doc = Document()
        section = doc.add_section("Test")
        doc.add_paragraph("Content", section=section)
        result = validate_structure(doc)
        assert result.is_valid

    def test_empty_section_warning(self) -> None:
        doc = Document()
        doc.add_section("Empty Section")
        result = validate_structure(doc)
        assert any(w.code == "STRUCT-002" for w in result.warnings)

    def test_heading_hierarchy_skip(self) -> None:
        doc = Document()
        section = doc.add_section("Test")
        doc.add_heading("Chapter 1", level=1, section=section)
        doc.add_heading("Skipped H2", level=3, section=section)  # Skips H2
        result = validate_structure(doc)
        assert any(w.code == "STRUCT-004" for w in result.warnings)

    def test_expected_sections(self) -> None:
        doc = Document()
        doc.add_section("Introduction")
        doc.add_section("Conclusion")
        expected = [{"title": "Introduction"}, {"title": "Methods"}, {"title": "Conclusion"}]
        result = validate_structure(doc, expected_sections=expected)
        assert any(w.code == "STRUCT-005" for w in result.warnings)


class TestFormattingValidator:
    def test_valid_formatting(self) -> None:
        doc = Document()
        result = validate_formatting(doc)
        assert result.is_valid

    def test_unusual_margins(self) -> None:
        doc = Document()
        doc.page_settings.margin_left_cm = 0.5
        result = validate_formatting(doc)
        assert any(w.code == "FMT-001" for w in result.warnings)

    def test_unusual_font_size(self) -> None:
        doc = Document()
        doc.styles.body.font.size_pt = 6.0
        result = validate_formatting(doc)
        assert any(w.code == "FMT-005" for w in result.warnings)

    def test_missing_image(self) -> None:
        doc = Document()
        section = doc.add_section("Test")
        section.elements.append(Image(path="/nonexistent/image.png"))
        result = validate_formatting(doc)
        assert any(e.code == "FMT-008" for e in result.errors)

    def test_empty_table(self) -> None:
        doc = Document()
        section = doc.add_section("Test")
        section.elements.append(Table(rows=[]))
        result = validate_formatting(doc)
        assert any(w.code == "FMT-010" for w in result.warnings)


class TestDocumentValidator:
    def test_complete_validation(self) -> None:
        doc = Document()
        section = doc.add_section("Test")
        doc.add_heading("Chapter 1", level=1, section=section)
        doc.add_paragraph("Content", section=section)
        result = validate_document(doc)
        assert result.is_valid

    def test_validation_with_template(self) -> None:
        doc = Document()
        doc.add_section("Introduction")
        required_fields = [{"key": "author", "label": "Author", "required": True}]
        expected_sections = [{"title": "Introduction"}, {"title": "Methods"}]
        result = validate_document(doc, required_fields, expected_sections)
        # Should have error for missing author and warning for missing Methods
        assert not result.is_valid
