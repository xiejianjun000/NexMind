import React, { useState, useEffect } from 'react';
import { Users, User, ChevronRight, Sparkles, Clock, Star, Zap, Loader2 } from 'lucide-react';
import { Expert } from '../../shared/types/expert';
import { getAllExperts, summonExpert, initializeSystem } from '../../shared/api';

interface ExpertPanelProps {
  experts?: Expert[];
  onSummonExpert?: (id: string) => void;
}

const ExpertPanel: React.FC<ExpertPanelProps> = ({ experts: propExperts, onSummonExpert }) => {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [experts, setExperts] = useState<Expert[]>(propExperts || []);
  const [summoningId, setSummoningId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [requestContent, setRequestContent] = useState<string>('');

  useEffect(() => {
    if (!propExperts || propExperts.length === 0) {
      const loadExperts = async () => {
        await initializeSystem();
        const allExperts = getAllExperts();
        setExperts(allExperts);
      };
      loadExperts();
    }
  }, [propExperts]);

  const getStatusColor = (status: Expert['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Expert['status']) => {
    switch (status) {
      case 'active':
        return '活跃';
      case 'idle':
        return '空闲';
      case 'busy':
        return '忙碌';
      default:
        return '未知';
    }
  };

  const handleSummon = async (expertId: string) => {
    if (summoningId) return;
    
    if (!requestContent.trim()) {
      setLastResult('请输入请求内容后再召唤专家');
      return;
    }
    
    setSummoningId(expertId);
    setLastResult(null);
    
    try {
      // Call real backend API
      const response = await summonExpert(expertId, requestContent);
      
      if (response.success) {
        setLastResult(`专家已响应: ${JSON.stringify(response.result, null, 2).slice(0, 200)}...`);
        if (onSummonExpert) {
          onSummonExpert(expertId);
        }
      } else {
        setLastResult(`错误: ${response.error}`);
      }
      
      // Refresh experts list to get updated status
      const updatedExperts = getAllExperts();
      setExperts(updatedExperts);
    } catch (error) {
      console.error('Failed to summon expert:', error);
      setLastResult(`召唤失败: ${(error as Error).message}`);
    } finally {
      setSummoningId(null);
    }
  };

  return (
    <div className="h-full flex">
      {/* 专家列表 */}
      <div className="w-80 border-r border-slate-800 overflow-y-auto">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold">专家团队</h2>
            <span className="ml-auto text-xs text-slate-500">{experts.length}位专家</span>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {experts.map((expert) => (
            <div
              key={expert.id}
              onClick={() => setSelectedExpert(expert)}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                selectedExpert?.id === expert.id
                  ? 'bg-indigo-600/20 border border-indigo-500/50'
                  : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200 truncate">{expert.name}</span>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(expert.status)}`} />
                  </div>
                  <span className="text-xs text-slate-500 truncate">{expert.role}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 专家详情 */}
      <div className="flex-1 overflow-y-auto">
        {selectedExpert ? (
          <div className="p-6">
            {/* 专家头部 */}
            <div className="card mb-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-white">{selectedExpert.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedExpert.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      selectedExpert.status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {getStatusText(selectedExpert.status)}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">{selectedExpert.role}</p>
                  <p className="text-slate-500 mt-2">{selectedExpert.description}</p>
                </div>
              </div>

              {/* 请求内容输入框 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">请求内容</label>
                <textarea
                  value={requestContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestContent(e.target.value)}
                  placeholder="请输入您希望专家协助的具体内容..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              
              {/* 召唤按钮 */}
              <button
                onClick={() => handleSummon(selectedExpert.id)}
                disabled={selectedExpert.status === 'busy' || summoningId === selectedExpert.id}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {summoningId === selectedExpert.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>召唤中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>召唤专家</span>
                  </>
                )}
              </button>
              
              {/* 召唤结果 */}
              {lastResult && (
                <div className="mt-4 p-3 bg-slate-800 rounded-lg text-sm text-slate-300 whitespace-pre-wrap">
                  {lastResult}
                </div>
              )}
            </div>

            {/* 专业领域 */}
            <div className="card mb-6">
              <h4 className="text-lg font-semibold text-slate-200 mb-4">专业领域</h4>
              <div className="flex flex-wrap gap-2">
                {selectedExpert.specialty.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-300 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* 能力清单 */}
            <div className="card mb-6">
              <h4 className="text-lg font-semibold text-slate-200 mb-4">能力清单</h4>
              <ul className="space-y-2">
                {selectedExpert.capabilities.map((cap, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-slate-300">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 统计信息 */}
            <div className="card">
              <h4 className="text-lg font-semibold text-slate-200 mb-4">统计信息</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-indigo-400 mb-1">
                    <Star className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedExpert.version}</div>
                  <div className="text-xs text-slate-500">版本</div>
                </div>
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-pink-400 mb-1">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedExpert.useCount}</div>
                  <div className="text-xs text-slate-500">调用次数</div>
                </div>
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedExpert.isAvailable ? '可用' : '不可用'}</div>
                  <div className="text-xs text-slate-500">状态</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>选择一位专家查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertPanel;
