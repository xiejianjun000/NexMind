// SystemTrayManager - 系统托盘管理器
// 管理托盘图标、菜单和事件

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemTray, TrayEvent } from '../../hooks/useSystemTray';
import { useTauriSystem } from '../../hooks/useTauriSystem';
import MinionAvatar from '../Minion/MinionAvatar';
import { MinionState } from '../Minion/MinionTypes';

interface TrayMenuItem {
  id: TrayEvent;
  icon: string;
  label: string;
  shortcut?: string;
}

const TRAY_MENU_ITEMS: TrayMenuItem[] = [
  { id: 'open-search', icon: '🔍', label: '快速搜索', shortcut: 'Ctrl+Space' },
  { id: 'open-files', icon: '📁', label: '文件管理' },
  { id: 'open-apps', icon: '⚙️', label: '应用管理' },
  { id: 'show-window', icon: '🪟', label: '显示窗口' },
  { id: 'hide-window', icon: '🔽', label: '最小化到托盘' },
  { id: 'open-settings', icon: '⚙️', label: '设置' },
];

const SystemTrayManager: React.FC = () => {
  const { trayState, currentEvent, updateTooltip, showWindow, hideWindow } = useSystemTray();
  const { isConnected, showNotification } = useTauriSystem();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [minionState, setMinionState] = useState<MinionState>(MinionState.IDLE);

  useEffect(() => {
    if (isConnected) {
      updateTooltip(`NexMind - 已连接`);
    } else {
      updateTooltip(`NexMind - 未连接`);
    }
  }, [isConnected, updateTooltip]);

  useEffect(() => {
    if (currentEvent) {
      handleTrayEvent(currentEvent);
    }
  }, [currentEvent]);

  const handleTrayEvent = async (event: TrayEvent) => {
    console.log(`[SystemTrayManager] Handling event: ${event}`);
    setMinionState(MinionState.THINKING);

    switch (event) {
      case 'show-window':
        await showWindow();
        setMinionState(MinionState.HAPPY);
        break;

      case 'hide-window':
        await hideWindow();
        setMinionState(MinionState.IDLE);
        break;

      case 'open-search':
        await showWindow();
        setMinionState(MinionState.SPEAKING);
        await showNotification('NexMind', '打开快速搜索面板');
        break;

      case 'open-files':
        await showWindow();
        setMinionState(MinionState.SPEAKING);
        await showNotification('NexMind', '打开文件管理器');
        break;

      case 'open-apps':
        await showWindow();
        setMinionState(MinionState.SPEAKING);
        await showNotification('NexMind', '打开应用管理器');
        break;

      case 'open-settings':
        await showWindow();
        setMinionState(MinionState.THINKING);
        break;

      default:
        setMinionState(MinionState.IDLE);
    }

    setTimeout(() => {
      setMinionState(MinionState.IDLE);
    }, 2000);
  };

  const handleMenuItemClick = async (item: TrayMenuItem) => {
    setIsMenuOpen(false);
    await handleTrayEvent(item.id);
  };

  return (
    <div className="relative">
      {/* 托盘图标 */}
      <motion.div
        className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center cursor-pointer shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="text-xl">🤖</span>
        
        {/* 连接状态指示器 */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </motion.div>

      {/* 托盘提示 */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <div className="bg-gray-900 px-3 py-1 rounded-lg text-xs text-white shadow-lg">
          {trayState.tooltip}
        </div>
      </div>

      {/* 菜单 */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 背景遮罩 */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* 菜单面板 */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {/* 头部 */}
              <div className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600">
                <div className="flex items-center gap-3">
                  <MinionAvatar 
                    state={minionState}
                    size="small"
                    showSpeechBubble={false}
                  />
                  <div>
                    <h3 className="text-white font-bold">NexMind</h3>
                    <p className="text-xs text-cyan-200">
                      {isConnected ? '🟢 已连接' : '🔴 未连接'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 菜单项 */}
              <div className="p-2">
                {TRAY_MENU_ITEMS.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-left group"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="flex-1 text-sm text-gray-200 group-hover:text-white">
                      {item.label}
                    </span>
                    {item.shortcut && (
                      <span className="text-xs text-gray-500">{item.shortcut}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* 底部 */}
              <div className="border-t border-gray-700 p-3 bg-gray-900/50">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleTrayEvent('hide-window');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  🚪 退出程序
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemTrayManager;
