"""Validation result models."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel


class Severity(str, Enum):
    """Validation issue severity levels."""

    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class ValidationIssue(BaseModel):
    """A single validation issue."""

    severity: Severity
    code: str
    message: str
    field: str | None = None
    section: str | None = None


class ValidationResult(BaseModel):
    """Collection of validation issues."""

    issues: list[ValidationIssue] = []

    @property
    def errors(self) -> list[ValidationIssue]:
        """Get all error-level issues."""
        return [i for i in self.issues if i.severity == Severity.ERROR]

    @property
    def warnings(self) -> list[ValidationIssue]:
        """Get all warning-level issues."""
        return [i for i in self.issues if i.severity == Severity.WARNING]

    @property
    def infos(self) -> list[ValidationIssue]:
        """Get all info-level issues."""
        return [i for i in self.issues if i.severity == Severity.INFO]

    @property
    def is_valid(self) -> bool:
        """Check if document has no errors."""
        return len(self.errors) == 0

    def add_error(
        self, code: str, message: str, field: str | None = None, section: str | None = None
    ) -> None:
        """Add an error issue."""
        self.issues.append(
            ValidationIssue(
                severity=Severity.ERROR, code=code, message=message, field=field, section=section
            )
        )

    def add_warning(
        self, code: str, message: str, field: str | None = None, section: str | None = None
    ) -> None:
        """Add a warning issue."""
        self.issues.append(
            ValidationIssue(
                severity=Severity.WARNING, code=code, message=message, field=field, section=section
            )
        )

    def add_info(
        self, code: str, message: str, field: str | None = None, section: str | None = None
    ) -> None:
        """Add an info issue."""
        self.issues.append(
            ValidationIssue(
                severity=Severity.INFO, code=code, message=message, field=field, section=section
            )
        )

    def merge(self, other: ValidationResult) -> None:
        """Merge another result into this one."""
        self.issues.extend(other.issues)
