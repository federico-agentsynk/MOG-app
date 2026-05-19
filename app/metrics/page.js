'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { logWeight, getWeightLog, saveMetrics, getMetrics, savePhoto, getPhotos } from '@/lib/storage';
import { getTodayKey, formatShortDate } from '@/lib/dateUtils';

const FIELDS = [
  ['neck', 'Neck'], ['chest', 'Chest'], ['armsFlexed', 'Arms (Flexed)'],
  ['shoulders', 'Shoulders'], ['waist', 'Waist'],
];
const EMPTY_M = { neck: '', chest: '', armsFlexed: '', shoulders: '', waist: '' };

export default function MetricsPage() {
  const [weightInput, setWeightInput] = useState('');
  const [weightLog, setWeightLog] = useState([]);
  const [meas, setMeas] = useState(EMPTY_M);
  const [measSaved, setMeasSaved] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [cmpA, setCmpA] = useState(0);
  const [cmpB, setCmpB] = useState(1);
  const fileRef = useRef();

  const load = useCallback(async () => {
    try {
      const [log, metrics, ph] = await Promise.all([getWeightLog(), getMetrics(), getPhotos()]);
      setWeightLog(log);
      if (metrics.length > 0) {
        const last = metrics[metrics.length - 1];
        setMeas({ neck: last.neck ?? '', chest: last.chest ?? '', armsFlexed: last.armsFlexed ?? '', shoulders: last.shoulders ?? '', waist: last.waist ?? '' });
      }
      setPhotos(ph);
    } catch (err) { console.error('Metrics load:', err); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogWeight = async () => {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) return;
    try {
      await logWeight({ date: getTodayKey(), weight: w });
      setWeightInput('');
      setWeightLog(await getWeightLog());
    } catch (err) { console.error(err); }
  };

  const handleSaveMeas = async () => {
    try {
      await saveMetrics({ date: getTodayKey(), ...meas });
      setMeasSaved(true);
      setTimeout(() => setMeasSaved(false), 2000);
    } catch (err) { console.error(err); }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await savePhoto({ uri: ev.target.result, date: getTodayKey() });
        const updated = await getPhotos();
        setPhotos(updated);
        if (updated.length === 2) setCmpB(1);
      } catch (err) { console.error(err); }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const displayLog = weightLog.slice(-10);
  const chartData = displayLog.map((e) => ({ date: formatShortDate(e.date), weight: +e.weight }));
  const hasChart = chartData.length >= 2;
  const latestEntry = weightLog[weightLog.length - 1];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-white pt-4">Metrics</h1>
      <div className="bg-slate-800 rounded-2xl p-5">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Log Weight</p>
        <div className="flex gap-2">
          <input type="number" inputMode="decimal" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogWeight()} placeholder="Weight (lb)" className="flex-1 bg-slate-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <button onClick={handleLogWeight} className="px-5 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold">Log</button>
        </div>
        {latestEntry && <p className="text-slate-500 text-xs mt-2">Last logged: <span className="text-slate-300">{latestEntry.weight} lb</span> on {formatShortDate(latestEntry.date)}</p>}
      </div>
      {hasChart && (
        <div className="bg-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Weight Trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} labelStyle={{ color: '#94a3b8' }} />
              <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6, fill: '#a78bfa' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="bg-slate-800 rounded-2xl p-5">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Body Measurements (inches)</p>
        <div className="space-y-3">
          {FIELDS.map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <label className="text-slate-300 text-sm w-32 flex-shrink-0">{label}</label>
              <input type="number" inputMode="decimal" step="0.1" value={meas[key]} onChange={(e) => setMeas((p) => ({ ...p, [key]: e.target.value }))} placeholder="0.0" className="flex-1 bg-slate-700 text-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          ))}
          <button onClick={handleSaveMeas} className={`w-full py-3 rounded-xl text-white font-semibold mt-2 ${measSaved ? 'bg-green-600' : 'bg-violet-600 hover:bg-violet-500'}`}>
            {measSaved ? 'Saved!' : 'Save Measurements'}
          </button>
        </div>
      </div>
      <div className="bg-slate-800 rounded-2xl p-5">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Progress Photos</p>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="w-full py-4 border-2 border-dashed border-slate-600 hover:border-violet-500 rounded-xl text-slate-400 hover:text-violet-400 font-medium mb-4">Add Progress Photo</button>
        {photos.length >= 2 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Side-by-side comparison</p>
            <div className="flex gap-2">
              {[cmpA, cmpB].map((idx, col) => (
                <div key={col} className="flex-1">
                  <img src={photos[idx]?.uri} alt="" className="w-full h-44 object-cover rounded-xl" />
                  <p className="text-xs text-slate-500 text-center mt-1">{photos[idx]?.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, idx) => (
            <button key={photo.id ?? idx} onClick={() => setCmpB(idx)} onContextMenu={(e) => { e.preventDefault(); setCmpA(idx); }} className={`relative rounded-xl overflow-hidden border-2 aspect-square ${idx === cmpA ? 'border-yellow-400' : idx === cmpB ? 'border-violet-500' : 'border-transparent'}`}>
              <img src={photo.uri} alt={photo.date} className="w-full h-full object-cover" />
              {(idx === cmpA || idx === cmpB) && <div className="absolute bottom-0 inset-x-0 bg-black/50 text-xs text-center py-0.5 text-white">{idx === cmpA ? 'L' : 'R'}</div>}
            </button>
          ))}
        </div>
        {photos.length === 0 && <p className="text-slate-600 text-sm text-center py-6">No photos yet. Add your first one!</p>}
      </div>
    </div>
  );
}
