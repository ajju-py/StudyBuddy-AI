# StudyBuddy AI — Academic Mini Project Report Outline

**Project Category:** AI Agent Development — Academic Mini Project  
**Academic Year:** 2026–2027  
**Academic Institution:** Maharashtra Institute of Technology, Chhatrapati Sambhajinagar, Maharashtra, India  
**Department:** Department of Computer Science and Engineering (CSE)  
**Developers:**
- **Ajay Tandale** — Lead AI & Backend Architecture (B.Tech CSE)
- **Sakshi Thombre** — Frontend Engineering & UI/UX Design (B.Tech CSE)

---

## 1. Introduction
- Background of AI-assisted learning in undergraduate engineering curricula.
- Evolution of Large Language Models (LLMs) from static chatbots to autonomous, tool-calling agents.
- Purpose of StudyBuddy AI: An intelligent, multi-modal study assistant tailored for B.Tech students.

## 2. Problem Statement
- Students face overwhelming syllabus volumes, fragmented lecture notes, and passive reading fatigue.
- Traditional LLM chatbots suffer from hallucinations, lack verifiable document citations, fail to enforce academic integrity on exams, and cannot plan structured preparation timelines.
- Need for a unified, deterministic, grounded, and engaging educational assistant with controlled tool calling.

## 3. Project Objectives
- Ingest multi-format study documents (PDF, DOCX, TXT, MD) and extract structured text with page indices.
- Implement an autonomous AI agent using the official Groq Python SDK and LLaMA 3.3 70B Versatile model.
- Provide 8 strictly validated tools (`search_study_documents`, `summarize_document`, `generate_quiz`, `generate_flashcards`, `create_study_plan`, `explain_concept`, `record_quiz_result`, `retrieve_learning_progress`).
- Enable 5 adaptive pedagogical study modes (Explain Simply, Exam Prep, Technical Deep Dive, Socratic Tutor, Quick Revision).
- Provide a cinematic, responsive web interface with real interactive 3D Three.js geometry and dark aesthetics.
- Safeguard examination integrity by stripping answer keys from client requests and calculating scores deterministically.
- Persist real student activity with authentic analytics and zero fabricated metrics.

## 4. Proposed Solution
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS with a Three.js interactive Knowledge Sphere.
- **Backend:** Python 3.14 + FastAPI + Pydantic v2 + SQLAlchemy + PyMuPDF.
- **AI Acceleration:** Groq LPU™ Cloud Inference API.
- **Storage:** Local SQLite database with abstraction for Cloud PostgreSQL.

## 5. System Architecture & Workflow
- Detailed Architectural Pipeline (Presentation Layer → API Router → Agent Loop → Tool Dispatcher → Database / Storage).
- Document ingestion and semantic chunking workflow (Sliding window: 800 chars, 150 char overlap).
- Passage retrieval algorithm (BM25 term-frequency and phrase boost with page-level citations).

## 6. AI Agent Design & Tool Calling Implementation
- Agent reasoning loop with bounded iterations (`MAX_AGENT_TOOL_ITERATIONS = 5`).
- Function schema definitions (OpenAI/Groq compatible).
- Deterministic tool execution via `ToolExecutionEngine`.
- Live visual tool inspector for educational transparency in the UI.

## 7. Implementation Modules
- **Module A: AI Study Assistant:** 5 modes, multi-turn history, grounded citations, code formatting.
- **Module B: Document Ingestion:** PDF PyMuPDF extraction, DOCX parsing, error handling for scanned files.
- **Module C: AI Summarizer:** Multi-tier length (Executive, Balanced, Technical, Cheat-sheet), Key Concepts, Definitions.
- **Module D: Practice Examination Hall:** MCQ, True/False, Short Answer, client sanitization, deterministic grading, confetti.
- **Module E: Spaced Flashcards:** 3D card flip, memory hints, mastery counters (`known`, `needs_revision`, `unseen`).
- **Module F: Study Planner:** Exam date validation, subject priority/difficulty weighting, completion toggling.
- **Module G: Progress Analytics:** Real test scores, question counters, score trend bar chart.
- **Module H: Settings & System Health:** Masked API key display, Groq model selector, persistence guide.

## 8. Testing Methodology & Verification Results
- **Automated Unit & Integration Test Suite (`pytest`):**
  - Total Tests: 23 passed in 0.32 seconds.
  - Test suites: `test_config_and_health.py`, `test_document_service.py`, `test_agent_tools.py`, `test_quiz_and_scoring.py`, `test_flashcards_and_planner.py`, `test_api_endpoints.py`.
- **Frontend Production Compilation (`vite build`):**
  - TypeScript validation (`tsc -b`): Passed with zero errors.
  - Production bundle compilation: Passed in 4.18s.
- **Live Local Run Verification:**
  - Backend running on `http://127.0.0.1:8000` (verified via `/api/health`).
  - Frontend running on `http://localhost:5173` (verified via HTTP and browser inspection).

## 9. Results and Limitations
- **Results:** High-speed response latency (< 1.5s per turn on Groq LPU™), zero client credential leaks, authentic citation feedback.
- **Limitations:** Image-only scanned PDFs require OCR preprocessing (Tesseract/Google Cloud Vision); local SQLite does not sync across multiple client devices without migrating to managed PostgreSQL.

## 10. Future Scope
- Integration of Tesseract OCR for scanned handwritten notes.
- Speech-to-text / Audio lecture note ingestion with Whisper API.
- Collaborative multi-student study rooms with WebSockets.
- Mobile application using React Native.

## 11. Conclusion
- StudyBuddy AI successfully demonstrates the practical viability of autonomous, tool-calling AI agents for higher education.
- Combines rigorous backend engineering, strict security boundaries, authentic student analytics, and cinematic frontend design.
