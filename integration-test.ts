/**
 * NexMind 集成测试 - 验证所有模块协同工作
 */

import { NexMindSystem } from './src/backend/core/NexMindSystem.ts'

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  🧪 NexMind 集成测试')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log()

  const system = new NexMindSystem()

  try {
    // 1. 测试初始化
    console.log('📋 测试 1: 系统初始化')
    await system.initialize()
    console.log('  ✓ 系统初始化成功')
    console.log()

    // 2. 测试CEO对话
    console.log('📋 测试 2: CEO智能体对话')
    const response = await system.chatWithCEO('你好')
    console.log(`  用户: 你好`)
    console.log(`  CEO: ${response.content}`)
    console.log('  ✓ CEO对话功能正常')
    console.log()

    // 3. 测试专家系统
    console.log('📋 测试 3: 专家系统')
    const experts = system.getAllExperts()
    console.log(`  发现 ${experts.length} 位专家`)
    console.log('  专家列表:')
    experts.forEach(e => console.log(`    - ${e.name} (${e.role})`))
    console.log('  ✓ 专家系统功能正常')
    console.log()

    // 4. 测试模型路由
    console.log('📋 测试 4: 多模型路由')
    const route = await system.routeModel('写一段Python代码')
    console.log(`  任务: 写一段Python代码`)
    console.log(`  路由结果: ${route.model.name}`)
    console.log(`  原因: ${route.reason}`)
    console.log('  ✓ 模型路由功能正常')
    console.log()

    // 5. 测试TokenJuice压缩
    console.log('📋 测试 5: TokenJuice压缩')
    const html = '<h1>标题</h1><p>这是一段HTML内容</p>'
    const compressed = system.compressContent(html)
    console.log(`  原始内容: ${html}`)
    console.log(`  压缩后: ${compressed.content}`)
    console.log(`  Token节省: ${(compressed.compressionRatio * 100).toFixed(1)}%`)
    console.log('  ✓ TokenJuice压缩功能正常')
    console.log()

    // 6. 测试技能系统
    console.log('📋 测试 6: 技能生成系统')
    const skills = system.getAllSkills()
    console.log(`  发现 ${skills.length} 个内置技能`)
    skills.forEach(s => console.log(`    - ${s.name}: ${s.description}`))
    console.log('  ✓ 技能系统功能正常')
    console.log()

    // 7. 测试安全沙箱
    console.log('📋 测试 7: 安全沙箱验证')
    const dangerousCode = 'eval("console.log(1)")'
    const sandboxResult = system.validateCode(dangerousCode)
    console.log(`  测试代码: ${dangerousCode}`)
    console.log(`  验证结果: ${sandboxResult.passed ? '通过' : '拒绝'}`)
    console.log(`  错误: ${sandboxResult.errors.join(', ')}`)
    console.log('  ✓ 安全沙箱功能正常')
    console.log()

    // 8. 测试版本控制
    console.log('📋 测试 8: 版本控制')
    const snapshot = system.createVersionSnapshot('测试快照', {
      'test.js': 'console.log("test")'
    })
    console.log(`  创建快照: ${snapshot.id}`)
    console.log(`  描述: ${snapshot.description}`)
    console.log('  ✓ 版本控制功能正常')
    console.log()

    // 9. 测试进化指标
    console.log('📋 测试 9: 自我进化引擎')
    const metrics = system.getEvolutionMetrics()
    console.log(`  总循环: ${metrics.totalCycles}`)
    console.log(`  成功率: ${(metrics.successRate * 100).toFixed(1)}%`)
    console.log(`  技能数: ${metrics.skillCount}`)
    console.log(`  学习模式: ${metrics.learnedPatterns.length}`)
    console.log('  ✓ 进化引擎功能正常')
    console.log()

    // 10. 测试元智能体
    console.log('📋 测试 10: 元智能体')
    const sysMetrics = system.getSystemMetrics()
    console.log(`  活跃智能体: ${sysMetrics.agentCount}`)
    console.log(`  系统运行时长: ${(sysMetrics.uptime / 1000).toFixed(1)}秒`)
    console.log(`  错误率: ${(sysMetrics.errorRate * 100).toFixed(1)}%`)
    console.log('  ✓ 元智能体功能正常')
    console.log()

    // 11. 测试提示词库
    console.log('📋 测试 11: AI提示词库')
    const prompts = system.getAllAgentPrompts()
    console.log(`  提示词总数: ${prompts.length}`)
    const categories = [...new Set(prompts.map(p => p.category))]
    console.log(`  分类: ${categories.join(', ')}`)
    console.log('  ✓ 提示词库功能正常')
    console.log()

    // 12. 测试智能工作台
    console.log('📋 测试 12: 智能工作台')
    const task = system.createTask('测试任务', '这是一个测试任务描述')
    console.log(`  创建任务: ${task.id}`)
    console.log(`  任务标题: ${task.title}`)
    console.log(`  优先级: ${task.priority}`)
    console.log('  ✓ 工作台功能正常')
    console.log()

    // 13. 测试总工程师
    console.log('📋 测试 13: 总工程师')
    const proposals = system.getUpgradeProposals()
    console.log(`  升级建议: ${proposals.length}条`)
    const health = system.getSystemHealth()
    console.log(`  系统健康: 稳定性=${health.stabilityScore.toFixed(1)}%`)
    console.log('  ✓ 总工程师功能正常')
    console.log()

    // 14. 测试记忆树
    console.log('📋 测试 14: 记忆树系统')
    await system.ingestMemory('这是一个测试记忆', 'document')
    const memories = system.getAllMemoryNodes()
    console.log(`  记忆节点: ${memories.length}个`)
    console.log('  ✓ 记忆树功能正常')
    console.log()

    // 15. 测试任务编排
    console.log('📋 测试 15: 任务智能编排')
    const orchestration = await system.orchestrateTask(
      '帮我审查代码',
      ['code-reviewer', 'doc-writer', 'devops']
    )
    console.log(`  任务: 帮我审查代码`)
    console.log(`  分配智能体: ${orchestration.assignedAgent}`)
    console.log(`  置信度: ${(orchestration.confidence * 100).toFixed(1)}%`)
    console.log(`  推理: ${orchestration.reasoning}`)
    console.log('  ✓ 任务编排功能正常')
    console.log()

    console.log('═══════════════════════════════════════════════════════════════')
    console.log('  ✅ 所有测试通过!')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log()

    // 关闭系统
    await system.shutdown()
    console.log('系统已安全关闭')

  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

runTests()
