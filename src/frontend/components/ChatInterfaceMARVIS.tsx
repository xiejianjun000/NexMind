// ChatInterface - 简化的聊天界面
// 使用新的NexMindMARVIS架构

import React, { useState, useRef, useEffect } from 'react';
import { nexmindAPI } from '../api/nexmind';
import { ChatMessage } from '../backend/ai/NexMindMARVIS';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        await nexmindAPI.initialize();
        setInitialized(true);
        
        // 添加欢迎消息
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: '👋 你好！我是NexMind，你的智能助手。\n\n我可以帮你：\n- 📁 搜索和管理文件\n- 🚀 启动和关闭应用\n- ⚙️ 修改系统设置\n- 🔍 搜索网页\n- 💡 咨询专家意见\n\n有什么我可以帮你的吗？',
          timestamp: new Date(),
        }]);
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };
    
    init();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // 添加用户消息
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    try {
      const response = await nexmindAPI.sendMessage(userMessage);
      
      // 添加助手消息
      setMessages(prev => [...prev, response.message]);
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 添加错误消息
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后再试。',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 快捷命令
  const quickCommands = [
    { label: '🔍 搜索文件', command: '搜索文件：报告' },
    { label: '🚀 打开应用', command: '打开Chrome' },
    { label: '⚙️ 系统设置', command: '查看系统配置' },
    { label: '💡 获取帮助', command: '你能做什么' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* 头部 */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">NexMind</h1>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${initialized ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-400">
              {initialized ? '已连接' : '连接中...'}
            </span>
          </div>
        </div>
      </header>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {/* 意图信息 */}
              {msg.intent && (
                <div className="mt-2 text-xs text-gray-400">
                  意图: {msg.intent.type} / {msg.intent.action}
                  <span className="ml-2">
                    置信度: {(msg.intent.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              
              {/* 执行结果 */}
              {msg.result && (
                <div className="mt-2 text-xs text-gray-400">
                  执行时间: {msg.result.executionTime}ms
                  {msg.result.success ? ' ✅' : ' ❌'}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* 加载指示器 */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷命令 */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => setInput(cmd.command)}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* 输入框 */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入命令或消息..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
