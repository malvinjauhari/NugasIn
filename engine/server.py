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

    # Use the appropriate generator based on template type
    template_name = doc.metadata.additional.get("template", "laprak")
    if template_name == "makalah":
        generator = MakalahGenerator()
    elif template_name == "logbook":
        generator = LogbookGenerator()
    else:
        generator = LaprakGenerator()
    docx_bytes = generator.generate_bytes(doc)

    return {
        "filename": f"{doc.metadata.title or 'document'}.docx",
        "content": base64.b64encode(docx_bytes).decode("utf-8"),
        "size": len(docx_bytes),
    }


@app.get("/formatting/{document_id}")
async def get_formatting(document_id: str) -> dict[str, Any]:
    """Get current formatting from a document."""
    doc = documents.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "page": {
            "paper": doc.page_settings.paper.value,
            "orientation": doc.page_settings.orientation.value,
            "margin_top_cm": doc.page_settings.margin_top_cm,
            "margin_bottom_cm": doc.page_settings.margin_bottom_cm,
            "margin_left_cm": doc.page_settings.margin_left_cm,
            "margin_right_cm": doc.page_settings.margin_right_cm,
        },
        "typography": {
            "font_family": doc.styles.body.font.name,
            "font_size": doc.styles.body.font.size_pt,
            "bold": doc.styles.body.font.bold,
            "italic": doc.styles.body.font.italic,
            "alignment": doc.styles.body.alignment.value,
        },
        "paragraph": {
            "line_spacing": doc.styles.body.line_spacing,
            "space_before_pt": doc.styles.body.space_before_pt,
            "space_after_pt": doc.styles.body.space_after_pt,
            "first_line_indent_cm": doc.styles.body.first_line_indent_cm or 0,
            "left_indent_cm": doc.styles.body.left_indent_cm or 0,
            "right_indent_cm": doc.styles.body.right_indent_cm or 0,
        },
        "headings": [
            {
                "level": h.level,
                "font_family": h.font.name,
                "font_size": h.font.size_pt,
                "bold": h.font.bold,
                "italic": h.font.italic,
                "alignment": h.alignment.value,
                "space_before_pt": h.space_before_pt,
                "space_after_pt": h.space_after_pt,
                "numbering_format": h.numbering_format or "none",
            }
            for h in doc.styles.headings
        ],
        "tables": {
            "alignment": doc.styles.table.alignment.value,
            "width_percent": 100,
            "border_width_pt": doc.styles.table.border_width_pt,
            "header_bold": doc.styles.table.header_bold,
            "header_background": doc.styles.table.header_background or "",
            "cell_padding_pt": doc.styles.table.cell_padding_pt,
        },
        "images": {
            "max_width_cm": doc.styles.image.max_width_cm or 15,
            "max_height_cm": doc.styles.image.max_height_cm or 20,
            "alignment": doc.styles.image.alignment.value,
        },
        "headerFooter": {
            "header_enabled": doc.header.enabled,
            "header_content": doc.header.content,
            "header_alignment": "center",
            "footer_enabled": doc.footer.enabled,
            "footer_content": doc.footer.content,
            "footer_alignment": "center",
            "different_first_page": False,
        },
        "sectionPageNumbers": {
            s.title: {
                "enabled": s.page_numbering.enabled if s.page_numbering else False,
                "format": s.page_numbering.format if s.page_numbering else "decimal",
                "numbering_type": s.page_numbering.numbering_type if s.page_numbering else "none",
                "start_value": s.page_numbering.start_value if s.page_numbering else None,
            }
            for s in doc.sections
            if s.page_numbering
        },
    }


@app.post("/formatting/{document_id}")
async def apply_formatting(document_id: str, formatting: dict[str, Any]) -> dict[str, str]:
    """Apply formatting to a document."""
    doc = documents.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Apply page settings
    page = formatting.get("page", {})
    if page:
        ps = doc.page_settings
        ps.paper = page.get("paper", ps.paper)
        ps.orientation = page.get("orientation", ps.orientation)
        ps.margin_top_cm = page.get("margin_top_cm", ps.margin_top_cm)
        ps.margin_bottom_cm = page.get("margin_bottom_cm", ps.margin_bottom_cm)
        ps.margin_left_cm = page.get("margin_left_cm", ps.margin_left_cm)
        ps.margin_right_cm = page.get("margin_right_cm", ps.margin_right_cm)

    # Apply typography
    typo = formatting.get("typography", {})
    if typo:
        doc.styles.body.font.name = typo.get("font_family", doc.styles.body.font.name)
        doc.styles.body.font.size_pt = typo.get("font_size", doc.styles.body.font.size_pt)
        doc.styles.body.font.bold = typo.get("bold", doc.styles.body.font.bold)
        doc.styles.body.font.italic = typo.get("italic", doc.styles.body.font.italic)
        doc.styles.body.alignment = typo.get("alignment", doc.styles.body.alignment)

    # Apply paragraph settings
    para = formatting.get("paragraph", {})
    if para:
        body = doc.styles.body
        body.line_spacing = para.get("line_spacing", body.line_spacing)
        body.space_before_pt = para.get("space_before_pt", body.space_before_pt)
        body.space_after_pt = para.get("space_after_pt", body.space_after_pt)
        body.first_line_indent_cm = para.get("first_line_indent_cm", body.first_line_indent_cm)
        body.left_indent_cm = para.get("left_indent_cm", body.left_indent_cm)
        body.right_indent_cm = para.get("right_indent_cm", body.right_indent_cm)

    # Apply heading styles
    from engine.models.styles import Font, HeadingStyle
    headings_cfg = formatting.get("headings", [])
    for h_cfg in headings_cfg:
        level = h_cfg.get("level", 1)
        existing = doc.styles.get_heading_style(level)
        if existing:
            existing.font.name = h_cfg.get("font_family", existing.font.name)
            existing.font.size_pt = h_cfg.get("font_size", existing.font.size_pt)
            existing.font.bold = h_cfg.get("bold", existing.font.bold)
            existing.font.italic = h_cfg.get("italic", existing.font.italic)
            existing.alignment = h_cfg.get("alignment", existing.alignment)
            existing.space_before_pt = h_cfg.get("space_before_pt", existing.space_before_pt)
            existing.space_after_pt = h_cfg.get("space_after_pt", existing.space_after_pt)
            existing.numbering_format = h_cfg.get("numbering_format", existing.numbering_format)
        else:
            doc.styles.headings.append(
                HeadingStyle(
                    level=level,
                    font=Font(
                        name=h_cfg.get("font_family", "Times New Roman"),
                        size_pt=h_cfg.get("font_size", 12),
                        bold=h_cfg.get("bold", True),
                        italic=h_cfg.get("italic", False),
                    ),
                    alignment=h_cfg.get("alignment", "left"),
                    space_before_pt=h_cfg.get("space_before_pt", 12),
                    space_after_pt=h_cfg.get("space_after_pt", 6),
                    numbering_format=h_cfg.get("numbering_format"),
                )
            )

    # Apply table settings
    tables_cfg = formatting.get("tables", {})
    if tables_cfg:
        ts = doc.styles.table
        ts.alignment = tables_cfg.get("alignment", ts.alignment)
        ts.border_width_pt = tables_cfg.get("border_width_pt", ts.border_width_pt)
        ts.header_bold = tables_cfg.get("header_bold", ts.header_bold)
        ts.header_background = tables_cfg.get("header_background", ts.header_background)
        ts.cell_padding_pt = tables_cfg.get("cell_padding_pt", ts.cell_padding_pt)

    # Apply image settings
    images_cfg = formatting.get("images", {})
    if images_cfg:
        img = doc.styles.image
        img.max_width_cm = images_cfg.get("max_width_cm", img.max_width_cm)
        img.max_height_cm = images_cfg.get("max_height_cm", img.max_height_cm)
        img.alignment = images_cfg.get("alignment", img.alignment)

    # Apply header/footer settings
    hf_cfg = formatting.get("headerFooter", {})
    if hf_cfg:
        doc.header.enabled = hf_cfg.get("header_enabled", doc.header.enabled)
        doc.header.content = hf_cfg.get("header_content", doc.header.content)
        doc.footer.enabled = hf_cfg.get("footer_enabled", doc.footer.enabled)
        doc.footer.content = hf_cfg.get("footer_content", doc.footer.content)

    # Apply per-section page numbering
    section_numbering = formatting.get("sectionPageNumbers", {})
    from engine.models.document import SectionPageNumbering
    for section in doc.sections:
        if section.title in section_numbering:
            cfg = section_numbering[section.title]
            section.page_numbering = SectionPageNumbering(
                enabled=cfg.get("enabled", False),
                format=cfg.get("format", "decimal"),
                numbering_type=cfg.get("numbering_type", "none"),
                start_value=cfg.get("start_value"),
            )

    return {"status": "ok"}
