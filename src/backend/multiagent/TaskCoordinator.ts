// TaskCoordinator - 任务协调器
// 负责分解任务、分配任务、收集结果

import { communicationBus, AgentMessage } from './AgentCommunicationBus';

export interface SubTask {
  id: string;
  agentId: string;
  action: string;
  payload: any;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface CoordinatedTask {
  id: string;
  userRequest: string;
  subtasks: SubTask[];
  status: 'decomposed' | 'executing' | 'completed' | 'failed';
  results: Map<string, any>;
  aggregatedResult?: any;
}

export class TaskCoordinator {
  private activeTasks: Map<string, CoordinatedTask> = new Map();
  private taskCounter = 0;

  // 分解用户请求为子任务
  decomposeTask(userRequest: string): SubTask[] {
    const subtasks: SubTask[] = [];
    const request = userRequest.toLowerCase();

    // 意图识别和任务分解
    if (request.includes('分析') || request.includes('报告')) {
      if (request.includes('文件') || request.includes('文档')) {
        subtasks.push({
          id: `subtask-${++this.taskCounter}`,
          agentId: 'file-agent',
          action: 'search-files',
          payload: { query: this.extractQuery(userRequest) },
          dependencies: [],
          status: 'pending',
        });
      }

      if (request.includes('数据')) {
        subtasks.push({
          id: `subtask-${++this.taskCounter}`,
          agentId: 'data-agent',
          action: 'analyze-data',
          payload: {},
          dependencies: [],
          status: 'pending',
        });
      }

      subtasks.push({
        id: `subtask-${++this.taskCounter}`,
        agentId: 'knowledge-agent',
        action: 'generate-summary',
        payload: {},
        dependencies: subtasks.map(t => t.id),
        status: 'pending',
      });
    }

    if (request.includes('整理') || request.includes('桌面')) {
      subtasks.push({
        id: `subtask-${++this.taskCounter}`,
        agentId: 'image-agent',
        action: 'organize-images',
        payload: {},
        dependencies: [],
        status: 'pending',
      });

      subtasks.push({
        id: `subtask-${++this.taskCounter}`,
        agentId: 'file-agent',
        action: 'backup-files',
        payload: {},
        dependencies: [],
        status: 'pending',
      });
    }

    if (request.includes('搜索')) {
      subtasks.push({
        id: `subtask-${++this.taskCounter}`,
        agentId: 'file-agent',
        action: 'search-files',
        payload: { query: this.extractQuery(userRequest) },
        dependencies: [],
        status: 'pending',
      });
    }

    if (request.includes('系统')) {
      subtasks.push({
        id: `subtask-${++this.taskCounter}`,
        agentId: 'system-agent',
        action: 'system-health-check',
        payload: {},
        dependencies: [],
        status: 'pending',
      });
    }

    // 如果没有匹配到任何任务，创建一个通用任务
    if (subtasks.length === 0) {
      subtasks.push({
        id: `subtask-${++this.taskCounter}`,
        agentId: 'general-agent',
        action: 'general-assist',
        payload: { request: userRequest },
        dependencies: [],
        status: 'pending',
      });
    }

    return subtasks;
  }

  // 提取查询关键词
  private extractQuery(request: string): string {
    const patterns = [
      /(?:搜索|查找|找)[：:]?\s*(.+)/i,
      /(?:关于|关于的)\s*(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = request.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return request;
  }

  // 执行协调任务
  async coordinate(userRequest: string): Promise<CoordinatedTask> {
    const taskId = `task-${Date.now()}`;
    const subtasks = this.decomposeTask(userRequest);

    const coordinatedTask: CoordinatedTask = {
      id: taskId,
      userRequest,
      subtasks,
      status: 'decomposed',
      results: new Map(),
    };

    this.activeTasks.set(taskId, coordinatedTask);
    console.log(`[TaskCoordinator] 任务分解完成: ${taskId}, ${subtasks.length}个子任务`);

    // 执行子任务
    coordinatedTask.status = 'executing';
    await this.executeSubtasks(coordinatedTask);

    // 聚合结果
    coordinatedTask.status = 'completed';
    coordinatedTask.aggregatedResult = this.aggregateResults(coordinatedTask);

    return coordinatedTask;
  }

  // 执行所有子任务
  private async executeSubtasks(task: CoordinatedTask): Promise<void> {
    const executed = new Set<string>();

    while (executed.size < task.subtasks.length) {
      // 找到可以执行的子任务（依赖已满足）
      const readyTasks = task.subtasks.filter(
        t => !executed.has(t.id) && t.dependencies.every(dep => executed.has(dep))
      );

      if (readyTasks.length === 0) {
        console.warn('[TaskCoordinator] 警告: 任务依赖循环或无法满足');
        break;
      }

      // 并行执行所有就绪的任务
      await Promise.all(
        readyTasks.map(async subtask => {
          await this.executeSubtask(task, subtask);
          executed.add(subtask.id);
        })
      );
    }
  }

  // 执行单个子任务
  private async executeSubtask(task: CoordinatedTask, subtask: SubTask): Promise<void> {
    subtask.status = 'running';
    console.log(`[TaskCoordinator] 执行子任务: ${subtask.id} → ${subtask.agentId}`);

    try {
      const response = await communicationBus.sendRequest(
        'task-coordinator',
        subtask.agentId,
        subtask.action,
        subtask.payload,
        30000
      );

      subtask.status = 'completed';
      subtask.result = response.payload;
      task.results.set(subtask.id, response.payload);

      console.log(`[TaskCoordinator] 子任务完成: ${subtask.id}`);
    } catch (error) {
      subtask.status = 'failed';
      subtask.error = (error as Error).message;
      console.error(`[TaskCoordinator] 子任务失败: ${subtask.id}`, error);
    }
  }

  // 聚合所有子任务结果
  private aggregateResults(task: CoordinatedTask): any {
    const results = Array.from(task.results.values());

    return {
      summary: `完成${task.subtasks.filter(t => t.status === 'completed').length}/${task.subtasks.length}个子任务`,
      taskCount: task.subtasks.length,
      completedCount: task.subtasks.filter(t => t.status === 'completed').length,
      failedCount: task.subtasks.filter(t => t.status === 'failed').length,
      results: results,
      rawResults: Object.fromEntries(task.results),
    };
  }

  // 获取活跃任务
  getActiveTasks(): CoordinatedTask[] {
    return Array.from(this.activeTasks.values()).filter(
      t => t.status === 'executing'
    );
  }

  // 获取任务状态
  getTaskStatus(taskId: string): CoordinatedTask | undefined {
    return this.activeTasks.get(taskId);
  }
}

export const taskCoordinator = new TaskCoordinator();
