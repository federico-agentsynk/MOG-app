import { format, startOfWeek, differenceInDays } from 'date-fns';

export const getWeekKey = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return format(start, 'yyyy-MM-dd');
};

export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');

export const formatShortDate = (date) => format(new Date(date), 'MMM d');

export const getDaysUntilGoal = () => {
  const goalDate = new Date('2026-10-10');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(differenceInDays(goalDate, today), 0);
};

export const getTodayKey = () => format(new Date(), 'yyyy-MM-dd');

export const getWeekDays = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      date: d,
      key: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE'),
      dayOfWeek: d.getDay(),
    };
  });
};
