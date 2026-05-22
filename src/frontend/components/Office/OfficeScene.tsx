// OfficeScene - MARVIS风格的虚拟办公室场景
// 6个智能体在办公室中工作、休息的拟人化界面

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AgentState,
  EmotionType,
  AgentInfo,
  AgentStatus,
  Position,
  AGENTS_CONFIG,
  STATE_EMOTION_MAP,
  STATE_LABELS,
  EMOTION_EMOJI,
  STATE_ICONS,
} from './types';

// 单个智能体组件
const AgentCard: React.FC<{
  agent: AgentInfo;
  status: AgentStatus;
  position: Position;
  onClick: () => void;
}> = ({ agent, status, position, onClick }) => {
  const emotion = status.emotion.type;
  const stateLabel = STATE_LABELS[status.state];
  const emotionEmoji = EMOTION_EMOJI[emotion];
  const stateIcon = STATE_ICONS[status.state];

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: position.x, top: position.y }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      {/* 智能体卡片 */}
      <div className="relative">
        {/* 主体 */}
        <motion.div
          className="w-20 h-24 rounded-lg shadow-lg overflow-hidden"
          style={{ backgroundColor: agent.color }}
          animate={getAnimationForState(status.state)}
        >
          {/* 头部 */}
          <div className="h-1/2 bg-white/20 flex items-center justify-center">
            <motion.span
              className="text-3xl"
              animate={getIconAnimation(status.state)}
            >
              {agent.icon}
            </motion.span>
          </div>

          {/* 身体 */}
          <div className="h-1/2 bg-white/10 flex items-center justify-center">
            <span className="text-xs text-white font-bold">{agent.name}</span>
          </div>
        </motion.div>

        {/* 表情覆盖 */}
        <motion.div
          className="absolute -top-2 -right-2 text-2xl"
          animate={getEmotionAnimation(status.state)}
        >
          {emotionEmoji}
        </motion.div>

        {/* 状态指示 */}
        <motion.div
          className="absolute -bottom-6 left-0 right-0 flex flex-col items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gray-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
            {stateIcon} {stateLabel}
          </div>
        </motion.div>

        {/* 工作特效 */}
        <AnimatePresence>
          {status.state === AgentState.WORKING && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -20 }}
              exit={{ opacity: 0, y: 0 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl"
            >
              ✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* 进度条 */}
        {status.state === AgentState.WORKING && status.progress !== undefined && (
          <motion.div
            className="absolute -bottom-10 left-0 right-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* 气泡消息 */}
      <AnimatePresence>
        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2"
          >
            <div className="bg-white rounded-lg px-3 py-2 shadow-lg max-w-xs">
              <p className="text-sm text-gray-800 whitespace-nowrap">
                {status.message}
              </p>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 智能体详情面板
const AgentDetailPanel: React.FC<{
  agent: AgentInfo;
  status: AgentStatus;
  onClose: () => void;
}> = ({ agent, status, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="fixed left-4 top-1/4 w-80 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50"
    >
      {/* 头部 */}
      <div className="p-4" style={{ backgroundColor: agent.color }}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{agent.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-white">{agent.name}</h3>
            <p className="text-sm text-white/80">{agent.role}</p>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4 space-y-4">
        {/* 当前状态 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">当前状态</h4>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{EMOTION_EMOJI[status.emotion.type]}</span>
            <div>
              <p className="text-white">{STATE_LABELS[status.state]}</p>
              <p className="text-xs text-gray-400">
                情感强度: {status.emotion.intensity}%
              </p>
            </div>
          </div>
        </div>

        {/* 当前任务 */}
        {status.currentTask && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">当前任务</h4>
            <p className="text-white">{status.currentTask}</p>
            {status.progress !== undefined && (
              <div className="mt-2">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${status.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  进度: {status.progress}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* 能力列表 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">能力</h4>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.map((cap, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* 描述 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">描述</h4>
          <p className="text-gray-300 text-sm">{agent.description}</p>
        </div>
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
      >
        ✕
      </button>
    </motion.div>
  );
};

// 办公室场景主组件
const OfficeScene: React.FC = () => {
  const [agents, setAgents] = useState<
    Map<string, { status: AgentStatus; position: Position }>
  >(new Map());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  // 初始化智能体状态
  useEffect(() => {
    const initialAgents = new Map<
      string,
      { status: AgentStatus; position: Position }
    >();

    const positions = [
      { x: 50, y: 80 },
      { x: 200, y: 80 },
      { x: 350, y: 80 },
      { x: 50, y: 250 },
      { x: 200, y: 250 },
      { x: 350, y: 250 },
    ];

    AGENTS_CONFIG.forEach((agent, index) => {
      initialAgents.set(agent.id, {
        status: {
          state: AgentState.IDLE,
          emotion: {
            type: STATE_EMOTION_MAP[AgentState.IDLE],
            intensity: 50,
            duration: 0,
          },
          lastStateChange: new Date(),
        },
        position: positions[index],
      });
    });

    setAgents(initialAgents);
  }, []);

  // 模拟智能体状态变化
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());

      setAgents((prev) => {
        const updated = new Map(prev);

        updated.forEach((value, agentId) => {
          // 随机状态变化
          const rand = Math.random();

          if (rand < 0.1) {
            // 10%概率开始工作
            const workStates = [AgentState.WORKING, AgentState.THINKING];
            const newState = workStates[Math.floor(Math.random() * workStates.length)];

            value.status = {
              ...value.status,
              state: newState,
              emotion: {
                type: STATE_EMOTION_MAP[newState],
                intensity: 70,
                duration: 0,
              },
              lastStateChange: new Date(),
              currentTask: getRandomTask(agentId),
              progress: 0,
            };
          } else if (rand < 0.15 && value.status.state === AgentState.WORKING) {
            // 工作完成后进入休息
            const restStates = [
              AgentState.DOZING,
              AgentState.EXERCISING,
              AgentState.RELAXING,
            ];
            const newState = restStates[Math.floor(Math.random() * restStates.length)];

            value.status = {
              ...value.status,
              state: newState,
              emotion: {
                type: STATE_EMOTION_MAP[newState],
                intensity: 60,
                duration: 0,
              },
              lastStateChange: new Date(),
              currentTask: undefined,
              progress: undefined,
              message: '任务完成！休息一下~',
            };
          } else if (
            value.status.state === AgentState.WORKING &&
            value.status.progress !== undefined
          ) {
            // 更新进度
            value.status = {
              ...value.status,
              progress: Math.min(100, value.status.progress + Math.random() * 10),
            };
          }
        });

        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 生成随机任务
  const getRandomTask = (agentId: string): string => {
    const tasks: Record<string, string[]> = {
      file: ['搜索文件...', '整理文档...', '备份数据...'],
      system: ['启动应用...', '监控系统...', '调整设置...'],
      knowledge: ['检索知识...', '生成摘要...', '回答问题...'],
      image: ['分类图片...', '美化照片...', '整理相册...'],
      data: ['分析数据...', '生成报表...', '可视化...'],
      general: ['协调任务...', '处理请求...', '监控系统...'],
    };

    const agentTasks = tasks[agentId] || ['处理任务...'];
    return agentTasks[Math.floor(Math.random() * agentTasks.length)];
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-200 via-blue-100 to-green-100 overflow-hidden">
      {/* 办公室背景 */}
      <OfficeBackground time={time} />

      {/* 办公室地面 */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-800 to-amber-700">
        {/* 地板纹理 */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-full border-l border-black/10"
              style={{ left: `${i * 10}%` }}
            />
          ))}
        </div>
      </div>

      {/* 智能体们 */}
      {AGENTS_CONFIG.map((agent) => {
        const agentData = agents.get(agent.id);
        if (!agentData) return null;

        return (
          <AgentCard
            key={agent.id}
            agent={agent}
            status={agentData.status}
            position={agentData.position}
            onClick={() => setSelectedAgent(agent.id)}
          />
        );
      })}

      {/* 选中的智能体详情 */}
      <AnimatePresence>
        {selectedAgent && (
          <AgentDetailPanel
            agent={AGENTS_CONFIG.find((a) => a.id === selectedAgent)!}
            status={agents.get(selectedAgent)!.status}
            onClose={() => setSelectedAgent(null)}
          />
        )}
      </AnimatePresence>

      {/* 时间显示 */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <p className="text-lg font-bold text-gray-800">
          {time.toLocaleTimeString()}
        </p>
        <p className="text-sm text-gray-600">
          {time.toLocaleDateString()}
        </p>
      </div>

      {/* 标题 */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🏢 NexMind 智能办公室
        </h2>
        <p className="text-sm text-gray-600">
          {agents.size} 个智能体在线
        </p>
      </div>
    </div>
  );
};

// 办公室背景
const OfficeBackground: React.FC<{ time: Date }> = ({ time }) => {
  const hour = time.getHours();
  const isDay = hour >= 6 && hour < 18;

  return (
    <div className="absolute inset-0">
      {/* 天空 */}
      <div
        className={`absolute inset-0 ${
          isDay
            ? 'bg-gradient-to-b from-blue-400 to-blue-200'
            : 'bg-gradient-to-b from-gray-800 to-gray-600'
        }`}
      />

      {/* 云朵（白天） */}
      {isDay && (
        <>
          <motion.div
            className="absolute top-10 left-10 w-32 h-16 bg-white/80 rounded-full"
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-20 right-20 w-24 h-12 bg-white/60 rounded-full"
            animate={{ x: [0, -15, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </>
      )}

      {/* 窗户 */}
      <div className="absolute top-10 left-1/4 w-48 h-32 bg-white/30 border-4 border-amber-900 rounded-lg" />
      <div className="absolute top-10 right-1/4 w-48 h-32 bg-white/30 border-4 border-amber-900 rounded-lg" />

      {/* 植物 */}
      <motion.div
        className="absolute bottom-1/3 left-10 text-6xl"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🌿
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 right-10 text-6xl"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        🌵
      </motion.div>
    </div>
  );
};

// 获取状态对应的动画
function getAnimationForState(state: AgentState) {
  const animations = {
    [AgentState.IDLE]: {
      y: [0, -2, 0],
      transition: { duration: 2, repeat: Infinity },
    },
    [AgentState.WORKING]: {
      y: [0, -5, 0, 2, 0],
      transition: { duration: 0.5, repeat: Infinity },
    },
    [AgentState.THINKING]: {
      x: [0, -2, 2, -2, 0],
      transition: { duration: 0.3, repeat: Infinity },
    },
    [AgentState.DOZING]: {
      y: [0, -1, 0],
      rotate: [0, -2, 2, 0],
      transition: { duration: 3, repeat: Infinity },
    },
    [AgentState.EXERCISING]: {
      y: [0, -10, 0, -5, 0],
      transition: { duration: 0.4, repeat: Infinity },
    },
    [AgentState.RELAXING]: {
      y: [0, -3, 0],
      transition: { duration: 2.5, repeat: Infinity },
    },
  };

  return animations[state] || animations[AgentState.IDLE];
}

// 获取图标的动画
function getIconAnimation(state: AgentState) {
  if (state === AgentState.WORKING) {
    return {
      rotate: [0, 360],
      transition: { duration: 2, repeat: Infinity },
    };
  }

  if (state === AgentState.THINKING) {
    return {
      scale: [1, 1.2, 1],
      transition: { duration: 1, repeat: Infinity },
    };
  }

  return {};
}

// 获取情感的动画
function getEmotionAnimation(state: AgentState) {
  if (state === AgentState.EXCITED || state === AgentState.HAPPY) {
    return {
      scale: [1, 1.3, 1],
      transition: { duration: 0.5, repeat: Infinity },
    };
  }

  return {};
}

export default OfficeScene;
