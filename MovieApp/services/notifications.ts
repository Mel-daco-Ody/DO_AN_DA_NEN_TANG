import { Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSettings {
  pushNotifications: boolean;
  emailUpdates: boolean;
  movieRecommendations: boolean;
  newContentAlerts: boolean;
  subscriptionReminders: boolean;
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
}

class NotificationService {
  private static instance: NotificationService;
  private notificationSettings: NotificationSettings = {
    pushNotifications: true,
    emailUpdates: true,
    movieRecommendations: true,
    newContentAlerts: true,
    subscriptionReminders: true,
  };

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async loadSettings(): Promise<void> {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(settings) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  public getSettings(): NotificationSettings {
    return { ...this.notificationSettings };
  }

  public async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
    await this.saveSettings();
  }

  public async initialize(): Promise<boolean> {
    try {
      console.log('Initializing notification service...');
      
      // For now, we'll use local notifications with Alert
      console.log('Local notification service initialized');
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  public async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    seconds: number = 0
  ): Promise<string | null> {
    try {
      if (!this.notificationSettings.pushNotifications) {
        console.log('Push notifications disabled, skipping local notification');
        return null;
      }

      // Use Alert for immediate notifications, setTimeout for delayed ones
      if (seconds > 0) {
        setTimeout(() => {
          Alert.alert(title, body, [{ text: 'OK' }]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Vibration.vibrate(500);
        }, seconds * 1000);
      } else {
        Alert.alert(title, body, [{ text: 'OK' }]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate(500);
      }

      const notificationId = `local_${Date.now()}`;
      console.log('Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  public async cancelNotification(notificationId: string): Promise<void> {
    try {
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  public async cancelAllNotifications(): Promise<void> {
    try {
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  public async createNotificationChannels(): Promise<void> {
    console.log('Notification channels created (local mode)');
  }

  public async getPushToken(): Promise<string | null> {
    console.log('Push token requested (local mode)');
    return 'local_token_' + Date.now();
  }

  private async savePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('pushToken', token);
      console.log('Push token saved:', token);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      console.log('Sending push token to server:', token);
      // In a real app, you would send this to your backend
      // await fetch('/api/push-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token })
      // });
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  public async sendTestNotification(): Promise<void> {
    await this.scheduleLocalNotification(
      'Test Notification',
      'This is a test notification from FlixGo!',
      { type: 'test' }
    );
  }

  public async sendMovieRecommendation(movieTitle: string): Promise<void> {
    if (!this.notificationSettings.movieRecommendations) return;
    
    await this.scheduleLocalNotification(
      'New Movie Recommendation',
      `Check out "${movieTitle}" - we think you'll love it!`,
      { type: 'recommendation', movieTitle }
    );
  }

  public async sendNewContentAlert(contentTitle: string): Promise<void> {
    if (!this.notificationSettings.newContentAlerts) return;
    
    await this.scheduleLocalNotification(
      'New Content Available',
      `"${contentTitle}" is now available on FlixGo!`,
      { type: 'new_content', contentTitle }
    );
  }

  public async sendSubscriptionReminder(): Promise<void> {
    if (!this.notificationSettings.subscriptionReminders) return;
    
    await this.scheduleLocalNotification(
      'Subscription Reminder',
      'Your subscription will expire soon. Renew now to continue enjoying unlimited content!',
      { type: 'subscription_reminder' }
    );
  }
}

export default NotificationService;