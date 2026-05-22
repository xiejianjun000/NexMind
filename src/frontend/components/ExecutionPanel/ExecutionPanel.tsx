// ExecutionPanel - MARVIS风格的任务执行面板
// 多任务并行可视化 + 实时进度

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Clock, XCircle, Sparkles } from 'lucide-react';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  progress?: number;
  startTime?: Date;
  endTime?: Date;
  result?: string;
}

interface ExecutionPanelProps {
  tasks: Task[];
  onTaskCancel?: (taskId: string) => void;
  maxVisibleTasks?: number;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  tasks,
  onTaskCancel,
  maxVisibleTasks = 5,
}) => {
  const visibleTasks = tasks.slice(0, maxVisibleTasks);
  const hiddenCount = Math.max(0, tasks.length - maxVisibleTasks);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-slate-200">执行状态</h3>
        {tasks.length > 0 && (
          <span className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
            {tasks.filter(t => t.status === 'completed').length}/{tasks.length} 完成
          </span>
        )}
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleTasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="task-item group"
            >
              {/* 状态图标 */}
              <div className="flex-shrink-0">
                <StatusIcon status={task.status} />
              </div>

              {/* 任务信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-medium text-slate-200 truncate">{task.title}</h4>
                  {task.status === 'running' && task.progress !== undefined && (
                    <span className="text-sm text-slate-400">{task.progress}%</span>
                  )}
                </div>

                {/* 进度条 */}
                {task.status === 'running' && task.progress !== undefined && (
                  <div className="mt-2 progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* 描述 */}
                {task.description && (
                  <p className="text-sm text-slate-500 mt-1 truncate">{task.description}</p>
                )}

                {/* 结果 */}
                {task.status === 'completed' && task.result && (
                  <p className="text-sm text-green-400 mt-1">{task.result}</p>
                )}

                {/* 错误信息 */}
                {task.status === 'failed' && task.result && (
                  <p className="text-sm text-red-400 mt-1">{task.result}</p>
                )}
              </div>

              {/* 取消按钮 */}
              {task.status === 'running' && onTaskCancel && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => onTaskCancel(task.id)}
                  className="flex-shrink-0 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 隐藏的任务数量 */}
        {hiddenCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-3 text-slate-500 text-sm"
          >
            还有 {hiddenCount} 个任务在后台运行
          </motion.div>
        )}

        {/* 空状态 */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-slate-500"
          >
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无任务</p>
            <p className="text-sm mt-1">告诉小黄人你想做什么吧！</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// 状态图标组件
const StatusIcon: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const icons = {
    pending: <Circle className="w-5 h-5 text-slate-500" />,
    running: (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-5 h-5 text-blue-500" />
      </motion.div>
    ),
    completed: (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      </motion.div>
    ),
    failed: (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <XCircle className="w-5 h-5 text-red-500" />
      </motion.div>
    ),
  };

  return <div className="flex items-center justify-center">{icons[status]}</div>;
};

// Hook: 模拟任务执行
export const useTaskSimulation = (initialTasks: Task[] = []) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (title: string, description?: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: 'running',
      progress: 0,
      startTime: new Date(),
    };
    
    setTasks(prev => [newTask, ...prev]);

    // 模拟进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTasks(prev =>
          prev.map(t =>
            t.id === newTask.id
              ? { ...t, progress: 100, status: 'completed', endTime: new Date(), result: '执行成功' }
              : t
          )
        );
      } else {
        setTasks(prev =>
          prev.map(t =>
            t.id === newTask.id ? { ...t, progress: Math.round(progress) } : t
          )
        );
      }
    }, 300);

    return newTask.id;
  };

  const cancelTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, status: 'failed', result: '已取消', endTime: new Date() } : t
      )
    );
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => t.status !== 'completed'));
  };

  return { tasks, addTask, cancelTask, clearCompleted };
};

export default ExecutionPanel;
