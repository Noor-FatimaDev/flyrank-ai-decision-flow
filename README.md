# AI Decision Flow — React Flow + Inngest + Groq

A visual workflow builder where each node is an AI-powered decision step. Draw a flowchart, write a yes/no question into each node, connect YES and NO paths to different outcomes — then run it. An LLM answers each node's question and the workflow automatically follows the matching branch, node by node, until it reaches a dead end.

**Assignment:** BE-09, FlyRank AI Backend AI Engineering internship

## Screenshot

![AI decision flow example](flow.png)

## How it works

1. Build a flowchart on the canvas — add nodes, type a decision prompt into each, and connect them with YES (green) and NO (red) edges
2. Click **Run**
3. The backend finds the starting node (the one nothing points into), sends its prompt to an LLM (Groq), gets back YES or NO, follows the matching edge to the next node, and repeats
4. Each step runs as its own [Inngest](https://www.inngest.com/) step — retried automatically on failure, fully visible in Inngest's dashboard
5. The frontend polls until the run finishes, then shows a step-by-step execution log

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + [React Flow](https://reactflow.dev/) + Shadcn |
| Backend | Python + FastAPI |
| Workflow execution | [Inngest](https://www.inngest.com/) (Python SDK) |
| LLM | [Groq](https://console.groq.com/) via the OpenAI-compatible SDK |
| Persistence | Browser `localStorage` (graph state) |

## Project structure

```
flyrank-ai-decision-flow/
├── assets/
│   └── ai-decision-flow.png
├── frontend/          # Next.js app — the canvas UI
│   └── src/
│       ├── app/
│       └── components/
│           ├── FlowCanvas.tsx    # canvas, run button, execution log
│           └── PromptNode.tsx    # custom decision node
├── backend/            # FastAPI app — execution logic
│   └── main.py          # graph traversal, Groq calls, Inngest function, API routes
└── README.md
```

## Running it locally

You'll need **three terminals running at once**.

### 1. Backend setup (one-time)

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1      # Windows PowerShell
# source venv/bin/activate       # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Frontend setup (one-time)

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run all three servers

**Terminal 1 — frontend:**
```bash
cd frontend
npm run dev
```
→ http://localhost:3000

**Terminal 2 — backend:**
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```
→ http://localhost:8000

**Terminal 3 — Inngest dev server:**
```bash
cd backend
npm run inngest:dev
```
→ http://localhost:8288 (dashboard — watch runs execute live here)

## Features

**Core (Phases 1–3)**
- Drag-and-drop React Flow canvas with editable decision nodes
- YES/NO edge types, color-coded and labeled
- Graph state persisted to `localStorage` (survives refresh)
- End-to-end execution: each node's prompt sent to Groq via an Inngest step, response drives which edge is followed next
- Execution order tracked and returned

**Polish (Phase 4)**
- Readable execution log panel (replaces raw JSON) — shows each step's prompt and answer in order
- Error handling: empty prompts and missing start nodes are caught and reported clearly instead of crashing or producing meaningless results
- Redesigned node styling — header band, shadow, clearer YES/NO footer

## Known limitations

- No validation for cyclic graphs (a loop between nodes would run indefinitely)
- Only the first run's status is polled — clicking Run again while one is in progress isn't explicitly blocked beyond the button's disabled state