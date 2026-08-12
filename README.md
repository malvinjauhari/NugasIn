# TugasIn

Academic document builder for Indonesian university students. Generates structured, properly-formatted `.docx` files from templates.

## Templates

- **Laporan Praktikum (Laprak)** — Lab report formatting
- **Makalah Akademik** — Academic paper formatting
- **Logbook Tugas Besar** — Project logbook with table structure

## Tech Stack

- **Desktop:** Tauri 2
- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Python (FastAPI)
- **DOCX Generation:** python-docx
- **Validation:** Pydantic

## Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- Rust (for Tauri)

### Setup

```bash
# Python engine
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Frontend
npm install
```

### Run Tests

```bash
# Python
pytest

# Frontend
npm test
```

### Lint

```bash
# Python
ruff check engine/
mypy engine/

# Frontend
npm run lint
```

## Architecture

```
Document Model (single source of truth)
    ├──→ Preview Renderer (React)
    └──→ DOCX Generator (python-docx)
```

## License

MIT
