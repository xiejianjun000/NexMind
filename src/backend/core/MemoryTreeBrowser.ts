// 记忆树系统 - 浏览器兼容版本 (使用 localStorage)
// 替代 Node.js 版本，保留相同接口

export interface MemoryNode {
  id: string;
  content: string;
  type: 'document' | 'summary' | 'conversation' | 'task';
  timestamp: Date;
  parentId?: string;
  childrenIds?: string[];
  score: number;
  tokens: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface MemoryTreeConfig {
  storageKey?: string;
  maxTokenSize?: number;
  autoFetchInterval?: number;
  compressEnabled?: boolean;
}

const STORAGE_KEY = 'nexmind-memory-tree';

export class MemoryTreeBrowser {
  private nodes: Map<string, MemoryNode> = new Map();
  private config: Required<MemoryTreeConfig>;
  private autoFetchTimer?: ReturnType<typeof setInterval>;

  constructor(config: MemoryTreeConfig = {}) {
    this.config = {
      storageKey: config.storageKey || STORAGE_KEY,
      maxTokenSize: config.maxTokenSize || 3000,
      autoFetchInterval: config.autoFetchInterval || 20,
      compressEnabled: config.compressEnabled !== false,
    };

    this.loadFromStorage();
  }

  // 从 localStorage 加载记忆
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.nodes && Array.isArray(data.nodes)) {
          data.nodes.forEach((node: MemoryNode) => {
            node.timestamp = new Date(node.timestamp);
            this.nodes.set(node.id, node);
          });
        }
        console.log(`[MemoryTreeBrowser] Loaded ${this.nodes.size} memory nodes`);
      }
    } catch (error) {
      console.error('[MemoryTreeBrowser] Failed to load memory:', error);
    }
  }

  // 保存到 localStorage
  private saveToStorage(): void {
    try {
      const data = {
        nodes: Array.from(this.nodes.values()),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('[MemoryTreeBrowser] Failed to save memory:', error);
      // Handle quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('[MemoryTreeBrowser] Storage quota exceeded, attempting cleanup');
        this.cleanupOldNodes();
      }
    }
  }

  // 清理旧节点
  private cleanupOldNodes(): void {
    const nodes = Array.from(this.nodes.values());
    // Keep only the most recent 500 nodes
    if (nodes.length > 500) {
      nodes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.nodes.clear();
      nodes.slice(0, 500).forEach(node => this.nodes.set(node.id, node));
      this.saveToStorage();
      console.log('[MemoryTreeBrowser] Cleaned up old nodes, keeping 500 most recent');
    }
  }

  // 摄入新内容
  async ingest(
    content: string,
    type: MemoryNode['type'] = 'document',
    metadata?: Record<string, unknown>
  ): Promise<MemoryNode[]> {
    console.log(`[MemoryTreeBrowser] Ingesting content of ${content.length} characters`);

    const chunks = this.chunkContent(content);
    const createdNodes: MemoryNode[] = [];

    for (const chunk of chunks) {
      const node: MemoryNode = {
        id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: chunk,
        type,
        timestamp: new Date(),
        score: 0,
        tokens: this.countTokens(chunk),
        tags: metadata?.tags as string[] | undefined,
        metadata,
      };

      this.nodes.set(node.id, node);
      createdNodes.push(node);
    }

    // 如果有多个片段，创建一个父摘要节点
    if (createdNodes.length > 1) {
      const summary = await this.generateSummary(createdNodes);
      const summaryNode: MemoryNode = {
        id: `sum-${Date.now()}`,
        content: summary,
        type: 'summary',
        timestamp: new Date(),
        childrenIds: createdNodes.map(n => n.id),
        score: 0,
        tokens: this.countTokens(summary),
        tags: ['summary'],
      };

      this.nodes.set(summaryNode.id, summaryNode);
      createdNodes.push(summaryNode);

      createdNodes.slice(0, -1).forEach(node => {
        const existing = this.nodes.get(node.id);
        if (existing) {
          existing.parentId = summaryNode.id;
        }
      });
    }

    this.saveToStorage();
    console.log(`[MemoryTreeBrowser] Created ${createdNodes.length} memory nodes`);

    return createdNodes;
  }

  // 切分内容
  private chunkContent(content: string): string[] {
    const maxSize = this.config.maxTokenSize;
    const chunks: string[] = [];
    let currentChunk = '';

    const paragraphs = content.split(/\n\n+/);

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length < maxSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = paragraph;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  // 生成摘要
  private async generateSummary(nodes: MemoryNode[]): Promise<string> {
    const contents = nodes.map(n => n.content);
    const combined = contents.join('\n\n');
    const summary = `摘要：这是包含${nodes.length}个片段的内容摘要。主要内容涉及：${combined.substring(0, 100)}...`;
    return summary;
  }

  // 搜索记忆
  search(query: string, limit: number = 10): MemoryNode[] {
    const results: Array<{ node: MemoryNode; score: number }> = [];

    this.nodes.forEach(node => {
      const score = this.calculateRelevance(node, query);
      if (score > 0.1) {
        results.push({ node, score });
      }
    });

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit).map(r => r.node);
  }

  // 计算相关性
  private calculateRelevance(node: MemoryNode, query: string): number {
    let score = 0;

    if (node.content.toLowerCase().includes(query.toLowerCase())) {
      score += 0.5;
    }

    if (node.tags && node.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
      score += 0.3;
    }

    const ageInDays = (Date.now() - node.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    score *= Math.exp(-ageInDays / 30);

    const typeWeights: Record<string, number> = {
      conversation: 1.2,
      document: 1.0,
      task: 1.1,
      summary: 0.8,
    };
    score *= typeWeights[node.type] || 1.0;

    return score;
  }

  // 删除记忆节点
  deleteNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;

    if (node.childrenIds) {
      node.childrenIds.forEach(childId => this.deleteNode(childId));
    }

    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent && parent.childrenIds) {
        parent.childrenIds = parent.childrenIds.filter(cid => cid !== id);
      }
    }

    this.nodes.delete(id);
    this.saveToStorage();
    return true;
  }

  // 获取节点详情
  getNode(id: string): MemoryNode | undefined {
    return this.nodes.get(id);
  }

  // 获取所有节点
  getAllNodes(): MemoryNode[] {
    return Array.from(this.nodes.values());
  }

  // 获取树结构
  getTree(): MemoryNode[] {
    return Array.from(this.nodes.values()).filter(node => !node.parentId);
  }

  // 统计Token数量
  private countTokens(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = text.split(/\s+/).length;
    return Math.ceil((chineseChars + englishWords) * 1.3);
  }

  // 启动自动同步
  startAutoFetch(): void {
    if (this.autoFetchTimer) {
      clearInterval(this.autoFetchTimer);
    }

    this.autoFetchTimer = setInterval(() => {
      console.log('[MemoryTreeBrowser] Running auto-fetch...');
    }, this.config.autoFetchInterval * 60 * 1000);

    console.log(`[MemoryTreeBrowser] Auto-fetch started (every ${this.config.autoFetchInterval} minutes)`);
  }

  // 停止自动同步
  stopAutoFetch(): void {
    if (this.autoFetchTimer) {
      clearInterval(this.autoFetchTimer);
      this.autoFetchTimer = undefined;
      console.log('[MemoryTreeBrowser] Auto-fetch stopped');
    }
  }

  // 导出为 JSON
  exportToJSON(): string {
    return JSON.stringify({
      nodes: Array.from(this.nodes.values()),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  // 从 JSON 导入
  importFromJSON(json: string): number {
    try {
      const data = JSON.parse(json);
      let imported = 0;
      if (data.nodes && Array.isArray(data.nodes)) {
        data.nodes.forEach((node: MemoryNode) => {
          node.timestamp = new Date(node.timestamp);
          this.nodes.set(node.id, node);
          imported++;
        });
        this.saveToStorage();
      }
      return imported;
    } catch (error) {
      console.error('[MemoryTreeBrowser] Import failed:', error);
      return 0;
    }
  }

  // 清空所有记忆
  clear(): void {
    this.nodes.clear();
    localStorage.removeItem(this.config.storageKey);
    console.log('[MemoryTreeBrowser] All memory cleared');
  }

  // 获取统计信息
  getStats(): { totalNodes: number; totalTokens: number; types: Record<string, number> } {
    const types: Record<string, number> = {};
    let totalTokens = 0;

    this.nodes.forEach(node => {
      types[node.type] = (types[node.type] || 0) + 1;
      totalTokens += node.tokens;
    });

    return {
      totalNodes: this.nodes.size,
      totalTokens,
      types,
    };
  }
}

// 创建默认实例
export const memoryTreeBrowser = new MemoryTreeBrowser();
