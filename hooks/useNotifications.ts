
import { useEffect } from 'react';
import type { Settings } from '../types';

const SETTINGS_KEY = 'appSettings';
const LAST_NOTIFICATION_KEY = 'lastNotificationDate';

export const useNotifications = () => {
  useEffect(() => {
    const checkNotifications = () => {
      // Check if Notifications are supported
      if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return;
      }

      const settingsString = localStorage.getItem(SETTINGS_KEY);
      if (!settingsString) return;

      const settings: Settings = JSON.parse(settingsString);
      if (!settings.remindersEnabled || Notification.permission !== 'granted') {
        return;
      }

      const now = new Date();
      const [hours, minutes] = settings.reminderTime.split(':').map(Number);
      const reminderTimeToday = new Date();
      reminderTimeToday.setHours(hours, minutes, 0, 0);

      const lastNotificationDate = localStorage.getItem(LAST_NOTIFICATION_KEY);
      const todayString = now.toISOString().split('T')[0];

      // Check if it's past the reminder time and no notification has been sent today
      if (now >= reminderTimeToday && lastNotificationDate !== todayString) {
        new Notification('Divine Promises Daily Reminder', {
          body: 'Time for your daily promise! Open the app to reflect and be encouraged.',
          icon: '/vite.svg', // Optional: Add an icon
        });
        localStorage.setItem(LAST_NOTIFICATION_KEY, todayString);
      }
    };

    // Check every minute
    const intervalId = setInterval(checkNotifications, 60000);

    // Initial check
    checkNotifications();

    return () => clearInterval(intervalId);
  }, []);
};
