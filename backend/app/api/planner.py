"""
StudyBuddy AI - Study Planner Endpoints
Timetable generation, retrieval, and study block completion toggling.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import StudyPlanModel
from app.services.planner_service import planner_service
from app.models.schemas import (
    StudyPlanGenerateRequest,
    StudyPlanResponse,
    StudyBlockToggleRequest,
    StudySubjectInput,
    StudySessionBlock,
)

router = APIRouter(prefix="/planner", tags=["Study Planner"])


@router.post("/generate", response_model=StudyPlanResponse)
def generate_study_plan(req: StudyPlanGenerateRequest, db: Session = Depends(get_db)):
    """Synthesizes a personalized preparation roadmap for an upcoming exam."""
    try:
        return planner_service.generate_plan(db, req)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate study plan: {str(e)}")


@router.get("/active", response_model=StudyPlanResponse)
def get_active_plan(db: Session = Depends(get_db)):
    """Retrieves the most recent active study plan."""
    plan = db.query(StudyPlanModel).order_by(StudyPlanModel.created_at.desc()).first()
    if not plan:
        raise HTTPException(status_code=404, detail="No active study plan found.")

    blocks = plan.schedule_json
    completed_count = sum(1 for b in blocks if b.get("completed"))
    completion_pct = round((completed_count / len(blocks)) * 100.0, 1) if blocks else 0.0

    subjects = [StudySubjectInput(**s) for s in plan.subjects_json]
    schedule_blocks = [StudySessionBlock(**b) for b in blocks]

    return StudyPlanResponse(
        id=plan.id,
        title=plan.title,
        target_exam=plan.target_exam,
        exam_date=plan.exam_date,
        available_hours_per_day=plan.available_hours_per_day,
        subjects=subjects,
        schedule=schedule_blocks,
        completion_percentage=completion_pct,
        created_at=plan.created_at,
    )


@router.post("/toggle", response_model=StudyPlanResponse)
def toggle_block_completion(req: StudyBlockToggleRequest, db: Session = Depends(get_db)):
    """Toggles completion state of a scheduled study block."""
    try:
        return planner_service.toggle_block(db, req)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
