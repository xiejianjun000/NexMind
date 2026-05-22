// MinionAvatar - 小黄人Avatar组件
// SVG绘制的小黄人，支持多种状态和动画

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MinionState,
  MinionAvatarProps,
  MinionExpressions,
  MinionDescriptions,
  MinionSizes,
  MinionAnimation,
  MinionAnimations,
} from './MinionTypes';

const MinionAvatar: React.FC<MinionAvatarProps> = ({
  state = MinionState.IDLE,
  size = 'large',
  showSpeechBubble = true,
  speechText = '',
  showStatus = true,
  className = '',
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const dimension = MinionSizes[size];
  const animation = MinionAnimations[state];

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
      }, 50); // 每50ms打一个字

      return () => clearInterval(interval);
    }
  }, [speechText, showSpeechBubble]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 小黄人Avatar */}
      <motion.div
        animate={getAnimation(animation)}
        className="relative"
        style={{ width: dimension, height: dimension * 1.2 }}
      >
        {/* 小黄人SVG */}
        <svg
          width={dimension}
          height={dimension * 1.2}
          viewBox="0 0 100 120"
          className="drop-shadow-lg"
        >
          {/* 身体 */}
          <ellipse
            cx="50"
            cy="75"
            rx="30"
            ry="40"
            fill="#FFD700"
            className="filter drop-shadow"
          />
          
          {/* 眼睛背景（白色） */}
          <ellipse cx="50" cy="45" rx="28" ry="25" fill="#FFFFFF" />
          
          {/* 眼睛 */}
          <g>
            {/* 左眼 */}
            <circle cx="40" cy="45" r="12" fill="#333333" />
            <circle cx="43" cy="42" r="4" fill="#FFFFFF" />
            
            {/* 右眼 */}
            <circle cx="60" cy="45" r="12" fill="#333333" />
            <circle cx="63" cy="42" r="4" fill="#FFFFFF" />
          </g>
          
          {/* 护目镜 */}
          <g>
            <rect x="28" y="35" width="44" height="20" rx="5" fill="#333333" />
            <line x1="50" y1="35" x2="50" y2="55" stroke="#333333" strokeWidth="2" />
          </g>
          
          {/* 嘴巴 */}
          {renderMouth(state, 50, 65)}
          
          {/* 头发 */}
          <path
            d="M 45 20 Q 50 10 55 20"
            stroke="#333333"
            strokeWidth="2"
            fill="none"
          />
          
          {/* 手 */}
          <ellipse cx="20" cy="80" rx="8" ry="10" fill="#FFD700" />
          <ellipse cx="80" cy="80" rx="8" ry="10" fill="#FFD700" />
          
          {/* 脚 */}
          <ellipse cx="35" cy="115" rx="12" ry="5" fill="#333333" />
          <ellipse cx="65" cy="115" rx="12" ry="5" fill="#333333" />
        </svg>

        {/* 表情覆盖层 */}
        <div
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
          style={{ fontSize: dimension * 0.4 }}
        >
          {MinionExpressions[state]}
        </div>

        {/* 状态光环 */}
        <AnimatePresence>
          {state !== MinionState.IDLE && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
            >
              {state === MinionState.WORKING && '⚡'}
              {state === MinionState.THINKING && '💭'}
              {state === MinionState.LISTENING && '👂'}
              {state === MinionState.SPEAKING && '💬'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 气泡对话框 */}
      <AnimatePresence>
        {showSpeechBubble && speechText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 max-w-md"
          >
            <div className="bg-gray-800 rounded-2xl px-4 py-3 relative shadow-lg border border-gray-700">
              {/* 气泡箭头 */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-800" />
              
              <p className="text-white text-sm whitespace-pre-wrap">
                {displayText}
                {isTyping && (
                  <span className="inline-block animate-pulse ml-1">|</span>
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
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-gray-400"
        >
          {MinionDescriptions[state]}
        </motion.div>
      )}
    </div>
  );
};

// 根据状态渲染嘴巴
function renderMouth(state: MinionState, cx: number, cy: number): React.ReactNode {
  const mouthPaths: Record<MinionState, string> = {
    [MinionState.IDLE]: `M ${cx - 8} ${cy} Q ${cx} ${cy + 5} ${cx + 8} ${cy}`,
    [MinionState.LISTENING]: `M ${cx - 8} ${cy} Q ${cx} ${cy + 3} ${cx + 8} ${cy}`,
    [MinionState.THINKING]: `M ${cx - 5} ${cy + 3} L ${cx + 5} ${cy + 3}`,
    [MinionState.SPEAKING]: `M ${cx - 10} ${cy} Q ${cx} ${cy + 10} ${cx + 10} ${cy}`,
    [MinionState.WORKING]: `M ${cx - 8} ${cy} Q ${cx} ${cy + 8} ${cx + 8} ${cy}`,
    [MinionState.HAPPY]: `M ${cx - 10} ${cy - 2} Q ${cx} ${cy + 12} ${cx + 10} ${cy - 2}`,
    [MinionState.WORRIED]: `M ${cx - 8} ${cy + 5} Q ${cx} ${cy} ${cx + 8} ${cy + 5}`,
    [MinionState.EXCITED]: `M ${cx - 12} ${cy - 2} Q ${cx} ${cy + 15} ${cx + 12} ${cy - 2}`,
    [MinionState.ERROR]: `M ${cx - 8} ${cy + 5} Q ${cx} ${cy} ${cx + 8} ${cy + 5}`,
    [MinionState.SUCCESS]: `M ${cx - 10} ${cy - 2} Q ${cx} ${cy + 10} ${cx + 10} ${cy - 2}`,
  };

  return (
    <path
      d={mouthPaths[state]}
      stroke="#333333"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  );
}

// 获取动画
function getAnimation(animation: MinionAnimation) {
  const animations: Record<MinionAnimation, any> = {
    breathe: {
      y: [0, -3, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    bounce: {
      y: [0, -10, 0],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
    },
    shake: {
      x: [0, -3, 3, -3, 3, 0],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
    },
    jump: {
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeOut' },
    },
    wave: {
      rotate: [-5, 5, -5],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
    },
    nod: {
      rotate: [0, -10, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
    },
    dance: {
      y: [0, -15, 0, -10, 0],
      x: [0, 5, 0, -5, 0],
      rotate: [0, 10, -10, 5, 0],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return animations[animation] || animations.breathe;
}

export default MinionAvatar;
