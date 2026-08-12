"""Template loader — reads JSON/YAML template files."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

from engine.models import (
    Document,
    FooterConfig,
    HeaderConfig,
    Metadata,
    PageNumbers,
    PageSettings,
    Styles,
)


def load_template(template_dir: Path) -> dict[str, Any]:
    """Load a template definition from a directory.

    Looks for template.json or template.yaml in the given directory.
    Returns the parsed template as a dictionary.
    """
    json_path = template_dir / "template.json"
    yaml_path = template_dir / "template.yaml"

    if json_path.exists():
        import json

        return json.loads(json_path.read_text(encoding="utf-8"))  # type: ignore[no-any-return]
    elif yaml_path.exists():
        return yaml.safe_load(yaml_path.read_text(encoding="utf-8"))  # type: ignore[no-any-return]
    else:
        raise FileNotFoundError(f"No template.json or template.yaml found in {template_dir}")


def template_to_document(
    template: dict[str, Any], metadata: dict[str, Any] | None = None
) -> Document:
    """Convert a template definition to a Document model.

    This creates a Document pre-configured with the template's settings,
    ready to have content added to it.
    """
    page_cfg = template.get("page", {})
    styles_cfg = template.get("styles", {})
    body_cfg = styles_cfg.get("body", {})
    font_cfg = body_cfg.get("font", {})
    header_cfg = template.get("header", {})
    footer_cfg = template.get("footer", {})

    doc = Document(
        page_settings=PageSettings(
            paper=page_cfg.get("paper", "a4"),
            orientation=page_cfg.get("orientation", "portrait"),
            margin_left_cm=page_cfg.get("margins", {}).get("left", 4.0),
            margin_top_cm=page_cfg.get("margins", {}).get("top", 3.0),
            margin_right_cm=page_cfg.get("margins", {}).get("right", 3.0),
            margin_bottom_cm=page_cfg.get("margins", {}).get("bottom", 3.0),
        ),
        styles=Styles(
            body={  # type: ignore[arg-type]
                "font": {
                    "name": font_cfg.get("name", "Times New Roman"),
                    "size_pt": font_cfg.get("size", 12),
                },
                "alignment": body_cfg.get("alignment", "justify"),
                "line_spacing": body_cfg.get("line_spacing", 1.5),
            }
        ),
        header=HeaderConfig(
            enabled=header_cfg.get("enabled", False),
            content=header_cfg.get("content", ""),
        ),
        footer=FooterConfig(
            enabled=footer_cfg.get("enabled", True),
            page_numbers=PageNumbers(
                enabled=footer_cfg.get("page_numbers", {}).get("enabled", True),
                format=footer_cfg.get("page_numbers", {}).get("format", "decimal"),
                position=footer_cfg.get("page_numbers", {}).get("position", "bottom-center"),
            ),
        ),
    )

    if metadata:
        doc.metadata = Metadata(**metadata)

    return doc
