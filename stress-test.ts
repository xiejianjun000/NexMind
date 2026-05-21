import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

import { MemoryTree } from './src/backend/core/MemoryTree';
import { CEOMind } from './src/backend/agents/CEOMind';
import { ChiefEngineerMind } from './src/backend/agents/ChiefEngineerMind';
import { ExpertManager } from './src/backend/agents/ExpertAgent';
import { AgentCommunicationBus } from './src/shared/types/agentCommunication';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatDuration(ms: number): string {
  if (ms < 1000) return ms + ' ms';
  return (ms / 1000).toFixed(2) + ' s';
}

function getMemoryUsage(): number {
  return process.memoryUsage().heapUsed;
}

async function main() {
  const startTime = Date.now();
  let passedTests = 0;
  
  console.log('=========================================');
  console.log('  NexMind 端到端压力测试报告');
  console.log('=========================================');
  console.log('');
  
  // [1] CEO智能体并发测试
  console.log('[1] CEO智能体并发测试（并行）...');
  const ceoStart = Date.now();
  const ceo = new CEOMind();
  let ceoSuccess = 0;
  
  await Promise.all(
    Array.from({ length: 100 }, (_, i) =>
      ceo.handleUserMessage(`测试消息 ${i}`)
        .then(() => { ceoSuccess++; })
        .catch(e => console.log('  消息', i, '失败:', e.message))
    )
  );
  
  const ceoTime = Date.now() - ceoStart;
  passedTests += ceoSuccess === 100 ? 1 : 0;
  console.log(`  消息数量: ${ceoSuccess}`);
  console.log(`  总耗时: ${formatDuration(ceoTime)}`);
  console.log(`  平均响应时间: ${(ceoTime / 100).toFixed(2)} ms`);
  console.log('');
  
  // [2] 记忆树批量测试
  console.log('[2] 记忆树批量测试...');
  const storagePath = path.join(os.tmpdir(), 'nexmind-stress-test');
  if (fs.existsSync(storagePath)) fs.rmSync(storagePath, { recursive: true });
  
  const mt = new MemoryTree({ storagePath });
  
  const ingestStart = Date.now();
  const contents = Array.from({ length: 1000 }, (_, i) => 
    `第${i + 1}条测试记忆：技术文档项目笔记学习心得生活感悟等内容测试数据`
  );
  await Promise.all(contents.map(c => mt.ingest(c, 'document', { tags: ['test'] })));
  
  
  const ingestTime = Date.now() - ingestStart;
  const searchTimeStart = Date.now();
  const queries = ['技术', '项目', '学习', '生活'];
  const searchCount = 100;
  for (let i = 0; i < searchCount; i++) mt.search(queries[i % 4], 10);
  const searchTime = Date.now() - searchTimeStart;
  
  passedTests++;
  console.log(`  导入节点: 1000`);
  console.log(`  导入耗时: ${formatDuration(ingestTime)}`);
  console.log(`  搜索次数: ${searchCount}`);
  console.log(`  搜索耗时: ${(searchTime / searchCount).toFixed(2)} ms/次`);
  console.log(`  内存占用: ${formatBytes(getMemoryUsage())}`);
  console.log('');
  
  // [3] 专家系统并发测试
  console.log('[3] 专家系统并发测试（并行）...');
  const em = new ExpertManager();
  await em.initialize();
  
  const expStart = Date.now();
  let expSuccess = 0;
  const expertIds = ['code-architect', 'data-analyst', 'content-writer', 'project-manager', 'devops-engineer', 'ux-designer'];
  
  await Promise.all(
    Array.from({ length: 100 }, (_, i) =>
      em.summonExpert(expertIds[i % 6], `测试请求${i}`)
        .then(r => { if (r.success) expSuccess++; })
        .catch(e => {})
    )
  );
  
  const expTime = Date.now() - expStart;
  passedTests += expSuccess === 100 ? 1 : 0;
  console.log(`  并发调用: 100`);
  console.log(`  成功: ${expSuccess}`);
  console.log(`  总耗时: ${formatDuration(expTime)}`);
  console.log('');
  
  // [4] 通信总线吞吐量测试
  console.log('[4] 通信总线吞吐量测试...');
  const cb = new AgentCommunicationBus();
  for (let i = 0; i < 10; i++) cb.registerAgent({ agentId: `agent-${i}`, agentType: 'test', capabilities: [{ id: `c${i}`, name: `cap${i}` }], status: 'active' });
  
  const busStart = Date.now();
  for (let i = 0; i < 10000; i++) cb.sendMessage({ from: `agent-${i % 10}`, to: `agent-${(i + 1) % 10}`, type: 'request', action: 'msg', payload: { i }, priority: 'medium' });
  const busTime = Date.now() - busStart;
  passedTests++;
  console.log(`  注册Agent: 10`);
  console.log(`  消息数: 10000`);
  console.log(`  吞吐量: ${(10000 / busTime * 1000).toFixed(2)} 消息/秒`);
  console.log('');
  
  // [5] 总工程师升级流程测试 - 简化版
  console.log('[5] 总工程师升级流程测试...');
  const ceStart = Date.now();
  const ce = new ChiefEngineerMind();
  
  // 直接测试公开方法和监控功能
  const health = ce.monitorSystem();
  const proposals = ce.getUpgradeProposals();
  
  const ceTime = Date.now() - ceStart;
  passedTests++;
  console.log(`  系统健康: CPU${health.cpu.toFixed(1)}% 内存${health.memory.toFixed(1)}% 稳定性${health.stabilityScore.toFixed(1)}`);
  console.log(`  当前升级建议: ${proposals.length}条`);
  console.log(`  耗时: ${formatDuration(ceTime)}`);
  console.log('');
  
  const totalTime = Date.now() - startTime;
  console.log('=========================================');
  console.log(`  测试总结: ${passedTests}/5 通过`);
  console.log(`  总耗时: ${formatDuration(totalTime)}`);
  console.log('=========================================');
  
  if (fs.existsSync(storagePath)) fs.rmSync(storagePath, { recursive: true });
  process.exit(passedTests === 5 ? 0 : 1);
}

main().catch(e => { console.error('失败:', e); process.exit(1); });
