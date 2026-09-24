# Notes

Personal build log — what this is, why it's built this way, and what's still rough.

## What this is

Started as a terminal journal with flat, directly-overwritten progress percentages. Reworked to
match a richer data model (discovered while reading a React/Tailwind frontend I'd designed
separately): weighted subtasks, and progress that's *derived* from a log of entries rather than
stored and edited directly. Then bridged the two with a small FastAPI server so the same Python
logic serves both the CLI and the web app.

## Why it's built this way

- **Progress is never stored, always derived** (`progress.py`'s `fills_for`/`goal_progress`). Every
  entry contributes evidence (confidence + reason from AI, converted to a bounded delta in Python);
  the current percentage is recomputed from the full entry history every time, never mutated
  directly. Means the number on screen always traces back to a real entry — no orphaned progress
  with nothing behind it.
- **AI gives confidence + reason only, never a raw delta or percentage.** Python does
  `delta = min(1 - current_fill, round(confidence * 0.22, 2))` — clamped so progress never exceeds
  100% or goes backwards, regardless of what the model returns. Trust the math to code, not the
  model.
- **`process_entry` and `create_goal` are shared functions** in `main.py`, called by both the CLI's
  input loop and the FastAPI routes — "what happens when you log an entry / create a goal" exists
  in exactly one place, not duplicated between the terminal and the API.
- **The concept graph is homegrown (d3-force + SVG), not Obsidian's.** Tried exporting Obsidian's
  graph view via a community plugin first — unreliable, and a manual export step that goes stale
  the moment a new entry is logged. Since `concepts[].related` is already graph edge data sitting in
  `journal.json`, rendering it directly in React means the graph is always current, no export step,
  no external dependency.
- **IDs are simple counters** (`g1`, `s1`, `e1`...), not UUIDs — no real need for global uniqueness
  at this scale.

## Known rough edges

- `progress.js`'s `daysAgo`/`isDormant` (frontend) still reference a hardcoded mock `TODAY` instead
  of the real fetched `today` — doesn't crash anything, just means "last entry N days ago" text
  could be wrong. Same class of bug as the `findGoal`/`fillsFor` mock-data bug that *did* crash
  things — just never got fixed since it's silent.
- The Obsidian vault export (`/map`) still works and is genuinely useful for browsing notes in
  Obsidian directly — just isn't the thing driving the in-app graph anymore.
- No goal-editing or goal-deletion anywhere (CLI or web) — only creation. Not a bug, just never
  built.

## Build order (for future reference)

Schema migration → AI subtask weighting → CLI wired to new schema → `progress.py` → AI progress
reading rewritten around confidence → CLI entry logging rewired around derived fills + concept
mention tracking → Obsidian export fixed for new schema → FastAPI bootstrap → `/api/state` →
`/api/entries` (shared `process_entry`) → React frontend fetching real data → concept graph +
goal creation UI.
