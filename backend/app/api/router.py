"""
StudyBuddy AI - Main API Router
Aggregates and mounts all modular sub-routers under /api.
"""

from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.summaries import router as summaries_router
from app.api.quizzes import router as quizzes_router
from app.api.flashcards import router as flashcards_router
from app.api.planner import router as planner_router
from app.api.analytics import router as analytics_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(chat_router)
api_router.include_router(documents_router)
api_router.include_router(summaries_router)
api_router.include_router(quizzes_router)
api_router.include_router(flashcards_router)
api_router.include_router(planner_router)
api_router.include_router(analytics_router)
