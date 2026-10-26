# StudyBuddy AI — Intelligent AI Study Assistant

> **Learn Smarter. Understand Deeper. Prepare Better.**

[![Category](https://img.shields.io/badge/Category-AI_Agent_Development-cyan.svg)](#)
[![Python](https://img.shields.io/badge/Backend-FastAPI_%7C_Python_3.14-blue.svg)](#)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_%7C_Vite_%7C_Tailwind_CSS-violet.svg)](#)
[![AI](https://img.shields.io/badge/AI_Engine-Groq_LPU™_%7C_LLaMA_3.3_70B-orange.svg)](#)

---

## 🎓 Academic Attribution & Student Credits

- **Project Category:** AI Agent Development — Academic Mini Project
- **Academic Year:** 2026–2027
- **Institution:** Maharashtra Institute of Technology, Chhatrapati Sambhajinagar, Maharashtra, India
- **Department:** Department of Computer Science and Engineering (CSE)
- **Developers:**
  - **Ajay Tandale** — Lead AI & Backend Architecture (*B.Tech CSE Student*)
  - **Sakshi Thombre** — Frontend Engineering & UI/UX Design (*B.Tech CSE Student*)

---

## 🌟 Overview

**StudyBuddy AI** is an autonomous, full-stack educational platform built from scratch to help engineering and college students master complex academic material. Combining official **Groq LPU™ accelerated inference**, **controlled AI agent tool calling**, **PyMuPDF text extraction**, and **BM25 semantic passage retrieval**, StudyBuddy AI delivers grounded answers with exact document page citations, deterministic examination grading, 3D interactive flashcards, and personalized study roadmaps.

---

## ✨ Core Features

1. **Autonomous AI Study Agent:**
   - Multi-turn reasoning powered by Groq's official Python SDK and `llama-3.3-70b-versatile`.
   - 8 strictly bounded, Pydantic-validated tools (`search_study_documents`, `summarize_document`, `generate_quiz`, `generate_flashcards`, `create_study_plan`, `explain_concept`, `record_quiz_result`, `retrieve_learning_progress`).
   - Educational tool-call inspector in the UI displaying tool inputs and outputs.
2. **5 Adaptive Pedagogical Study Modes:**
   - **Explain Simply:** Intuitive analogies without gratuitous jargon.
   - **Exam Preparation:** High-yield scoring keywords, anticipated questions, and marking schemes.
   - **Technical Deep Dive:** Rigorous architectural, mathematical, and algorithmic depth.
   - **Socratic Tutor:** Guided discovery through progressive clues and inquiry.
   - **Quick Revision:** High-yield bullet points and formula cheat-sheets.
3. **Document Ingestion & Grounded Passage Retrieval:**
   - Ingests **PDF** (via PyMuPDF), **DOCX**, **TXT**, and **Markdown**.
   - Splits text into overlapping semantic chunks (800 chars, 150 char overlap) indexed by page numbers.
   - Sublinear BM25 keyword-relevance passage retrieval engine with document citations.
4. **AI Summarizer & Knowledge Extractor:**
   - Executive, balanced, and technical section summaries.
   - Key Concepts directory with explanations.
   - Formal Academic Definitions dictionary.
   - High-yield revision bullet points and anticipated exam questions.
5. **Practice Examination Hall:**
   - Generates multiple-choice, true/false, and short-answer exams.
   - **Integrity Safeguard:** Correct answers and rationales are stripped on the server before client delivery.
   - Deterministic server-side grading with point calculations and question-by-question feedback.
   - Celebratory confetti celebration upon satisfying passing benchmarks (>= 60%).
6. **3D Interactive Spaced Flashcards:**
   - Smooth 3D flip card animation with memory recall hints.
   - Mastery categorization: *Known*, *Needs Revision*, *Unseen*.
   - Filter to difficult cards only for targeted cramming.
7. **Exam Study Timetable Planner:**
   - Synthesizes personalized daily preparation schedules leading to target exam dates.
   - Balances deep focus blocks, active recall revision, mock exams, and cognitive breaks based on subject priority and difficulty.
   - Live session completion checkboxes with persistent timetable progress tracking.
8. **Authentic Progress Analytics:**
   - Real recorded test scores, questions answered, and flashcard mastery counts. Zero fabricated metrics.
   - Interactive exam score distribution chart.
9. **Interactive 3D Knowledge Core:**
   - Built with Three.js. Renders an animated floating geodesic sphere with glowing cognitive core and orbiting particle constellation.
   - Graceful fallback for non-WebGL devices or users preferring reduced motion.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.14, FastAPI, Groq Official SDK, Pydantic v2, PyMuPDF (`fitz`), python-docx, SQLAlchemy, Pytest, Uvicorn |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Three.js, Lucide Icons, Canvas-Confetti |
| **Database** | SQLite (Local Development) / Managed PostgreSQL (Production) |
| **Deployment** | Vercel (Frontend SPA) + Render/Railway (Containerized Python Backend) |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Python 3.12+ (Python 3.14 recommended)
- Node.js 18+ (Node.js 20+ or 24+ recommended)
- Git

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment (Windows PowerShell)
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Open .env and add your GROQ_API_KEY from console.groq.com

# Start backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will start at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
In a new terminal:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173/` in your browser. All `/api/*` calls are automatically proxied to the FastAPI server.

---

## 🧪 Automated Testing

Run the automated pytest test suite in `backend/`:
```bash
cd backend
.\.venv\Scripts\pytest.exe -v
```
**Test Results:** **23 passed in 0.32 seconds** across:
- `test_config_and_health.py`: Secrets masking, health status, and student credits.
- `test_document_service.py`: PDF PyMuPDF extraction, DOCX parsing, chunking, and passage retrieval.
- `test_agent_tools.py`: 8 controlled agent tool schemas, validations, and deterministic dispatchers.
- `test_quiz_and_scoring.py`: Quiz sanitization and server-side deterministic scoring.
- `test_flashcards_and_planner.py`: Spaced repetition mastery tracking and exam schedule generation.
- `test_api_endpoints.py`: End-to-end HTTP integration tests via `TestClient`.

To verify frontend production compilation:
```bash
cd frontend
npm run build
```
Production bundle compiles cleanly (`✓ built in 4.18s`).

---

## 🔒 Security & Credential Protection

- **Server-Side API Key:** The Groq key is read exclusively on the backend and is never exposed to browser JavaScript.
- **Masked Status Reports:** Health endpoints and UI displays expose only safe masked strings (e.g. `gsk_...wxyz` or `***`).
- **Untrusted File Safeguards:** Uploaded files are strictly treated as data; scripts or embedded macros are never executed.
- **Answer Key Integrity:** Correct answers are stripped before quizzes are sent to the browser, preventing students from inspecting network requests.
- **Sandboxed Agent Tools:** The AI agent cannot execute arbitrary shell commands, Python code, or unrestricted SQL.

---

## 🌐 Production Deployment (Vercel)

- **Frontend:** Deployed to **Vercel** with `VITE_API_BASE_URL` pointing to the public backend.
- **Backend:** Deployed to a persistent Python host (**Render**, **Railway**, or **Fly.io**) with managed PostgreSQL.
- Detailed step-by-step instructions are available in [docs/deployment.md](docs/deployment.md).

---

## 📄 Documentation Sitemap

- [Architecture Specification](docs/architecture.md)
- [Local Development Guide](docs/local-development.md)
- [Production Deployment Guide](docs/deployment.md)
- [Security & Threat Mitigation](docs/security.md)
- [Academic Mini Project Report Outline](docs/project-report-outline.md)

---

## ⚖️ Academic License

Developed for academic demonstration and learning enhancement at Maharashtra Institute of Technology, Chhatrapati Sambhajinagar (2026–2027).
All rights reserved by Ajay Tandale and Sakshi Thombre.
