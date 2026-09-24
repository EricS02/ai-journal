import { GOALS, TODAY } from '../data/mockData.js';

export const findGoal = (goals, id) => goals.find((g) => g.id === id);

export const pct = (v) => Math.round(v * 100);

/** Checkpoint fills for a goal, derived from the log entries that cite them. */
export function fillsFor(goals, goalId, logs) {
  const goal = findGoal(goals, goalId);
  const out = {};
  goal.subtasks.forEach((s) => { out[s.id] = 0; });
  logs
    .filter((l) => l.goal_id === goalId)
    .forEach((l) => l.evidence.forEach((e) => {
      if (out[e.subtask_id] !== undefined) out[e.subtask_id] = Math.min(1, out[e.subtask_id] + e.delta);
    }));
  return out;
}

/** 0-100, weight-normalised: sum(weight * fill) / sum(weight). */
export function goalProgress(goals, goalId, fills) {
  const goal = findGoal(goals, goalId);
  const total = goal.subtasks.reduce((a, s) => a + s.weight, 0);
  const sum = goal.subtasks.reduce((a, s) => a + s.weight * fills[s.id], 0);
  return Math.round((sum / total) * 100);
}

export const byNewest = (a, b) => {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return (b.seq || 0) - (a.seq || 0);
};

export function entriesFor(goalId, logs) {
  return logs.filter((l) => l.goal_id === goalId).sort(byNewest);
}

export function daysAgo(date) {
  const d = Math.round((new Date(TODAY) - new Date(date)) / 86400000);
  if (d <= 0) return 'last entry today';
  if (d === 1) return 'last entry yesterday';
  return `last entry ${d} days ago`;
}

export const isDormant = (lastDate) =>
  !lastDate || (new Date(TODAY) - new Date(lastDate)) / 86400000 > 7;

export const shortName = (goals, goalId) => {
  const goal = goals.find((g) => g.id === goalId);
  return goal ? goal.title : goalId
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function dayStamp(date) {
  const d = new Date(date);
  return { day: String(d.getUTCDate()).padStart(2, '0'), month: MONTHS[d.getUTCMonth()] };
}
