// 专家智能体实现
import { Expert, PRESET_EXPERTS, ExpertInvocation, ExpertResponse } from '../../shared/types/expert';
import { AgentMessage, communicationBus } from '../../shared/types/agentCommunication';

export class ExpertAgent {
  private expert: Expert;

  constructor(expert: Expert) {
    this.expert = expert;
  }

  // 初始化专家智能体
  async initialize(): Promise<void> {
    console.log(`[Expert] Initializing ${this.expert.name} (${this.expert.id})`);

    // 注册到通信总线
    communicationBus.registerAgent({
      agentId: `expert-${this.expert.id}`,
      agentType: 'expert',
      capabilities: this.expert.capabilities.map((cap, i) => ({
        id: `cap-${i}`,
        name: cap,
        description: `${this.expert.name} 的 ${cap} 能力`,
      })),
      status: this.expert.isAvailable ? 'idle' : 'offline',
    });

    // 订阅消息
    communicationBus.subscribe(`expert-${this.expert.id}`, this.handleMessage.bind(this));

    // initialized
    this.expert.status = 'idle';
    console.log(`[Expert] ${this.expert.name} initialized successfully`);
  }

  // 处理收到的消息
  private handleMessage(message: AgentMessage): void {
    console.log(`[Expert] ${this.expert.name} received message:`, message);

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
  private async handleRequest(message: AgentMessage): Promise<void> {
    this.expert.status = 'busy';

    try {
      let result: any;

      switch (message.action) {
        case 'invoke':
          result = await this.invoke(message.payload);
          break;
        case 'get-info':
          result = this.getExpertInfo();
          break;
        case 'get-capabilities':
          result = this.expert.capabilities;
          break;
        default:
          throw new Error(`Unknown action: ${message.action}`);
      }

      // 发送响应
      communicationBus.sendMessage({
        from: `expert-${this.expert.id}`,
        to: message.from,
        type: 'response',
        action: `${message.action}-response`,
        payload: result,
        priority: message.priority,
        correlationId: message.id,
      });
    } catch (error) {
      // 发送错误响应
      communicationBus.sendMessage({
        from: `expert-${this.expert.id}`,
        to: message.from,
        type: 'response',
        action: `${message.action}-error`,
        payload: { error: (error as Error).message },
        priority: message.priority,
        correlationId: message.id,
      });
    } finally {
      this.expert.status = 'idle';
    }
  }

  // 处理通知
  private handleNotification(message: AgentMessage): void {
    console.log(`[Expert] ${this.expert.name} received notification:`, message);
  }

  // 调用专家能力
  async invoke(invocation: ExpertInvocation): Promise<ExpertResponse> {
    const startTime = Date.now();
    console.log(`[Expert] ${this.expert.name} invoked for: ${invocation.request}`);

    this.expert.useCount++;
    this.expert.lastUsed = new Date();

    try {
      // 模拟专家处理过程
      const result = await this.processRequest(invocation);

      const duration = Date.now() - startTime;
      return {
        expertId: this.expert.id,
        success: true,
        result,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        expertId: this.expert.id,
        success: false,
        error: (error as Error).message,
        duration,
      };
    }
  }

  // 处理请求（根据不同专家定制）
  private async processRequest(invocation: ExpertInvocation): Promise<any> {
    // 这里可以根据不同的专家类型实现不同的处理逻辑
    // 目前是通用处理，后续可以扩展为每个专家有自己的处理逻辑

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // 模拟返回结果
    return {
      expert: this.expert.name,
      request: invocation.request,
      analysis: `这是 ${this.expert.name} 对您请求的分析和建议`,
      suggestions: [
        `建议 1 (来自${this.expert.name})`,
        `建议 2 (来自${this.expert.name})`,
        `建议 3 (来自${this.expert.name})`,
      ],
    };
  }

  // 获取专家信息
  getExpertInfo(): Expert {
    return { ...this.expert };
  }

  // 更新专家状态
  setStatus(status: 'active' | 'idle' | 'busy'): void {
    this.expert.status = status;
  }

  // 专家是否可用
  isAvailable(): boolean {
    return this.expert.isAvailable && this.expert.status !== 'busy';
  }
}

// 专家管理系统
export class ExpertManager {
  private experts: Map<string, ExpertAgent> = new Map();

  // 初始化所有预置专家
  async initialize(): Promise<void> {
    console.log('[ExpertManager] Initializing expert system...');

    for (const expertDef of PRESET_EXPERTS) {
      const agent = new ExpertAgent(expertDef);
      await agent.initialize();
      this.experts.set(expertDef.id, agent);
    }

    console.log(`[ExpertManager] ${this.experts.size} experts initialized`);
  }

  // 获取所有专家
  getAllExperts(): Expert[] {
    return Array.from(this.experts.values()).map(agent => agent.getExpertInfo());
  }

  // 获取单个专家
  getExpert(id: string): ExpertAgent | null {
    return this.experts.get(id) || null;
  }

  // 召唤专家
  async summonExpert(id: string, request: string): Promise<ExpertResponse> {
    const agent = this.experts.get(id);
    if (!agent) {
      return {
        expertId: id,
        success: false,
        error: 'Expert not found',
        duration: 0,
      };
    }

    if (!agent.isAvailable()) {
      return {
        expertId: id,
        success: false,
        error: 'Expert is currently busy',
        duration: 0,
      };
    }

    return agent.invoke({ expertId: id, request });
  }

  // 获取可用专家
  getAvailableExperts(): Expert[] {
    return this.getAllExperts().filter(e => e.isAvailable && e.status !== 'busy');
  }
}

// 单例
export const expertManager = new ExpertManager();
