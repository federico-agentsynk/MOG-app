const KEYS = {
  WORKOUTS:       'mog_workouts',
  WEIGHT_LOG:     'mog_weight_log',
  METRICS:        'mog_metrics',
  SETTINGS:       'mog_settings',
  DAILY_PROTOCOL: 'mog_daily_protocol',
  WEEKLY_HABITS:  'mog_weekly_habits',
  PHOTOS:         'mog_photos',
};

const ok = () => typeof window !== 'undefined';

const get = (key) => {
  if (!ok()) return null;
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};

const set = (key, val) => {
  if (!ok()) return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// ── Workouts ───────────────────────────────────────────────────────────────
export const saveWorkout = (workout) => {
  const list = get(KEYS.WORKOUTS) || [];
  list.unshift(workout);
  set(KEYS.WORKOUTS, list);
};

export const getWorkouts = () => get(KEYS.WORKOUTS) || [];

export const getLastWorkoutByType = (type) =>
  (get(KEYS.WORKOUTS) || []).find((w) => w.type === type) || null;

// ── Weight ─────────────────────────────────────────────────────────────────
export const logWeight = (entry) => {
  const log = get(KEYS.WEIGHT_LOG) || [];
  const idx = log.findIndex((e) => e.date === entry.date);
  if (idx >= 0) log[idx] = entry;
  else log.push(entry);
  log.sort((a, b) => a.date.localeCompare(b.date));
  set(KEYS.WEIGHT_LOG, log);
};

export const getWeightLog = () => get(KEYS.WEIGHT_LOG) || [];

// ── Body Metrics ───────────────────────────────────────────────────────────
export const saveMetrics = (entry) => {
  const list = get(KEYS.METRICS) || [];
  const idx = list.findIndex((e) => e.date === entry.date);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  list.sort((a, b) => a.date.localeCompare(b.date));
  set(KEYS.METRICS, list);
};

export const getMetrics = () => get(KEYS.METRICS) || [];

// ── Daily Protocol ─────────────────────────────────────────────────────────
export const getDailyProtocol = (dateKey) => {
  const all = get(KEYS.DAILY_PROTOCOL) || {};
  return all[dateKey] || {};
};

export const toggleDailyProtocolItem = (dateKey, itemId) => {
  const all = get(KEYS.DAILY_PROTOCOL) || {};
  if (!all[dateKey]) all[dateKey] = {};
  all[dateKey][itemId] = !all[dateKey][itemId];
  set(KEYS.DAILY_PROTOCOL, all);
};

export const getProtocolCompliance = (weekDays) => {
  const all = get(KEYS.DAILY_PROTOCOL) || {};
  let total = 0, done = 0;
  for (const d of weekDays) {
    total += 5;
    done += Object.values(all[d.key] || {}).filter(Boolean).length;
  }
  return total > 0 ? done / total : 0;
};

// ── Weekly Habits ──────────────────────────────────────────────────────────
export const getWeeklyHabits = (weekKey) => {
  const all = get(KEYS.WEEKLY_HABITS) || {};
  return all[weekKey] || {};
};

export const toggleWeeklyHabit = (weekKey, dayKey, habitId) => {
  const all = get(KEYS.WEEKLY_HABITS) || {};
  if (!all[weekKey]) all[weekKey] = {};
  if (!all[weekKey][dayKey]) all[weekKey][dayKey] = {};
  all[weekKey][dayKey][habitId] = !all[weekKey][dayKey][habitId];
  set(KEYS.WEEKLY_HABITS, all);
};

// ── Settings ───────────────────────────────────────────────────────────────
const DEFAULTS = {
  currentWeight:    147,
  targetWeight:     165,
  goalDate:         '2026-10-10',
  notifyMorning:    true,
  notifyCheckin:    true,
  notifyNighttime:  true,
  notifyWorkout:    true,
  notifyWeighIn:    true,
  morningTime:      '08:00',
  checkinTime:      '20:00',
  nighttimeTime:    '22:00',
};

export const getSettings = () => ({ ...DEFAULTS, ...(get(KEYS.SETTINGS) || {}) });
export const saveSettings = (s) => set(KEYS.SETTINGS, s);

// ── Photos ─────────────────────────────────────────────────────────────────
export const savePhoto = (photo) => {
  const list = get(KEYS.PHOTOS) || [];
  list.unshift(photo);
  set(KEYS.PHOTOS, list);
};

export const getPhotos = () => get(KEYS.PHOTOS) || [];

// ── Nuke ───────────────────────────────────────────────────────────────────
export const clearAllData = () => {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
};
