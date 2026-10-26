"""
Tests for quiz generation, client answer sanitization, and deterministic scoring.
"""

from app.services.quiz_service import quiz_service
from app.models.schemas import QuizGenerateRequest, QuizSubmitRequest


def test_generate_quiz_sanitization(db_session):
    req = QuizGenerateRequest(
        topic="Database Normalization",
        difficulty="Medium",
        question_count=3,
    )
    quiz_res = quiz_service.generate_quiz(db_session, req)
    assert quiz_res.id is not None
    assert quiz_res.question_count == 3

    # Client questions must not expose correct_answer or explanation
    for q in quiz_res.questions:
        q_dict = q.dict()
        assert "correct_answer" not in q_dict
        assert "explanation" not in q_dict
        assert q.question_type in ["multiple_choice", "true_false", "short_answer"]


def test_grade_quiz_deterministic_scoring(db_session):
    req = QuizGenerateRequest(
        topic="Data Structures",
        difficulty="Easy",
        question_count=2,
    )
    quiz_res = quiz_service.generate_quiz(db_session, req)

    # Submit answers
    # From fallback questions:
    # Q1: "A structured discipline and methodology addressing key problems in Data Structures."
    # Q2: "True"
    submit_req = QuizSubmitRequest(
        quiz_id=quiz_res.id,
        answers={
            "1": "A structured discipline and methodology addressing key problems in Data Structures.",
            "2": "False",  # incorrect
        }
    )
    attempt_res = quiz_service.grade_quiz(db_session, submit_req)
    assert attempt_res.quiz_id == quiz_res.id
    assert attempt_res.score == 1.0
    assert attempt_res.max_score == 2.0
    assert attempt_res.percentage == 50.0
    assert attempt_res.passed is False

    feedback_1 = next(f for f in attempt_res.feedback if f.question_id == 1)
    assert feedback_1.is_correct is True
    assert feedback_1.points_awarded == 1.0

    feedback_2 = next(f for f in attempt_res.feedback if f.question_id == 2)
    assert feedback_2.is_correct is False
    assert feedback_2.points_awarded == 0.0
