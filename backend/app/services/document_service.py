"""
StudyBuddy AI - Document Ingestion & Passage Retrieval Service
Extracts text from PDF, DOCX, TXT, and Markdown files, performs semantic chunking,
stores chunks in the database, and provides BM25/keyword-relevance passage retrieval.
"""

import os
import re
import uuid
import math
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
import pymupdf  # PyMuPDF
import docx

from app.config import settings
from app.database.models import DocumentModel, DocumentChunkModel
from app.models.schemas import CitationItem


class DocumentProcessingError(Exception):
    """Raised when document extraction or validation fails."""
    pass


class DocumentService:
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

    def __init__(self):
        self.upload_dir = Path(settings.storage_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(self, filename: str, content: bytes):
        """Validates file extension, non-empty content, and size limits."""
        ext = Path(filename).suffix.lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise DocumentProcessingError(
                f"Unsupported file format '{ext}'. Allowed formats: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )

        if not content or len(content) == 0:
            raise DocumentProcessingError("Uploaded file is empty (0 bytes).")

        max_bytes = settings.max_upload_size_mb * 1024 * 1024
        if len(content) > max_bytes:
            raise DocumentProcessingError(
                f"File size exceeds maximum allowed limit of {settings.max_upload_size_mb} MB."
            )

    def extract_text_from_pdf(self, file_path: Path) -> Tuple[List[Dict[str, Any]], int]:
        """
        Extracts text from PDF page by page using PyMuPDF.
        Returns list of {page_number, text} and total page count.
        """
        pages_content = []
        doc = pymupdf.open(str(file_path))
        page_count = len(doc)
        total_extracted_chars = 0

        for page_idx in range(page_count):
            page = doc[page_idx]
            page_text = page.get_text()
            if page_text and page_text.strip():
                clean_text = self._clean_text(page_text)
                pages_content.append({
                    "page_number": page_idx + 1,
                    "text": clean_text
                })
                total_extracted_chars += len(clean_text)

        doc.close()

        if total_extracted_chars == 0:
            raise DocumentProcessingError(
                "No selectable text found in PDF. This document may be an image-only scan which requires OCR."
            )

        return pages_content, page_count

    def extract_text_from_docx(self, file_path: Path) -> Tuple[List[Dict[str, Any]], int]:
        """Extracts text from Word DOCX document."""
        doc = docx.Document(str(file_path))
        paragraphs = [p.text for p in doc.paragraphs if p.text and p.text.strip()]
        full_text = "\n\n".join(paragraphs)

        if not full_text.strip():
            raise DocumentProcessingError("DOCX file contains no readable text content.")

        clean_text = self._clean_text(full_text)
        # Approximate pages based on character length (~2000 chars per standard page)
        pages = self._split_into_pseudo_pages(clean_text, page_size=2000)
        return pages, len(pages)

    def extract_text_from_plain(self, content_str: str) -> Tuple[List[Dict[str, Any]], int]:
        """Extracts text from TXT or Markdown file."""
        if not content_str.strip():
            raise DocumentProcessingError("Text file is empty.")

        clean_text = self._clean_text(content_str)
        pages = self._split_into_pseudo_pages(clean_text, page_size=2000)
        return pages, len(pages)

    def _split_into_pseudo_pages(self, text: str, page_size: int = 2000) -> List[Dict[str, Any]]:
        pages = []
        for i in range(0, len(text), page_size):
            chunk = text[i:i + page_size]
            pages.append({
                "page_number": (i // page_size) + 1,
                "text": chunk
            })
        return pages

    def _clean_text(self, text: str) -> str:
        """Normalizes whitespace and removes control characters."""
        # Replace non-standard whitespace
        text = re.sub(r'[\r\t\f\v]', ' ', text)
        # Collapse multi spaces
        text = re.sub(r' +', ' ', text)
        # Normalize double newlines
        text = re.sub(r'\n\s*\n', '\n\n', text)
        return text.strip()

    def chunk_document_pages(
        self,
        pages_content: List[Dict[str, Any]],
        chunk_size: int = 800,
        chunk_overlap: int = 150
    ) -> List[Dict[str, Any]]:
        """
        Creates semantic chunks with overlap while preserving page number references.
        """
        all_chunks = []
        chunk_idx = 0

        for page in pages_content:
            page_num = page["page_number"]
            page_text = page["text"]

            # Split into paragraphs or sentences
            paragraphs = page_text.split("\n\n")
            current_chunk = ""

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue

                if len(current_chunk) + len(para) <= chunk_size:
                    current_chunk += ("\n\n" + para if current_chunk else para)
                else:
                    if current_chunk:
                        all_chunks.append({
                            "chunk_index": chunk_idx,
                            "page_number": page_num,
                            "content": current_chunk,
                            "char_count": len(current_chunk),
                        })
                        chunk_idx += 1

                    # Handle case where a single paragraph is longer than chunk_size
                    if len(para) > chunk_size:
                        start = 0
                        while start < len(para):
                            slice_text = para[start:start + chunk_size]
                            all_chunks.append({
                                "chunk_index": chunk_idx,
                                "page_number": page_num,
                                "content": slice_text,
                                "char_count": len(slice_text),
                            })
                            chunk_idx += 1
                            start += (chunk_size - chunk_overlap)
                        current_chunk = ""
                    else:
                        current_chunk = para

            if current_chunk:
                all_chunks.append({
                    "chunk_index": chunk_idx,
                    "page_number": page_num,
                    "content": current_chunk,
                    "char_count": len(current_chunk),
                })
                chunk_idx += 1

        return all_chunks

    def ingest_document(
        self,
        db: Session,
        filename: str,
        content: bytes,
    ) -> DocumentModel:
        """
        Validates, saves, extracts, chunks, and persists a document into the database.
        """
        self.validate_file(filename, content)

        ext = Path(filename).suffix.lower()
        unique_name = f"{uuid.uuid4().hex[:12]}_{re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)}"
        saved_path = self.upload_dir / unique_name

        with open(saved_path, "wb") as f:
            f.write(content)

        try:
            if ext == ".pdf":
                pages, page_count = self.extract_text_from_pdf(saved_path)
            elif ext == ".docx":
                pages, page_count = self.extract_text_from_docx(saved_path)
            else:
                # Text or Markdown
                decoded = content.decode("utf-8", errors="replace")
                pages, page_count = self.extract_text_from_plain(decoded)

            chunks_data = self.chunk_document_pages(pages)

            # Create document record
            doc_record = DocumentModel(
                filename=unique_name,
                original_name=filename,
                file_type=ext.replace(".", "").upper(),
                file_size=len(content),
                page_count=page_count,
                chunk_count=len(chunks_data),
            )
            db.add(doc_record)
            db.flush()  # get doc_record.id

            # Create chunk records
            for chunk in chunks_data:
                chunk_record = DocumentChunkModel(
                    document_id=doc_record.id,
                    chunk_index=chunk["chunk_index"],
                    page_number=chunk["page_number"],
                    content=chunk["content"],
                    char_count=chunk["char_count"],
                )
                db.add(chunk_record)

            db.commit()
            db.refresh(doc_record)
            return doc_record

        except Exception as e:
            # Clean up saved file if ingestion failed
            if saved_path.exists():
                saved_path.unlink()
            db.rollback()
            raise e

    def delete_document(self, db: Session, document_id: int) -> bool:
        """Deletes a document from the database and removes its disk file."""
        doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
        if not doc:
            return False

        file_path = self.upload_dir / doc.filename
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass

        db.delete(doc)
        db.commit()
        return True

    def retrieve_relevant_passages(
        self,
        db: Session,
        query: str,
        top_k: int = 4,
        document_id: Optional[int] = None,
    ) -> List[CitationItem]:
        """
        Retrieves top relevant passages using BM25-inspired term frequency scoring.
        Prioritizes high semantic overlap with page and document citations.
        """
        # Tokenize query
        query_terms = [t.lower() for t in re.findall(r'\b\w{3,}\b', query)]
        if not query_terms:
            return []

        # Query chunks
        chunk_query = db.query(DocumentChunkModel, DocumentModel.original_name)\
            .join(DocumentModel, DocumentChunkModel.document_id == DocumentModel.id)

        if document_id is not None:
            chunk_query = chunk_query.filter(DocumentChunkModel.document_id == document_id)

        candidate_chunks = chunk_query.all()
        if not candidate_chunks:
            return []

        scored_results: List[Tuple[float, DocumentChunkModel, str]] = []

        for chunk, doc_name in candidate_chunks:
            content_lower = chunk.content.lower()
            score = 0.0

            # Match exact terms with term frequency dampening
            for term in query_terms:
                count = content_lower.count(term)
                if count > 0:
                    # BM25-like sublinear term frequency
                    tf = math.log1p(count)
                    # Length normalization
                    len_norm = 1.0 + (chunk.char_count / 1000.0)
                    score += (tf / len_norm) * 2.0

            # Bonus for exact multi-word phrase matching
            if len(query_terms) > 1 and " ".join(query_terms) in content_lower:
                score += 5.0

            if score > 0.05:
                scored_results.append((score, chunk, doc_name))

        # Sort descending by score
        scored_results.sort(key=lambda x: x[0], reverse=True)
        top_results = scored_results[:top_k]

        citations: List[CitationItem] = []
        for score, chunk, doc_name in top_results:
            # Create a clean snippet
            snippet = chunk.content
            if len(snippet) > 300:
                snippet = snippet[:300].rsplit(" ", 1)[0] + "..."

            citations.append(
                CitationItem(
                    document_id=chunk.document_id,
                    document_name=doc_name,
                    page_number=chunk.page_number,
                    chunk_index=chunk.chunk_index,
                    snippet=snippet,
                    relevance_score=round(float(score), 3),
                )
            )

        return citations


document_service = DocumentService()
