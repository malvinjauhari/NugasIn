"""Document generators for TugasIn."""

from .base import BaseGenerator
from .docx import DocxGenerator
from .laprak import LaprakGenerator

__all__ = ["BaseGenerator", "DocxGenerator", "LaprakGenerator"]
