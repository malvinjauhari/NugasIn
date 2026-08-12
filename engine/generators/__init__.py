"""Document generators for TugasIn."""

from .base import BaseGenerator
from .docx import DocxGenerator
from .laprak import LaprakGenerator
from .logbook import LogbookGenerator
from .makalah import MakalahGenerator

__all__ = [
    "BaseGenerator",
    "DocxGenerator",
    "LaprakGenerator",
    "LogbookGenerator",
    "MakalahGenerator",
]
