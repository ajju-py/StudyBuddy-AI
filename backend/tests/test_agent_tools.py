"""
Tests for controlled agent tools, schema validation, and deterministic execution.
"""

import json
from app.tools.agent_tools import ToolExecutionEngine, AGENT_TOOL_DEFINITIONS
from app.services.document_service import document_service


def test_tool_definitions_structure():
    assert len(AGENT_TOOL_DEFINITIONS) >= 8
    tool_names = [t["function"]["name"] for t in AGENT_TOOL_DEFINITIONS]
    assert "search_study_documents" in tool_names
    assert "summarize_document" in tool_names
    assert "generate_quiz" in tool_names
    assert "generate_flashcards" in tool_names
    assert "create_study_plan" in tool_names
    assert "explain_concept" in tool_names
    assert "record_quiz_result" in tool_names
    assert "retrieve_learning_progress" in tool_names


def test_tool_explain_concept(db_session):
    args = {"concept": "Dynamic Programming", "target_level": "intermediate", "use_analogy": True}
    res = ToolExecutionEngine.execute_tool("explain_concept", json.dumps(args), db_session)
    assert res["status"] == "success"
    assert res["concept"] == "Dynamic Programming"
    assert "analogy" in res["guidance"]


def test_tool_search_study_documents(db_session):
    # Ingest sample text
    document_service.ingest_document(
        db=db_session,
        filename="compiler_design.txt",
        content=b"Compiler lexical analysis converts character streams into tokens using finite automata.",
    )

    args = {"query": "lexical analysis tokens", "top_k": 2}
    res = ToolExecutionEngine.execute_tool("search_study_documents", json.dumps(args), db_session)
    assert res["status"] == "success"
    assert res["passages_found"] >= 1
    assert any("lexical analysis" in r["snippet"].lower() for r in res["results"])


def test_tool_malformed_arguments(db_session):
    res = ToolExecutionEngine.execute_tool("search_study_documents", "{invalid json syntax", db_session)
    assert res["status"] == "error"
    assert "Malformed" in res["message"]


def test_tool_invalid_argument_validation(db_session):
    # top_k out of bounds (max 8)
    args = {"query": "test", "top_k": 99}
    res = ToolExecutionEngine.execute_tool("search_study_documents", json.dumps(args), db_session)
    assert res["status"] == "error"
    assert "Invalid arguments" in res["message"]
