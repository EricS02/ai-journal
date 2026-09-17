import { Graph, ListDashes, Notebook as NotebookIcon } from '@phosphor-icons/react';
import { entriesFor, fillsFor, goalProgress, isDormant } from '../lib/progress.js';

const OBSIDIAN_MAP = 'obsidian://open?vault=notes&file=Learning%20Map';

export default function Sidebar({
  goals, logs, screen, activeGoalId, conceptCount, entryCount, today,
  onOpenGoal, onNotebook, onConcepts,
}) {
  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-[30px] self-start border-r border-divider px-[22px] py-[30px]">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onNotebook} className="flex flex-col items-start gap-[3px] text-left">
          <span className="text-[13px] uppercase tracking-[0.14em]">Ledger</span>
          <span className="text-[11px] text-neutral-400">capability notebook</span>
        </button>
        <a
          href={OBSIDIAN_MAP}
          title="Open the learning map in Obsidian"
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-md border border-divider text-accent-300 hover:border-accent hover:bg-accent-900 hover:no-underline"
        >
          <Graph size={17} />
        </a>
      </div>

      <div className="flex flex-col gap-[10px]">
        <div className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">In progress</div>
        <div className="flex flex-col gap-[2px]">
          {goals.map((g) => {
            const fills = fillsFor(g.id, logs);
            const progress = goalProgress(g.id, fills);
            const last = entriesFor(g.id, logs)[0];
            const dormant = isDormant(last && last.date);
            const active = screen === 'detail' && activeGoalId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => onOpenGoal(g.id)}
                className={`flex w-full flex-col gap-2 rounded-r-sm border-l px-[10px] pb-3 pt-[11px] text-left hover:bg-neutral-900 ${
                  active ? 'border-accent bg-neutral-900' : 'border-neutral-800'
                } ${dormant ? 'opacity-60' : ''}`}
              >
                <span className="flex w-full items-baseline gap-[10px]">
                  <span className="flex-1 text-[13px] leading-snug">{g.title}</span>
                  <span className="text-[12px] text-accent-300">{progress}</span>
                </span>
                <span className="block h-1 w-full overflow-hidden rounded-[1px] bg-neutral-800">
                  <span className="block h-full bg-accent" style={{ width: progress + '%' }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-[2px]">
        <NavRow icon={<ListDashes size={15} />} label="Concepts" count={conceptCount} active={screen === 'concepts'} onClick={onConcepts} />
        <NavRow icon={<NotebookIcon size={15} />} label="Notebook" count={entryCount} active={screen === 'notebook'} onClick={onNotebook} />
      </div>

      <div className="mt-auto flex flex-col gap-[5px] text-[10.5px] leading-relaxed tracking-[0.03em] text-neutral-500">
        <div>local · single user</div>
        <div>{today}</div>
      </div>
    </aside>
  );
}

function NavRow({ icon, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-2 px-[10px] py-2 text-left text-[13px] hover:text-ink ${
        active ? 'text-ink' : 'text-neutral-300'
      }`}
    >
      <span className="flex items-center gap-[9px]">{icon}{label}</span>
      <span className="text-[11px] text-neutral-400">{count}</span>
    </button>
  );
}
