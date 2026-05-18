'use client';
import { useState, useEffect } from 'react';

const ms2hm = (ms) => {
  if (!ms) return '—';
  const totalMin = Math.round(ms / 60_000);
  return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
};

const scoreTheme = (score) => {
  if (score == null) return { text: 'text-slate-400', ring: 'ring-slate-600/50', bg: 'bg-slate-700/40', label: '' };
  if (score >= 67)   return { text: 'text-green-400',  ring: 'ring-green-500/40',  bg: 'bg-green-500/10',  label: 'High' };
  if (score >= 34)   return { text: 'text-yellow-400', ring: 'ring-yellow-500/40', bg: 'bg-yellow-500/10', label: 'Moderate' };
  return               { text: 'text-red-400',    ring: 'ring-red-500/40',    bg: 'bg-red-500/10',    label: 'Low' };
};

export default function WhoopWidget() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/whoop/data')
      .then((r) => r.json())
      .then((d) => { setData(d);  setLoading(false); })
      .catch(()  => { setLoading(false); });
  }, []);

  // Still fetching
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-2xl p-5 animate-pulse">
        <div className="h-3 bg-slate-700 rounded w-20 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-slate-700 rounded-xl" />
          <div className="h-24 bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  // Not connected — render nothing (settings page has the connect button)
  if (!data?.connected) return null;

  const { recovery, sleep, error } = data;
  const theme = scoreTheme(recovery?.score);

  return (
    <div className="bg-slate-800 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">WHOOP</span>
          <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
            Connected
          </span>
        </div>
        <span className="text-xs text-slate-600">Today</span>
      </div>

      {error && (
        <p className="text-xs text-slate-500 mb-3">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Recovery Score — color-coded red / yellow / green */}
        <div className={`rounded-xl p-4 ring-1 ${theme.ring} ${theme.bg}`}>
          <div className="text-xs text-slate-400 mb-1">Recovery</div>
          <div className={`text-4xl font-black leading-none ${theme.text}`}>
            {recovery?.score != null ? `${recovery.score}%` : '—'}
          </div>
          {theme.label && (
            <div className={`text-xs font-semibold mt-1 ${theme.text} opacity-70`}>{theme.label}</div>
          )}
          <div className="mt-2 space-y-0.5">
            {recovery?.hrv != null && (
              <div className="text-xs text-slate-500">HRV&nbsp;&nbsp;{recovery.hrv}&nbsp;ms</div>
            )}
            {recovery?.rhr != null && (
              <div className="text-xs text-slate-500">RHR&nbsp;&nbsp;{recovery.rhr}&nbsp;bpm</div>
            )}
          </div>
        </div>

        {/* Sleep */}
        <div className="rounded-xl p-4 ring-1 ring-violet-500/30 bg-violet-500/10">
          <div className="text-xs text-slate-400 mb-1">Deep Sleep</div>
          <div className="text-2xl font-bold text-violet-300 leading-none">
            {ms2hm(sleep?.deepSleep)}
          </div>
          <div className="mt-2 space-y-0.5">
            {sleep?.performance != null && (
              <div className="text-xs text-slate-500">{sleep.performance}%&nbsp;quality</div>
            )}
            {sleep?.remSleep != null && (
              <div className="text-xs text-slate-500">REM&nbsp;{ms2hm(sleep.remSleep)}</div>
            )}
            {sleep?.efficiency != null && (
              <div className="text-xs text-slate-500">{sleep.efficiency}%&nbsp;efficiency</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
