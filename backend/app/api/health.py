"""
StudyBuddy AI - Health & Metadata Endpoints
Safe system status reports and verified academic author credits.
"""

from fastapi import APIRouter
from app.config import settings
from app.metadata import PROJECT_METADATA
from app.models.schemas import HealthResponse, ProjectMetadataResponse

router = APIRouter(tags=["Health & Identity"])


@router.get("/health", response_model=HealthResponse)
def get_health_status():
    """Returns safe operational status without disclosing secrets."""
    return HealthResponse(
        status="ok",
        version=PROJECT_METADATA["version"],
        app_name=PROJECT_METADATA["project_name"],
        groq_configured=settings.is_groq_configured(),
        masked_key=settings.get_masked_groq_key(),
        active_model=settings.groq_model,
        supported_models=settings.supported_models,
    )


@router.get("/metadata", response_model=ProjectMetadataResponse)
def get_project_metadata():
    """Returns official project identity, student credits, and academic institution info."""
    return ProjectMetadataResponse(**PROJECT_METADATA)
