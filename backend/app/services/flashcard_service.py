"""
StudyBuddy AI - Flashcard Generation & Spaced Repetition Service
Generates interactive double-sided flashcards with hints, tracks card mastery,
and enables focused revision of challenging concepts.
"""

import json
import uuid
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.services.groq_service import groq_service
from app.services.document_service import document_service
from app.database.models import (
    FlashcardDeckModel,
    FlashcardProgressModel,
    DocumentModel,
    ActivityLogModel,
)
from app.models.schemas import (
    FlashcardItem,
    FlashcardDeckGenerateRequest,
    FlashcardDeckResponse,
    FlashcardCardWithStatus,
    FlashcardStatusUpdateRequest,
)

logger = logging.getLogger("studybuddy.flashcard")


class FlashcardService:
    def generate_deck(self, db: Session, req: FlashcardDeckGenerateRequest) -> FlashcardDeckResponse:
        """
        Creates a flashcard deck on a topic or uploaded document using Groq or fallback.
        """
        context_text = ""
        if req.document_id:
            doc = db.query(DocumentModel).filter(DocumentModel.id == req.document_id).first()
            if doc:
                passages = document_service.retrieve_relevant_passages(
                    db=db,
                    query=req.topic,
                    top_k=4,
                    document_id=doc.id,
                )
                if passages:
                    context_text = "\n\n".join([p.snippet for p in passages])

        cards: List[FlashcardItem] = []

        if settings.is_groq_configured():
            context_prompt = f"Context:\n{context_text}\n" if context_text else ""
            prompt = (
                f"You are an expert tutor. Create exactly {req.card_count} high-yield study flashcards for '{req.topic}'.\n"
                f"{context_prompt}\n"
                "Each flashcard must have a concise prompt or concept on the FRONT, a clear, complete explanation on the BACK, "
                "and an intuitive memory HINT.\n\n"
                "Return ONLY a valid JSON array of objects with this schema:\n"
                "[\n"
                "  {\n"
                "    \"id\": \"card-1\",\n"
                "    \"front\": \"What is [Concept]?\",\n"
                "    \"back\": \"Precise definition and explanation.\",\n"
                "    \"hint\": \"Helpful mnemonic or keyword reminder.\",\n"
                "    \"tags\": [\"core\", \"formula\"]\n"
                "  }\n"
                "]\n"
                "Do not include markdown code block syntax or extraneous text outside the JSON array."
            )

            try:
                response = groq_service.create_chat_completion(
                    messages=[
                        {"role": "system", "content": "You are a flashcard generation assistant. Output strictly valid JSON arrays."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=2500,
                )
                raw_json = response.choices[0].message.content.strip()

                if raw_json.startswith("```json"):
                    raw_json = raw_json[7:]
                elif raw_json.startswith("```"):
                    raw_json = raw_json[3:]
                if raw_json.endswith("```"):
                    raw_json = raw_json[:-3]
                raw_json = raw_json.strip()

                parsed = json.loads(raw_json)
                if isinstance(parsed, list):
                    for idx, item in enumerate(parsed):
                        item["id"] = f"card-{idx + 1}"
                        card = FlashcardItem(**item)
                        cards.append(card)

            except Exception as e:
                logger.error("Error generating flashcards with Groq: %s", str(e))
                cards = self._get_fallback_flashcards(req.topic, req.card_count)
        else:
            cards = self._get_fallback_flashcards(req.topic, req.card_count)

        # Store deck
        deck = FlashcardDeckModel(
            title=f"{req.topic} Flashcard Deck",
            topic=req.topic,
            card_count=len(cards),
            cards_json=[c.model_dump() for c in cards],
            source_document_id=req.document_id,
        )
        db.add(deck)
        db.commit()
        db.refresh(deck)

        # Initialize progress for each card
        for card in cards:
            prog = FlashcardProgressModel(
                deck_id=deck.id,
                card_id=card.id,
                status="unseen",
            )
            db.add(prog)

        activity = ActivityLogModel(
            activity_type="flashcard",
            title=f"Created Flashcard Deck: {deck.title}",
            description=f"Generated {len(cards)} flashcards on {req.topic}",
            details_json={"deck_id": deck.id, "card_count": len(cards)},
        )
        db.add(activity)
        db.commit()

        cards_with_status = [
            FlashcardCardWithStatus(
                id=c.id,
                front=c.front,
                back=c.back,
                hint=c.hint,
                tags=c.tags,
                status="unseen",
            )
            for c in cards
        ]

        return FlashcardDeckResponse(
            id=deck.id,
            title=deck.title,
            topic=deck.topic,
            card_count=len(cards),
            cards=cards_with_status,
            known_count=0,
            revision_count=0,
            created_at=deck.created_at,
        )

    def get_deck_with_progress(self, db: Session, deck_id: int) -> FlashcardDeckResponse:
        """Retrieves a deck and overlays user's recorded mastery status."""
        deck = db.query(FlashcardDeckModel).filter(FlashcardDeckModel.id == deck_id).first()
        if not deck:
            raise ValueError(f"Flashcard deck {deck_id} not found.")

        progress_map: Dict[str, str] = {
            p.card_id: p.status for p in deck.progress_entries
        }

        cards_with_status = []
        known_count = 0
        revision_count = 0

        for raw_card in deck.cards_json:
            card_id = raw_card.get("id", "")
            st = progress_map.get(card_id, "unseen")
            if st == "known":
                known_count += 1
            elif st == "needs_revision":
                revision_count += 1

            cards_with_status.append(
                FlashcardCardWithStatus(
                    id=card_id,
                    front=raw_card.get("front", ""),
                    back=raw_card.get("back", ""),
                    hint=raw_card.get("hint"),
                    tags=raw_card.get("tags", []),
                    status=st,
                )
            )

        return FlashcardDeckResponse(
            id=deck.id,
            title=deck.title,
            topic=deck.topic,
            card_count=len(cards_with_status),
            cards=cards_with_status,
            known_count=known_count,
            revision_count=revision_count,
            created_at=deck.created_at,
        )

    def update_card_status(self, db: Session, req: FlashcardStatusUpdateRequest) -> Dict[str, Any]:
        """Updates the mastery status (unseen, known, needs_revision) for a card."""
        prog = (
            db.query(FlashcardProgressModel)
            .filter(
                FlashcardProgressModel.deck_id == req.deck_id,
                FlashcardProgressModel.card_id == req.card_id,
            )
            .first()
        )

        if not prog:
            prog = FlashcardProgressModel(
                deck_id=req.deck_id,
                card_id=req.card_id,
                status=req.status,
            )
            db.add(prog)
        else:
            prog.status = req.status

        db.commit()
        return {"status": "success", "deck_id": req.deck_id, "card_id": req.card_id, "new_status": req.status}

    def _get_fallback_flashcards(self, topic: str, count: int) -> List[FlashcardItem]:
        pool = [
            FlashcardItem(
                id="card-1",
                front=f"What is the foundational definition of {topic}?",
                back=f"{topic} encompasses the systematic concepts, architectures, and principles applied to understand and implement reliable solutions.",
                hint="Think of the overarching definition and role.",
                tags=["fundamentals", topic.lower()],
            ),
            FlashcardItem(
                id="card-2",
                front=f"What is the primary trade-off when optimizing {topic}?",
                back="Balancing performance, computational latency, and memory consumption against system complexity and maintainability.",
                hint="Speed vs. resource footprint vs. simplicity.",
                tags=["optimization", "trade-offs"],
            ),
            FlashcardItem(
                id="card-3",
                front=f"How does modular decomposition enhance {topic} implementations?",
                back="It isolates side-effects, allows independent component testing, and simplifies debugging under production loads.",
                hint="Separation of concerns.",
                tags=["architecture", "modularity"],
            ),
            FlashcardItem(
                id="card-4",
                front=f"What is a standard best practice for error handling in {topic}?",
                back="Using bounded retries, explicit exception hierarchies, and graceful fallbacks without silently failing or leaking secrets.",
                hint="Resilience and observability.",
                tags=["reliability", "security"],
            ),
            FlashcardItem(
                id="card-5",
                front=f"Why is deterministic evaluation important in {topic} testing?",
                back="It ensures repeatable outcomes across diverse environments, confirming that regressions can be caught and diagnosed reliably.",
                hint="Repeatability and verifiable tests.",
                tags=["testing", "verification"],
            ),
            FlashcardItem(
                id="card-6",
                front=f"What future direction is most promising for {topic}?",
                back="Integration with autonomous agentic architectures, real-time context streaming, and self-improving feedback loops.",
                hint="AI and automated reasoning.",
                tags=["trends", "future"],
            ),
        ]
        return pool[:count]


flashcard_service = FlashcardService()
