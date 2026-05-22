// NexMindMARVIS - MARVIS-like扁平架构实现
// 简洁高效的智能中枢核心

import { IntentParser, ParsedIntent, intentParser } from './IntentParser';
import { SystemExecutor, ExecutionResult, systemExecutor } from './SystemExecutor';
import { expertManager } from '../agents/ExpertAgent';
import { memoryTree } from '../core/MemoryTree';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  intent?: ParsedIntent;
  result?: ExecutionResult;
}

export interface ChatResponse {
  message: ChatMessage;
  intent?: ParsedIntent;
  result?: ExecutionResult;
}

export class NexMindMARVIS {
  private intentParser: IntentParser;
  private systemExecutor: SystemExecutor;
  private conversationHistory: ChatMessage[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.intentParser = intentParser;
    this.systemExecutor = systemExecutor;
  }

  // 初始化系统
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[NexMindMARVIS] 已经初始化');
      return;
    }

    console.log('[NexMindMARVIS] 初始化中...');

    // 初始化专家系统
    await expertManager.initialize();

    // 初始化记忆系统
    memoryTree.startAutoFetch();

    this.isInitialized = true;
    console.log('[NexMindMARVIS] ✅ 初始化完成');
  }

  // 关闭系统
  async shutdown(): Promise<void> {
    console.log('[NexMindMARVIS] 关闭中...');
    memoryTree.stopAutoFetch();
    this.isInitialized = false;
    console.log('[NexMindMARVIS] 已关闭');
  }

  // 处理用户消息（核心入口）
  async processMessage(userInput: string): Promise<ChatResponse> {
    console.log(`\n[NexMindMARVIS] 收到消息: "${userInput}"`);
    const startTime = Date.now();

    // 1. 记录用户消息
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    this.conversationHistory.push(userMessage);

    // 2. 解析用户意图
    const intent = this.intentParser.parse(userInput);
    userMessage.intent = intent;
    console.log(`[NexMindMARVIS] 意图解析: ${intent.type}/${intent.action} (置信度: ${intent.confidence})`);

    // 3. 根据意图类型执行不同逻辑
    let result: ExecutionResult | undefined;
    let responseContent: string;

    if (intent.confidence < 0.3) {
      // 置信度过低，尝试专家咨询
      responseContent = await this.handleLowConfidence(intent);
    } else if (intent.requiresExpert) {
      // 需要专家咨询
      responseContent = await this.handleExpertConsult(intent);
    } else if (intent.requiresSystemAccess) {
      // 需要系统访问权限
      result = await this.systemExecutor.execute(intent);
      responseContent = this.formatExecutionResult(result);
    } else if (intent.type === 'memory_query') {
      // 记忆查询
      responseContent = await this.handleMemoryQuery(intent);
    } else if (intent.type === 'web_search') {
      // 网页搜索
      result = await this.systemExecutor.execute(intent);
      responseContent = this.formatExecutionResult(result);
    } else if (intent.type === 'chat' || intent.type === 'unknown') {
      // 简单对话
      responseContent = await this.handleSimpleChat(intent);
    } else {
      // 其他类型，尝试执行
      result = await this.systemExecutor.execute(intent);
      responseContent = this.formatExecutionResult(result);
    }

    // 4. 生成助手回复
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      intent,
      result,
    };
    this.conversationHistory.push(assistantMessage);

    const executionTime = Date.now() - startTime;
    console.log(`[NexMindMARVIS] 处理完成，耗时: ${executionTime}ms`);

    return {
      message: assistantMessage,
      intent,
      result,
    };
  }

  // 处理低置信度意图
  private async handleLowConfidence(intent: ParsedIntent): Promise<string> {
    console.log(`[NexMindMARVIS] 置信度过低，尝试专家咨询`);
    
    // 询问专家
    const response = await expertManager.summonExpert(
      'general',
      intent.parameters[0]?.value?.toString() || intent.reasoning
    );

    if (response.success) {
      return `我理解你的需求了，让我咨询一下专家...\n\n**专家建议**:\n${response.result.analysis}`;
    }

    return `抱歉，我不太理解你的意思。你能换一种方式描述吗？\n\n例如：\n- "帮我搜索文件：报告"\n- "打开VS Code"\n- "移动文件到桌面"`;
  }

  // 处理专家咨询
  private async handleExpertConsult(intent: ParsedIntent): Promise<string> {
    const expertId = intent.parameters.find(p => p.key === 'expertId')?.value as string || 'general';
    const question = intent.parameters.find(p => p.key === 'question')?.value as string;

    console.log(`[NexMindMARVIS] 咨询专家: ${expertId}`);

    const response = await expertManager.summonExpert(expertId, question);

    if (response.success) {
      return `**${expertId}专家建议**:\n\n${response.result.analysis}\n\n**建议**:\n${response.result.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
    }

    return `抱歉，${expertId}专家暂时无法响应。请稍后再试。`;
  }

  // 处理记忆查询
  private async handleMemoryQuery(intent: ParsedIntent): Promise<string> {
    const query = intent.parameters.find(p => p.key === 'query')?.value as string;

    console.log(`[NexMindMARVIS] 查询记忆: ${query}`);

    const results = await memoryTree.search(query, 5);

    if (results.length === 0) {
      return `我没有找到与"${query}"相关的记忆。`;
    }

    return `**找到${results.length}条相关记忆**:\n\n${results.map((r, i) => 
      `${i + 1}. [${r.type}] ${r.content.substring(0, 100)}...`
    ).join('\n\n')}`;
  }

  // 处理简单对话
  private async handleSimpleChat(intent: ParsedIntent): Promise<string> {
    // 简单的对话回复逻辑
    const content = intent.parameters[0]?.value?.toString() || '';

    const greetings = ['你好', 'hi', 'hello', '嗨', '您好'];
    if (greetings.some(g => content.toLowerCase().includes(g))) {
      return `你好！我是NexMind，一个智能助手。\n\n我可以帮你：\n- 📁 搜索和管理文件\n- 🚀 启动和关闭应用\n- ⚙️ 修改系统设置\n- 🔍 搜索网页\n- 💡 咨询专家意见\n\n有什么我可以帮你的吗？`;
    }

    const helpRequests = ['帮助', 'help', '能做什么', '功能'];
    if (helpRequests.some(h => content.includes(h))) {
      return `**NexMind可以帮助你**:\n\n1. **文件操作**：搜索、移动、复制、删除、重命名文件\n2. **应用控制**：打开和关闭应用程序\n3. **系统配置**：查看和修改系统设置\n4. **专家咨询**：咨询代码架构、安全等专家\n5. **记忆查询**：搜索之前的对话和记忆\n6. **网页搜索**：帮你搜索网页内容\n\n试试说："帮我搜索报告文件"或"打开VS Code"`;
    }

    // 默认回复
    return `我明白了，你说的是"${content}"。\n\n如果你想执行操作，可以这样告诉我：\n- "搜索文件：项目报告"\n- "打开Chrome"\n- "把test.txt移动到桌面"`;
  }

  // 格式化执行结果
  private formatExecutionResult(result: ExecutionResult): string {
    if (result.success) {
      let message = `✅ ${result.message}`;

      if (result.data) {
        if (result.data.files) {
          message += '\n\n**文件列表**:\n' + result.data.files.map((f: any) => 
            `📄 ${f.name}\n   路径: ${f.path}\n   大小: ${f.size}\n   修改: ${f.modified}`
          ).join('\n\n');
        } else if (result.data.results) {
          message += '\n\n**搜索结果**:\n' + result.data.results.map((r: any, i: number) => 
            `${i + 1}. [${r.title}](${r.url})\n   ${r.snippet}`
          ).join('\n\n');
        } else if (result.data.steps) {
          message += '\n\n**工作流状态**:\n' + result.data.steps.map((s: any) => 
            `${s.status === 'completed' ? '✅' : s.status === 'in_progress' ? '🔄' : '⏳'} ${s.name}`
          ).join('\n');
        } else if (result.data.app || result.data.key) {
          message += '\n\n详细信息: ' + JSON.stringify(result.data, null, 2);
        }
      }

      return message;
    } else {
      return `❌ ${result.message}\n\n${result.error ? `错误详情: ${result.error}` : ''}`;
    }
  }

  // 获取对话历史
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  // 清空对话历史
  clearHistory(): void {
    this.conversationHistory = [];
    console.log('[NexMindMARVIS] 对话历史已清空');
  }

  // 导出记忆
  async exportMemory(outputPath: string): Promise<void> {
    await memoryTree.exportToObsidian(outputPath);
    console.log(`[NexMindMARVIS] 记忆已导出到: ${outputPath}`);
  }

  // 获取系统状态
  getSystemStatus(): any {
    return {
      initialized: this.isInitialized,
      conversationCount: this.conversationHistory.length,
      handlers: this.systemExecutor.getRegisteredHandlers(),
      availableExperts: expertManager.getAvailableExperts().length,
    };
  }
}

// 单例实例
export const nexMindMARVIS = new NexMindMARVIS();
