import { dayStamp, findGoal, pct, shortName } from '../lib/progress.js';

export default function EntryCard({ entry, goals }) {
  const { day, month } = dayStamp(entry.date);
  const goal = findGoal(goals, entry.goal_id);

  return (
    <article className="grid grid-cols-[56px_minmax(0,1fr)] gap-[22px] border-b border-divider pb-[26px] pl-[22px] pr-[34px] pt-6">
      <div className="flex flex-col gap-1 pt-[3px] text-right text-[11px] text-neutral-400">
        <span className="text-neutral-200">{day}</span>
        <span>{month}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-[13px] border-l border-accent-800 pl-[22px]">
        <div className="flex items-baseline gap-[10px] text-[11px] text-neutral-400">
          <span>{shortName(goals, entry.goal_id)}</span>
          <span className="text-neutral-500">{entry.date}</span>
        </div>
        <p className="text-[14.5px] leading-[1.75] text-pretty">{entry.text}</p>
        <div className="flex flex-col gap-[6px]">
          {entry.evidence.length === 0 && (
            <div className="text-[12.5px] text-neutral-500">No checkpoint evidence.</div>
          )}
          {entry.evidence.map((e) => (
            <div key={e.subtask_id} className="flex items-baseline gap-3 text-[12.5px] text-neutral-300">
              <span className="w-10 flex-none text-accent-300">+{pct(e.delta)}</span>
              <span className="leading-snug">
                {(goal.subtasks.find((s) => s.id === e.subtask_id) || {}).description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
