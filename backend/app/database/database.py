"""
StudyBuddy AI - Database Connection & Session Management
Provides SQLAlchemy engine, session maker, and schema initialization.
Designed for SQLite locally with smooth path to PostgreSQL.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

# Configure SQLite engine with check_same_thread=False for FastAPI concurrency
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=False,
    future=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    """FastAPI dependency for obtaining a database session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes all database tables declared in models."""
    from app.database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
