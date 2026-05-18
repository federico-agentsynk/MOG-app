'use client';
import { useState, useEffect, useCallback } from 'react';
import { DAILY_PROTOCOL, WEEKLY_HABITS } from '@/lib/data';
import {
  getSettings, getDailyProtocol, toggleDailyProtocolItem,
  getWeeklyHabits, toggleWeeklyHabit,
  getWeightLog, getWorkouts, getProtocolCompliance,
} from '@/lib/storage';
import { getDaysUntilGoal, getWeekKey, getTodayKey, getWeekDays } from '@/lib/dateUtils';

export default function DashboardPage() {
  const [ready, setReady]               = useState(false);
  const [settings, setSettings]         = useState({ currentWeight: 147, targetWeight: 165 });
  const [weightLog, setWeightLog]       = useState([]);
  const [weekWorkouts, setWeekWorkouts] = useState(0);
  const [daysLeft, setDaysLeft]         = useState(0);
  const [protocol, setProtocol]         = useState({});
  const [habits, setHabits]             = useState({});
  const [compliance, setCompliance]     = useState(0);
  const [weekDays, setWeekDays]         = useState([]);
  const [todayKey, setTodayKey]         = useState('');
  const [weekKey, setWeekKey]           = useState('');

  const load = useCallback(() => {
    const wd  = getWeekDays();
    const tok = getTodayKey();
    const wk  = getWeekKey();
    setWeekDays(wd);
    setTodayKey(tok);
    setWeekKey(wk);

    const s = getSettings();
    setSettings(s);
    setDaysLeft(getDaysUntilGoal());

    const log = getWeightLog();
    setWeightLog(log);

    const workouts = getWorkouts();
    const start = wd[0]?.key || '';
    const end   = wd[6]?.key || '';
    setWeekWorkouts(workouts.filter((w) => w.date >= start && w.date <= end).length);

    setProtocol(getDailyProtocol(tok));
    setHabits(getWeeklyHabits(wk));
    setCompliance(getProtocolCompliance(wd));
    setReady(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleProtocol = (id) => {
    toggleDailyProtocolItem(todayKey, id);
    setProtocol({ ...getDailyProtocol(todayKey) });
    setCompliance(getProtocolCompliance(weekDays));
  };

  const handleHabit = (dayKey, habitId) => {
    toggleWeeklyHabit(weekKey, dayKey, habitId);
    setHabits({ ...getWeeklyHabits(weekKey) });
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading…</div>
      </div>
    );
  }

  const currentWeight = weightLog.length
    ? weightLog[weightLog.length - 1].weight
    : settings.currentWeight;
  const prevWeight = weightLog.length > 1 ? weightLog[weightLog.length - 2].weight : null;
  const weightDelta = prevWeight !== null ? (currentWeight - prevWeight) : null;
  const totalGain   = settings.targetWeight - settings.currentWeight;
  const progress    = totalGain > 0
    ? Math.min(Math.max((currentWeight - settings.currentWeight) / totalGain, 0), 1)
    : 0;

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold text-white">MOG Fitness</h1>
          <p className="text-slate-500 text-sm">{dateLabel}</p>
        </div>
        <button
          onClick={load}
          title="Refresh"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white text-lg"
        >
          ↻
        </button>
      </div>

      {/* Weight Progress */}
      <div className="bg-slate-800 rounded-2xl p-5">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">Weight Progress</p>
        <div className="flex items-center justify-around mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{currentWeight}</div>
            <div className="text-xs text-slate-500 mt-1">Current (lb)</div>
            {weightDelta !== null && (
              <div className={`text-xs font-bold mt-1 ${
                weightDelta >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {weightDelta >= 0 ? '+' : ''}{weightDelta.toFixed(1)} lb
              </div>
            )}
          </div>
          <div className="text-slate-600 text-3xl">→</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-violet-400">{settings.targetWeight}</div>
            <div className="text-xs text-slate-500 mt-1">Target (lb)</div>
          </div>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-700 to-violet-400"
            style={{ width: `${Math.max(progress * 100, 2)}%`, transition: 'width 0.6s ease' }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Started at {settings.currentWeight} lb</span>
          <span>{(settings.targetWeight - currentWeight).toFixed(1)} lb to go</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-violet-400">{daysLeft}</div>
          <div className="text-xs text-slate-500 mt-1">Days Left</div>
          <div className="text-xs text-slate-600">Oct 10, 2026</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-white">
            {weekWorkouts}<span className="text-slate-500 text-xl">/4</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Workouts</div>
          <div className="text-xs text-slate-600">This week</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-violet-400">
            {Math.round(compliance * 100)}<span className="text-slate-500 text-xl">%</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Protocol</div>
          <div className="text-xs text-slate-600">This week</div>
        </div>
      </div>

      {/* Daily Protocol */}
      <div className="bg-slate-800 rounded-2xl p-5">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Today’s Protocol</p>
        <div className="space-y-2">
          {DAILY_PROTOCOL.map((item) => {
            const done = !!protocol[item.id];
            return (
              <button
                key={item.id}
                onClick={() => handleProtocol(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${
                  done
                    ? 'bg-violet-500/20 border border-violet-500/50'
                    : 'bg-slate-700/60 border border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-violet-500 border-violet-500' : 'border-slate-500'
                }`}>
                  {done && <span className="text-white text-xs leading-none font-bold">✓</span>}
                </div>
                <span className={`text-sm ${
                  done ? 'text-slate-400 line-through' : 'text-slate-200'
                }`}>
                  {item.emoji} {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Habits Grid */}
      <div className="bg-slate-800 rounded-2xl p-5">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Weekly Habits</p>
        <div className="overflow-x-auto">
          <table className="text-xs w-full min-w-max">
            <thead>
              <tr>
                <th className="text-left text-slate-500 font-normal pb-2 pr-3 min-w-[130px]">Habit</th>
                {weekDays.map((d) => (
                  <th
                    key={d.key}
                    className={`text-center font-normal pb-2 w-10 ${
                      d.key === todayKey ? 'text-violet-400' : 'text-slate-500'
                    }`}
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEKLY_HABITS.map((habit) => (
                <tr key={habit.id}>
                  <td className="pr-3 py-1 text-slate-300 min-w-[130px] leading-tight">
                    {habit.name}
                  </td>
                  {weekDays.map((d) => {
                    const avail   = !habit.daysRestricted || habit.daysRestricted.includes(d.dayOfWeek);
                    const checked = avail && !!habits[d.key]?.[habit.id];
                    const isToday = d.key === todayKey;
                    return (
                      <td key={d.key} className="text-center py-1 w-10">
                        {avail ? (
                          <button
                            onClick={() => handleHabit(d.key, habit.id)}
                            className={`w-7 h-7 rounded-lg border-2 mx-auto flex items-center justify-center ${
                              checked
                                ? 'bg-violet-500 border-violet-500'
                                : isToday
                                ? 'border-violet-700 hover:border-violet-500'
                                : 'border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            {checked && <span className="text-white text-xs font-bold leading-none">✓</span>}
                          </button>
                        ) : (
                          <span className="text-slate-700 block text-center">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
