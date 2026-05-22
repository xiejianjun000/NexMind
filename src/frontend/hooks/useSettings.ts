// useSettings - 应用设置管理Hook
// 持久化用户偏好和配置

import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface Settings {
  general: GeneralSettings;
  appearance: AppearanceSettings;
  shortcuts: ShortcutSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  advanced: AdvancedSettings;
}

export interface GeneralSettings {
  language: 'zh-CN' | 'en-US';
  startupWithSystem: boolean;
  minimizeToTray: boolean;
  autoUpdate: boolean;
  telemetry: boolean;
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showAnimations: boolean;
  minionStyle: 'default' | 'minimal' | 'fun';
}

export interface ShortcutSettings {
  globalHotkey: string;
  quickSearch: string;
  toggleWindow: string;
  screenshot: string;
  voiceInput: string;
  emergencyStop: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  taskComplete: boolean;
  systemAlert: boolean;
  upgradeNotice: boolean;
}

export interface PrivacySettings {
  saveHistory: boolean;
  historyDays: number;
  shareAnalytics: boolean;
  cloudSync: boolean;
}

export interface AdvancedSettings {
  maxConcurrentTasks: number;
  memoryLimit: string;
  cacheSize: string;
  debugMode: boolean;
  experimentalFeatures: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  general: {
    language: 'zh-CN',
    startupWithSystem: false,
    minimizeToTray: true,
    autoUpdate: true,
    telemetry: true,
  },
  appearance: {
    theme: 'dark',
    accentColor: '#00BCD4',
    fontSize: 'medium',
    compactMode: false,
    showAnimations: true,
    minionStyle: 'default',
  },
  shortcuts: {
    globalHotkey: 'Ctrl+Shift+Space',
    quickSearch: 'Ctrl+K',
    toggleWindow: 'Ctrl+Shift+W',
    screenshot: 'Ctrl+Shift+S',
    voiceInput: 'Ctrl+Shift+V',
    emergencyStop: 'Ctrl+Shift+X',
  },
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
    taskComplete: true,
    systemAlert: true,
    upgradeNotice: true,
  },
  privacy: {
    saveHistory: true,
    historyDays: 30,
    shareAnalytics: true,
    cloudSync: false,
  },
  advanced: {
    maxConcurrentTasks: 5,
    memoryLimit: '512MB',
    cacheSize: '256MB',
    debugMode: false,
    experimentalFeatures: false,
  },
};

const STORAGE_KEY = 'nexmind-settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
      setIsLoaded(true);
      console.log('[Settings] 配置已加载');
    } catch (error) {
      console.error('[Settings] 加载配置失败:', error);
      setSettings(DEFAULT_SETTINGS);
      setIsLoaded(true);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<Settings>) => {
    setIsSaving(true);
    try {
      const updated = {
        ...settings,
        ...Object.fromEntries(
          Object.entries(newSettings).map(([key, value]) => [
            key,
            typeof value === 'object' ? { ...(settings as any)[key], ...value } : value,
          ])
        ),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSettings(updated);
      console.log('[Settings] 配置已保存');
    } catch (error) {
      console.error('[Settings] 保存配置失败:', error);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const resetSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(DEFAULT_SETTINGS);
      console.log('[Settings] 配置已重置');
    } catch (error) {
      console.error('[Settings] 重置配置失败:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateGeneral = useCallback((updates: Partial<GeneralSettings>) => {
    saveSettings({ general: updates });
  }, [saveSettings]);

  const updateAppearance = useCallback((updates: Partial<AppearanceSettings>) => {
    saveSettings({ appearance: updates });
  }, [saveSettings]);

  const updateShortcuts = useCallback((updates: Partial<ShortcutSettings>) => {
    saveSettings({ shortcuts: updates });
  }, [saveSettings]);

  const updateNotifications = useCallback((updates: Partial<NotificationSettings>) => {
    saveSettings({ notifications: updates });
  }, [saveSettings]);

  const updatePrivacy = useCallback((updates: Partial<PrivacySettings>) => {
    saveSettings({ privacy: updates });
  }, [saveSettings]);

  const updateAdvanced = useCallback((updates: Partial<AdvancedSettings>) => {
    saveSettings({ advanced: updates });
  }, [saveSettings]);

  const exportSettings = useCallback((): string => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((jsonString: string): boolean => {
    try {
      const imported = JSON.parse(jsonString);
      const validated = { ...DEFAULT_SETTINGS, ...imported };
      saveSettings(validated);
      return true;
    } catch (error) {
      console.error('[Settings] 导入配置失败:', error);
      return false;
    }
  }, [saveSettings]);

  return {
    settings,
    isLoaded,
    isSaving,
    saveSettings,
    resetSettings,
    updateGeneral,
    updateAppearance,
    updateShortcuts,
    updateNotifications,
    updatePrivacy,
    updateAdvanced,
    exportSettings,
    importSettings,
  };
}
