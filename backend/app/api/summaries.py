"""
StudyBuddy AI - Summarizer Endpoints
Multi-tier document summarization and knowledge extraction API.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.summary_service import summary_service
from app.models.schemas import SummarizeRequest, SummarizeResponse

router = APIRouter(prefix="/summaries", tags=["AI Summarizer"])


@router.post("", response_model=SummarizeResponse)
def generate_summary(req: SummarizeRequest, db: Session = Depends(get_db)):
    """Produces multi-level summaries with extracted definitions and exam questions."""
    try:
        result = summary_service.summarize(db, req)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")
