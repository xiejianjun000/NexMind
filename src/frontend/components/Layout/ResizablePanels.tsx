// ResizablePanels - 可拖拽调整大小的面板组件
// 支持水平分隔条拖拽

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ResizablePanelsProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  initialLeftWidth?: number;
  initialRightWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  minCenterWidth?: number;
  maxLeftWidth?: number;
  maxRightWidth?: number;
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  left,
  center,
  right,
  initialLeftWidth = 280,
  initialRightWidth = 320,
  minLeftWidth = 200,
  minRightWidth = 240,
  minCenterWidth = 400,
  maxLeftWidth = 400,
  maxRightWidth = 480,
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [rightWidth, setRightWidth] = useState(initialRightWidth);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理左侧分隔条拖拽
  const handleLeftDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);
  }, []);

  // 处理右侧分隔条拖拽
  const handleRightDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);
  }, []);

  // 处理鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // 左侧分隔条拖拽
      if (isDraggingLeft) {
        const newLeftWidth = e.clientX - containerRect.left;
        const maxPossibleWidth = containerRect.width - minCenterWidth - rightWidth - 8;
        
        if (newLeftWidth >= minLeftWidth && newLeftWidth <= Math.min(maxLeftWidth, maxPossibleWidth)) {
          setLeftWidth(newLeftWidth);
        }
      }
      
      // 右侧分隔条拖拽
      if (isDraggingRight) {
        const newRightWidth = containerRect.right - e.clientX;
        const maxPossibleWidth = containerRect.width - leftWidth - minCenterWidth - 8;
        
        if (newRightWidth >= minRightWidth && newRightWidth <= Math.min(maxRightWidth, maxPossibleWidth)) {
          setRightWidth(newRightWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingLeft, isDraggingRight, leftWidth, rightWidth, minLeftWidth, minRightWidth, minCenterWidth, maxLeftWidth, maxRightWidth]);

  return (
    <div ref={containerRef} className="h-screen flex overflow-hidden">
      {/* 左侧面板 */}
      <motion.div
        style={{ width: leftWidth }}
        className="flex-shrink-0"
        drag={false}
      >
        {left}
      </motion.div>

      {/* 左侧分隔条 */}
      <div
        onMouseDown={handleLeftDividerMouseDown}
        className={`w-2 flex-shrink-0 cursor-col-resize group relative ${
          isDraggingLeft ? 'bg-yellow-500/50' : 'bg-transparent hover:bg-yellow-500/20'
        } transition-colors`}
      >
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-slate-700 group-hover:bg-yellow-500 transition-colors rounded-full" />
        
        {/* 拖拽时的视觉反馈 */}
        {isDraggingLeft && (
          <div className="absolute inset-0 bg-yellow-500/10 animate-pulse" />
        )}
        
        {/* 拖拽提示 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            拖拽调整宽度
          </div>
        </div>
      </div>

      {/* 中间面板 */}
      <div className="flex-1 min-w-0">
        {center}
      </div>

      {/* 右侧分隔条 */}
      <div
        onMouseDown={handleRightDividerMouseDown}
        className={`w-2 flex-shrink-0 cursor-col-resize group relative ${
          isDraggingRight ? 'bg-yellow-500/50' : 'bg-transparent hover:bg-yellow-500/20'
        } transition-colors`}
      >
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-slate-700 group-hover:bg-yellow-500 transition-colors rounded-full" />
        
        {/* 拖拽时的视觉反馈 */}
        {isDraggingRight && (
          <div className="absolute inset-0 bg-yellow-500/10 animate-pulse" />
        )}
        
        {/* 拖拽提示 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            拖拽调整宽度
          </div>
        </div>
      </div>

      {/* 右侧面板 */}
      <motion.div
        style={{ width: rightWidth }}
        className="flex-shrink-0"
        drag={false}
      >
        {right}
      </motion.div>
    </div>
  );
};

export default ResizablePanels;
