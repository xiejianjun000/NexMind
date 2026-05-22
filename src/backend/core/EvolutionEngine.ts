// 自我进化引擎 - 闭环学习、反思、技能提取

import { SkillGenerator, SkillGenerationResult } from './SkillGenerator';
import { SecuritySandbox } from './SecuritySandbox';

export interface EvolutionConfig {
  enableAutoEvolve: boolean;
  reflectionEnabled: boolean;
  skillExtractionEnabled: boolean;
  minConfidenceThreshold: number;
}

export interface TaskExecutionRecord {
  id: string;
  task: string;
  agentId: string;
  success: boolean;
  errorMessage?: string;
  duration: number;
  timestamp: Date;
  steps: string[];
}

export interface Reflection {
  id: string;
  taskRecordId: string;
  successAnalysis: string;
  improvements: string[];
  lessons: string[];
  confidence: number;
}

export interface EvolutionCycle {
  id: string;
  type: 'reflection' | 'skill_extraction' | 'optimization';
  input: any;
  output: any;
  success: boolean;
  timestamp: Date;
}

export class EvolutionEngine {
  private config: EvolutionConfig;
  private taskRecords: TaskExecutionRecord[] = [];
  private reflections: Map<string, Reflection> = new Map();
  private cycles: EvolutionCycle[] = [];
  private skillGenerator: SkillGenerator;
  private sandbox: SecuritySandbox;

  constructor(
    skillGenerator: SkillGenerator,
    sandbox: SecuritySandbox,
    config?: Partial<EvolutionConfig>
  ) {
    this.skillGenerator = skillGenerator;
    this.sandbox = sandbox;
    this.config = {
      enableAutoEvolve: true,
      reflectionEnabled: true,
      skillExtractionEnabled: true,
      minConfidenceThreshold: 0.6,
      ...config,
    };
  }

  // 执行闭环学习：规划→执行→反思→提取经验
  async executeLearningCycle(
    task: string,
    executor: () => Promise<{ success: boolean; result?: any; error?: string; steps: string[] }>
  ): Promise<{ result: any; learned: boolean; skills?: SkillGenerationResult[] }> {
    console.log(`[Evolution] 开始学习循环: ${task}`);

    const cycleId = `cycle-${Date.now()}`;
    const startTime = Date.now();

    // 1. 规划阶段
    console.log('[Evolution] 阶段1: 规划');
    
    // 2. 执行阶段
    console.log('[Evolution] 阶段2: 执行');
    const executionResult = await executor();
    const duration = Date.now() - startTime;

    // 3. 记录执行轨迹
    const record: TaskExecutionRecord = {
      id: `record-${Date.now()}`,
      task,
      agentId: 'evolution',
      success: executionResult.success,
      errorMessage: executionResult.error,
      duration,
      timestamp: new Date(),
      steps: executionResult.steps || [],
    };
    this.taskRecords.push(record);

    // 4. 反思阶段
    let reflection: Reflection | undefined;
    if (this.config.reflectionEnabled) {
      console.log('[Evolution] 阶段3: 反思');
      reflection = await this.reflect(record);
      if (reflection) {
        this.reflections.set(record.id, reflection);
      }
    }

    // 5. 提取经验阶段
    const skills: SkillGenerationResult[] = [];
    if (this.config.skillExtractionEnabled && executionResult.success) {
      console.log('[Evolution] 阶段4: 提取经验');
      const pattern = this.extractPattern(task, executionResult.steps);
      const skillResult = this.skillGenerator.generateFromPattern(pattern, executionResult.steps);
      
      if (skillResult && skillResult.confidence >= this.config.minConfidenceThreshold) {
        this.skillGenerator.registerSkill(skillResult.skill);
        skills.push(skillResult);
      }
    }

    // 记录进化周期
    this.cycles.push({
      id: cycleId,
      type: 'reflection',
      input: task,
      output: { reflection, skills },
      success: executionResult.success,
      timestamp: new Date(),
    });

    console.log(`[Evolution] 学习循环完成 - 成功: ${executionResult.success}, 新技能: ${skills.length}`);
    
    return {
      result: executionResult.result,
      learned: reflection !== undefined || skills.length > 0,
      skills: skills.length > 0 ? skills : undefined,
    };
  }

  // 反思阶段 - 分析成功/失败原因
  private async reflect(record: TaskExecutionRecord): Promise<Reflection> {
    const successFactors = this.analyzeSuccess(record);
    const improvements = this.suggestImprovements(record);
    const lessons = this.extractLessons(record);

    return {
      id: `refl-${Date.now()}`,
      taskRecordId: record.id,
      successAnalysis: successFactors,
      improvements,
      lessons,
      confidence: record.success ? 0.8 : 0.5,
    };
  }

  // 分析成功因素
  private analyzeSuccess(record: TaskExecutionRecord): string {
    if (record.success) {
      const factors = [];
      if (record.duration < 5000) factors.push('快速执行');
      if (record.steps.length <= 3) factors.push('步骤简洁');
      return `成功因素: ${factors.join(', ') || '标准执行'}`;
    } else {
      return `失败原因分析: ${record.errorMessage || '未知错误'}`;
    }
  }

  // 建议改进
  private suggestImprovements(record: TaskExecutionRecord): string[] {
    const improvements: string[] = [];

    if (record.duration > 10000) {
      improvements.push('考虑优化执行速度');
    }
    if (record.steps.length > 5) {
      improvements.push('简化任务流程，减少步骤数');
    }
    if (!record.success) {
      improvements.push('添加错误处理机制');
    }

    return improvements.length > 0 ? improvements : ['当前执行策略良好'];
  }

  // 提取经验教训
  private extractLessons(record: TaskExecutionRecord): string[] {
    const lessons: string[] = [];

    if (record.success) {
      lessons.push(`成功处理了 "${record.task}" 类型的任务`);
      lessons.push(`执行耗时: ${record.duration}ms，可作为基准值`);
    } else {
      lessons.push(`处理 "${record.task}" 时遇到: ${record.errorMessage}`);
      lessons.push('应添加输入验证和错误边界');
    }

    return lessons;
  }

  // 提取模式
  private extractPattern(task: string, steps: string[]): string {
    const taskTemplate = task
      .replace(/\d+/g, '{N}')
      .replace(/"[^"]+"/g, '"{STR}"')
      .replace(/'[^']+'/g, "'{STR}'");
    
    const stepTemplate = steps
      .map(step => `  → ${step}`)
      .join('\n');

    return `${taskTemplate}\n${stepTemplate}`;
  }

  // 获取进化指标
  getEvolutionMetrics(): {
    totalCycles: number;
    successRate: number;
    skillCount: number;
    reflectionCount: number;
    avgConfidence: number;
    learnedPatterns: string[];
  } {
    const successCount = this.cycles.filter(c => c.success).length;
    const totalConfidence = Array.from(this.reflections.values())
      .reduce((sum, r) => sum + r.confidence, 0);

    const patterns = this.taskRecords.map(r =>
      r.task.replace(/\d+/g, '{N}').trim()
    );
    const uniquePatterns = [...new Set(patterns)];

    return {
      totalCycles: this.cycles.length,
      successRate: this.cycles.length > 0
        ? successCount / this.cycles.length
        : 0,
      skillCount: this.skillGenerator.getAllSkills().length,
      reflectionCount: this.reflections.size,
      avgConfidence: this.reflections.size > 0
        ? totalConfidence / this.reflections.size
        : 0,
      learnedPatterns: uniquePatterns.slice(0, 10),
    };
  }

  // 获取任务历史
  getTaskHistory(): TaskExecutionRecord[] {
    return [...this.taskRecords];
  }

  // 获取反思记录
  getReflections(): Reflection[] {
    return Array.from(this.reflections.values());
  }
}