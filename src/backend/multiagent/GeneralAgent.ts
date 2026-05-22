// GeneralAgent - 全能助手智能体
// 负责任务协调、多智能体调度和用户交互

import { BaseAgent } from './BaseAgent';
import { AgentMessage } from './AgentCommunicationBus';
import { taskCoordinator } from './TaskCoordinator';
import { fileAgent } from './FileAgent';
import { systemAgent } from './SystemAgent';
import { knowledgeAgent } from './KnowledgeAgent';
import { imageAgent } from './ImageAgent';
import { dataAgent } from './DataAgent';

export interface TaskContext {
  taskId: string;
  description: string;
  subtasks: Array<{
    agentId: string;
    action: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
  }>;
  createdAt: Date;
}

export interface CoordinationResult {
  taskId: string;
  success: boolean;
  results: Record<string, any>;
  summary: string;
}

export class GeneralAgent extends BaseAgent {
  private activeTasks: Map<string, TaskContext> = new Map();
  private allAgents: BaseAgent[];

  constructor() {
    super('general-agent', '全能助手', [
      { id: 'task.coordinate', name: '任务协调', description: '协调多智能体完成任务' },
      { id: 'task.decompose', name: '任务分解', description: '分解复杂任务' },
      { id: 'task.monitor', name: '任务监控', description: '监控任务执行状态' },
      { id: 'user.communicate', name: '用户沟通', description: '与用户进行自然语言交互' },
      { id: 'system.overview', name: '系统概览', description: '提供系统整体状态' },
    ]);

    this.allAgents = [fileAgent, systemAgent, knowledgeAgent, imageAgent, dataAgent];
  }

  protected async handleRequest(message: AgentMessage): Promise<void> {
    const { action, payload, from, id } = message;

    try {
      let result: any;

      switch (action) {
        case 'task.coordinate':
          result = await this.coordinateTask(payload.description, payload.options);
          break;

        case 'task.decompose':
          result = await this.decomposeTask(payload.description);
          break;

        case 'task.status':
          result = await this.getTaskStatus(payload.taskId);
          break;

        case 'system.overview':
          result = await this.getSystemOverview();
          break;

        case 'agent.register':
          result = await this.registerAgent(payload);
          break;

        case 'agent.list':
          result = await this.listAgents();
          break;

        case 'general-assist':
          result = await this.generalAssist(payload.request);
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      this.respond(from, id, action, { success: true, data: result });
    } catch (error) {
      this.respond(from, id, action, { 
        success: false, 
        error: (error as Error).message 
      });
    }
  }

  async coordinateTask(description: string, options?: any): Promise<CoordinationResult> {
    console.log(`[GeneralAgent] Coordinating task: ${description}`);

    this.status = 'busy';
    const taskId = `task-${Date.now()}`;

    try {
      const taskContext: TaskContext = {
        taskId,
        description,
        subtasks: [],
        createdAt: new Date(),
      };

      this.activeTasks.set(taskId, taskContext);

      const coordinatedTask = await taskCoordinator.coordinate(description);

      const results: Record<string, any> = {};
      coordinatedTask.subtasks.forEach(subtask => {
        results[subtask.agentId] = subtask.result;
      });

      return {
        taskId,
        success: coordinatedTask.status === 'completed',
        results,
        summary: coordinatedTask.aggregatedResult?.summary || '任务执行完成',
      };
    } finally {
      this.status = 'idle';
    }
  }

  private async decomposeTask(description: string): Promise<{
    subtasks: Array<{ agentId: string; action: string; description: string }>;
    estimatedTime: number;
  }> {
    console.log(`[GeneralAgent] Decomposing task: ${description}`);

    await this.simulateProcessing(400);

    const subtasks = taskCoordinator.decomposeTask(description);

    return {
      subtasks: subtasks.map(st => ({
        agentId: st.agentId,
        action: st.action,
        description: `${st.agentId} 执行 ${st.action}`,
      })),
      estimatedTime: subtasks.length * 30,
    };
  }

  private async getTaskStatus(taskId: string): Promise<TaskContext | null> {
    return this.activeTasks.get(taskId) || null;
  }

  private async getSystemOverview(): Promise<{
    activeAgents: string[];
    totalTasks: number;
    systemHealth: {
      cpu: number;
      memory: number;
    };
  }> {
    console.log(`[GeneralAgent] Getting system overview`);

    await this.simulateProcessing(300);

    return {
      activeAgents: this.allAgents.map(a => a.getId()),
      totalTasks: this.activeTasks.size,
      systemHealth: {
        cpu: Math.random() * 100,
        memory: 50 + Math.random() * 30,
      },
    };
  }

  private async registerAgent(agent: BaseAgent): Promise<{ registered: boolean }> {
    console.log(`[GeneralAgent] Registering agent: ${agent.getId()}`);

    this.allAgents.push(agent);

    return { registered: true };
  }

  private async listAgents(): Promise<Array<{ id: string; status: string }>> {
    return this.allAgents.map(agent => ({
      id: agent.getId(),
      status: agent.getStatus(),
    }));
  }

  private async generalAssist(request: string): Promise<{ response: string; actions: string[] }> {
    console.log(`[GeneralAgent] General assist: ${request}`);

    await this.simulateProcessing(500);

    const lowerRequest = request.toLowerCase();
    let response = '我已经理解了你的请求。';
    const actions: string[] = [];

    if (lowerRequest.includes('文件') || lowerRequest.includes('搜索')) {
      actions.push('file.search');
      response += '我将帮你搜索相关文件。';
    }

    if (lowerRequest.includes('系统') || lowerRequest.includes('应用')) {
      actions.push('system.health');
      response += '让我检查一下系统状态。';
    }

    if (lowerRequest.includes('知识') || lowerRequest.includes('文档')) {
      actions.push('doc.search');
      response += '我来检索相关知识。';
    }

    if (lowerRequest.includes('分析') || lowerRequest.includes('报告')) {
      actions.push('data.analyze');
      response += '我将生成数据分析报告。';
    }

    return { response, actions };
  }

  private async simulateProcessing(ms: number): Promise<void> {
    this.status = 'busy';
    await new Promise(resolve => setTimeout(resolve, ms));
    this.status = 'idle';
  }

  getAllAgents(): BaseAgent[] {
    return this.allAgents;
  }
}

export const generalAgent = new GeneralAgent();
