// useMultiAgent - 智能体状态管理Hook
// 前端与后端智能体系统的通信桥梁

import { useState, useEffect, useCallback, useRef } from 'react';

export type AgentStatus = 'idle' | 'active' | 'busy' | 'error' | 'stopped';
export type AgentState = 'idle' | 'working' | 'thinking' | 'communicating' | 'dozing' | 'exercising';

export interface AgentInfo {
  id: string;
  name: string;
  status: AgentStatus;
  state: AgentState;
  currentTask?: string;
  progress?: number;
  message?: string;
  lastStateChange: Date;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'broadcast' | 'notification';
  action: string;
  payload: any;
  timestamp: Date;
}

export interface TaskResult {
  agentId: string;
  action: string;
  success: boolean;
  data?: any;
  error?: string;
}

const AGENT_CONFIG = [
  { id: 'file-agent', name: '文件管理员', icon: '📁', color: '#4CAF50' },
  { id: 'system-agent', name: '系统操控师', icon: '⚙️', color: '#2196F3' },
  { id: 'knowledge-agent', name: '知识库管理员', icon: '📚', color: '#FF9800' },
  { id: 'image-agent', name: '图片整理师', icon: '🖼️', color: '#E91E63' },
  { id: 'data-agent', name: '数据分析师', icon: '📊', color: '#9C27B0' },
  { id: 'general-agent', name: '全能助手', icon: '🔍', color: '#00BCD4' },
];

export function useMultiAgent() {
  const [agents, setAgents] = useState<Map<string, AgentInfo>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const messageIdCounter = useRef(0);

  const initializeAgents = useCallback(() => {
    const initialAgents = new Map<string, AgentInfo>();
    
    AGENT_CONFIG.forEach(config => {
      initialAgents.set(config.id, {
        id: config.id,
        name: config.name,
        status: 'stopped',
        state: 'idle',
        lastStateChange: new Date(),
      });
    });

    setAgents(initialAgents);
  }, []);

  const startAgents = useCallback(async () => {
    console.log('[useMultiAgent] Starting agents...');
    
    setAgents(prev => {
      const updated = new Map(prev);
      updated.forEach((agent, id) => {
        updated.set(id, {
          ...agent,
          status: 'active',
          state: 'idle',
          lastStateChange: new Date(),
        });
      });
      return updated;
    });

    setIsRunning(true);
    startSimulation();
  }, []);

  const stopAgents = useCallback(() => {
    console.log('[useMultiAgent] Stopping agents...');
    
    setAgents(prev => {
      const updated = new Map(prev);
      updated.forEach((agent, id) => {
        updated.set(id, {
          ...agent,
          status: 'stopped',
          state: 'idle',
          lastStateChange: new Date(),
        });
      });
      return updated;
    });

    setIsRunning(false);
    setActiveTask(null);
  }, []);

  const sendTask = useCallback(async (taskDescription: string) => {
    if (!isRunning) {
      console.warn('[useMultiAgent] Agents not running');
      return null;
    }

    console.log('[useMultiAgent] Sending task:', taskDescription);
    setActiveTask(taskDescription);

    const taskId = `task-${Date.now()}`;
    const subtasks = decomposeTask(taskDescription);

    const results: TaskResult[] = [];

    for (const subtask of subtasks) {
      const messageId = `msg-${++messageIdCounter.current}-${Date.now()}`;
      
      setAgents(prev => {
        const updated = new Map(prev);
        const agent = updated.get(subtask.agentId);
        if (agent) {
          updated.set(subtask.agentId, {
            ...agent,
            status: 'busy',
            state: 'working',
            currentTask: subtask.action,
            progress: 0,
            lastStateChange: new Date(),
          });
        }
        return updated;
      });

      addMessage({
        id: messageId,
        from: 'user',
        to: subtask.agentId,
        type: 'request',
        action: subtask.action,
        payload: { query: subtask.payload },
        timestamp: new Date(),
      });

      await simulateAgentWork(subtask.agentId);

      const result: TaskResult = {
        agentId: subtask.agentId,
        action: subtask.action,
        success: true,
        data: { simulated: true },
      };
      results.push(result);

      addMessage({
        id: `resp-${messageIdCounter.current}-${Date.now()}`,
        from: subtask.agentId,
        to: 'user',
        type: 'response',
        action: `${subtask.action}-result`,
        payload: result,
        timestamp: new Date(),
      });

      setAgents(prev => {
        const updated = new Map(prev);
        const agent = updated.get(subtask.agentId);
        if (agent) {
          updated.set(subtask.agentId, {
            ...agent,
            status: 'active',
            state: Math.random() > 0.5 ? 'dozing' : 'idle',
            currentTask: undefined,
            progress: undefined,
            message: '任务完成！',
            lastStateChange: new Date(),
          });
        }
        return updated;
      });
    }

    setActiveTask(null);
    return { taskId, results, summary: `完成了${results.length}个子任务` };
  }, [isRunning]);

  const decomposeTask = (description: string): Array<{ agentId: string; action: string; payload: string }> => {
    const lower = description.toLowerCase();
    const subtasks: Array<{ agentId: string; action: string; payload: string }> = [];

    if (lower.includes('文件') || lower.includes('搜索') || lower.includes('整理')) {
      subtasks.push({ agentId: 'file-agent', action: 'file.search', payload: description });
    }

    if (lower.includes('系统') || lower.includes('应用') || lower.includes('启动')) {
      subtasks.push({ agentId: 'system-agent', action: 'system.health', payload: '' });
    }

    if (lower.includes('知识') || lower.includes('文档') || lower.includes('摘要')) {
      subtasks.push({ agentId: 'knowledge-agent', action: 'doc.search', payload: description });
    }

    if (lower.includes('图片') || lower.includes('照片') || lower.includes('相册')) {
      subtasks.push({ agentId: 'image-agent', action: 'image.classify', payload: description });
    }

    if (lower.includes('分析') || lower.includes('数据') || lower.includes('报告')) {
      subtasks.push({ agentId: 'data-agent', action: 'data.analyze', payload: description });
    }

    if (subtasks.length === 0) {
      subtasks.push({ agentId: 'general-agent', action: 'general-assist', payload: description });
    }

    return subtasks;
  };

  const simulateAgentWork = async (agentId: string): Promise<void> => {
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAgents(prev => {
        const updated = new Map(prev);
        const agent = updated.get(agentId);
        if (agent) {
          updated.set(agentId, {
            ...agent,
            progress: (i / steps) * 100,
            state: i < steps ? 'working' : 'thinking',
          });
        }
        return updated;
      });
    }
  };

  const addMessage = (message: AgentMessage) => {
    setMessages(prev => [...prev.slice(-99), message]);
  };

  const startSimulation = () => {
    const interval = setInterval(() => {
      if (!isRunning) {
        clearInterval(interval);
        return;
      }

      setAgents(prev => {
        const updated = new Map(prev);
        const agentIds = Array.from(updated.keys());
        const randomId = agentIds[Math.floor(Math.random() * agentIds.length)];
        const agent = updated.get(randomId);

        if (agent && agent.status === 'active' && Math.random() < 0.2) {
          const newState = Math.random() > 0.7 ? 'thinking' : 'communicating';
          updated.set(randomId, {
            ...agent,
            state: newState,
            message: newState === 'communicating' ? '数据同步中...' : '思考中...',
            lastStateChange: new Date(),
          });

          setTimeout(() => {
            setAgents(prev => {
              const updated = new Map(prev);
              const agent = updated.get(randomId);
              if (agent) {
                updated.set(randomId, {
                  ...agent,
                  state: 'idle',
                  message: undefined,
                });
              }
              return updated;
            });
          }, 2000);
        }

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    initializeAgents();
  }, [initializeAgents]);

  return {
    agents,
    agentConfigs: AGENT_CONFIG,
    isRunning,
    messages,
    activeTask,
    startAgents,
    stopAgents,
    sendTask,
  };
}
