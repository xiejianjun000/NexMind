# MARVIS办公室模块深度分析 vs NexMind智能体动画实现方案

## 📅 分析日期
2026-05-22

---

## 一、MARVIS办公室模块概述

### 1.1 产品特色

> **"交互界面是虚拟办公室，多个Agent(智能体)各司其职，工作时'搬砖'，空闲时会打盹、健身甚至'上厕所'，拟人化设计大幅降低科技产品的冰冷感。"**

MARVIS的办公室模块是一个**虚拟办公室界面**，将AI智能体拟人化，让它们像真实员工一样工作、休息、娱乐。

### 1.2 6个AI智能体

根据信息，MARVIS本地部署了**6个AI智能体**，覆盖以下场景：

| 序号 | 智能体 | 功能 | 工作场景 |
|------|--------|------|---------|
| 1 | 📁 文件管理员 | 文件搜索、整理、归类 | 文件柜 |
| 2 | ⚙️ 系统操控师 | 系统设置、应用控制 | 电脑前 |
| 3 | 📚 知识库管理员 | 文档检索、问答 | 书架前 |
| 4 | 🖼️ 图片整理师 | 图片分类、美化 | 相册前 |
| 5 | 📊 数据分析师 | 数据处理、报表 | 办公桌前 |
| 6 | 🔍 全能助手 | 综合任务协调 | 办公室中央 |

### 1.3 核心设计理念

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                    🏢 虚拟办公室                        │
│                                                        │
│    ┌────────┐  ┌────────┐  ┌────────┐              │
│    │ 📁文件 │  │ ⚙️系统 │  │ 📚知识 │              │
│    │ 管理员 │  │ 操控师  │  │ 管理员  │              │
│    └────────┘  └────────┘  └────────┘              │
│                                                        │
│    ┌────────┐  ┌────────┐  ┌────────┐              │
│    │ 🖼️图片 │  │ 📊数据 │  │ 🔍全能 │              │
│    │ 整理师  │  │ 分析师  │  │ 助手   │              │
│    └────────┘  └────────┘  └────────┘              │
│                                                        │
│    工作状态：搬砖🧱  休息状态：打盹💤  健身🏃  上厕所🚽  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 二、每个智能体详细分析

### 2.1 📁 文件管理员（File Agent）

**职责**：
- 文件搜索（文件名、内容）
- 文件整理归类
- 文件移动、复制、删除
- 文件备份

**动画状态**：

```typescript
// File Agent 动画状态
const FileAgentAnimations = {
  idle: "standing",        // 站立等待
  searching: "looking",     // 查找文件
  organizing: "sorting",   // 整理文件
  moving: "carrying",      // 搬运文件
  resting: "dozing",       // 打盹
  exercising: "stretching", // 伸展运动
};

// 工作动画
const fileAgentWorkAnimations = {
  search: "🔍",      // 搜索（眼睛放大镜）
  organize: "📂",    // 整理（打开文件夹）
  move: "📦",        // 移动（搬运箱子）
  copy: "📋",        // 复制（复制图标）
};
```

**视觉设计**：
```
      📁
     ┌─┴─┐
     │ 👤 │
     │ ▓▓ │
     └────┘
    
工作状态：
📁🔍 文件管理员正在搜索...
📁📂 文件管理员正在整理...
📁📦 文件管理员正在搬运...
```

### 2.2 ⚙️ 系统操控师（System Agent）

**职责**：
- 应用启动/关闭
- 系统设置调整
- 系统监控
- 权限管理

**动画状态**：

```typescript
// System Agent 动画状态
const SystemAgentAnimations = {
  idle: "monitoring",      // 监控状态
  launching: "clicking",    // 点击启动
  configuring: "adjusting", // 调整设置
  monitoring: "watching",   // 观察系统
  resting: "napping",       // 小憩
  exercising: "running",    // 跑步
};

// 工作动画
const systemAgentWorkAnimations = {
  launch: "🚀",       // 发射火箭
  close: "🛑",       // 停止按钮
  configure: "⚙️",   // 齿轮转动
  monitor: "📊",     // 仪表盘
};
```

**视觉设计**：
```
      ⚙️
     ┌─┴─┐
     │ 👤 │
     │ ▓▓ │
     └────┘
    
工作状态：
⚙️🚀 系统操控师正在启动应用...
⚙️⚙️ 系统操控师正在调整设置...
⚙️📊 系统操控师正在监控系统...
```

### 2.3 📚 知识库管理员（Knowledge Agent）

**职责**：
- 文档检索
- 知识问答
- 文档摘要
- 文档生成

**动画状态**：

```typescript
// Knowledge Agent 动画状态
const KnowledgeAgentAnimations = {
  idle: "reading",          // 阅读
  searching: "flipping",     // 翻书
  answering: "explaining",   // 讲解
  writing: "typing",         // 打字
  resting: "sleeping",       // 睡觉
  exercising: "dancing",     // 跳舞
};

// 工作动画
const knowledgeAgentWorkAnimations = {
  search: "📖",       // 翻书
  answer: "💬",      // 对话气泡
  summarize: "📝",   // 做笔记
  generate: "✍️",    // 写字
};
```

**视觉设计**：
```
      📚
     ┌─┴─┐
     │ 👤 │
     │ ▓▓ │
     └────┘
    
工作状态：
📚📖 知识库管理员正在检索...
📚💬 知识库管理员正在回答...
📚📝 知识库管理员正在总结...
```

### 2.4 🖼️ 图片整理师（Image Agent）

**职责**：
- 图片分类
- 图片美化
- 相册管理
- 图片搜索

**动画状态**：

```typescript
// Image Agent 动画状态
const ImageAgentAnimations = {
  idle: "viewing",          // 欣赏
  sorting: "arranging",      // 排列
  editing: "painting",       // 编辑
  categorizing: "labeling",  // 标记
  resting: "dozing",         // 打盹
  exercising: "yoga",        // 瑜伽
};

// 工作动画
const imageAgentWorkAnimations = {
  sort: "🖼️",      // 相册
  edit: "🎨",      // 调色板
  categorize: "🏷️", // 标签
  search: "🔍",    // 放大镜
};
```

**视觉设计**：
```
      🖼️
     ┌─┴─┐
     │ 👤 │
     │ ▓▓ │
     └────┘
    
工作状态：
🖼️🎨 图片整理师正在美化图片...
🖼️🏷️ 图片整理师正在分类...
🖼️🔍 图片整理师正在搜索...
```

### 2.5 📊 数据分析师（Data Agent）

**职责**：
- 数据处理
- 报表生成
- 数据可视化
- 趋势分析

**动画状态**：

```typescript
// Data Agent 动画状态
const DataAgentAnimations = {
  idle: "calculating",      // 计算
  processing: "analyzing",   // 分析
  visualizing: "charting",   // 制图
  reporting: "writing",       // 写报告
  resting: "napping",        // 小憩
  exercising: "walking",      // 散步
};

// 工作动画
const dataAgentWorkAnimations = {
  process: "📊",      // 图表
  visualize: "📈",    // 趋势图
  report: "📋",       // 报告
  analyze: "🔬",      // 分析
};
```

**视觉设计**：
```
      📊
     ┌─┴─┐
     │ 👤 │
     │ ▓▓ │
     └────┘
    
工作状态：
📊📈 数据分析师正在分析...
📊📊 数据分析师正在生成报表...
📊🔬 数据分析师正在处理数据...
```

### 2.6 🔍 全能助手（General Agent）

**职责**：
- 任务协调
- 多智能体调度
- 用户交互
- 异常处理

**动画状态**：

```typescript
// General Agent 动画状态
const GeneralAgentAnimations = {
  idle: "observing",         // 观察
  coordinating: "directing",  // 指挥
  communicating: "talking",   // 对话
  problemSolving: "thinking", // 思考
  resting: "relaxing",       // 放松
  exercising: "stretching",   // 伸展
};

// 工作动画
const generalAgentWorkAnimations = {
  coordinate: "🎯",      // 目标
  communicate: "💬",     // 对话
  solve: "🧩",          // 拼图
  monitor: "👁️",        // 观察
};
```

**视觉设计**：
```
      🔍
     ┌─┴─┐
     │ 👤 │
     │ ▓▓ │
     └────┘
    
工作状态：
🔍🎯 全能助手正在协调任务...
🔍💬 全能助手正在与用户对话...
🔍🧩 全能助手正在解决问题...
```

---

## 三、智能体动画系统设计

### 3.1 动画状态机

```typescript
// 智能体动画状态机
interface AgentStateMachine {
  currentState: AgentState;
  previousState: AgentState;
  stateStartTime: Date;
  isAnimating: boolean;
}

enum AgentState {
  // 工作状态
  IDLE = "idle",           // 空闲
  WORKING = "working",      // 工作中
  THINKING = "thinking",    // 思考中
  COMMUNICATING = "communicating", // 沟通中
  
  // 休息状态
  DOZING = "dozing",        // 打盹
  SLEEPING = "sleeping",    // 睡觉
  EXERCISING = "exercising", // 健身
  RELAXING = "relaxing",    // 放松
  EATING = "eating",        // 吃饭
  BATHROOM = "bathroom",    // 上厕所
  
  // 特殊状态
  ERROR = "error",          // 错误
  SUCCESS = "success",      // 成功
  URGENT = "urgent",       // 紧急
}

// 状态转换规则
const stateTransitions: Record<AgentState, AgentState[]> = {
  [AgentState.IDLE]: [AgentState.WORKING, AgentState.DOZING],
  [AgentState.WORKING]: [AgentState.IDLE, AgentState.ERROR, AgentState.SUCCESS],
  [AgentState.DOZING]: [AgentState.EXERCISING, AgentState.IDLE],
  [AgentState.EXERCISING]: [AgentState.BATHROOM, AgentState.RELAXING],
  [AgentState.RELAXING]: [AgentState.IDLE],
  [AgentState.ERROR]: [AgentState.WORKING],
  [AgentState.SUCCESS]: [AgentState.IDLE, AgentState.RELAXING],
};
```

### 3.2 动画类型定义

```typescript
// 动画类型
interface AgentAnimation {
  id: string;
  name: string;
  type: AnimationType;
  frames: AnimationFrame[];
  duration: number;  // ms
  loop: boolean;
  soundEffect?: string;
}

enum AnimationType {
  IDLE = "idle",           // 待机动画
  WORK = "work",           // 工作动画
  REST = "rest",           // 休息动画
  TRANSITION = "transition", // 过渡动画
  EMOTION = "emotion",     // 情感动画
  EFFECT = "effect",        // 特效动画
}

// 具体动画定义
const agentAnimations = {
  // 待机动画
  idleBreathe: {
    type: AnimationType.IDLE,
    frames: [
      { pose: "stand", duration: 1000 },
      { pose: "breathe", duration: 500 },
    ],
    loop: true,
  },
  
  // 工作动画
  workTyping: {
    type: AnimationType.WORK,
    frames: [
      { pose: "sit", duration: 200 },
      { pose: "type1", duration: 100 },
      { pose: "type2", duration: 100 },
    ],
    loop: true,
  },
  
  // 休息动画
  restDozing: {
    type: AnimationType.REST,
    frames: [
      { pose: "sit", duration: 2000 },
      { pose: "nod", duration: 500 },
    ],
    loop: true,
  },
  
  // 健身动画
  exerciseStretching: {
    type: AnimationType.REST,
    frames: [
      { pose: "stand", duration: 500 },
      { pose: "stretch", duration: 1000 },
      { pose: "relax", duration: 500 },
    ],
    loop: true,
  },
};
```

### 3.3 情感系统

```typescript
// 情感状态
interface AgentEmotion {
  type: EmotionType;
  intensity: number;  // 0-100
  duration: number;   // ms
  expression: string; // 表情emoji
}

enum EmotionType {
  HAPPY = "happy",        // 开心
  SAD = "sad",            // 难过
  EXCITED = "excited",    // 兴奋
  WORRIED = "worried",    // 担忧
  CONFIDENT = "confident", // 自信
  TIRED = "tired",        // 疲惫
  FOCUSED = "focused",    // 专注
  BORED = "bored",        // 无聊
}

// 情感映射
const emotionMapping: Record<EmotionType, string> = {
  [EmotionType.HAPPY]: "😊",
  [EmotionType.SAD]: "😢",
  [EmotionType.EXCITED]: "🤩",
  [EmotionType.WORRIED]: "😟",
  [EmotionType.CONFIDENT]: "😎",
  [EmotionType.TIRED]: "😴",
  [EmotionType.FOCUSED]: "🤔",
  [EmotionType.BORED]: "😐",
};

// 情感触发
const emotionTriggers = {
  [AgentState.WORKING]: EmotionType.FOCUSED,
  [AgentState.SUCCESS]: EmotionType.HAPPY,
  [AgentState.ERROR]: EmotionType.WORRIED,
  [AgentState.DOZING]: EmotionType.TIRED,
  [AgentState.EXERCISING]: EmotionType.EXCITED,
};
```

---

## 四、NexMind智能体动画实现方案

### 4.1 整体架构

```typescript
// NexMind智能体动画系统
interface NexMindAgentSystem {
  // 智能体管理器
  agentManager: AgentManager;
  
  // 动画引擎
  animationEngine: AnimationEngine;
  
  // 情感系统
  emotionSystem: EmotionSystem;
  
  // 物理引擎（可选）
  physicsEngine?: PhysicsEngine;
}
```

### 4.2 组件结构

```
src/frontend/
├── components/
│   ├── Agents/
│   │   ├── AgentBase.tsx          # 智能体基类
│   │   ├── FileAgent.tsx          # 文件管理员
│   │   ├── SystemAgent.tsx        # 系统操控师
│   │   ├── KnowledgeAgent.tsx     # 知识库管理员
│   │   ├── ImageAgent.tsx         # 图片整理师
│   │   ├── DataAgent.tsx          # 数据分析师
│   │   ├── GeneralAgent.tsx       # 全能助手
│   │   └── AgentContainer.tsx     # 智能体容器
│   │
│   ├── Office/
│   │   ├── OfficeScene.tsx        # 办公室场景
│   │   ├── OfficeBackground.tsx    # 背景
│   │   ├── AgentDesk.tsx          # 工位
│   │   └── OfficeDecoration.tsx   # 装饰
│   │
│   └── Animation/
│       ├── AnimationController.tsx  # 动画控制器
│       ├── AnimationPlayer.tsx     # 动画播放器
│       └── EffectSystem.tsx        # 特效系统
│
├── hooks/
│   ├── useAgentAnimation.ts        # 智能体动画Hook
│   ├── useEmotionSystem.ts        # 情感Hook
│   └── useOfficeEnvironment.ts    # 环境Hook
│
└── stores/
    └── agentStore.ts              # 智能体状态管理
```

### 4.3 智能体基类实现

```tsx
// AgentBase.tsx - 智能体基类
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentState, AgentEmotion, EmotionType } from './types';

interface AgentBaseProps {
  id: string;
  name: string;
  icon: string;
  currentState: AgentState;
  emotion: AgentEmotion;
  position: { x: number; y: number };
  onStateChange?: (state: AgentState) => void;
}

const AgentBase: React.FC<AgentBaseProps> = ({
  id,
  name,
  icon,
  currentState,
  emotion,
  position,
  onStateChange,
}) => {
  const [animation, setAnimation] = useState('idle');
  const [pose, setPose] = useState('stand');

  // 状态变化时更新动画
  useEffect(() => {
    const newAnimation = getAnimationForState(currentState);
    setAnimation(newAnimation);
  }, [currentState]);

  return (
    <motion.div
      className="absolute"
      style={{ left: position.x, top: position.y }}
      animate={getMotionVariant(animation)}
      onClick={() => onStateChange?.(currentState)}
    >
      {/* 智能体主体 */}
      <div className="relative">
        {/* 身体 */}
        <motion.div
          className="w-16 h-20 bg-yellow-400 rounded-lg"
          animate={getBodyAnimation(animation)}
        >
          {/* 头部 */}
          <div className="w-full h-10 bg-yellow-300 rounded-t-lg flex items-center justify-center">
            {/* 眼睛 */}
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-gray-800 rounded-full" />
              <div className="w-3 h-3 bg-gray-800 rounded-full" />
            </div>
          </div>
          
          {/* 身体 */}
          <div className="w-full h-10 bg-blue-500 flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
          </div>
        </motion.div>

        {/* 表情覆盖 */}
        <div className="absolute -top-2 -right-2 text-2xl">
          {getEmotionEmoji(emotion.type)}
        </div>

        {/* 状态指示 */}
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-xs bg-gray-800 px-2 py-1 rounded">
            {getStateLabel(currentState)}
          </span>
        </div>

        {/* 工作特效 */}
        <AnimatePresence>
          {currentState === AgentState.WORKING && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -10 }}
              exit={{ opacity: 0, y: 0 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2"
            >
              {icon}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// 获取状态对应动画
function getAnimationForState(state: AgentState): string {
  const mapping = {
    [AgentState.IDLE]: 'idle',
    [AgentState.WORKING]: 'working',
    [AgentState.THINKING]: 'thinking',
    [AgentState.DOZING]: 'dozing',
    [AgentState.EXERCISING]: 'exercising',
    [AgentState.ERROR]: 'error',
    [AgentState.SUCCESS]: 'success',
  };
  return mapping[state] || 'idle';
}

// 获取Framer Motion动画变量
function getMotionVariant(animation: string) {
  const variants = {
    idle: {
      y: [0, -2, 0],
      transition: { duration: 2, repeat: Infinity },
    },
    working: {
      y: [0, -5, 0, 2, 0],
      transition: { duration: 0.5, repeat: Infinity },
    },
    thinking: {
      x: [0, -2, 2, -2, 0],
      transition: { duration: 0.3, repeat: Infinity },
    },
    dozing: {
      y: [0, -1, 0],
      rotate: [0, -2, 2, 0],
      transition: { duration: 3, repeat: Infinity },
    },
    exercising: {
      y: [0, -10, 0, -5, 0],
      transition: { duration: 0.4, repeat: Infinity },
    },
  };
  return variants[animation] || variants.idle;
}

// 获取表情emoji
function getEmotionEmoji(emotion: EmotionType): string {
  const mapping = {
    [EmotionType.HAPPY]: '😊',
    [EmotionType.SAD]: '😢',
    [EmotionType.EXCITED]: '🤩',
    [EmotionType.WORRIED]: '😟',
    [EmotionType.CONFIDENT]: '😎',
    [EmotionType.TIRED]: '😴',
    [EmotionType.FOCUSED]: '🤔',
    [EmotionType.BORED]: '😐',
  };
  return mapping[emotion] || '😊';
}

// 获取状态标签
function getStateLabel(state: AgentState): string {
  const labels = {
    [AgentState.IDLE]: '空闲',
    [AgentState.WORKING]: '工作中',
    [AgentState.THINKING]: '思考中',
    [AgentState.DOZING]: '打盹',
    [AgentState.EXERCISING]: '健身',
    [AgentState.ERROR]: '错误',
    [AgentState.SUCCESS]: '成功',
  };
  return labels[state] || '空闲';
}
```

### 4.4 具体智能体实现

#### 文件管理员

```tsx
// FileAgent.tsx
import React from 'react';
import AgentBase from './AgentBase';

const FileAgent: React.FC<AgentProps> = (props) => {
  const workIcons = ['📁', '🔍', '📂', '📦'];
  const [currentWorkIcon, setCurrentWorkIcon] = React.useState(0);

  // 工作时循环显示不同图标
  useEffect(() => {
    if (props.currentState === AgentState.WORKING) {
      const interval = setInterval(() => {
        setCurrentWorkIcon((prev) => (prev + 1) % workIcons.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [props.currentState]);

  return (
    <AgentBase
      {...props}
      name="文件管理员"
      icon={props.currentState === AgentState.WORKING ? workIcons[currentWorkIcon] : '📁'}
    />
  );
};
```

#### 系统操控师

```tsx
// SystemAgent.tsx
import React from 'react';
import AgentBase from './AgentBase';

const SystemAgent: React.FC<AgentProps> = (props) => {
  const workIcons = ['🚀', '⚙️', '📊', '🖥️'];
  
  return (
    <AgentBase
      {...props}
      name="系统操控师"
      icon={props.currentState === AgentState.WORKING ? workIcons[0] : '⚙️'}
    />
  );
};
```

#### 知识库管理员

```tsx
// KnowledgeAgent.tsx
import React from 'react';
import AgentBase from './AgentBase';

const KnowledgeAgent: React.FC<AgentProps> = (props) => {
  return (
    <AgentBase
      {...props}
      name="知识库管理员"
      icon={props.currentState === AgentState.WORKING ? '📚' : '📚'}
    />
  );
};
```

#### 图片整理师

```tsx
// ImageAgent.tsx
import React from 'react';
import AgentBase from './AgentBase';

const ImageAgent: React.FC<AgentProps> = (props) => {
  return (
    <AgentBase
      {...props}
      name="图片整理师"
      icon={props.currentState === AgentState.WORKING ? '🖼️' : '🖼️'}
    />
  );
};
```

#### 数据分析师

```tsx
// DataAgent.tsx
import React from 'react';
import AgentBase from './AgentBase';

const DataAgent: React.FC<AgentProps> = (props) => {
  return (
    <AgentBase
      {...props}
      name="数据分析师"
      icon={props.currentState === AgentState.WORKING ? '📊' : '📊'}
    />
  );
};
```

#### 全能助手

```tsx
// GeneralAgent.tsx
import React from 'react';
import AgentBase from './AgentBase';

const GeneralAgent: React.FC<AgentProps> = (props) => {
  return (
    <AgentBase
      {...props}
      name="全能助手"
      icon={props.currentState === AgentState.WORKING ? '🔍' : '🔍'}
    />
  );
};
```

### 4.5 办公室场景

```tsx
// OfficeScene.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FileAgent from '../Agents/FileAgent';
import SystemAgent from '../Agents/SystemAgent';
import KnowledgeAgent from '../Agents/KnowledgeAgent';
import ImageAgent from '../Agents/ImageAgent';
import DataAgent from '../Agents/DataAgent';
import GeneralAgent from '../Agents/GeneralAgent';
import { AgentState, AgentEmotion, EmotionType } from '../Agents/types';

const OfficeScene: React.FC = () => {
  const [agents, setAgents] = useState([
    {
      id: 'file',
      component: FileAgent,
      position: { x: 50, y: 100 },
      state: AgentState.IDLE,
      emotion: { type: EmotionType.HAPPY, intensity: 50 },
    },
    // ... 其他智能体
  ]);

  // 模拟智能体状态变化
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        state: Math.random() > 0.7 ? AgentState.WORKING : AgentState.IDLE,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-100 to-blue-50 overflow-hidden">
      {/* 办公室背景 */}
      <OfficeBackground />
      
      {/* 地板 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-brown-800" />
      
      {/* 智能体们 */}
      <div className="absolute inset-0">
        {agents.map(agent => (
          <agent.component
            key={agent.id}
            {...agent}
          />
        ))}
      </div>
      
      {/* 环境装饰 */}
      <OfficeDecoration />
    </div>
  );
};

export default OfficeScene;
```

### 4.6 动画控制器

```tsx
// AnimationController.tsx
import React, { createContext, useContext, useReducer } from 'react';
import { AgentState, AgentEmotion } from '../Agents/types';

interface AnimationState {
  globalSpeed: number;      // 全局速度
  isPaused: boolean;        // 是否暂停
  currentTime: number;       // 当前时间
  agents: Map<string, {
    state: AgentState;
    emotion: AgentEmotion;
    animation: string;
  }>;
}

type AnimationAction =
  | { type: 'SET_AGENT_STATE'; agentId: string; state: AgentState }
  | { type: 'SET_AGENT_EMOTION'; agentId: string; emotion: AgentEmotion }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SET_SPEED'; speed: number };

const AnimationContext = createContext<{
  state: AnimationState;
  dispatch: React.Dispatch<AnimationAction>;
} | null>(null);

export const AnimationProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(animationReducer, initialState);

  return (
    <AnimationContext.Provider value={{ state, dispatch }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
};
```

---

## 五、动画效果库

### 5.1 基础动画

```typescript
// animations/basic.ts
export const basicAnimations = {
  // 待机动画
  idle: {
    breathe: {
      keyframes: [
        { scale: 1, y: 0 },
        { scale: 1.02, y: -2 },
        { scale: 1, y: 0 },
      ],
      duration: 2000,
    },
    stand: {
      keyframes: [
        { y: 0 },
        { y: -1 },
        { y: 0 },
      ],
      duration: 3000,
    },
  },

  // 工作动画
  work: {
    typing: {
      keyframes: [
        { y: 0, rotate: 0 },
        { y: -5, rotate: -2 },
        { y: 0, rotate: 2 },
      ],
      duration: 200,
    },
    searching: {
      keyframes: [
        { x: 0, scale: 1 },
        { x: -3, scale: 1.1 },
        { x: 0, scale: 1 },
        { x: 3, scale: 1.1 },
        { x: 0, scale: 1 },
      ],
      duration: 500,
    },
  },

  // 休息动画
  rest: {
    dozing: {
      keyframes: [
        { y: 0, rotate: 0 },
        { y: -1, rotate: -3 },
        { y: 0, rotate: 0 },
        { y: -1, rotate: 3 },
        { y: 0, rotate: 0 },
      ],
      duration: 3000,
    },
    stretching: {
      keyframes: [
        { scale: 1, y: 0 },
        { scale: 1.2, y: -10 },
        { scale: 1, y: 0 },
      ],
      duration: 1000,
    },
  },
};
```

### 5.2 特效动画

```typescript
// animations/effects.ts
export const effectAnimations = {
  // 工作特效
  workEffect: {
    typing: "💻",
    searching: "🔍",
    organizing: "📂",
    processing: "⚙️",
  },

  // 休息特效
  restEffect: {
    dozing: "💤",
    sleeping: "😴",
    exercising: "🏃",
    eating: "🍔",
    bathroom: "🚽",
  },

  // 情感特效
  emotionEffect: {
    happy: "✨",
    sad: "💧",
    excited: "🎉",
    worried: "❓",
  },
};
```

### 5.3 过渡动画

```typescript
// animations/transitions.ts
export const transitionAnimations = {
  // 状态切换
  stateChange: {
    duration: 300,
    easing: "easeInOut",
  },

  // 表情变化
  emotionChange: {
    duration: 200,
    easing: "easeOut",
  },

  // 位置移动
  positionChange: {
    duration: 500,
    easing: "easeInOutQuad",
  },

  // 大小变化
  scaleChange: {
    duration: 200,
    easing: "easeOutBack",
  },
};
```

---

## 六、性能优化

### 6.1 动画优化策略

```typescript
// 优化1: 使用will-change
const optimizedStyle = {
  willChange: 'transform, opacity',
  transform: 'translateZ(0)', // GPU加速
};

// 优化2: 批量更新
const batchUpdate = () => {
  ReactDOM.unstable_batchedUpdates(() => {
    setAgents(updatedAgents);
  });
};

// 优化3: 使用useMemo缓存动画
const cachedAnimation = useMemo(() => 
  calculateAnimation(state), 
  [state]
);

// 优化4: 控制动画数量
const maxConcurrentAnimations = 6;
```

### 6.2 帧率控制

```typescript
// 帧率控制
const useFrameRate = (targetFPS: number = 60) => {
  const frameInterval = 1000 / targetFPS;
  const lastFrameTime = useRef(0);

  const shouldRender = (currentTime: number) => {
    if (currentTime - lastFrameTime.current >= frameInterval) {
      lastFrameTime.current = currentTime;
      return true;
    }
    return false;
  };

  return shouldRender;
};
```

### 6.3 懒加载

```typescript
// 智能体懒加载
const LazyAgent = React.lazy(() => import('./AgentBase'));

// 使用Suspense
<Suspense fallback={<AgentSkeleton />}>
  <LazyAgent {...props} />
</Suspense>
```

---

## 七、用户交互

### 7.1 点击智能体

```tsx
// 点击智能体显示详情
const handleAgentClick = (agent: Agent) => {
  setSelectedAgent(agent);
  showAgentDetailModal(agent);
};
```

### 7.2 拖拽智能体

```tsx
// 拖拽智能体到工位
const handleDragEnd = (agentId: string, position: Position) => {
  updateAgentPosition(agentId, position);
};
```

### 7.3 查看工作状态

```tsx
// 双击查看详细工作状态
const handleAgentDoubleClick = (agent: Agent) => {
  showWorkHistory(agent);
};
```

---

## 八、总结

### 8.1 实现要点

✅ **状态机设计**: 清晰的状态转换规则  
✅ **动画系统**: 模块化的动画定义  
✅ **情感系统**: 丰富的情感反馈  
✅ **组件化**: 智能体基类+具体实现  
✅ **性能优化**: 批量更新+懒加载  

### 8.2 技术栈

- **动画库**: Framer Motion
- **状态管理**: React Context + useReducer
- **渲染**: React + SVG
- **特效**: CSS Animations

### 8.3 创新点

⭐ **虚拟办公室**: 将AI拟人化，工作休息分明  
⭐ **状态驱动动画**: 根据状态自动切换动画  
⭐ **情感系统**: 丰富的情感表达  
⭐ **交互设计**: 点击、拖拽、双击等交互  

---

**文档版本**: v1.0  
**分析日期**: 2026-05-22  
**下一步**: 实现具体的智能体组件和动画
