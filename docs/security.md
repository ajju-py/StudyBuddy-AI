# Security & Threat Mitigation Specification

**StudyBuddy AI** implements a defense-in-depth security model to safeguard user data, prevent credential leakage, and protect execution environments from untrusted input.

---

## 1. API Credential & Secret Management

- **Server-Side Exclusivity:** The Groq API key (`GROQ_API_KEY`) is stored and accessed exclusively on the Python FastAPI backend via `pydantic_settings`.
- **Zero Client Exposure:** The API key is never bundled into frontend JavaScript, HTML, or Vite bundles.
- **Secret-Safe Logging & Health Status:** The backend log system and health endpoints (`/api/health`) never print raw keys. Keys are masked via `get_masked_groq_key()` (e.g. `gsk_...wxyz` or `***`).
- **Version Control Exclusions:** The root `.gitignore` explicitly prevents `.env`, `*.sqlite3`, `*.db`, and uploaded user files from ever entering git commits.
- **Bounded Error Handling:** Permanent authentication failures (HTTP 401) immediately raise `GroqConfigError` and terminate without retrying indefinitely or spamming API endpoints.

---

## 2. Controlled Agent Tool Execution (Sandbox & Boundaries)

Section 7 specifies strict boundaries on AI agent capabilities:
- **No Arbitrary Execution:** The agent has **zero access** to arbitrary shell commands, `eval()`, `exec()`, unrestricted SQL, or arbitrary filesystem paths.
- **Pydantic Validation:** Every tool argument payload is parsed and validated against strict Pydantic schemas (e.g., `SearchStudyDocumentsArgs`, `GenerateQuizArgs`) before execution.
- **Deterministic Application Scoring:** Quiz grading is calculated deterministically in Python application code. The AI is never trusted to calculate percentage scores or grade totals without verification.
- **Bounded Tool Calling Loop:** The agent reasoning loop is capped at `MAX_AGENT_TOOL_ITERATIONS = 5` to prevent infinite tool-call recursion, runaway billing, or Denial of Service (DoS).
- **Separation of Reasoning and Execution:** Tool calls are dispatched through `ToolExecutionEngine`, ensuring that model outputs cannot directly manipulate runtime objects.

---

## 3. Untrusted Document Processing & Prompt Injection Defense

All uploaded files (PDF, DOCX, TXT, MD) are treated as untrusted user input:
- **No Execution of File Contents:** Document text is treated strictly as passive data. Script tags, macros, and embedded code blocks are never executed.
- **Path Traversal Prevention:** Files are saved using sanitized names prefixed with UUIDs:
  ```python
  unique_name = f"{uuid.uuid4().hex[:12]}_{re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)}"
  ```
- **Size Limits & Format Verification:** Maximum upload limit is strictly enforced at 15 MB. Only allowed extensions (`.pdf`, `.docx`, `.txt`, `.md`) are accepted.
- **Prompt Injection Neutralization:** Retrieved document passages are injected into system prompts using explicit, isolated delimiters (`Relevant passages retrieved from target document:\n...`), instructing the model to treat document content solely as reference context rather than executable instructions.

---

## 4. Academic Integrity & Examination Safeguards

- **Client-Side Answer Stripping:** When a quiz is generated, the backend serializes questions through `QuizItemClient`, completely stripping `correct_answer` and `explanation`.
- **Tamper-Proof Grading:** Students cannot inspect browser developer tools or network JSON payloads to find answers before submitting the exam.
- **Deterministic Server-Side Verification:** When submitted, the backend fetches the encrypted/stored answer key from the database, evaluates answers via string and semantic token matching, and generates the grade report.

---

## 5. Persistence & Privacy Tiers

| Data Tier | Scope | Storage Location | Privacy Impact |
| :--- | :--- | :--- | :--- |
| **Session Data** | Ephemeral | Active browser memory | Discarded on refresh |
| **Local Persistent Data** | Developer Local | `backend/data/studybuddy.db` | Stored exclusively on student's local machine |
| **Cloud Persistent Data** | Production Deployment | Managed PostgreSQL (Neon / Supabase) | Isolated via parameterized queries and TLS encryption |
