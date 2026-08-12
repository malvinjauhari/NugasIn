"""Template registry — discovers and manages available templates."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .loader import load_template, template_to_document


class TemplateRegistry:
    """Registry of available document templates."""

    def __init__(self, templates_dir: Path | None = None) -> None:
        if templates_dir is None:
            templates_dir = Path(__file__).parent.parent.parent / "templates"
        self.templates_dir = templates_dir
        self._templates: dict[str, dict[str, Any]] = {}

    def discover(self) -> list[str]:
        """Discover all available templates.

        Returns list of template names found in the templates directory.
        """
        self._templates.clear()

        if not self.templates_dir.exists():
            return []

        for template_dir in self.templates_dir.iterdir():
            if template_dir.is_dir():
                json_path = template_dir / "template.json"
                yaml_path = template_dir / "template.yaml"
                if json_path.exists() or yaml_path.exists():
                    self._templates[template_dir.name] = load_template(template_dir)

        return list(self._templates.keys())

    def get(self, name: str) -> dict[str, Any]:
        """Get a template definition by name."""
        if name not in self._templates:
            available = list(self._templates.keys())
            raise KeyError(f"Template '{name}' not found. Available: {available}")
        return self._templates[name]

    def get_names(self) -> list[str]:
        """Get list of available template names."""
        return list(self._templates.keys())

    def create_document(self, name: str, metadata: dict[str, Any] | None = None) -> Any:
        """Create a Document from a template."""
        template = self.get(name)
        return template_to_document(template, metadata)

    def get_metadata_fields(self, name: str) -> list[dict[str, Any]]:
        """Get the required metadata fields for a template."""
        template = self.get(name)
        fields = template.get("metadata_fields", [])
        return fields  # type: ignore[no-any-return]
