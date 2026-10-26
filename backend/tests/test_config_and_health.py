"""
Tests for configuration management, key masking, and health/metadata endpoints.
"""

from app.config import Settings
from app.metadata import PROJECT_METADATA


def test_settings_masked_key_security():
    s = Settings(groq_api_key="gsk_123456789abcdefghijklmnopqrstuvwxyz")
    masked = s.get_masked_groq_key()
    assert masked.startswith("gsk_")
    assert masked.endswith("wxyz")
    assert "abcdef" not in masked
    assert s.is_groq_configured() is True


def test_settings_unconfigured_key():
    s = Settings(groq_api_key="")
    assert s.is_groq_configured() is False
    assert s.get_masked_groq_key() == "Not Configured"

    s_placeholder = Settings(groq_api_key="your_groq_api_key_here")
    assert s_placeholder.is_groq_configured() is False


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "StudyBuddy AI"
    assert "masked_key" in data
    assert "active_model" in data
    # Ensure raw secret is never present
    assert "your_groq_api_key_here" not in str(data)


def test_metadata_endpoint_credits(client):
    response = client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert data["project_name"] == "StudyBuddy AI"
    assert data["academic_year"] == "2026–2027"
    
    author_names = [a["name"] for a in data["authors"]]
    assert "Ajay Tandale" in author_names
    assert "Sakshi Thombre" in author_names

    assert "Maharashtra Institute of Technology" in data["institution"]["name"]
    assert "Chhatrapati Sambhajinagar" in data["institution"]["city"]
