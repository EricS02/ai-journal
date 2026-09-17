import { ArrowUpRight } from '@phosphor-icons/react';
import { findGoal, shortName } from '../lib/progress.js';

/** The one input in the app: a plain textarea, read on submit. No prompts, no nudges. */
export default function Composer({ goals, draft, onDraft, onSubmit, composeGoalId, onComposeGoal, today }) {
  const goal = findGoal(composeGoalId);
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

function GoalPicker({ goals, value, onChange }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-divider">
      {goals.map((g) => (
        <button
          key={g.id}
          onClick={() => onChange(g.id)}
          className={`px-3 py-[6px] text-[12px] hover:text-ink ${
            value === g.id ? 'bg-accent-900 text-accent-200' : 'text-neutral-300'
          }`}
        >
          {shortName(g.id)}
        </button>
      ))}
    </div>
  );
}
