// 记忆树系统 - 层次化记忆管理
import * as fs from 'fs';
import * as path from 'path';

export interface MemoryNode {
  id: string;
  content: string;
  type: 'document' | 'summary' | 'conversation' | 'task';
  timestamp: Date;
  parentId?: string;
  childrenIds?: string[];
  score: number; // 相关性评分
  tokens: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MemoryTreeConfig {
  storagePath: string;
  maxTokenSize?: number; // 默认3000
  autoFetchInterval?: number; // 分钟，默认20
  compressEnabled?: boolean;
}

export class MemoryTree {
  private nodes: Map<string, MemoryNode> = new Map();
  private config: MemoryTreeConfig;
  private autoFetchTimer?: ReturnType<typeof setInterval>;

  constructor(config: MemoryTreeConfig) {
    this.config = {
      storagePath: config.storagePath,
      maxTokenSize: config.maxTokenSize || 3000,
      autoFetchInterval: config.autoFetchInterval || 20,
      compressEnabled: config.compressEnabled !== false,
    };

    this.ensureStoragePath();
    this.loadFromStorage();
  }

  // 确保存储路径存在
  private ensureStoragePath(): void {
    if (!fs.existsSync(this.config.storagePath)) {
      fs.mkdirSync(this.config.storagePath, { recursive: true });
    }
  }

  // 加载已存储的记忆
  private loadFromStorage(): void {
    const dataPath = path.join(this.config.storagePath, 'memory.json');
    if (fs.existsSync(dataPath)) {
      try {
        const content = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(content);
        data.nodes.forEach((node: MemoryNode) => {
          node.timestamp = new Date(node.timestamp);
          this.nodes.set(node.id, node);
        });
        console.log(`[MemoryTree] Loaded ${this.nodes.size} memory nodes`);
      } catch (error) {
        console.error('[MemoryTree] Failed to load memory:', error);
      }
    }
  }

  // 保存到存储
  private saveToStorage(): void {
    const dataPath = path.join(this.config.storagePath, 'memory.json');
    try {
      const data = {
        nodes: Array.from(this.nodes.values()),
        savedAt: new Date().toISOString(),
      };
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[MemoryTree] Failed to save memory:', error);
    }
  }

  // 摄入新内容
  async ingest(content: string, type: MemoryNode['type'] = 'document', metadata?: Record<string, any>): Promise<MemoryNode[]> {
    console.log(`[MemoryTree] Ingesting content of ${content.length} characters`);

    // 切分为合适大小的片段
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
        tags: metadata?.tags,
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

      // 更新子节点的parentId
      createdNodes.slice(0, -1).forEach(node => {
        const existing = this.nodes.get(node.id);
        if (existing) {
          existing.parentId = summaryNode.id;
        }
      });
    }

    this.saveToStorage();
    console.log(`[MemoryTree] Created ${createdNodes.length} memory nodes`);

    return createdNodes;
  }

  // 切分内容
  private chunkContent(content: string): string[] {
    const maxSize = this.config.maxTokenSize || 3000;
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
    // 模拟摘要生成
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

    // 按相关性排序
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit).map(r => r.node);
  }

  // 计算相关性
  private calculateRelevance(node: MemoryNode, query: string): number {
    let score = 0;

    // 内容匹配
    if (node.content.toLowerCase().includes(query.toLowerCase())) {
      score += 0.5;
    }

    // 标签匹配
    if (node.tags && node.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
      score += 0.3;
    }

    // 时间衰减（最近的内容权重更高）
    const ageInDays = (Date.now() - node.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    score *= Math.exp(-ageInDays / 30); // 30天衰减到约37%

    // 类型权重
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

    // 删除子节点
    if (node.childrenIds) {
      node.childrenIds.forEach(childId => this.deleteNode(childId));
    }

    // 从父节点中移除引用
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent && parent.childrenIds) {
        parent.childrenIds = parent.childrenIds.filter(id => id !== id);
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
    // 返回没有父节点的根节点
    return Array.from(this.nodes.values()).filter(node => !node.parentId);
  }

  // 导出为Markdown（Obsidian兼容）
  exportToMarkdown(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    this.nodes.forEach(node => {
      if (node.type === 'document' || node.type === 'conversation') {
        const fileName = `${node.id}.md`;
        const filePath = path.join(directory, fileName);
        const content = `---
title: ${node.timestamp.toISOString()}
type: ${node.type}
tags: ${node.tags?.join(', ') || ''}
---

${node.content}
`;
        fs.writeFileSync(filePath, content);
      }
    });

    console.log(`[MemoryTree] Exported ${this.nodes.size} nodes to ${directory}`);
  }

  // 统计Token数量
  private countTokens(text: string): number {
    // 简化的Token计算（实际应用中会使用tiktoken或类似库）
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
      console.log('[MemoryTree] Running auto-fetch...');
      // 这里可以实现从各种数据源自动同步
    }, this.config.autoFetchInterval! * 60 * 1000);

    console.log(`[MemoryTree] Auto-fetch started (every ${this.config.autoFetchInterval} minutes)`);
  }

  // 停止自动同步
  stopAutoFetch(): void {
    if (this.autoFetchTimer) {
      clearInterval(this.autoFetchTimer);
      this.autoFetchTimer = undefined;
      console.log('[MemoryTree] Auto-fetch stopped');
    }
  }
}

// 创建默认实例
export const memoryTree = new MemoryTree({
  storagePath: path.join(process.cwd(), 'data', 'memory'),
});
