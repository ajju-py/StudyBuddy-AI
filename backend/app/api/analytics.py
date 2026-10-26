"""
StudyBuddy AI - Progress Analytics Endpoints
Aggregates authentic, verified user activity data with zero fabricated statistics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import (
    QuizAttemptModel,
    DocumentModel,
    FlashcardProgressModel,
    StudyPlanModel,
    ActivityLogModel,
    ChatMessageModel,
)
from app.models.schemas import ProgressAnalyticsResponse, RecentActivityItem

router = APIRouter(prefix="/analytics", tags=["Progress Analytics"])


@router.get("", response_model=ProgressAnalyticsResponse)
def get_progress_analytics(db: Session = Depends(get_db)):
    """
    Returns authentic learning metrics calculated strictly from persistent records.
    Never invents mock activity or artificial metrics.
    """
    # Total questions answered in quizzes
    attempts = db.query(QuizAttemptModel).order_by(QuizAttemptModel.created_at.desc()).all()
    total_quizzes = len(attempts)

    total_questions = sum(len(a.feedback_json) for a in attempts)
    avg_score = round(sum(a.percentage for a in attempts) / total_quizzes, 1) if total_quizzes > 0 else 0.0

    # Flashcards reviewed
    card_progs = db.query(FlashcardProgressModel).all()
    reviewed_cards = [c for c in card_progs if c.status != "unseen"]
    known_cards = [c for c in card_progs if c.status == "known"]
    revision_cards = [c for c in card_progs if c.status == "needs_revision"]

    # Documents uploaded
    total_docs = db.query(DocumentModel).count()

    # Active study plans
    plans = db.query(StudyPlanModel).all()
    total_plans = len(plans)

    # Average study plan completion rate
    plan_rates = []
    for p in plans:
        blocks = p.schedule_json or []
        if blocks:
            done = sum(1 for b in blocks if b.get("completed"))
            plan_rates.append((done / len(blocks)) * 100.0)
    avg_plan_completion = round(sum(plan_rates) / len(plan_rates), 1) if plan_rates else 0.0

    # Recent quiz score trends
    recent_scores = [
        {
            "id": a.id,
            "title": a.quiz.title if a.quiz else f"Quiz #{a.quiz_id}",
            "percentage": a.percentage,
            "score": a.score,
            "max_score": a.max_score,
            "date": a.created_at.strftime("%b %d, %H:%M"),
        }
        for a in attempts[:8]
    ]

    # Recent activity logs
    logs = db.query(ActivityLogModel).order_by(ActivityLogModel.created_at.desc()).limit(10).all()
    activity_items = [
        RecentActivityItem(
            id=log.id,
            activity_type=log.activity_type,
            title=log.title,
            description=log.description,
            created_at=log.created_at,
        )
        for log in logs
    ]

    return ProgressAnalyticsResponse(
        total_questions_answered=total_questions,
        total_quizzes_completed=total_quizzes,
        actual_average_quiz_score=avg_score,
        total_flashcards_reviewed=len(reviewed_cards),
        known_flashcards_count=len(known_cards),
        revision_flashcards_count=len(revision_cards),
        total_documents_uploaded=total_docs,
        total_study_plans_active=total_plans,
        study_plan_completion_rate=avg_plan_completion,
        recent_quiz_scores=recent_scores,
        recent_activities=activity_items,
    )
