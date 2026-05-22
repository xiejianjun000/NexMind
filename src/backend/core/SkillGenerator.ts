// 技能自动生成和复用系统
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  dependencies: string[];
  template: string;
  parameters: SkillParameter[];
  successRate: number;
  usageCount: number;
  createdAt: Date;
  lastUsed?: Date;
}

export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface SkillGenerationResult {
  skill: Skill;
  confidence: number;
  source: 'task_pattern' | 'user_request' | 'auto_evolve';
}

export class SkillGenerator {
  private skills: Map<string, Skill> = new Map();
  private taskPatterns: Map<string, number> = new Map();
  private readonly MIN_PATTERN_COUNT = 3;
  private readonly CONFIDENCE_THRESHOLD = 0.6;

  constructor() {
    this.initializeBuiltinSkills();
  }

  // 初始化内置技能
  private initializeBuiltinSkills(): void {
    const builtin: Skill[] = [
      {
        id: 'file-organize',
        name: '文件整理',
        description: '自动整理和分类文件',
        category: '文件管理',
        code: 'organizeFiles',
        dependencies: [],
        template: '按规则整理目录：目录={directory}, 规则={rules}',
        parameters: [
          { name: 'directory', type: 'string', description: '目标目录', required: true },
          { name: 'rules', type: 'array', description: '分类规则', required: true },
        ],
        successRate: 1,
        usageCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'git-commit',
        name: 'Git提交',
        description: '智能Git提交和消息生成',
        category: '版本控制',
        code: 'gitCommit',
        dependencies: [],
        template: '提交变更：消息={message}, 文件={files}',
        parameters: [
          { name: 'message', type: 'string', description: '提交消息', required: true },
          { name: 'files', type: 'array', description: '文件列表', required: false },
        ],
        successRate: 1,
        usageCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'code-review',
        name: '代码审查',
        description: '自动化代码审查流程',
        category: '代码质量',
        code: 'reviewCode',
        dependencies: [],
        template: '审查代码：文件={files}, 规则={rules}',
        parameters: [
          { name: 'files', type: 'array', description: '审查文件', required: true },
          { name: 'rules', type: 'array', description: '审查规则', required: false },
        ],
        successRate: 1,
        usageCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'data-backup',
        name: '数据备份',
        description: '自动备份项目数据',
        category: '系统运维',
        code: 'backupData',
        dependencies: [],
        template: '备份数据：源={source}, 目标={target}',
        parameters: [
          { name: 'source', type: 'string', description: '源路径', required: true },
          { name: 'target', type: 'string', description: '目标路径', required: true },
        ],
        successRate: 1,
        usageCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'report-generate',
        name: '报告生成',
        description: '自动生成分析报告',
        category: '文档生成',
        code: 'generateReport',
        dependencies: [],
        template: '生成报告：类型={type}, 数据={data}',
        parameters: [
          { name: 'type', type: 'string', description: '报告类型', required: true },
          { name: 'data', type: 'object', description: '报告数据', required: true },
        ],
        successRate: 1,
        usageCount: 0,
        createdAt: new Date(),
      },
    ];

    builtin.forEach(skill => this.skills.set(skill.id, skill));
  }

  // 从任务执行轨迹中生成技能
  generateFromPattern(taskPattern: string, executionPath: string[]): SkillGenerationResult | null {
    const normalizedPattern = this.normalizePattern(taskPattern);
    
    let count = this.taskPatterns.get(normalizedPattern) || 0;
    count++;
    this.taskPatterns.set(normalizedPattern, count);

    if (count < this.MIN_PATTERN_COUNT) {
      console.log(`[SkillGen] 模式 "${normalizedPattern}" 出现 ${count}/${this.MIN_PATTERN_COUNT} 次，继续观察`);
      return null;
    }

    const skill = this.createSkillFromPattern(normalizedPattern, executionPath);
    const confidence = Math.min(0.5 + count * 0.1, 0.95);

    return {
      skill,
      confidence,
      source: 'task_pattern',
    };
  }

  // 从用户请求生成技能
  generateFromRequest(description: string): SkillGenerationResult {
    const skill = this.createSkillFromDescription(description);
    
    return {
      skill,
      confidence: 0.7,
      source: 'user_request',
    };
  }

  // 标准化模式
  private normalizePattern(pattern: string): string {
    return pattern
      .toLowerCase()
      .replace(/[0-9]+/g, '{N}')
      .replace(/".*?"/g, '"{STR}"')
      .replace(/'[^']*'/g, "'{STR}'")
      .trim();
  }

  // 从模式创建技能
  private createSkillFromPattern(pattern: string, executionPath: string[]): Skill {
    const name = this.generateSkillName(pattern);
    const parameters = this.extractParameters(pattern);

    return {
      id: `skill-${Date.now()}`,
      name,
      description: `自动生成：处理 "${pattern}" 模式`,
      category: '自动生成',
      code: `auto_${name.toLowerCase().replace(/\s+/g, '_')}`,
      dependencies: [],
      template: pattern,
      parameters,
      successRate: 0,
      usageCount: 0,
      createdAt: new Date(),
    };
  }

  // 从描述创建技能
  private createSkillFromDescription(description: string): Skill {
    return {
      id: `skill-user-${Date.now()}`,
      name: this.generateSkillName(description),
      description,
      category: '用户定义',
      code: `user_${Date.now()}`,
      dependencies: [],
      template: description,
      parameters: this.extractParameters(description),
      successRate: 0,
      usageCount: 0,
      createdAt: new Date(),
    };
  }

  // 生成技能名称
  private generateSkillName(pattern: string): string {
    const words = pattern.split(/[\s\-_]+/).filter(w => w.length > 1);
    if (words.length === 0) return '新技能';
    if (words.length === 1) return words[0];
    return words.slice(0, 2).join('-');
  }

  // 提取参数
  private extractParameters(pattern: string): SkillParameter[] {
    const params: SkillParameter[] = [];
    const matches = pattern.match(/\{([^}]+)\}/g);
    if (matches) {
      const seen = new Set<string>();
      matches.forEach((m, i) => {
        const name = m.replace(/[{}]/g, '');
        if (!seen.has(name)) {
          seen.add(name);
          params.push({
            name,
            type: 'string',
            description: `参数: ${name}`,
            required: true,
          });
        }
      });
    }
    return params;
  }

  // 注册技能
  registerSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
    console.log(`[SkillGen] 注册技能: ${skill.name} (${skill.id})`);
  }

  // 获取技能
  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  // 获取所有技能
  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  // 搜索技能
  searchSkills(query: string): Skill[] {
    const lower = query.toLowerCase();
    return this.getAllSkills().filter(
      s => s.name.toLowerCase().includes(lower) ||
           s.description.toLowerCase().includes(lower) ||
           s.category.toLowerCase().includes(lower)
    );
  }

  // 执行技能
  async executeSkill(id: string, params: Record<string, any>): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, error: `技能 ${id} 不存在` };
    }

    console.log(`[SkillGen] 执行技能: ${skill.name}`, params);
    skill.usageCount++;
    skill.lastUsed = new Date();

    try {
      // 验证参数
      for (const param of skill.parameters) {
        if (param.required && !(param.name in params)) {
          return { success: false, error: `缺少必要参数: ${param.name}` };
        }
      }

      // 模拟技能执行
      await new Promise(resolve => setTimeout(resolve, 300));

      skill.successRate = (skill.successRate * (skill.usageCount - 1) + 1) / skill.usageCount;
      
      return {
        success: true,
        result: { message: `技能 ${skill.name} 执行成功`, output: params },
      };
    } catch (error) {
      skill.successRate = (skill.successRate * (skill.usageCount - 1)) / skill.usageCount;
      return { success: false, error: (error as Error).message };
    }
  }

  // 获取技能统计
  getStats(): { total: number; autoGenerated: number; userDefined: number; avgSuccessRate: number } {
    const all = this.getAllSkills();
    return {
      total: all.length,
      autoGenerated: all.filter(s => s.category === '自动生成').length,
      userDefined: all.filter(s => s.category === '用户定义').length,
      avgSuccessRate: all.length > 0
        ? all.reduce((sum, s) => sum + s.successRate, 0) / all.length
        : 0,
    };
  }
}

export const skillGenerator = new SkillGenerator();