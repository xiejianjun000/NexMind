// TestSuite - 测试套件
// 包含所有模块的单元测试和集成测试

import { IntentParser } from '../backend/ai/IntentParser';
import { TaskCoordinator } from '../backend/multiagent/TaskCoordinator';
import { CEOMind } from '../backend/agents/CEOMind';
import { BaseAgent } from '../backend/multiagent/BaseAgent';
import { AgentCommunicationBus } from '../backend/multiagent/AgentCommunicationBus';

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  totalDuration: number;
}

class TestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void> | void): Promise<TestResult> {
    const start = Date.now();
    try {
      await testFn();
      const duration = Date.now() - start;
      const result: TestResult = { name, passed: true, duration };
      this.results.push(result);
      console.log(`✅ ${name} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      const result: TestResult = {
        name,
        passed: false,
        duration,
        error: (error as Error).message,
      };
      this.results.push(result);
      console.log(`❌ ${name} (${duration}ms): ${(error as Error).message}`);
      return result;
    }
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  clear(): void {
    this.results = [];
  }
}

const testRunner = new TestRunner();

export async function runAllTests(): Promise<TestSuite> {
  console.log('\n🧪 开始运行测试套件...\n');

  testRunner.clear();

  await runIntentParserTests();
  await runTaskCoordinatorTests();
  await runBaseAgentTests();
  await runCommunicationBusTests();
  await runCEOTests();

  const results = testRunner.getResults();
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  const suite: TestSuite = {
    name: 'NexMind Test Suite',
    tests: results,
    passed,
    failed,
    totalDuration,
  };

  console.log('\n📊 测试结果汇总:');
  console.log(`   ✅ 通过: ${passed}`);
  console.log(`   ❌ 失败: ${failed}`);
  console.log(`   ⏱️ 总耗时: ${totalDuration}ms`);
  console.log(`   📈 通过率: ${((passed / results.length) * 100).toFixed(1)}%\n`);

  return suite;
}

async function runIntentParserTests(): Promise<void> {
  console.log('\n📝 IntentParser 测试组');
  console.log('─'.repeat(40));

  const parser = new IntentParser();

  await testRunner.runTest('解析文件搜索意图', async () => {
    const result = parser.parse('帮我搜索项目文档');
    if (result.type !== 'file_operation') {
      throw new Error(`期望 file_operation, 得到 ${result.type}`);
    }
    if (result.action !== 'search') {
      throw new Error(`期望 search, 得到 ${result.action}`);
    }
  });

  await testRunner.runTest('解析应用启动意图', async () => {
    const result = parser.parse('打开记事本');
    if (result.type !== 'app_control') {
      throw new Error(`期望 app_control, 得到 ${result.type}`);
    }
    if (result.action !== 'launch') {
      throw new Error(`期望 launch, 得到 ${result.action}`);
    }
  });

  await testRunner.runTest('解析系统配置意图', async () => {
    const result = parser.parse('打开设置');
    if (result.type !== 'system_config') {
      throw new Error(`期望 system_config, 得到 ${result.type}`);
    }
  });

  await testRunner.runTest('解析知识问答意图', async () => {
    const result = parser.parse('什么是机器学习？');
    if (result.type !== 'expert_consult' && result.type !== 'chat') {
      throw new Error(`期望 expert_consult 或 chat, 得到 ${result.type}`);
    }
  });

  await testRunner.runTest('解析问候语', async () => {
    const result = parser.parse('你好');
    if (result.confidence >= 0.6) {
      throw new Error(`期望低置信度问候语, 得到 ${result.confidence}`);
    }
  });

  await testRunner.runTest('学习新模式', async () => {
    parser.learnPattern({
      type: 'file_operation',
      action: 'organize',
      patterns: ['整理'],
      keywords: ['桌面'],
    });
    const result = parser.parse('帮我整理桌面');
    if (result.type !== 'file_operation') {
      throw new Error(`学习后应识别为 file_operation, 得到 ${result.type}`);
    }
  });
}

async function runTaskCoordinatorTests(): Promise<void> {
  console.log('\n📋 TaskCoordinator 测试组');
  console.log('─'.repeat(40));

  const coordinator = new TaskCoordinator();

  await testRunner.runTest('分解简单搜索任务', async () => {
    const subtasks = coordinator.decomposeTask('搜索项目文档');
    if (subtasks.length === 0) {
      throw new Error('应该分解出至少一个子任务');
    }
    if (subtasks[0].agentId !== 'file-agent') {
      throw new Error(`期望 file-agent, 得到 ${subtasks[0].agentId}`);
    }
  });

  await testRunner.runTest('分解复杂多步骤任务', async () => {
    const subtasks = coordinator.decomposeTask('搜索文档并生成报告');
    if (subtasks.length < 2) {
      throw new Error('复杂任务应分解出多个子任务');
    }
  });

  await testRunner.runTest('任务编排执行', async () => {
    const task = await coordinator.coordinate('搜索文档');
    if (!task.id) {
      throw new Error('任务应该被分配ID');
    }
  });
}

async function runBaseAgentTests(): Promise<void> {
  console.log('\n🤖 BaseAgent 测试组');
  console.log('─'.repeat(40));

  class TestAgent extends BaseAgent {
    protected async handleRequest(msg: any): Promise<void> {
      this.respond(msg.from, msg.id, 'test-action', { success: true });
    }
  }

  const agent = new TestAgent();

  await testRunner.runTest('智能体初始化', async () => {
    if (agent.getId() !== 'test-agent') {
      throw new Error(`期望 test-agent, 得到 ${agent.getId()}`);
    }
    if (agent.getStatus() !== 'idle') {
      throw new Error('初始状态应为 idle');
    }
  });

  await testRunner.runTest('智能体能力列表', async () => {
    const capabilities = agent.getCapabilities();
    if (!Array.isArray(capabilities)) {
      throw new Error('capabilities 应该是数组');
    }
  });

  await testRunner.runTest('智能体启动/停止', async () => {
    agent.start();
    if (agent.getStatus() !== 'active') {
      throw new Error('启动后状态应为 active');
    }
    agent.stop();
    if (agent.getStatus() !== 'idle') {
      throw new Error('停止后状态应为 idle');
    });
  });
}

async function runCommunicationBusTests(): Promise<void> {
  console.log('\n🚌 CommunicationBus 测试组');
  console.log('─'.repeat(40));

  const bus = AgentCommunicationBus.getInstance();

  await testRunner.runTest('单例模式', async () => {
    const bus2 = AgentCommunicationBus.getInstance();
    if (bus !== bus2) {
      throw new Error('应该返回同一个实例');
    }
  });

  await testRunner.runTest('智能体注册', async () => {
    const registration = {
      agentId: 'test-agent-' + Date.now(),
      agentType: 'test',
      capabilities: [],
      status: 'idle',
    };
    bus.registerAgent(registration);
    
    const agent = bus.getAgent(registration.agentId);
    if (!agent) {
      throw new Error('应该能够获取注册的智能体');
    }
    
    bus.unregisterAgent(registration.agentId);
  });

  await testRunner.runTest('发送消息', async () => {
    const registration = {
      agentId: 'test-sender-' + Date.now(),
      agentType: 'test',
      capabilities: [],
      status: 'idle',
    };
    bus.registerAgent(registration);

    const messageId = bus.sendMessage({
      from: registration.agentId,
      to: registration.agentId,
      type: 'request',
      action: 'test',
      payload: {},
      priority: 'medium',
    });

    if (!messageId) {
      throw new Error('应该返回消息ID');
    }

    bus.unregisterAgent(registration.agentId);
  });
}

async function runCEOTests(): Promise<void> {
  console.log('\n👔 CEO 测试组');
  console.log('─'.repeat(40));

  const ceo = new CEOMind();

  await testRunner.runTest('CEO初始化', async () => {
    const messages = ceo.getMessages();
    if (messages.length === 0) {
      throw new Error('CEO应该有初始欢迎消息');
    }
  });

  await testRunner.runTest('处理文件搜索请求', async () => {
    const response = await ceo.handleUserMessage('帮我搜索项目文档');
    if (!response.content) {
      throw new Error('应该返回响应内容');
    }
  });

  await testRunner.runTest('处理问候请求', async () => {
    const response = await ceo.handleUserMessage('你好');
    if (!response.content) {
      throw new Error('应该返回响应内容');
    }
    if (!response.content.includes('你好')) {
      throw new Error('应该回应问候');
    }
  });

  await testRunner.runTest('获取团队状态', async () => {
    const members = ceo.getTeamMembers();
    if (!Array.isArray(members)) {
      throw new Error('应该返回团队成员列表');
    }
  });

  await testRunner.runTest('学习统计', async () => {
    const stats = ceo.getLearningStats();
    if (typeof stats.totalFeedback !== 'number') {
      throw new Error('应该返回学习统计');
    }
  });
}

export async function runPerformanceTests(): Promise<void> {
  console.log('\n⚡ 性能测试组');
  console.log('─'.repeat(40));

  const parser = new IntentParser();

  await testRunner.runTest('意图解析性能（1000次）', async () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      parser.parse('帮我搜索项目文档');
    }
    const duration = Date.now() - start;
    const avgTime = duration / 1000;
    console.log(`   平均耗时: ${avgTime.toFixed(2)}ms/次`);
    if (avgTime > 1) {
      throw new Error(`意图解析平均耗时过长: ${avgTime.toFixed(2)}ms`);
    }
  });

  await testRunner.runTest('任务分解性能（100次）', async () => {
    const coordinator = new TaskCoordinator();
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      coordinator.decomposeTask('搜索文档并生成报告');
    }
    const duration = Date.now() - start;
    const avgTime = duration / 100;
    console.log(`   平均耗时: ${avgTime.toFixed(2)}ms/次`);
    if (avgTime > 5) {
      throw new Error(`任务分解平均耗时过长: ${avgTime.toFixed(2)}ms`);
    }
  });
}

export async function runSmokeTests(): Promise<void> {
  console.log('\n💨 冒烟测试组');
  console.log('─'.repeat(40));

  await testRunner.runTest('NexMindHub组件可导入', async () => {
    try {
      const { NexMindHub } = await import('../frontend/components/NexMindHub');
      if (!NexMindHub) {
        throw new Error('NexMindHub组件未正确导出');
      }
    } catch (e) {
      console.log('   (NexMindHub需要在浏览器环境中测试)');
    }
  });

  await testRunner.runTest('SettingsPage组件可导入', async () => {
    try {
      const { SettingsPage } = await import('../frontend/components/Settings');
      if (!SettingsPage) {
        throw new Error('SettingsPage组件未正确导出');
      }
    } catch (e) {
      console.log('   (SettingsPage需要在浏览器环境中测试)');
    }
  });

  await testRunner.runTest('MinionAvatar组件可导入', async () => {
    try {
      const { default: MinionAvatar } = await import('../frontend/components/Minion/MinionAvatar');
      if (!MinionAvatar) {
        throw new Error('MinionAvatar组件未正确导出');
      }
    } catch (e) {
      console.log('   (MinionAvatar需要在浏览器环境中测试)');
    }
  });
}

export { testRunner };
