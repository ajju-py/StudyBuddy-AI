"""
StudyBuddy AI - Pydantic Request & Response Schemas
Type-safe API contracts for all endpoints and tool calling schemas.
"""

from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Common & Health Schemas
# -------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    app_name: str
    groq_configured: bool
    masked_key: str
    active_model: str
    supported_models: List[str]


class MetadataAuthor(BaseModel):
    name: str
    role: str
    qualification: str


class MetadataInstitution(BaseModel):
    name: str
    city: str
    state: str
    country: str
    department: str


class StudyModeInfo(BaseModel):
    id: str
    name: str
    description: str
    icon: str


class ProjectMetadataResponse(BaseModel):
    project_name: str
    full_title: str
    tagline: str
    category: str
    version: str
    academic_year: str
    authors: List[MetadataAuthor]
    institution: MetadataInstitution
    supported_study_modes: List[StudyModeInfo]


# -------------------------------------------------------------
# Document & Retrieval Schemas
# -------------------------------------------------------------
class DocumentChunkInfo(BaseModel):
    id: int
    chunk_index: int
    page_number: int
    content: str
    char_count: int


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    file_type: str
    file_size: int
    page_count: int
    chunk_count: int
    created_at: datetime


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total_count: int


class CitationItem(BaseModel):
    document_id: int
    document_name: str
    page_number: int
    chunk_index: int
    snippet: str
    relevance_score: float


class DocumentSearchRequest(BaseModel):
    query: str
    top_k: int = Field(default=4, ge=1, le=10)
    document_id: Optional[int] = None


class DocumentSearchResponse(BaseModel):
    query: str
    results: List[CitationItem]


# -------------------------------------------------------------
# AI Chat & Agent Schemas
# -------------------------------------------------------------
class ToolInvocationRecord(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any
    status: str = "success"


class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    study_mode: Literal[
        "explain_simply",
        "exam_prep",
        "deep_dive",
        "socratic_tutor",
        "quick_revision",
    ] = "explain_simply"
    use_agent_tools: bool = True
    document_id: Optional[int] = None


class ChatMessageResponse(BaseModel):
    session_id: str
    response: str
    study_mode: str
    tool_invocations: List[ToolInvocationRecord] = []
    citations: List[CitationItem] = []
    created_at: datetime


class ChatHistoryItem(BaseModel):
    id: int
    role: str
    content: str
    study_mode: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    citations: Optional[List[Dict[str, Any]]] = None
    created_at: datetime


class ChatSessionResponse(BaseModel):
    session_id: str
    title: str
    study_mode: str
    messages: List[ChatHistoryItem]
    created_at: datetime


# -------------------------------------------------------------
# Summarizer Schemas
# -------------------------------------------------------------
class SummarizeRequest(BaseModel):
    document_id: Optional[int] = None
    text: Optional[str] = None
    summary_type: Literal["short", "medium", "detailed", "revision_notes"] = "medium"
    extract_key_concepts: bool = True
    extract_definitions: bool = True
    generate_questions: bool = True


class KeyConcept(BaseModel):
    concept: str
    explanation: str


class DefinitionItem(BaseModel):
    term: str
    definition: str


class SummarizeResponse(BaseModel):
    summary: str
    summary_type: str
    key_concepts: List[KeyConcept] = []
    definitions: List[DefinitionItem] = []
    revision_notes: List[str] = []
    potential_questions: List[str] = []
    source_title: str


# -------------------------------------------------------------
# Quiz Schemas
# -------------------------------------------------------------
class QuizQuestion(BaseModel):
    id: int
    question: str
    question_type: Literal["multiple_choice", "true_false", "short_answer"] = "multiple_choice"
    options: List[str] = []
    correct_answer: str
    explanation: str
    points: float = 1.0


class QuizGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=2)
    document_id: Optional[int] = None
    difficulty: Literal["Easy", "Medium", "Hard"] = "Medium"
    question_count: int = Field(default=5, ge=1, le=15)
    question_types: List[str] = ["multiple_choice", "true_false"]


class QuizItemClient(BaseModel):
    """Client-facing question with correct_answer stripped for integrity before submission."""
    id: int
    question: str
    question_type: str
    options: List[str] = []
    points: float = 1.0


class QuizResponse(BaseModel):
    id: int
    title: str
    topic: str
    difficulty: str
    question_count: int
    questions: List[QuizItemClient]
    created_at: datetime


class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: Dict[str, str]  # question_id -> user_answer


class QuestionFeedback(BaseModel):
    question_id: int
    question: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str
    points_awarded: float


class QuizAttemptResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    quiz_title: str
    score: float
    max_score: float
    percentage: float
    passed: bool
    feedback: List[QuestionFeedback]
    completed_at: datetime


class QuizHistoryItem(BaseModel):
    attempt_id: int
    quiz_id: int
    quiz_title: str
    topic: str
    difficulty: str
    score: float
    max_score: float
    percentage: float
    completed_at: datetime


# -------------------------------------------------------------
# Flashcard Schemas
# -------------------------------------------------------------
class FlashcardItem(BaseModel):
    id: str
    front: str
    back: str
    hint: Optional[str] = None
    tags: List[str] = []


class FlashcardDeckGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=2)
    document_id: Optional[int] = None
    card_count: int = Field(default=8, ge=3, le=25)


class FlashcardCardWithStatus(BaseModel):
    id: str
    front: str
    back: str
    hint: Optional[str] = None
    tags: List[str] = []
    status: Literal["unseen", "known", "needs_revision"] = "unseen"


class FlashcardDeckResponse(BaseModel):
    id: int
    title: str
    topic: str
    card_count: int
    cards: List[FlashcardCardWithStatus]
    known_count: int = 0
    revision_count: int = 0
    created_at: datetime


class FlashcardStatusUpdateRequest(BaseModel):
    deck_id: int
    card_id: str
    status: Literal["unseen", "known", "needs_revision"]


# -------------------------------------------------------------
# Study Planner Schemas
# -------------------------------------------------------------
class StudySubjectInput(BaseModel):
    name: str
    priority: Literal["High", "Medium", "Low"] = "Medium"
    difficulty: Literal["Easy", "Medium", "Hard"] = "Medium"
    estimated_hours: float = 10.0


class StudyPlanGenerateRequest(BaseModel):
    target_exam: str = Field(..., min_length=2)
    exam_date: str = Field(..., description="YYYY-MM-DD")
    available_hours_per_day: float = Field(default=2.5, ge=0.5, le=12.0)
    subjects: List[StudySubjectInput] = Field(..., min_length=1)


class StudySessionBlock(BaseModel):
    id: str
    day_number: int
    date_label: str
    subject: str
    topic: str
    duration_minutes: int
    activity_type: Literal["learning", "revision", "practice_quiz", "break"]
    completed: bool = False


class StudyPlanResponse(BaseModel):
    id: int
    title: str
    target_exam: str
    exam_date: str
    available_hours_per_day: float
    subjects: List[StudySubjectInput]
    schedule: List[StudySessionBlock]
    completion_percentage: float = 0.0
    created_at: datetime


class StudyBlockToggleRequest(BaseModel):
    plan_id: int
    block_id: str
    completed: bool


# -------------------------------------------------------------
# Progress Analytics Schemas
# -------------------------------------------------------------
class RecentActivityItem(BaseModel):
    id: int
    activity_type: str
    title: str
    description: Optional[str] = None
    created_at: datetime


class ProgressAnalyticsResponse(BaseModel):
    total_questions_answered: int
    total_quizzes_completed: int
    actual_average_quiz_score: float
    total_flashcards_reviewed: int
    known_flashcards_count: int
    revision_flashcards_count: int
    total_documents_uploaded: int
    total_study_plans_active: int
    study_plan_completion_rate: float
    recent_quiz_scores: List[Dict[str, Any]]
    recent_activities: List[RecentActivityItem]
