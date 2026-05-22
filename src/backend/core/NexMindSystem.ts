// NexMind核心系统 - 双智能体 + 专家系统 + 模型路由 + 智能工作台 + Token压缩
import { CEOMind, Message } from '../agents/CEOMind'
import { ChiefEngineerMind } from '../agents/ChiefEngineerMind'
import { expertManager, ExpertManager } from '../agents/ExpertAgent'
import { Expert, ExpertResponse } from '../../shared/types/expert'
import { ModelRouter, modelRouter, ModelRoute } from './ModelRouter'
import { SmartWorkspace, smartWorkspace, Task, Workflow } from './SmartWorkspace'
import { TokenJuiceEngine, tokenJuice, CompressionResult } from './TokenJuice'
import { MemoryTree, memoryTree } from './MemoryTree'
import { AGENT_PROMPTS, AgentPrompt } from '../../shared/data/agentPrompts'
import { SkillGenerator, skillGenerator, Skill } from './SkillGenerator'
import { SecuritySandbox, securitySandbox, VersionControl, versionControl, SandboxResult, RollbackResult } from './SecuritySandbox'
import { EvolutionEngine, EvolutionConfig } from './EvolutionEngine'
import { MetaAgent, metaAgent, SystemMetrics, EvolutionEvent } from '../agents/MetaAgent'

export class NexMindSystem {
  private ceoMind: CEOMind
  private chiefEngineerMind: ChiefEngineerMind
  private expertManager: ExpertManager
  private modelRouter: ModelRouter
  private workspace: SmartWorkspace
  private tokenJuice: TokenJuiceEngine
  private memoryTree: MemoryTree
  private skillGenerator: SkillGenerator
  private sandbox: SecuritySandbox
  private versionControl: VersionControl
  private evolutionEngine: EvolutionEngine
  private metaAgent: MetaAgent
  private isInitialized: boolean = false

  constructor() {
    this.ceoMind = new CEOMind()
    this.chiefEngineerMind = new ChiefEngineerMind()
    this.expertManager = expertManager
    this.modelRouter = modelRouter
    this.workspace = smartWorkspace
    this.tokenJuice = tokenJuice
    this.memoryTree = memoryTree
    this.skillGenerator = skillGenerator
    this.sandbox = securitySandbox
    this.versionControl = versionControl
    this.metaAgent = metaAgent
    this.evolutionEngine = new EvolutionEngine(skillGenerator, securitySandbox)
  }

  // 初始化系统
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[System] NexMind已经初始化')
      return
    }

    console.log('[System] 正在初始化NexMind系统...')
    
    // 1. 启动CEO智能体 - 注册到消息总线
    this.ceoMind.start()
    
    // 2. 启动总工程师智能体 - 注册到消息总线
    this.chiefEngineerMind.start()
    
    // 3. 初始化专家系统 - 自动注册到消息总线
    await this.expertManager.initialize()
    
    // 4. 启动记忆树自动同步
    this.memoryTree.startAutoFetch()
    
    // 5. 启动元智能体 - 注册到消息总线
    await this.metaAgent.start()
    
    // 6. 启动总工程师的心跳任务
    this.chiefEngineerMind.startHeartbeat()
    
    console.log('[System] ✅ 所有智能体已注册到消息总线')
    this.isInitialized = true
    console.log('[System] NexMind系统初始化完成！')
  }

  // 关闭系统
  async shutdown(): Promise<void> {
    console.log('[System] 正在关闭NexMind系统...')
    
    // 1. 停止心跳任务
    this.chiefEngineerMind.stopHeartbeat()
    
    // 2. 停止元智能体（会自动取消订阅）
    this.metaAgent.stop()
    
    // 3. 停止记忆树
    this.memoryTree.stopAutoFetch()
    
    // 4. CEO和总工程师会在消息总线注销
    // (如果需要，可以在这里添加注销逻辑)
    
    this.isInitialized = false
    console.log('[System] NexMind系统已关闭')
  }

  // 用户与CEO智能体对话（带工具调用）
  async chatWithCEO(message: string): Promise<Message> {
    return await this.ceoMind.handleUserMessage(message, {
      summonExpert: async (id: string, request: string) => {
        return await this.summonExpert(id, request)
      },
      searchMemory: async (query: string) => {
        return await this.searchMemory(query)
      },
      executeTask: async (taskId: string) => {
        return await this.executeTask(taskId)
      },
      routeModel: async (task: string) => {
        return await this.routeModel(task)
      },
    })
  }

  // 获取历史消息
  getChatHistory(): Message[] {
    return this.ceoMind.getMessages()
  }

  // 请求总工程师升级系统
  async requestUpgrade(description: string): Promise<void> {
    const proposals = await this.chiefEngineerMind.handleHumanUpgradeRequest(description)
    console.log('[System] 升级建议已生成:', proposals)
  }

  // 获取系统健康状态
  getSystemHealth(): ReturnType<ChiefEngineerMind['monitorSystem']> {
    return this.chiefEngineerMind.monitorSystem()
  }

  // 获取升级建议
  getUpgradeProposals() {
    return this.chiefEngineerMind.getUpgradeProposals()
  }

  // ===== 专家系统功能 =====

  // 获取所有专家
  getAllExperts(): Expert[] {
    return this.expertManager.getAllExperts()
  }

  // 获取可用专家
  getAvailableExperts(): Expert[] {
    return this.expertManager.getAvailableExperts()
  }

  // 召唤专家
  async summonExpert(id: string, request: string): Promise<ExpertResponse> {
    return await this.expertManager.summonExpert(id, request)
  }

  // ===== 第二阶段: 模型路由 =====

  async routeModel(task: string, taskType?: string): Promise<ModelRoute> {
    return await this.modelRouter.route(task, taskType)
  }

  getAllModels() {
    return this.modelRouter.getAllModels()
  }

  // ===== 第二阶段: 智能工作台 =====

  createTask(title: string, description: string, priority: Task['priority'] = 'medium'): Task {
    return this.workspace.createTask(title, description, priority)
  }

  async executeTask(taskId: string): Promise<void> {
    return await this.workspace.executeTask(taskId)
  }

  cancelTask(taskId: string): boolean {
    return this.workspace.cancelTask(taskId)
  }

  getAllTasks(): Task[] {
    return this.workspace.getAllTasks()
  }

  getTaskStats() {
    return this.workspace.getTaskStats()
  }

  createWorkflow(name: string, description: string, steps: any[]): Workflow {
    return this.workspace.createWorkflow(name, description, steps)
  }

  getAllWorkflows(): Workflow[] {
    return this.workspace.getAllWorkflows()
  }

  // ===== 第二阶段: TokenJuice 压缩 =====

  compressContent(input: string): CompressionResult {
    return this.tokenJuice.compress(input)
  }

  getCompressionStats(result: CompressionResult) {
    return this.tokenJuice.getStats(result)
  }

  // ===== 第二阶段: 记忆树系统 =====

  async ingestMemory(content: string, type?: any, metadata?: any) {
    return await this.memoryTree.ingest(content, type, metadata)
  }

  searchMemory(query: string, limit?: number) {
    return this.memoryTree.search(query, limit)
  }

  getAllMemoryNodes() {
    return this.memoryTree.getAllNodes()
  }

  getMemoryTree() {
    return this.memoryTree.getTree()
  }

  // ===== 第二阶段: Agent提示词库 =====

  getAllAgentPrompts(): AgentPrompt[] {
    return [...AGENT_PROMPTS]
  }

  getAgentPromptsByCategory(category: string): AgentPrompt[] {
    return AGENT_PROMPTS.filter(p => p.category === category)
  }

  searchAgentPrompts(query: string): AgentPrompt[] {
    const lower = query.toLowerCase()
    return AGENT_PROMPTS.filter(
      p => p.name.toLowerCase().includes(lower) ||
           p.description.toLowerCase().includes(lower) ||
           p.category.toLowerCase().includes(lower)
    )
  }

  getAgentPromptById(id: string): AgentPrompt | undefined {
    return AGENT_PROMPTS.find(p => p.id === id)
  }

  // ===== 第三阶段: 自我进化引擎 =====

  async executeLearningCycle(
    task: string,
    executor: () => Promise<{ success: boolean; result?: any; error?: string; steps: string[] }>
  ) {
    return await this.evolutionEngine.executeLearningCycle(task, executor)
  }

  getEvolutionMetrics() {
    return this.evolutionEngine.getEvolutionMetrics()
  }

  getTaskHistory() {
    return this.evolutionEngine.getTaskHistory()
  }

  getReflections() {
    return this.evolutionEngine.getReflections()
  }

  // ===== 第三阶段: 技能生成系统 =====

  getAllSkills(): Skill[] {
    return this.skillGenerator.getAllSkills()
  }

  searchSkills(query: string): Skill[] {
    return this.skillGenerator.searchSkills(query)
  }

  async executeSkill(id: string, params: Record<string, any>) {
    return await this.skillGenerator.executeSkill(id, params)
  }

  getSkillStats() {
    return this.skillGenerator.getStats()
  }

  // ===== 第三阶段: 安全沙箱 =====

  validateCode(code: string): SandboxResult {
    return this.sandbox.validate(code)
  }

  // ===== 第三阶段: 版本控制 =====

  createVersionSnapshot(description: string, files: Record<string, string>) {
    return this.versionControl.createSnapshot(description, files)
  }

  rollback(targetId?: string): RollbackResult {
    return this.versionControl.rollback(targetId)
  }

  getVersionHistory() {
    return this.versionControl.getHistory()
  }

  getCurrentVersion() {
    return this.versionControl.getCurrentVersion()
  }

  // ===== 第三阶段: 元智能体 =====

  getSystemMetrics(): SystemMetrics {
    return this.metaAgent.getMetrics()
  }

  getEvolutionHistory(): EvolutionEvent[] {
    return this.metaAgent.getEvolutionHistory()
  }

  async orchestrateTask(task: string, availableAgents: string[]) {
    return await this.metaAgent.orchestrate(task, availableAgents)
  }

  // ===== 第三阶段: 生成新智能体 (Agent Spawning) =====

  async spawnNewAgent(name: string, role: string, specialty: string[]): Promise<Expert> {
    console.log(`[System] 生成新智能体: ${name} (${role})`)
    
    const newExpert = {
      id: `spawned-${Date.now()}`,
      name,
      role,
      specialty,
      description: `自动生成的智能体: ${role}`,
      capabilities: specialty,
      status: 'idle' as const,
      isAvailable: true,
      version: '1.0.0',
      createdAt: new Date(),
      useCount: 0,
    }

    this.metaAgent.addEvolutionEvent({
      type: 'agent_spawned',
      description: `新智能体生成: ${name}`,
      success: true,
      metadata: { agentName: name, role },
    })

    return newExpert
  }
}

// 单例模式
export const nexMindSystem = new NexMindSystem()

// 便捷导出
export { Task, Workflow } from './SmartWorkspace'
export { ModelRoute } from './ModelRouter'
export { CompressionResult } from './TokenJuice'
export { AgentPrompt } from '../../shared/data/agentPrompts'
