// CommandInput - 融合了小黄人元素的命令输入组件
// MARVIS风格 + 小黄人吉祥物

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandInputProps {
  placeholder?: string;
  onSubmit: (value: string) => void;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  disabled?: boolean;
  minionState?: 'idle' | 'listening' | 'thinking';
}

const CommandInput: React.FC<CommandInputProps> = ({
  placeholder = '告诉小黄人你想做什么...',
  onSubmit,
  onVoiceStart,
  onVoiceEnd,
  disabled = false,
  minionState = 'idle',
}) => {
  const [value, setValue] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 语音输入
  const toggleVoice = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      onVoiceEnd?.();
    } else {
      setIsVoiceActive(true);
      onVoiceStart?.();
      
      // 模拟语音识别（实际应该使用Web Speech API）
      setTimeout(() => {
        setIsVoiceActive(false);
        setValue('帮我搜索报告文件');
        onVoiceEnd?.();
      }, 2000);
    }
  };

  // 快捷命令
  const quickCommands = [
    { icon: '📁', label: '搜索文件', command: '搜索文件：' },
    { icon: '🚀', label: '打开应用', command: '打开' },
    { icon: '🔍', label: '快速搜索', command: '搜索' },
    { icon: '💡', label: '获取帮助', command: '你能做什么' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 小黄人状态提示 */}
      <AnimatePresence>
        {minionState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-3"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
              {minionState === 'listening' && '🎤 聆听中...'}
              {minionState === 'thinking' && '🤔 思考中...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主输入框 */}
      <motion.form
        onSubmit={handleSubmit}
        className="relative"
        animate={isFocused ? { scale: 1 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div
          className={`
            relative flex items-center bg-gray-800 rounded-2xl border-2 transition-all
            ${isFocused ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700'}
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          {/* 左侧小黄人图标 */}
          <div className="pl-4 pr-2">
            <span className="text-2xl">🤖</span>
          </div>

          {/* 输入框 */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 px-4 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
          />

          {/* 语音按钮 */}
          <motion.button
            type="button"
            onClick={toggleVoice}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              p-3 rounded-full transition-all mr-2
              ${isVoiceActive 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
            title={isVoiceActive ? '停止录音' : '语音输入'}
          >
            {isVoiceActive ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </motion.button>

          {/* 发送按钮 */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!value.trim() || disabled}
            className={`
              p-3 rounded-full mr-2 transition-all
              ${value.trim() 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
            title="发送"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </motion.button>
        </div>

        {/* 快捷命令 */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {quickCommands.map((cmd, idx) => (
            <motion.button
              key={idx}
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setValue(cmd.command);
                inputRef.current?.focus();
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm flex items-center gap-2 transition-colors border border-gray-700 hover:border-gray-600"
            >
              <span>{cmd.icon}</span>
              <span>{cmd.label}</span>
            </motion.button>
          ))}
        </div>

        {/* 提示文字 */}
        <div className="mt-3 text-center text-xs text-gray-500">
          按 <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 mx-1">Enter</kbd> 发送，
          <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 mx-1">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 mx-1">K</kbd> 快速聚焦
        </div>
      </motion.form>

      {/* 语音输入波纹效果 */}
      <AnimatePresence>
        {isVoiceActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
            onClick={() => {
              setIsVoiceActive(false);
              onVoiceEnd?.();
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-gray-900 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-700"
            >
              <div className="text-center">
                {/* 录音波纹动画 */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                  <div className="absolute inset-0 bg-red-500/30 rounded-full animate-pulse" />
                  <div className="relative w-full h-full bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </div>
                </div>

                <p className="text-white text-lg mb-2">🎤 聆听中...</p>
                <p className="text-gray-400 text-sm mb-4">请说出你的命令</p>

                <button
                  onClick={() => {
                    setIsVoiceActive(false);
                    onVoiceEnd?.();
                  }}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommandInput;
