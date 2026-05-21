import { useState } from 'react'
import { MessageSquare, Search, Settings, Bot, Users } from 'lucide-react'
import ChatInterface from './components/ChatInterface'
import MemoryExplorer from './components/MemoryExplorer'
import ExpertPanel from './components/ExpertPanel'
import VoiceChat from './components/VoiceChat'
import { PRESET_EXPERTS } from '../shared/types/expert'

function App() {
  const [activeView, setActiveView] = useState('chat')

  const handleSummonExpert = (expertId: string) => {
    console.log(`Summoning expert: ${expertId}`)
    setActiveView('chat')
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-500 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                NexMind
              </h1>
              <p className="text-xs text-slate-500">下一代智能中枢</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('chat')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'chat'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>对话</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('experts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'experts'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>专家</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('memory')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'memory'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>记忆</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'settings'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>设置</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeView === 'chat' && <ChatInterface />}
        {activeView === 'experts' && <ExpertPanel experts={PRESET_EXPERTS} onSummonExpert={handleSummonExpert} />}
        {activeView === 'memory' && <MemoryExplorer />}
        {activeView === 'settings' && <div className="p-8 text-center text-slate-500">设置页面</div>}
      </main>

      {/* Voice Chat Button */}
      <VoiceChat />
    </div>
  )
}

export default App
