import { findGoal, fillsFor, goalProgress } from './progress.js';

/**
 * Stand-in for the real entry reader.
 *
 * In the prototype this is a keyword matcher: it decides which checkpoints an
 * entry is evidence for, with what confidence, and writes the `reason` string
 * that the UI shows next to every number. Swap this one function for the real
 * model call — the rest of the app only consumes its output shape.
 */
const MATCHERS = {
    s1: { words: ['lifetime', 'ownership', 'borrow', 'move', 'reference', 'own'], phrase: 'reasoning about ownership and lifetimes in your own words' },
    s2: { words: ['read', 'source', 'crate', 'internals', 'trait bound', 'implementation'], phrase: "reading another crate's source and following its bounds" },
    s3: { words: ['compile', 'borrow checker', 'clone', 'error', 'refactor'], phrase: 'writing code that satisfied the checker by design' },
    s4: { words: ['trait', 'generic', 'enum', 'api', 'design', 'impl'], phrase: 'designing with traits and generics' },
    s5: { words: ['result', 'error', '?', 'thiserror', 'anyhow', 'unwrap'], phrase: 'typed error handling' },
    s6: { words: ['async', 'await', 'tokio', 'spawn', 'send', 'task', 'runtime'], phrase: 'async execution and its bounds' },
    s7: { words: ['profile', 'flamegraph', 'alloc', 'perf', 'throughput', 'benchmark'], phrase: 'measuring and reducing allocation cost' },
    s8: { words: ['crates.io', 'publish', 'rustdoc', 'docs.rs', 'test'], phrase: 'packaging a crate for other people' },
    t1: { words: ['attention', 'dot product', 'scaling', 'softmax', 'sqrt', '√d'], phrase: 'the attention computation itself' },
    t2: { words: ['multi-head', 'head', 'reference implementation', 'numpy', 'matches'], phrase: 'a multi-head implementation checked against a reference' },
    t3: { words: ['residual', 'layernorm', 'gradient', 'norm'], phrase: 'residual and normalisation placement' },
    t4: { words: ['train', 'loss', 'corpus', 'epoch', 'curve'], phrase: 'training and reading the loss curve' },
    t5: { words: ['top-k', 'nucleus', 'sampling', 'temperature'], phrase: 'sampling strategies and their failure modes' }};;

const MAX_MOVES = 4;

export function readEntry({ text, goalId, logs, today }) {
  const goal = findGoal(goalId);
  const fills = fillsFor(goalId, logs);
  const haystack = ' ' + text.toLowerCase() + ' ';

  const moves = [];
  goal.subtasks.forEach((s) => {
    const m = MATCHERS[s.id];
    if (!m) return;
    const hits = m.words.filter((w) => haystack.includes(w));
    if (!hits.length) return;
    const confidence = Math.min(0.8, 0.2 + hits.length * 0.15);
    const before = fills[s.id];
    const delta = Math.min(1 - before, Math.round(confidence * 0.22 * 100) / 100);
    if (delta <= 0) return;
    moves.push({
      subtask_id: s.id,
      description: s.description,
      weight: s.weight,
      confidence,
      before,
      delta,
      reason: `The entry describes ${m.phrase} — noted at "${hits.slice(0, 2).join('", "')}".`,
    });
  });

  moves.sort((a, b) => b.delta * b.weight - a.delta * a.weight);
  const top = moves.slice(0, MAX_MOVES);

  const seq = logs.filter((l) => l.seq).length + 1;
  const entry = {
    id: 'n' + seq,
    goal_id: goalId,
    date: today,
    text,
    seq,
    evidence: top.map((m) => ({
      subtask_id: m.subtask_id,
      confidence: m.confidence,
      delta: m.delta,
      reason: m.reason,
    })),
  };

  const nextLogs = [...logs, entry];
  return {
    entry,
    nextLogs,
    result: {
      goalId,
      moves: top,
      empty: top.length === 0,
      goalBefore: goalProgress(goalId, fills),
      goalAfter: goalProgress(goalId, fillsFor(goalId, nextLogs)),
      totalWeight: goal.subtasks.reduce((a, s) => a + s.weight, 0),
    },
  };
}
