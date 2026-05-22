// MinionHero - 精致的小黄人吉祥物主组件
// 大尺寸展示，动态表情，类似OPENHUMAN风格

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MinionState = 
  | 'idle' 
  | 'listening' 
  | 'thinking' 
  | 'working' 
  | 'speaking' 
  | 'happy' 
  | 'worried' 
  | 'excited' 
  | 'sleeping' 
  | 'success' 
  | 'error';

interface MinionHeroProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  state?: MinionState;
  speechText?: string;
  showSpeechBubble?: boolean;
  showStatus?: boolean;
  animated?: boolean;
  onStateChange?: (state: MinionState) => void;
}

const MinionHero: React.FC<MinionHeroProps> = ({
  size = 'hero',
  state = 'idle',
  speechText = '',
  showSpeechBubble = true,
  showStatus = true,
  animated = true,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  const dimensions = {
    small: 120,
    medium: 180,
    large: 240,
    hero: 320,
  };

  const dim = dimensions[size];
  const scale = dim / 320;

  // 打字效果
  useEffect(() => {
    if (speechText && showSpeechBubble) {
      setIsTyping(true);
      setDisplayText('');
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < speechText.length) {
          setDisplayText(speechText.substring(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 40);

      return () => clearInterval(interval);
    } else {
      setDisplayText('');
      setIsTyping(false);
    }
  }, [speechText, showSpeechBubble]);

  // 特殊状态的粒子效果
  useEffect(() => {
    if (state === 'happy' || state === 'excited') {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 100 - 50,
        emoji: ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)],
      }));
      setParticles(newParticles);
      
      const timeout = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  // 状态颜色映射
  const stateColors = useMemo(() => ({
    idle: '#FFD700',
    listening: '#00B0FF',
    thinking: '#FF9100',
    working: '#00C853',
    speaking: '#7C4DFF',
    happy: '#FFD700',
    worried: '#FF5252',
    excited: '#FF4081',
    sleeping: '#78909C',
    success: '#00C853',
    error: '#FF5252',
  }), []);

  const stateLabels = useMemo(() => ({
    idle: '空闲等待',
    listening: '聆听中...',
    thinking: '思考中...',
    working: '工作中...',
    speaking: '回答中...',
    happy: '开心！',
    worried: '有点担心',
    excited: '好兴奋！',
    sleeping: '休息中',
    success: '成功！',
    error: '出错了',
  }), []);

  const stateIcons = useMemo(() => ({
    idle: '○',
    listening: '●',
    thinking: '◐',
    working: '◑',
    speaking: '◕',
    happy: '★',
    worried: '◆',
    excited: '♦',
    sleeping: '☾',
    success: '✓',
    error: '✗',
  }), []);

  // 获取动画配置
  const getAnimation = () => {
    if (!animated) return {};
    
    switch (state) {
      case 'idle':
        return {
          y: [0, -4, 0],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'listening':
        return {
          scale: [1, 1.02, 1],
          transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'thinking':
        return {
          rotate: [0, -2, 2, -2, 0],
          transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'working':
        return {
          y: [0, -6, 0],
          transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'speaking':
        return {
          scale: [1, 1.03, 1],
          transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
        };
      case 'happy':
      case 'excited':
        return {
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
          transition: { duration: 0.6, repeat: Infinity, ease: 'easeOut' },
        };
      case 'sleeping':
        return {
          opacity: [0.7, 1, 0.7],
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        };
      default:
        return {};
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* 粒子效果层 */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ 
              opacity: 0, 
              x: particle.x, 
              y: particle.y - 50, 
              scale: 1.5,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute text-2xl pointer-events-none"
            style={{ top: '20%', left: '50%' }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 小黄人主体 */}
      <motion.div
        animate={getAnimation()}
        className="relative"
        style={{
          width: dim,
          height: dim * 1.3,
          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4))',
        }}
      >
        {/* 发光底座 */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-30 blur-2xl"
          style={{
            width: dim * 0.8,
            height: dim * 0.3,
            background: stateColors[state],
          }}
        />

        {/* SVG小黄人 */}
        <svg
          width={dim}
          height={dim * 1.3}
          viewBox="0 0 200 260"
          className="overflow-visible"
        >
          {/* 身体 */}
          <ellipse
            cx="100"
            cy="170"
            rx="65"
            ry="85"
            fill="#FFD700"
            className="filter drop-shadow-lg"
          />
          
          {/* 身体渐变覆盖 */}
          <ellipse
            cx="100"
            cy="160"
            rx="55"
            ry="70"
            fill="url(#bodyGradient)"
            opacity="0.3"
          />

          {/* 眼睛白色背景 */}
          <ellipse cx="100" cy="100" rx="60" ry="55" fill="#FFFFFF" />
          
          {/* 眼睛 */}
          <g>
            {/* 左眼 */}
            <ellipse cx="75" cy="95" rx="26" ry="28" fill="#333333" />
            <ellipse cx="80" cy="88" rx="8" ry="10" fill="#FFFFFF" />
            <circle cx="72" cy="98" r="3" fill="#FFFFFF" opacity="0.5" />
            
            {/* 右眼 */}
            <ellipse cx="125" cy="95" rx="26" ry="28" fill="#333333" />
            <ellipse cx="130" cy="88" rx="8" ry="10" fill="#FFFFFF" />
            <circle cx="122" cy="98" r="3" fill="#FFFFFF" opacity="0.5" />
          </g>

          {/* 护目镜 */}
          <g>
            <rect x="40" y="80" width="120" height="35" rx="8" fill="#2D2D2D" />
            <rect x="42" y="82" width="116" height="31" rx="6" fill="#4A4A4A" />
            <line x1="100" y1="82" x2="100" y2="113" stroke="#2D2D2D" strokeWidth="4" />
            <circle cx="100" cy="97" r="4" fill="#FFD700" />
          </g>

          {/* 嘴巴 */}
          {renderMouth(state, 100, 140)}

          {/* 工装裤 */}
          <rect x="55" y="200" width="90" height="50" rx="10" fill="#0074D9" />
          <rect x="70" y="200" width="60" height="15" fill="#005A9E" />
          
          {/* 背带 */}
          <rect x="65" y="180" width="10" height="40" fill="#005A9E" />
          <rect x="125" y="180" width="10" height="40" fill="#005A9E" />

          {/* 手臂 */}
          <ellipse cx="35" cy="175" rx="15" ry="20" fill="#FFD700" />
          <ellipse cx="165" cy="175" rx="15" ry="20" fill="#FFD700" />

          {/* 手套 */}
          <ellipse cx="35" cy="195" rx="12" ry="10" fill="#333333" />
          <ellipse cx="165" cy="195" rx="12" ry="10" fill="#333333" />

          {/* 脚 */}
          <ellipse cx="75" cy="255" rx="20" ry="8" fill="#333333" />
          <ellipse cx="125" cy="255" rx="20" ry="8" fill="#333333" />

          {/* 头发 */}
          <path
            d={`M ${95 - 10 * scale} ${30} Q 100 ${10 * scale} ${105 + 10 * scale} ${30}`}
            stroke="#333333"
            strokeWidth={3 * scale}
            fill="none"
          />

          {/* 渐变定义 */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE44D" />
              <stop offset="100%" stopColor="#E6C200" />
            </linearGradient>
          </defs>
        </svg>

        {/* 状态图标 */}
        <div
          className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
          style={{
            backgroundColor: stateColors[state],
            boxShadow: `0 0 20px ${stateColors[state]}80`,
          }}
        >
          {stateIcons[state]}
        </div>

        {/* 状态光环 */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl -z-10"
          style={{
            background: stateColors[state],
            transform: 'scale(1.2)',
          }}
        />
      </motion.div>

      {/* 对话气泡 */}
      <AnimatePresence>
        {showSpeechBubble && speechText && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mt-6 max-w-lg w-full"
          >
            <div
              className="relative rounded-2xl px-6 py-4 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #252540 0%, #1A1A2E 100%)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
              }}
            >
              {/* 气泡顶部箭头 */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderBottom: '12px solid #1A1A2E',
                }}
              />

              <p className="text-white text-base whitespace-pre-wrap leading-relaxed">
                {displayText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block ml-1"
                  >
                    |
                  </motion.span>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 状态文字 */}
      {showStatus && !speechText && (
        <motion.div
          key={state}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 flex items-center gap-2"
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: stateColors[state] }}
          />
          <span className="text-sm font-medium" style={{ color: stateColors[state] }}>
            {stateLabels[state]}
          </span>
        </motion.div>
      )}
    </div>
  );
};

// 渲染嘴巴
function renderMouth(state: MinionState, cx: number, cy: number): React.ReactNode {
  const mouthPaths: Record<MinionState, string> = {
    idle: `M ${cx - 15} ${cy} Q ${cx} ${cy + 8} ${cx + 15} ${cy}`,
    listening: `M ${cx - 12} ${cy} Q ${cx} ${cy + 5} ${cx + 12} ${cy}`,
    thinking: `M ${cx - 8} ${cy + 5} L ${cx + 8} ${cy + 5}`,
    working: `M ${cx - 12} ${cy} Q ${cx} ${cy + 10} ${cx + 12} ${cy}`,
    speaking: `M ${cx - 18} ${cy} Q ${cx} ${cy + 15} ${cx + 18} ${cy}`,
    happy: `M ${cx - 18} ${cy - 4} Q ${cx} ${cy + 15} ${cx + 18} ${cy - 4}`,
    worried: `M ${cx - 12} ${cy + 8} Q ${cx} ${cy} ${cx + 12} ${cy + 8}`,
    excited: `M ${cx - 20} ${cy - 4} Q ${cx} ${cy + 20} ${cx + 20} ${cy - 4}`,
    sleeping: `M ${cx - 10} ${cy + 3} L ${cx + 10} ${cy + 3}`,
    success: `M ${cx - 15} ${cy - 3} Q ${cx} ${cy + 12} ${cx + 15} ${cy - 3}`,
    error: `M ${cx - 12} ${cy + 8} Q ${cx} ${cy} ${cx + 12} ${cy + 8}`,
  };

  return (
    <path
      d={mouthPaths[state]}
      stroke="#333333"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  );
}

export default MinionHero;
