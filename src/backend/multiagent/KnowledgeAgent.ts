// KnowledgeAgent - 知识库管理员智能体
// 负责文档检索、问答和摘要生成

import { BaseAgent } from './BaseAgent';
import { AgentMessage } from './AgentCommunicationBus';

export interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  documents: Document[];
  relevance: number;
  total: number;
}

export interface Summary {
  documentId: string;
  summary: string;
  keyPoints: string[];
  wordCount: number;
}

export class KnowledgeAgent extends BaseAgent {
  private knowledgeBase: Map<string, Document> = new Map();
  private searchIndex: Map<string, string[]> = new Map();

  constructor() {
    super('knowledge-agent', '知识库管理员', [
      { id: 'doc.search', name: '文档搜索', description: '搜索知识库中的文档' },
      { id: 'doc.summarize', name: '文档摘要', description: '生成文档摘要' },
      { id: 'qa.answer', name: '问答回答', description: '回答用户问题' },
      { id: 'doc.create', name: '文档创建', description: '创建新文档' },
      { id: 'doc.update', name: '文档更新', description: '更新现有文档' },
    ]);

    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase(): void {
    const sampleDocs: Document[] = [
      {
        id: 'doc-1',
        title: 'NexMind项目概述',
        content: 'NexMind是一个AI驱动的智能助手平台...',
        tags: ['AI', '项目', '介绍'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'doc-2',
        title: '多智能体系统设计',
        content: '本文档描述了NexMind的多智能体架构...',
        tags: ['架构', '多智能体', '设计'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleDocs.forEach(doc => {
      this.knowledgeBase.set(doc.id, doc);
      doc.tags.forEach(tag => {
        if (!this.searchIndex.has(tag)) {
          this.searchIndex.set(tag, []);
        }
        this.searchIndex.get(tag)!.push(doc.id);
      });
    });
  }

  protected async handleRequest(message: AgentMessage): Promise<void> {
    const { action, payload, from, id } = message;

    try {
      let result: any;

      switch (action) {
        case 'doc.search':
          result = await this.searchDocuments(payload.query, payload.filters);
          break;

        case 'doc.summarize':
          result = await this.summarizeDocument(payload.documentId);
          break;

        case 'qa.answer':
          result = await this.answerQuestion(payload.question);
          break;

        case 'doc.create':
          result = await this.createDocument(payload);
          break;

        case 'doc.update':
          result = await this.updateDocument(payload);
          break;

        case 'aggregate-results':
          result = await this.aggregateResults(payload.results);
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      this.respond(from, id, action, { success: true, data: result });
      this.broadcast('knowledge-agent:status', { action, result: 'completed' });
    } catch (error) {
      this.respond(from, id, action, { 
        success: false, 
        error: (error as Error).message 
      });
    }
  }

  private async searchDocuments(
    query: string, 
    filters?: { tags?: string[]; dateRange?: { start: Date; end: Date } }
  ): Promise<SearchResult> {
    console.log(`[KnowledgeAgent] Searching: ${query}`);

    await this.simulateProcessing(600);

    const documents: Document[] = [];
    let relevance = 0;

    this.knowledgeBase.forEach(doc => {
      if (doc.content.toLowerCase().includes(query.toLowerCase()) ||
          doc.title.toLowerCase().includes(query.toLowerCase())) {
        documents.push(doc);
        relevance += 0.8;
      } else if (doc.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))) {
        documents.push(doc);
        relevance += 0.5;
      }
    });

    return {
      documents,
      relevance: Math.min(relevance, 1),
      total: documents.length,
    };
  }

  private async summarizeDocument(documentId: string): Promise<Summary> {
    console.log(`[KnowledgeAgent] Summarizing document: ${documentId}`);

    await this.simulateProcessing(1000);

    const doc = this.knowledgeBase.get(documentId);
    
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    return {
      documentId,
      summary: `这是关于"${doc.title}"的摘要。该文档涵盖了${doc.tags.join('、')}等主题。`,
      keyPoints: [
        '主要概念概述',
        '关键实现细节',
        '使用场景说明',
      ],
      wordCount: doc.content.split(/\s+/).length,
    };
  }

  private async answerQuestion(question: string): Promise<{ answer: string; confidence: number; sources: string[] }> {
    console.log(`[KnowledgeAgent] Answering question: ${question}`);

    await this.simulateProcessing(800);

    const relevantDocs: string[] = [];
    this.knowledgeBase.forEach(doc => {
      if (doc.content.toLowerCase().includes(question.toLowerCase())) {
        relevantDocs.push(doc.id);
      }
    });

    return {
      answer: `根据我的知识库，关于"${question}"的回答是：这是一个复杂的概念，涉及多个方面...`,
      confidence: 0.85,
      sources: relevantDocs,
    };
  }

  private async createDocument(data: Partial<Document>): Promise<Document> {
    console.log(`[KnowledgeAgent] Creating document: ${data.title}`);

    await this.simulateProcessing(500);

    const doc: Document = {
      id: `doc-${Date.now()}`,
      title: data.title || 'Untitled',
      content: data.content || '',
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.knowledgeBase.set(doc.id, doc);

    return doc;
  }

  private async updateDocument(data: { id: string; updates: Partial<Document> }): Promise<Document> {
    console.log(`[KnowledgeAgent] Updating document: ${data.id}`);

    await this.simulateProcessing(300);

    const existing = this.knowledgeBase.get(data.id);
    if (!existing) {
      throw new Error(`Document not found: ${data.id}`);
    }

    const updated: Document = {
      ...existing,
      ...data.updates,
      updatedAt: new Date(),
    };

    this.knowledgeBase.set(data.id, updated);

    return updated;
  }

  private async aggregateResults(results: any[]): Promise<{ aggregated: string; insights: string[] }> {
    console.log(`[KnowledgeAgent] Aggregating ${results.length} results`);

    await this.simulateProcessing(700);

    return {
      aggregated: '综合分析完成，发现以下关键信息...',
      insights: [
        '数据趋势明显',
        '需要关注的异常点',
        '建议的后续行动',
      ],
    };
  }

  private async simulateProcessing(ms: number): Promise<void> {
    this.status = 'busy';
    await new Promise(resolve => setTimeout(resolve, ms));
    this.status = 'idle';
  }
}

export const knowledgeAgent = new KnowledgeAgent();
