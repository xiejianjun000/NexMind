// BaseAgent - 所有智能体的基类
// 提供通用的消息处理和协作能力

import {
  communicationBus,
  AgentMessage,
  MessageType,
  AgentRegistration,
} from './AgentCommunicationBus';

export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected capabilities: Array<{ id: string; name: string; description: string }>;
  protected status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  protected messageHandler: ((msg: AgentMessage) => void) | null = null;
  protected currentTask: string | null = null;

  constructor(id: string, name: string, capabilities: Array<{ id: string; name: string; description: string }>) {
    this.id = id;
    this.name = name;
    this.capabilities = capabilities;
  }

  start(): void {
    const registration: AgentRegistration = {
      agentId: this.id,
      agentType: this.name,
      capabilities: this.capabilities,
      status: this.status,
    };

    communicationBus.registerAgent(registration);
    this.messageHandler = this.handleMessage.bind(this);
    communicationBus.subscribe(this.id, this.messageHandler);

    console.log(`[${this.id}] ${this.name} 已启动`);
  }

  stop(): void {
    if (this.messageHandler) {
      communicationBus.unsubscribe(this.id, this.messageHandler);
      this.messageHandler = null;
    }
    communicationBus.unregisterAgent(this.id);
    console.log(`[${this.id}] ${this.name} 已停止`);
  }

  protected handleMessage(message: AgentMessage): void {
    switch (message.type) {
      case MessageType.REQUEST:
        this.handleRequest(message);
        break;
      case MessageType.BROADCAST:
        this.handleBroadcast(message);
        break;
      case MessageType.NOTIFICATION:
        this.handleNotification(message);
        break;
    }
  }

  protected abstract handleRequest(message: AgentMessage): Promise<void>;
  protected abstract performAction(action: string, payload: any): Promise<any>;

  protected handleBroadcast(message: AgentMessage): void {
    console.log(`[${this.id}] 收到广播: ${message.action}`);
  }

  protected handleNotification(message: AgentMessage): void {
    console.log(`[${this.id}] 收到通知: ${message.action}`);
  }

  protected respond(to: string, correlationId: string, action: string, payload: any): void {
    communicationBus.sendMessage({
      type: MessageType.RESPONSE,
      from: this.id,
      to,
      action,
      payload,
      correlationId,
      priority: 'medium',
    });
  }

  protected broadcast(action: string, payload: any): void {
    communicationBus.broadcast(this.id, action, payload);
  }

  protected notify(to: string, action: string, payload: any): void {
    communicationBus.sendMessage({
      type: MessageType.NOTIFICATION,
      from: this.id,
      to,
      action,
      payload,
      priority: 'high',
    });
  }

  getStatus(): string {
    return this.status;
  }

  getId(): string {
    return this.id;
  }
}
