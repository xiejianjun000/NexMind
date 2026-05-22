// OpenHumanLayout - OPENHUMAN风格三栏布局
// 左侧：小黄人3D + 功能状态
// 中间：对话框
// 右侧：可收缩栏

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Send, 
  Mic, 
  Settings,
  Zap,
  Brain,
  FileText,
  Clock,
  Sparkles,
  Image,
  X,
  Plus,
  Users,
  Layers,
  Activity,
  Home
} from 'lucide-react';
import MinionHero, { MinionState } from '../Minion/MinionHero';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface SidePanelItem {
  id: string;
  icon: string;
  label: string;
  count?: number;
}

interface OpenHumanLayoutProps {
  minionState?: MinionState;
  minionSpeech?: string;
  messages?: Message[];
  onSendMessage?: (message: string, attachments?: File[]) => void;
  onFileUpload?: (files: File[]) => void;
}

const OpenHumanLayout: React.FC<OpenHumanLayoutProps> = ({
  minionState = 'idle',
  minionSpeech = '你好！有什么需要帮忙的吗？',
  messages = [],
  onSendMessage,
  onFileUpload,
}) => {
  const [input, setInput] = useState('');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'files' | 'agents' | 'memory' | 'settings'>('agents');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // 左侧栏功能按钮
  const leftPanelItems: SidePanelItem[] = [
    { id: 'home', icon: '🏠', label: '主页' },
    { id: 'chat', icon: '💬', label: '对话', count: 3 },
    { id: 'agents', icon: '🤖', label: '智能体' },
    { id: 'files', icon: '📁', label: '文件' },
    { id: 'memory', icon: '🧠', label: '记忆' },
  ];

  // 右侧栏内容
  const rightPanelContent = {
    agents: [
      { name: '代码架构师', status: 'online', avatar: '👨‍💻' },
      { name: '数据分析师', status: 'online', avatar: '📊' },
      { name: '内容作家', status: 'idle', avatar: '✍️' },
      { name: '项目经理', status: 'busy', avatar: '📋' },
      { name: 'DevOps工程师', status: 'offline', avatar: '🔧' },
      { name: 'UX设计师', status: 'online', avatar: '🎨' },
    ],
    memory: [
      { title: '项目架构讨论', time: '10分钟前' },
      { title: '代码审查笔记', time: '1小时前' },
      { title: '会议纪要', time: '昨天' },
      { title: '技术方案', time: '3天前' },
    ],
    files: [
      { name: '设计稿.fig', size: '2.3MB', icon: '🎨' },
      { name: '项目文档.md', size: '156KB', icon: '📝' },
      { name: '数据报告.xlsx', size: '890KB', icon: '📊' },
    ],
  };

  // 处理文件选择
  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setSelectedFiles(prev => [...prev, ...files]);
      onFileUpload?.(files);
    };
    input.click();
  };

  // 移除已选文件
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 发送消息
  const handleSend = () => {
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim(), selectedFiles);
      setInput('');
      setSelectedFiles([]);
    }
  };

  // 处理键盘发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* 左侧栏 - 小黄人3D + 功能 + 状态 */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: 280 }}
        className="bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 flex flex-col"
      >
        {/* Logo区域 */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">NexMind</h1>
              <p className="text-xs text-slate-500">智能中枢</p>
            </div>
          </div>
        </div>

        {/* 小黄人3D展示区 */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* 背景光效 */}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent" />
          
          {/* 小黄人 */}
          <motion.div
            animate={minionState === 'idle' ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative z-10"
          >
            <MinionHero
              size="large"
              state={minionState}
              speechText={minionSpeech}
              showSpeechBubble={true}
              showStatus={true}
              animated={true}
            />
          </motion.div>

          {/* 状态指示 */}
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-slate-400">在线</span>
          </div>
        </div>

        {/* 功能按钮 */}
        <div className="p-4 border-t border-slate-800">
          <div className="space-y-2">
            {leftPanelItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-200">{item.label}</span>
                </div>
                {item.count && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-slate-900 rounded-full text-xs font-bold">
                    {item.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 底部设置 */}
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-300">设置</span>
          </button>
        </div>
      </motion.aside>

      {/* 中间区域 - 对话框 */}
      <main className="flex-1 flex flex-col bg-slate-900">
        {/* 顶部导航 */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">对话</h2>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
              已连接
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <Activity className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 对话区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">开始新对话</h3>
              <p className="text-slate-400 text-sm max-w-md">
                告诉小黄人你想做什么，它会帮你完成任务
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* 头像 */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                }`}>
                  {message.role === 'user' ? (
                    <span className="text-xl">👤</span>
                  ) : (
                    <span className="text-xl">🤖</span>
                  )}
                </div>

                {/* 消息内容 */}
                <div className={`max-w-[70%] space-y-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* 附件 */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {message.attachments.map((file, i) => (
                        <div key={i} className="px-3 py-2 bg-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          {file}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 消息气泡 */}
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* 时间 */}
                  <span className="text-xs text-slate-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="space-y-3">
            {/* 已选文件 */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-3 py-2 bg-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-2"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{file.name}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="ml-1 text-slate-500 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 输入框和按钮 */}
            <div className="flex gap-3">
              {/* 文件上传按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFileSelect}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Upload className="w-5 h-5" />
              </motion.button>

              {/* 输入框 */}
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入消息..."
                  rows={1}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-yellow-500 transition-colors"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>

              {/* 语音按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsListening(!isListening)}
                className={`p-3 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-5 h-5" />
              </motion.button>

              {/* 发送按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-3 rounded-xl transition-all ${
                  input.trim()
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 快捷提示 */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>按 Enter 发送 · Shift+Enter 换行</span>
              <span>{input.length}/2000</span>
            </div>
          </div>
        </div>
      </main>

      {/* 右侧栏 - 可收缩 */}
      <AnimatePresence>
        {isRightPanelOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden"
          >
            {/* 顶部 */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">智能体团队</h3>
              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Tab切换 */}
            <div className="px-4 py-3 border-b border-slate-800 flex gap-2">
              {[
                { id: 'agents', icon: Users, label: '智能体' },
                { id: 'memory', icon: Brain, label: '记忆' },
                { id: 'files', icon: FileText, label: '文件' },
                { id: 'settings', icon: Settings, label: '设置' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightPanelTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    rightPanelTab === tab.id
                      ? 'bg-yellow-500 text-slate-900'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 智能体列表 */}
              {rightPanelTab === 'agents' && (
                <div className="space-y-3">
                  {rightPanelContent.agents.map((agent, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                        {agent.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{agent.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{agent.status}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        agent.status === 'online' ? 'bg-green-500' :
                        agent.status === 'busy' ? 'bg-yellow-500' :
                        agent.status === 'idle' ? 'bg-slate-500' : 'bg-slate-600'
                      }`} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 记忆列表 */}
              {rightPanelTab === 'memory' && (
                <div className="space-y-3">
                  {rightPanelContent.memory.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 文件列表 */}
              {rightPanelTab === 'files' && (
                <div className="space-y-3">
                  {rightPanelContent.files.map((file, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                        {file.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{file.size}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 设置 */}
              {rightPanelTab === 'settings' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <h4 className="text-sm font-medium text-white mb-3">主题设置</h4>
                    <div className="space-y-2">
                      {['深色', '浅色', '系统'].map((theme) => (
                        <label key={theme} className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="theme" className="accent-yellow-500" />
                          <span className="text-sm text-slate-300">{theme}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 展开右侧栏按钮 */}
      {!isRightPanelOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsRightPanelOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-slate-800 border border-slate-700 rounded-l-lg text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
};

export default OpenHumanLayout;
