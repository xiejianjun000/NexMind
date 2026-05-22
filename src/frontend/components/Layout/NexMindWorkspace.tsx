// NexMindWorkspace - MARVIS风格 + 小黄人融合界面
// 三栏布局：深色左侧栏 + 浅色中间栏 + 可收缩右侧栏
// 融合MARVIS专业执行 + 小黄人亲切形象

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Search,
  Settings,
  Sparkles,
  Zap,
  FileText,
  Users,
  Layers,
  Brain,
  Terminal,
  CheckCircle2,
  Loader2,
  XCircle,
  Image,
  X,
  Home,
  Calendar,
  Star,
  FolderOpen,
  MessageSquare,
  Bot,
  Send,
  Mic,
  Upload
} from 'lucide-react';
import MinionHero, { MinionState } from '../Minion/MinionHero';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  screenshot?: string;
}

interface ToolCall {
  id: string;
  name: string;
  command: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  status: 'online' | 'busy' | 'offline' | 'idle';
  specialty: string;
}

interface Task {
  id: string;
  title: string;
  project: string;
  status: 'pending' | 'running' | 'completed';
}

interface RecentConversation {
  id: string;
  icon: string;
  preview: string;
  time: string;
  type: 'chat' | 'notification' | 'file' | 'system';
}

const NexMindWorkspace: React.FC = () => {
  // 状态管理
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'conversation' | 'studio'>('conversation');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [minionState, setMinionState] = useState<MinionState>('idle');
  const [minionSpeech, setMinionSpeech] = useState('你好！我是NexMind，随时待命！');
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(480);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  
  // 模拟数据
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'chat' | 'docs'>('chat');
  
  // Agent列表
  const agents: Agent[] = [
    { id: '1', name: 'QClaw', avatar: '🔴', description: '靠谱、话少、有事真上', status: 'online', specialty: '全栈执行' },
    { id: '2', name: 'Designer', avatar: '🎨', description: '设计创意专家', status: 'busy', specialty: 'UI/UX' },
    { id: '3', name: 'Analyst', avatar: '📊', description: '数据分析专家', status: 'idle', specialty: 'BI报表' },
    { id: '4', name: 'Coder', avatar: '💻', description: '代码架构师', status: 'offline', specialty: '架构设计' },
  ];
  
  // 任务列表
  const tasks: Task[] = [
    { id: '1', title: '生成项目Code Wiki', project: 'xiejianjun000/audit-eco', status: 'running' },
  ];
  
  // 最近对话
  const recentConversations: RecentConversation[] = [
    { id: '1', icon: '💬', preview: '你再去看一下HEIMES飞...', time: '10:30', type: 'chat' },
    { id: '2', icon: '🔔', preview: 'QClaw移动端消息', time: '09:45', type: 'notification' },
    { id: '3', icon: '💬', preview: '微信消息·估计今天4000...', time: '09:20', type: 'chat' },
    { id: '4', icon: '📁', preview: '把C:\\Users\\Administra...', time: '昨天', type: 'file' },
    { id: '5', icon: '💬', preview: '更新了?', time: '昨天', type: 'chat' },
  ];
  
  // 项目列表
  const projects = [
    'Taiji Agent 项目',
    '生态环境智能体平台',
    'GovMCP Repository',
    'openTaiji',
  ];

  // 收藏
  const favorites = [
    'VirtualTeam一人公司',
    '安装11个Skill',
  ];

  // 处理鼠标拖拽
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLeftDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);
  }, []);

  const handleRightDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      
      if (isDraggingLeft) {
        const newWidth = e.clientX - containerRect.left;
        if (newWidth >= 200 && newWidth <= 400) {
          setLeftWidth(newWidth);
        }
      }
      
      if (isDraggingRight) {
        const newWidth = containerRect.right - e.clientX;
        if (newWidth >= 300 && newWidth <= 600) {
          setRightWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingLeft, isDraggingRight]);

  // 处理发送消息
  const handleSend = () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: input,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // 模拟助手响应
      setMinionState('thinking');
      setMinionSpeech('让我想想怎么处理...');
      
      setTimeout(() => {
        setMinionState('working');
        setMinionSpeech('正在执行命令...');
        
        const toolCall: ToolCall = {
          id: `tool-${Date.now()}`,
          name: 'PowerShell',
          command: 'Get-Process | Where-Object {$_.CPU -gt 100}',
          status: 'running',
        };
        
        setTimeout(() => {
          toolCall.status = 'completed';
          toolCall.result = '进程查询完成';
          
          const assistantMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: '任务执行完成！已为你处理好了。',
            timestamp: new Date(),
            toolCalls: [toolCall],
          };
          setMessages(prev => [...prev, assistantMessage]);
          
          setMinionState('speaking');
          setMinionSpeech('完成啦！还有其他需要帮忙的吗？');
          
          setTimeout(() => {
            setMinionState('happy');
            setTimeout(() => {
              setMinionState('idle');
              setMinionSpeech('随时待命中...');
            }, 2000);
          }, 3000);
        }, 1500);
      }, 1500);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 文件上传
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setSelectedFiles(files);
    };
    input.click();
  };

  // 移除文件
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div ref={containerRef} className="h-screen flex overflow-hidden">
      {/* ════════════════════════════════════════════════════ */}
      {/* 左侧栏 - 深色主题 + 小黄人吉祥物 */}
      {/* ════════════════════════════════════════════════════ */}
      <motion.div
        style={{ width: leftWidth }}
        className="bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col border-r border-slate-800"
      >
        {/* Logo和标签页 */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">NexMind</h1>
                <p className="text-xs text-slate-500">智能中枢</p>
              </div>
            </div>
          </div>
          
          {/* 标签页 */}
          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
            {[
              { id: 'code', label: '代码', icon: Terminal },
              { id: 'chat', label: '聊天', icon: MessageSquare },
              { id: 'docs', label: '文档', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        {/* 小黄人展示区 */}
        <div className="px-4 pb-4">
          <div className="relative">
            <MinionHero
              size="medium"
              state={minionState}
              speechText={minionSpeech}
              showSpeechBubble={true}
              showStatus={true}
              animated={true}
            />
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="px-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>快捷操作</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>
          {[
            { icon: Plus, label: '新建任务', color: 'text-teal-400' },
            { icon: Zap, label: '技能', color: 'text-yellow-400' },
            { icon: Layers, label: '自动化', color: 'text-purple-400' },
          ].map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all group"
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 当前任务 */}
        {tasks.length > 0 && (
          <div className="px-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span>当前任务</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>
            <div className="space-y-1">
              {tasks.map((task) => (
                <div key={task.id} className="px-3 py-2 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'running' ? 'bg-yellow-500 animate-pulse' :
                      task.status === 'completed' ? 'bg-green-500' : 'bg-slate-500'
                    }`} />
                    <span className="text-sm text-white truncate">{task.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">{task.project}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 项目列表 */}
        <div className="px-4 mt-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <FolderOpen className="w-3 h-3" />
            <span>项目</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>
          <div className="space-y-1">
            {projects.map((project, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all"
              >
                <span className="text-sm truncate">{project}</span>
              </button>
            ))}
          </div>

          {/* 收藏 */}
          <div className="mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Star className="w-3 h-3" />
              <span>收藏</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>
            <div className="space-y-1">
              {favorites.map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all"
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm truncate">{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部设置 */}
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm">设置</span>
          </button>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════ */}
      {/* 左侧分隔条 - 可拖拽 */}
      {/* ════════════════════════════════════════════════════ */}
      <div
        onMouseDown={handleLeftDividerMouseDown}
        className={`w-1 cursor-col-resize group relative flex-shrink-0 ${
          isDraggingLeft ? 'bg-teal-500' : 'bg-transparent hover:bg-teal-500/20'
        } transition-colors`}
      >
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-slate-700 group-hover:bg-teal-500 transition-colors rounded-full" />
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* 中间栏 - Agent控制台 */}
      {/* ════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col bg-slate-50 min-w-0">
        {/* 顶部 */}
        <header className="h-16 px-6 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">用户</h2>
              <p className="text-xs text-slate-500">在线</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Agent列表 */}
        <div className="p-6 space-y-4">
          {/* 新建Agent按钮 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">+ 新建 Agent</span>
          </motion.button>

          {/* Agent卡片 */}
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl">
                      {agent.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      agent.status === 'online' ? 'bg-green-500' :
                      agent.status === 'busy' ? 'bg-yellow-500' :
                      agent.status === 'idle' ? 'bg-slate-400' : 'bg-slate-300'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{agent.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{agent.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{agent.specialty}</span>
                      <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                        agent.status === 'online' ? 'bg-green-100 text-green-700' :
                        agent.status === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                        agent.status === 'idle' ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* 任务输入框 */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="告诉小黄人你想做什么..."
              rows={3}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 resize-none focus:outline-none text-sm"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFileUpload}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsListening(!isListening)}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  input.trim()
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>发送</span>
              </motion.button>
            </div>
          </div>

          {/* 最近对话 */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <MessageSquare className="w-3 h-3" />
              <span>最近对话</span>
            </div>
            <div className="space-y-2">
              {recentConversations.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all text-left"
                >
                  <span className="text-lg">{conv.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{conv.preview}</p>
                    <p className="text-xs text-slate-400 mt-1">{conv.time}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ════════════════════════════════════════════════════ */}
      {/* 右侧分隔条 - 可拖拽 */}
      {/* ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isRightPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 1, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-1 cursor-col-resize group relative flex-shrink-0 bg-transparent hover:bg-teal-500/20 transition-colors"
            onMouseDown={handleRightDividerMouseDown}
          >
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-slate-700 group-hover:bg-teal-500 transition-colors rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════ */}
      {/* 右侧栏 - 可收缩工作区 */}
      {/* ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isRightPanelOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: rightWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-l border-slate-200 flex flex-col overflow-hidden"
          >
            {/* 顶部Tab切换 */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {[
                  { id: 'conversation', label: '对话' },
                  { id: 'studio', label: '工作室' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRightPanelTab(tab.id as any)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      rightPanelTab === tab.id
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 对话内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400/20 to-cyan-400/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-teal-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">开始对话</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    在中间栏输入任务，小黄人会帮你执行
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* 头像 */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                        : message.role === 'system'
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-500'
                        : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    }`}>
                      {message.role === 'user' ? (
                        <span className="text-sm">👤</span>
                      ) : message.role === 'system' ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-sm">🤖</span>
                      )}
                    </div>

                    {/* 消息内容 */}
                    <div className={`max-w-[85%] space-y-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* 消息气泡 */}
                      <div className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-md'
                          : message.role === 'system'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-tl-md'
                          : 'bg-slate-100 text-slate-900 rounded-tl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {/* 工具调用 */}
                      {message.toolCalls && message.toolCalls.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Zap className="w-3 h-3" />
                            <span>工具调用</span>
                          </div>
                          {message.toolCalls.map((tool) => (
                            <div key={tool.id} className="bg-slate-900 rounded-lg p-3 text-white">
                              <div className="flex items-center gap-2 mb-2">
                                {tool.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                                {tool.status === 'running' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                                {tool.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                                <span className="text-xs text-slate-400">{tool.name}</span>
                              </div>
                              <code className="text-xs text-green-400 font-mono block truncate">
                                {tool.command}
                              </code>
                              {tool.result && (
                                <p className="text-xs text-slate-400 mt-2">{tool.result}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 时间 */}
                      <span className="text-xs text-slate-400">
                        {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 展开按钮 */}
      {!isRightPanelOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsRightPanelOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white border border-slate-200 rounded-l-lg shadow-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
};

export default NexMindWorkspace;
