// CommandCenter - MARVIS风格的命令输入组件
// 极简输入 + 语音支持 + 快捷命令

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Sparkles } from 'lucide-react';

interface QuickCommand {
  id: string;
  icon: string;
  label: string;
  action: string;
}

interface CommandCenterProps {
  onCommandSubmit: (command: string) => void;
  onVoiceInput?: () => void;
  disabled?: boolean;
  suggestions?: string[];
}

const CommandCenter: React.FC<CommandCenterProps> = ({
  onCommandSubmit,
  onVoiceInput,
  disabled = false,
  suggestions = [],
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 快捷命令
  const quickCommands: QuickCommand[] = [
    { id: '1', icon: '📁', label: '文件', action: '打开文件管理器' },
    { id: '2', icon: '🚀', label: '应用', action: '启动应用' },
    { id: '3', icon: '🔍', label: '搜索', action: '全内容搜索' },
    { id: '4', icon: '📊', label: '分析', action: '数据分析' },
    { id: '5', icon: '💡', label: '帮助', action: '获取帮助' },
  ];

  // 过滤建议
  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(input.toLowerCase()) && s !== input
  );

  // 处理提交
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onCommandSubmit(input.trim());
      setInput('');
      setShowSuggestions(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // 处理快捷命令
  const handleQuickCommand = (command: QuickCommand) => {
    setInput(command.action);
    inputRef.current?.focus();
  };

  // 语音输入
  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening && onVoiceInput) {
      onVoiceInput();
    }
  };

  // 聚焦效果
  useEffect(() => {
    if (input.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 主命令输入框 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative group">
            {/* 输入框 */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="告诉小黄人你想做什么..."
              rows={1}
              className="command-input resize-none pr-24"
              style={{ minHeight: '60px' }}
            />

            {/* 背景装饰 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/5 via-transparent to-green-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />

            {/* 按钮组 */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* 语音按钮 */}
              {onVoiceInput && (
                <motion.button
                  type="button"
                  onClick={toggleVoice}
                  disabled={disabled}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </motion.button>
              )}

              {/* 发送按钮 */}
              <motion.button
                type="submit"
                disabled={disabled || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !disabled
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 快捷键提示 */}
            <div className="absolute -bottom-6 left-3 text-xs text-slate-500">
              按 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd> 发送 · <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Ctrl+K</kbd> 聚焦
            </div>
          </div>
        </form>

        {/* 建议列表 */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 overflow-hidden"
            >
              <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-3"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-slate-200">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 快捷命令 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {quickCommands.map((command, index) => (
            <motion.button
              key={command.id}
              onClick={() => handleQuickCommand(command)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="quick-command"
            >
              <span className="text-2xl mb-1">{command.icon}</span>
              <span className="text-xs font-medium text-slate-300">{command.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 语音输入状态 */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-3 py-4"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-3 h-3 rounded-full bg-red-500"
            />
            <span className="text-red-400 font-medium animate-pulse">
              聆听中... 请说话
            </span>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.75,
              }}
              className="w-3 h-3 rounded-full bg-red-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommandCenter;
