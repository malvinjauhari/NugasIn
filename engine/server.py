"""FastAPI server for TugasIn document engine."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from engine.generators import LaprakGenerator, LogbookGenerator, MakalahGenerator
from engine.models import Document
from engine.templates.registry import TemplateRegistry
from engine.validators import validate_document

app = FastAPI(title="TugasIn Engine", version="0.1.0")

# Enable CORS for Tauri frontend and browser dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize template registry
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
registry = TemplateRegistry(TEMPLATES_DIR)
registry.discover()

# In-memory document store (for MVP)
documents: dict[str, Document] = {}


class GenerateRequest(BaseModel):
    """Request model for document generation."""

    template: str
    metadata: dict[str, Any] = {}


class GenerateResponse(BaseModel):
    """Response model for document generation."""

    document_id: str
    sections: int
    elements: int


class ValidateResponse(BaseModel):
    """Response model for validation."""

    issues: list[dict[str, Any]]
    is_valid: bool


@app.get("/templates")
async def list_templates() -> list[str]:
    """List available template names."""
    return registry.get_names()


@app.get("/templates/{name}")
async def get_template(name: str) -> dict[str, Any]:
    """Get a template definition."""
    try:
        return registry.get(name)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Template '{name}' not found")


@app.post("/generate", response_model=GenerateResponse)
async def generate_document(request: GenerateRequest) -> GenerateResponse:
    """Generate a document from template and metadata."""
    import uuid

    try:
        doc = registry.create_document(request.template, request.metadata)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Template '{request.template}' not found")

    # Build structure based on template type
    if request.template == "laprak":
        generator = LaprakGenerator()
        generator._build_laprak_structure(doc)
    elif request.template == "makalah":
        generator = MakalahGenerator()
        generator._build_makalah_structure(doc)
    elif request.template == "logbook":
        generator = LogbookGenerator()
        generator._build_logbook_structure(doc)

    doc_id = str(uuid.uuid4())
    documents[doc_id] = doc

    element_count = sum(len(s.elements) for s in doc.sections)

    return GenerateResponse(
        document_id=doc_id,
        sections=len(doc.sections),
        elements=element_count,
    )


@app.get("/validate/{document_id}")
async def validate_doc(document_id: str) -> ValidateResponse:
    """Validate a generated document."""
    doc = documents.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    result = validate_document(doc)

    return ValidateResponse(
        issues=[
            {
                "severity": issue.severity.value,
                "code": issue.code,
                "message": issue.message,
                "field": issue.field,
                "section": issue.section,
            }
            for issue in result.issues
        ],
        is_valid=result.is_valid,
    )


@app.get("/export/{document_id}")
async def export_doc(document_id: str) -> dict[str, Any]:
    """Export document as DOCX bytes (returns base64 for transport)."""
    import base64

    doc = documents.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    generator = LaprakGenerator()
    docx_bytes = generator.generate_bytes(doc)

    return {
        "filename": f"{doc.metadata.title or 'document'}.docx",
        "content": base64.b64encode(docx_bytes).decode("utf-8"),
        "size": len(docx_bytes),
    }
