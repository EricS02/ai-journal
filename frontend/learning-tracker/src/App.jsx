import { useEffect, useMemo, useState } from 'react';
import { readEntry } from './lib/reader.js';
import Sidebar from './components/Sidebar.jsx';
import Notebook from './components/Notebook.jsx';
import GoalDetail from './components/GoalDetail.jsx';
import Concepts from './components/Concepts.jsx';
import GraphView from './components/GraphView.jsx';

export default function App() {
  const [goals, setGoals] = useState(null)
  const [logs, setLogs] = useState([])
  const [concepts, setConcepts] = useState([])
  const [today, setToday] = useState(null)
  const [screen, setScreen] = useState('notebook'); // 'notebook' | 'detail' | 'concepts'
  const [goalId, setGoalId] = useState(null);       // goal shown in detail
  const [composeGoalId, setComposeGoalId] = useState(null);
  const [result, setResult] = useState(null);
  const [draft, setDraft] = useState('');

  const openGoal = (id) => { setGoalId(id); setScreen('detail'); };
  

  async function loadState() {
    const response = await fetch('http://localhost:5000/api/state')
    const data = await response.json()
    setConcepts(data.concepts)
    setToday(data.today)
    setGoals(data.goals)
    setLogs(data.entries)
    if (data.goals && data.goals.length) {
      setGoalId(data.goals[0].id)
      setComposeGoalId(data.goals[0].id)
    }
  }
  const submit = async () => {
    const text = draft.trim(); 
    if (!text) return
    const response = await fetch('http://localhost:5000/api/entries', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({goal_id: composeGoalId, text})
    })
    const data = await response.json()
    setResult(data);
    loadState()
    setDraft('')
  };

  const createGoal = async (title) => {
    const response = await fetch('http://localhost:5000/api/goals', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ title })
    })
    const data = await response.json()
    await loadState()
    setComposeGoalId(data.id)
  };

  const feed = useMemo(() => logs, [logs]);


useEffect(() => {
  loadState()
}, [])

if (!goals) return <div className="flex min-h-screen items-center justify-center bg-ground text-ink">Loading...</div>;

  return (
    <div className="grid min-h-screen grid-cols-[264px_minmax(0,1fr)] bg-ground text-ink">
      <Sidebar
        goals={goals}
        logs={logs}
        screen={screen}
        activeGoalId={goalId}
        conceptCount={concepts.length}
        entryCount={logs.length}
        today={today}
        onOpenGoal={openGoal}
        onNotebook={() => setScreen('notebook')}
        onConcepts={() => setScreen('concepts')}
        onGraph={() => setScreen('graph')}
      />

      <main className="flex justify-center px-10 pb-24 pt-10">
        {screen === 'notebook' && (
          <Notebook
            goals={goals}
            logs={feed}
            draft={draft}
            onDraft={(v) => { setDraft(v); setResult(null); }}
            onSubmit={submit}
            composeGoalId={composeGoalId}
            onComposeGoal={(id) => { setComposeGoalId(id); setResult(null); }}
            onCreateGoal={createGoal}
            result={result}
            today={today}
            onOpenGoal={openGoal}
          />
        )}
        {screen === 'detail' && (
          <GoalDetail goalId={goalId} logs={logs} goals={goals} onBack={() => setScreen('notebook')} />
        )}
        {screen === 'concepts' && <Concepts concepts={concepts} />}
        {screen === 'graph' && <GraphView concepts={concepts} />}
      </main>
    </div>
  );
}
