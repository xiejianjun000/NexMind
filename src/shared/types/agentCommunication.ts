// 智能体通信协议
export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification' | 'broadcast';
  action: string;
  payload: any;
  timestamp: Date;
  correlationId?: string; // 用于关联请求和响应
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ttl?: number; // 消息有效期（毫秒）
}

export interface AgentMessageResponse {
  id: string;
  originalMessageId: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface AgentRegistration {
  agentId: string;
  agentType: string;
  capabilities: AgentCapability[];
  status: 'active' | 'idle' | 'busy' | 'offline';
}

export class AgentCommunicationBus {
  private agents: Map<string, AgentRegistration> = new Map();
  private messageQueue: AgentMessage[] = [];
  private subscribers: Map<string, Array<(message: AgentMessage) => void>> = new Map();
  private messageIdCounter = 0;

  // 注册智能体
  registerAgent(registration: AgentRegistration): void {
    this.agents.set(registration.agentId, registration);
    console.log(`[CommBus] Agent ${registration.agentId} registered`);
  }

  // 注销智能体
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    console.log(`[CommBus] Agent ${agentId} unregistered`);
  }

  // 发送消息
  sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): string {
    const messageId = `msg-${++this.messageIdCounter}-${Date.now()}`;
    const fullMessage: AgentMessage = {
      ...message,
      id: messageId,
      timestamp: new Date(),
    };

    this.messageQueue.push(fullMessage);
    this.deliverMessage(fullMessage);

    return messageId;
  }

  // 发送请求并等待响应
  async sendRequest(
    from: string,
    to: string,
    action: string,
    payload: any,
    timeout: number = 30000
  ): Promise<AgentMessageResponse> {
    const messageId = this.sendMessage({
      from,
      to,
      type: 'request',
      action,
      payload,
      priority: 'medium',
    });

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeout);

      const handler = (response: AgentMessage) => {
        if (response.type === 'response' && response.correlationId === messageId) {
          clearTimeout(timeoutId);
          this.unsubscribe(to, handler);
          resolve({
            id: response.id,
            originalMessageId: messageId,
            success: true,
            data: response.payload,
            timestamp: response.timestamp,
          });
        }
      };

      this.subscribe(to, handler);
    });
  }

  // 广播消息
  broadcast(from: string, action: string, payload: any): void {
    this.agents.forEach((_, agentId) => {
      if (agentId !== from) {
        this.sendMessage({
          from,
          to: agentId,
          type: 'broadcast',
          action,
          payload,
          priority: 'medium',
        });
      }
    });
  }

  // 订阅消息
  subscribe(agentId: string, handler: (message: AgentMessage) => void): void {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, []);
    }
    this.subscribers.get(agentId)!.push(handler);
  }

  // 取消订阅
  unsubscribe(agentId: string, handler: (message: AgentMessage) => void): void {
    const handlers = this.subscribers.get(agentId);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // 获取已注册的智能体
  getRegisteredAgents(): AgentRegistration[] {
    return Array.from(this.agents.values());
  }

  // 获取智能体能力
  getAgentCapabilities(agentId: string): AgentCapability[] | null {
    const registration = this.agents.get(agentId);
    return registration ? registration.capabilities : null;
  }

  // 投递消息
  private deliverMessage(message: AgentMessage): void {
    const handlers = this.subscribers.get(message.to);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error(`[CommBus] Error delivering message:`, error);
        }
      });
    }
  }

  // 清理过期消息（保留用于未来扩展）
  // @ts-expect-error reserved for future use
  private _cleanExpiredMessages(): void {
    const now = Date.now();
    this.messageQueue = this.messageQueue.filter((msg) => {
      if (!msg.ttl) return true;
      return (msg.timestamp.getTime() + msg.ttl) > now;
    });
  }
}

// 单例
export const communicationBus = new AgentCommunicationBus();
