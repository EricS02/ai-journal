import { pct } from '../lib/progress.js';

/**
 * The payoff after an entry is read: which checkpoints gained, by how much,
 * and the stored reason for each. Specific, not congratulatory.
 */
export default function WhatMoved({ result, onOpenGoal }) {
  if (!result) return null;

  if (result.empty) {
    return (
      <div className="max-w-[66ch] border-b border-divider bg-neutral-900 py-6 pl-[78px] pr-[34px] text-[13.5px] leading-relaxed text-neutral-300">
        Nothing moved. The entry was read against every checkpoint in this goal and matched none of
        them with enough confidence. It is stored below as written.
      </div>
    );
  }

  const { moves, totalWeight } = result;

  return (
    <div className="border-b border-divider bg-neutral-900 pb-[30px] pl-[78px] pr-[34px] pt-[26px]">
      <div className="mb-[6px] text-[10px] uppercase tracking-[0.12em] text-neutral-400">What moved</div>
      <div className="mb-5 max-w-[62ch] text-[13.5px] leading-relaxed text-neutral-300">
        {moves.length} {moves.length === 1 ? 'checkpoint' : 'checkpoints'} found evidence in the entry
        just written. It is stored below, and every figure here stays attached to it.
      </div>

      <div className="flex flex-col">
        {moves.map((m) => (
          <div key={m.subtask_id} className="grid grid-cols-[minmax(0,1fr)_176px] items-start gap-6 border-t border-divider py-4">
            <div className="flex min-w-0 flex-col gap-[7px]">
              <div className="text-[14.5px] leading-snug text-pretty">{m.description}</div>
              <div className="text-[13px] leading-relaxed text-accent-300 text-pretty">{m.reason}</div>
              <div className="text-[11.5px] text-neutral-400">
                confidence {m.confidence.toFixed(2)} · weight {m.weight} · contributes +
                {(Math.round((m.delta * m.weight) / totalWeight * 1000) / 10).toFixed(1)} to the goal
              </div>
            </div>
            <div className="flex flex-col gap-[7px]">
              <div className="flex items-baseline gap-2 text-[12px]">
                <span className="text-neutral-400">{pct(m.before)}</span>
                <span className="text-neutral-500">&rarr;</span>
                <span className="text-accent-200">{pct(m.before + m.delta)}</span>
                <span className="text-accent-300">+{pct(m.delta)}</span>
              </div>
              <div className="relative h-[5px] overflow-hidden rounded-[1px] bg-neutral-800">
                <div className="absolute inset-y-0 left-0 bg-accent-700" style={{ width: pct(m.before) + '%' }} />
                <div className="absolute inset-y-0 bg-accent-400" style={{ left: pct(m.before) + '%', width: pct(m.delta) + '%' }} />
              </div>
            </div>
          </div>
        ))}
        <div className="border-t border-divider" />
      </div>

      <div className="mt-[18px] flex flex-wrap items-center gap-[14px]">
        <span className="text-[12px] text-neutral-400">
          goal {result.goalBefore} &rarr; <span className="text-accent-200">{result.goalAfter}</span> · Σ(weight × fill) ÷ {totalWeight}
        </span>
        <button
          onClick={() => onOpenGoal(result.goalId)}
          className="rounded-md border border-divider px-[13px] py-[6px] text-[12.5px] text-neutral-200 hover:border-accent hover:text-accent-300"
        >
          Open goal detail
        </button>
      </div>
    </div>
  );
}
