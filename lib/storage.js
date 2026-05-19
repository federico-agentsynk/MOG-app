// All storage operations go through server-side API routes backed by Supabase.

const call = async (path, opts = {}) => {
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
};

const post = (path, body) =>
  call(path, { method: 'POST', body: JSON.stringify(body) });

export const getWorkouts          = ()       => call('/api/data/workouts');
export const saveWorkout          = (w)      => post('/api/data/workouts', w);
export const getLastWorkoutByType = (t)      => call(`/api/data/workouts/last/${t}`);

export const getWeightLog         = ()       => call('/api/data/weight');
export const logWeight            = (e)      => post('/api/data/weight', e);

export const getMetrics           = ()       => call('/api/data/metrics');
export const saveMetrics          = (e)      => post('/api/data/metrics', e);

export const getDailyProtocol     = (date)   => call(`/api/data/protocol?date=${date}`);
export const toggleDailyProtocolItem = (date, itemId) =>
  post('/api/data/protocol', { date, itemId });
export const getProtocolCompliance = async (weekDays) => {
  const { compliance } = await call(
    `/api/data/protocol/compliance?days=${weekDays.map((d) => d.key).join(',')}`,
  );
  return compliance;
};

export const getWeeklyHabits      = (week)              => call(`/api/data/habits?week=${week}`);
export const toggleWeeklyHabit    = (weekKey, dayKey, id) =>
  post('/api/data/habits', { weekKey, dayKey, habitId: id });

export const getSettings          = ()       => call('/api/data/settings');
export const saveSettings         = (s)      => post('/api/data/settings', s);

export const getPhotos            = ()       => call('/api/data/photos');
export const savePhoto            = (p)      => post('/api/data/photos', p);

export const clearAllData         = ()       => call('/api/data/clear', { method: 'DELETE' });
