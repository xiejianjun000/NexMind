// NexMind核心系统 - 双智能体集成 + 专家系统
import { CEOMind, Message } from '../agents/CEOMind'
import { ChiefEngineerMind } from '../agents/ChiefEngineerMind'
import { expertManager, ExpertManager } from '../agents/ExpertAgent'
import { Expert, ExpertResponse } from '../../shared/types/expert'

export class NexMindSystem {
  private ceoMind: CEOMind
  private chiefEngineerMind: ChiefEngineerMind
  private expertManager: ExpertManager
  private isInitialized: boolean = false

  constructor() {
    this.ceoMind = new CEOMind()
    this.chiefEngineerMind = new ChiefEngineerMind()
    this.expertManager = expertManager
  }

  // 初始化系统
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[System] NexMind已经初始化')
      return
    }

    console.log('[System] 正在初始化NexMind系统...')
    
    // 1. 初始化专家系统
    await this.expertManager.initialize()
    
    // 2. 启动总工程师的心跳任务
    this.chiefEngineerMind.startHeartbeat()
    
    this.isInitialized = true
    console.log('[System] NexMind系统初始化完成！')
  }

  // 关闭系统
  async shutdown(): Promise<void> {
    console.log('[System] 正在关闭NexMind系统...')
    
    this.chiefEngineerMind.stopHeartbeat()
    this.isInitialized = false
    
    console.log('[System] NexMind系统已关闭')
  }

  // 用户与CEO智能体对话
  async chatWithCEO(message: string): Promise<Message> {
    return await this.ceoMind.handleUserMessage(message)
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
}

// 单例模式
export const nexMindSystem = new NexMindSystem()
