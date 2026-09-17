# Ledger — personal learning tracker

React + Tailwind, desktop-first, single user, local. No backend, no API calls: all data is
mock data in `src/data/mockData.js`, held in React state.

```
npm install
npm run dev
```

## The principle the UI enforces

The app measures; it does not coach. No suggested resources, no next steps, no streaks, badges,
reminders or celebration. No number appears without the entry that caused it attached to it.

## Structure

```
src/
  App.jsx                  screen state, log list, submit flow
  data/mockData.js         GOALS, LOG_ENTRIES, CONCEPTS, TODAY
  lib/progress.js          derived fills, weighted goal progress, date helpers
  lib/reader.js            readEntry() — the entry reader (swap this for the real model)
  components/
    Sidebar.jsx            in-progress goals with one total bar each; Obsidian map icon
    Notebook.jsx           the sheet: composer + What moved + entry feed
    Composer.jsx           the textarea and goal picker
    WhatMoved.jsx          post-submit readout: which checkpoints gained, by how much, why
    EntryCard.jsx          one log entry with the checkpoints it touched
    GoalDetail.jsx         segmented weighted bar + checkpoint list + evidence drilldown
    Concepts.jsx           flat searchable index, links out to Obsidian notes
```

## Progress model

Checkpoint fill is **derived, never stored**: it is the sum of the `delta` values of the log
entries whose evidence cites that checkpoint (`fillsFor`). Goal progress is the weight-normalised
sum of those fills — `Σ(weight × fill) ÷ Σ(weight)`, 0–100 (`goalProgress`). Because both are
recomputed from the log list, deleting or editing an entry cannot leave orphaned progress behind.

The goal-detail bar renders that sum literally: one segment per checkpoint, segment **width** =
its weight, segment **fill height** = its own progress.

## Replacing the reader

`readEntry({ text, goalId, logs, today })` is the only place that decides what an entry is
evidence for. It currently keyword-matches; replace its body with the real model call and keep the
return shape:

```js
{
  entry:  { id, goal_id, date, text, seq, evidence: [{ subtask_id, confidence, delta, reason }] },
  nextLogs,
  result: { goalId, moves, empty, goalBefore, goalAfter, totalWeight }
}
```

`reason` is user-facing: it is shown verbatim next to every number, both in the post-submit
readout and in the goal-detail drilldown. Write it as an explanation of the evidence, not praise.

## Design tokens

Nocturne, mapped into `tailwind.config.js`: ground `#161826`, surface `#232532`, ink
`#e9e9ed`, accent `#9184d9` with 100–900 ramps for accent and neutral, Inter at 400/500,
radii 4/8/14px, hairline-plus-ambient shadows. The accent is used as a line and a fill on progress
only — never flooded across a surface. Icons are Phosphor.

## Not built

Goal creation and checkpoint authoring (goals are seeded), persistence (state resets on reload),
and the Obsidian links assume a vault named `notes`.
