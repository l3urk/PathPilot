# PathPilot — AI-Adaptive Onboarding Engine

> **Forge your path. Skip what you know.**

PathPilot is an AI-driven adaptive onboarding engine that analyzes a new hire's real skill profile from multiple evidence sources and generates a personalized learning pathway targeting only their actual gaps.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- [Git](https://git-scm.com/)

### Run with Docker (Recommended)

This is the recommended approach for judges. Docker handles **all dependencies automatically** — no Python, Node.js, or package installation required.

```bash
# 1. Clone the repository
git clone https://github.com/l3urk/PathPilot.git
cd PathPilot

# 2. Run (API key is already included in docker-compose.yml for judging)
docker compose up --build

# 3. Open your browser
# Frontend: http://localhost:3000
# Backend API docs: http://localhost:8000/docs
```

> First build takes 3–5 minutes (downloads Python and Node images, installs all dependencies). Subsequent starts are instant.

---

## Local Development Setup

### Backend (FastAPI)

```bash
cd PathPilot/backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install pdfplumber python-docx Pillow pytesseract

# Configure environment
cp .env.example .env            # Add your GROQ_API_KEY

# Start the backend
uvicorn app.main:app --reload --port 8000
```

### Frontend (Next.js)

```bash
cd PathPilot/frontend

# Install dependencies
npm install --legacy-peer-deps

# Start the frontend
REACT_APP_API_URL=http://localhost:8000/api npm run dev

# Windows (Command Prompt):
# set REACT_APP_API_URL=http://localhost:8000/api && npm run dev

# Windows (PowerShell):
# $env:REACT_APP_API_URL="http://localhost:8000/api"; npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key for Llama 3.3 70B inference. Get free at [console.groq.com](https://console.groq.com) |
| `ENVIRONMENT` | Set to `development` or `production` |
