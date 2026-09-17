import { useMemo, useState } from 'react';
import { Graph } from '@phosphor-icons/react';

const OBSIDIAN_MAP = 'obsidian://open?vault=notes&file=Learning%20Map';
const noteHref = (name) => 'obsidian://open?vault=notes&file=' + encodeURIComponent(name);

/** A flat, searchable list — deliberately not a visualisation. */
export default function Concepts({ concepts }) {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return concepts
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.related.some((r) => r.toLowerCase().includes(q)))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [concepts, query]);

  return (
    <div className="w-full max-w-[880px] rounded-lg bg-surface px-10 pb-10 pt-[30px] shadow-sm">
      <header className="mb-[22px] flex items-start justify-between gap-6">
        <div className="flex flex-col gap-[6px]">
          <h1 className="text-[25px] font-medium tracking-[-0.02em]">Concepts</h1>
          <p className="max-w-[60ch] text-[13.5px] text-neutral-400">
            Every named thing that has appeared in an entry. First seen, times mentioned, and the note it opens.
          </p>
        </div>
        <a
          href={OBSIDIAN_MAP}
          title="Open the learning map in Obsidian"
          className="flex flex-none items-center gap-2 rounded-md border border-divider px-[13px] py-[7px] text-[12.5px] text-accent-300 hover:border-accent hover:bg-accent-900 hover:no-underline"
        >
          <Graph size={15} />Learning map
        </a>
      </header>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter"
        className="mb-6 w-[300px] border-b border-divider bg-transparent px-[2px] py-[9px] text-[13.5px] text-ink caret-accent outline-none"
      />

      <div className="grid grid-cols-[minmax(0,1fr)_96px_62px_58px] gap-5 px-1 pb-2 text-[10px] uppercase tracking-[0.1em] text-neutral-400">
        <span>Concept</span><span>First seen</span><span>Mentions</span><span />
      </div>

      <div className="flex flex-col">
        {rows.map((c) => (
          <div key={c.name} className="grid grid-cols-[minmax(0,1fr)_96px_62px_58px] items-baseline gap-5 border-t border-divider px-1 py-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[14.5px]">{c.name}</span>
              <span className="text-[12px] text-neutral-500">{c.related.join(' · ')}</span>
            </div>
            <span className="text-[11.5px] text-neutral-400">{c.first_seen}</span>
            <span className="text-[11.5px] text-neutral-200">{c.mention_count}</span>
            <a href={noteHref(c.name)} title="Open in Obsidian" className="whitespace-nowrap text-right text-[11.5px]">note &nearr;</a>
          </div>
        ))}
        <div className="border-t border-divider" />
      </div>

      {rows.length === 0 && (
        <div className="px-1 py-[18px] text-[13px] text-neutral-400">No concept matches that filter.</div>
      )}
    </div>
  );
}
