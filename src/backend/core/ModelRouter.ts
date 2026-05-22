// 多模型智能路由系统
export interface Model {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'local';
  endpoint: string;
  strengths: string[];
  costPer1kTokens: number;
  maxTokens: number;
  isAvailable: boolean;
}

export interface ModelRoute {
  model: Model;
  reason: string;
  confidence: number;
}

export class ModelRouter {
  private models: Map<string, Model> = new Map();
  private routeHistory: Array<{ task: string; model: string; success: boolean }> = [];

  constructor() {
    this.initializeModels();
  }

  private initializeModels(): void {
    const defaultModels: Model[] = [
      {
        id: 'ollama-llama3',
        name: 'Llama 3 (本地)',
        provider: 'local',
        endpoint: 'http://localhost:11434',
        strengths: ['通用对话', '代码理解', '低成本'],
        costPer1kTokens: 0,
        maxTokens: 8192,
        isAvailable: true,
      },
      {
        id: 'ollama-mistral',
        name: 'Mistral (本地)',
        provider: 'local',
        endpoint: 'http://localhost:11434',
        strengths: ['快速响应', '简洁输出', '代码补全'],
        costPer1kTokens: 0,
        maxTokens: 4096,
        isAvailable: true,
      },
      {
        id: 'ollama-codellama',
        name: 'CodeLlama (本地)',
        provider: 'local',
        endpoint: 'http://localhost:11434',
        strengths: ['代码生成', '代码审查', '重构建议'],
        costPer1kTokens: 0,
        maxTokens: 4096,
        isAvailable: false,
      },
      {
        id: 'openai-gpt4',
        name: 'GPT-4',
        provider: 'openai',
        endpoint: 'https://api.openai.com/v1',
        strengths: ['复杂推理', '长文本', '创意写作', '多语言'],
        costPer1kTokens: 0.003,
        maxTokens: 8192,
        isAvailable: false,
      },
      {
        id: 'openai-gpt35',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        endpoint: 'https://api.openai.com/v1',
        strengths: ['快速响应', '基础对话', '文本分类'],
        costPer1kTokens: 0.0005,
        maxTokens: 4096,
        isAvailable: false,
      },
      {
        id: 'claude-3',
        name: 'Claude 3',
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1',
        strengths: ['长上下文', '安全对话', '详细分析'],
        costPer1kTokens: 0.002,
        maxTokens: 4096,
        isAvailable: false,
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        endpoint: 'https://generativelanguage.googleapis.com/v1',
        strengths: ['多模态', '搜索增强', '大上下文'],
        costPer1kTokens: 0.001,
        maxTokens: 8192,
        isAvailable: false,
      },
    ];

    defaultModels.forEach(m => this.models.set(m.id, m));
  }

  // 注册新模型
  registerModel(model: Model): void {
    this.models.set(model.id, model);
  }

  // 获取所有模型
  getAllModels(): Model[] {
    return Array.from(this.models.values());
  }

  // 获取可用模型
  getAvailableModels(): Model[] {
    return this.getAllModels().filter(m => m.isAvailable);
  }

  // 智能路由 - 根据任务选择最佳模型
  async route(task: string, taskType?: string): Promise<ModelRoute> {
    const available = this.getAvailableModels();
    if (available.length === 0) {
      throw new Error('没有可用的模型');
    }

    const scores: Array<{ model: Model; score: number; reason: string }> = [];

    for (const model of available) {
      const { score, reason } = this.evaluateModel(task, taskType || this.detectTaskType(task), model);
      scores.push({ model, score, reason });
    }

    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];

    return {
      model: best.model,
      reason: best.reason,
      confidence: best.score,
    };
  }

  // 检测任务类型
  private detectTaskType(task: string): string {
    const patterns: Record<string, RegExp[]> = {
      coding: [/代码/, /编程/, /bug/, /debug/, /function/, /class/, /import/],
      reasoning: [/为什么/, /分析/, /解释/, /原因/, /原理/],
      creative: [/写/, /创作/, /设计/, /故事/, /文案/],
      quick: [/翻译/, /总结/, /概括/, /查询/],
      search: [/搜索/, /查找/, /最新/, /新闻/],
    };

    for (const [type, regexes] of Object.entries(patterns)) {
      if (regexes.some(r => r.test(task.toLowerCase()))) {
        return type;
      }
    }

    return 'general';
  }

  // 评估模型适配度
  private evaluateModel(
    task: string,
    taskType: string,
    model: Model
  ): { score: number; reason: string } {
    let score = 0.5; // 基础分
    const reasons: string[] = [];

    // 任务类型匹配
    const typeStrengths: Record<string, string[]> = {
      coding: ['代码生成', '代码审查', '代码理解', '代码补全', '重构建议'],
      reasoning: ['复杂推理', '长上下文', '详细分析', '安全对话'],
      creative: ['创意写作', '多语言', '长文本'],
      quick: ['快速响应', '简洁输出', '基础对话'],
      search: ['搜索增强', '多模态', '长上下文'],
    };

    const relevantStrengths = typeStrengths[taskType] || [];
    for (const strength of relevantStrengths) {
      if (model.strengths.includes(strength)) {
        score += 0.15;
        reasons.push(`擅长${strength}`);
      }
    }

    // 本地模型偏好（成本考虑）
    if (model.provider === 'local') {
      score += 0.1;
      reasons.push('本地运行，零成本');
    }

    // 任务复杂度判断
    const complexity = this.estimateComplexity(task);
    if (complexity > 0.7 && model.maxTokens >= 8192) {
      score += 0.1;
      reasons.push('高token预算适合复杂任务');
    }

    // 历史成功率
    const historyScore = this.getHistoricalScore(model.id);
    score += historyScore * 0.1;

    return {
      score: Math.min(score, 1.0),
      reason: reasons.join('; ') || '通用匹配',
    };
  }

  // 估算任务复杂度
  private estimateComplexity(task: string): number {
    const indicators = {
      length: Math.min(task.length / 500, 1),
      questions: Math.min((task.match(/[?？]/g) || []).length / 3, 1),
      keywords: Math.min((task.match(/(分析|设计|架构|优化|实现)/g) || []).length / 2, 1),
    };

    return (indicators.length + indicators.questions + indicators.keywords) / 3;
  }

  // 获取模型历史成功率
  private getHistoricalScore(modelId: string): number {
    const history = this.routeHistory.filter(h => h.model === modelId);
    if (history.length === 0) return 0.5; // 默认中性评分
    return history.filter(h => h.success).length / history.length;
  }

  // 记录路由结果
  recordRoute(task: string, modelId: string, success: boolean): void {
    this.routeHistory.push({ task, model: modelId, success });
    // 只保留最近100条记录
    if (this.routeHistory.length > 100) {
      this.routeHistory.shift();
    }
  }

  // 获取路由统计
  getRouteStats(): Record<string, { total: number; success: number; rate: number }> {
    const stats: Record<string, { total: number; success: number; rate: number }> = {};
    
    this.routeHistory.forEach(h => {
      if (!stats[h.model]) {
        stats[h.model] = { total: 0, success: 0, rate: 0 };
      }
      stats[h.model].total++;
      if (h.success) stats[h.model].success++;
      stats[h.model].rate = stats[h.model].success / stats[h.model].total;
    });

    return stats;
  }
}

export const modelRouter = new ModelRouter();