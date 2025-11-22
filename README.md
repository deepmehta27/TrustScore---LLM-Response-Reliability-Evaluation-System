#  TrustScore - LLM Response Reliability Evaluation System

**TrustScore evaluates LLM answers across five reliability metrics and produces a unified 0–100 “trust score” with a human-readable explanation.**  
Built for **Responsible AI** evaluations and **fast hackathon demos**.

---

##  Why TrustScore?

LLMs can be:

- Confident but **wrong** (hallucinations)  
- **Biased** or stereotyping  
- **Toxic** or unsafe in sensitive domains  
- Misaligned with the original **user question**

TrustScore acts like a **“credit score for LLM responses”**:

- Audits each answer across **five reliability dimensions**
- Aggregates them into a consistent **TrustScore (0–100)**
- Explains *why* a response is more or less trustworthy
- Lets you **compare models** (e.g., GPT-4o-mini vs GPT-3.5-turbo)

Perfect for demos in **healthcare, finance, education, and customer support**.

---

##  Key Features

- **5 Reliability Metrics**
  - **Faithfulness** – Grounding in provided context (RAGAS)
  - **Relevance** – Alignment with the original query (RAGAS)
  - **Bias** – Demographic bias & stereotyping (GPT-assisted heuristic)
  - **Toxicity** – Harmful content detection (OpenAI Moderation API)
  - **Factual Accuracy** – Claim verification vs context (GPT fact-check)

- **Parallel Evaluation**  
  All metrics run concurrently via `asyncio.gather()` → fast responses.

- **Industry Presets**
  - `healthcare` – prioritize faithfulness and safety  
  - `finance` – prioritize bias and factual accuracy  
  - `general` – balanced baseline  

- **Human-Readable Explanations**  
  Uses GPT to generate a short natural language explanation; falls back to a deterministic summary if the API key is missing.

- **Multi-Model Comparison**
  - Send one query  
  - Get responses from multiple OpenAI models  
  - See TrustScore + metric breakdown for each

- **Zero Database Overhead**
  - Results are appended to `backend/data/results.json`  
  - Auto-created on first run; ideal for hackathons

- **Built-in Demo Scenarios**
  - Healthcare: Stage 2 hypertension treatment  
  - Finance: Crypto investment risk  
  - Customer support: Password reset flow  

---

##  Tech Stack

- **Backend**
  - FastAPI (Python 3.10+)
  - OpenAI API (Chat + Moderation)
  - RAGAS (Faithfulness & Relevance metrics)
  - Async I/O using `asyncio`

- **Frontend**
  - Next.js 14 (App Router)
  - React 18
  - TypeScript
  - Simple inline styles (no CSS framework) for easy portability

- **Storage**
  - Local JSON file (`backend/data/results.json`) for evaluation history

---

##  Architecture Overview

```text
                      ┌──────────────────────┐
                      │      Next.js UI      │
                      │   (React components) │
                      └────────────┬─────────┘
                                   │  /api/evaluate, /api/compare
                                   ▼
                      ┌────────────────────────┐
                      │       FastAPI API      │
                      │   (async, Python 3.10) │
                      └────────────┬───────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│ RAGAS Metrics   │     │ OpenAI GPT Models  │     │ Custom Evaluators│
│ Faithfulness    │     │ (GPT-4o-mini,      │     │ Bias, Toxicity,  │
│ Relevance       │     │  GPT-3.5, etc.)    │     │ Factual          │
└────────────────┘     └────────────────────┘     └─────────────────┘
                                   │
                                   ▼
                      ┌────────────────────────┐
                      │   TrustScore (0–100)   │
                      │   Weighted by Presets  │
                      └────────────────────────┘


```


## Project Structure 

```text 

backend/
  .env.example               # OPENAI_API_KEY template
  main.py                    # FastAPI app, routes, orchestration
  models.py                  # Pydantic request/response schemas
  scorer.py                  # Presets + weighted score computation
  evaluators/                # Metric evaluators (async)
    __init__.py
    faithfulness.py          # RAGAS Faithfulness (with heuristic fallback)
    relevance.py             # RAGAS ResponseRelevancy (with fallback)
    bias.py                  # GPT-assisted bias heuristic
    toxicity.py              # OpenAI Moderation API wrapper
    factual.py               # GPT fact-check vs context (with fallback)
  requirements.txt

frontend/
  .env.example               # BACKEND_URL template
  package.json               # Next.js + React dependencies
  app/
    layout.tsx               # Base layout and app shell
    page.tsx                 # Main UI container
    api/
      evaluate/route.ts      # Next.js API route → backend /evaluate
      compare/route.ts       # Next.js API route → backend /compare
  components/
    InputForm.tsx            # Inputs + preset demo buttons
    ScoreCard.tsx            # TrustScore + metric breakdown
    ComparisonTable.tsx      # Multi-model comparison table
  lib/
    utils.ts                 # Helper for badge labels/colors


```


## Reliability Metrics:

### Metrics

**Faithfulness (faithfulness.py)**

 - Uses ragas.metrics.Faithfulness when available

 - Falls back to simple token-overlap heuristic vs context

**Relevance (relevance.py)**

 - Uses ragas.metrics.ResponseRelevancy when available

 - Fallback: similarity heuristic between query and response

**Bias (bias.py)**

 - GPT-assisted probe: rephrases user to multiple demographic variants

 - Checks for differential treatment or stereotyping patterns

 - Fallback: scan for common bias-related terms

**Toxicity (toxicity.py)**

 - Uses openai.moderations.create on the response text

 - If flagged → lower score; if safe → high score

 - Fallback: keyword-based toxicity heuristic

**Factual Accuracy (factual.py)**

 - GPT fact-check vs provided context (when API key available)

 - Fallback: overlap between response and context tokens


## Running the Project

### Backend (FastAPI)

 - Requirements: Python 3.10+

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Set OPENAI_API_KEY in .env
uvicorn backend.main:app --reload --port 8000
```

### Frontend (Next.js)

 - Requirements: Node 18+

```bash
cd frontend
npm install
cp .env.example .env  # BACKEND_URL=http://localhost:8000
npm run dev
```


## Demo Workflow:

### The UI (frontend/app/page.tsx) guides you through a simple flow:

 - Choose a demo preset (Healthcare / Finance / Support)
→ Auto-fills Query, Context, and Response examples.

 - Adjust or paste your own LLM-generated Response.

 - Select a Preset (Healthcare, Finance, General).

 - Click “Evaluate”
→ See TrustScore, per-metric scores, color-coded badges, and explanation.

 - Enter a Query and click “Compare Models”
→ Benchmarks multiple OpenAI models side-by-side.



## Deployment:

### Backend:
 - Deploy FastAPI with Uvicorn/Gunicorn on platforms like Render, Railway, Azure, GCP, etc.
###Frontend:
 - Deploy Next.js on Vercel/Netlify and set:
```bash
BACKEND_URL=https://your-backend-hostname
```

