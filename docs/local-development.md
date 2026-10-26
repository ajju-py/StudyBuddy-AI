# Local Development & Setup Guide

This guide walks through setting up, configuring, running, and testing **StudyBuddy AI** locally.

---

## 1. Prerequisites

- **Python:** 3.12, 3.13, or 3.14
- **Node.js:** 18.0.0 or later (v20+ or v24+ recommended)
- **Package Managers:** `pip` and `npm`
- **Git**

---

## 2. Repository Cloning & Structure

```bash
git clone <your-repository-url>
cd AIAD-Project
```

Directory Structure:
```
AIAD-Project/
├── backend/            # FastAPI Python backend
│   ├── app/            # Application logic, routes, and services
│   ├── tests/          # Pytest test suite
│   ├── requirements.txt# Python dependencies
│   ├── pytest.ini      # Pytest settings
│   └── .env.example    # Backend environment template
├── frontend/           # React + TypeScript + Vite frontend
│   ├── src/            # Components, pages, services, 3D scenes
│   ├── package.json    # Frontend dependencies
│   └── vite.config.ts  # Vite build & proxy config
├── docs/               # Architecture, security, and deployment guides
├── .gitignore          # Root secret and build file exclusions
├── .env.example        # Root environment template
└── README.md           # Primary project overview
```

---

## 3. Backend Setup

### A. Create and Activate Virtual Environment
On Windows (PowerShell):
```powershell
cd backend
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

On Linux / macOS:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### B. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### C. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your Groq API credentials:
```ini
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.3-70b-versatile
APP_ENV=development
APP_PORT=8000
```
> **Note:** If no `GROQ_API_KEY` is provided, the backend will automatically start in **local demonstration fallback mode**, providing clear setup advice and fallback study tools without crashing.

### D. Start Backend Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API documentation is accessible at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- Redoc: `http://127.0.0.1:8000/redoc`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

---

## 4. Frontend Setup

In a new terminal window:

### A. Navigate and Install Dependencies
```bash
cd frontend
npm install
```

### B. Start Frontend Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/`.
Vite proxies all `/api/*` network requests directly to `http://127.0.0.1:8000/api/*`.

### C. Build Production Bundle
To verify production readiness:
```bash
npm run build
```
The optimized bundle will be compiled into `frontend/dist/`.

---

## 5. Running Automated Tests

Run the complete backend test suite using `pytest`:
```bash
cd backend
.\.venv\Scripts\pytest.exe -v
```
All 23 unit and integration tests validate:
- Configuration and API key masking
- Health and metadata endpoints
- Document validation, PyMuPDF extraction, and BM25 passage retrieval
- 8 controlled agent tool schemas and inputs
- Deterministic quiz grading algorithms
- Spaced flashcard mastery updates
- Study planner timetable generation and block completion toggles
- End-to-end HTTP API endpoints via `TestClient`
