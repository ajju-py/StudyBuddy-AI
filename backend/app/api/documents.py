"""
StudyBuddy AI - Document Management Endpoints
Upload, list, delete, and semantic passage search across study materials.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import DocumentModel
from app.services.document_service import document_service, DocumentProcessingError
from app.models.schemas import (
    DocumentResponse,
    DocumentListResponse,
    DocumentSearchRequest,
    DocumentSearchResponse,
)

router = APIRouter(prefix="/documents", tags=["Document Management"])


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Ingests and chunks a PDF, DOCX, TXT, or MD study document."""
    try:
        content = await file.read()
        doc = document_service.ingest_document(
            db=db,
            filename=file.filename or "uploaded_document",
            content=content,
        )
        return DocumentResponse(
            id=doc.id,
            filename=doc.filename,
            original_name=doc.original_name,
            file_type=doc.file_type,
            file_size=doc.file_size,
            page_count=doc.page_count,
            chunk_count=doc.chunk_count,
            created_at=doc.created_at,
        )
    except DocumentProcessingError as dpe:
        raise HTTPException(status_code=400, detail=str(dpe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")


@router.get("", response_model=DocumentListResponse)
def list_documents(db: Session = Depends(get_db)):
    """Lists all uploaded documents with metadata."""
    docs = db.query(DocumentModel).order_by(DocumentModel.created_at.desc()).all()
    resp = [
        DocumentResponse(
            id=d.id,
            filename=d.filename,
            original_name=d.original_name,
            file_type=d.file_type,
            file_size=d.file_size,
            page_count=d.page_count,
            chunk_count=d.chunk_count,
            created_at=d.created_at,
        )
        for d in docs
    ]
    return DocumentListResponse(documents=resp, total_count=len(resp))


@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Deletes a document and its stored chunks."""
    success = document_service.delete_document(db, document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"status": "success", "message": f"Document {document_id} deleted."}


@router.post("/search", response_model=DocumentSearchResponse)
def search_passages(req: DocumentSearchRequest, db: Session = Depends(get_db)):
    """Searches for relevant passages matching a query."""
    passages = document_service.retrieve_relevant_passages(
        db=db,
        query=req.query,
        top_k=req.top_k,
        document_id=req.document_id,
    )
    return DocumentSearchResponse(query=req.query, results=passages)
