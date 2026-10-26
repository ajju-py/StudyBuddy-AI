"""
Tests for document ingestion, text extraction, validation, chunking, and passage retrieval.
"""

import pytest
import pymupdf
import docx
from pathlib import Path
from app.services.document_service import document_service, DocumentProcessingError
from app.database.models import DocumentModel, DocumentChunkModel


def test_validate_unsupported_extension():
    with pytest.raises(DocumentProcessingError, match="Unsupported file format"):
        document_service.validate_file("malicious.exe", b"binary content")


def test_validate_empty_file():
    with pytest.raises(DocumentProcessingError, match="Uploaded file is empty"):
        document_service.validate_file("empty.txt", b"")


def test_ingest_plain_text(db_session, tmp_path):
    text_content = (
        "Operating Systems Principles\n\n"
        "An operating system acts as an intermediary between the computer hardware and the user. "
        "The primary purpose of an operating system is to execute user programs and make solving problems easier.\n\n"
        "Process Management\n\n"
        "A process is a program in execution. A process needs resources like CPU time, memory, and files to accomplish its task."
    )
    doc = document_service.ingest_document(
        db=db_session,
        filename="os_notes.txt",
        content=text_content.encode("utf-8"),
    )
    assert doc.id is not None
    assert doc.original_name == "os_notes.txt"
    assert doc.chunk_count >= 1

    # Verify chunks
    chunks = db_session.query(DocumentChunkModel).filter(DocumentChunkModel.document_id == doc.id).all()
    assert len(chunks) == doc.chunk_count
    assert any("Operating Systems" in c.content for c in chunks)


def test_passage_retrieval(db_session):
    text_content = (
        "Neural Networks and Deep Learning\n\n"
        "Backpropagation is an algorithm used in machine learning for training feedforward artificial neural networks. "
        "It computes the gradient of the loss function with respect to the weights of the network.\n\n"
        "Convolutional Neural Networks (CNN)\n\n"
        "CNNs are specialized neural networks for processing grid-structured data such as images. "
        "They utilize convolution operations instead of general matrix multiplication."
    )
    doc = document_service.ingest_document(
        db=db_session,
        filename="deep_learning.md",
        content=text_content.encode("utf-8"),
    )

    # Search for backpropagation
    results = document_service.retrieve_relevant_passages(
        db=db_session,
        query="Explain backpropagation gradient descent",
        top_k=2,
    )
    assert len(results) > 0
    top = results[0]
    assert "Backpropagation" in top.snippet or "gradient" in top.snippet
    assert top.document_id == doc.id
    assert top.page_number >= 1


def test_ingest_pdf(db_session, tmp_path):
    # Create a small valid PDF in memory using PyMuPDF
    pdf_doc = pymupdf.open()
    page = pdf_doc.new_page()
    page.insert_text((50, 50), "Distributed Systems and Consensus Protocols.\nRaft and Paxos guarantee safety.")
    pdf_bytes = pdf_doc.tobytes()
    pdf_doc.close()

    doc = document_service.ingest_document(
        db=db_session,
        filename="distributed_systems.pdf",
        content=pdf_bytes,
    )
    assert doc.file_type == "PDF"
    assert doc.page_count == 1
    assert doc.chunk_count >= 1

    chunks = db_session.query(DocumentChunkModel).filter(DocumentChunkModel.document_id == doc.id).all()
    assert any("Distributed Systems" in c.content for c in chunks)
