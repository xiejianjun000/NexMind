// ExecutionPanel - 任务执行面板
// MARVIS风格的多任务并行执行可视化

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number; // 0-100
  icon?: string;
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

interface ExecutionPanelProps {
  tasks: Task[];
  maxVisible?: number;
  showDetails?: boolean;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  tasks,
  maxVisible = 5,
  showDetails = false,
}) => {
  const visibleTasks = tasks.slice(-maxVisible);
  const hasMore = tasks.length > maxVisible;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-3 bg-gray-800/80 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h3 className="font-semibold text-white">执行状态</h3>
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
            {tasks.filter(t => t.status === 'running').length} 进行中
          </span>
        </div>
        
        {hasMore && (
          <span className="text-xs text-gray-400">
            共 {tasks.length} 个任务
          </span>
        )}
      </div>

      {/* 任务列表 */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {visibleTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`
                p-4 rounded-lg border transition-all
                ${task.status === 'running' ? 'bg-blue-500/10 border-blue-500/30' : ''}
                ${task.status === 'completed' ? 'bg-green-500/10 border-green-500/30' : ''}
                ${task.status === 'failed' ? 'bg-red-500/10 border-red-500/30' : ''}
                ${task.status === 'pending' ? 'bg-gray-700/50 border-gray-600/50' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                {/* 状态图标 */}
                <div className="flex-shrink-0 mt-1">
                  {task.status === 'pending' && (
                    <span className="text-xl opacity-50">⏳</span>
                  )}
                  {task.status === 'running' && (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="text-xl inline-block"
                    >
                      🔄
                    </motion.span>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-xl">✅</span>
                  )}
                  {task.status === 'failed' && (
                    <span className="text-xl">❌</span>
                  )}
                </div>

                {/* 任务信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {task.icon && <span>{task.icon}</span>}
                    <h4 className="font-medium text-white truncate">{task.title}</h4>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-400 mt-1 truncate">{task.description}</p>
                  )}

                  {/* 进度条 */}
                  {task.status === 'running' && task.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>进度</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* 详细信息 */}
                  {showDetails && task.result && (
                    <div className="mt-3 p-2 bg-gray-900/50 rounded text-xs text-gray-300 font-mono">
                      {JSON.stringify(task.result, null, 2)}
                    </div>
                  )}

                  {/* 错误信息 */}
                  {task.status === 'failed' && task.error && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded text-xs text-red-300">
                      {task.error}
                    </div>
                  )}
                </div>

                {/* 时间 */}
                {task.startTime && (
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {task.status === 'running' && (
                      <span>{formatDuration(task.startTime)}</span>
                    )}
                    {task.status === 'completed' && task.endTime && (
                      <span>完成于 {formatDuration(task.startTime, task.endTime)}</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 空状态 */}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>暂无执行中的任务</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 格式化时长
function formatDuration(start: Date, end?: Date): string {
  const diff = (end ? end.getTime() : Date.now()) - start.getTime();
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h`;
}

export default ExecutionPanel;
