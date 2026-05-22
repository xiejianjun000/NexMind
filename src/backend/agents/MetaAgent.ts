// 元智能体协调器 - 系统的"总工程师"，负责统筹全局、自我进化
import { communicationBus, AgentMessage, AgentRegistration } from '../../shared/types/agentCommunication';
import { Expert, ExpertResponse } from '../../shared/types/expert';

export interface MetaAgentConfig {
  name: string;
  heartbeatIntervalMs: number;
  autoEvolve: boolean;
  skillGenerationThreshold: number;
  maxConcurrentTasks: number;
}

export interface EvolutionEvent {
  id: string;
  type: 'skill_created' | 'code_optimized' | 'agent_spawned' | 'strategy_updated' | 'error_learned';
  description: string;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface SystemMetrics {
  agentCount: number;
  activeTaskCount: number;
  skillCount: number;
  evolutionEventCount: number;
  uptime: number;
  errorRate: number;
  avgResponseTime: number;
}

export class MetaAgent {
  private config: MetaAgentConfig;
  private evolutionHistory: EvolutionEvent[] = [];
  private isRunning: boolean = false;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private startTime: number = 0;
  private taskCount: number = 0;
  private errorCount: number = 0;
  private totalResponseTime: number = 0;
  private messageHandler: ((msg: any) => void) | null = null;

  constructor(config?: Partial<MetaAgentConfig>) {
    this.config = {
      name: 'NexMind-Meta',
      heartbeatIntervalMs: 60000,
      autoEvolve: true,
      skillGenerationThreshold: 3,
      maxConcurrentTasks: 5,
      ...config,
    };
  }

  // 启动元智能体
  async start(): Promise<void> {
    console.log(`[MetaAgent] ${this.config.name} 启动中...`);
    this.isRunning = true;
    this.startTime = Date.now();

    // 注册到通信总线为最高优先级
    communicationBus.registerAgent({
      agentId: 'meta-agent',
      agentType: 'orchestrator',
      capabilities: [
        { id: 'orchestrate', name: '任务编排', description: '分配和协调智能体任务' },
        { id: 'evolve', name: '自我进化', description: '自动优化和升级系统' },
        { id: 'monitor', name: '系统监控', description: '全系统健康监控' },
      ],
      status: 'active',
    });

    // 订阅消息
    this.messageHandler = this.handleMessage.bind(this);
    communicationBus.subscribe('meta-agent', this.messageHandler);

    // 启动心跳
    this.startHeartbeat();
    console.log(`[MetaAgent] ${this.config.name} 已启动，消息总线已连接`);
  }

  // 处理收到的消息
  private handleMessage(message: any): void {
    console.log(`[MetaAgent] 收到消息: ${message.action}`, message);

    switch (message.type) {
      case 'request':
        this.handleRequest(message);
        break;
      case 'notification':
        this.handleNotification(message);
        break;
    }
  }

  // 处理请求
  private async handleRequest(message: any): Promise<void> {
    let result: any;

    switch (message.action) {
      case 'get-metrics':
        result = this.getMetrics();
        break;
      case 'orchestrate':
        result = await this.orchestrate(message.payload.task, message.payload.agents);
        break;
      case 'evolve':
        result = await this.triggerEvolution();
        break;
      case 'get-history':
        result = this.getEvolutionHistory();
        break;
      default:
        result = { error: `未知动作: ${message.action}` };
    }

    // 发送响应
    communicationBus.sendMessage({
      from: 'meta-agent',
      to: message.from,
      type: 'response',
      action: `${message.action}-response`,
      payload: result,
      priority: message.priority,
      correlationId: message.id,
    });
  }

  // 处理通知
  private handleNotification(message: any): void {
    console.log(`[MetaAgent] 收到通知:`, message);
  }

  // 停止元智能体
  stop(): void {
    this.isRunning = false;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.messageHandler) {
      communicationBus.unsubscribe('meta-agent', this.messageHandler);
    }
    communicationBus.unregisterAgent('meta-agent');
    console.log(`[MetaAgent] ${this.config.name} 已停止`);
  }

  // 心跳检测 - 周期性系统体检
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isRunning) {
        this.pulse();
      }
    }, this.config.heartbeatIntervalMs);
  }

  // 单次心跳
  private async pulse(): Promise<void> {
    const metrics = this.getMetrics();
    console.log(`[MetaAgent] 心跳 - 活跃任务: ${metrics.activeTaskCount}, 错误率: ${(metrics.errorRate * 100).toFixed(1)}%`);

    // 检查是否需要触发进化
    if (this.config.autoEvolve && this.shouldEvolve(metrics)) {
      await this.triggerEvolution();
    }
  }

  // 判断是否应该触发进化
  private shouldEvolve(metrics: SystemMetrics): boolean {
    // 当错误率过高或重复任务过多时触发进化
    if (metrics.errorRate > 0.1) return true;
    if (metrics.evolutionEventCount < this.config.skillGenerationThreshold) return true;
    return false;
  }

  // 触发自我进化
  private async triggerEvolution(): Promise<void> {
    console.log('[MetaAgent] 触发自我进化...');
    
    this.addEvolutionEvent({
      type: 'strategy_updated',
      description: '系统自动触发进化机制',
      success: true,
    });
  }

  // 记录进化事件
  addEvolutionEvent(event: Omit<EvolutionEvent, 'id' | 'timestamp'>): EvolutionEvent {
    const fullEvent: EvolutionEvent = {
      ...event,
      id: `evolve-${Date.now()}-${this.evolutionHistory.length}`,
      timestamp: new Date(),
    };
    this.evolutionHistory.push(fullEvent);
    console.log(`[MetaAgent] 进化事件: ${event.type} - ${event.description}`);
    return fullEvent;
  }

  // 获取系统指标
  getMetrics(): SystemMetrics {
    const agents = communicationBus.getRegisteredAgents();
    const uptime = Date.now() - this.startTime;

    return {
      agentCount: agents.length,
      activeTaskCount: this.taskCount,
      skillCount: this.evolutionHistory.length,
      evolutionEventCount: this.evolutionHistory.length,
      uptime,
      errorRate: this.taskCount > 0 ? this.errorCount / this.taskCount : 0,
      avgResponseTime: this.taskCount > 0 ? this.totalResponseTime / this.taskCount : 0,
    };
  }

  // 记录任务
  recordTask(success: boolean, responseTime: number): void {
    this.taskCount++;
    if (!success) this.errorCount++;
    this.totalResponseTime += responseTime;
  }

  // 获取进化历史
  getEvolutionHistory(): EvolutionEvent[] {
    return [...this.evolutionHistory];
  }

  // 智能任务编排
  async orchestrate(task: string, availableAgents: string[]): Promise<{
    assignedAgent: string;
    confidence: number;
    reasoning: string;
  }> {
    const agentKeywords: Record<string, string[]> = {
      'code-architect': ['代码', '架构', '设计模式', '重构', '系统设计'],
      'code-reviewer': ['审查', 'review', 'bug', '代码质量', '优化'],
      'doc-writer': ['文档', 'README', '注释', 'doc', '说明'],
      'test-writer': ['测试', 'test', '单元测试', '用例', 'TDD'],
      'security-auditor': ['安全', '漏洞', '加密', 'xss', 'sql注入'],
      'data-analyst': ['数据', '分析', '统计', '图表', '报表'],
      'content-writer': ['文章', '博客', '文案', '营销', '写作'],
      'project-manager': ['计划', '进度', '排期', '里程碑', '任务'],
      'devops-engineer': ['部署', 'CI', 'CD', '构建', '发布'],
    };

    let bestAgent = 'ceo';
    let bestScore = 0;
    const reasons: string[] = [];

    for (const agentId of availableAgents) {
      let score = 0;
      const keywords = agentKeywords[agentId];
      if (keywords) {
        for (const kw of keywords) {
          if (task.toLowerCase().includes(kw.toLowerCase())) {
            score += 1;
          }
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agentId;
        reasons.push(`"${task}"包含${keywords?.filter(k => task.includes(k)).join('/')}`);
      }
    }

    return {
      assignedAgent: bestAgent,
      confidence: Math.min(bestScore / 3, 1),
      reasoning: reasons.join('; ') || `默认分配给 ${bestAgent}`,
    };
  }
}

export const metaAgent = new MetaAgent();