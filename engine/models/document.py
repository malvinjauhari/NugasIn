"""Core document model."""

from __future__ import annotations

from pydantic import BaseModel, Field

from .enums import Alignment, ElementType, Orientation, PaperSize
from .styles import Font, ParagraphStyle, Styles


class Metadata(BaseModel):
    """Document metadata."""

    title: str = ""
    subtitle: str = ""
    author: str = ""
    nim: str = ""
    class_name: str = ""
    program: str = ""
    faculty: str = ""
    institution: str = "Telkom University"
    year: int = 2026
    lecturer: str = ""
    assistant: str = ""
    group: str = ""
    module: str = ""
    logo_path: str = ""
    additional: dict[str, str] = Field(default_factory=dict)


class PageSettings(BaseModel):
    """Page configuration."""

    paper: PaperSize = PaperSize.A4
    orientation: Orientation = Orientation.PORTRAIT
    margin_left_cm: float = 4.0
    margin_top_cm: float = 3.0
    margin_right_cm: float = 3.0
    margin_bottom_cm: float = 3.0


class PageNumbers(BaseModel):
    """Page number configuration."""

    enabled: bool = True
    format: str = "decimal"  # decimal, lower_roman, upper_roman
    position: str = "bottom-center"  # bottom-center, bottom-right, top-right


class HeaderConfig(BaseModel):
    """Header configuration."""

    enabled: bool = False
    content: str = ""
    font: Font = Field(default_factory=lambda: Font(size_pt=9, italic=True))


class FooterConfig(BaseModel):
    """Footer configuration."""

    enabled: bool = True
    content: str = ""
    page_numbers: PageNumbers = Field(default_factory=PageNumbers)


class Paragraph(BaseModel):
    """A text paragraph element."""

    type: ElementType = ElementType.PARAGRAPH
    text: str = ""
    style_override: ParagraphStyle | None = None


class Heading(BaseModel):
    """A heading element."""

    type: ElementType = ElementType.HEADING
    level: int = 1
    text: str = ""
    numbering: str | None = None  # e.g. "1.1" or "BAB I"
    style_override: ParagraphStyle | None = None


class Image(BaseModel):
    """An image element."""

    type: ElementType = ElementType.IMAGE
    path: str = ""
    alt: str = ""
    width_cm: float | None = None
    height_cm: float | None = None
    caption: str = ""


class TableCell(BaseModel):
    """A table cell."""

    text: str = ""
    bold: bool = False
    alignment: Alignment = Alignment.LEFT
    colspan: int = 1
    rowspan: int = 1


class Table(BaseModel):
    """A table element."""

    type: ElementType = ElementType.TABLE
    rows: list[list[TableCell]] = Field(default_factory=list)
    header_row: bool = True
    col_widths_cm: list[float] | None = None


class PageBreak(BaseModel):
    """A page break element."""

    type: ElementType = ElementType.PAGE_BREAK


class List(BaseModel):
    """A list element."""

    type: ElementType = ElementType.LIST
    items: list[str] = Field(default_factory=list)
    numbered: bool = False
    level: int = 0


class CodeBlock(BaseModel):
    """A code block element."""

    type: ElementType = ElementType.CODE_BLOCK
    code: str = ""
    language: str = ""


DocumentElement = Paragraph | Heading | Image | Table | PageBreak | List | CodeBlock


class Section(BaseModel):
    """A document section."""

    title: str = ""
    elements: list[DocumentElement] = Field(default_factory=list)


class Document(BaseModel):
    """The complete document model — single source of truth."""

    metadata: Metadata = Field(default_factory=Metadata)
    page_settings: PageSettings = Field(default_factory=PageSettings)
    styles: Styles = Field(default_factory=Styles)
    header: HeaderConfig = Field(default_factory=HeaderConfig)
    footer: FooterConfig = Field(default_factory=FooterConfig)
    sections: list[Section] = Field(default_factory=list)

    def add_section(self, title: str = "") -> Section:
        """Add a new section and return it."""
        section = Section(title=title)
        self.sections.append(section)
        return section

    def add_paragraph(self, text: str, section: Section | None = None) -> Paragraph:
        """Add a paragraph to a section."""
        element = Paragraph(text=text)
        target = section or (self.sections[-1] if self.sections else self.add_section())
        target.elements.append(element)
        return element

    def add_heading(self, text: str, level: int = 1, section: Section | None = None) -> Heading:
        """Add a heading to a section."""
        element = Heading(text=text, level=level)
        target = section or (self.sections[-1] if self.sections else self.add_section())
        target.elements.append(element)
        return element

    def add_page_break(self, section: Section | None = None) -> PageBreak:
        """Add a page break to a section."""
        element = PageBreak()
        target = section or (self.sections[-1] if self.sections else self.add_section())
        target.elements.append(element)
        return element
