"""Document validation."""

from __future__ import annotations

from typing import Any

from engine.models.document import Document

from .base import ValidationResult
from .formatting import validate_formatting
from .metadata import validate_metadata
from .structure import validate_structure


def validate_document(
    document: Document,
    required_fields: list[dict[str, Any]] | None = None,
    expected_sections: list[dict[str, Any]] | None = None,
) -> ValidationResult:
    """Validate a complete document.

    Runs all validators and combines results.

    Args:
        document: The document to validate.
        required_fields: Required metadata fields from template.
        expected_sections: Expected sections from template.

    Returns:
        Combined ValidationResult from all validators.
    """
    result = ValidationResult()

    # Run all validators
    result.merge(validate_metadata(document, required_fields))
    result.merge(validate_structure(document, expected_sections))
    result.merge(validate_formatting(document))

    return result
