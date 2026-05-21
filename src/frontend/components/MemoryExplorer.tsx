import React, { useState, useEffect } from 'react'
import { Folder, FileText, Search, ChevronRight, ChevronDown, Trash2, RefreshCw } from 'lucide-react'
import { 
  getMemoryTree, 
  searchMemory, 
  getMemoryStats, 
  deleteMemoryNode,
  ingestMemory,
  initializeSystem,
  MemoryNode 
} from '../../shared/api'

interface TreeNode {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: TreeNode[]
  content?: string
  timestamp: Date
}

// Convert MemoryNode to TreeNode for display
function memoryNodeToTreeNode(nodes: MemoryNode[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>()
  
  // First pass: create all nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      id: node.id,
      name: node.type === 'summary' ? `摘要: ${node.id.slice(0, 8)}...` : `${node.type}: ${node.id.slice(0, 8)}...`,
      type: node.childrenIds && node.childrenIds.length > 0 ? 'folder' : 'file',
      content: node.content,
      timestamp: node.timestamp,
      children: []
    })
  })
  
  // Second pass: build tree structure
  const rootNodes: TreeNode[] = []
  nodes.forEach(node => {
    const treeNode = nodeMap.get(node.id)!
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!
      if (!parent.children) parent.children = []
      parent.children.push(treeNode)
    } else {
      rootNodes.push(treeNode)
    }
  })
  
  return rootNodes
}

const MemoryNodeItem: React.FC<{ 
  node: TreeNode
  depth?: number
  onDelete: (id: string) => void 
}> = ({ node, depth = 0, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800 cursor-pointer group">
        <div className="flex items-center gap-2 flex-1" onClick={() => hasChildren && setIsExpanded(!isExpanded)}>
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
          
          {node.type === 'folder' ? (
            <Folder className="w-4 h-4 text-yellow-500" />
          ) : (
            <FileText className="w-4 h-4 text-slate-400" />
          )}
          
          <span className="text-slate-200 group-hover:text-white truncate flex-1">{node.name}</span>
          <span className="text-xs text-slate-500">
            {node.timestamp.toLocaleDateString()}
          </span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(node.id)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children?.map((child) => (
            <MemoryNodeItem key={child.id} node={child} depth={depth + 1} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

const MemoryExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [stats, setStats] = useState({ totalNodes: 0, totalTokens: 0, types: {} as Record<string, number> })
  const [isLoading, setIsLoading] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      await initializeSystem()
      const nodes = getMemoryTree()
      setTreeData(memoryNodeToTreeNode(nodes))
      setStats(getMemoryStats())
    } catch (error) {
      console.error('Failed to load memory:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchMemory(searchQuery)
      setTreeData(memoryNodeToTreeNode(results))
    } else {
      loadData()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个记忆节点吗？')) {
      deleteMemoryNode(id)
      await loadData()
    }
  }

  const handleAddTestMemory = async () => {
    const testContent = `测试记忆 - ${new Date().toLocaleString()}\n\n这是一个测试记忆节点，用于验证记忆树功能。`
    await ingestMemory(testContent, 'document', { tags: ['test'] })
    await loadData()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索记忆..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 input"
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-primary px-4"
            >
              搜索
            </button>
            <button
              onClick={loadData}
              className="btn-secondary px-3"
              title="刷新"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Memory Tree */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">记忆树</h2>
              <button
                onClick={handleAddTestMemory}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                + 添加测试记忆
              </button>
            </div>
            
            {treeData.length > 0 ? (
              <div className="space-y-1">
                {treeData.map((node) => (
                  <MemoryNodeItem key={node.id} node={node} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无记忆数据</p>
                <p className="text-sm mt-1">点击"添加测试记忆"创建一个测试节点</p>
              </div>
            )}
          </div>
          
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">记忆统计</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <div className="text-3xl font-bold text-indigo-400">{stats.totalNodes}</div>
                <div className="text-sm text-slate-500">总节点</div>
              </div>
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <div className="text-3xl font-bold text-pink-400">{stats.types['document'] || 0}</div>
                <div className="text-sm text-slate-500">文档</div>
              </div>
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <div className="text-3xl font-bold text-emerald-400">{(stats.totalTokens / 1000).toFixed(1)}k</div>
                <div className="text-sm text-slate-500">token</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemoryExplorer
