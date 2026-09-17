import { useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { entriesFor, fillsFor, findGoal, goalProgress, pct } from '../lib/progress.js';

/**
 * Progress read as a sum: one segment per checkpoint, segment WIDTH is its
 * weight, segment FILL HEIGHT is its own progress. Click a segment or a row to
 * read every entry that gave it evidence, with confidence and stored reason.
 */
export default function GoalDetail({ goalId, logs, onBack }) {
  const [expanded, setExpanded] = useState(null);
  const goal = findGoal(goalId);
  const fills = fillsFor(goalId, logs);
  const entries = entriesFor(goalId, logs);
  const progress = goalProgress(goalId, fills);
  const toggle = (id) => setExpanded((cur) => (cur === id ? null : id));

  return (
    <div className="w-full max-w-[900px] rounded-lg bg-surface px-10 pb-11 pt-[30px] shadow-sm">
      <button onClick={onBack} className="mb-[22px] flex items-center gap-2 text-[11.5px] uppercase tracking-[0.06em] text-neutral-400 hover:text-accent-300">
        <ArrowLeft size={13} />notebook
      </button>

      <h1 className="mb-[30px] max-w-[30ch] text-[25px] font-medium leading-tight tracking-[-0.02em]">{goal.title}</h1>

      <section className="mb-10">
        <div className="mb-[14px] flex items-end gap-[14px]">
          <span className="text-[40px] leading-none text-accent-200">{progress}</span>
          <span className="pb-1 text-[14px] text-neutral-400">% of this goal</span>
        </div>

        <div className="mb-2 flex h-[34px] gap-[3px]">
          {goal.subtasks.map((s) => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              title={`${s.description} — weight ${s.weight}, fill ${pct(fills[s.id])}%`}
              style={{ flex: `${s.weight} 1 0` }}
              className={`relative overflow-hidden rounded-b-[2px] border-t bg-neutral-800 hover:bg-neutral-700 ${
                expanded === s.id ? 'border-accent-200' : 'border-transparent'
              }`}
            >
              <div className="absolute inset-x-0 bottom-0 bg-accent" style={{ height: pct(fills[s.id]) + '%' }} />
            </button>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {goal.subtasks.map((s, i) => (
            <div key={s.id} style={{ flex: `${s.weight} 1 0` }} className="overflow-hidden whitespace-nowrap text-[10px] text-neutral-500">
              {String(i + 1).padStart(2, '0')}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="grid grid-cols-[minmax(0,1fr)_84px_132px] gap-5 px-1 pb-2 text-[10px] uppercase tracking-[0.1em] text-neutral-400">
          <span>Checkpoint — what I'll be able to do</span>
          <span>Weight</span>
          <span>Fill</span>
        </div>

        {goal.subtasks.map((s, i) => {
          const evidence = [];
          entries.forEach((l) => l.evidence.forEach((e) => {
            if (e.subtask_id === s.id) evidence.push({ ...e, date: l.date, text: l.text });
          }));
          const open = expanded === s.id;
          return (
            <div key={s.id} className="border-t border-divider">
              <button
                onClick={() => toggle(s.id)}
                className={`grid w-full grid-cols-[minmax(0,1fr)_84px_132px] items-center gap-5 px-1 py-[15px] text-left hover:bg-neutral-900 ${
                  open ? 'bg-neutral-900' : ''
                }`}
              >
                <span className="flex min-w-0 items-baseline gap-[11px]">
                  <span className="text-[11px] text-neutral-500">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[14.5px] leading-snug text-pretty">{s.description}</span>
                </span>
                <span className="text-[12px] text-neutral-300">{s.weight} / 5</span>
                <span className="flex items-center gap-[10px]">
                  <span className="h-1 flex-1 overflow-hidden rounded-[1px] bg-neutral-800">
                    <span className="block h-full bg-accent" style={{ width: pct(fills[s.id]) + '%' }} />
                  </span>
                  <span className="w-[34px] text-right text-[12px] text-neutral-200">{pct(fills[s.id])}</span>
                </span>
              </button>

              {open && (
                <div className="flex flex-col pb-7 pl-[34px] pr-1 pt-1">
                  <div className="pb-3 text-[10.5px] uppercase tracking-[0.06em] text-neutral-400">
                    {evidence.length} {evidence.length === 1 ? 'entry' : 'entries'} read as evidence · sums to {pct(fills[s.id])} of 100
                  </div>
                  {evidence.length === 0 && (
                    <div className="border-t border-divider pt-3 text-[13px] text-neutral-400">
                      No entry has been read as evidence for this checkpoint. Fill 0.
                    </div>
                  )}
                  {evidence.map((e, n) => (
                    <div key={n} className="grid grid-cols-[96px_minmax(0,1fr)] gap-[22px] border-t border-divider py-[14px]">
                      <div className="flex flex-col gap-[5px] text-[11.5px] text-neutral-400">
                        <span>{e.date}</span>
                        <span className="text-accent-300">+{pct(e.delta)}</span>
                        <span>conf {e.confidence.toFixed(2)}</span>
                      </div>
                      <div className="flex min-w-0 flex-col gap-[9px]">
                        <div className="text-[13.5px] leading-relaxed text-accent-300 text-pretty">{e.reason}</div>
                        <div className="border-l border-divider pl-[14px] text-[13px] leading-relaxed text-neutral-300 text-pretty">{e.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="border-t border-divider" />
      </section>
    </div>
  );
}
