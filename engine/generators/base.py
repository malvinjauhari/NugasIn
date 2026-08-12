"""Base generator interface."""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from engine.models.document import Document


class BaseGenerator(ABC):
    """Abstract base class for document generators."""

    @abstractmethod
    def generate(self, document: Document, output_path: Path) -> Path:
        """Generate a document file from the Document model.

        Args:
            document: The Document model to generate from.
            output_path: Path where the output file should be saved.

        Returns:
            Path to the generated file.
        """

    @abstractmethod
    def generate_bytes(self, document: Document) -> bytes:
        """Generate document as bytes.

        Args:
            document: The Document model to generate from.

        Returns:
            Document content as bytes.
        """
