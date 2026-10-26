"""
StudyBuddy AI - Flashcard Endpoints
Deck generation, deck retrieval with mastery states, and status updates.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import FlashcardDeckModel
from app.services.flashcard_service import flashcard_service
from app.models.schemas import (
    FlashcardDeckGenerateRequest,
    FlashcardDeckResponse,
    FlashcardStatusUpdateRequest,
)

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])


@router.post("/generate", response_model=FlashcardDeckResponse)
def generate_deck(req: FlashcardDeckGenerateRequest, db: Session = Depends(get_db)):
    """Generates an interactive flashcard deck."""
    try:
        return flashcard_service.generate_deck(db, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcard deck: {str(e)}")


@router.get("/decks", response_model=List[dict])
def list_decks(db: Session = Depends(get_db)):
    """Lists saved flashcard decks."""
    decks = db.query(FlashcardDeckModel).order_by(FlashcardDeckModel.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "topic": d.topic,
            "card_count": d.card_count,
            "created_at": d.created_at,
        }
        for d in decks
    ]


@router.get("/decks/{deck_id}", response_model=FlashcardDeckResponse)
def get_deck(deck_id: int, db: Session = Depends(get_db)):
    """Fetches a specific flashcard deck with user progress status."""
    try:
        return flashcard_service.get_deck_with_progress(db, deck_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/status")
def update_card_status(req: FlashcardStatusUpdateRequest, db: Session = Depends(get_db)):
    """Updates a card's mastery status ('unseen', 'known', 'needs_revision')."""
    try:
        return flashcard_service.update_card_status(db, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
