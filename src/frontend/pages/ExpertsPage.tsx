import React, { useState } from 'react';
import { Users, User, Briefcase, Zap, Activity, Star, Search, Sparkles } from 'lucide-react';
import { PRESET_EXPERTS, Expert } from '../../shared/types/expert';

interface ExpertsPageProps {
  onExpertSelected?: (expert: Expert) => void;
}

const ExpertsPage: React.FC<ExpertsPageProps> = ({ onExpertSelected }) => {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'available'>('all');

  const filteredExperts = PRESET_EXPERTS.filter(expert => {
    const matchesSearch = 
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filter === 'all' || 
      (filter === 'available' && expert.isAvailable && expert.status === 'idle');
    
    return matchesSearch && matchesFilter;
  });

  const handleExpertClick = (expert: Expert) => {
    setSelectedExpert(expert);
    onExpertSelected?.(expert);
  };

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

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                专家中心
              </h1>
              <p className="text-sm text-slate-500">召唤专业智能体协助您的工作</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索专家..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  filter === 'available' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                可用
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Expert List */}
        <div className="w-80 border-r border-slate-800 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">共 {filteredExperts.length} 位专家</span>
            </div>
            
            <div className="space-y-2">
              {filteredExperts.map(expert => (
                <div
                  key={expert.id}
                  onClick={() => handleExpertClick(expert)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    selectedExpert?.id === expert.id
                      ? 'bg-indigo-600/20 border border-indigo-500/50'
                      : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200 truncate">{expert.name}</span>
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(expert.status)}`} />
                      </div>
                      <span className="text-xs text-slate-500 truncate block">{expert.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expert Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedExpert ? (
            <div className="max-w-3xl mx-auto">
              {/* Expert Header */}
              <div className="card mb-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">{selectedExpert.name}</h2>
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

                {/* Summon Button */}
                <button
                  disabled={selectedExpert.status === 'busy'}
                  className="mt-6 w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>召唤专家</span>
                </button>
              </div>

              {/* Specialty */}
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">专业领域</h3>
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

              {/* Capabilities */}
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">能力清单</h3>
                <ul className="space-y-2">
                  {selectedExpert.capabilities.map((cap, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-slate-300">{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stats */}
              <div className="card">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">统计信息</h3>
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
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-white">{selectedExpert.useCount}</div>
                    <div className="text-xs text-slate-500">调用次数</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <Briefcase className="w-4 h-4" />
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
    </div>
  );
};

export default ExpertsPage;
