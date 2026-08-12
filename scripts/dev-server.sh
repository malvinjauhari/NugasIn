#!/usr/bin/env bash
# Run the TugasIn Python API server for development.

set -euo pipefail

cd "$(dirname "$0")"

# Activate virtualenv if present
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

echo "Starting TugasIn API server on http://localhost:8000"
uvicorn engine.server:app --reload --host 0.0.0.0 --port 8000
