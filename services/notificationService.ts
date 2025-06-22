import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM" (24h)
  title: string;
  message: string;
}

// Rotating messages for variety
const NOTIFICATION_MESSAGES = [
  {
    title: "How was your day? 💭",
    message: "Take 2 minutes to capture today's moments"
  },
  {
    title: "Time to reflect! ✨",
    message: "Your daily journal is waiting for you"
  },
  {
    title: "Don't let today fade away 📝",
    message: "Write down what made you smile today"
  },
  {
    title: "Your story matters 💫",
    message: "Quick! Capture today before it becomes yesterday"
  },
  {
    title: "Hey! How are you feeling? 😊",
    message: "Let's check in with your emotions today"
  }
];

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  time: "18:00", // 6 PM fixed
  title: NOTIFICATION_MESSAGES[0].title,
  message: NOTIFICATION_MESSAGES[0].message
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  async getSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      
      // Reschedule notifications with new settings
      if (settings.enabled) {
        await this.scheduleDaily(settings);
      } else {
        await this.cancelAll();
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  },

  async scheduleDaily(settings?: NotificationSettings): Promise<void> {
    try {
      // Cancel existing notifications first
      await this.cancelAll();
      
      if (!settings) {
        settings = await this.getSettings();
      }

      if (!settings.enabled) {
        return;
      }

      // Check permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
      }

      // Parse time (format: "HH:MM")
      const [hours, minutes] = settings.time.split(':').map(Number);
      
      // Get random message for variety
      const randomMessage = NOTIFICATION_MESSAGES[Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)];
      
      // Schedule daily notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: randomMessage.title,
          body: randomMessage.message,
          sound: true,
          data: { type: 'daily_reminder' },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log(`Daily notification scheduled for ${settings.time}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  },

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  },

  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },

  // Initialize notifications when app starts
  async initialize(): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (settings.enabled) {
        await this.scheduleDaily(settings);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  },

  // Format time for display (24h to 12h if needed)
  formatTime(time24h: string): string {
    const [hours, minutes] = time24h.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  },

  // Helper to create time string from Date
  timeFromDate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
};