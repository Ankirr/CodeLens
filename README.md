# 👁️ CodeLens — AI-Powered Code Review & Auditing Engine

CodeLens is a premium, full-stack code auditing and review intelligence platform. It scans public GitHub repositories, analyzes the codebase using state-of-the-art Large Language Models (LLMs), detects critical bugs, security gaps, performance bottlenecks, and best practice violations, and provides side-by-side actionable code recommendations. Users can view these reviews interactively on a sleek web dashboard or export them as a professional, corporate-grade PDF report.

The interface is custom-designed with a sophisticated, earthy charcoal and terracotta theme inspired by Claude.ai, presenting a premium, distraction-free auditing workspace.

---

## 🚀 Key Features

* **Recursive Repository Analysis**: Crawls public GitHub repositories recursively to build file maps and screen candidates.
* **Concurrent Review Pipelines**: Concurrently reviews files using a throttled asynchronous queue (`asyncio.Semaphore(3)`), protecting against free-tier rate limits while maintaining speeds of under 10 seconds.
* **Categorized Quality Audits**: Segregates findings into five distinct metrics:
  * **Bugs** (Logic issues and runtime errors)
  * **Security Vulnerabilities** (API leaks, injection bugs, insecure functions)
  * **Performance Bottlenecks** (N+1 queries, unindexed loops, memory waste)
  * **Best Practices** (Naming, formatting, modern patterns)
  * **Refactoring Opportunities** (Over-complex structures, dead code)
* **Side-by-Side Interactive Code Diff**: Displays the original code block and the recommended, optimized refactoring side-by-side with high-contrast syntax layouts.
* **Professional Corporate PDF Export**: Generates publication-ready PDF audit reports using ReportLab with a dual-pass canvas (`NumberedCanvas`) printing dynamic "Page X of Y" headers, footers, custom page boundaries, and elegant tables.
* **Clean Trailing URL Parsing**: Automatically standardizes clone URLs (with `.git`), subfolders, branches, and tree paths, avoiding unauthenticated extraction failures.
* **Unified Workspace History**: Restores a shared, public history database, allowing team members to review previous scans on a single workspace.

---

## 🛠️ Complete Technology Stack

### 🐍 Backend (FastAPI API)
* **FastAPI (v0.100.0+)**: Highly performant, asynchronous web framework for building APIs.
* **Uvicorn (v0.20.0+)**: Standard lightning-fast ASGI web server implementation.
* **Pydantic & Pydantic-Settings (v2.0.0+)**: Data validation, typing, and environment-level configuration management.
* **SQLAlchemy Asyncio (v2.0.0+)**: Modern, asynchronous ORM query mapping.
* **AioSQLite (v0.19.0+)**: Non-blocking SQLite database driver for local development.
* **Asyncpg (v0.28.0+)**: Native, high-performance PostgreSQL driver for production deployments.
* **Psycopg2-Binary**: Standard database adapters for synchronous PostgreSQL extensions.
* **Httpx (v0.24.0+)**: Asynchronous HTTP client to interface with GitHub and Groq APIs.
* **ReportLab (v4.0.0+)**: Enterprise-level PDF creation engine to generate beautifully formatted reports.
* **Python-Dotenv**: Loads local `.env` configuration keys into runtime environments.

### ⚛️ Frontend (React & Vite SPA)
* **React 19 (v19.2.6)**: Component-driven visual client state management.
* **Vite 8 (v8.0.12)**: Next-generation ultra-fast bundler and dev server.
* **Tailwind CSS v4 (v4.3.0)**: Modern utility-first CSS framework with integrated compiler.
* **Lucide React**: Sleek, vector-based line icon library.
* **Clsx & Tailwind-Merge**: Dynamically resolves and combines complex CSS classes cleanly.

---

## 📂 Detailed File Directory Tree Structure

```bash
CodeLens/
├── README.md                           # Main project documentation (this file)
├── backend/                            # FastAPI Server Root
│   ├── .env                            # Local configuration & private API keys
│   ├── .env.example                    # Sample configuration variables
│   ├── requirements.txt                # Python backend dependencies
│   ├── codelens.db                     # SQLite database (auto-generated)
│   └── app/                            # Application Core
│       ├── __init__.py
│       ├── main.py                     # API Entry Point, startup hooks, CORS configs
│       ├── config.py                   # Pydantic environment configurations
│       ├── database.py                 # Async SQLAlchemy engine & session providers
│       ├── models.py                   # SQLAlchemy tables definitions (Review)
│       ├── schemas.py                  # Pydantic models & URL validators
│       ├── routes/
│       │   ├── __init__.py
│       │   └── review.py               # Review POST, GET, and PDF export endpoints
│       └── services/
│           ├── __init__.py
│           ├── github.py               # GitHub file crawler and downloader
│           ├── groq.py                 # Groq LLM API client (Llama 3.3 70B)
│           └── pdf.py                  # Professional ReportLab PDF document builder
│
└── frontend/                           # React SPA Client Root
    ├── index.html                      # HTML Entry page linking Lora/Inter fonts
    ├── package.json                    # Node dependencies and npm script definitions
    ├── vite.config.js                  # Vite & Tailwind compilation configs
    └── src/                            # Source Files
        ├── main.jsx                    # React bootstrap entry point
        ├── App.jsx                     # Core state hub, fetches, and router
        ├── App.css                     # Custom component classes
        ├── index.css                   # Global resets, typography, and Tailwind v4 themes
        ├── assets/                     # Logos and branding assets
        ├── components/                 # Shared Components
        │   ├── Layout.jsx              # Main shell (sticky header & footer)
        │   ├── AnalysisLoader.jsx      # Dynamic multi-stage loader
        │   └── IssueBadge.jsx          # Severity color-coded badges
        └── pages/                      # Page Views
            ├── Home.jsx                # URL input panel & recent review grid
            ├── Dashboard.jsx           # Expandable files tree, score wheels, side-by-side diffs
            └── History.jsx             # Unified, clean dashboard log of past audits
```

---

## 🔌 API Specifications

### 1. `POST /api/review`
Triggers the full repository scan, concurrent file download, and Groq LLM reviews.
* **Payload**:
  ```json
  { "repo_url": "https://github.com/owner/repo" }
  ```
* **Returns**:
  ```json
  {
    "id": "uuid-review-id",
    "repo_url": "https://github.com/owner/repo",
    "repo_name": "owner/repo",
    "overall_score": 85,
    "files_reviewed": 5,
    "review_data": {
      "files": [
        {
          "filename": "app.py",
          "overall_score": 90,
          "summary": "File details...",
          "bugs": [{ "severity": "high", "line": 12, "issue": "desc", "fix": "suggestion" }],
          "performance": [],
          "security": [],
          "best_practices": [],
          "refactor_suggestions": []
        }
      ]
    },
    "created_at": "2026-05-23T12:00:00.000000"
  }
  ```

### 2. `GET /api/reviews`
Fetches a list of all historical reviews stored in the database.
* **Returns**: Array of `ReviewListItem` elements (excluding heavy file details).

### 3. `GET /api/review/{review_id}`
Retrieves the full comprehensive findings and code review structures for a specific audit.

### 4. `GET /api/review/{review_id}/export`
Generates and streams a custom, corporate-grade PDF file named `CodeLens_Review_{repo_name}.pdf` directly to the client browser.

---

## 🛢️ Database Schema Model

### Table: `reviews`
Mapped using SQLAlchemy's async engine:

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID(as_uuid=True)` | Primary Key | Unique ID generated via `uuid.uuid4` |
| `repo_url` | `String` | Nullable=False | The standardized GitHub URL |
| `repo_name` | `String` | Nullable=False | The repository owner and name |
| `overall_score` | `Integer` | Nullable=True | The average health score across reviewed files |
| `files_reviewed` | `Integer` | Default=0 | The number of files analyzed |
| `review_data` | `JSON` | Nullable=False | Full structured LLM findings |
| `created_at` | `DateTime` | Default=UTC | Timestamp when the audit was generated |

---

## 🔑 Guide: How to Get Free API Keys

CodeLens uses free-tier limits. Set up your credentials in less than 3 minutes:

### 1. Groq LLM API Key (Required)
Groq provides high-speed inference for open models (like Meta's `llama-3.3-70b-versatile`) with a generous free tier.
1. Visit the **[Groq Console](https://console.groq.com/)**.
2. Sign up with a free account (using Google, GitHub, or Email).
3. On the left sidebar, click **API Keys**.
4. Click **Create API Key**, name it `CodeLens`, and copy the resulting string starting with `gsk_...`.
5. Paste this key in your `backend/.env` file under `GROQ_API_KEY`.

### 2. GitHub Personal Access Token (Optional)
The public GitHub API limits unauthenticated requests to **60 per hour**. Adding a free personal token increases this to **5,000 per hour**, preventing rate-limiting when auditing larger repositories.
1. Sign in to your **[GitHub Account](https://github.com/)**.
2. Go to **Settings** → **Developer Settings** → **Personal Access Tokens** → **Tokens (classic)** (or go directly to [github.com/settings/tokens](https://github.com/settings/tokens)).
3. Click **Generate new token (classic)**.
4. Set the note as `CodeLens-Review`.
5. Under scopes, **do not select any scopes**. Leaving all scopes unchecked creates a "fine-grained read-only" token, which is the safest security practice and fully sufficient for fetching public tree configurations.
6. Click **Generate token** and copy the code starting with `ghp_...`.
7. Paste this in your `backend/.env` file under `GITHUB_TOKEN`.

---

## 🎨 visual Design System & Styling (Claude-Inspired)

Designed with custom-curated Tailwind v4 tokens, creating a premium, distraction-free aesthetic:
* **Backgrounds**: Deep, warm earthy charcoal `#141413` (canvas) and `#1c1c1b` (card bodies) instead of standard cold blues or flat blacks.
* **Borders**: Soft clay-accented dark grey `#292927`.
* **Primary Accent**: Claude's signature warm terracotta `#d97736` (instead of flashy neon colors), with a lighter clay hover `#e5935c`.
* **Muted Typography**: Soft warm ivory `#f3ede2` for text and elegant clay highlights.
* **Serif Headings**: Google Font **Lora** configured for all headers (`h1`, `h2`, `h3`) for a highly polished, editorial publication look.
* **Body Font**: **Inter** sans-serif font for maximum clean readability of dashboard items, code lines, and summaries.

---

## 🛠️ Quick Start Instructions

This project is organized as a monorepo containing `/backend` (FastAPI) and `/frontend` (React + Vite).

### Step 1: Run the Backend (FastAPI)
Open a terminal in the `/backend` folder:

1. **Activate the Virtual Environment**:
   * **Windows (PowerShell)**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   * **Windows (Command Prompt)**:
     ```cmd
     .venv\Scripts\activate.bat
     ```
   * **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```

2. **Set up Environment Variables**:
   In `/backend`, rename or copy `.env.example` to `.env` and fill out your free Groq API key:
   ```env
   GROQ_API_KEY=gsk_your_groq_key_here
   GITHUB_TOKEN=ghp_your_optional_github_token_here
   DATABASE_URL=sqlite+aiosqlite:///./codelens.db
   ```

3. **Start the API Web Server**:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   * The server runs at `http://127.0.0.1:8000`. You can inspect the interactive Swagger API documentation at `http://127.0.0.1:8000/docs`.

---

### Step 2: Run the Frontend (React + Vite)
Open a new terminal in the `/frontend` folder:

1. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```
2. **Start the Dev Server**:
   ```bash
   npm run dev
   ```
3. **Open the App**:
   * Open your browser and navigate to the address shown in the terminal (usually `http://localhost:5173`).
