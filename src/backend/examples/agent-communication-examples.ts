/**
 * NexMind 智能体通信示例
 * 展示各种智能体之间的通信场景
 */

import { NexMindSystem } from '../core/NexMindSystem'
import { communicationBus, AgentMessage } from '../../shared/types/agentCommunication'

// 创建系统实例
const system = new NexMindSystem()

// ===== 场景1: 用户通过CEO召唤专家 =====

async function scenario1_UserConsultsExpert() {
  console.log('\n========== 场景1: 用户咨询专家 ==========')
  
  // 初始化系统
  await system.initialize()
  
  // 用户询问代码架构问题
  const response = await system.chatWithCEO(
    '我需要设计一个高并发的用户系统，应该怎么做？'
  )
  
  console.log('CEO回复:', response.content)
}

// ===== 场景2: CEO协调多个专家 =====

async function scenario2_CEOCoordinatesMultipleExperts() {
  console.log('\n========== 场景2: CEO协调多个专家 ==========')
  
  // 获取所有专家
  const experts = system.getAllExperts()
  console.log('可用专家:', experts.map(e => e.name).join(', '))
  
  // CEO广播给所有专家
  communicationBus.broadcast(
    'ceo',
    'architecture-review',
    {
      topic: '微服务架构设计',
      requirements: ['高可用', '可扩展', '容错']
    }
  )
  
  // 等待专家响应
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  console.log('所有专家已收到广播')
}

// ===== 场景3: 总工程师检查升级 =====

async function scenario3_ChiefEngineerUpgradeCheck() {
  console.log('\n========== 场景3: 总工程师检查升级 ==========')
  
  // CEO请求总工程师检查升级
  const response = await communicationBus.sendRequest(
    'ceo',
    'chief-engineer',
    'check-upgrades',
    {},
    10000
  )
  
  if (response.success) {
    console.log('升级建议:', response.data)
  }
  
  // 获取系统健康状态
  const health = system.getSystemHealth()
  console.log('系统健康状态:', health)
}

// ===== 场景4: 元智能体任务编排 =====

async function scenario4_MetaAgentOrchestration() {
  console.log('\n========== 场景4: 元智能体任务编排 ==========')
  
  // 请求元智能体编排任务
  const response = await communicationBus.sendRequest(
    'ceo',
    'meta-agent',
    'orchestrate',
    {
      task: '我需要优化数据库查询性能',
      agents: ['data-analyst', 'code-architect', 'devops-engineer']
    },
    10000
  )
  
  if (response.success) {
    console.log('编排结果:', response.data)
  }
  
  // 获取系统指标
  const metricsResponse = await communicationBus.sendRequest(
    'ceo',
    'meta-agent',
    'get-metrics',
    {},
    5000
  )
  
  if (metricsResponse.success) {
    console.log('系统指标:', metricsResponse.data)
  }
}

// ===== 场景5: 紧急回滚通知 =====

async function scenario5_EmergencyRollback() {
  console.log('\n========== 场景5: 紧急回滚通知 ==========')
  
  // CEO通知紧急回滚
  communicationBus.sendMessage({
    from: 'ceo',
    to: 'chief-engineer',
    type: 'notification',
    action: 'emergency-rollback',
    payload: {
      reason: '检测到严重错误',
      timestamp: new Date()
    },
    priority: 'urgent'
  })
  
  console.log('紧急回滚通知已发送')
}

// ===== 场景6: 每日报告流程 =====

async function scenario6_DailyReport() {
  console.log('\n========== 场景6: 每日报告流程 ==========')
  
  // 元智能体广播每日任务请求
  communicationBus.broadcast(
    'meta-agent',
    'daily-routine-request',
    {
      date: new Date(),
      tasks: ['health-check', 'upgrade-check', 'optimization']
    }
  )
  
  // 等待处理
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  console.log('每日报告已生成')
}

// ===== 场景7: 查看消息总线状态 =====

async function scenario7_BusStatus() {
  console.log('\n========== 场景7: 查看消息总线状态 ==========')
  
  // 获取所有注册的智能体
  const agents = communicationBus.getRegisteredAgents()
  console.log('已注册的智能体数量:', agents.length)
  
  agents.forEach(agent => {
    console.log(`  - ${agent.agentId} (${agent.agentType}): ${agent.capabilities.length} 个能力`)
  })
}

// ===== 主函数 =====

async function runScenarios() {
  try {
    console.log('NexMind 智能体通信示例')
    console.log('========================\n')
    
    // 运行所有场景
    await scenario1_UserConsultsExpert()
    await scenario2_CEOCoordinatesMultipleExperts()
    await scenario3_ChiefEngineerUpgradeCheck()
    await scenario4_MetaAgentOrchestration()
    await scenario5_EmergencyRollback()
    await scenario6_DailyReport()
    await scenario7_BusStatus()
    
    console.log('\n========================')
    console.log('所有场景执行完成！')
    
  } catch (error) {
    console.error('执行失败:', error)
  } finally {
    // 关闭系统
    await system.shutdown()
  }
}

// 导出场景函数供测试使用
export {
  scenario1_UserConsultsExpert,
  scenario2_CEOCoordinatesMultipleExperts,
  scenario3_ChiefEngineerUpgradeCheck,
  scenario4_MetaAgentOrchestration,
  scenario5_EmergencyRollback,
  scenario6_DailyReport,
  scenario7_BusStatus,
  runScenarios
}

// 如果直接运行此文件
if (require.main === module) {
  runScenarios()
}
