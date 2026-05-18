'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, clearAllData } from '@/lib/storage';

const TOGGLES = [
  ['notifyMorning',   'Morning Protocol (8am)'],
  ['notifyCheckin',   'Daily Check-In (8pm)'],
  ['notifyNighttime', 'Nighttime Stack (10pm)'],
  ['notifyWorkout',   'Workout Reminder (48hr gap)'],
  ['notifyWeighIn',   'Monday Weigh-In'],
];

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full flex-shrink-0 ${
        value ? 'bg-violet-600' : 'bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${
          value ? 'right-1' : 'left-1'
        }`}
        style={{ transition: 'left 0.15s, right 0.15s' }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [s,       setS]       = useState(null);
  const [saved,   setSaved]   = useState(false);
  const [notifPerm, setNotifPerm] = useState('unknown');

  const load = useCallback(() => {
    setS(getSettings());
    if (typeof Notification !== 'undefined') setNotifPerm(Notification.permission);
  }, []);

  useEffect(() => { load(); }, [load]);

  const upd = (key, val) => setS((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const requestNotif = async () => {
    if (typeof Notification === 'undefined') return;
    const res = await Notification.requestPermission();
    setNotifPerm(res);
  };

  const testNotif = () => {
    if (typeof Notification === 'undefined') return alert('Notifications not supported in this browser.');
    if (Notification.permission !== 'granted') return alert('Please enable notifications first.');
    new Notification('MOG Fitness', { body: 'Notifications are working! 💪' });
  };

  const handleClear = () => {
    if (confirm('Permanently delete ALL data (workouts, weights, photos, settings)?\n\nThis cannot be undone.')) {
      clearAllData();
      load();
      alert('All data cleared.');
    }
  };

  if (!s) return null;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-white pt-4">Settings</h1>

      {/* Goal Settings */}
      <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Goal Settings</p>

        <div className="flex items-center justify-between">
          <label className="text-slate-300 text-sm">Starting Weight (lb)</label>
          <input
            type="number"
            inputMode="decimal"
            value={s.currentWeight}
            onChange={(e) => upd('currentWeight', parseFloat(e.target.value) || s.currentWeight)}
            className="w-24 bg-slate-700 text-white text-right rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-slate-300 text-sm">Target Weight (lb)</label>
          <input
            type="number"
            inputMode="decimal"
            value={s.targetWeight}
            onChange={(e) => upd('targetWeight', parseFloat(e.target.value) || s.targetWeight)}
            className="w-24 bg-slate-700 text-white text-right rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-slate-300 text-sm">Goal Date</label>
          <input
            type="date"
            value={s.goalDate}
            onChange={(e) => upd('goalDate', e.target.value)}
            className="bg-slate-700 text-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Notification Times */}
      <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Reminder Times</p>
        {[
          ['morningTime',   'Morning Protocol'],
          ['checkinTime',   'Daily Check-In'],
          ['nighttimeTime', 'Nighttime Stack'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-slate-300 text-sm">{label}</label>
            <input
              type="time"
              value={s[key]}
              onChange={(e) => upd(key, e.target.value)}
              className="bg-slate-700 text-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        ))}
      </div>

      {/* Notification Toggles */}
      <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Notifications</p>
          {notifPerm !== 'granted' && (
            <button onClick={requestNotif} className="text-xs text-violet-400 hover:text-violet-300">
              Enable in browser →
            </button>
          )}
        </div>
        {TOGGLES.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">{label}</span>
            <Toggle value={!!s[key]} onChange={(v) => upd(key, v)} />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="bg-slate-800 rounded-2xl p-5 space-y-3">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">Actions</p>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl text-white font-semibold ${
            saved ? 'bg-green-600' : 'bg-violet-600 hover:bg-violet-500'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>

        <button
          onClick={testNotif}
          className="w-full py-3 rounded-xl border border-violet-600 text-violet-400 hover:bg-violet-900/30 font-semibold"
        >
          🔔 Send Test Notification
        </button>

        <div className="border-t border-slate-700 pt-3">
          <button
            onClick={handleClear}
            className="w-full py-3 rounded-xl bg-red-900/40 border border-red-800 text-red-400 hover:bg-red-900/60 font-semibold"
          >
            🗑️ Clear All Data
          </button>
          <p className="text-xs text-slate-600 text-center mt-2">This cannot be undone</p>
        </div>
      </div>
    </div>
  );
}
