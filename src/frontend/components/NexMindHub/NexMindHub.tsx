// NexMindHub - 融合所有模块的统一界面
// MARVIS执行能力 + OpenHuman吉祥物 + 小黄人亲切感 + 办公室智能体

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiAgent } from '../../hooks/useMultiAgent';
import MinionAvatar from '../Minion/MinionAvatar';
import { MinionState } from '../Minion/MinionTypes';
import { AgentState, AGENTS_CONFIG, STATE_LABELS, EMOTION_EMOJI } from '../Office/types';

interface TaskResult {
  agentId: string;
  action: string;
  success: boolean;
  data?: any;
}

const NexMindHub: React.FC = () => {
  const {
    agents,
    agentConfigs,
    isRunning,
    messages,
    activeTask,
    startAgents,
    stopAgents,
    sendTask,
  } = useMultiAgent();

  const [taskInput, setTaskInput] = useState('');
  const [minionState, setMinionState] = useState<MinionState>(MinionState.IDLE);
  const [minionSpeech, setMinionSpeech] = useState('你好！我是NexMind的小黄人，有什么事需要帮忙吗？');
  const [showOffice, setShowOffice] = useState(true);
  const [selectedView, setSelectedView] = useState<'hub' | 'office' | 'multiagent'>('hub');

  useEffect(() => {
    if (activeTask) {
      setMinionState(MinionState.WORKING);
      setMinionSpeech('收到任务！我正在协调团队处理...');
    }
  }, [activeTask]);

  useEffect(() => {
    if (!activeTask && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'response') {
        setMinionState(MinionState.SPEAKING);
        setMinionSpeech('任务完成！还有什么需要帮忙的吗？');
        setTimeout(() => {
          setMinionState(MinionState.HAPPY);
          setTimeout(() => setMinionState(MinionState.IDLE), 2000);
        }, 3000);
      }
    }
  }, [messages, activeTask]);

  const handleSendTask = async () => {
    if (taskInput.trim() && isRunning) {
      setMinionState(MinionState.THINKING);
      setMinionSpeech('让我想想怎么处理这个任务...');
      
      const result = await sendTask(taskInput);
      
      if (result) {
        setMinionState(MinionState.SPEAKING);
        setMinionSpeech(`好的！我已经把任务分配给团队了，正在处理中...`);
      }
      
      setTaskInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendTask();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            🤖 NexMind Hub
          </h1>
          
          {/* 视图切换 */}
          <div className="flex gap-2">
            {[
              { id: 'hub', label: '🏠 主页', icon: '🏠' },
              { id: 'office', label: '🏢 办公室', icon: '🏢' },
              { id: 'multiagent', label: '⚙️ 协作', icon: '⚙️' },
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedView === view.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {view.icon} {view.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-400">
              {isRunning ? `${agents.size} 个智能体在线` : '已停止'}
            </span>
          </div>
          
          <button
            onClick={isRunning ? stopAgents : startAgents}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? '⏹️ 停止' : '▶️ 启动'}
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：小黄人 + 控制面板 */}
        <div className="w-96 bg-gray-800/30 border-r border-gray-700 flex flex-col">
          {/* 小黄人展示 */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col items-center">
              <MinionAvatar
                state={minionState}
                size="large"
                speechText={minionSpeech}
                showSpeechBubble={true}
                showStatus={true}
              />
            </div>
          </div>

          {/* 快捷命令 */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">🎯 快捷命令</h3>
            <div className="grid grid-cols-2 gap-2">
              {['📁 搜索文件', '⚙️ 系统状态', '📊 分析数据', '🖼️ 整理图片', '📚 知识检索', '🔍 综合搜索'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => isRunning && setTaskInput(cmd.replace(/^[^\s]+\s/, ''))}
                  disabled={!isRunning}
                  className="px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* 在线智能体状态 */}
          <div className="p-4 flex-1 overflow-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-3">👥 团队状态</h3>
            <div className="space-y-2">
              {agentConfigs.map(config => {
                const agent = agents.get(config.id);
                const isWorking = agent?.status === 'busy';
                const isActive = agent?.status === 'active';
                
                return (
                  <div
                    key={config.id}
                    className={`p-3 rounded-lg ${
                      isWorking ? 'bg-blue-900/30 border border-blue-500/50' :
                      isActive ? 'bg-gray-700/50 border border-gray-600' :
                      'bg-gray-800/50 border border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{config.icon}</span>
                        <div>
                          <p className="text-sm text-white">{config.name}</p>
                          <p className="text-xs text-gray-500">{config.id}</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        isWorking ? 'bg-blue-500 animate-pulse' :
                        isActive ? 'bg-green-500' :
                        'bg-gray-500'
                      }`} />
                    </div>
                    {isWorking && agent?.currentTask && (
                      <p className="mt-2 text-xs text-blue-400 truncate">
                        📌 {agent.currentTask}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 中间：主工作区 */}
        <div className="flex-1 flex flex-col">
          {selectedView === 'hub' && (
            <HubView
              agents={agents}
              agentConfigs={agentConfigs}
              messages={messages}
              isRunning={isRunning}
              taskInput={taskInput}
              onTaskInputChange={setTaskInput}
              onSendTask={handleSendTask}
              onKeyPress={handleKeyPress}
            />
          )}
          
          {selectedView === 'office' && (
            <OfficeView
              agents={agents}
              agentConfigs={agentConfigs}
            />
          )}
          
          {selectedView === 'multiagent' && (
            <MultiAgentView
              agents={agents}
              agentConfigs={agentConfigs}
              messages={messages}
            />
          )}
        </div>

        {/* 右侧：消息日志 */}
        <div className="w-80 bg-gray-800/30 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              📨 消息日志
              <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded">
                {messages.length}
              </span>
            </h3>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {messages.slice(-15).map((msg, idx) => {
              const fromConfig = agentConfigs.find(c => c.id === msg.from);
              const toConfig = agentConfigs.find(c => c.id === msg.to);
              
              const typeColors: Record<string, string> = {
                request: 'text-yellow-400 bg-yellow-900/20',
                response: 'text-green-400 bg-green-900/20',
                broadcast: 'text-blue-400 bg-blue-900/20',
              };
              
              return (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-2 rounded-lg ${typeColors[msg.type] || 'bg-gray-800'}`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span>{fromConfig?.icon || '👤'}</span>
                    <span className="text-gray-500">→</span>
                    <span>{toConfig?.icon || '🤖'}</span>
                  </div>
                  <p className="text-xs mt-1 text-gray-300 truncate">
                    [{msg.type}] {msg.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </motion.div>
              );
            })}
            
            {messages.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">
                暂无消息记录
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hub视图 - 融合界面
interface HubViewProps {
  agents: Map<string, any>;
  agentConfigs: Array<{ id: string; name: string; icon: string; color: string }>;
  messages: any[];
  isRunning: boolean;
  taskInput: string;
  onTaskInputChange: (v: string) => void;
  onSendTask: () => void;
  onKeyPress: (e: any) => void;
}

const HubView: React.FC<HubViewProps> = ({
  agents,
  agentConfigs,
  isRunning,
  taskInput,
  onTaskInputChange,
  onSendTask,
  onKeyPress,
}) => {
  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* 欢迎区域 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎉 欢迎使用 NexMind Hub
        </h2>
        <p className="text-gray-400">
          融合 MARVIS 执行能力 + OpenHuman 吉祥物 + 小黄人亲切感
        </p>
      </div>

      {/* 任务输入区 */}
      <div className="mb-8">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            💬 告诉小黄人你想做什么
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => onTaskInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="例如：帮我搜索项目文档并生成摘要"
              disabled={!isRunning}
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={onSendTask}
              disabled={!isRunning || !taskInput.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 发送任务
            </button>
          </div>
        </div>
      </div>

      {/* 智能体协作网格 */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">🤝 智能体协作网络</h3>
        <div className="grid grid-cols-3 gap-4">
          {agentConfigs.map(config => {
            const agent = agents.get(config.id);
            return (
              <AgentCard key={config.id} config={config} agent={agent} />
            );
          })}
        </div>
      </div>

      {/* 功能模块入口 */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">🧩 功能模块</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: '📁', title: '文件管理', desc: '搜索、整理、备份' },
            { icon: '⚙️', title: '系统控制', desc: '应用、设置、监控' },
            { icon: '📚', title: '知识库', desc: '检索、摘要、问答' },
            { icon: '📊', title: '数据分析', desc: '处理、报表、趋势' },
            { icon: '🖼️', title: '图片管理', desc: '分类、美化、整理' },
            { icon: '🔍', title: '综合搜索', desc: '全系统搜索' },
            { icon: '🎯', title: '任务协调', desc: '多智能体协作' },
            { icon: '⚡', title: '快速操作', desc: '常用功能' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <span className="text-2xl">{item.icon}</span>
              <h4 className="text-sm font-medium text-white mt-2">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 智能体卡片
const AgentCard: React.FC<{ config: any; agent?: any }> = ({ config, agent }) => {
  const isWorking = agent?.status === 'busy';
  const isActive = agent?.status === 'active';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl ${
        isWorking ? 'bg-blue-900/30 border border-blue-500/50' :
        isActive ? 'bg-gray-800/50 border border-gray-700' :
        'bg-gray-800/30 border border-gray-700 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: config.color + '30' }}
        >
          {config.icon}
        </div>
        <div>
          <h4 className="font-medium text-white">{config.name}</h4>
          <p className="text-xs text-gray-400">
            {isWorking ? '工作中...' : isActive ? '空闲' : '离线'}
          </p>
        </div>
      </div>
      
      {isWorking && agent?.progress !== undefined && (
        <div className="mt-2">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${agent.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round(agent.progress)}%
          </p>
        </div>
      )}
    </motion.div>
  );
};

// 办公室视图
const OfficeView: React.FC<{ agents: Map<string, any>; agentConfigs: any[] }> = ({ agents, agentConfigs }) => {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">🏢 虚拟办公室</h2>
        <p className="text-gray-400 text-sm">点击智能体查看详情</p>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {agentConfigs.map(config => {
          const agent = agents.get(config.id);
          return (
            <OfficeAgentCard key={config.id} config={config} agent={agent} />
          );
        })}
      </div>
    </div>
  );
};

const OfficeAgentCard: React.FC<{ config: any; agent?: any }> = ({ config, agent }) => {
  const state = agent?.state || 'idle';
  const stateLabel = state.charAt(0).toUpperCase() + state.slice(1);
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
    >
      <div className="text-center">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
          style={{ backgroundColor: config.color + '30' }}
        >
          {config.icon}
        </div>
        <h3 className="text-lg font-medium text-white">{config.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{config.id}</p>
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            agent?.status === 'busy' ? 'bg-blue-500 animate-pulse' :
            agent?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <span className="text-sm text-gray-300">{stateLabel}</span>
        </div>
        
        {agent?.currentTask && (
          <p className="mt-2 text-xs text-blue-400 truncate">
            {agent.currentTask}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// 多智能体视图
const MultiAgentView: React.FC<{ agents: Map<string, any>; agentConfigs: any[]; messages: any[] }> = ({ agents, agentConfigs, messages }) => {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">⚙️ 多智能体协作系统</h2>
        <p className="text-gray-400 text-sm">实时监控智能体间的消息传递</p>
      </div>
      
      {/* 协作图 */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
        <CollaborationGraph agentConfigs={agentConfigs} messages={messages} />
      </div>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '在线智能体', value: Array.from(agents.values()).filter(a => a.status !== 'stopped').length, icon: '🤖' },
          { label: '忙碌智能体', value: Array.from(agents.values()).filter(a => a.status === 'busy').length, icon: '⚡' },
          { label: '消息总数', value: messages.length, icon: '📨' },
          { label: '空闲智能体', value: Array.from(agents.values()).filter(a => a.status === 'active').length, icon: '💤' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 协作关系图（简化版）
const CollaborationGraph: React.FC<{ agentConfigs: any[]; messages: any[] }> = ({ agentConfigs, messages }) => {
  const positions = [
    { x: 200, y: 50 },
    { x: 80, y: 180 },
    { x: 200, y: 180 },
    { x: 320, y: 180 },
    { x: 80, y: 310 },
    { x: 320, y: 310 },
  ];
  
  return (
    <div className="relative h-80 bg-gray-900 rounded-lg overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {/* 连接线 */}
        {agentConfigs.map((_, idx) => {
          const center = { x: 200, y: 100 };
          const pos = positions[idx];
          const isActive = messages.length > idx * 2;
          
          return (
            <line
              key={idx}
              x1={center.x}
              y1={center.y}
              x2={pos.x}
              y2={pos.y}
              stroke={isActive ? '#3B82F6' : '#374151'}
              strokeWidth={isActive ? 2 : 1}
              strokeDasharray={isActive ? '0' : '4'}
            />
          );
        })}
      </svg>
      
      {/* 中心节点 - 全能助手 */}
      <div
        className="absolute"
        style={{ left: 170, top: 70 }}
      >
        <div className="w-16 h-16 bg-cyan-500/30 rounded-full flex items-center justify-center text-2xl border-2 border-cyan-500">
          🔍
        </div>
        <p className="text-xs text-center text-white mt-1">全能助手</p>
      </div>
      
      {/* 外围节点 */}
      {agentConfigs.slice(0, 5).map((config, idx) => {
        const pos = positions[idx];
        return (
          <div
            key={config.id}
            className="absolute"
            style={{ left: pos.x - 30, top: pos.y - 30 }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl border-2"
              style={{ 
                backgroundColor: config.color + '30',
                borderColor: config.color
              }}
            >
              {config.icon}
            </div>
            <p className="text-xs text-center text-gray-400 mt-1">{config.name.slice(0, 4)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default NexMindHub;
