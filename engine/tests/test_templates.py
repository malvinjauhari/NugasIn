"""Tests for template system."""

from pathlib import Path

import pytest

from engine.models import Document, PaperSize
from engine.templates.loader import load_template, template_to_document
from engine.templates.registry import TemplateRegistry

TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates"


class TestTemplateLoader:
    def test_load_laprak_template(self) -> None:
        template = load_template(TEMPLATES_DIR / "laprak")
        assert template["name"] == "laprak"
        assert template["display_name"] == "Laporan Praktikum"
        assert "page" in template
        assert "styles" in template
        assert "structure" in template
        assert "metadata_fields" in template

    def test_load_nonexistent_template(self) -> None:
        with pytest.raises(FileNotFoundError):
            load_template(TEMPLATES_DIR / "nonexistent")

    def test_template_to_document(self) -> None:
        template = load_template(TEMPLATES_DIR / "laprak")
        doc = template_to_document(template)
        assert isinstance(doc, Document)
        assert doc.page_settings.paper == PaperSize.A4
        assert doc.page_settings.margin_left_cm == 4.0

    def test_template_to_document_with_metadata(self) -> None:
        template = load_template(TEMPLATES_DIR / "laprak")
        metadata = {"title": "Laprak FP", "author": "John Doe", "nim": "1234567890"}
        doc = template_to_document(template, metadata)
        assert doc.metadata.title == "Laprak FP"
        assert doc.metadata.author == "John Doe"
        assert doc.metadata.nim == "1234567890"


class TestTemplateRegistry:
    def test_discover_templates(self) -> None:
        registry = TemplateRegistry(TEMPLATES_DIR)
        names = registry.discover()
        assert "laprak" in names

    def test_get_template(self) -> None:
        registry = TemplateRegistry(TEMPLATES_DIR)
        registry.discover()
        template = registry.get("laprak")
        assert template["name"] == "laprak"

    def test_get_nonexistent_template(self) -> None:
        registry = TemplateRegistry(TEMPLATES_DIR)
        registry.discover()
        with pytest.raises(KeyError):
            registry.get("nonexistent")

    def test_create_document(self) -> None:
        registry = TemplateRegistry(TEMPLATES_DIR)
        registry.discover()
        doc = registry.create_document("laprak")
        assert isinstance(doc, Document)
        assert doc.page_settings.paper == PaperSize.A4

    def test_get_metadata_fields(self) -> None:
        registry = TemplateRegistry(TEMPLATES_DIR)
        registry.discover()
        fields = registry.get_metadata_fields("laprak")
        assert len(fields) > 0
        assert any(f["key"] == "author" for f in fields)
        assert any(f["key"] == "nim" for f in fields)

    def test_list_templates(self) -> None:
        registry = TemplateRegistry(TEMPLATES_DIR)
        registry.discover()
        names = registry.get_names()
        assert "laprak" in names
