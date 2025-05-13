import { useState, useEffect, useCallback, useMemo } from 'react';
import useWebSocket from './useWebSocket';
import useSettings from './useSettings';

export interface Notification {
  id: string;
  type: 'email' | 'file' | 'social';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
  scheduledFor?: string;
  groupId?: string;
}

export interface NotificationGroup {
  id: string;
  type: 'email' | 'file' | 'social';
  notifications: Notification[];
  unreadCount: number;
  latestTimestamp: string;
}

export interface NotificationHook {
  notifications: Notification[];
  unreadCount: number;
  groupedNotifications: NotificationGroup[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clear: (id: string) => void;
  clearAll: () => void;
  playNotificationSound: () => void;
  scheduleNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>, scheduledFor: Date) => void;
  cancelScheduledNotification: (id: string) => void;
}

const useNotifications = (): NotificationHook => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSound] = useState(() => new Audio('/notification.mp3'));
  const { settings, isQuietHours } = useSettings();

  const { lastMessage } = useWebSocket('ws://localhost:3001/notifications');

  // Group notifications by type and time
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: NotificationGroup } = {};

    notifications.forEach((notification) => {
      const groupKey = `${notification.type}-${new Date(notification.timestamp).toDateString()}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          type: notification.type,
          notifications: [],
          unreadCount: 0,
          latestTimestamp: notification.timestamp,
        };
      }

      groups[groupKey].notifications.push(notification);
      if (!notification.read) {
        groups[groupKey].unreadCount++;
      }
      if (new Date(notification.timestamp) > new Date(groups[groupKey].latestTimestamp)) {
        groups[groupKey].latestTimestamp = notification.timestamp;
      }
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
    );
  }, [notifications]);

  // Handle scheduled notifications
  useEffect(() => {
    const checkScheduledNotifications = () => {
      const now = new Date();
      setNotifications((prev) => {
        const updated = prev.map((notification) => {
          if (notification.scheduledFor && new Date(notification.scheduledFor) <= now) {
            return {
              ...notification,
              scheduledFor: undefined,
            };
          }
          return notification;
        });

        // Trigger notifications for any that are now due
        updated.forEach((notification) => {
          if (!notification.scheduledFor && !notification.read) {
            triggerNotification(notification);
          }
        });

        return updated;
      });
    };

    const interval = setInterval(checkScheduledNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const triggerNotification = useCallback((notification: Notification) => {
    if (settings.notifications.enabled && !isQuietHours()) {
      if (settings.notifications.sound) {
        playNotificationSound();
      }

      if (settings.notifications.browser) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }

        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo192.png',
          });
        }
      }
    }
  }, [settings.notifications, isQuietHours, playNotificationSound]);

  useEffect(() => {
    if (lastMessage) {
      const notification = JSON.parse(lastMessage.data);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      triggerNotification(notification);
    }
  }, [lastMessage, triggerNotification]);

  const playNotificationSound = useCallback(() => {
    if (!settings.notifications.enabled || !settings.notifications.sound || isQuietHours()) {
      return;
    }

    notificationSound.volume = settings.notifications.volume / 100;
    notificationSound.currentTime = 0;
    notificationSound.play().catch((error) => {
      console.error('Error playing notification sound:', error);
    });
  }, [notificationSound, settings.notifications, isQuietHours]);

  const scheduleNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
    scheduledFor: Date
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      scheduledFor: scheduledFor.toISOString(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const cancelScheduledNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clear = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
    setUnreadCount((prev) =>
      Math.max(0, prev - (notifications.find((n) => n.id === id)?.read ? 0 : 1))
    );
  }, [notifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    groupedNotifications,
    markAsRead,
    markAllAsRead,
    clear,
    clearAll,
    playNotificationSound,
    scheduleNotification,
    cancelScheduledNotification,
  };
};

export default useNotifications; 