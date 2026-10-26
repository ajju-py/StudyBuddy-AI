"""
StudyBuddy AI - SQLAlchemy Database Models
Persistent entities for documents, chunks, chat, quizzes, flashcards, study plans, and activity logs.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Float,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from app.database.database import Base


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    page_count = Column(Integer, default=1)
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("DocumentChunkModel", back_populates="document", cascade="all, delete-orphan")


class DocumentChunkModel(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, default=1)
    content = Column(Text, nullable=False)
    char_count = Column(Integer, default=0)

    document = relationship("DocumentModel", back_populates="chunks")


class ChatSessionModel(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), default="New Study Session")
    study_mode = Column(String(50), default="explain_simply")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessageModel", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessageModel.created_at")


class ChatMessageModel(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system, tool
    content = Column(Text, nullable=False)
    study_mode = Column(String(50), default="explain_simply")
    tool_calls_json = Column(JSON, nullable=True)
    citations_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSessionModel", back_populates="messages")


class QuizModel(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="Medium")
    question_count = Column(Integer, default=5)
    questions_json = Column(JSON, nullable=False)  # list of question objects
    source_document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("QuizAttemptModel", back_populates="quiz", cascade="all, delete-orphan")


class QuizAttemptModel(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    answers_json = Column(JSON, nullable=False)  # map of question_index: selected_answer
    feedback_json = Column(JSON, nullable=False)  # detailed results per question
    created_at = Column(DateTime, default=datetime.utcnow)

    quiz = relationship("QuizModel", back_populates="attempts")


class FlashcardDeckModel(Base):
    __tablename__ = "flashcard_decks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    card_count = Column(Integer, default=0)
    cards_json = Column(JSON, nullable=False)  # list of {id, front, back, hint}
    source_document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    progress_entries = relationship("FlashcardProgressModel", back_populates="deck", cascade="all, delete-orphan")


class FlashcardProgressModel(Base):
    __tablename__ = "flashcard_progress"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("flashcard_decks.id", ondelete="CASCADE"), nullable=False, index=True)
    card_id = Column(String(64), nullable=False)
    status = Column(String(20), default="unseen")  # unseen, known, needs_revision
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    deck = relationship("FlashcardDeckModel", back_populates="progress_entries")


class StudyPlanModel(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    target_exam = Column(String(255), nullable=False)
    exam_date = Column(String(50), nullable=False)
    available_hours_per_day = Column(Float, default=2.0)
    subjects_json = Column(JSON, nullable=False)
    schedule_json = Column(JSON, nullable=False)  # structured schedule items with completion
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ActivityLogModel(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String(50), nullable=False, index=True)  # chat, quiz, flashcard, document, plan
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
