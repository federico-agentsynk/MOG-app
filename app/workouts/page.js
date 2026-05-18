'use client';
import { useState } from 'react';
import { PUSH_DAY_EXERCISES, PULL_DAY_EXERCISES } from '@/lib/data';
import { saveWorkout, getLastWorkoutByType } from '@/lib/storage';
import { getTodayKey } from '@/lib/dateUtils';

const SET_COUNT = 3;
const emptySet   = () => ({ weight: '', reps: '' });
const buildSets  = (exs) =>
  Object.fromEntries(exs.map((e) => [e.id, Array.from({ length: SET_COUNT }, emptySet)]));

export default function WorkoutsPage() {
  const [type, setType]           = useState(null);   // 'push' | 'pull'
  const [sets, setSets]           = useState({});
  const [lastSess, setLastSess]   = useState(null);
  const [done, setDone]           = useState(false);
  const [prs, setPrs]             = useState(0);

  const exercises = type === 'push' ? PUSH_DAY_EXERCISES : type === 'pull' ? PULL_DAY_EXERCISES : [];

  const start = (t) => {
    const exs = t === 'push' ? PUSH_DAY_EXERCISES : PULL_DAY_EXERCISES;
    setSets(buildSets(exs));
    setLastSess(getLastWorkoutByType(t));
    setType(t);
    setDone(false);
    setPrs(0);
  };

  const cancel = () => {
    if (confirm('Cancel this workout?')) { setType(null); setLastSess(null); }
  };

  const updateSet = (exId, idx, field, val) =>
    setSets((p) => ({
      ...p,
      [exId]: p[exId].map((s, i) => (i === idx ? { ...s, [field]: val } : s)),
    }));

  const indicator = (exId) => {
    if (!lastSess) return null;
    const lastEx  = lastSess.exercises?.find((e) => e.id === exId);
    if (!lastEx) return null;
    const lastBest = Math.max(...(lastEx.sets || []).map((s) => parseFloat(s.weight) || 0));
    const curBest  = Math.max(...(sets[exId] || []).map((s) => parseFloat(s.weight) || 0));
    if (curBest === 0 || lastBest === 0) return null;
    if (curBest > lastBest) return 'up';
    if (curBest < lastBest) return 'down';
    return 'same';
  };

  const finish = () => {
    let prCount = 0;
    const exData = exercises.map((e) => {
      const ind = indicator(e.id);
      if (ind === 'up') prCount++;
      return { id: e.id, name: e.name, sets: sets[e.id] || [], progressIndicator: ind };
    });
    saveWorkout({
      id:        Date.now().toString(),
      type,
      date:      getTodayKey(),
      exercises: exData,
      prs:       prCount,
    });
    setPrs(prCount);
    setDone(true);
  };

  /* ---- Complete screen ---- */
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center gap-4">
        <div className="text-7xl">🏆</div>
        <h2 className="text-2xl font-bold text-white">Workout Complete!</h2>
        <p className="text-slate-400">
          {prs > 0
            ? `📈 ${prs} new personal record${prs > 1 ? 's' : ''}!`
            : 'Great session — consistency wins.'}
        </p>
        <button
          onClick={() => { setType(null); setLastSess(null); }}
          className="mt-4 px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-bold"
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  /* ---- Choose screen ---- */
  if (!type) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 gap-4">
        <h1 className="text-2xl font-bold text-white mb-4">Choose Workout</h1>
        <button
          onClick={() => start('push')}
          className="w-72 py-5 bg-violet-600 hover:bg-violet-500 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3"
        >
          <span>💪</span> Push Day
          <span className="text-sm text-violet-300 font-normal">(10 exercises)</span>
        </button>
        <button
          onClick={() => start('pull')}
          className="w-72 py-5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3"
        >
          <span>🏋️</span> Pull Day
          <span className="text-sm text-slate-400 font-normal">(9 exercises)</span>
        </button>
      </div>
    );
  }

  /* ---- Active workout ---- */
  return (
    <div className="flex flex-col h-dvh">
      {/* sticky header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-white">
          {type === 'push' ? '💪 Push Day' : '🏋️ Pull Day'}
        </h1>
        <button onClick={cancel} className="text-red-400 hover:text-red-300 text-sm">
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">
        {exercises.map((ex) => {
          const ind     = indicator(ex.id);
          const lastEx  = lastSess?.exercises?.find((e) => e.id === ex.id);
          const bestSet = lastEx?.sets?.reduce(
            (best, s) => (parseFloat(s.weight) || 0) > (parseFloat(best?.weight) || 0) ? s : best,
            null,
          );

          return (
            <div key={ex.id} className="bg-slate-800 rounded-2xl p-4">
              {/* Exercise header */}
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white text-sm">{ex.name}</h3>
                {ind && (
                  <span className={`text-xs font-bold ${
                    ind === 'up' ? 'text-green-400' : ind === 'same' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {ind === 'up' ? '▲ PR' : ind === 'same' ? '● Same' : '▼ Down'}
                  </span>
                )}
              </div>

              {bestSet && (
                <p className="text-slate-500 text-xs mb-3">
                  Last best: {bestSet.weight}lb × {bestSet.reps} reps
                </p>
              )}

              {/* Column headers */}
              <div className="grid grid-cols-[2rem_1fr_1fr] gap-2 text-xs text-slate-500 mb-2">
                <span className="text-center">Set</span>
                <span className="text-center">Weight (lb)</span>
                <span className="text-center">Reps</span>
              </div>

              {/* Set rows */}
              {(sets[ex.id] || []).map((s, idx) => (
                <div key={idx} className="grid grid-cols-[2rem_1fr_1fr] gap-2 mb-2 items-center">
                  <span className="text-slate-500 text-xs text-center">{idx + 1}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={s.weight}
                    onChange={(e) => updateSet(ex.id, idx, 'weight', e.target.value)}
                    placeholder="0"
                    className="bg-slate-700 text-white text-center rounded-lg p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.reps}
                    onChange={(e) => updateSet(ex.id, idx, 'reps', e.target.value)}
                    placeholder="0"
                    className="bg-slate-700 text-white text-center rounded-lg p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ))}
            </div>
          );
        })}

        <button
          onClick={finish}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 rounded-2xl text-white font-bold text-lg"
        >
          Complete Workout 🎯
        </button>
      </div>
    </div>
  );
}
