import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NotificationService, { NotificationSettings } from '../services/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notificationSettings: NotificationSettings;
  notificationsEnabled: boolean;
  initializeNotifications: () => Promise<void>;
  togglePushNotifications: (enabled: boolean) => Promise<void>;
  toggleEmailUpdates: (enabled: boolean) => Promise<void>;
  toggleMovieRecommendations: (enabled: boolean) => Promise<void>;
  toggleNewContentAlerts: (enabled: boolean) => Promise<void>;
  toggleSubscriptionReminders: (enabled: boolean) => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { authState } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailUpdates: false,
    movieRecommendations: true,
    newContentAlerts: true,
    subscriptionReminders: true,
  });

  const notificationsEnabled = notificationSettings.pushNotifications;

  const initializeNotifications = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      const initialized = await notificationService.initialize();
      
      if (initialized) {
        const settings = notificationService.getSettings();
        setNotificationSettings(settings);
      }
    } catch (error) {
    }
  };

  const setupNotificationListeners = () => {
    // Local notifications don't need listeners
    
    return () => {
    };
  };

  const togglePushNotifications = async (enabled: boolean) => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.updateSettings({ pushNotifications: enabled });
      
      const settings = notificationService.getSettings();
      setNotificationSettings(settings);
      
      if (enabled) {
      } else {
        await notificationService.cancelAllNotifications();
      }
    } catch (error) {
    }
  };

  const toggleEmailUpdates = async (enabled: boolean) => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.updateSettings({ emailUpdates: enabled });
      
      const settings = notificationService.getSettings();
      setNotificationSettings(settings);
      
    } catch (error) {
    }
  };

  const toggleMovieRecommendations = async (enabled: boolean) => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.updateSettings({ movieRecommendations: enabled });
      
      const settings = notificationService.getSettings();
      setNotificationSettings(settings);
      
    } catch (error) {
    }
  };

  const toggleNewContentAlerts = async (enabled: boolean) => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.updateSettings({ newContentAlerts: enabled });
      
      const settings = notificationService.getSettings();
      setNotificationSettings(settings);
      
    } catch (error) {
    }
  };

  const toggleSubscriptionReminders = async (enabled: boolean) => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.updateSettings({ subscriptionReminders: enabled });
      
      const settings = notificationService.getSettings();
      setNotificationSettings(settings);
      
    } catch (error) {
    }
  };

  const sendTestNotification = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      initializeNotifications();
      const cleanup = setupNotificationListeners();
      return cleanup;
    }
  }, [authState.isAuthenticated]);

  const value: NotificationContextType = {
    notificationSettings,
    notificationsEnabled,
    initializeNotifications,
    togglePushNotifications,
    toggleEmailUpdates,
    toggleMovieRecommendations,
    toggleNewContentAlerts,
    toggleSubscriptionReminders,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
