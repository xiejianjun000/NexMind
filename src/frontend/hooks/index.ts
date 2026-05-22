// hooks模块导出 - 更新
export { useMultiAgent } from './useMultiAgent';
export type { AgentInfo, AgentStatus, AgentState, AgentMessage, TaskResult } from './useMultiAgent';

export { useTauriSystem } from './useTauriSystem';
export type { FileInfo, AppInfo, SystemInfo, SystemStatus } from './useTauriSystem';

export { useSystemTray } from './useSystemTray';
export type { TrayEvent, TrayState } from './useSystemTray';

export { useSettings } from './useSettings';
export type { Settings, GeneralSettings, AppearanceSettings, ShortcutSettings, NotificationSettings, PrivacySettings, AdvancedSettings } from './useSettings';

export { useTheme } from './useTheme';
export type { Theme, ResolvedTheme, ThemeColors } from './useTheme';
