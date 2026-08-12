"""Enumerations for document model."""

from enum import Enum


class PaperSize(str, Enum):
    """Standard paper sizes."""

    A4 = "a4"
    LETTER = "letter"
    LEGAL = "legal"


class Orientation(str, Enum):
    """Page orientation."""

    PORTRAIT = "portrait"
    LANDSCAPE = "landscape"


class Alignment(str, Enum):
    """Text alignment."""

    LEFT = "left"
    CENTER = "center"
    RIGHT = "right"
    JUSTIFY = "justify"


class HeadingLevel(int, Enum):
    """Heading hierarchy levels."""

    H1 = 1
    H2 = 2
    H3 = 3
    H4 = 4
    H5 = 5
    H6 = 6


class ElementType(str, Enum):
    """Types of document elements."""

    PARAGRAPH = "paragraph"
    HEADING = "heading"
    IMAGE = "image"
    TABLE = "table"
    LIST = "list"
    PAGE_BREAK = "page_break"
    CODE_BLOCK = "code_block"


class NumberingFormat(str, Enum):
    """Numbering formats."""

    DECIMAL = "decimal"  # 1, 2, 3
    LOWER_ALPHA = "lower_alpha"  # a, b, c
    UPPER_ALPHA = "upper_alpha"  # A, B, C
    LOWER_ROMAN = "lower_roman"  # i, ii, iii
    UPPER_ROMAN = "upper_roman"  # I, II, III
    BULLET = "bullet"
