"""
End-to-end API integration tests via FastAPI TestClient.
"""

from datetime import datetime, timedelta


def test_api_chat_flow(client):
    payload = {
        "message": "Explain the concept of Virtual Memory in operating systems.",
        "study_mode": "explain_simply",
        "use_agent_tools": True,
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "response" in data
    assert data["study_mode"] == "explain_simply"


def test_api_document_upload_and_search(client):
    file_bytes = b"Cache Memory Architecture: L1, L2, and L3 caches provide hierarchy to reduce memory latency."
    response = client.post(
        "/api/documents/upload",
        files={"file": ("cache_notes.txt", file_bytes, "text/plain")}
    )
    assert response.status_code == 200
    doc_data = response.json()
    assert doc_data["original_name"] == "cache_notes.txt"
    assert doc_data["file_type"] == "TXT"
    doc_id = doc_data["id"]

    # Search
    search_res = client.post(
        "/api/documents/search",
        json={"query": "cache memory latency", "top_k": 2}
    )
    assert search_res.status_code == 200
    results = search_res.json()["results"]
    assert len(results) > 0
    assert any("Cache Memory" in r["snippet"] for r in results)

    # Delete
    del_res = client.delete(f"/api/documents/{doc_id}")
    assert del_res.status_code == 200


def test_api_summaries(client):
    payload = {
        "text": (
            "Cybersecurity Cryptography: Asymmetric encryption uses public and private key pairs. "
            "RSA and Elliptic Curve Cryptography are prevalent standards. "
            "Digital signatures provide non-repudiation, integrity, and authenticity."
        ),
        "summary_type": "short",
    }
    response = client.post("/api/summaries", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert len(data["key_concepts"]) > 0
    assert len(data["definitions"]) > 0


def test_api_analytics_empty_and_populated(client):
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "actual_average_quiz_score" in data
    assert "total_quizzes_completed" in data
    assert "recent_activities" in data
