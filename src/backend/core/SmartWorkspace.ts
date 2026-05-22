// 智能工作台 - 任务管理、工作流引擎、任务调度
import { ExpertResponse } from '../../shared/types/expert';
import { AgentMessageResponse } from '../../shared/types/agentCommunication';

export interface WorkflowStep {
  id: string;
  name: string;
  action: string;
  agent: string;
  dependencies: string[];
  timeout: number;
  retryCount: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  assignedAgent?: string;
  workflow?: Workflow;
  steps: TaskStep[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  result?: any;
}

export interface TaskStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export class SmartWorkspace {
  private tasks: Map<string, Task> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private activeJobs: Map<string, AbortController> = new Map();

  // 创建任务
  createTask(title: string, description: string, priority: Task['priority'] = 'medium'): Task {
    const task: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      priority,
      status: 'pending',
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  // 添加任务步骤
  addStep(taskId: string, name: string): TaskStep {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const step: TaskStep = {
      id: `step-${Date.now()}-${task.steps.length}`,
      name,
      status: 'pending',
    };

    task.steps.push(step);
    task.updatedAt = new Date();
    return step;
  }

  // 执行任务
  async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    console.log(`[Workspace] Executing task: ${task.title}`);
    task.status = 'in_progress';
    task.updatedAt = new Date();

    const controller = new AbortController();
    this.activeJobs.set(task.id, controller);

    try {
      for (const step of task.steps) {
        console.log(`[Workspace] Executing step: ${step.name}`);
        step.status = 'running';
        step.startedAt = new Date();

        try {
          // 模拟步骤执行
          await this.executeStep(step, controller.signal);
          step.status = 'completed';
          step.completedAt = new Date();
        } catch (error) {
          step.status = 'failed';
          step.error = (error as Error).message;
          task.status = 'failed';
          throw error;
        }
      }

      task.status = 'completed';
      task.completedAt = new Date();
      console.log(`[Workspace] Task completed: ${task.title}`);
    } finally {
      this.activeJobs.delete(task.id);
    }
  }

  // 执行单个步骤
  private async executeStep(step: TaskStep, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Step ${step.name} timeout`));
      }, 30000);

      const checkSignal = () => {
        if (signal.aborted) {
          clearTimeout(timeout);
          reject(new Error('Task cancelled'));
        }
      };

      // 模拟步骤执行
      setTimeout(() => {
        clearTimeout(timeout);
        step.result = { message: `Step ${step.name} executed successfully` };
        resolve();
      }, 500 + Math.random() * 1500);
    });
  }

  // 取消任务
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    const controller = this.activeJobs.get(taskId);
    if (controller) {
      controller.abort();
    }

    task.status = 'cancelled';
    task.updatedAt = new Date();
    return true;
  }

  // 创建流程
  createWorkflow(name: string, description: string, steps: WorkflowStep[]): Workflow {
    const workflow: Workflow = {
      id: `wf-${Date.now()}`,
      name,
      description,
      steps,
      status: 'draft',
      createdAt: new Date(),
    };

    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  // 从流程创建任务
  taskFromWorkflow(workflowId: string, title: string, description: string): Task {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    const task = this.createTask(title, description);
    task.workflow = workflow;

    // 从流程步骤创建任务步骤
    for (const wfStep of workflow.steps) {
      this.addStep(task.id, wfStep.name);
    }

    return task;
  }

  // 获取所有任务
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  // 获取活跃任务
  getActiveTasks(): Task[] {
    return this.getAllTasks().filter(t => t.status === 'in_progress');
  }

  // 获取待处理任务
  getPendingTasks(): Task[] {
    return this.getAllTasks().filter(t => t.status === 'pending');
  }

  // 获取所有流程
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  // 获取任务统计
  getTaskStats(): {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const tasks = this.getAllTasks();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
  }

  // 根据描述自动推荐流程
  recommendWorkflow(description: string): Workflow {
    const keywords = description.toLowerCase();
    
    if (keywords.includes('代码审查') || keywords.includes('review')) {
      return this.createWorkflow('代码审查流程', '标准代码审查流程', [
        { id: '1', name: '代码获取', action: 'fetch-code', agent: 'code-reviewer', dependencies: [], timeout: 10000, retryCount: 2 },
        { id: '2', name: '静态分析', action: 'static-analysis', agent: 'code-reviewer', dependencies: ['1'], timeout: 30000, retryCount: 1 },
        { id: '3', name: '安全扫描', action: 'security-scan', agent: 'security-auditor', dependencies: ['1'], timeout: 30000, retryCount: 1 },
        { id: '4', name: '生成报告', action: 'generate-report', agent: 'code-reviewer', dependencies: ['2', '3'], timeout: 10000, retryCount: 2 },
      ]);
    }

    if (keywords.includes('文档') || keywords.includes('documentation')) {
      return this.createWorkflow('文档生成流程', '自动文档生成', [
        { id: '1', name: '代码分析', action: 'analyze-code', agent: 'code-explorer', dependencies: [], timeout: 20000, retryCount: 2 },
        { id: '2', name: '文档生成', action: 'generate-docs', agent: 'doc-writer', dependencies: ['1'], timeout: 30000, retryCount: 1 },
        { id: '3', name: '文档验证', action: 'validate-docs', agent: 'code-reviewer', dependencies: ['2'], timeout: 10000, retryCount: 2 },
      ]);
    }

    // 默认流程
    return this.createWorkflow('通用任务流程', '标准任务执行流程', [
      { id: '1', name: '任务分析', action: 'analyze', agent: 'ceo', dependencies: [], timeout: 15000, retryCount: 2 },
      { id: '2', name: '执行任务', action: 'execute', agent: 'ceo', dependencies: ['1'], timeout: 30000, retryCount: 1 },
      { id: '3', name: '结果验证', action: 'validate', agent: 'ceo', dependencies: ['2'], timeout: 10000, retryCount: 2 },
    ]);
  }
}

export const smartWorkspace = new SmartWorkspace();