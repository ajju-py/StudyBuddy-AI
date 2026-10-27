# Surya-Server Deployment & Operational Runbook

**Application:** StudyBuddy AI — Intelligent AI Study Assistant  
**Target Host:** `surya-server`  
**Public Frontend:** `https://studybuddy-ai-ecru.vercel.app`  
**Public Backend Ingress:** `https://studybuddy-api.ajaytandale.in`  
**Authors:** Ajay Tandale & Sakshi Thombre, B.Tech CSE  
**Deployment Date:** October 2026  

---

## 1. Executive Summary & Architecture

StudyBuddy AI's production FastAPI backend is deployed on the home server **Surya-Server** using a rootless, containerized Podman architecture managed by **systemd Quadlets**. 

Public requests originating from visitors on the Vercel-hosted frontend are securely routed through a Cloudflare Zero Trust Tunnel edge gateway, terminating TLS with valid certificates and proxying application traffic exclusively to loopback port `8000`. Server administration, SSH, databases, and container management interfaces remain strictly private, bound to the host or accessible exclusively via the authorized **Tailscale** private mesh network.

```
+-----------------------------------------------------------------------+
|                           PUBLIC INTERNET                             |
|                                                                       |
|   +------------------------------------+                              |
|   |          Vercel Frontend           |                              |
|   | https://studybuddy-ai-ecru.vercel.app|                           |
|   +-----------------+------------------+                              |
|                     | (HTTPS requests via VITE_API_BASE_URL)          |
|                     v                                                 |
|   +------------------------------------+                              |
|   |    Cloudflare Edge / Zero Trust    |                              |
|   | https://studybuddy-api.ajaytandale.in|                            |
|   +-----------------+------------------+                              |
+---------------------|-------------------------------------------------+
                      | (Encrypted outbound-only tunnel)
                      v
+-----------------------------------------------------------------------+
|                 SURYA-SERVER (Home Infrastructure)                    |
|                                                                       |
|   +------------------------------------+                              |
|   |   cloudflared Daemon (Systemd)     |                              |
|   +-----------------+------------------+                              |
|                     | (Forward to loopback 127.0.0.1:8000)            |
|                     v                                                 |
|   +------------------------------------+       +------------------+   |
|   |  Podman Container: studybuddy      | <---> | Storage / Data   |   |
|   |  - FastAPI (Uvicorn)               |       | - studybuddy.db  |   |
|   |  - PyMuPDF, Groq SDK, SQLAlchemy   |       | - uploads/       |   |
|   |  - Managed by systemd Quadlet      |       +------------------+   |
|   +-----------------+------------------+                              |
|                     ^                                                 |
|                     | (Private administration only)                   |
|   +-----------------+------------------+                              |
|   | Tailscale Mesh (MagicDNS / WireGuard)|                            |
|   | - SSH (Port 22 private)            |                              |
|   | - Podman / Postgres / Redis private|                              |
|   +------------------------------------+                              |
+-----------------------------------------------------------------------+
```

---

## 2. Server Specifications & Environment

| Property | Details |
| :--- | :--- |
| **Hostname** | `surya-server` |
| **Operating System** | Debian GNU/Linux 13 (trixie) x86_64 |
| **Kernel** | `Linux 6.12.x SMP PREEMPT_DYNAMIC` |
| **CPU Architecture** | Intel(R) Core(TM)2 Duo CPU E7300 @ 2.66GHz (`x86-64-v1` baseline) |
| **System Memory** | 1.9 GiB Physical RAM + 2.0 GiB Swap |
| **Persistent Storage** | High-capacity partition mounted at `/srv/storage` (>100 GB available) |
| **Container Engine** | Podman 5.4.2 (Rootless with `pasta` networking & systemd Quadlets) |
| **Service Execution** | Systemd user instance with user lingering enabled (`Linger=yes`) |

---

## 3. Ingress & Networking Configuration

### Public Application Ingress
- **Public FQDN:** `https://studybuddy-api.ajaytandale.in`
- **Edge Provider:** Cloudflare Zero Trust Tunnel
- **Local Target:** `http://127.0.0.1:8000`
- **Router Port Forwarding:** None (0 open incoming router ports; all ingress is outbound-initiated).
- **Publicly Reachable Routes:** Only application routes under `/api/*` and `/`.
- **Protected Private Interfaces:** SSH (22), Postgres (5432), Redis (6379), Nginx (8080), and Podman socket remain unreachable from the public internet.

### Tailscale Private Administration
- **Node Name:** `surya-server`
- **Tailnet:** Private authorized tailnet
- **Protocol:** WireGuard mesh overlay
- **Access Control:** Least-privilege node authorization; administrative SSH and diagnostics restricted strictly to authorized operator devices.

---

## 4. Container & Systemd Quadlet Architecture

The application is deployed using Podman's native declarative systemd generator (**Quadlets**) located in `~/.config/containers/systemd/studybuddy.container`:

```ini
[Unit]
Description=StudyBuddy AI FastAPI Backend
After=network-online.target
Wants=network-online.target

[Container]
Image=localhost/studybuddy-backend:latest
ContainerName=studybuddy-backend
EnvironmentFile=/home/ajay/.config/surya-server/secrets/studybuddy.env
Volume=/srv/storage/apps/studybuddy/data:/app/data:Z
PublishPort=127.0.0.1:8000:8000

[Service]
Restart=always

[Install]
WantedBy=default.target
```

### Why Rootless Quadlet?
1. **Security:** Runs without root privileges, mitigating container escape risks.
2. **Reliability:** Managed directly by systemd; starts automatically on server boot without requiring interactive login (`loginctl enable-linger`).
3. **Isolation:** Bound strictly to `127.0.0.1:8000`, preventing exposure to LAN or public Wi-Fi.

---

## 5. Environment Variables & Secret Management

All runtime settings are supplied via `/home/ajay/.config/surya-server/secrets/studybuddy.env` with restrictive file permissions (`chmod 600`, readable only by the application service account):

| Variable Name | Purpose | Example / Scope |
| :--- | :--- | :--- |
| `APP_ENV` | Application environment mode | `production` |
| `APP_HOST` | Network interface binding inside container | `0.0.0.0` |
| `APP_PORT` | Listening TCP port | `8000` |
| `DATABASE_URL` | SQLAlchemy SQLite database path | `sqlite:////app/data/studybuddy.db` |
| `STORAGE_DIR` | Ingested document storage directory | `/app/data/uploads` |
| `CORS_ORIGINS` | Permitted cross-origin browser origins | `https://studybuddy-ai-ecru.vercel.app` |
| `GROQ_MODEL` | Active LLM inference model | `openai/gpt-oss-120b` |
| `GROQ_API_KEY` | Private Groq API credential | *Configured privately on server (chmod 600)* |

> **Security Guarantee:** Neither the Groq API key nor sensitive operational credentials are committed to Git, embedded in frontend bundles, or logged in system journals.

---

## 6. Hardware Optimization & Compatibility Note

During pre-flight validation on Surya-Server's Intel Core 2 Duo CPU (`x86-64-v1`), modern generic wheels for `numpy>=2.0` (brought in by unpinned PyMuPDF 2.0) triggered runtime `X86_V2` instruction set exceptions due to the lack of `POPCNT` and `SSE4.2`.

**Resolution Implemented:**
- In `backend/requirements.txt`, PyMuPDF is specified as `pymupdf>=1.24.0,<2.0`.
- This ensures 100% C++ native execution on `x86-64-v1` baseline hardware without requiring heavy unnecessary dependencies (`onnxruntime`, `numpy`), reducing container image footprint by ~80 MB and eliminating hardware incompatibilities.
- Nested f-string syntax in prompt builders was verified for Python 3.11 compatibility.

---

## 7. Functional & Security Verification Matrix

| Category | Test Case | Method | Result |
| :--- | :--- | :--- | :--- |
| **System** | Service auto-restart | `systemctl --user restart studybuddy.service` | **PASSED** (Active within 2s) |
| **System** | Headless boot survival | `loginctl show-user ajay -p Linger` | **PASSED** (`Linger=yes`) |
| **Health** | API health check | `GET https://studybuddy-api.ajaytandale.in/api/health` | **PASSED** (`HTTP 200 OK`, `groq_configured: true`) |
| **Security** | Authorized CORS | `Origin: https://studybuddy-ai-ecru.vercel.app` | **PASSED** (`200 OK`, `allow-origin` matched) |
| **Security** | Unauthorized CORS | `Origin: https://malicious-site.com` | **PASSED** (`400 Bad Request`, `Disallowed origin`) |
| **Security** | Secret protection | JavaScript bundle analysis of Vercel production | **PASSED** (No API keys or tokens in bundle) |
| **AI Inference**| Real Groq Agent Chat | `POST /api/chat` with interactive prompt | **PASSED** (Returned live answer via `gpt-oss-120b`) |
| **Feature** | Quiz Generation | `POST /api/quizzes/generate` | **PASSED** (2 multi-choice questions with answer stripping) |
| **Feature** | Flashcard Generation | `POST /api/flashcards/generate` | **PASSED** (3 cards generated with memory hints) |
| **Feature** | Study Planner | `POST /api/planner/generate` | **PASSED** (14-day study roadmap generated) |
| **Feature** | Document Upload | `POST /api/documents/upload` | **PASSED** (File ingested, chunked, stored in `/uploads`) |
| **Feature** | Document Summary | `POST /api/summaries` | **PASSED** (Key concepts and exam questions extracted) |
| **Analytics** | Activity Tracking | `GET /api/analytics` | **PASSED** (Real activity entries logged to SQLite) |
| **Persistence**| Data across restart | Container restarted after session creation | **PASSED** (SQLite DB & uploads verified intact) |

---

## 8. Backup & Disaster Recovery Procedures

All persistent application data lives inside `/srv/storage/apps/studybuddy/data/`:
- SQLite Database: `/srv/storage/apps/studybuddy/data/studybuddy.db`
- Ingested Files: `/srv/storage/apps/studybuddy/data/uploads/`

### 8.1 Automated SQLite Hot-Backup
SQLite databases should be backed up using the SQLite online backup API to prevent incomplete writes during active operations:

```bash
# Perform an online safe snapshot of the database
sqlite3 /srv/storage/apps/studybuddy/data/studybuddy.db \
  ".backup '/srv/storage/apps/studybuddy/data/studybuddy_backup_$(date +%Y%m%d_%H%M%S).db'"
```

### 8.2 Full Application Data Archive
To archive both the database and uploaded document artifacts:

```bash
# Create a timestamped compressed archive
tar -czvf /srv/storage/backups/studybuddy_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  -C /srv/storage/apps/studybuddy data/
```

### 8.3 Restore Procedure
1. Stop the application service:
   ```bash
   systemctl --user stop studybuddy.service
   ```
2. Replace or restore the target database file:
   ```bash
   cp /srv/storage/backups/studybuddy_backup_<TIMESTAMP>.db \
      /srv/storage/apps/studybuddy/data/studybuddy.db
   ```
3. Restart the service and verify health:
   ```bash
   systemctl --user start studybuddy.service
   curl -s http://127.0.0.1:8000/api/health
   ```

---

## 9. Update & Rollback Procedures

### 9.1 Updating Application Code
When deploying updates to the backend:

1. Push changes to GitHub and transfer updated files to `/home/ajay/studybuddy-backend/`.
2. Rebuild the container image on Surya-Server:
   ```bash
   podman build -t localhost/studybuddy-backend:latest /home/ajay/studybuddy-backend/
   ```
3. Restart the Quadlet service:
   ```bash
   systemctl --user restart studybuddy.service
   ```
4. Confirm health:
   ```bash
   curl -s http://127.0.0.1:8000/api/health
   ```

### 9.2 Immediate Rollback Procedure
If a regression or failure occurs:

1. Roll back to the previous image tag or rebuild from the previous git commit:
   ```bash
   podman tag localhost/studybuddy-backend:previous localhost/studybuddy-backend:latest
   systemctl --user restart studybuddy.service
   ```
2. Validate service status:
   ```bash
   systemctl --user status studybuddy.service
   ```

---

## 10. Operational Maintenance & Monitoring

| Task | Command |
| :--- | :--- |
| **Check Service Status** | `systemctl --user status studybuddy.service` |
| **View Live Service Logs** | `journalctl --user -u studybuddy.service -f --no-pager` |
| **View Running Container** | `podman ps -f name=studybuddy-backend` |
| **Inspect Cloudflare Tunnel** | `curl -s http://127.0.0.1:20241/ready` |
| **Check Tailscale Status** | `tailscale status` |
| **Restart Backend** | `systemctl --user restart studybuddy.service` |
