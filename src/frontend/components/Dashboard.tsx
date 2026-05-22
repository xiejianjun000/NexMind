// NexMindDashboard - 完整的系统管理面板
// 文件管理、应用管理、回收站等

import React, { useState, useEffect } from 'react';
import { nexmindAPI } from '../api/nexmind';

interface FileItem {
  name: string;
  path: string;
  size: number;
  modified: string;
  isDirectory: boolean;
}

interface AppItem {
  name: string;
  path: string;
  running?: boolean;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'files' | 'apps' | 'trash' | 'settings'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 搜索文件
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await nexmindAPI.searchFiles(searchQuery);
      if (response.result?.data?.files) {
        setSearchResults(response.result.data.files);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* 侧边栏 */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            NexMind
          </h1>
          <p className="text-xs text-gray-400 mt-1">智能助手 v1.0</p>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'search', icon: '🔍', label: '快速搜索' },
            { id: 'files', icon: '📁', label: '文件管理' },
            { id: 'apps', icon: '🚀', label: '应用管理' },
            { id: 'trash', icon: '🗑️', label: '回收站' },
            { id: 'settings', icon: '⚙️', label: '设置' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* 状态信息 */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>运行状态:</span>
              <span className="text-green-400">● 在线</span>
            </div>
            <div className="flex justify-between">
              <span>内存使用:</span>
              <span className="text-yellow-400">256 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="输入命令或搜索内容..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                搜索
              </button>
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'search' && <SearchPanel results={searchResults} isSearching={isSearching} />}
          {activeTab === 'files' && <FilesPanel />}
          {activeTab === 'apps' && <AppsPanel />}
          {activeTab === 'trash' && <TrashPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
};

// 搜索面板
const SearchPanel: React.FC<{ results: FileItem[]; isSearching: boolean }> = ({ results, isSearching }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🔍 快速搜索</h2>
      
      {isSearching ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-gray-400">搜索中...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          <p className="text-gray-400">找到 {results.length} 个结果</p>
          {results.map((file, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{file.isDirectory ? '📁' : '📄'}</span>
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-gray-400 truncate">{file.path}</div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <div>{formatSize(file.size)}</div>
                  <div>{file.modified}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🔍</div>
          <p>输入搜索关键词开始搜索</p>
          <p className="text-sm mt-2">例如：报告、文档、图片等</p>
        </div>
      )}
    </div>
  );
};

// 文件面板
const FilesPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📁 文件管理</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold mb-2">📂 最近文件</h3>
          <p className="text-gray-400 text-sm">显示最近访问的文件</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold mb-2">⭐ 收藏夹</h3>
          <p className="text-gray-400 text-sm">快速访问常用文件夹</p>
        </div>
      </div>
    </div>
  );
};

// 应用面板
const AppsPanel: React.FC = () => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取应用列表
      setApps([]);
    } catch (error) {
      console.error('加载应用失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🚀 应用管理</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {apps.map((app, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-medium">{app.name}</div>
              {app.running && <span className="text-xs text-green-400">● 运行中</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 回收站面板
const TrashPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🗑️ 回收站</h2>
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400">回收站功能开发中...</p>
      </div>
    </div>
  );
};

// 设置面板
const SettingsPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">⚙️ 设置</h2>
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold mb-4">常规设置</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>启动时自动运行</span>
              <input type="checkbox" className="w-5 h-5" />
            </label>
            <label className="flex items-center justify-between">
              <span>最小化到系统托盘</span>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>开机自动启动</span>
              <input type="checkbox" className="w-5 h-5" />
            </label>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold mb-4">搜索设置</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">索引目录</label>
              <input type="text" defaultValue="C:\\" className="w-full px-3 py-2 bg-gray-700 rounded" />
            </div>
            <label className="flex items-center justify-between">
              <span>包含文件内容搜索</span>
              <input type="checkbox" className="w-5 h-5" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// 格式化文件大小
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default Dashboard;
