// MultiAgentPanel - 多智能体交互面板
// 展示智能体状态、消息流和协作可视化

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiAgent, AgentInfo, AgentMessage } from '../../hooks/useMultiAgent';
import { AgentState, EmotionType, STATE_LABELS, EMOTION_EMOJI, STATE_ICONS } from '../Office/types';

const MultiAgentPanel: React.FC = () => {
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
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showMessageLog, setShowMessageLog] = useState(false);

  const handleSendTask = () => {
    if (taskInput.trim() && isRunning) {
      sendTask(taskInput);
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
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 头部控制栏 */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🤖 多智能体协作系统
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-400">
              {isRunning ? '运行中' : '已停止'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMessageLog(!showMessageLog)}
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            📨 消息日志 ({messages.length})
          </button>
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
        {/* 智能体网格 */}
        <div className="flex-1 p-6 overflow-auto">
          <h3 className="text-lg font-semibold text-white mb-4">智能体状态</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {agentConfigs.map(config => {
              const agent = agents.get(config.id);
              return (
                <AgentCard
                  key={config.id}
                  config={config}
                  agent={agent}
                  isSelected={selectedAgent === config.id}
                  onClick={() => setSelectedAgent(selectedAgent === config.id ? null : config.id)}
                />
              );
            })}
          </div>

          {/* 活跃任务显示 */}
          {activeTask && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg"
            >
              <h4 className="text-sm font-medium text-blue-400 mb-2">🔄 执行中的任务</h4>
              <p className="text-white">{activeTask}</p>
            </motion.div>
          )}
        </div>

        {/* 消息日志面板 */}
        <AnimatePresence>
          {showMessageLog && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gray-700 bg-gray-900/50 overflow-hidden"
            >
              <div className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">📨 消息日志</h3>
                
                <div className="flex-1 overflow-auto space-y-2">
                  {messages.slice(-20).map((msg, idx) => (
                    <MessageItem key={msg.id || idx} message={msg} agentConfigs={agentConfigs} />
                  ))}
                  
                  {messages.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-8">
                      暂无消息记录
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 任务输入栏 */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入任务描述，如：帮我搜索项目文档并生成摘要"
            disabled={!isRunning}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendTask}
            disabled={!isRunning || !taskInput.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送任务
          </button>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">示例任务：</span>
          {['搜索文件', '监控系统', '分析数据', '整理图片'].map(task => (
            <button
              key={task}
              onClick={() => setTaskInput(task)}
              disabled={!isRunning}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-50"
            >
              {task}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AgentCardProps {
  config: { id: string; name: string; icon: string; color: string };
  agent?: AgentInfo;
  isSelected: boolean;
  onClick: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ config, agent, isSelected, onClick }) => {
  const stateIcon = agent ? STATE_ICONS[agent.state as AgentState] || '❓' : '⏸️';
  const stateLabel = agent ? STATE_LABELS[agent.state as AgentState] || '未知' : '未启动';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${
        agent?.status === 'busy'
          ? 'bg-blue-900/30 border border-blue-500/50'
          : agent?.status === 'active'
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-gray-900/50 border border-gray-700 opacity-60'
      }`}
    >
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: config.color + '30' }}
        >
          {config.icon}
        </div>
        <div>
          <h4 className="font-medium text-white">{config.name}</h4>
          <p className="text-xs text-gray-400">{config.id}</p>
        </div>
      </div>

      {/* 状态 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{stateIcon}</span>
          <span className="text-sm text-gray-300">{stateLabel}</span>
        </div>
        
        {agent?.status === 'busy' && agent.progress !== undefined && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${agent.progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{Math.round(agent.progress)}%</span>
          </div>
        )}
      </div>

      {/* 当前任务 */}
      {agent?.currentTask && (
        <div className="mt-2 px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300 truncate">
          {agent.currentTask}
        </div>
      )}

      {/* 消息气泡 */}
      {agent?.message && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 px-2 py-1 bg-blue-600/30 rounded text-xs text-blue-300"
        >
          {agent.message}
        </motion.div>
      )}

      {/* 工作指示器 */}
      {agent?.status === 'busy' && (
        <motion.div
          className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

interface MessageItemProps {
  message: AgentMessage;
  agentConfigs: Array<{ id: string; name: string; icon: string }>;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, agentConfigs }) => {
  const getAgentName = (id: string) => {
    const config = agentConfigs.find(c => c.id === id);
    return config?.name || (id === 'user' ? '用户' : id);
  };

  const getAgentIcon = (id: string) => {
    const config = agentConfigs.find(c => c.id === id);
    return config?.icon || (id === 'user' ? '👤' : '🤖');
  };

  const typeColors: Record<string, string> = {
    request: 'text-yellow-400 bg-yellow-900/20',
    response: 'text-green-400 bg-green-900/20',
    broadcast: 'text-blue-400 bg-blue-900/20',
    notification: 'text-purple-400 bg-purple-900/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-2 rounded-lg ${typeColors[message.type] || 'bg-gray-800'}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span>{getAgentIcon(message.from)}</span>
        <span className="text-xs font-medium">{getAgentName(message.from)}</span>
        <span className="text-xs text-gray-500">→</span>
        <span>{getAgentIcon(message.to)}</span>
        <span className="text-xs font-medium">{getAgentName(message.to)}</span>
      </div>
      <div className="text-xs text-gray-300 truncate">
        [{message.type}] {message.action}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </motion.div>
  );
};

export default MultiAgentPanel;
