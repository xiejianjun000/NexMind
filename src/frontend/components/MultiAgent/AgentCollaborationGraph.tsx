// AgentCollaborationGraph - 智能体协作可视化图
// 展示智能体之间的消息流动和协作关系

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AgentMessage } from '../../hooks/useMultiAgent';

interface AgentNode {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  color: string;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
}

const AGENT_POSITIONS: AgentNode[] = [
  { id: 'general-agent', name: '全能助手', icon: '🔍', x: 400, y: 50, color: '#00BCD4' },
  { id: 'file-agent', name: '文件管理员', icon: '📁', x: 150, y: 200, color: '#4CAF50' },
  { id: 'system-agent', name: '系统操控师', icon: '⚙️', x: 400, y: 200, color: '#2196F3' },
  { id: 'knowledge-agent', name: '知识库管理员', icon: '📚', x: 650, y: 200, color: '#FF9800' },
  { id: 'image-agent', name: '图片整理师', icon: '🖼️', x: 200, y: 350, color: '#E91E63' },
  { id: 'data-agent', name: '数据分析师', icon: '📊', x: 550, y: 350, color: '#9C27B0' },
];

const AgentCollaborationGraph: React.FC<{ messages: AgentMessage[] }> = ({ messages }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeConnections, setActiveConnections] = useState<Set<string>>(new Set());
  const [messageQueue, setMessageQueue] = useState<AgentMessage[]>([]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setMessageQueue(prev => [...prev.slice(-10), lastMessage]);
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnections(prev => {
        const newSet = new Set<string>();
        prev.forEach(key => {
          const [from, to] = key.split('-');
          const [newFrom, newTo] = from && to ? [from, to] : ['', ''];
          if (Math.random() > 0.3) {
            newSet.add(key);
          }
        });
        return newSet;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const drawConnections = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    AGENT_POSITIONS.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = node.color + '20';
      ctx.fill();
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    const connections: Connection[] = [];
    AGENT_POSITIONS.forEach(from => {
      AGENT_POSITIONS.forEach(to => {
        if (from.id !== to.id) {
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          connections.push({
            from: from.id,
            to: to.id,
            strength: Math.max(0, 1 - distance / 500),
          });
        }
      });
    });

    connections.forEach(conn => {
      const fromNode = AGENT_POSITIONS.find(n => n.id === conn.from);
      const toNode = AGENT_POSITIONS.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        const isActive = activeConnections.has(`${conn.from}-${conn.to}`);
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = isActive 
          ? `rgba(59, 130, 246, ${0.3 + conn.strength * 0.5})` 
          : `rgba(100, 116, 139, ${0.1 + conn.strength * 0.2})`;
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.stroke();

        if (isActive) {
          const progress = (Date.now() % 1000) / 1000;
          const x = fromNode.x + (toNode.x - fromNode.x) * progress;
          const y = fromNode.y + (toNode.y - fromNode.y) * progress;
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#3B82F6';
          ctx.fill();
        }
      }
    });
  };

  useEffect(() => {
    drawConnections();
    const interval = setInterval(drawConnections, 50);
    return () => clearInterval(interval);
  }, [activeConnections]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="absolute inset-0"
      />
      
      {AGENT_POSITIONS.map(node => (
        <AgentNodeComponent key={node.id} node={node} />
      ))}

      <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2">图例</h4>
        <div className="space-y-1 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500" />
            <span>活跃连接</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-500" />
            <span>空闲连接</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2">消息统计</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>总消息数:</span>
            <span className="text-white">{messages.length}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>活跃连接:</span>
            <span className="text-blue-400">{activeConnections.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentNodeComponent: React.FC<{ node: AgentNode }> = ({ node }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: node.x, top: node.y }}
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border-2"
        style={{ 
          backgroundColor: node.color + '30',
          borderColor: node.color,
        }}
      >
        {node.icon}
      </div>
      
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs text-white bg-gray-800/80 px-2 py-1 rounded">
          {node.name}
        </span>
      </div>

      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl z-10"
        >
          <p className="text-xs text-gray-300">{node.name}</p>
          <p className="text-xs text-gray-500">{node.id}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AgentCollaborationGraph;
