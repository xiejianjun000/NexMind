// useSystemTray - 系统托盘状态Hook
// 监听托盘事件和菜单操作

import { useState, useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { emit } from '@tauri-apps/api/event';

export type TrayEvent = 
  | 'open-search'
  | 'open-files'
  | 'open-apps'
  | 'open-settings'
  | 'show-window'
  | 'hide-window'
  | 'quit';

export interface TrayState {
  isVisible: boolean;
  tooltip: string;
  icon: string;
}

export function useSystemTray() {
  const [trayState, setTrayState] = useState<TrayState>({
    isVisible: true,
    tooltip: 'NexMind - 智能助手',
    icon: 'default',
  });
  const [currentEvent, setCurrentEvent] = useState<TrayEvent | null>(null);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    // 监听托盘菜单事件
    const setupListeners = async () => {
      try {
        unsubscribers.push(
          await listen('open-search', () => {
            setCurrentEvent('open-search');
            console.log('[Tray] 打开搜索面板');
          })
        );

        unsubscribers.push(
          await listen('open-files', () => {
            setCurrentEvent('open-files');
            console.log('[Tray] 打开文件管理');
          })
        );

        unsubscribers.push(
          await listen('open-apps', () => {
            setCurrentEvent('open-apps');
            console.log('[Tray] 打开应用管理');
          })
        );

        unsubscribers.push(
          await listen('open-settings', () => {
            setCurrentEvent('open-settings');
            console.log('[Tray] 打开设置');
          })
        );

        unsubscribers.push(
          await listen('show-window', () => {
            setCurrentEvent('show-window');
            console.log('[Tray] 显示窗口');
          })
        );

        unsubscribers.push(
          await listen('hide-window', () => {
            setCurrentEvent('hide-window');
            console.log('[Tray] 隐藏窗口');
          })
        );

        console.log('[useSystemTray] 托盘事件监听器已设置');
      } catch (error) {
        console.error('[useSystemTray] 监听器设置失败:', error);
      }
    };

    setupListeners();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const updateTooltip = useCallback(async (tooltip: string) => {
    setTrayState(prev => ({ ...prev, tooltip }));
    try {
      await emit('update-tray-tooltip', { tooltip });
    } catch (error) {
      console.error('[useSystemTray] 更新托盘提示失败:', error);
    }
  }, []);

  const updateIcon = useCallback(async (icon: string) => {
    setTrayState(prev => ({ ...prev, icon }));
    try {
      await emit('update-tray-icon', { icon });
    } catch (error) {
      console.error('[useSystemTray] 更新托盘图标失败:', error);
    }
  }, []);

  const showWindow = useCallback(async () => {
    try {
      await emit('show-window');
    } catch (error) {
      console.error('[useSystemTray] 显示窗口失败:', error);
    }
  }, []);

  const hideWindow = useCallback(async () => {
    try {
      await emit('hide-window');
    } catch (error) {
      console.error('[useSystemTray] 隐藏窗口失败:', error);
    }
  }, []);

  const clearEvent = useCallback(() => {
    setCurrentEvent(null);
  }, []);

  return {
    trayState,
    currentEvent,
    updateTooltip,
    updateIcon,
    showWindow,
    hideWindow,
    clearEvent,
  };
}
