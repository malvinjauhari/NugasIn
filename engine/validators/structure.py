"""Document structure validation."""

from __future__ import annotations

from typing import Any

from engine.models.document import Document, Heading

from .base import ValidationResult


def validate_structure(
    document: Document, expected_sections: list[dict[str, Any]] | None = None
) -> ValidationResult:
    """Validate document structure.

    Checks:
    - Document has at least one section
    - Heading hierarchy is consistent (no skipped levels)
    - Expected sections exist (if template specifies them)
    - Sections have content

    Args:
        document: The document to validate.
        expected_sections: List of expected section definitions from template.

    Returns:
        ValidationResult with any issues found.
    """
    result = ValidationResult()

    # Check document has sections
    if not document.sections:
        result.add_error(
            code="STRUCT-001",
            message="Document must have at least one section",
        )
        return result

    # Check sections have content
    for section in document.sections:
        if not section.elements:
            result.add_warning(
                code="STRUCT-002",
                message=f"Section '{section.title}' is empty",
                section=section.title,
            )

    # Validate heading hierarchy
    heading_hierarchy = _extract_headings(document)
    _validate_heading_hierarchy(heading_hierarchy, result)

    # Check expected sections
    if expected_sections:
        _validate_expected_sections(document, expected_sections, result)

    return result


def _extract_headings(document: Document) -> list[tuple[str, int, str]]:
    """Extract all headings with their section context.

    Returns list of (section_title, heading_level, heading_text).
    """
    headings = []
    for section in document.sections:
        for element in section.elements:
            if isinstance(element, Heading):
                headings.append((section.title, element.level, element.text))
    return headings


def _validate_heading_hierarchy(
    headings: list[tuple[str, int, str]], result: ValidationResult
) -> None:
    """Validate heading hierarchy is consistent."""
    if not headings:
        result.add_info(
            code="STRUCT-003",
            message="No headings found in document",
        )
        return

    prev_level = 0
    for section_title, level, text in headings:
        # Check for skipped levels (e.g., H1 -> H3 without H2)
        if prev_level > 0 and level > prev_level + 1:
            result.add_warning(
                code="STRUCT-004",
                message=f"Heading level skipped: H{prev_level} -> H{level} in '{text}'",
                field=text,
                section=section_title,
            )
        prev_level = level


def _validate_expected_sections(
    document: Document,
    expected: list[dict[str, Any]],
    result: ValidationResult,
) -> None:
    """Validate expected sections exist."""
    actual_titles = {s.title.lower() for s in document.sections}

    for section_def in expected:
        title = section_def.get("title", "")
        if title and title.lower() not in actual_titles:
            result.add_warning(
                code="STRUCT-005",
                message=f"Expected section '{title}' not found",
                section=title,
            )
