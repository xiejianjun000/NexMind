// NexMind 项目演示脚本
console.log('=========================================')
console.log('  🚀 NexMind - 下一代智能中枢')
console.log('  Next Generation Intelligent Hub')
console.log('=========================================')
console.log()

// 导入系统
console.log('[1] 正在初始化 NexMind 系统...')
import('./src/backend/core/NexMindSystem').then(async ({ nexMindSystem }) => {
  console.log('✓ NexMind 系统导入成功')
  console.log()

  // 初始化系统
  console.log('[2] 正在启动系统...')
  await nexMindSystem.initialize()
  console.log()

  // 测试聊天功能
  console.log('[3] 正在测试 CEO 智能体对话...')
  const response = await nexMindSystem.chatWithCEO('你好！我想了解 NexMind 是什么？')
  console.log(`用户: 你好！我想了解 NexMind 是什么？`)
  console.log(`CEO: ${response.content}`)
  console.log()

  // 检查系统健康
  console.log('[4] 正在检查系统健康状态...')
  const health = nexMindSystem.getSystemHealth()
  console.log(`  CPU: ${health.cpu.toFixed(1)}%`)
  console.log(`  内存: ${health.memory.toFixed(1)}%`)
  console.log(`  存储: ${health.storage.toFixed(1)}%`)
  console.log(`  稳定性: ${health.stabilityScore.toFixed(1)}/100`)
  console.log()

  // 检查升级建议
  console.log('[5] 正在获取总工程师的升级建议...')
  const proposals = nexMindSystem.getUpgradeProposals()
  console.log(`  发现 ${proposals.length} 个升级建议:`)
  proposals.forEach((p, i) => {
    console.log(`    ${i + 1}. [${p.priority.toUpperCase()}] ${p.title}`)
  })
  console.log()

  // 关闭系统
  console.log('[6] 正在关闭系统...')
  await nexMindSystem.shutdown()
  console.log()

  console.log('=========================================')
  console.log('  ✅ NexMind 演示完成！')
  console.log('=========================================')
  console.log()
  console.log('项目文件结构:')
  console.log('  /nexmind/')
  console.log('  ├── src/')
  console.log('  │   ├── frontend/          # React 前端')
  console.log('  │   │   ├── components/')
  console.log('  │   │   ├── pages/')
  console.log('  │   │   ├── App.tsx')
  console.log('  │   │   └── main.tsx')
  console.log('  │   ├── backend/           # TypeScript 后端')
  console.log('  │   │   ├── agents/       # 双智能体系统')
  console.log('  │   │   │   ├── CEOMind.ts')
  console.log('  │   │   │   └── ChiefEngineerMind.ts')
  console.log('  │   │   └── core/         # 核心引擎')
  console.log('  │   │       └── NexMindSystem.ts')
  console.log('  ├── package.json')
  console.log('  ├── vite.config.ts')
  console.log('  ├── tailwind.config.js')
  console.log('  └── README.md')
  console.log()
  console.log('下一步:')
  console.log('  1. cd nexmind')
  console.log('  2. npm install')
  console.log('  3. npm run dev')
})
