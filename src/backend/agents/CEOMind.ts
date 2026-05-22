// CEO智能体 - 核心决策引擎
// 集成了意图解析、任务编排、反馈学习的智能协调者

import { communicationBus, AgentMessage, MessageType } from '../../shared/types/agentCommunication';
import { IntentParser, ParsedIntent, IntentType } from '../ai/IntentParser';
import { taskCoordinator, CoordinatedTask, SubTask } from '../multiagent/TaskCoordinator';
import { agentManager } from '../multiagent/AgentManager';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  intent?: ParsedIntent;
}

export interface Task {
  id: string;
  type: 'chat' | 'search' | 'action' | 'reasoning';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  result?: any;
  agentId?: string;
}

export interface Feedback {
  taskId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  improvements?: string[];
  timestamp: Date;
}

export interface LearningData {
  successfulPatterns: Map<string, number>;
  failedPatterns: Map<string, number>;
  userPreferences: Map<string, string>;
  taskSuccessRates: Map<string, number>;
}

export interface AgentRoutingRule {
  intentType: IntentType;
  primaryAgent: string;
  fallbackAgent?: string;
  confidenceThreshold: number;
}

export class CEOMind {
  private messages: Message[] = [];
  private currentTasks: Task[] = [];
  private messageHandler: ((msg: AgentMessage) => void) | null = null;
  private intentParser: IntentParser;
  private learningData: LearningData;
  private routingRules: AgentRoutingRule[];
  private feedbackHistory: Feedback[] = [];

  constructor() {
    this.intentParser = new IntentParser();
    this.learningData = {
      successfulPatterns: new Map(),
      failedPatterns: new Map(),
      userPreferences: new Map(),
      taskSuccessRates: new Map(),
    };
    this.initializeRoutingRules();
    this.addSystemMessage();
  }

  private initializeRoutingRules(): void {
    this.routingRules = [
      { intentType: 'file_operation', primaryAgent: 'file-agent', confidenceThreshold: 0.7 },
      { intentType: 'app_control', primaryAgent: 'system-agent', confidenceThreshold: 0.7 },
      { intentType: 'system_config', primaryAgent: 'system-agent', confidenceThreshold: 0.7 },
      { intentType: 'web_search', primaryAgent: 'general-agent', confidenceThreshold: 0.6 },
      { intentType: 'expert_consult', primaryAgent: 'knowledge-agent', confidenceThreshold: 0.7 },
      { intentType: 'memory_query', primaryAgent: 'knowledge-agent', confidenceThreshold: 0.7 },
      { intentType: 'automation', primaryAgent: 'general-agent', confidenceThreshold: 0.5 },
      { intentType: 'chat', primaryAgent: 'general-agent', confidenceThreshold: 0.5 },
    ];
  }

  private addSystemMessage(): void {
    this.messages.push({
      id: 'system-1',
      role: 'assistant',
      content: '你好！我是NexMind的CEO智能体。我可以帮你协调团队完成各种任务。请告诉我你需要什么帮助？',
      timestamp: new Date(),
    });
  }

  start(): void {
    const registration = {
      agentId: 'ceo',
      agentType: 'coordinator',
      capabilities: [
        { id: 'chat', name: '对话交互', description: '与用户进行自然语言对话' },
        { id: 'coordinate', name: '任务协调', description: '协调其他智能体完成任务' },
        { id: 'delegate', name: '任务委托', description: '将任务委托给合适的智能体' },
        { id: 'learn', name: '学习优化', description: '基于反馈学习优化决策' },
      ],
      status: 'active',
    };

    communicationBus.registerAgent(registration);
    agentManager.startAll();

    this.messageHandler = this.handleMessage.bind(this);
    communicationBus.subscribe('ceo', this.messageHandler);

    console.log('[CEO] CEO智能体已启动，已注册到消息总线');
  }

  stop(): void {
    if (this.messageHandler) {
      communicationBus.unsubscribe('ceo', this.messageHandler);
    }
    agentManager.stopAll();
    communicationBus.unregisterAgent('ceo');
    console.log('[CEO] CEO智能体已停止');
  }

  private handleMessage(msg: AgentMessage): void {
    console.log(`[CEO] 收到消息 from=${msg.from}, type=${msg.type}, action=${msg.action}`);

    if (msg.type === MessageType.RESPONSE) {
      this.handleResponse(msg);
    } else if (msg.type === MessageType.BROADCAST) {
      this.handleBroadcast(msg);
    }
  }

  private handleResponse(msg: AgentMessage): void {
    if (msg.payload?.success) {
      console.log(`[CEO] 收到响应: ${JSON.stringify(msg.payload)}`);
      this.recordSuccess(msg.action);
    } else {
      console.log(`[CEO] 收到失败响应: ${JSON.stringify(msg.payload)}`);
      this.recordFailure(msg.action);
    }
  }

  private handleBroadcast(msg: AgentMessage): void {
    console.log(`[CEO] 收到广播: ${msg.action}`);
  }

  async handleUserMessage(content: string): Promise<Message> {
    console.log('[CEO] 收到用户消息:', content);

    const intent = this.intentParser.parse(content);
    console.log('[CEO] 意图识别:', intent);

    const response = await this.executeIntent(intent, content);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      intent,
    };

    this.messages.push(userMsg, assistantMsg);

    return assistantMsg;
  }

  private async executeIntent(intent: ParsedIntent, originalInput: string): Promise<string> {
    if (intent.type === 'unknown') {
      return this.handleUnknownIntent(originalInput);
    }

    const routedAgent = this.routeToAgent(intent);
    console.log(`[CEO] 路由到智能体: ${routedAgent}`);

    if (intent.confidence < 0.6) {
      return this.handleLowConfidence(intent, routedAgent);
    }

    switch (intent.type) {
      case 'file_operation':
        return await this.handleFileOperation(intent, routedAgent);

      case 'app_control':
        return await this.handleAppControl(intent, routedAgent);

      case 'system_config':
        return await this.handleSystemConfig(intent, routedAgent);

      case 'web_search':
        return await this.handleWebSearch(intent, routedAgent);

      case 'expert_consult':
        return await this.handleExpertConsult(intent, routedAgent);

      case 'memory_query':
        return await this.handleMemoryQuery(intent, routedAgent);

      case 'automation':
        return await this.handleAutomation(intent, routedAgent);

      case 'chat':
      default:
        return await this.handleChat(intent, routedAgent);
    }
  }

  private routeToAgent(intent: ParsedIntent): string {
    const rule = this.routingRules.find(r => r.intentType === intent.type);
    if (rule && intent.confidence >= rule.confidenceThreshold) {
      return rule.primaryAgent;
    }
    return 'general-agent';
  }

  private handleLowConfidence(intent: ParsedIntent, agent: string): string {
    return `我理解你可能需要${this.getIntentDescription(intent.type)}相关帮助，但我不太确定具体操作。\n\n你可以更具体地描述你的需求，比如：\n- "搜索 C:\\ 下的 pdf 文件"\n- "打开记事本"\n- "帮我整理桌面"\n\n我会尽力帮你完成任务！`;
  }

  private handleUnknownIntent(input: string): string {
    const greetings = ['你好', 'hi', 'hello', '嗨', 'hey'];
    if (greetings.some(g => input.toLowerCase().includes(g))) {
      return '你好！我是NexMind的CEO智能体。我可以通过协调团队来帮助你完成各种任务。\n\n你可以尝试：\n- 📁 "搜索项目文档"\n- ⚙️ "打开设置"\n- 📊 "帮我分析数据"\n- 📚 "查询某个知识点"\n\n请告诉我你需要什么帮助？';
    }

    if (input.includes('功能') || input.includes('能做什么') || input.includes('帮助')) {
      return this.getCapabilitiesDescription();
    }

    if (input.includes('状态') || input.includes('团队')) {
      return this.getTeamStatus();
    }

    return `我理解你的需求是："${input}"\n\n作为CEO，我会尽力帮你完成任务。你可以更具体地描述你的需求，比如：\n- 📁 "帮我找一下桌面上的文档"\n- ⚙️ "打开控制面板"\n- 📚 "查询项目相关的知识点"\n\n或者直接描述你想要的结果，我会协调团队来帮你实现！`;
  }

  private async handleFileOperation(intent: ParsedIntent, agent: string): Promise<string> {
    const action = intent.action;
    const params = this.extractParams(intent);

    try {
      const response = await communicationBus.sendRequest(
        'ceo',
        agent,
        `file.${action}`,
        params,
        30000
      );

      if (response.payload?.success) {
        this.recordSuccess(`file.${action}`);
        return this.formatFileResult(action, response.payload.data);
      } else {
        this.recordFailure(`file.${action}`);
        return `文件操作遇到问题：${response.payload?.error || '未知错误'}`;
      }
    } catch (error) {
      this.recordFailure(`file.${action}`);
      return `执行文件操作失败：${(error as Error).message}`;
    }
  }

  private async handleAppControl(intent: ParsedIntent, agent: string): Promise<string> {
    const action = intent.action;
    const params = this.extractParams(intent);

    try {
      const response = await communicationBus.sendRequest(
        'ceo',
        agent,
        `app.${action}`,
        params,
        15000
      );

      if (response.payload?.success) {
        this.recordSuccess(`app.${action}`);
        const appName = params.app || params.name || '应用';
        return this.formatAppResult(action, appName, response.payload.data);
      } else {
        this.recordFailure(`app.${action}`);
        return `应用操作遇到问题：${response.payload?.error || '未知错误'}`;
      }
    } catch (error) {
      this.recordFailure(`app.${action}`);
      return `执行应用操作失败：${(error as Error).message}`;
    }
  }

  private async handleSystemConfig(intent: ParsedIntent, agent: string): Promise<string> {
    const action = intent.action;
    const params = this.extractParams(intent);

    try {
      const response = await communicationBus.sendRequest(
        'ceo',
        agent,
        `system.config.${action}`,
        params,
        10000
      );

      if (response.payload?.success) {
        this.recordSuccess(`system.config.${action}`);
        return `系统配置更新成功！\n\n${JSON.stringify(response.payload.data, null, 2)}`;
      } else {
        this.recordFailure(`system.config.${action}`);
        return `系统配置失败：${response.payload?.error || '未知错误'}`;
      }
    } catch (error) {
      this.recordFailure(`system.config.${action}`);
      return `执行系统配置失败：${(error as Error).message}`;
    }
  }

  private async handleWebSearch(intent: ParsedIntent, agent: string): Promise<string> {
    const params = this.extractParams(intent);
    
    return `🌐 正在进行网络搜索：${params.query || intent.parameters[0]?.value}\n\n搜索完成后我会把结果告诉你...`;
  }

  private async handleExpertConsult(intent: ParsedIntent, agent: string): Promise<string> {
    const params = this.extractParams(intent);
    
    return `📚 我正在咨询专家团队...\n\n问题：${params.question || params.query}\n\n请稍候，我会尽快给你专业的解答。`;
  }

  private async handleMemoryQuery(intent: ParsedIntent, agent: string): Promise<string> {
    const params = this.extractParams(intent);
    
    return `🧠 我正在查询记忆库...\n\n关键词：${params.query}\n\n这可能需要一点时间，让我帮你回忆一下...`;
  }

  private async handleAutomation(intent: ParsedIntent, agent: string): Promise<string> {
    console.log('[CEO] 启动自动化任务编排...');
    
    try {
      const coordinatedTask = await taskCoordinator.coordinate(
        intent.parameters[0]?.value?.toString() || '自动化任务'
      );

      this.recordSuccess('automation.workflow');
      return this.formatTaskResult(coordinatedTask);
    } catch (error) {
      this.recordFailure('automation.workflow');
      return `自动化任务执行失败：${(error as Error).message}`;
    }
  }

  private async handleChat(intent: ParsedIntent, agent: string): Promise<string> {
    const query = intent.parameters[0]?.value?.toString() || '';
    
    if (query.includes('状态') || query.includes('团队')) {
      return this.getTeamStatus();
    }

    if (query.includes('能力') || query.includes('功能')) {
      return this.getCapabilitiesDescription();
    }

    return `我理解你的问题。我作为CEO智能体，可以帮你协调团队完成各种任务。\n\n你可以：\n- 📁 搜索和整理文件\n- ⚙️ 控制应用和系统\n- 📊 分析数据\n- 📚 查询知识\n\n请告诉我你需要什么帮助？`;
  }

  private extractParams(intent: ParsedIntent): Record<string, any> {
    const params: Record<string, any> = {};
    for (const param of intent.parameters) {
      params[param.key] = param.value;
    }
    return params;
  }

  private formatFileResult(action: string, data: any): string {
    switch (action) {
      case 'search':
        if (data.files?.length > 0) {
          const files = data.files.slice(0, 5).map((f: any) => `📄 ${f.name} (${this.formatSize(f.size)})`).join('\n');
          return `🔍 搜索完成！找到 ${data.total} 个文件：\n\n${files}${data.total > 5 ? `\n\n...还有 ${data.total - 5} 个文件` : ''}`;
        }
        return '🔍 搜索完成，没有找到匹配的文件。';

      case 'move':
        return `✅ 文件已成功移动到新位置！`;

      case 'copy':
        return `✅ 文件已成功复制！`;

      case 'delete':
        return `🗑️ 文件已删除${data.toTrash ? '到回收站' : '永久删除'}！`;

      case 'rename':
        return `✏️ 文件已重命名！`;

      default:
        return `✅ 文件操作完成！`;
    }
  }

  private formatAppResult(action: string, appName: string, data: any): string {
    switch (action) {
      case 'launch':
        return `🚀 已成功启动 ${appName}！`;

      case 'close':
        return `🔒 已成功关闭 ${appName}！`;

      case 'list':
        if (data?.length > 0) {
          const apps = data.slice(0, 10).map((a: any) => `⚙️ ${a.name}`).join('\n');
          return `📋 当前运行的应用：\n\n${apps}`;
        }
        return '📋 当前没有运行的应用。';

      default:
        return `✅ 应用操作完成！`;
    }
  }

  private formatTaskResult(task: CoordinatedTask): string {
    const completed = task.subtasks.filter(t => t.status === 'completed').length;
    const total = task.subtasks.length;
    
    let summary = `📊 任务完成！\n\n`;
    summary += `✅ 完成：${completed}/${total} 个子任务\n\n`;

    if (task.subtasks.length > 0) {
      summary += `📋 执行详情：\n`;
      task.subtasks.forEach((subtask, idx) => {
        const status = subtask.status === 'completed' ? '✅' : subtask.status === 'failed' ? '❌' : '⏳';
        const agentName = this.getAgentDisplayName(subtask.agentId);
        summary += `${status} ${idx + 1}. ${agentName} - ${subtask.action}\n`;
      });
    }

    return summary;
  }

  private getAgentDisplayName(agentId: string): string {
    const names: Record<string, string> = {
      'file-agent': '📁 文件管理员',
      'system-agent': '⚙️ 系统操控师',
      'knowledge-agent': '📚 知识库管理员',
      'image-agent': '🖼️ 图片整理师',
      'data-agent': '📊 数据分析师',
      'general-agent': '🔍 全能助手',
    };
    return names[agentId] || agentId;
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  private getIntentDescription(type: IntentType): string {
    const descriptions: Record<IntentType, string> = {
      'file_operation': '文件操作',
      'app_control': '应用控制',
      'system_config': '系统配置',
      'web_search': '网络搜索',
      'expert_consult': '专家咨询',
      'memory_query': '记忆查询',
      'automation': '自动化任务',
      'chat': '对话交流',
      'unknown': '未知',
    };
    return descriptions[type] || '未知';
  }

  private getCapabilitiesDescription(): string {
    return `🤖 NexMind CEO 智能体能力概览：

📁 **文件管理**
- 搜索文件（按名称、类型、内容）
- 移动、复制、重命名文件
- 整理桌面和文件夹

⚙️ **系统控制**
- 启动和关闭应用
- 系统设置和配置
- 剪贴板操作

📊 **数据分析**
- 文件搜索和整理
- 数据分类统计
- 生成报告

📚 **知识管理**
- 文档摘要提取
- 知识问答
- 记忆查询

🎯 **智能协调**
- 自动任务分解
- 多智能体协作
- 结果聚合

🔧 **自我学习**
- 基于反馈优化
- 学习用户偏好
- 持续改进

你可以直接告诉我你想要完成的任务，我会协调团队来帮你实现！`;
  }

  private getTeamStatus(): string {
    const statuses = agentManager.getRegisteredAgents();
    
    let status = `👥 **NexMind 团队状态**\n\n`;

    if (statuses.length === 0) {
      return status + `团队成员尚未启动...\n\n输入"启动"来激活团队！`;
    }

    const online = statuses.filter(s => s.status !== 'stopped').length;
    status += `🟢 在线：${online}/${statuses.length} 个智能体\n\n`;

    statuses.forEach(agent => {
      const statusIcon = agent.status === 'active' ? '🟢' : agent.status === 'busy' ? '🟡' : '⚫';
      const name = this.getAgentDisplayName(agent.id);
      status += `${statusIcon} ${name}\n`;
    });

    return status;
  }

  private recordSuccess(pattern: string): void {
    const current = this.learningData.successfulPatterns.get(pattern) || 0;
    this.learningData.successfulPatterns.set(pattern, current + 1);
    console.log(`[CEO] 记录成功模式: ${pattern} (${current + 1}次)`);
  }

  private recordFailure(pattern: string): void {
    const current = this.learningData.failedPatterns.get(pattern) || 0;
    this.learningData.failedPatterns.set(pattern, current + 1);
    console.log(`[CEO] 记录失败模式: ${pattern} (${current + 1}次)`);
  }

  async submitFeedback(rating: 1 | 2 | 3 | 4 | 5, comment?: string): Promise<void> {
    const lastMessage = this.messages[this.messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') {
      console.warn('[CEO] 没有可评价的回复');
      return;
    }

    const feedback: Feedback = {
      taskId: lastMessage.id,
      rating,
      comment,
      timestamp: new Date(),
    };

    this.feedbackHistory.push(feedback);

    if (rating >= 4) {
      if (lastMessage.intent) {
        this.recordSuccess(`feedback-${lastMessage.intent.type}`);
      }
    } else if (rating <= 2) {
      if (lastMessage.intent) {
        this.recordFailure(`feedback-${lastMessage.intent.type}`);
        if (comment) {
          this.learnFromFeedback(lastMessage.intent, comment);
        }
      }
    }

    console.log(`[CEO] 收到反馈: ${rating}星 ${comment || ''}`);
  }

  private learnFromFeedback(intent: ParsedIntent, comment: string): void {
    const improvements = this.analyzeFeedback(intent, comment);
    if (improvements.length > 0) {
      console.log(`[CEO] 从反馈中学习: ${improvements.join(', ')}`);
      improvements.forEach(improvement => {
        this.intentParser.learnPattern({
          type: intent.type,
          action: intent.action,
          patterns: [],
          keywords: [improvement],
          parameterExtractor: intent.parameters.length > 0 ? () => intent.parameters : undefined,
        });
      });
    }
  }

  private analyzeFeedback(intent: ParsedIntent, comment: string): string[] {
    const improvements: string[] = [];
    
    if (comment.includes('太慢') || comment.includes('速度')) {
      improvements.push('优化执行速度');
    }
    if (comment.includes('不对') || comment.includes('错误')) {
      improvements.push('提高准确性');
    }
    if (comment.includes('不完整') || comment.includes('缺少')) {
      improvements.push('完善结果');
    }

    return improvements;
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  getCurrentTasks(): Task[] {
    return [...this.currentTasks];
  }

  getTeamMembers() {
    return agentManager.getRegisteredAgents();
  }

  getLearningStats(): {
    totalFeedback: number;
    averageRating: number;
    successPatterns: number;
    failedPatterns: number;
  } {
    const totalFeedback = this.feedbackHistory.length;
    const averageRating = totalFeedback > 0
      ? this.feedbackHistory.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
      : 0;

    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      successPatterns: this.learningData.successfulPatterns.size,
      failedPatterns: this.learningData.failedPatterns.size,
    };
  }
}

export const ceoMind = new CEOMind();
