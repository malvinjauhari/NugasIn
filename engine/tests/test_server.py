"""Tests for FastAPI server endpoints."""

from fastapi.testclient import TestClient

from engine.server import app

client = TestClient(app)


class TestTemplatesEndpoint:
    def test_list_templates(self) -> None:
        response = client.get("/templates")
        assert response.status_code == 200
        templates = response.json()
        assert isinstance(templates, list)
        assert "laprak" in templates

    def test_get_template(self) -> None:
        response = client.get("/templates/laprak")
        assert response.status_code == 200
        template = response.json()
        assert template["name"] == "laprak"
        assert "page" in template
        assert "styles" in template
        assert "structure" in template

    def test_get_nonexistent_template(self) -> None:
        response = client.get("/templates/nonexistent")
        assert response.status_code == 404


class TestGenerateEndpoint:
    def test_generate_document(self) -> None:
        response = client.post(
            "/generate",
            json={
                "template": "laprak",
                "metadata": {
                    "author": "John Doe",
                    "nim": "1234567890",
                    "module": "Modul 1",
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "document_id" in data
        assert data["sections"] > 0
        assert data["elements"] > 0

    def test_generate_with_invalid_template(self) -> None:
        response = client.post(
            "/generate",
            json={"template": "nonexistent", "metadata": {}},
        )
        assert response.status_code == 404


class TestValidateEndpoint:
    def test_validate_document(self) -> None:
        # First generate a document
        gen_response = client.post(
            "/generate",
            json={
                "template": "laprak",
                "metadata": {"author": "John", "nim": "12345"},
            },
        )
        doc_id = gen_response.json()["document_id"]

        # Then validate it
        response = client.get(f"/validate/{doc_id}")
        assert response.status_code == 200
        data = response.json()
        assert "issues" in data
        assert "is_valid" in data
        assert isinstance(data["issues"], list)

    def test_validate_nonexistent_document(self) -> None:
        response = client.get("/validate/nonexistent-id")
        assert response.status_code == 404


class TestExportEndpoint:
    def test_export_document(self) -> None:
        # First generate a document
        gen_response = client.post(
            "/generate",
            json={
                "template": "laprak",
                "metadata": {"author": "John", "title": "Test Report"},
            },
        )
        doc_id = gen_response.json()["document_id"]

        # Then export it
        response = client.get(f"/export/{doc_id}")
        assert response.status_code == 200
        data = response.json()
        assert "filename" in data
        assert "content" in data
        assert "size" in data
        assert data["size"] > 0
        assert data["filename"].endswith(".docx")

    def test_export_nonexistent_document(self) -> None:
        response = client.get("/export/nonexistent-id")
        assert response.status_code == 404


class TestEndToEnd:
    def test_full_workflow(self) -> None:
        """Test complete workflow: list templates -> generate -> validate -> export."""
        # 1. List templates
        templates = client.get("/templates").json()
        assert "laprak" in templates

        # 2. Get template details
        template = client.get("/templates/laprak").json()
        assert template["name"] == "laprak"

        # 3. Generate document
        gen_response = client.post(
            "/generate",
            json={
                "template": "laprak",
                "metadata": {
                    "author": "Jane Smith",
                    "nim": "9876543210",
                    "module": "Modul 3 - Data Structures",
                    "class_name": "TI-2B",
                },
            },
        )
        assert gen_response.status_code == 200
        doc_id = gen_response.json()["document_id"]

        # 4. Validate document
        val_response = client.get(f"/validate/{doc_id}")
        assert val_response.status_code == 200
        validation = val_response.json()
        assert validation["is_valid"]  # Should be valid

        # 5. Export document
        export_response = client.get(f"/export/{doc_id}")
        assert export_response.status_code == 200
        export_data = export_response.json()
        assert export_data["size"] > 0
        assert ".docx" in export_data["filename"]
