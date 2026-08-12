"""Style definitions for document model."""

from __future__ import annotations

from pydantic import BaseModel, Field

from .enums import Alignment


class Font(BaseModel):
    """Font configuration."""

    name: str = "Times New Roman"
    size_pt: float = 12.0
    bold: bool = False
    italic: bool = False
    underline: bool = False
    color: str | None = None  # hex color e.g. "000000"


class ParagraphStyle(BaseModel):
    """Paragraph formatting rules."""

    font: Font = Field(default_factory=Font)
    alignment: Alignment = Alignment.JUSTIFY
    line_spacing: float = 1.5
    space_before_pt: float = 0.0
    space_after_pt: float = 0.0
    first_line_indent_cm: float | None = None
    left_indent_cm: float | None = None
    right_indent_cm: float | None = None


class HeadingStyle(BaseModel):
    """Heading style configuration."""

    level: int
    font: Font = Field(default_factory=Font)
    alignment: Alignment = Alignment.LEFT
    space_before_pt: float = 12.0
    space_after_pt: float = 6.0
    keep_with_next: bool = True
    numbering_format: str | None = None  # e.g. "decimal" for "1.1"


class CoverStyle(BaseModel):
    """Cover page styling."""

    title_font: Font = Field(
        default_factory=lambda: Font(name="Times New Roman", size_pt=14, bold=True)
    )
    subtitle_font: Font = Field(default_factory=lambda: Font(name="Times New Roman", size_pt=12))
    body_font: Font = Field(default_factory=lambda: Font(name="Times New Roman", size_pt=12))
    logo_width_cm: float = 5.0
    logo_height_cm: float = 5.0
    logo_alignment: Alignment = Alignment.CENTER


class TableStyle(BaseModel):
    """Table formatting rules."""

    font: Font = Field(default_factory=lambda: Font(name="Times New Roman", size_pt=10))
    alignment: Alignment = Alignment.CENTER
    border_width_pt: float = 0.5
    cell_padding_pt: float = 4.0
    header_bold: bool = True
    header_background: str | None = None  # hex color
    row_height: str | None = None  # "auto" or specific


class ImageStyle(BaseModel):
    """Image formatting rules."""

    max_width_cm: float | None = None
    max_height_cm: float | None = None
    alignment: Alignment = Alignment.CENTER
    caption_font: Font = Field(
        default_factory=lambda: Font(name="Times New Roman", size_pt=10, italic=True)
    )


class Styles(BaseModel):
    """Collection of all styles for a document."""

    body: ParagraphStyle = Field(default_factory=ParagraphStyle)
    headings: list[HeadingStyle] = Field(default_factory=list)
    cover: CoverStyle = Field(default_factory=CoverStyle)
    table: TableStyle = Field(default_factory=TableStyle)
    image: ImageStyle = Field(default_factory=ImageStyle)

    def get_heading_style(self, level: int) -> HeadingStyle | None:
        """Get heading style for a given level."""
        for h in self.headings:
            if h.level == level:
                return h
        return None
