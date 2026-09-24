import { byNewest, shortName } from '../lib/progress.js';
import Composer from './Composer.jsx';
import WhatMoved from './WhatMoved.jsx';
import EntryCard from './EntryCard.jsx';

/** The main screen: one sheet, composer at the top, entries flowing down it. */
export default function Notebook({
  goals, logs, draft, onDraft, onSubmit, composeGoalId, onComposeGoal, onCreateGoal, result, today, onOpenGoal,
}) {
  const feed = [...logs].sort(byNewest);

  return (
    <div className="w-full max-w-[780px] overflow-hidden rounded-lg bg-surface shadow-sm">
      <div className="flex items-baseline justify-between gap-5 border-b border-divider pb-5 pl-[78px] pr-[34px] pt-[26px]">
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] font-medium tracking-[-0.01em]">Notebook</h1>
          <span className="text-[12px] text-neutral-400">{logs.length} entries · newest first</span>
        </div>
        <span className="text-[11px] text-neutral-400">{shortName(goals, composeGoalId)}</span>
      </div>

      <Composer
        goals={goals}
        draft={draft}
        onDraft={onDraft}
        onSubmit={onSubmit}
        composeGoalId={composeGoalId}
        onComposeGoal={onComposeGoal}
        onCreateGoal={onCreateGoal}
        today={today}
      />

      <WhatMoved result={result} onOpenGoal={onOpenGoal} />

      <div className="flex flex-col">
        {feed.map((entry) => <EntryCard key={entry.id} entry={entry} goals={goals} />)}
      </div>
    </div>
  );
}
