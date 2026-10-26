# Production Deployment Architecture & Vercel Guide

This document outlines the verified production deployment architecture for **StudyBuddy AI**.

---

## 1. Official Architecture Overview

| Layer | Deployment Platform | Technology | Role |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | React 19 + TypeScript + Vite | Static SPA hosting, edge CDN distribution, asset caching |
| **Backend** | **Render / Railway / Fly.io** | Python 3.13+ / FastAPI / Uvicorn | Long-running asynchronous REST API, Groq SDK execution, document parsing |
| **Database** | **Neon / Supabase / Railway** | Managed PostgreSQL | Permanent user data, document chunks, exam scores, flashcards |
| **AI Inference**| **Groq Cloud API** | LPU™ Inference Engine | High-throughput LLaMA 3.3 70B & tool-calling reasoning |

---

## 2. Why Split Deployment is Required

### Serverless Filesystem & Process Constraints
1. **Serverless Filesystem Lifespans:** Serverless runtimes on Vercel use read-only ephemeral containers. Temporary files (like SQLite `.db` files or uploaded PDFs in `./data/uploads`) do not persist across invocations.
2. **Binary Extensions:** Heavy C extensions like PyMuPDF (`fitz`), ONNX, and PyYAML operate most reliably in persistent container environments (Docker or dedicated Python runtimes).
3. **Official Vercel Recommendation:** Vercel excels at hosting modern React/Vite frontends with global edge caching, while connecting to a containerized Python backend via `VITE_API_BASE_URL`.

---

## 3. Frontend Deployment to Vercel

### Step 1: Connect Git Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository.

### Step 2: Configure Build Settings
- **Framework Preset:** `Vite`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Set Environment Variables
In the Vercel Project Settings under **Environment Variables**, add:
- `VITE_API_BASE_URL` = `https://your-backend-service.onrender.com/api`

> **Security Rule:** Never add `GROQ_API_KEY` to Vercel environment variables. The API key must live exclusively on the backend server.

### Step 4: Deploy
Click **Deploy**. Vercel will build the production bundle and assign a public domain (e.g., `https://studybuddy-ai.vercel.app`).

---

## 4. Backend Deployment (Render / Railway / Docker)

### A. Environment Variables Required on Backend:
```ini
GROQ_API_KEY=gsk_your_production_key
GROQ_MODEL=llama-3.3-70b-versatile
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=https://studybuddy-ai.vercel.app,http://localhost:5173
DATABASE_URL=postgresql://user:password@ep-host.neon.tech/studybuddy?sslmode=require
STORAGE_DIR=/var/data/uploads
```

### B. Dockerfile for Backend Deployment
```dockerfile
FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

ENV APP_ENV=production
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 5. Verifying Production Readiness

1. **Test Frontend Build:** Run `npm run build` in `frontend/`. Confirm exit code 0.
2. **Test Health Endpoint:** Query `https://your-backend.com/api/health` and verify `groq_configured: true`.
3. **Verify CORS Headers:** Ensure `Access-Control-Allow-Origin` includes your Vercel URL.
4. **Inspect Secrets:** Ensure `.env` is never committed to GitHub.
