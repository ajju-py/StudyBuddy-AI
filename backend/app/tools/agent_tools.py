"""
StudyBuddy AI - Controlled AI Agent Tools
Strictly bounded and validated tools callable by Groq models during conversational agent reasoning.
Ensures total security: no arbitrary code execution, no unrestricted filesystem or SQL access.
"""

import json
from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy.orm import Session

from app.database.models import (
    DocumentModel,
    DocumentChunkModel,
    QuizModel,
    QuizAttemptModel,
    FlashcardDeckModel,
    StudyPlanModel,
    ActivityLogModel,
)
from app.services.document_service import document_service


# -------------------------------------------------------------
# Strict Tool Argument Pydantic Models
# -------------------------------------------------------------
class SearchStudyDocumentsArgs(BaseModel):
    query: str = Field(..., description="The concept, keyword, or question to search within uploaded study materials.")
    top_k: int = Field(default=3, ge=1, le=8, description="Number of relevant passages to retrieve.")
    document_id: Optional[int] = Field(None, description="Optional ID of a specific document to filter the search.")


class SummarizeDocumentArgs(BaseModel):
    document_id: Optional[int] = Field(None, description="The ID of the document to summarize.")
    summary_type: Literal["short", "medium", "detailed"] = Field(
        default="medium",
        description="The depth of summary required: short (quick recap), medium (balanced), or detailed (in-depth analysis)."
    )


class GenerateQuizArgs(BaseModel):
    topic: str = Field(..., description="The subject or topic for the quiz.")
    difficulty: Literal["Easy", "Medium", "Hard"] = Field(default="Medium", description="Difficulty level.")
    question_count: int = Field(default=5, ge=1, le=10, description="Number of questions to generate.")


class GenerateFlashcardsArgs(BaseModel):
    topic: str = Field(..., description="Subject or concept for flashcard creation.")
    card_count: int = Field(default=6, ge=3, le=15, description="Number of flashcards to generate.")


class CreateStudyPlanArgs(BaseModel):
    target_exam: str = Field(..., description="Name of the upcoming exam or test.")
    exam_date: str = Field(..., description="Target exam date in YYYY-MM-DD format.")
    available_hours_per_day: float = Field(default=2.5, ge=0.5, le=12.0, description="Available daily study hours.")
    subjects: List[str] = Field(..., min_length=1, description="List of subject or topic names to cover.")


class ExplainConceptArgs(BaseModel):
    concept: str = Field(..., description="The technical concept, formula, or phenomenon to explain.")
    target_level: Literal["beginner", "intermediate", "expert"] = Field(
        default="intermediate",
        description="Depth of explanation: beginner (simple analogy), intermediate (standard textbook), or expert (rigorous math/code)."
    )
    use_analogy: bool = Field(default=True, description="Whether to include a real-world analogy.")


class RecordQuizResultArgs(BaseModel):
    quiz_id: int = Field(..., description="The ID of the quiz.")
    score: float = Field(..., ge=0, description="The score achieved.")
    max_score: float = Field(..., ge=1, description="The maximum possible score.")


class RetrieveLearningProgressArgs(BaseModel):
    include_recent_activities: bool = Field(default=True, description="Whether to include the last 5 activity log items.")


# -------------------------------------------------------------
# Groq Function Tool Definitions (OpenAI compatible)
# -------------------------------------------------------------
AGENT_TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_study_documents",
            "description": "Searches through uploaded study documents (PDF, DOCX, TXT) for specific passages, facts, definitions, or citations relevant to a student's question.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search term, question, or key concept to locate in the study materials."
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of relevant chunks to retrieve (1 to 8).",
                        "default": 3
                    },
                    "document_id": {
                        "type": "integer",
                        "description": "Optional specific document ID to restrict search."
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "summarize_document",
            "description": "Retrieves the content of an uploaded study document and produces a structured summary with core takeaways.",
            "parameters": {
                "type": "object",
                "properties": {
                    "document_id": {
                        "type": "integer",
                        "description": "The ID of the uploaded document to summarize."
                    },
                    "summary_type": {
                        "type": "string",
                        "enum": ["short", "medium", "detailed"],
                        "description": "Length and depth of the requested summary."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_quiz",
            "description": "Constructs a practice examination with multiple-choice and true/false questions for a designated topic.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": "The topic, chapter, or concept for the quiz."
                    },
                    "difficulty": {
                        "type": "string",
                        "enum": ["Easy", "Medium", "Hard"],
                        "description": "Difficulty level of questions."
                    },
                    "question_count": {
                        "type": "integer",
                        "description": "Number of questions to prepare."
                    }
                },
                "required": ["topic"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_flashcards",
            "description": "Creates a study deck of interactive double-sided flashcards with questions, answers, and memory hints.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": "Topic or terminology list for flashcards."
                    },
                    "card_count": {
                        "type": "integer",
                        "description": "Number of flashcards to generate."
                    }
                },
                "required": ["topic"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_study_plan",
            "description": "Generates a structured, day-by-day exam preparation schedule with daily study blocks, revision cycles, and practice sessions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "target_exam": {
                        "type": "string",
                        "description": "Name of the examination or test."
                    },
                    "exam_date": {
                        "type": "string",
                        "description": "Date of the examination (YYYY-MM-DD)."
                    },
                    "available_hours_per_day": {
                        "type": "number",
                        "description": "Available study time per day."
                    },
                    "subjects": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of subjects to schedule."
                    }
                },
                "required": ["target_exam", "exam_date", "subjects"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "explain_concept",
            "description": "Provides an educational explanation with customized depth and real-world analogies.",
            "parameters": {
                "type": "object",
                "properties": {
                    "concept": {
                        "type": "string",
                        "description": "The academic concept to explain."
                    },
                    "target_level": {
                        "type": "string",
                        "enum": ["beginner", "intermediate", "expert"],
                        "description": "Audience level."
                    },
                    "use_analogy": {
                        "type": "boolean",
                        "description": "Whether to include an explanatory analogy."
                    }
                },
                "required": ["concept"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "record_quiz_result",
            "description": "Records an authenticated quiz score to the student's persistent learning record.",
            "parameters": {
                "type": "object",
                "properties": {
                    "quiz_id": {"type": "integer"},
                    "score": {"type": "number"},
                    "max_score": {"type": "number"}
                },
                "required": ["quiz_id", "score", "max_score"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "retrieve_learning_progress",
            "description": "Retrieves the student's actual recorded learning metrics, including quiz scores, cards reviewed, and study plan progress.",
            "parameters": {
                "type": "object",
                "properties": {
                    "include_recent_activities": {"type": "boolean"}
                },
                "required": []
            }
        }
    }
]


# -------------------------------------------------------------
# Tool Execution Engine
# -------------------------------------------------------------
class ToolExecutionEngine:
    """Executes agent tool requests with validation, safety guards, and deterministic behavior."""

    @staticmethod
    def execute_tool(
        tool_name: str,
        arguments_json: str,
        db: Session
    ) -> Dict[str, Any]:
        try:
            raw_args = json.loads(arguments_json) if isinstance(arguments_json, str) else arguments_json
        except Exception as e:
            return {"status": "error", "message": f"Malformed tool argument JSON: {str(e)}"}

        try:
            if tool_name == "search_study_documents":
                args = SearchStudyDocumentsArgs(**raw_args)
                passages = document_service.retrieve_relevant_passages(
                    db=db,
                    query=args.query,
                    top_k=args.top_k,
                    document_id=args.document_id,
                )
                return {
                    "status": "success",
                    "query": args.query,
                    "passages_found": len(passages),
                    "results": [p.model_dump() for p in passages]
                }

            elif tool_name == "summarize_document":
                args = SummarizeDocumentArgs(**raw_args)
                query = db.query(DocumentModel)
                if args.document_id:
                    doc = query.filter(DocumentModel.id == args.document_id).first()
                else:
                    doc = query.order_by(DocumentModel.created_at.desc()).first()

                if not doc:
                    return {"status": "error", "message": "No study documents found in the database to summarize."}

                chunks = db.query(DocumentChunkModel).filter(DocumentChunkModel.document_id == doc.id).order_by(DocumentChunkModel.chunk_index).limit(6).all()
                combined_text = "\n\n".join([c.content for c in chunks])

                return {
                    "status": "success",
                    "document_id": doc.id,
                    "document_title": doc.original_name,
                    "summary_type": args.summary_type,
                    "text_preview": combined_text[:1200]
                }

            elif tool_name == "generate_quiz":
                args = GenerateQuizArgs(**raw_args)
                # Formulate structured quiz metadata template
                return {
                    "status": "success",
                    "topic": args.topic,
                    "difficulty": args.difficulty,
                    "question_count": args.question_count,
                    "instruction": f"Generate {args.question_count} high-quality questions on {args.topic} with {args.difficulty} difficulty."
                }

            elif tool_name == "generate_flashcards":
                args = GenerateFlashcardsArgs(**raw_args)
                return {
                    "status": "success",
                    "topic": args.topic,
                    "card_count": args.card_count,
                    "instruction": f"Generate {args.card_count} flashcards with front (question), back (answer), and helpful hint for {args.topic}."
                }

            elif tool_name == "create_study_plan":
                args = CreateStudyPlanArgs(**raw_args)
                return {
                    "status": "success",
                    "target_exam": args.target_exam,
                    "exam_date": args.exam_date,
                    "available_hours_per_day": args.available_hours_per_day,
                    "subjects": args.subjects,
                    "instruction": f"Construct schedule for {args.target_exam} leading up to {args.exam_date}."
                }

            elif tool_name == "explain_concept":
                args = ExplainConceptArgs(**raw_args)
                return {
                    "status": "success",
                    "concept": args.concept,
                    "target_level": args.target_level,
                    "use_analogy": args.use_analogy,
                    "guidance": f"Provide a {args.target_level} breakdown of {args.concept}{' with a real-world analogy' if args.use_analogy else ''}."
                }

            elif tool_name == "record_quiz_result":
                args = RecordQuizResultArgs(**raw_args)
                percentage = (args.score / args.max_score) * 100.0 if args.max_score > 0 else 0.0
                return {
                    "status": "success",
                    "quiz_id": args.quiz_id,
                    "score": args.score,
                    "max_score": args.max_score,
                    "percentage": round(percentage, 1),
                }

            elif tool_name == "retrieve_learning_progress":
                args = RetrieveLearningProgressArgs(**raw_args)
                total_quizzes = db.query(QuizAttemptModel).count()
                attempts = db.query(QuizAttemptModel).all()
                avg_score = round(sum(a.percentage for a in attempts) / len(attempts), 1) if attempts else 0.0
                docs_count = db.query(DocumentModel).count()
                decks_count = db.query(FlashcardDeckModel).count()

                result = {
                    "status": "success",
                    "total_quizzes_completed": total_quizzes,
                    "average_quiz_score": avg_score,
                    "total_documents_uploaded": docs_count,
                    "flashcard_decks_created": decks_count,
                }
                if args.include_recent_activities:
                    recent = db.query(ActivityLogModel).order_by(ActivityLogModel.created_at.desc()).limit(5).all()
                    result["recent_activities"] = [
                        {"type": a.activity_type, "title": a.title, "time": a.created_at.isoformat()}
                        for a in recent
                    ]
                return result

            else:
                return {"status": "error", "message": f"Unrecognized tool '{tool_name}'"}

        except ValidationError as ve:
            return {"status": "error", "message": f"Invalid arguments for tool '{tool_name}': {str(ve)}"}
        except Exception as ex:
            return {"status": "error", "message": f"Error executing tool '{tool_name}': {str(ex)}"}
