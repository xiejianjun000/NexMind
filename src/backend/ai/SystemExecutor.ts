// 系统执行器 - 执行解析后的意图
// 连接前端意图和后端系统操作

import { ParsedIntent, IntentType } from './IntentParser';

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: Date;
  executionTime: number;
}

interface ExecutorHandler {
  canHandle(intent: ParsedIntent): boolean;
  execute(intent: ParsedIntent): Promise<ExecutionResult>;
}

export class SystemExecutor {
  private handlers: Map<string, ExecutorHandler> = new Map();
  private tauriAvailable: boolean = false;

  constructor() {
    this.initializeHandlers();
    this.checkTauriAvailability();
  }

  private async checkTauriAvailability() {
    // 检查Tauri是否可用
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        this.tauriAvailable = true;
        console.log('[SystemExecutor] ✅ Tauri后端可用');
      } else {
        console.log('[SystemExecutor] ⚠️ Tauri后端不可用，使用模拟模式');
      }
    } catch (error) {
      console.log('[SystemExecutor] ⚠️ Tauri后端不可用，使用模拟模式');
    }
  }

  private initializeHandlers() {
    // 文件操作处理器
    this.handlers.set('file_operation', {
      canHandle: (intent) => intent.type === 'file_operation',
      execute: async (intent) => this.handleFileOperation(intent),
    });

    // 应用控制处理器
    this.handlers.set('app_control', {
      canHandle: (intent) => intent.type === 'app_control',
      execute: async (intent) => this.handleAppControl(intent),
    });

    // 系统配置处理器
    this.handlers.set('system_config', {
      canHandle: (intent) => intent.type === 'system_config',
      execute: async (intent) => this.handleSystemConfig(intent),
    });

    // 网页搜索处理器
    this.handlers.set('web_search', {
      canHandle: (intent) => intent.type === 'web_search',
      execute: async (intent) => this.handleWebSearch(intent),
    });

    // 自动化任务处理器
    this.handlers.set('automation', {
      canHandle: (intent) => intent.type === 'automation',
      execute: async (intent) => this.handleAutomation(intent),
    });
  }

  // 执行意图
  async execute(intent: ParsedIntent): Promise<ExecutionResult> {
    const startTime = Date.now();
    console.log(`[SystemExecutor] 执行意图: ${intent.type}/${intent.action}`);

    const handler = this.handlers.get(intent.type);
    if (!handler) {
      return {
        success: false,
        message: `不支持的意图类型: ${intent.type}`,
        timestamp: new Date(),
        executionTime: Date.now() - startTime,
      };
    }

    try {
      const result = await handler.execute(intent);
      result.executionTime = Date.now() - startTime;
      console.log(`[SystemExecutor] ✅ 执行完成:`, result);
      return result;
    } catch (error) {
      console.error(`[SystemExecutor] ❌ 执行失败:`, error);
      return {
        success: false,
        message: `执行失败: ${(error as Error).message}`,
        error: (error as Error).stack,
        timestamp: new Date(),
        executionTime: Date.now() - startTime,
      };
    }
  }

  // 处理文件操作
  private async handleFileOperation(intent: ParsedIntent): Promise<ExecutionResult> {
    const { action } = intent;
    const params = this.extractParams(intent);

    console.log(`[SystemExecutor] 文件操作: ${action}`, params);

    // 模拟执行（实际会调用Tauri后端）
    switch (action) {
      case 'search':
        return await this.simulateFileSearch(params.query);
      
      case 'move':
        return await this.simulateFileMove(params.source, params.destination);
      
      case 'copy':
        return await this.simulateFileCopy(params.source, params.destination);
      
      case 'delete':
        return await this.simulateFileDelete(params.target);
      
      case 'rename':
        return await this.simulateFileRename(params.target, params.newName);
      
      default:
        return {
          success: false,
          message: `不支持的文件操作: ${action}`,
          timestamp: new Date(),
          executionTime: 0,
        };
    }
  }

  // 处理应用控制
  private async handleAppControl(intent: ParsedIntent): Promise<ExecutionResult> {
    const { action } = intent;
    const params = this.extractParams(intent);

    console.log(`[SystemExecutor] 应用控制: ${action}`, params);

    switch (action) {
      case 'launch':
        return await this.simulateAppLaunch(params.app);
      
      case 'close':
        return await this.simulateAppClose(params.app);
      
      default:
        return {
          success: false,
          message: `不支持的应用操作: ${action}`,
          timestamp: new Date(),
          executionTime: 0,
        };
    }
  }

  // 处理系统配置
  private async handleSystemConfig(intent: ParsedIntent): Promise<ExecutionResult> {
    const { action } = intent;
    const params = this.extractParams(intent);

    console.log(`[SystemExecutor] 系统配置: ${action}`, params);

    switch (action) {
      case 'get':
        return await this.simulateGetConfig(params.config);
      
      case 'set':
        return await this.simulateSetConfig(params.key, params.value);
      
      default:
        return {
          success: false,
          message: `不支持的配置操作: ${action}`,
          timestamp: new Date(),
          executionTime: 0,
        };
    }
  }

  // 处理网页搜索
  private async handleWebSearch(intent: ParsedIntent): Promise<ExecutionResult> {
    const params = this.extractParams(intent);
    
    console.log(`[SystemExecutor] 网页搜索: ${params.query}`);
    
    // 这里可以调用真实的搜索引擎API
    // 目前使用模拟结果
    return {
      success: true,
      message: `已在Google搜索: "${params.query}"`,
      data: {
        query: params.query,
        results: [
          { title: '搜索结果1', url: 'https://example.com/1', snippet: '这是搜索结果1的摘要' },
          { title: '搜索结果2', url: 'https://example.com/2', snippet: '这是搜索结果2的摘要' },
        ],
      },
      timestamp: new Date(),
      executionTime: 500,
    };
  }

  // 处理自动化任务
  private async handleAutomation(intent: ParsedIntent): Promise<ExecutionResult> {
    const params = this.extractParams(intent);
    
    console.log(`[SystemExecutor] 自动化任务: ${params.workflow}`);
    
    // 模拟工作流执行
    return {
      success: true,
      message: `正在执行自动化任务: ${params.workflow}`,
      data: {
        workflow: params.workflow,
        steps: [
          { name: '步骤1', status: 'completed' },
          { name: '步骤2', status: 'in_progress' },
          { name: '步骤3', status: 'pending' },
        ],
      },
      timestamp: new Date(),
      executionTime: 1000,
    };
  }

  // 提取参数
  private extractParams(intent: ParsedIntent): Record<string, any> {
    const params: Record<string, any> = {};
    for (const param of intent.parameters) {
      params[param.key] = param.value;
    }
    return params;
  }

  // ===== 模拟执行方法（实际会调用Tauri后端） =====

  private async simulateFileSearch(query: string): Promise<ExecutionResult> {
    await this.delay(500);
    
    // 模拟搜索结果
    return {
      success: true,
      message: `找到3个匹配"${query}"的文件`,
      data: {
        query,
        files: [
          { path: 'C:\\Users\\Documents\\report.pdf', name: 'report.pdf', size: '2.3MB', modified: '2026-05-20' },
          { path: 'C:\\Users\\Downloads\\report.zip', name: 'report.zip', size: '15.7MB', modified: '2026-05-19' },
          { path: 'C:\\Users\\Desktop\\report.docx', name: 'report.docx', size: '1.2MB', modified: '2026-05-18' },
        ],
      },
      timestamp: new Date(),
      executionTime: 500,
    };
  }

  private async simulateFileMove(source: string, destination: string): Promise<ExecutionResult> {
    await this.delay(300);
    
    return {
      success: true,
      message: `已移动文件从"${source}"到"${destination}"`,
      data: { source, destination },
      timestamp: new Date(),
      executionTime: 300,
    };
  }

  private async simulateFileCopy(source: string, destination: string): Promise<ExecutionResult> {
    await this.delay(400);
    
    return {
      success: true,
      message: `已复制文件从"${source}"到"${destination}"`,
      data: { source, destination },
      timestamp: new Date(),
      executionTime: 400,
    };
  }

  private async simulateFileDelete(target: string): Promise<ExecutionResult> {
    await this.delay(200);
    
    return {
      success: true,
      message: `已删除文件: "${target}"`,
      data: { target, movedToTrash: true },
      timestamp: new Date(),
      executionTime: 200,
    };
  }

  private async simulateFileRename(target: string, newName: string): Promise<ExecutionResult> {
    await this.delay(200);
    
    return {
      success: true,
      message: `已将"${target}"重命名为"${newName}"`,
      data: { target, newName },
      timestamp: new Date(),
      executionTime: 200,
    };
  }

  private async simulateAppLaunch(app: string): Promise<ExecutionResult> {
    await this.delay(500);
    
    return {
      success: true,
      message: `已启动应用: ${app}`,
      data: { app, pid: Math.floor(Math.random() * 10000) },
      timestamp: new Date(),
      executionTime: 500,
    };
  }

  private async simulateAppClose(app: string): Promise<ExecutionResult> {
    await this.delay(300);
    
    return {
      success: true,
      message: `已关闭应用: ${app}`,
      data: { app },
      timestamp: new Date(),
      executionTime: 300,
    };
  }

  private async simulateGetConfig(config: string): Promise<ExecutionResult> {
    await this.delay(200);
    
    // 模拟系统配置
    const configs: Record<string, any> = {
      '音量': 75,
      '亮度': 80,
      '主题': 'dark',
      '语言': 'zh-CN',
    };
    
    return {
      success: true,
      message: `当前${config}设置为: ${configs[config] || '未知'}`,
      data: { config, value: configs[config] || '未知' },
      timestamp: new Date(),
      executionTime: 200,
    };
  }

  private async simulateSetConfig(key: string, value: any): Promise<ExecutionResult> {
    await this.delay(200);
    
    return {
      success: true,
      message: `已将${key}设置为: ${value}`,
      data: { key, value },
      timestamp: new Date(),
      executionTime: 200,
    };
  }

  // 延迟辅助方法
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 注册新的处理器
  registerHandler(type: string, handler: ExecutorHandler): void {
    this.handlers.set(type, handler);
    console.log(`[SystemExecutor] 注册处理器: ${type}`);
  }

  // 获取已注册的处理器列表
  getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const systemExecutor = new SystemExecutor();
