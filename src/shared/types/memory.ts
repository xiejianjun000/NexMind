// Memory Types - 记忆系统类型定义

export enum MemoryType {
  CONVERSATION = 'conversation',
  KNOWLEDGE = 'knowledge',
  TASK = 'task',
  CONTEXT = 'context',
  USER_PREFERENCE = 'user_preference',
  SYSTEM = 'system',
}

export interface MemoryNode {
  id: string;
  content: string;
  type: MemoryType;
  timestamp: Date;
  parentId?: string;
  metadata?: Record<string, any>;
  importance?: number; // 0-1, 重要性评分
  accessCount?: number; // 访问次数
  lastAccess?: Date; // 最后访问时间
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryTree {
  id: string;
  name: string;
  description?: string;
  rootId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorySearchOptions {
  type?: MemoryType;
  query?: string;
  startDate?: Date;
  endDate?: Date;
  minImportance?: number;
  limit?: number;
  offset?: number;
}

export interface MemorySearchResult {
  nodes: MemoryNode[];
  total: number;
  hasMore: boolean;
}

export interface MemoryStats {
  totalNodes: number;
  totalTrees: number;
  nodesByType: Record<string, number>;
  avgAccessCount: number;
  lastUpdated: Date;
}

export interface MemoryBackup {
  version: string;
  timestamp: Date;
  data: {
    nodes: MemoryNode[];
    trees: MemoryTree[];
  };
}

export default {
  MemoryType,
  MemoryNode,
  MemoryTree,
  MemorySearchOptions,
  MemorySearchResult,
  MemoryStats,
  MemoryBackup,
};
