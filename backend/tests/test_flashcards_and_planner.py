"""
Tests for flashcards mastery tracking and study planner schedule generation.
"""

from datetime import datetime, timedelta
import pytest
from app.services.flashcard_service import flashcard_service
from app.services.planner_service import planner_service
from app.models.schemas import (
    FlashcardDeckGenerateRequest,
    FlashcardStatusUpdateRequest,
    StudyPlanGenerateRequest,
    StudySubjectInput,
    StudyBlockToggleRequest,
)


def test_flashcards_generation_and_progress(db_session):
    req = FlashcardDeckGenerateRequest(
        topic="Computer Networks",
        card_count=4,
    )
    deck = flashcard_service.generate_deck(db_session, req)
    assert deck.id is not None
    assert deck.card_count == 4
    assert len(deck.cards) == 4

    # Update mastery for card-1
    update_req = FlashcardStatusUpdateRequest(
        deck_id=deck.id,
        card_id=deck.cards[0].id,
        status="known",
    )
    res = flashcard_service.update_card_status(db_session, update_req)
    assert res["status"] == "success"

    # Fetch deck with progress
    updated_deck = flashcard_service.get_deck_with_progress(db_session, deck.id)
    assert updated_deck.known_count == 1
    assert updated_deck.cards[0].status == "known"


def test_study_plan_generation_and_toggle(db_session):
    future_date = (datetime.utcnow().date() + timedelta(days=10)).strftime("%Y-%m-%d")
    req = StudyPlanGenerateRequest(
        target_exam="GATE CSE 2027",
        exam_date=future_date,
        available_hours_per_day=3.0,
        subjects=[
            StudySubjectInput(name="Algorithms", priority="High", difficulty="Hard"),
            StudySubjectInput(name="Operating Systems", priority="Medium", difficulty="Medium"),
        ],
    )
    plan = planner_service.generate_plan(db_session, req)
    assert plan.id is not None
    assert len(plan.schedule) > 0
    assert plan.completion_percentage == 0.0

    # Toggle first session block to completed
    toggle_req = StudyBlockToggleRequest(
        plan_id=plan.id,
        block_id=plan.schedule[0].id,
        completed=True,
    )
    updated_plan = planner_service.toggle_block(db_session, toggle_req)
    assert updated_plan.completion_percentage > 0.0
    assert updated_plan.schedule[0].completed is True


def test_study_plan_past_date_validation(db_session):
    past_date = (datetime.utcnow().date() - timedelta(days=5)).strftime("%Y-%m-%d")
    req = StudyPlanGenerateRequest(
        target_exam="Past Exam",
        exam_date=past_date,
        subjects=[StudySubjectInput(name="Math")],
    )
    with pytest.raises(ValueError, match="Target examination date must be at least 1 day in the future"):
        planner_service.generate_plan(db_session, req)
