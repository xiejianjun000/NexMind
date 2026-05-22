// DataAgent - 数据分析师智能体
// 负责数据处理、报表生成和趋势分析

import { BaseAgent } from './BaseAgent';
import { AgentMessage } from './AgentCommunicationBus';

export interface DataSet {
  id: string;
  name: string;
  columns: string[];
  rowCount: number;
  createdAt: Date;
}

export interface AnalysisResult {
  datasetId: string;
  statistics: Record<string, {
    mean?: number;
    median?: number;
    stdDev?: number;
    min?: number;
    max?: number;
  }>;
  correlations: Array<{ columns: string[]; coefficient: number }>;
  insights: string[];
}

export interface Report {
  id: string;
  title: string;
  content: string;
  charts: Array<{ type: string; data: any }>;
  createdAt: Date;
}

export interface TrendAnalysis {
  dimension: string;
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
  forecast: number[];
}

export class DataAgent extends BaseAgent {
  private datasets: Map<string, DataSet> = new Map();

  constructor() {
    super('data-agent', '数据分析师', [
      { id: 'data.analyze', name: '数据分析', description: '分析数据集' },
      { id: 'data.process', name: '数据处理', description: '处理和转换数据' },
      { id: 'report.generate', name: '报表生成', description: '生成数据报表' },
      { id: 'data.visualize', name: '数据可视化', description: '创建可视化图表' },
      { id: 'trend.analyze', name: '趋势分析', description: '分析数据趋势' },
    ]);
  }

  protected async handleRequest(message: AgentMessage): Promise<void> {
    const { action, payload, from, id } = message;

    try {
      let result: any;

      switch (action) {
        case 'data.analyze':
          result = await this.analyzeData(payload.datasetId, payload.options);
          break;

        case 'data.process':
          result = await this.processData(payload);
          break;

        case 'report.generate':
          result = await this.generateReport(payload);
          break;

        case 'data.visualize':
          result = await this.createVisualization(payload);
          break;

        case 'trend.analyze':
          result = await this.analyzeTrend(payload.dimension, payload.history);
          break;

        case 'generate-summary':
          result = await this.generateDataSummary(payload);
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      this.respond(from, id, action, { success: true, data: result });
      this.broadcast('data-agent:status', { action, result: 'completed' });
    } catch (error) {
      this.respond(from, id, action, { 
        success: false, 
        error: (error as Error).message 
      });
    }
  }

  private async analyzeData(
    datasetId: string, 
    options?: { columns?: string[]; method?: string }
  ): Promise<AnalysisResult> {
    console.log(`[DataAgent] Analyzing data: ${datasetId}`);

    await this.simulateProcessing(1500);

    return {
      datasetId,
      statistics: {
        '销售额': { mean: 12500, median: 12000, stdDev: 2500, min: 8000, max: 18000 },
        '客户数': { mean: 450, median: 420, stdDev: 80, min: 300, max: 600 },
      },
      correlations: [
        { columns: ['销售额', '客户数'], coefficient: 0.85 },
        { columns: ['销售额', '广告投入'], coefficient: 0.72 },
      ],
      insights: [
        '销售额与客户数呈强正相关',
        '存在明显的季节性波动',
        '建议增加高峰期的服务能力',
      ],
    };
  }

  private async processData(options: {
    operation: 'filter' | 'transform' | 'aggregate' | 'join';
    datasetId: string;
    params?: any;
  }): Promise<{ processed: boolean; newDatasetId?: string }> {
    console.log(`[DataAgent] Processing data: ${options.operation}`);

    await this.simulateProcessing(1000);

    const newDatasetId = `dataset-${Date.now()}`;
    this.datasets.set(newDatasetId, {
      id: newDatasetId,
      name: `Processed ${options.datasetId}`,
      columns: ['col1', 'col2'],
      rowCount: 1000,
      createdAt: new Date(),
    });

    return { processed: true, newDatasetId };
  }

  private async generateReport(options: {
    title: string;
    datasetIds: string[];
    sections?: string[];
  }): Promise<Report> {
    console.log(`[DataAgent] Generating report: ${options.title}`);

    await this.simulateProcessing(2000);

    return {
      id: `report-${Date.now()}`,
      title: options.title,
      content: `# ${options.title}\n\n## 执行摘要\n\n本报告分析了提供的数据集...`,
      charts: [
        { type: 'line', data: { labels: ['1月', '2月', '3月'], values: [100, 150, 120] } },
        { type: 'bar', data: { labels: ['A', 'B', 'C'], values: [30, 50, 40] } },
      ],
      createdAt: new Date(),
    };
  }

  private async createVisualization(options: {
    type: 'line' | 'bar' | 'pie' | 'scatter';
    data: any;
    title?: string;
  }): Promise<{ chartId: string; chartData: any }> {
    console.log(`[DataAgent] Creating ${options.type} chart`);

    await this.simulateProcessing(800);

    return {
      chartId: `chart-${Date.now()}`,
      chartData: {
        type: options.type,
        title: options.title || '数据图表',
        data: options.data,
      },
    };
  }

  private async analyzeTrend(dimension: string, history: number[]): Promise<TrendAnalysis> {
    console.log(`[DataAgent] Analyzing trend for: ${dimension}`);

    await this.simulateProcessing(600);

    const lastValue = history[history.length - 1] || 0;
    const firstValue = history[0] || 1;
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;

    return {
      dimension,
      direction: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable',
      changePercent,
      forecast: [
        lastValue * 1.05,
        lastValue * 1.1,
        lastValue * 1.15,
      ],
    };
  }

  private async generateDataSummary(results: any[]): Promise<{
    summary: string;
    statistics: Record<string, any>;
  }> {
    console.log(`[DataAgent] Generating data summary from ${results.length} results`);

    await this.simulateProcessing(700);

    return {
      summary: '数据处理完成，共分析了多个数据集。',
      statistics: {
        totalRecords: 5000,
        processedRecords: 4800,
        successRate: 0.96,
      },
    };
  }

  private async simulateProcessing(ms: number): Promise<void> {
    this.status = 'busy';
    await new Promise(resolve => setTimeout(resolve, ms));
    this.status = 'idle';
  }
}

export const dataAgent = new DataAgent();
