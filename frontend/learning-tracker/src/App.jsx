import { useMemo, useState } from 'react';
import { GOALS, LOG_ENTRIES, CONCEPTS, TODAY } from './data/mockData.js';
import { readEntry } from './lib/reader.js';
import Sidebar from './components/Sidebar.jsx';
import Notebook from './components/Notebook.jsx';
import GoalDetail from './components/GoalDetail.jsx';
import Concepts from './components/Concepts.jsx';

export default function App() {
  const [screen, setScreen] = useState('notebook'); // 'notebook' | 'detail' | 'concepts'
  const [goalId, setGoalId] = useState(GOALS[0].id);       // goal shown in detail
  const [composeGoalId, setComposeGoalId] = useState(GOALS[0].id);
  const [logs, setLogs] = useState(LOG_ENTRIES);
  const [result, setResult] = useState(null);
  const [draft, setDraft] = useState('');

  const openGoal = (id) => { setGoalId(id); setScreen('detail'); };

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    const { nextLogs, result: r } = readEntry({ text, goalId: composeGoalId, logs, today: TODAY });
    setLogs(nextLogs);
    setResult(r);
    setDraft('');
  };

  const feed = useMemo(() => logs, [logs]);

  return (
    <div className="grid min-h-screen grid-cols-[264px_minmax(0,1fr)] bg-ground text-ink">
      <Sidebar
        goals={GOALS}
        logs={logs}
        screen={screen}
        activeGoalId={goalId}
        conceptCount={CONCEPTS.length}
        entryCount={logs.length}
        today={TODAY}
        onOpenGoal={openGoal}
        onNotebook={() => setScreen('notebook')}
        onConcepts={() => setScreen('concepts')}
      />

      <main className="flex justify-center px-10 pb-24 pt-10">
        {screen === 'notebook' && (
          <Notebook
            goals={GOALS}
            logs={feed}
            draft={draft}
            onDraft={(v) => { setDraft(v); setResult(null); }}
            onSubmit={submit}
            composeGoalId={composeGoalId}
            onComposeGoal={(id) => { setComposeGoalId(id); setResult(null); }}
            result={result}
            today={TODAY}
            onOpenGoal={openGoal}
          />
        )}
        {screen === 'detail' && (
          <GoalDetail goalId={goalId} logs={logs} onBack={() => setScreen('notebook')} />
        )}
        {screen === 'concepts' && <Concepts concepts={CONCEPTS} />}
      </main>
    </div>
  );
}
