import React, { useState, useEffect } from 'react';
import { Activity, Brain, Shield, GitBranch, Zap, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

interface EvolutionMetrics {
  totalCycles: number;
  successRate: number;
  skillCount: number;
  reflectionCount: number;
  avgConfidence: number;
  learnedPatterns: string[];
}

const EvolutionMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<EvolutionMetrics>({
    totalCycles: 0,
    successRate: 0,
    skillCount: 5,
    reflectionCount: 0,
    avgConfidence: 0,
    learnedPatterns: [],
  });

  // 模拟数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalCycles: prev.totalCycles + Math.random() > 0.7 ? 1 : 0,
        successRate: Math.min(0.95, prev.successRate + (Math.random() - 0.5) * 0.05),
        reflectionCount: prev.reflectionCount + (Math.random() > 0.8 ? 1 : 0),
        avgConfidence: Math.min(0.95, Math.max(0.6, prev.avgConfidence + (Math.random() - 0.5) * 0.02)),
        learnedPatterns: prev.totalCycles > prev.learnedPatterns.length + 2
          ? [...prev.learnedPatterns, `模式-${prev.learnedPatterns.length + 1}`].slice(-10)
          : prev.learnedPatterns,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">进化控制中心</h2>
            <p className="text-sm text-slate-500">Evolution Control Center</p>
          </div>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-slate-400">进化周期</span>
            </div>
            <div className="text-3xl font-bold text-white">{metrics.totalCycles}</div>
            <div className="text-xs text-slate-500 mt-1">累计学习循环</div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-400">成功率</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{(metrics.successRate * 100).toFixed(1)}%</div>
            <div className="text-xs text-slate-500 mt-1">任务执行成功率</div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-400">技能数量</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{metrics.skillCount}</div>
            <div className="text-xs text-slate-500 mt-1">已注册技能</div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-400">反思记录</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{metrics.reflectionCount}</div>
            <div className="text-xs text-slate-500 mt-1">累计复盘分析</div>
          </div>
        </div>

        {/* 二级指标 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              沙箱验证状态
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">代码安全检查</span>
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" /> 通过
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">依赖审查</span>
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" /> 通过
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">权限验证</span>
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" /> 通过
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">平均置信度</span>
                <span className="text-indigo-400 font-medium">{(metrics.avgConfidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-orange-400" />
              版本控制
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">当前版本</span>
                <span className="text-white font-medium">v1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">备份点</span>
                <span className="text-white font-medium">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">自动回滚</span>
                <span className="text-green-400 text-sm">就绪</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">最后备份</span>
                <span className="text-slate-500 text-sm">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 学习模式 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">已学习模式</h3>
          {metrics.learnedPatterns.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {metrics.learnedPatterns.map((pattern, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 text-sm border border-purple-500/30"
                >
                  {pattern}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>系统正在观察任务模式，积累足够的样本后将自动生成技能</p>
            </div>
          )}
        </div>

        {/* 进化时间线 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">进化时间线</h3>
          <div className="space-y-3">
            {[
              { time: '5分钟前', event: '技能 "数据备份" 被自动生成', type: 'skill', success: true },
              { time: '15分钟前', event: '完成任务执行周期 #3', type: 'cycle', success: true },
              { time: '30分钟前', event: '反思分析: 代码审查流程优化', type: 'reflection', success: true },
              { time: '1小时前', event: '沙箱验证: 新技能安全性检查通过', type: 'sandbox', success: true },
              { time: '2小时前', event: '版本快照创建: 技能系统更新', type: 'version', success: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 pl-4 border-l-2 border-slate-700">
                <div className="flex-1">
                  <p className="text-sm text-slate-300">{item.event}</p>
                  <span className="text-xs text-slate-500">{item.time}</span>
                </div>
                {item.success ? (
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionMonitor;