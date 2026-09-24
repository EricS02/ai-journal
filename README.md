# AI Journal

A learning tracker that turns plain-text journal entries into weighted, evidence-based progress
on your own goals — with an AI reading each entry for what it demonstrates, a concept map that
grows as you write, and an optional Obsidian export.

Two ways to use it: a Python CLI, and a React web app talking to a small FastAPI backend.

## How it works

- **Goals** are broken into weighted **subtasks** (milestones), planned by AI when you create a
  goal (`AI: "Can read and modify code they didn't write" — weight 4`).
- Progress is never stored directly — it's **derived** every time from the log of entries. Each
  entry is read by AI against your goal's current subtasks, producing a confidence + reason per
  subtask it's evidence for. That confidence becomes a bounded delta (never exceeds 100%, never
  goes backwards) applied to that subtask's fill.
- Entries also feed **concept extraction** — named things you mention (a language, a bug, a
  technique) are tracked with a mention count and first-seen date, building a concept graph over
  time.
- The concept graph can be viewed live inside the web app (draggable, zoomable, click for
  details), or exported to an Obsidian vault as linked markdown notes.

## Project structure

```
main.py         CLI entry point + shared entry/goal-creation logic
ai.py           OpenAI-backed subtask planning, progress reading, concept extraction
progress.py     Pure functions deriving per-subtask fills and overall goal progress
storage.py      Loads/saves journal.json
vault.py        Generates the Obsidian export (Goals/ and Concepts/ notes)
server.py       FastAPI bridge exposing the same logic over HTTP for the frontend
frontend/learning-tracker/   React + Tailwind + Vite web app
```

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- An OpenAI API key

### Backend

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```
OPENAI_API_KEY=your-key-here
```

### Frontend

```bash
cd frontend/learning-tracker
npm install
```

## Running it

**CLI** (no server needed):

```bash
python main.py
```

Commands:

| Command | What it does |
|---|---|
| `/goal <title>` | Create a new goal — AI plans its weighted subtasks, and it becomes the active goal |
| `/goals` | List all goals with their ids |
| `/switch <id>` | Switch the active goal |
| `/status` | Show the active goal's current derived progress |
| `/map` | Export goals and concepts to an Obsidian vault (`vault/`) |
| anything else | Logged as a journal entry against the active goal |
| `/quit` | Exit |

**Web app** (two processes, run side by side):

```bash
# Terminal 1 — backend
uvicorn server:app --reload --port 5000

# Terminal 2 — frontend
cd frontend/learning-tracker
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Obsidian export (optional)

Running `/map` generates markdown notes under `vault/Goals/` and `vault/Concepts/`. Open just the
`vault/` folder (not the project root) as its own vault in Obsidian to browse them.
