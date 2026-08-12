"""Formatting validation."""

from __future__ import annotations

from engine.models.document import Document, Image, Table

from .base import ValidationResult


def validate_formatting(document: Document) -> ValidationResult:
    """Validate document formatting consistency.

    Checks:
    - Page settings are valid
    - Styles are consistent
    - Images have valid paths
    - Tables have consistent column counts

    Args:
        document: The document to validate.

    Returns:
        ValidationResult with any issues found.
    """
    result = ValidationResult()

    # Validate page settings
    _validate_page_settings(document, result)

    # Validate styles
    _validate_styles(document, result)

    # Validate images
    _validate_images(document, result)

    # Validate tables
    _validate_tables(document, result)

    return result


def _validate_page_settings(document: Document, result: ValidationResult) -> None:
    """Validate page settings are reasonable."""
    page = document.page_settings

    # Check margins are reasonable
    if page.margin_left_cm < 1.0 or page.margin_left_cm > 6.0:
        result.add_warning(
            code="FMT-001",
            message=f"Left margin {page.margin_left_cm}cm seems unusual (typical: 2.5-4cm)",
            field="margin_left_cm",
        )

    if page.margin_top_cm < 1.0 or page.margin_top_cm > 6.0:
        result.add_warning(
            code="FMT-002",
            message=f"Top margin {page.margin_top_cm}cm seems unusual (typical: 2.5-3cm)",
            field="margin_top_cm",
        )

    if page.margin_right_cm < 1.0 or page.margin_right_cm > 6.0:
        result.add_warning(
            code="FMT-003",
            message=f"Right margin {page.margin_right_cm}cm seems unusual (typical: 2.5-3cm)",
            field="margin_right_cm",
        )

    if page.margin_bottom_cm < 1.0 or page.margin_bottom_cm > 6.0:
        result.add_warning(
            code="FMT-004",
            message=f"Bottom margin {page.margin_bottom_cm}cm seems unusual (typical: 2.5-3cm)",
            field="margin_bottom_cm",
        )


def _validate_styles(document: Document, result: ValidationResult) -> None:
    """Validate style definitions."""
    styles = document.styles

    # Check body font size is reasonable
    if styles.body.font.size_pt < 8 or styles.body.font.size_pt > 16:
        result.add_warning(
            code="FMT-005",
            message=f"Body font size {styles.body.font.size_pt}pt seems unusual (typical: 10-12pt)",
            field="body.font.size_pt",
        )

    # Check line spacing is reasonable
    if styles.body.line_spacing < 1.0 or styles.body.line_spacing > 3.0:
        result.add_warning(
            code="FMT-006",
            message=f"Line spacing {styles.body.line_spacing} seems unusual (typical: 1.0-2.0)",
            field="body.line_spacing",
        )

    # Check heading styles exist
    if not styles.headings:
        result.add_info(
            code="FMT-007",
            message="No heading styles defined (will use defaults)",
        )


def _validate_images(document: Document, result: ValidationResult) -> None:
    """Validate image elements."""
    from pathlib import Path

    for section in document.sections:
        for element in section.elements:
            if isinstance(element, Image):
                if element.path and not Path(element.path).exists():
                    result.add_error(
                        code="FMT-008",
                        message=f"Image not found: {element.path}",
                        field="image.path",
                        section=section.title,
                    )
                elif not element.path:
                    result.add_warning(
                        code="FMT-009",
                        message="Image has no path specified",
                        field="image.path",
                        section=section.title,
                    )


def _validate_tables(document: Document, result: ValidationResult) -> None:
    """Validate table elements."""
    for section in document.sections:
        for element in section.elements:
            if isinstance(element, Table):
                if not element.rows:
                    result.add_warning(
                        code="FMT-010",
                        message="Table has no rows",
                        field="table",
                        section=section.title,
                    )
                else:
                    # Check consistent column counts
                    col_counts = [len(row) for row in element.rows]
                    if len(set(col_counts)) > 1:
                        result.add_warning(
                            code="FMT-011",
                            message=f"Table has inconsistent column counts: {col_counts}",
                            field="table",
                            section=section.title,
                        )
