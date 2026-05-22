// AgentCommunicationBus - 智能体通信总线
// 多智能体系统的核心通信基础设施

export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  BROADCAST = 'broadcast',
  NOTIFICATION = 'notification',
  RESULT = 'result',
  ERROR = 'error',
}

export interface AgentMessage {
  id: string;
  type: MessageType;
  from: string;
  to: string;
  action: string;
  payload: any;
  timestamp: Date;
  correlationId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ttl?: number;
}

export interface AgentRegistration {
  agentId: string;
  agentType: string;
  capabilities: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  status: 'idle' | 'active' | 'busy' | 'error';
}

type MessageHandler = (message: AgentMessage) => void;

export class AgentCommunicationBus {
  private static instance: AgentCommunicationBus;
  private agents: Map<string, AgentRegistration> = new Map();
  private subscribers: Map<string, Set<MessageHandler>> = new Map();
  private messageHistory: AgentMessage[] = [];
  private maxHistorySize = 1000;

  private constructor() {
    console.log('[CommunicationBus] 通信总线已初始化');
  }

  static getInstance(): AgentCommunicationBus {
    if (!AgentCommunicationBus.instance) {
      AgentCommunicationBus.instance = new AgentCommunicationBus();
    }
    return AgentCommunicationBus.instance;
  }

  registerAgent(registration: AgentRegistration): void {
    this.agents.set(registration.agentId, registration);
    this.subscribers.set(registration.agentId, new Set());
    console.log(`[CommunicationBus] Agent注册: ${registration.agentId}`);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.subscribers.delete(agentId);
    console.log(`[CommunicationBus] Agent注销: ${agentId}`);
  }

  sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): string {
    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date(),
    };

    this.addToHistory(fullMessage);
    this.deliverMessage(fullMessage);

    console.log(`[CommunicationBus] 消息发送: ${message.from} → ${message.to} [${message.action}]`);
    return fullMessage.id;
  }

  async sendRequest(
    from: string,
    to: string,
    action: string,
    payload: any,
    timeout: number = 10000
  ): Promise<AgentMessage> {
    const messageId = this.sendMessage({
      type: MessageType.REQUEST,
      from,
      to,
      action,
      payload,
      priority: 'medium',
    });

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.subscribers.get(from)?.forEach((handler) => {
          handler({
            id: messageId,
            type: MessageType.ERROR,
            from: to,
            to: from,
            action: `${action}-timeout`,
            payload: { error: 'Request timeout' },
            timestamp: new Date(),
            priority: 'high',
          });
        });
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      const handler = (response: AgentMessage) => {
        if (response.correlationId === messageId && response.type === MessageType.RESPONSE) {
          clearTimeout(timeoutId);
          this.unsubscribe(from, handler);
          resolve(response);
        }
      };

      this.subscribe(from, handler);
    });
  }

  broadcast(from: string, action: string, payload: any): void {
    for (const agentId of this.agents.keys()) {
      if (agentId !== from) {
        this.sendMessage({
          type: MessageType.BROADCAST,
          from,
          to: agentId,
          action,
          payload,
          priority: 'low',
        });
      }
    }
  }

  subscribe(agentId: string, handler: MessageHandler): void {
    this.subscribers.get(agentId)?.add(handler);
  }

  unsubscribe(agentId: string, handler: MessageHandler): void {
    this.subscribers.get(agentId)?.delete(handler);
  }

  private deliverMessage(message: AgentMessage): void {
    if (message.to === '*') {
      this.subscribers.forEach((handlers) => {
        handlers.forEach((handler) => handler(message));
      });
    } else {
      this.subscribers.get(message.to)?.forEach((handler) => handler(message));
    }
  }

  private addToHistory(message: AgentMessage): void {
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getRegisteredAgents(): AgentRegistration[] {
    return Array.from(this.agents.values());
  }

  getAgentCapabilities(agentId: string): AgentRegistration | undefined {
    return this.agents.get(agentId);
  }

  getMessageHistory(): AgentMessage[] {
    return [...this.messageHistory];
  }
}

export const communicationBus = AgentCommunicationBus.getInstance();
