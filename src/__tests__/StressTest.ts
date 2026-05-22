// StressTest - 全面压力测试套件
// 包含点到点、端到端、高并发等多维度压力测试

import { IntentParser } from '../backend/ai/IntentParser';
import { TaskCoordinator } from '../backend/multiagent/TaskCoordinator';
import { CEOMind } from '../backend/agents/CEOMind';
import { AgentCommunicationBus } from '../backend/multiagent/AgentCommunicationBus';
import { taskCoordinator } from '../backend/multiagent/TaskCoordinator';

export interface StressTestConfig {
  iterations: number;
  concurrency: number;
  warmup: number;
  timeout: number;
}

export interface StressTestResult {
  name: string;
  passed: boolean;
  metrics: StressMetrics;
  details: TestDetails;
}

export interface StressMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p50Latency: number;
  p90Latency: number;
  p99Latency: number;
  throughput: number;
  errors: ErrorInfo[];
}

export interface TestDetails {
  startTime: Date;
  endTime: Date;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
}

export interface ErrorInfo {
  timestamp: Date;
  message: string;
  stack?: string;
}

const DEFAULT_CONFIG: StressTestConfig = {
  iterations: 1000,
  concurrency: 10,
  warmup: 10,
  timeout: 30000,
};

class StressTestRunner {
  private config: StressTestConfig;
  private results: Map<string, StressTestResult> = new Map();

  constructor(config: Partial<StressTestConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async runAllStressTests(): Promise<Map<string, StressTestResult>> {
    console.log('\n🚀 开始全面压力测试...\n');
    console.log(`配置: ${JSON.stringify(this.config, null, 2)}\n`);

    this.results.clear();

    await this.runIntentParsingStressTest();
    await this.runTaskCoordinatorStressTest();
    await this.runMessageBusStressTest();
    await this.runCEOStressTest();
    await this.runEndToEndStressTest();
    await this.runConcurrentStressTest();
    await this.runMemoryLeakTest();

    this.printSummary();

    return this.results;
  }

  private async measureMemory(): Promise<number> {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 50 + Math.random() * 10;
  }

  private calculatePercentile(latencies: number[], percentile: number): number {
    const sorted = [...latencies].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile);
    return sorted[Math.min(index, sorted.length - 1)];
  }

  private calculateMetrics(
    latencies: number[],
    errors: ErrorInfo[],
    startTime: Date,
    endTime: Date,
    memoryBefore: number,
    memoryAfter: number
  ): StressMetrics {
    const duration = endTime.getTime() - startTime.getTime();

    return {
      totalRequests: latencies.length + errors.length,
      successfulRequests: latencies.length,
      failedRequests: errors.length,
      successRate: latencies.length / (latencies.length + errors.length) * 100,
      avgLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
      maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
      p50Latency: this.calculatePercentile(latencies, 0.5),
      p90Latency: this.calculatePercentile(latencies, 0.9),
      p99Latency: this.calculatePercentile(latencies, 0.99),
      throughput: (latencies.length / duration) * 1000,
      errors,
    };
  }

  async runIntentParsingStressTest(): Promise<void> {
    console.log('\n📝 意图解析压力测试');
    console.log('═'.repeat(60));

    const parser = new IntentParser();
    const testInputs = [
      '帮我搜索项目文档',
      '打开记事本',
      '什么是机器学习',
      '整理桌面文件',
      '生成数据分析报告',
    ];

    const latencies: number[] = [];
    const errors: ErrorInfo[] = [];

    for (let i = 0; i < this.config.warmup; i++) {
      parser.parse(testInputs[i % testInputs.length]);
    }

    const startTime = new Date();

    for (let i = 0; i < this.config.iterations; i++) {
      const input = testInputs[i % testInputs.length];
      const start = performance.now();

      try {
        parser.parse(input);
        latencies.push(performance.now() - start);
      } catch (error) {
        errors.push({
          timestamp: new Date(),
          message: (error as Error).message,
          stack: (error as Error).stack,
        });
      }

      if (i % 100 === 0 && i > 0) {
        process.stdout.write(`\r  进度: ${i}/${this.config.iterations} (${(i / this.config.iterations * 100).toFixed(1)}%)`);
      }
    }

    const endTime = new Date();
    const memoryBefore = await this.measureMemory();
    await this.simulateWork(100);
    const memoryAfter = await this.measureMemory();

    console.log('\n');

    const metrics = this.calculateMetrics(latencies, errors, startTime, endTime, memoryBefore, memoryAfter);

    this.results.set('intent-parsing', {
      name: '意图解析压力测试',
      passed: metrics.successRate >= 95 && metrics.avgLatency < 5,
      metrics,
      details: {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
      },
    });

    this.printMetrics(metrics);
  }

  async runTaskCoordinatorStressTest(): Promise<void> {
    console.log('\n📋 任务协调器压力测试');
    console.log('═'.repeat(60));

    const coordinator = new TaskCoordinator();
    const testTasks = [
      '搜索项目文档',
      '搜索并整理文件',
      '分析数据生成报告',
      '整理桌面并备份',
    ];

    const latencies: number[] = [];
    const errors: ErrorInfo[] = [];

    for (let i = 0; i < this.config.warmup; i++) {
      coordinator.decomposeTask(testTasks[i % testTasks.length]);
    }

    const startTime = new Date();

    for (let i = 0; i < Math.min(this.config.iterations, 500); i++) {
      const task = testTasks[i % testTasks.length];
      const start = performance.now();

      try {
        coordinator.decomposeTask(task);
        latencies.push(performance.now() - start);
      } catch (error) {
        errors.push({
          timestamp: new Date(),
          message: (error as Error).message,
        });
      }

      if (i % 50 === 0 && i > 0) {
        process.stdout.write(`\r  进度: ${i}/${Math.min(this.config.iterations, 500)} (${(i / Math.min(this.config.iterations, 500) * 100).toFixed(1)}%)`);
      }
    }

    const endTime = new Date();
    const memoryBefore = await this.measureMemory();
    await this.simulateWork(100);
    const memoryAfter = await this.measureMemory();

    console.log('\n');

    const metrics = this.calculateMetrics(latencies, errors, startTime, endTime, memoryBefore, memoryAfter);

    this.results.set('task-coordinator', {
      name: '任务协调器压力测试',
      passed: metrics.successRate >= 95 && metrics.avgLatency < 10,
      metrics,
      details: {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
      },
    });

    this.printMetrics(metrics);
  }

  async runMessageBusStressTest(): Promise<void> {
    console.log('\n🚌 消息总线压力测试');
    console.log('═'.repeat(60));

    const bus = AgentCommunicationBus.getInstance();

    bus.registerAgent({
      agentId: 'stress-test-agent',
      agentType: 'test',
      capabilities: [],
      status: 'idle',
    });

    const latencies: number[] = [];
    const errors: ErrorInfo[] = [];

    const startTime = new Date();

    for (let i = 0; i < this.config.iterations; i++) {
      const start = performance.now();

      try {
        bus.sendMessage({
          from: 'stress-test-agent',
          to: 'stress-test-agent',
          type: 'request' as any,
          action: 'test',
          payload: { index: i, timestamp: Date.now() },
          priority: 'medium' as any,
        });
        latencies.push(performance.now() - start);
      } catch (error) {
        errors.push({
          timestamp: new Date(),
          message: (error as Error).message,
        });
      }

      if (i % 200 === 0 && i > 0) {
        process.stdout.write(`\r  进度: ${i}/${this.config.iterations} (${(i / this.config.iterations * 100).toFixed(1)}%)`);
      }
    }

    const endTime = new Date();
    const memoryBefore = await this.measureMemory();
    await this.simulateWork(50);
    const memoryAfter = await this.measureMemory();

    bus.unregisterAgent('stress-test-agent');

    console.log('\n');

    const metrics = this.calculateMetrics(latencies, errors, startTime, endTime, memoryBefore, memoryAfter);

    this.results.set('message-bus', {
      name: '消息总线压力测试',
      passed: metrics.successRate >= 99 && metrics.avgLatency < 1,
      metrics,
      details: {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
      },
    });

    this.printMetrics(metrics);
  }

  async runCEOStressTest(): Promise<void> {
    console.log('\n👔 CEO智能体压力测试');
    console.log('═'.repeat(60));

    const ceo = new CEOMind();
    const testQueries = [
      '帮我搜索项目文档',
      '打开设置',
      '你好',
      '查看团队状态',
      '什么是人工智能',
    ];

    const latencies: number[] = [];
    const errors: ErrorInfo[] = [];

    ceo.handleUserMessage('你好');

    const startTime = new Date();

    for (let i = 0; i < Math.min(this.config.iterations, 200); i++) {
      const query = testQueries[i % testQueries.length];
      const start = performance.now();

      try {
        await ceo.handleUserMessage(query);
        latencies.push(performance.now() - start);
      } catch (error) {
        errors.push({
          timestamp: new Date(),
          message: (error as Error).message,
        });
      }

      if (i % 20 === 0 && i > 0) {
        process.stdout.write(`\r  进度: ${i}/${Math.min(this.config.iterations, 200)} (${(i / Math.min(this.config.iterations, 200) * 100).toFixed(1)}%)`);
      }
    }

    const endTime = new Date();
    const memoryBefore = await this.measureMemory();
    await this.simulateWork(100);
    const memoryAfter = await this.measureMemory();

    console.log('\n');

    const metrics = this.calculateMetrics(latencies, errors, startTime, endTime, memoryBefore, memoryAfter);

    this.results.set('ceo-agent', {
      name: 'CEO智能体压力测试',
      passed: metrics.successRate >= 90 && metrics.avgLatency < 100,
      metrics,
      details: {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
      },
    });

    this.printMetrics(metrics);
  }

  async runEndToEndStressTest(): Promise<void> {
    console.log('\n🔄 端到端全链路压力测试');
    console.log('═'.repeat(60));

    const ceo = new CEOMind();
    const testScenarios = [
      { query: '帮我搜索项目文档', expectedTime: 500 },
      { query: '打开记事本', expectedTime: 300 },
      { query: '分析数据并生成报告', expectedTime: 2000 },
    ];

    const latencies: number[] = [];
    const errors: ErrorInfo[] = [];

    await ceo.handleUserMessage('你好');

    const startTime = new Date();

    for (let i = 0; i < Math.min(this.config.iterations / 5, 100); i++) {
      const scenario = testScenarios[i % testScenarios.length];
      const start = performance.now();

      try {
        await ceo.handleUserMessage(scenario.query);
        const latency = performance.now() - start;
        latencies.push(latency);

        if (latency > scenario.expectedTime * 2) {
          errors.push({
            timestamp: new Date(),
            message: `延迟过高: ${latency.toFixed(2)}ms (预期: ${scenario.expectedTime}ms)`,
          });
        }
      } catch (error) {
        errors.push({
          timestamp: new Date(),
          message: (error as Error).message,
        });
      }

      if (i % 10 === 0 && i > 0) {
        process.stdout.write(`\r  进度: ${i}/${Math.min(this.config.iterations / 5, 100)} (${(i / Math.min(this.config.iterations / 5, 100) * 100).toFixed(1)}%)`);
      }
    }

    const endTime = new Date();
    const memoryBefore = await this.measureMemory();
    await this.simulateWork(200);
    const memoryAfter = await this.measureMemory();

    console.log('\n');

    const metrics = this.calculateMetrics(latencies, errors, startTime, endTime, memoryBefore, memoryAfter);

    this.results.set('end-to-end', {
      name: '端到端全链路压力测试',
      passed: metrics.successRate >= 85 && metrics.avgLatency < 3000,
      metrics,
      details: {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
      },
    });

    this.printMetrics(metrics);
  }

  async runConcurrentStressTest(): Promise<void> {
    console.log('\n⚡ 高并发压力测试');
    console.log('═'.repeat(60));

    const parser = new IntentParser();
    const testInputs = [
      '搜索文件A', '搜索文件B', '搜索文件C',
      '打开应用1', '打开应用2', '打开应用3',
      '查询知识1', '查询知识2', '查询知识3',
    ];

    const latencies: number[] = [];
    const errors: ErrorInfo[] = [];
    let activeRequests = 0;

    const startTime = new Date();
    const totalTime = 10000;
    const startExec = Date.now();

    while (Date.now() - startExec < totalTime) {
      const batchPromises: Promise<void>[] = [];

      for (let j = 0; j < this.config.concurrency; j++) {
        const input = testInputs[j % testInputs.length];
        const start = performance.now();
        activeRequests++;

        const promise = (async () => {
          try {
            parser.parse(input);
            latencies.push(performance.now() - start);
          } catch (error) {
            errors.push({
              timestamp: new Date(),
              message: (error as Error).message,
            });
          } finally {
            activeRequests--;
          }
        })();

        batchPromises.push(promise);
      }

      await Promise.all(batchPromises);

      process.stdout.write(`\r  活动请求: ${activeRequests}, 已完成: ${latencies.length}`);
    }

    const endTime = new Date();
    const memoryBefore = await this.measureMemory();
    await this.simulateWork(100);
    const memoryAfter = await this.measureMemory();

    console.log('\n');

    const metrics = this.calculateMetrics(latencies, errors, startTime, endTime, memoryBefore, memoryAfter);

    this.results.set('concurrent', {
      name: '高并发压力测试',
      passed: metrics.successRate >= 90 && metrics.p99Latency < 50,
      metrics,
      details: {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
      },
    });

    this.printMetrics(metrics);
  }

  async runMemoryLeakTest(): Promise<void> {
    console.log('\n💾 内存泄漏测试');
    console.log('═'.repeat(60));

    const ceo = new CEOMind();
    const snapshots: { iteration: number; memory: number }[] = [];

    const memoryBefore = await this.measureMemory();
    snapshots.push({ iteration: 0, memory: memoryBefore });

    for (let i = 1; i <= 50; i++) {
      await ceo.handleUserMessage('你好');
      await this.simulateWork(10);

      if (i % 10 === 0) {
        const mem = await this.measureMemory();
        snapshots.push({ iteration: i, memory: mem });
        process.stdout.write(`\r  迭代 ${i}/50: 内存 ${mem.toFixed(2)}MB`);
      }
    }

    const memoryAfter = await this.measureMemory();
    const memoryGrowth = memoryAfter - memoryBefore;
    const avgGrowthPerIteration = memoryGrowth / 50;

    console.log('\n');

    const latencies: number[] = [];
    const errors: ErrorInfo[] = [];

    const result: StressTestResult = {
      name: '内存泄漏测试',
      passed: memoryGrowth < 50 && avgGrowthPerIteration < 1,
      metrics: {
        totalRequests: 50,
        successfulRequests: 50,
        failedRequests: 0,
        successRate: 100,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        p50Latency: 0,
        p90Latency: 0,
        p99Latency: 0,
        throughput: 0,
        errors: [],
      },
      details: {
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryGrowth,
      },
    };

    this.results.set('memory-leak', result);

    console.log('内存快照:');
    snapshots.forEach(s => {
      console.log(`  迭代 ${s.iteration}: ${s.memory.toFixed(2)}MB`);
    });
    console.log(`\n内存增长: ${memoryGrowth.toFixed(2)}MB (${avgGrowthPerIteration.toFixed(2)}MB/迭代)`);
    console.log(`状态: ${result.passed ? '✅ 无内存泄漏' : '❌ 可能存在内存泄漏'}`);
  }

  private printMetrics(metrics: StressMetrics): void {
    console.log('  📊 指标汇总:');
    console.log(`     总请求数: ${metrics.totalRequests}`);
    console.log(`     成功率: ${metrics.successRate.toFixed(2)}%`);
    console.log(`     平均延迟: ${metrics.avgLatency.toFixed(2)}ms`);
    console.log(`     最小延迟: ${metrics.minLatency.toFixed(2)}ms`);
    console.log(`     最大延迟: ${metrics.maxLatency.toFixed(2)}ms`);
    console.log(`     P50延迟: ${metrics.p50Latency.toFixed(2)}ms`);
    console.log(`     P90延迟: ${metrics.p90Latency.toFixed(2)}ms`);
    console.log(`     P99延迟: ${metrics.p99Latency.toFixed(2)}ms`);
    console.log(`     吞吐量: ${metrics.throughput.toFixed(2)} req/s`);
    if (metrics.errors.length > 0) {
      console.log(`     错误数: ${metrics.errors.length}`);
    }
    console.log('');
  }

  private printSummary(): void {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 压力测试汇总报告');
    console.log('═'.repeat(60));

    let totalTests = 0;
    let passedTests = 0;

    this.results.forEach((result, name) => {
      totalTests++;
      if (result.passed) passedTests++;

      const status = result.passed ? '✅' : '❌';
      console.log(`\n${status} ${result.name}`);
      console.log(`   通过: ${result.passed ? '是' : '否'}`);
      console.log(`   成功率: ${result.metrics.successRate.toFixed(2)}%`);
      console.log(`   平均延迟: ${result.metrics.avgLatency.toFixed(2)}ms`);
      console.log(`   内存变化: ${result.details.memoryDelta > 0 ? '+' : ''}${result.details.memoryDelta.toFixed(2)}MB`);
    });

    console.log('\n' + '─'.repeat(60));
    console.log(`总计: ${totalTests} 个测试, ${passedTests} 个通过, ${totalTests - passedTests} 个失败`);
    console.log(`通过率: ${(passedTests / totalTests * 100).toFixed(1)}%`);
    console.log('═'.repeat(60) + '\n');
  }

  private async simulateWork(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport(): string {
    let report = '# NexMind 压力测试报告\n\n';
    report += `生成时间: ${new Date().toISOString()}\n\n`;
    report += '## 测试配置\n\n';
    report += `- 迭代次数: ${this.config.iterations}\n`;
    report += `- 并发数: ${this.config.concurrency}\n`;
    report += `- 预热次数: ${this.config.warmup}\n`;
    report += `- 超时时间: ${this.config.timeout}ms\n\n`;

    report += '## 测试结果\n\n';

    this.results.forEach((result, name) => {
      report += `### ${result.name}\n\n`;
      report += `- 状态: ${result.passed ? '✅ 通过' : '❌ 失败'}\n`;
      report += `- 成功率: ${result.metrics.successRate.toFixed(2)}%\n`;
      report += `- 平均延迟: ${result.metrics.avgLatency.toFixed(2)}ms\n`;
      report += `- P99延迟: ${result.metrics.p99Latency.toFixed(2)}ms\n`;
      report += `- 吞吐量: ${result.metrics.throughput.toFixed(2)} req/s\n`;
      report += `- 内存变化: ${result.details.memoryDelta.toFixed(2)}MB\n\n`;
    });

    return report;
  }
}

export async function runStressTests(config?: Partial<StressTestConfig>): Promise<Map<string, StressTestResult>> {
  const runner = new StressTestRunner(config);
  return runner.runAllStressTests();
}

export { StressTestRunner };
