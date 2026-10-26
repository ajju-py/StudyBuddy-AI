"""
StudyBuddy AI - Quiz Generation & Deterministic Scoring Service
Constructs validated quizzes, safeguards answer integrity before submission,
and performs deterministic server-side grading with explanatory feedback.
"""

import json
import logging
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.config import settings
from app.services.groq_service import groq_service
from app.services.document_service import document_service
from app.database.models import QuizModel, QuizAttemptModel, DocumentModel, ActivityLogModel
from app.models.schemas import (
    QuizQuestion,
    QuizGenerateRequest,
    QuizResponse,
    QuizItemClient,
    QuizSubmitRequest,
    QuizAttemptResponse,
    QuestionFeedback,
)

logger = logging.getLogger("studybuddy.quiz")


class QuizService:
    def generate_quiz(self, db: Session, req: QuizGenerateRequest) -> QuizResponse:
        """
        Generates a validated practice quiz on a topic or source document using Groq.
        """
        context_text = ""
        source_doc_name = req.topic

        if req.document_id:
            doc = db.query(DocumentModel).filter(DocumentModel.id == req.document_id).first()
            if doc:
                source_doc_name = doc.original_name
                passages = document_service.retrieve_relevant_passages(
                    db=db,
                    query=req.topic,
                    top_k=5,
                    document_id=doc.id
                )
                if passages:
                    context_text = "\n\n".join([f"Passage (Page {p.page_number}): {p.snippet}" for p in passages])

        questions: List[QuizQuestion] = []

        if settings.is_groq_configured():
            prompt = (
                f"You are an expert academic examiner. Create a {req.difficulty}-level quiz with exactly {req.question_count} questions "
                f"on the topic: '{req.topic}'.\n"
                f"{f'Use the following verified study context if relevant:\n{context_text}\n' if context_text else ''}\n"
                "Question types allowed: " + ", ".join(req.question_types) + ".\n\n"
                "Return ONLY a valid JSON array of objects. Each object must follow this EXACT schema:\n"
                "[\n"
                "  {\n"
                "    \"id\": 1,\n"
                "    \"question\": \"Question text here?\",\n"
                "    \"question_type\": \"multiple_choice\" (or \"true_false\" or \"short_answer\"),\n"
                "    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
                "    \"correct_answer\": \"Option A\",\n"
                "    \"explanation\": \"Clear rationale explaining why Option A is correct.\",\n"
                "    \"points\": 1.0\n"
                "  }\n"
                "]\n\n"
                "Ensure multiple_choice questions have exactly 4 plausible options. For true_false, options must be [\"True\", \"False\"]. "
                "Do not include markdown backticks or commentary outside the JSON array."
            )

            try:
                response = groq_service.create_chat_completion(
                    messages=[
                        {"role": "system", "content": "You are a specialized quiz generation engine. Return strictly raw JSON arrays with no markdown wrapper."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=3000,
                )
                raw_json = response.choices[0].message.content.strip()

                # Clean markdown backticks if present
                if raw_json.startswith("```json"):
                    raw_json = raw_json[7:]
                elif raw_json.startswith("```"):
                    raw_json = raw_json[3:]
                if raw_json.endswith("```"):
                    raw_json = raw_json[:-3]
                raw_json = raw_json.strip()

                parsed = json.loads(raw_json)
                if isinstance(parsed, list):
                    for idx, q_data in enumerate(parsed):
                        q_data["id"] = idx + 1
                        q = QuizQuestion(**q_data)
                        questions.append(q)

            except Exception as e:
                logger.error("Failed to parse Groq quiz generation output: %s", str(e))
                # Fallback to deterministic default questions if parsing failed
                questions = self._get_fallback_questions(req.topic, req.difficulty, req.question_count)
        else:
            # Demonstration / fallback mode
            questions = self._get_fallback_questions(req.topic, req.difficulty, req.question_count)

        # Persist quiz
        quiz_record = QuizModel(
            title=f"{req.topic} ({req.difficulty})",
            topic=req.topic,
            difficulty=req.difficulty,
            question_count=len(questions),
            questions_json=[q.model_dump() for q in questions],
            source_document_id=req.document_id,
        )
        db.add(quiz_record)
        db.commit()
        db.refresh(quiz_record)

        # Return sanitized client representation without correct_answer
        client_questions = [
            QuizItemClient(
                id=q.id,
                question=q.question,
                question_type=q.question_type,
                options=q.options,
                points=q.points,
            )
            for q in questions
        ]

        return QuizResponse(
            id=quiz_record.id,
            title=quiz_record.title,
            topic=quiz_record.topic,
            difficulty=quiz_record.difficulty,
            question_count=len(client_questions),
            questions=client_questions,
            created_at=quiz_record.created_at,
        )

    def grade_quiz(self, db: Session, req: QuizSubmitRequest) -> QuizAttemptResponse:
        """
        Deterministic, server-side grading of student answers.
        Computes scores, points, percentages, and builds detailed feedback.
        """
        quiz = db.query(QuizModel).filter(QuizModel.id == req.quiz_id).first()
        if not quiz:
            raise ValueError(f"Quiz with ID {req.quiz_id} not found.")

        stored_questions = [QuizQuestion(**q) for q in quiz.questions_json]
        total_score = 0.0
        max_score = 0.0
        feedback_list: List[QuestionFeedback] = []

        for q in stored_questions:
            max_score += q.points
            user_ans = req.answers.get(str(q.id), "").strip()

            is_correct = False
            points_awarded = 0.0

            if q.question_type in ["multiple_choice", "true_false"]:
                # Case-insensitive comparison
                if user_ans.lower() == q.correct_answer.strip().lower():
                    is_correct = True
                    points_awarded = q.points
            else:
                # Short answer heuristic: token overlap & keyword matching
                is_correct, points_awarded = self._evaluate_short_answer(user_ans, q.correct_answer, q.points)

            total_score += points_awarded

            feedback_list.append(
                QuestionFeedback(
                    question_id=q.id,
                    question=q.question,
                    user_answer=user_ans if user_ans else "(No answer provided)",
                    correct_answer=q.correct_answer,
                    is_correct=is_correct,
                    explanation=q.explanation,
                    points_awarded=points_awarded,
                )
            )

        percentage = round((total_score / max_score) * 100.0, 1) if max_score > 0 else 0.0
        passed = percentage >= 60.0

        # Save attempt
        attempt = QuizAttemptModel(
            quiz_id=quiz.id,
            score=round(total_score, 1),
            max_score=round(max_score, 1),
            percentage=percentage,
            answers_json=req.answers,
            feedback_json=[f.model_dump() for f in feedback_list],
        )
        db.add(attempt)

        # Log activity
        activity = ActivityLogModel(
            activity_type="quiz",
            title=f"Completed Quiz: {quiz.title}",
            description=f"Scored {total_score}/{max_score} ({percentage}%)",
            details_json={"quiz_id": quiz.id, "percentage": percentage, "passed": passed},
        )
        db.add(activity)
        db.commit()
        db.refresh(attempt)

        return QuizAttemptResponse(
            attempt_id=attempt.id,
            quiz_id=quiz.id,
            quiz_title=quiz.title,
            score=round(total_score, 1),
            max_score=round(max_score, 1),
            percentage=percentage,
            passed=passed,
            feedback=feedback_list,
            completed_at=attempt.created_at,
        )

    def _evaluate_short_answer(self, user_ans: str, correct_ans: str, max_points: float) -> (bool, float):
        """Grades short answers using keyword token normalization."""
        if not user_ans:
            return False, 0.0

        clean_user = set(re.findall(r'\b\w{3,}\b', user_ans.lower()))
        clean_correct = set(re.findall(r'\b\w{3,}\b', correct_ans.lower()))

        if not clean_correct:
            return True, max_points

        overlap = clean_user.intersection(clean_correct)
        ratio = len(overlap) / len(clean_correct)

        if ratio >= 0.7:
            return True, max_points
        elif ratio >= 0.4:
            return True, round(max_points * 0.5, 1)
        else:
            return False, 0.0

    def _get_fallback_questions(self, topic: str, difficulty: str, count: int) -> List[QuizQuestion]:
        """Provides verified fallback questions when AI service is unavailable."""
        base_pool = [
            QuizQuestion(
                id=1,
                question=f"What is the foundational definition or objective of {topic}?",
                question_type="multiple_choice",
                options=[
                    f"A structured discipline and methodology addressing key problems in {topic}.",
                    f"A deprecated historical framework no longer utilized in modern {topic}.",
                    f"An isolated hardware device unrelated to computing architectures.",
                    f"A proprietary binary format with no practical applications.",
                ],
                correct_answer=f"A structured discipline and methodology addressing key problems in {topic}.",
                explanation=f"{topic} provides systemic principles and operational frameworks essential for practical implementations.",
                points=1.0,
            ),
            QuizQuestion(
                id=2,
                question=f"In {topic}, optimization and efficiency trade-offs must be evaluated based on workload demands.",
                question_type="true_false",
                options=["True", "False"],
                correct_answer="True",
                explanation=f"Resource constraints and latency requirements make trade-off analysis fundamental in {topic}.",
                points=1.0,
            ),
            QuizQuestion(
                id=3,
                question=f"Which core principle is most critical when architecting systems for {topic}?",
                question_type="multiple_choice",
                options=[
                    "Modularity, clarity, and bounded error isolation",
                    "Monolithic coupling with zero automated tests",
                    "Unbounded memory allocation without validation",
                    "Ignoring edge cases and concurrency locks",
                ],
                correct_answer="Modularity, clarity, and bounded error isolation",
                explanation="Modularity and fault isolation ensure maintainability and robustness under scaling conditions.",
                points=1.0,
            ),
            QuizQuestion(
                id=4,
                question=f"Explain briefly why iterative testing is essential in {topic}.",
                question_type="short_answer",
                options=[],
                correct_answer=f"Iterative testing validates correctness, catches regression defects early, and ensures robustness in {topic}.",
                explanation=f"Systematic validation confirms that {topic} solutions behave deterministically across boundary conditions.",
                points=1.0,
            ),
            QuizQuestion(
                id=5,
                question=f"Is deterministic behavior a desirable property in algorithmic implementations of {topic}?",
                question_type="true_false",
                options=["True", "False"],
                correct_answer="True",
                explanation="Determinism guarantees repeatable, verifiable execution for identical inputs.",
                points=1.0,
            ),
        ]
        return base_pool[:count]


quiz_service = QuizService()
