import { useState } from 'react';
import { ArrowUpRight, Plus, X } from '@phosphor-icons/react';
import { findGoal, shortName } from '../lib/progress.js';

/** The one input in the app: a plain textarea, read on submit. No prompts, no nudges. */
export default function Composer({ goals, draft, onDraft, onSubmit, composeGoalId, onComposeGoal, onCreateGoal, today }) {
  const goal = findGoal(goals, composeGoalId);
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const hint = words
    ? `${words} words · read against ${goal.subtasks.length} checkpoints in ${goal.title}`
    : `${today} · reads against ${goal.subtasks.length} checkpoints in ${goal.title}`;

  return (
    <div className="ml-14 border-b border-l border-divider border-l-accent-800 py-6 pl-[22px] pr-[34px]">
      <div className="flex flex-col gap-3 rounded-lg border border-divider bg-neutral-900 px-[18px] pb-[14px] pt-4 focus-within:border-accent-700">
        <textarea
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          placeholder="What did you actually do today?"
          className="min-h-[92px] w-full resize-y bg-transparent text-[15.5px] leading-[1.7] text-ink caret-accent outline-none"
        />
        <div className="flex items-center justify-between gap-4">
          <span className="min-w-0 text-[11.5px] text-neutral-500">{hint}</span>
          <div className="flex flex-none items-center gap-2">
            <GoalPicker goals={goals} value={composeGoalId} onChange={onComposeGoal} />
            <NewGoalButton onCreateGoal={onCreateGoal} />
            <button
              onClick={onSubmit}
              title="Read this entry"
              className={`flex flex-none items-center gap-2 whitespace-nowrap rounded-md border border-accent px-[14px] py-[7px] text-[13px] text-accent-300 hover:bg-accent-900 active:bg-accent-800 ${
                draft.trim() ? '' : 'opacity-45'
              }`}
            >
              <span>Read entry</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewGoalButton({ onCreateGoal }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const cancel = () => { setOpen(false); setTitle(''); };

  const confirm = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setCreating(true);
    await onCreateGoal(trimmed);
    setCreating(false);
    cancel();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Add a new goal"
        className="grid h-[26px] w-[26px] flex-none place-items-center rounded-md border border-divider text-neutral-300 hover:border-accent hover:text-accent-300"
      >
        <Plus size={13} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel(); }}
        placeholder="New goal title"
        disabled={creating}
        className="w-[160px] rounded-md border border-divider bg-neutral-900 px-2 py-[6px] text-[12px] text-ink outline-none focus:border-accent-700"
      />
      <button
        onClick={confirm}
        disabled={creating || !title.trim()}
        title="Create goal"
        className="grid h-[26px] w-[26px] flex-none place-items-center rounded-md border border-accent text-accent-300 hover:bg-accent-900 disabled:opacity-45"
      >
        <Plus size={13} />
      </button>
      <button
        onClick={cancel}
        title="Cancel"
        className="grid h-[26px] w-[26px] flex-none place-items-center rounded-md border border-divider text-neutral-400 hover:text-ink"
      >
        <X size={13} />
      </button>
    </div>
  );
}

function GoalPicker({ goals, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-[200px] truncate rounded-md border border-divider bg-neutral-900 px-3 py-[6px] text-[12px] text-neutral-300 hover:text-ink focus:outline-none focus:border-accent-700"
    >
      {goals.map((g) => (
        <option key={g.id} value={g.id}>{g.title}</option>
      ))}
    </select>
  );
}
