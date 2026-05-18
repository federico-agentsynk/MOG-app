import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSettings, getWorkouts } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const initNotifications = async () => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'MOG Fitness',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  await scheduleAllNotifications();
  return true;
};

const parseTime = (timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
};

export const scheduleAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const settings = await getSettings();

  if (settings.notifyMorning) {
    const { hour, minute } = parseTime(settings.morningTime);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Morning Protocol',
        body: 'Time for your morning stack — creatine, Vitamin D, and Omega-3!',
      },
      trigger: { hour, minute, repeats: true },
    });
  }

  if (settings.notifyCheckin) {
    const { hour, minute } = parseTime(settings.checkinTime);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Check-In',
        body: 'Log your habits and track your progress for today.',
      },
      trigger: { hour, minute, repeats: true },
    });
  }

  if (settings.notifyNighttime) {
    const { hour, minute } = parseTime(settings.nighttimeTime);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nighttime Stack',
        body: "Don't forget your ZMA and Magnesium before bed!",
      },
      trigger: { hour, minute, repeats: true },
    });
  }

  if (settings.notifyWorkout) {
    await scheduleWorkoutReminder();
  }

  if (settings.notifyWeighIn) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Monday Weigh-In',
        body: "It's Monday — time to log your weight and track your progress!",
      },
      trigger: { weekday: 2, hour: 7, minute: 0, repeats: true },
    });
  }
};

const scheduleWorkoutReminder = async () => {
  const workouts = await getWorkouts();
  const now = new Date();
  const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const recentWorkout = workouts.find((w) => new Date(w.date) > cutoff);
  if (!recentWorkout) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Workout Reminder',
        body: "You haven't logged a workout in 48 hours. Time to hit the gym!",
      },
      trigger: { seconds: 300 },
    });
  }
};

export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification',
      body: 'Notifications are working correctly!',
    },
    trigger: { seconds: 1 },
  });
};
