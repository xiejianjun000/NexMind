// 意图解析器 - MARVIS-like架构的核心组件
// 将自然语言命令解析为结构化的执行意图

export type IntentType = 
  | 'file_operation'    // 文件操作
  | 'app_control'       // 应用控制
  | 'system_config'     // 系统配置
  | 'web_search'        // 网页搜索
  | 'expert_consult'    // 专家咨询
  | 'memory_query'      // 记忆查询
  | 'chat'              // 简单对话
  | 'automation'        // 自动化任务
  | 'unknown';          // 未知

export interface IntentParameter {
  key: string;
  value: string | number | boolean;
  required: boolean;
}

export interface ParsedIntent {
  id: string;
  type: IntentType;
  action: string;          // 具体动作：move, search, launch, set等
  parameters: IntentParameter[];
  confidence: number;       // 置信度 0-1
  reasoning: string;        // 解析理由
  requiresSystemAccess: boolean;
  requiresExpert: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface IntentPattern {
  type: IntentType;
  action: string;
  patterns: RegExp[];
  keywords: string[];
  parameterExtractor?: (input: string) => IntentParameter[];
  confidence: number;
}

export class IntentParser {
  private patterns: IntentPattern[] = [];
  private lastIntentId = 0;

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns() {
    // 文件操作模式
    this.patterns.push({
      type: 'file_operation',
      action: 'search',
      patterns: [
        /搜索[：:]?\s*(.+)/i,
        /查找[：:]?\s*(.+)/i,
        /找[一下]?\s*(.+)/i,
        /在哪里[：:]?\s*(.+)/i,
      ],
      keywords: ['搜索', '查找', '找文件', '文件在哪', '搜索文件'],
      parameterExtractor: (input) => {
        const match = input.match(/搜索[：:]?\s*(.+)|查找[：:]?\s*(.+)|找[一下]?\s*(.+)|在哪里[：:]?\s*(.+)/i);
        return [{
          key: 'query',
          value: (match?.[1] || match?.[2] || match?.[3] || match?.[4] || '').trim(),
          required: true,
        }];
      },
      confidence: 0.95,
    });

    this.patterns.push({
      type: 'file_operation',
      action: 'move',
      patterns: [
        /移动[：:]?\s*(.+?)\s*(?:到|至|→)\s*(.+)/i,
        /把\s*(.+?)\s*移动[到至]?\s*(.+)/i,
        /剪切\s*(.+?)\s*(?:到|至|→)\s*(.+)/i,
      ],
      keywords: ['移动', '剪切', '移到'],
      parameterExtractor: (input) => {
        const match = input.match(/移动[：:]?\s*(.+?)\s*(?:到|至|→)\s*(.+)|把\s*(.+?)\s*移动[到至]?\s*(.+)|剪切\s*(.+?)\s*(?:到|至|→)\s*(.+)/i);
        return [
          { key: 'source', value: (match?.[1] || match?.[3] || match?.[5] || '').trim(), required: true },
          { key: 'destination', value: (match?.[2] || match?.[4] || match?.[6] || '').trim(), required: true },
        ];
      },
      confidence: 0.9,
    });

    this.patterns.push({
      type: 'file_operation',
      action: 'copy',
      patterns: [
        /复制[：:]?\s*(.+?)\s*(?:到|至|→)\s*(.+)/i,
        /把\s*(.+?)\s*复制[到至]?\s*(.+)/i,
        /拷贝\s*(.+?)\s*(?:到|至|→)\s*(.+)/i,
      ],
      keywords: ['复制', '拷贝'],
      parameterExtractor: (input) => {
        const match = input.match(/复制[：:]?\s*(.+?)\s*(?:到|至|→)\s*(.+)|把\s*(.+?)\s*复制[到至]?\s*(.+)|拷贝\s*(.+?)\s*(?:到|至|→)\s*(.+)/i);
        return [
          { key: 'source', value: (match?.[1] || match?.[3] || match?.[5] || '').trim(), required: true },
          { key: 'destination', value: (match?.[2] || match?.[4] || match?.[6] || '').trim(), required: true },
        ];
      },
      confidence: 0.9,
    });

    this.patterns.push({
      type: 'file_operation',
      action: 'delete',
      patterns: [
        /删除[：:]?\s*(.+)/i,
        /删掉[：:]?\s*(.+)/i,
        /移除[：:]?\s*(.+)/i,
        /垃圾桶[：:]?\s*(.+)/i,
      ],
      keywords: ['删除', '删掉', '移除'],
      parameterExtractor: (input) => {
        const match = input.match(/删除[：:]?\s*(.+)|删掉[：:]?\s*(.+)|移除[：:]?\s*(.+)|垃圾桶[：:]?\s*(.+)/i);
        return [{
          key: 'target',
          value: (match?.[1] || match?.[2] || match?.[3] || match?.[4] || '').trim(),
          required: true,
        }];
      },
      confidence: 0.95,
    });

    this.patterns.push({
      type: 'file_operation',
      action: 'rename',
      patterns: [
        /重命名[：:]?\s*(.+?)\s*(?:为|作|叫)\s*(.+)/i,
        /把\s*(.+?)\s*重命名[为叫作]?\s*(.+)/i,
      ],
      keywords: ['重命名'],
      parameterExtractor: (input) => {
        const match = input.match(/重命名[：:]?\s*(.+?)\s*(?:为|作|叫)\s*(.+)|把\s*(.+?)\s*重命名[为叫作]?\s*(.+)/i);
        return [
          { key: 'target', value: (match?.[1] || match?.[3] || '').trim(), required: true },
          { key: 'newName', value: (match?.[2] || match?.[4] || '').trim(), required: true },
        ];
      },
      confidence: 0.9,
    });

    // 应用控制模式
    this.patterns.push({
      type: 'app_control',
      action: 'launch',
      patterns: [
        /打开[：:]?\s*(.+)/i,
        /启动[：:]?\s*(.+)/i,
        /运行[：:]?\s*(.+)/i,
        /(?:帮我)?开[启]?\s*(.+)/i,
      ],
      keywords: ['打开', '启动', '运行', '开'],
      parameterExtractor: (input) => {
        const match = input.match(/打开[：:]?\s*(.+)|启动[：:]?\s*(.+)|运行[：:]?\s*(.+)|(?:帮我)?开[启]?\s*(.+)/i);
        return [{
          key: 'app',
          value: (match?.[1] || match?.[2] || match?.[3] || match?.[4] || '').trim(),
          required: true,
        }];
      },
      confidence: 0.9,
    });

    this.patterns.push({
      type: 'app_control',
      action: 'close',
      patterns: [
        /关闭[：:]?\s*(.+)/i,
        /退出[：:]?\s*(.+)/i,
        /停掉[：:]?\s*(.+)/i,
      ],
      keywords: ['关闭', '退出', '停掉'],
      parameterExtractor: (input) => {
        const match = input.match(/关闭[：:]?\s*(.+)|退出[：:]?\s*(.+)|停掉[：:]?\s*(.+)/i);
        return [{
          key: 'app',
          value: (match?.[1] || match?.[2] || match?.[3] || '').trim(),
          required: true,
        }];
      },
      confidence: 0.9,
    });

    // 系统配置模式
    this.patterns.push({
      type: 'system_config',
      action: 'get',
      patterns: [
        /查看\s*(?:系统)?配置[：:]?\s*(.+)/i,
        /获取\s*(?:系统)?设置[：:]?\s*(.+)/i,
      ],
      keywords: ['系统配置', '系统设置'],
      parameterExtractor: (input) => {
        const match = input.match(/查看\s*(?:系统)?配置[：:]?\s*(.+)|获取\s*(?:系统)?设置[：:]?\s*(.+)/i);
        return [{
          key: 'config',
          value: (match?.[1] || match?.[2] || '').trim(),
          required: true,
        }];
      },
      confidence: 0.85,
    });

    this.patterns.push({
      type: 'system_config',
      action: 'set',
      patterns: [
        /设置[：:]?\s*(.+?)\s*(?:为|成)\s*(.+)/i,
        /修改[：:]?\s*(.+?)\s*(?:为|成)\s*(.+)/i,
        /调整[：:]?\s*(.+?)\s*(?:为|成)\s*(.+)/i,
      ],
      keywords: ['设置', '修改', '调整'],
      parameterExtractor: (input) => {
        const match = input.match(/设置[：:]?\s*(.+?)\s*(?:为|成)\s*(.+)|修改[：:]?\s*(.+?)\s*(?:为|成)\s*(.+)|调整[：:]?\s*(.+?)\s*(?:为|成)\s*(.+)/i);
        return [
          { key: 'key', value: (match?.[1] || match?.[3] || match?.[5] || '').trim(), required: true },
          { key: 'value', value: (match?.[2] || match?.[4] || match?.[6] || '').trim(), required: true },
        ];
      },
      confidence: 0.85,
    });

    // 专家咨询模式
    this.patterns.push({
      type: 'expert_consult',
      action: 'consult',
      patterns: [
        /(?:咨询|请教|问问)(?:一下)?(?:代码架构师|架构师)[：:]?\s*(.+)/i,
        /(?:咨询|请教|问问)(?:一下)?(?:代码审查员|审查员)[：:]?\s*(.+)/i,
        /(?:咨询|请教|问问)(?:一下)?(?:安全审计师|审计师)[：:]?\s*(.+)/i,
      ],
      keywords: ['咨询', '请教', '问问'],
      parameterExtractor: (input) => {
        let expertId = 'general';
        if (input.includes('架构师')) expertId = 'code-architect';
        else if (input.includes('审查员')) expertId = 'code-reviewer';
        else if (input.includes('审计师')) expertId = 'security-auditor';
        
        const match = input.match(/(?:咨询|请教|问问)(?:一下)?(?:.+?)[：:]?\s*(.+)/i);
        return [
          { key: 'expertId', value: expertId, required: true },
          { key: 'question', value: (match?.[1] || input).trim(), required: true },
        ];
      },
      confidence: 0.9,
    });

    // 记忆查询模式
    this.patterns.push({
      type: 'memory_query',
      action: 'recall',
      patterns: [
        /(?:记得|回忆起?|想起来?)[：:]?\s*(.+)/i,
        /之前(?:我们|我)讨论过[：:]?\s*(.+)/i,
        /(?:查找|搜索)记忆[：:]?\s*(.+)/i,
      ],
      keywords: ['记得', '回忆', '想起来', '讨论过', '记忆'],
      parameterExtractor: (input) => {
        const match = input.match(/(?:记得|回忆起?|想起来?)[：:]?\s*(.+)|(?:之前(?:我们|我)讨论过)[：:]?\s*(.+)|(?:查找|搜索)记忆[：:]?\s*(.+)/i);
        return [{
          key: 'query',
          value: (match?.[1] || match?.[2] || match?.[3] || '').trim(),
          required: true,
        }];
      },
      confidence: 0.9,
    });

    // 网页搜索模式
    this.patterns.push({
      type: 'web_search',
      action: 'search',
      patterns: [
        /(?:搜索|查找|帮我查一下)[网上]?\s*(.+)/i,
        /(?:google|百度)[一下]?\s*(.+)/i,
      ],
      keywords: ['搜索', 'google', '百度', '网上搜'],
      parameterExtractor: (input) => {
        const match = input.match(/(?:搜索|查找|帮我查一下)[网上]?\s*(.+)|(?:google|百度)[一下]?\s*(.+)/i);
        return [{
          key: 'query',
          value: (match?.[1] || match?.[2] || '').trim(),
          required: true,
        }];
      },
      confidence: 0.9,
    });

    // 自动化任务模式
    this.patterns.push({
      type: 'automation',
      action: 'workflow',
      patterns: [
        /(?:自动|帮我)(.+?)(?:一下)?$/i,
      ],
      keywords: ['自动', '帮我'],
      parameterExtractor: (input) => {
        const match = input.match(/(?:自动|帮我)(.+?)(?:一下)?$/i);
        return [{
          key: 'workflow',
          value: (match?.[1] || input).trim(),
          required: true,
        }];
      },
      confidence: 0.7,
    });
  }

  // 解析用户输入
  parse(input: string): ParsedIntent {
    console.log(`[IntentParser] 解析输入: "${input}"`);
    
    this.lastIntentId++;
    
    // 1. 尝试模式匹配
    for (const pattern of this.patterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(input)) {
          const parameters = pattern.parameterExtractor 
            ? pattern.parameterExtractor(input) 
            : [];
          
          const intent: ParsedIntent = {
            id: `intent-${this.lastIntentId}-${Date.now()}`,
            type: pattern.type,
            action: pattern.action,
            parameters,
            confidence: pattern.confidence,
            reasoning: `匹配模式: ${pattern.type}/${pattern.action}`,
            requiresSystemAccess: this.requiresSystemAccess(pattern.type),
            requiresExpert: pattern.type === 'expert_consult',
            priority: this.inferPriority(input, pattern.type),
          };
          
          console.log(`[IntentParser] ✅ 解析成功:`, intent);
          return intent;
        }
      }
    }
    
    // 2. 关键词匹配
    for (const pattern of this.patterns) {
      for (const keyword of pattern.keywords) {
        if (input.includes(keyword)) {
          const parameters = pattern.parameterExtractor 
            ? pattern.parameterExtractor(input) 
            : [];
          
          const intent: ParsedIntent = {
            id: `intent-${this.lastIntentId}-${Date.now()}`,
            type: pattern.type,
            action: pattern.action,
            parameters,
            confidence: pattern.confidence * 0.8, // 关键词匹配降低置信度
            reasoning: `关键词匹配: ${keyword}`,
            requiresSystemAccess: this.requiresSystemAccess(pattern.type),
            requiresExpert: pattern.type === 'expert_consult',
            priority: this.inferPriority(input, pattern.type),
          };
          
          console.log(`[IntentParser] ✅ 关键词匹配:`, intent);
          return intent;
        }
      }
    }
    
    // 3. 返回未知意图
    console.log(`[IntentParser] ⚠️ 无法解析，返回unknown`);
    return {
      id: `intent-${this.lastIntentId}-${Date.now()}`,
      type: 'unknown',
      action: 'unknown',
      parameters: [],
      confidence: 0,
      reasoning: '无法解析用户意图',
      requiresSystemAccess: false,
      requiresExpert: false,
      priority: 'medium',
    };
  }

  // 判断是否需要系统访问权限
  private requiresSystemAccess(type: IntentType): boolean {
    return ['file_operation', 'app_control', 'system_config', 'automation'].includes(type);
  }

  // 推断优先级
  private inferPriority(input: string, type: IntentType): 'low' | 'medium' | 'high' | 'urgent' {
    if (input.includes('紧急') || input.includes('马上') || input.includes('立刻')) {
      return 'urgent';
    }
    if (input.includes('重要') || input.includes('优先')) {
      return 'high';
    }
    if (type === 'file_operation' && input.includes('删除')) {
      return 'high';
    }
    return 'medium';
  }

  // 批量解析（用于处理复杂任务）
  parseBatch(inputs: string[]): ParsedIntent[] {
    return inputs.map(input => this.parse(input));
  }

  // 学习新模式（运行时扩展）
  learnPattern(pattern: Omit<IntentPattern, 'confidence'> & { confidence?: number }): void {
    this.patterns.push({
      ...pattern,
      confidence: pattern.confidence || 0.8,
    });
    console.log(`[IntentParser] 学习新模式: ${pattern.type}/${pattern.action}`);
  }
}

export const intentParser = new IntentParser();
