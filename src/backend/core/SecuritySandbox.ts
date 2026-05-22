// 安全沙箱验证引擎 + 版本控制与回滚系统

export interface SandboxConfig {
  timeout: number;
  maxMemoryMB: number;
  allowedOperations: string[];
  isolatedEnv: boolean;
}

export interface SandboxResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    executionTime: number;
    memoryUsed: number;
    apiCalls: number;
  };
}

export interface VersionSnapshot {
  id: string;
  timestamp: Date;
  description: string;
  files: Record<string, string>;
  parentId?: string;
}

export interface RollbackResult {
  success: boolean;
  targetVersion: string;
  restoredFiles: string[];
  skippedFiles: string[];
  errors: string[];
}

export class SecuritySandbox {
  private config: SandboxConfig;

  constructor(config?: Partial<SandboxConfig>) {
    this.config = {
      timeout: 30000,
      maxMemoryMB: 256,
      allowedOperations: ['read', 'write', 'compute', 'network'],
      isolatedEnv: true,
      ...config,
    };
  }

  // 验证代码安全性
  async validate(code: string): Promise<SandboxResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const startTime = Date.now();

    // 1. 静态分析 - 检查危险模式
    const staticAnalysis = this.staticAnalysis(code);
    errors.push(...staticAnalysis.errors);
    warnings.push(...staticAnalysis.warnings);

    // 2. 依赖检查
    const dependencyCheck = this.checkDependencies(code);
    errors.push(...dependencyCheck.errors);

    // 3. 资源限制检查
    const resourceCheck = this.checkResourceUsage(code);
    warnings.push(...resourceCheck.warnings);

    // 4. 权限验证
    const permissionCheck = this.checkPermissions(code);
    errors.push(...permissionCheck.errors);

    const executionTime = Date.now() - startTime;

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      metrics: {
        executionTime,
        memoryUsed: this.estimateMemory(code),
        apiCalls: this.countAPICalls(code),
      },
    };
  }

  // 静态安全检查
  private staticAnalysis(code: string): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 禁止模式
    const forbiddenPatterns: Array<{ pattern: RegExp; message: string; severity: 'error' | 'warning' }> = [
      { pattern: /eval\s*\(/, message: '禁止使用 eval()', severity: 'error' },
      { pattern: /Function\s*\(/, message: '禁止动态创建Function', severity: 'error' },
      { pattern: /require\s*\(\s*['"]child_process['"]\s*\)/, message: '禁止访问child_process', severity: 'error' },
      { pattern: /fs\.(unlink|rmdir|rm)\s*\(/, message: '禁止删除文件系统操作', severity: 'warning' },
      { pattern: /process\.(exit|kill)/, message: '禁止进程控制操作', severity: 'error' },
      { pattern: /__proto__/, message: '禁止原型链修改', severity: 'error' },
      { pattern: /\.constructor\s*\(/, message: '禁止动态构造函数', severity: 'warning' },
      { pattern: /\bdelete\s+global\b/, message: '禁止修改全局对象', severity: 'error' },
      { pattern: /new\s+Worker\s*\(/, message: '禁止创建Web Worker', severity: 'warning' },
      { pattern: /fetch\s*\(|XMLHttpRequest|axios|request\s*\(/, message: '禁止未授权的网络请求', severity: 'warning' },
    ];

    for (const { pattern, message, severity } of forbiddenPatterns) {
      if (pattern.test(code)) {
        if (severity === 'error') errors.push(message);
        else warnings.push(message);
      }
    }

    return { errors, warnings };
  }

  // 依赖安全检查
  private checkDependencies(code: string): { errors: string[] } {
    const errors: string[] = [];
    const requireMatches = code.match(/require\s*\(['"]([^'"]+)['"]\)/g) || [];
    
    const blockedModules = ['child_process', 'cluster', 'dgram', 'dns', 'fs', 'net', 'vm'];
    
    for (const match of requireMatches) {
      const moduleName = match.replace(/require\s*\(['"]/, '').replace(/['"]\)/, '');
      if (blockedModules.includes(moduleName)) {
        errors.push(`禁止加载模块: ${moduleName}`);
      }
    }

    return { errors };
  }

  // 资源使用检查
  private checkResourceUsage(code: string): { warnings: string[] } {
    const warnings: string[] = [];
    
    if (code.length > 10000) {
      warnings.push(`代码长度 ${code.length} 字符，建议精简`);
    }
    
    const loopCount = (code.match(/\b(for|while)\b/g) || []).length;
    if (loopCount > 5) {
      warnings.push(`检测到 ${loopCount} 个循环，注意性能`);
    }

    return { warnings };
  }

  // 权限检查
  private checkPermissions(code: string): { errors: string[] } {
    const errors: string[] = [];
    
    if (!this.config.allowedOperations.includes('write')) {
      if (/fs\.writeFile|fs\.appendFile/.test(code)) {
        errors.push('沙箱不允许写操作');
      }
    }

    if (!this.config.allowedOperations.includes('network')) {
      if (/fetch|http\.|https\./.test(code)) {
        errors.push('沙箱不允许网络操作');
      }
    }

    return { errors };
  }

  // 估算内存使用
  private estimateMemory(code: string): number {
    return Math.ceil(code.length * 2 / 1024);
  }

  // 计算API调用次数
  private countAPICalls(code: string): number {
    const patterns = [/\(/g, /console\./g, /JSON\./g, /Math\./g, /Date/g];
    return patterns.reduce((sum, p) => sum + (code.match(p) || []).length, 0);
  }
}

// 版本控制与回滚系统
export class VersionControl {
  private versions: VersionSnapshot[] = [];
  private currentVersionIndex: number = -1;

  // 创建版本快照
  createSnapshot(description: string, files: Record<string, string>): VersionSnapshot {
    const snapshot: VersionSnapshot = {
      id: `v${this.versions.length}-${Date.now()}`,
      timestamp: new Date(),
      description,
      files: { ...files },
      parentId: this.currentVersionIndex >= 0
        ? this.versions[this.currentVersionIndex].id
        : undefined,
    };

    this.versions.push(snapshot);
    this.currentVersionIndex = this.versions.length - 1;
    
    console.log(`[VersionControl] 创建快照: ${snapshot.id} - ${description}`);
    return snapshot;
  }

  // 回滚到指定版本
  rollback(targetId?: string): RollbackResult {
    if (this.versions.length === 0) {
      return {
        success: false,
        targetVersion: 'none',
        restoredFiles: [],
        skippedFiles: [],
        errors: ['没有可用的回滚版本'],
      };
    }

    let targetIndex: number;
    if (targetId) {
      targetIndex = this.versions.findIndex(v => v.id === targetId);
      if (targetIndex === -1) {
        return {
          success: false,
          targetVersion: targetId,
          restoredFiles: [],
          skippedFiles: [],
          errors: [`版本 ${targetId} 不存在`],
        };
      }
    } else {
      // 默认回滚到上一个版本
      targetIndex = this.currentVersionIndex > 0
        ? this.currentVersionIndex - 1
        : 0;
    }

    const targetVersion = this.versions[targetIndex];
    const currentVersion = this.versions[this.currentVersionIndex];
    
    const restoredFiles: string[] = [];
    const skippedFiles: string[] = [];

    for (const [file, content] of Object.entries(targetVersion.files)) {
      if (currentVersion.files[file] !== content) {
        restoredFiles.push(file);
      } else {
        skippedFiles.push(file);
      }
    }

    this.currentVersionIndex = targetIndex;

    return {
      success: true,
      targetVersion: targetVersion.id,
      restoredFiles,
      skippedFiles,
      errors: [],
    };
  }

  // 获取版本历史
  getHistory(): Array<{ id: string; timestamp: Date; description: string; isCurrent: boolean }> {
    return this.versions.map((v, i) => ({
      id: v.id,
      timestamp: v.timestamp,
      description: v.description,
      isCurrent: i === this.currentVersionIndex,
    }));
  }

  // 获取当前版本
  getCurrentVersion(): VersionSnapshot | null {
    if (this.currentVersionIndex < 0) return null;
    return this.versions[this.currentVersionIndex];
  }

  // 比较两个版本
  diff(fromId: string, toId: string): Record<string, { before: string; after: string }> {
    const from = this.versions.find(v => v.id === fromId);
    const to = this.versions.find(v => v.id === toId);
    if (!from || !to) return {};

    const changes: Record<string, { before: string; after: string }> = {};
    
    const allFiles = new Set([...Object.keys(from.files), ...Object.keys(to.files)]);
    for (const file of allFiles) {
      const before = from.files[file] || '';
      const after = to.files[file] || '';
      if (before !== after) {
        changes[file] = { before, after };
      }
    }

    return changes;
  }

  // 获取版本数量
  getCount(): number {
    return this.versions.length;
  }
}

export const securitySandbox = new SecuritySandbox();
export const versionControl = new VersionControl();