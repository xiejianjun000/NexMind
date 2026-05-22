#!/usr/bin/env node

// NexMind 压力测试执行脚本
// 运行完整压力测试套件

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                                                              ║');
console.log('║              🚀 NexMind 压力测试系统 🚀                  ║');
console.log('║                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// 导入压力测试模块
const StressTestModule = require('../src/__tests__/StressTest');

// 测试配置
const config = {
  iterations: 1000,
  concurrency: 10,
  warmup: 10,
  timeout: 30000,
};

async function runTests() {
  console.log('📋 测试配置:');
  console.log(`   迭代次数: ${config.iterations}`);
  console.log(`   并发数: ${config.concurrency}`);
  console.log(`   预热次数: ${config.warmup}`);
  console.log(`   超时时间: ${config.timeout}ms`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  try {
    // 运行所有压力测试
    const results = await StressTestModule.runStressTests(config);

    // 输出汇总报告
    console.log('\n📊 最终汇总:');
    console.log('═══════════════════════════════════════════════════════════════');

    let totalTests = 0;
    let passedTests = 0;
    let totalRequests = 0;
    let totalSuccess = 0;
    let totalLatency = 0;
    let totalThroughput = 0;

    results.forEach((result, name) => {
      totalTests++;
      if (result.passed) passedTests++;
      totalRequests += result.metrics.totalRequests;
      totalSuccess += result.metrics.successfulRequests;
      totalLatency += result.metrics.avgLatency;
      totalThroughput += result.metrics.throughput;

      const status = result.passed ? '✅' : '❌';
      console.log(`\n${status} ${result.name}`);
      console.log(`   成功率: ${result.metrics.successRate.toFixed(2)}%`);
      console.log(`   平均延迟: ${result.metrics.avgLatency.toFixed(2)}ms`);
      console.log(`   P99延迟: ${result.metrics.p99Latency.toFixed(2)}ms`);
      console.log(`   吞吐量: ${result.metrics.throughput.toFixed(2)} req/s`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📈 总体统计:');
    console.log(`   测试总数: ${totalTests}`);
    console.log(`   通过: ${passedTests} | 失败: ${totalTests - passedTests}`);
    console.log(`   通过率: ${(passedTests / totalTests * 100).toFixed(1)}%`);
    console.log(`   总请求数: ${totalRequests}`);
    console.log(`   总成功率: ${(totalSuccess / totalRequests * 100).toFixed(2)}%`);
    console.log(`   平均吞吐量: ${(totalThroughput / totalTests).toFixed(2)} req/s`);
    console.log('═══════════════════════════════════════════════════════════════');

    if (passedTests === totalTests) {
      console.log('\n🎉 所有测试通过！系统性能良好。\n');
      process.exit(0);
    } else {
      console.log('\n⚠️ 部分测试失败，请检查系统性能。\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 测试执行失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行测试
runTests();
