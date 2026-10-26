"""
StudyBuddy AI - Main Application Entrypoint
FastAPI application with configured CORS, database initialization, and modular routing.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.metadata import PROJECT_METADATA
from app.database.database import init_db
from app.api.router import api_router

# Configure secure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("studybuddy.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables
    logger.info("Initializing StudyBuddy AI database tables...")
    init_db()
    logger.info("Database schema initialized successfully.")
    
    # Report Groq status safely
    if settings.is_groq_configured():
        logger.info("Groq API initialized with model: %s (Key: %s)", settings.groq_model, settings.get_masked_groq_key())
    else:
        logger.warning("Groq API key not configured. Running in local fallback demonstration mode.")

    yield
    logger.info("StudyBuddy AI backend shutting down cleanly.")


app = FastAPI(
    title=PROJECT_METADATA["full_title"],
    description=(
        f"{PROJECT_METADATA['tagline']}\n\n"
        f"**Category:** {PROJECT_METADATA['category']}\n"
        f"**Authors:** {PROJECT_METADATA['authors'][0]['name']} & {PROJECT_METADATA['authors'][1]['name']}\n"
        f"**Institution:** {PROJECT_METADATA['institution']['name']}, {PROJECT_METADATA['institution']['city']}"
    ),
    version=PROJECT_METADATA["version"],
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "project": PROJECT_METADATA["full_title"],
        "tagline": PROJECT_METADATA["tagline"],
        "version": PROJECT_METADATA["version"],
        "docs_url": "/docs",
        "api_health": "/api/health",
        "credits": {
            "developers": [a["name"] for a in PROJECT_METADATA["authors"]],
            "institution": PROJECT_METADATA["institution"]["name"],
            "academic_year": PROJECT_METADATA["academic_year"],
        },
    }
