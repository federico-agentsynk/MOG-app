import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  WORKOUTS: '@mog/workouts',
  WEIGHT_LOG: '@mog/weight_log',
  METRICS: '@mog/metrics',
  SETTINGS: '@mog/settings',
  DAILY_PROTOCOL: '@mog/daily_protocol',
  WEEKLY_HABITS: '@mog/weekly_habits',
  PHOTOS: '@mog/photos',
};

const getItem = async (key) => {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// Workouts
export const saveWorkout = async (workout) => {
  const workouts = (await getItem(KEYS.WORKOUTS)) || [];
  workouts.unshift(workout);
  await setItem(KEYS.WORKOUTS, workouts);
};

export const getWorkouts = async () => (await getItem(KEYS.WORKOUTS)) || [];

export const getLastWorkoutByType = async (type) => {
  const workouts = await getWorkouts();
  return workouts.find((w) => w.type === type) || null;
};

// Weight log
export const logWeight = async (entry) => {
  const log = (await getItem(KEYS.WEIGHT_LOG)) || [];
  const idx = log.findIndex((e) => e.date === entry.date);
  if (idx >= 0) log[idx] = entry;
  else log.push(entry);
  log.sort((a, b) => a.date.localeCompare(b.date));
  await setItem(KEYS.WEIGHT_LOG, log);
};

export const getWeightLog = async () => (await getItem(KEYS.WEIGHT_LOG)) || [];

export const getLatestWeight = async () => {
  const log = await getWeightLog();
  return log.length ? log[log.length - 1].weight : null;
};

// Metrics (body measurements)
export const saveMetrics = async (entry) => {
  const metrics = (await getItem(KEYS.METRICS)) || [];
  const idx = metrics.findIndex((e) => e.date === entry.date);
  if (idx >= 0) metrics[idx] = entry;
  else metrics.push(entry);
  metrics.sort((a, b) => a.date.localeCompare(b.date));
  await setItem(KEYS.METRICS, metrics);
};

export const getMetrics = async () => (await getItem(KEYS.METRICS)) || [];

// Daily protocol
export const getDailyProtocol = async (dateKey) => {
  const all = (await getItem(KEYS.DAILY_PROTOCOL)) || {};
  return all[dateKey] || {};
};

export const setDailyProtocolItem = async (dateKey, itemId, checked) => {
  const all = (await getItem(KEYS.DAILY_PROTOCOL)) || {};
  if (!all[dateKey]) all[dateKey] = {};
  all[dateKey][itemId] = checked;
  await setItem(KEYS.DAILY_PROTOCOL, all);
};

export const getProtocolCompliance = async (weekDays) => {
  const all = (await getItem(KEYS.DAILY_PROTOCOL)) || {};
  let total = 0;
  let completed = 0;
  for (const day of weekDays) {
    const dayData = all[day.key] || {};
    total += 5;
    completed += Object.values(dayData).filter(Boolean).length;
  }
  return total > 0 ? completed / total : 0;
};

// Weekly habits
export const getWeeklyHabits = async (weekKey) => {
  const all = (await getItem(KEYS.WEEKLY_HABITS)) || {};
  return all[weekKey] || {};
};

export const setWeeklyHabit = async (weekKey, dayKey, habitId, checked) => {
  const all = (await getItem(KEYS.WEEKLY_HABITS)) || {};
  if (!all[weekKey]) all[weekKey] = {};
  if (!all[weekKey][dayKey]) all[weekKey][dayKey] = {};
  all[weekKey][dayKey][habitId] = checked;
  await setItem(KEYS.WEEKLY_HABITS, all);
};

// Settings
export const getSettings = async () => {
  const defaults = {
    currentWeight: 147,
    targetWeight: 165,
    goalDate: '2026-10-10',
    notifyMorning: true,
    notifyCheckin: true,
    notifyNighttime: true,
    notifyWorkout: true,
    notifyWeighIn: true,
    morningTime: '08:00',
    checkinTime: '20:00',
    nighttimeTime: '22:00',
  };
  const saved = (await getItem(KEYS.SETTINGS)) || {};
  return { ...defaults, ...saved };
};

export const saveSettings = async (settings) => setItem(KEYS.SETTINGS, settings);

// Photos
export const savePhoto = async (photo) => {
  const photos = (await getItem(KEYS.PHOTOS)) || [];
  photos.unshift(photo);
  await setItem(KEYS.PHOTOS, photos);
};

export const getPhotos = async () => (await getItem(KEYS.PHOTOS)) || [];

// Clear all data
export const clearAllData = async () => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};
