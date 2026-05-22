// SettingsPage - 设置页面组件
// 包含所有配置选项的完整设置界面

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings, Settings } from '../../hooks/useSettings';
import { useTheme, Theme } from '../../hooks/useTheme';
import MinionAvatar from '../Minion/MinionAvatar';
import { MinionState } from '../Minion/MinionTypes';

type SettingsTab = 'general' | 'appearance' | 'shortcuts' | 'notifications' | 'privacy' | 'advanced';

const SettingsPage: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { settings, isSaving, updateGeneral, updateAppearance, updateShortcuts, updateNotifications, updatePrivacy, updateAdvanced, resetSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const tabs = [
    { id: 'general' as const, label: '通用', icon: '⚙️' },
    { id: 'appearance' as const, label: '外观', icon: '🎨' },
    { id: 'shortcuts' as const, label: '快捷键', icon: '⌨️' },
    { id: 'notifications' as const, label: '通知', icon: '🔔' },
    { id: 'privacy' as const, label: '隐私', icon: '🔒' },
    { id: 'advanced' as const, label: '高级', icon: '🔧' },
  ];

  const handleReset = () => {
    resetSettings();
    setShowResetConfirm(false);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="text-gray-400">←</span>
          </button>
          <h1 className="text-xl font-bold text-white">⚙️ 设置</h1>
        </div>
        
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
        >
          重置所有设置
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <div className="w-64 bg-gray-800/30 border-r border-gray-700 p-4">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 主内容 */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <SettingsSection title="通用设置" key="general">
                <SettingsRow
                  label="语言"
                  description="选择界面显示语言"
                >
                  <select
                    value={settings.general.language}
                    onChange={(e) => updateGeneral({ language: e.target.value as 'zh-CN' | 'en-US' })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                  </select>
                </SettingsRow>

                <SettingsRow
                  label="开机自启"
                  description="系统启动时自动运行 NexMind"
                >
                  <Toggle
                    checked={settings.general.startupWithSystem}
                    onChange={(checked) => updateGeneral({ startupWithSystem: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="最小化到托盘"
                  description="关闭窗口时最小化到系统托盘"
                >
                  <Toggle
                    checked={settings.general.minimizeToTray}
                    onChange={(checked) => updateGeneral({ minimizeToTray: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="自动更新"
                  description="自动检查并安装更新"
                >
                  <Toggle
                    checked={settings.general.autoUpdate}
                    onChange={(checked) => updateGeneral({ autoUpdate: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="遥测数据"
                  description="帮助我们改进产品"
                >
                  <Toggle
                    checked={settings.general.telemetry}
                    onChange={(checked) => updateGeneral({ telemetry: checked })}
                  />
                </SettingsRow>
              </SettingsSection>
            )}

            {activeTab === 'appearance' && (
              <SettingsSection title="外观设置" key="appearance">
                <SettingsRow
                  label="主题"
                  description="选择界面主题风格"
                >
                  <div className="flex gap-2">
                    {(['dark', 'light', 'system'] as Theme[]).map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          updateAppearance({ theme: t });
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          theme === t
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {t === 'dark' ? '🌙 暗色' : t === 'light' ? '☀️ 亮色' : '💻 跟随系统'}
                      </button>
                    ))}
                  </div>
                </SettingsRow>

                <SettingsRow
                  label="强调色"
                  description="选择界面强调色"
                >
                  <ColorPicker
                    value={settings.appearance.accentColor}
                    onChange={(color) => updateAppearance({ accentColor: color })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="字体大小"
                  description="调整界面字体大小"
                >
                  <select
                    value={settings.appearance.fontSize}
                    onChange={(e) => updateAppearance({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                  </select>
                </SettingsRow>

                <SettingsRow
                  label="紧凑模式"
                  description="减少界面元素间距"
                >
                  <Toggle
                    checked={settings.appearance.compactMode}
                    onChange={(checked) => updateAppearance({ compactMode: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="显示动画"
                  description="启用界面动画效果"
                >
                  <Toggle
                    checked={settings.appearance.showAnimations}
                    onChange={(checked) => updateAppearance({ showAnimations: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="小黄人样式"
                  description="选择小黄人的外观风格"
                >
                  <select
                    value={settings.appearance.minionStyle}
                    onChange={(e) => updateAppearance({ minionStyle: e.target.value as 'default' | 'minimal' | 'fun' })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="default">默认</option>
                    <option value="minimal">简约</option>
                    <option value="fun">趣味</option>
                  </select>
                </SettingsRow>
              </SettingsSection>
            )}

            {activeTab === 'shortcuts' && (
              <SettingsSection title="快捷键设置" key="shortcuts">
                <ShortcutRow
                  label="全局快捷键"
                  value={settings.shortcuts.globalHotkey}
                  onChange={(v) => updateShortcuts({ globalHotkey: v })}
                />
                <ShortcutRow
                  label="快速搜索"
                  value={settings.shortcuts.quickSearch}
                  onChange={(v) => updateShortcuts({ quickSearch: v })}
                />
                <ShortcutRow
                  label="切换窗口"
                  value={settings.shortcuts.toggleWindow}
                  onChange={(v) => updateShortcuts({ toggleWindow: v })}
                />
                <ShortcutRow
                  label="截图"
                  value={settings.shortcuts.screenshot}
                  onChange={(v) => updateShortcuts({ screenshot: v })}
                />
                <ShortcutRow
                  label="语音输入"
                  value={settings.shortcuts.voiceInput}
                  onChange={(v) => updateShortcuts({ voiceInput: v })}
                />
                <ShortcutRow
                  label="紧急停止"
                  value={settings.shortcuts.emergencyStop}
                  onChange={(v) => updateShortcuts({ emergencyStop: v })}
                />
              </SettingsSection>
            )}

            {activeTab === 'notifications' && (
              <SettingsSection title="通知设置" key="notifications">
                <SettingsRow
                  label="启用通知"
                  description="允许接收系统通知"
                >
                  <Toggle
                    checked={settings.notifications.enabled}
                    onChange={(checked) => updateNotifications({ enabled: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="通知声音"
                  description="收到通知时播放提示音"
                >
                  <Toggle
                    checked={settings.notifications.sound}
                    onChange={(checked) => updateNotifications({ sound: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="桌面通知"
                  description="显示桌面通知"
                >
                  <Toggle
                    checked={settings.notifications.desktop}
                    onChange={(checked) => updateNotifications({ desktop: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="任务完成通知"
                  description="任务执行完成时通知"
                >
                  <Toggle
                    checked={settings.notifications.taskComplete}
                    onChange={(checked) => updateNotifications({ taskComplete: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="系统警告"
                  description="系统异常时通知"
                >
                  <Toggle
                    checked={settings.notifications.systemAlert}
                    onChange={(checked) => updateNotifications({ systemAlert: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="升级提醒"
                  description="有新版本可用时通知"
                >
                  <Toggle
                    checked={settings.notifications.upgradeNotice}
                    onChange={(checked) => updateNotifications({ upgradeNotice: checked })}
                  />
                </SettingsRow>
              </SettingsSection>
            )}

            {activeTab === 'privacy' && (
              <SettingsSection title="隐私设置" key="privacy">
                <SettingsRow
                  label="保存历史"
                  description="保存对话和操作历史"
                >
                  <Toggle
                    checked={settings.privacy.saveHistory}
                    onChange={(checked) => updatePrivacy({ saveHistory: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="历史保留天数"
                  description="历史记录保留天数"
                >
                  <input
                    type="number"
                    value={settings.privacy.historyDays}
                    onChange={(e) => updatePrivacy({ historyDays: parseInt(e.target.value) || 30 })}
                    className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min={7}
                    max={365}
                  />
                </SettingsRow>

                <SettingsRow
                  label="分享分析"
                  description="分享匿名使用统计"
                >
                  <Toggle
                    checked={settings.privacy.shareAnalytics}
                    onChange={(checked) => updatePrivacy({ shareAnalytics: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="云同步"
                  description="同步设置到云端"
                >
                  <Toggle
                    checked={settings.privacy.cloudSync}
                    onChange={(checked) => updatePrivacy({ cloudSync: checked })}
                  />
                </SettingsRow>
              </SettingsSection>
            )}

            {activeTab === 'advanced' && (
              <SettingsSection title="高级设置" key="advanced">
                <SettingsRow
                  label="最大并发任务数"
                  description="同时执行的最大任务数"
                >
                  <input
                    type="number"
                    value={settings.advanced.maxConcurrentTasks}
                    onChange={(e) => updateAdvanced({ maxConcurrentTasks: parseInt(e.target.value) || 5 })}
                    className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min={1}
                    max={20}
                  />
                </SettingsRow>

                <SettingsRow
                  label="内存限制"
                  description="应用最大内存使用"
                >
                  <select
                    value={settings.advanced.memoryLimit}
                    onChange={(e) => updateAdvanced({ memoryLimit: e.target.value })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="256MB">256 MB</option>
                    <option value="512MB">512 MB</option>
                    <option value="1GB">1 GB</option>
                    <option value="2GB">2 GB</option>
                  </select>
                </SettingsRow>

                <SettingsRow
                  label="缓存大小"
                  description="本地缓存最大大小"
                >
                  <select
                    value={settings.advanced.cacheSize}
                    onChange={(e) => updateAdvanced({ cacheSize: e.target.value })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="128MB">128 MB</option>
                    <option value="256MB">256 MB</option>
                    <option value="512MB">512 MB</option>
                    <option value="1GB">1 GB</option>
                  </select>
                </SettingsRow>

                <SettingsRow
                  label="调试模式"
                  description="显示详细调试信息"
                >
                  <Toggle
                    checked={settings.advanced.debugMode}
                    onChange={(checked) => updateAdvanced({ debugMode: checked })}
                  />
                </SettingsRow>

                <SettingsRow
                  label="实验性功能"
                  description="启用实验性功能（可能不稳定）"
                >
                  <Toggle
                    checked={settings.advanced.experimentalFeatures}
                    onChange={(checked) => updateAdvanced({ experimentalFeatures: checked })}
                  />
                </SettingsRow>
              </SettingsSection>
            )}
          </AnimatePresence>
        </div>

        {/* 预览区 */}
        <div className="w-80 bg-gray-800/30 border-l border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">🔍 预览</h3>
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center">
            <MinionAvatar
              state={MinionState.HAPPY}
              size="medium"
              speechText="设置已保存！"
              showSpeechBubble={true}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">当前主题</p>
              <p className="text-lg font-medium text-white mt-1">
                {theme === 'dark' ? '🌙 暗色' : theme === 'light' ? '☀️ 亮色' : '💻 跟随系统'}
              </p>
            </div>
          </div>

          {isSaving && (
            <div className="mt-4 text-center text-sm text-gray-400">
              💾 保存中...
            </div>
          )}
        </div>
      </div>

      {/* 重置确认对话框 */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">⚠️ 确认重置</h3>
              <p className="text-gray-400 mb-6">
                确定要重置所有设置为默认值吗？此操作不可撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  确认重置
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

interface SettingsRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, description, children }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
    <div>
      <h3 className="text-white font-medium">{label}</h3>
      <p className="text-sm text-gray-400 mt-0.5">{description}</p>
    </div>
    <div>{children}</div>
  </div>
);

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-12 h-6 rounded-full transition-colors ${
      checked ? 'bg-blue-600' : 'bg-gray-600'
    }`}
  >
    <div
      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
        checked ? 'translate-x-7' : 'translate-x-1'
      }`}
    />
  </button>
);

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const colors = [
    '#00BCD4', '#3B82F6', '#8B5CF6', '#EC4899',
    '#EF4444', '#F59E0B', '#10B981', '#06B6D4',
  ];

  return (
    <div className="flex gap-2">
      {colors.map(color => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full transition-transform ${
            value === color ? 'ring-2 ring-white scale-110' : ''
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer"
      />
    </div>
  );
};

interface ShortcutRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ label, value, onChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    e.preventDefault();
    e.stopPropagation();

    const parts: string[] = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    
    const key = e.key.toUpperCase();
    if (!['CONTROL', 'SHIFT', 'ALT'].includes(key)) {
      parts.push(key);
      setTempValue(parts.join('+'));
    }
  };

  const handleSave = () => {
    onChange(tempValue);
    setIsRecording(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
      <h3 className="text-white font-medium">{label}</h3>
      {isRecording ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-40 px-3 py-2 bg-gray-700 border border-blue-500 rounded-lg text-white text-center"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            保存
          </button>
          <button
            onClick={() => setIsRecording(false)}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            取消
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsRecording(true)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          {value || '未设置'}
        </button>
      )}
    </div>
  );
};

export default SettingsPage;
