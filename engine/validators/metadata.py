"""Metadata validation."""

from __future__ import annotations

from typing import Any

from engine.models.document import Document

from .base import ValidationResult


def validate_metadata(
    document: Document, required_fields: list[dict[str, Any]] | None = None
) -> ValidationResult:
    """Validate document metadata.

    Args:
        document: The document to validate.
        required_fields: List of field definitions from template.

    Returns:
        ValidationResult with any issues found.
    """
    result = ValidationResult()
    metadata = document.metadata

    # Check title
    if not metadata.title and not metadata.module:
        result.add_warning(
            code="META-001",
            message="Title or module name is recommended",
            field="title",
        )

    # Check author
    if not metadata.author:
        result.add_warning(
            code="META-002",
            message="Author name is recommended",
            field="author",
        )

    # Check NIM
    if not metadata.nim:
        result.add_warning(
            code="META-003",
            message="NIM (student ID) is recommended",
            field="nim",
        )

    # Validate against template required fields
    if required_fields:
        for field_def in required_fields:
            key = field_def.get("key", "")
            label = field_def.get("label", key)
            required = field_def.get("required", False)

            if required:
                value = getattr(metadata, key, None) or metadata.additional.get(key)
                if not value:
                    result.add_error(
                        code="META-REQ",
                        message=f"{label} is required",
                        field=key,
                    )

    # Validate year
    if metadata.year < 2000 or metadata.year > 2100:
        result.add_warning(
            code="META-004",
            message=f"Year {metadata.year} seems unusual",
            field="year",
        )

    return result
