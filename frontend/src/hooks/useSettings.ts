import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../services/api';

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  browser: boolean;
  email: boolean;
  volume: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface EmailSettings {
  enabled: boolean;
  server: string;
  port: string;
  username: string;
  password: string;
}

export interface NASSettings {
  enabled: boolean;
  host: string;
  share: string;
  username: string;
  password: string;
}

export interface SocialSettings {
  twitter: {
    enabled: boolean;
    apiKey: string;
    apiSecret: string;
  };
  facebook: {
    enabled: boolean;
    appId: string;
    appSecret: string;
  };
}

export interface Settings {
  notifications: NotificationSettings;
  email: EmailSettings;
  nas: NASSettings;
  social: SocialSettings;
}

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    enabled: true,
    sound: true,
    browser: true,
    email: false,
    volume: 50,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
  email: {
    enabled: false,
    server: '',
    port: '587',
    username: '',
    password: '',
  },
  nas: {
    enabled: false,
    host: '',
    share: '',
    username: '',
    password: '',
  },
  social: {
    twitter: {
      enabled: false,
      apiKey: '',
      apiSecret: '',
    },
    facebook: {
      enabled: false,
      appId: '',
      appSecret: '',
    },
  },
};

const STORAGE_KEY = 'assist_settings';

export interface SettingsHook {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  isQuietHours: () => boolean;
}

const useSettings = (): SettingsHook => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    return savedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isQuietHours = useCallback(() => {
    if (!settings.notifications.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = settings.notifications.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = settings.notifications.quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Handle overnight quiet hours
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [settings.notifications.quietHours]);

  return {
    settings,
    updateSettings,
    resetSettings,
    isQuietHours,
  };
};

export default useSettings; 