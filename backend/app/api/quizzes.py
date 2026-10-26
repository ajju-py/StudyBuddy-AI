"""
StudyBuddy AI - Quiz Endpoints
Generation, retrieval, deterministic submission grading, and attempt history.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import QuizModel, QuizAttemptModel
from app.services.quiz_service import quiz_service
from app.models.schemas import (
    QuizGenerateRequest,
    QuizResponse,
    QuizItemClient,
    QuizSubmitRequest,
    QuizAttemptResponse,
    QuizHistoryItem,
)

router = APIRouter(prefix="/quizzes", tags=["Quiz Generator"])


@router.post("/generate", response_model=QuizResponse)
def generate_quiz(req: QuizGenerateRequest, db: Session = Depends(get_db)):
    """Generates an exam practice quiz with sanitized client questions."""
    try:
        quiz_res = quiz_service.generate_quiz(db, req)
        return quiz_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")


@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Fetches a quiz with answer options, hiding correct answers for integrity."""
    quiz = db.query(QuizModel).filter(QuizModel.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")

    client_questions = [
        QuizItemClient(
            id=q.get("id"),
            question=q.get("question"),
            question_type=q.get("question_type"),
            options=q.get("options", []),
            points=q.get("points", 1.0),
        )
        for q in quiz.questions_json
    ]

    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        topic=quiz.topic,
        difficulty=quiz.difficulty,
        question_count=len(client_questions),
        questions=client_questions,
        created_at=quiz.created_at,
    )


@router.post("/submit", response_model=QuizAttemptResponse)
def submit_quiz_answers(req: QuizSubmitRequest, db: Session = Depends(get_db)):
    """Grades submitted quiz answers deterministically in application code."""
    try:
        result = quiz_service.grade_quiz(db, req)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grading failed: {str(e)}")


@router.get("/history/all", response_model=List[QuizHistoryItem])
def get_quiz_history(db: Session = Depends(get_db)):
    """Returns recorded quiz history with actual percentages and timestamps."""
    attempts = (
        db.query(QuizAttemptModel)
        .order_by(QuizAttemptModel.created_at.desc())
        .limit(25)
        .all()
    )
    history = []
    for a in attempts:
        quiz_title = a.quiz.title if a.quiz else f"Quiz #{a.quiz_id}"
        topic = a.quiz.topic if a.quiz else "General"
        difficulty = a.quiz.difficulty if a.quiz else "Medium"
        history.append(
            QuizHistoryItem(
                attempt_id=a.id,
                quiz_id=a.quiz_id,
                quiz_title=quiz_title,
                topic=topic,
                difficulty=difficulty,
                score=a.score,
                max_score=a.max_score,
                percentage=a.percentage,
                completed_at=a.created_at,
            )
        )
    return history
