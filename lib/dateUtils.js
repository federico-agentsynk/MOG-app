import { format, startOfWeek, differenceInDays } from 'date-fns';

export const getTodayKey = () => format(new Date(), 'yyyy-MM-dd');

export const getWeekKey = (date = new Date()) =>
  format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

export const formatShortDate = (dateStr) => {
  try { return format(new Date(dateStr + 'T12:00:00'), 'MMM d'); }
  catch { return dateStr; }
};

export const formatDate = (dateStr) => {
  try { return format(new Date(dateStr + 'T12:00:00'), 'MMM d, yyyy'); }
  catch { return dateStr; }
};

export const getDaysUntilGoal = () => {
  const goal = new Date('2026-10-10T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.max(differenceInDays(goal, today), 0);
};

export const getWeekDays = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      date:      d,
      key:       format(d, 'yyyy-MM-dd'),
      label:     format(d, 'EEE'),
      dayOfWeek: d.getDay(),
    };
  });
};
