"""
StudyBuddy AI - Chat & Agent API Endpoints
Handles interactive study sessions, study-mode dispatch, and conversation persistence.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import ChatSessionModel, ChatMessageModel
from app.services.agent_service import agent_service
from app.models.schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSessionResponse,
    ChatHistoryItem,
)

router = APIRouter(prefix="/chat", tags=["AI Study Assistant"])


@router.post("", response_model=ChatMessageResponse)
def post_chat_message(
    req: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """Processes a user prompt through the autonomous study agent."""
    try:
        response = agent_service.run_agent_loop(
            db=db,
            user_message=req.message,
            session_id=req.session_id,
            study_mode=req.study_mode,
            use_agent_tools=req.use_agent_tools,
            document_id=req.document_id,
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions", response_model=List[dict])
def list_chat_sessions(db: Session = Depends(get_db)):
    """Lists recent conversation sessions."""
    sessions = (
        db.query(ChatSessionModel)
        .order_by(ChatSessionModel.updated_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "session_id": s.id,
            "title": s.title,
            "study_mode": s.study_mode,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    """Retrieves full conversation messages for a specific session."""
    session = db.query(ChatSessionModel).filter(ChatSessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

    history_items = [
        ChatHistoryItem(
            id=m.id,
            role=m.role,
            content=m.content,
            study_mode=m.study_mode,
            tool_calls=m.tool_calls_json,
            citations=m.citations_json,
            created_at=m.created_at,
        )
        for m in session.messages
    ]

    return ChatSessionResponse(
        session_id=session.id,
        title=session.title,
        study_mode=session.study_mode,
        messages=history_items,
        created_at=session.created_at,
    )


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Deletes a conversation session and all its messages."""
    session = db.query(ChatSessionModel).filter(ChatSessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    db.delete(session)
    db.commit()
    return {"status": "success", "message": f"Session '{session_id}' deleted."}
