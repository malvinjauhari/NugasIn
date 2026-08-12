"""FastAPI server for TugasIn document engine."""

from __future__ import annotations

import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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
ASSETS_DIR = Path(__file__).parent.parent / "assets" / "logos"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

registry = TemplateRegistry(TEMPLATES_DIR)
registry.discover()

# In-memory document store (for MVP)
documents: dict[str, Document] = {}

# Allowed image extensions
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}


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
    try:
        doc = registry.create_document(request.template, request.metadata)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Template '{request.template}' not found")

    # Build structure based on template type
    if request.template == "laprak":
        laprak_gen = LaprakGenerator()
        laprak_gen._build_laprak_structure(doc)
    elif request.template == "makalah":
        makalah_gen = MakalahGenerator()
        makalah_gen._build_makalah_structure(doc)
    elif request.template == "logbook":
        logbook_gen = LogbookGenerator()
        logbook_gen._build_logbook_structure(doc)

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


@app.post("/upload")
async def upload_asset(file: UploadFile = File(...)) -> dict[str, Any]:
    """Upload an image asset (logo, etc.)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Save with UUID prefix to avoid collisions
    safe_name = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    save_path = ASSETS_DIR / safe_name

    content = await file.read()
    save_path.write_bytes(content)

    return {
        "filename": safe_name,
        "original_name": file.filename,
        "path": str(save_path),
        "size": len(content),
    }


@app.get("/assets")
async def list_assets() -> list[dict[str, Any]]:
    """List uploaded image assets."""
    assets = []
    for f in ASSETS_DIR.iterdir():
        if f.is_file() and f.suffix.lower() in ALLOWED_EXTENSIONS:
            assets.append({
                "filename": f.name,
                "path": str(f),
                "size": f.stat().st_size,
            })
    return assets


@app.get("/assets/{filename}")
async def get_asset(filename: str) -> FileResponse:
    """Serve an uploaded asset file."""
    file_path = ASSETS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Asset not found")
    return FileResponse(file_path)
