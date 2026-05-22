// AgentManager - 智能体管理器
// 统一管理所有智能体的生命周期和状态

import { BaseAgent } from './BaseAgent';
import { AgentCommunicationBus, AgentMessage } from './AgentCommunicationBus';
import { fileAgent } from './FileAgent';
import { systemAgent } from './SystemAgent';
import { knowledgeAgent } from './KnowledgeAgent';
import { imageAgent } from './ImageAgent';
import { dataAgent } from './DataAgent';
import { generalAgent } from './GeneralAgent';

export type AgentStatusCallback = (agentId: string, status: string) => void;
export type MessageCallback = (message: AgentMessage) => void;

export class AgentManager {
  private static instance: AgentManager;
  private agents: Map<string, BaseAgent> = new Map();
  private bus: AgentCommunicationBus;
  private statusCallbacks: Set<AgentStatusCallback> = new Set();
  private messageCallbacks: Set<MessageCallback> = new Set();
  private isRunning: boolean = false;

  private constructor() {
    this.bus = AgentCommunicationBus.getInstance();
    this.initializeAgents();
  }

  static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  private initializeAgents(): void {
    this.agents.set('file-agent', fileAgent);
    this.agents.set('system-agent', systemAgent);
    this.agents.set('knowledge-agent', knowledgeAgent);
    this.agents.set('image-agent', imageAgent);
    this.agents.set('data-agent', dataAgent);
    this.agents.set('general-agent', generalAgent);

    console.log(`[AgentManager] Initialized ${this.agents.size} agents`);
  }

  startAll(): void {
    if (this.isRunning) {
      console.log('[AgentManager] Already running');
      return;
    }

    console.log('[AgentManager] Starting all agents...');

    this.agents.forEach((agent, agentId) => {
      try {
        agent.start();
        this.notifyStatusChange(agentId, 'active');
      } catch (error) {
        console.error(`[AgentManager] Failed to start agent ${agentId}:`, error);
      }
    });

    this.isRunning = true;
    console.log('[AgentManager] All agents started');
  }

  stopAll(): void {
    if (!this.isRunning) {
      console.log('[AgentManager] Not running');
      return;
    }

    console.log('[AgentManager] Stopping all agents...');

    this.agents.forEach((agent, agentId) => {
      try {
        agent.stop();
        this.notifyStatusChange(agentId, 'stopped');
      } catch (error) {
        console.error(`[AgentManager] Failed to stop agent ${agentId}:`, error);
      }
    });

    this.isRunning = false;
    console.log('[AgentManager] All agents stopped');
  }

  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  getAgentStatuses(): Map<string, string> {
    const statuses = new Map<string, string>();
    this.agents.forEach((agent, agentId) => {
      statuses.set(agentId, agent.getStatus());
    });
    return statuses;
  }

  async sendToAgent(
    from: string,
    to: string,
    action: string,
    payload: any,
    timeout: number = 30000
  ): Promise<any> {
    try {
      const response = await this.bus.sendRequest(from, to, action, payload, timeout);
      return response;
    } catch (error) {
      console.error(`[AgentManager] Failed to send message to ${to}:`, error);
      throw error;
    }
  }

  broadcast(from: string, action: string, payload: any): void {
    this.bus.broadcast(from, action, payload);
  }

  onStatusChange(callback: AgentStatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  private notifyStatusChange(agentId: string, status: string): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(agentId, status);
      } catch (error) {
        console.error('[AgentManager] Status callback error:', error);
      }
    });
  }

  private notifyMessage(message: AgentMessage): void {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('[AgentManager] Message callback error:', error);
      }
    });
  }

  getBus(): AgentCommunicationBus {
    return this.bus;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getRegisteredAgents(): Array<{ id: string; name: string; status: string }> {
    return Array.from(this.agents.entries()).map(([id, agent]) => ({
      id,
      name: (agent as any).name || id,
      status: agent.getStatus(),
    }));
  }
}

export const agentManager = AgentManager.getInstance();
