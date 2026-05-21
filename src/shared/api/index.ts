// API 适配层 - 连接前端组件与后端逻辑
// 在浏览器环境中运行，使用 localStorage 版本的 MemoryTree

import { CEOMind, Message } from '../../backend/agents/CEOMind';
import { ChiefEngineerMind, UpgradeProposal, SystemHealth, DailyReport } from '../../backend/agents/ChiefEngineerMind';
import { expertManager } from '../../backend/agents/ExpertAgent';
import { MemoryTreeBrowser, MemoryNode } from '../../backend/core/MemoryTreeBrowser';
import { Expert, ExpertResponse } from '../types/expert';
import { communicationBus, AgentMessage } from '../types/agentCommunication';

// 单例实例
let ceoMind: CEOMind | null = null;
let chiefEngineerMind: ChiefEngineerMind | null = null;
let memoryTree: MemoryTreeBrowser | null = null;
let isInitialized = false;

// 初始化系统
export async function initializeSystem(): Promise<void> {
  if (isInitialized) {
    console.log('[API] System already initialized');
    return;
  }

  console.log('[API] Initializing NexMind system...');

  // 初始化各模块
  ceoMind = new CEOMind();
  chiefEngineerMind = new ChiefEngineerMind();
  memoryTree = new MemoryTreeBrowser();

  // 初始化专家系统
  await expertManager.initialize();

  // 启动总工程师心跳
  chiefEngineerMind.startHeartbeat();

  isInitialized = true;
  console.log('[API] NexMind system initialized successfully');
}

// 关闭系统
export async function shutdownSystem(): Promise<void> {
  if (!isInitialized) return;

  console.log('[API] Shutting down NexMind system...');

  if (chiefEngineerMind) {
    chiefEngineerMind.stopHeartbeat();
  }

  if (memoryTree) {
    memoryTree.stopAutoFetch();
  }

  isInitialized = false;
  console.log('[API] NexMind system shut down');
}

// ============ CEO 相关 API ============

export async function chatWithCEO(message: string): Promise<Message> {
  if (!ceoMind) {
    throw new Error('System not initialized. Call initializeSystem() first.');
  }
  return await ceoMind.handleUserMessage(message);
}

export function getChatHistory(): Message[] {
  if (!ceoMind) {
    throw new Error('System not initialized. Call initializeSystem() first.');
  }
  return ceoMind.getMessages();
}

export function getCurrentTasks() {
  if (!ceoMind) {
    throw new Error('System not initialized. Call initializeSystem() first.');
  }
  return ceoMind.getCurrentTasks();
}

// ============ 专家系统 API ============

export function getAllExperts(): Expert[] {
  return expertManager.getAllExperts();
}

export function getAvailableExperts(): Expert[] {
  return expertManager.getAvailableExperts();
}

export async function summonExpert(id: string, request: string): Promise<ExpertResponse> {
  return await expertManager.summonExpert(id, request);
}

export function getExpertInfo(id: string): Expert | null {
  const agent = expertManager.getExpert(id);
  return agent ? agent.getExpertInfo() : null;
}

// ============ 记忆树 API ============

export async function ingestMemory(
  content: string,
  type: MemoryNode['type'] = 'document',
  metadata?: Record<string, unknown>
): Promise<MemoryNode[]> {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  return await memoryTree.ingest(content, type, metadata);
}

export function searchMemory(query: string, limit: number = 10): MemoryNode[] {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  return memoryTree.search(query, limit);
}

export function getMemoryNode(id: string): MemoryNode | undefined {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  return memoryTree.getNode(id);
}

export function getAllMemoryNodes(): MemoryNode[] {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  return memoryTree.getAllNodes();
}

export function getMemoryTree(): MemoryNode[] {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  return memoryTree.getTree();
}

export function deleteMemoryNode(id: string): boolean {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  return memoryTree.deleteNode(id);
}

export function getMemoryStats(): { totalNodes: number; totalTokens: number; types: Record<string, number> } {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  return memoryTree.getStats();
}

export function clearMemory(): void {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  memoryTree.clear();
}

export function exportMemory(): string {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  return memoryTree.exportToJSON();
}

export function importMemory(json: string): number {
  if (!memoryTree) {
    memoryTree = new MemoryTreeBrowser();
  }
  return memoryTree.importFromJSON(json);
}

// ============ 总工程师 API ============

export async function requestUpgrade(description: string): Promise<UpgradeProposal[]> {
  if (!chiefEngineerMind) {
    chiefEngineerMind = new ChiefEngineerMind();
  }
  return await chiefEngineerMind.handleHumanUpgradeRequest(description);
}

export function getSystemHealth(): SystemHealth {
  if (!chiefEngineerMind) {
    chiefEngineerMind = new ChiefEngineerMind();
  }
  return chiefEngineerMind.monitorSystem();
}

export function getUpgradeProposals(): UpgradeProposal[] {
  if (!chiefEngineerMind) {
    chiefEngineerMind = new ChiefEngineerMind();
  }
  return chiefEngineerMind.getUpgradeProposals();
}

export function triggerManualRollback(): void {
  if (!chiefEngineerMind) {
    chiefEngineerMind = new ChiefEngineerMind();
  }
  chiefEngineerMind.triggerManualRollback();
}

// ============ 通信总线 API ============

export function getRegisteredAgents() {
  return communicationBus.getRegisteredAgents();
}

export function sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): string {
  return communicationBus.sendMessage(message);
}

export function broadcast(from: string, action: string, payload: unknown): void {
  communicationBus.broadcast(from, action, payload);
}

// 导出类型
export type { Message, MemoryNode, Expert, ExpertResponse, UpgradeProposal, SystemHealth, DailyReport };
