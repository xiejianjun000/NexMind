// 智能体类型定义
// 完整的智能体状态、情感和动画系统

// 智能体状态
export enum AgentState {
  // 工作状态
  IDLE = "idle",                     // 空闲
  WORKING = "working",               // 工作中
  THINKING = "thinking",             // 思考中
  COMMUNICATING = "communicating",   // 沟通中
  
  // 休息状态
  DOZING = "dozing",               // 打盹
  SLEEPING = "sleeping",           // 睡觉
  EXERCISING = "exercising",        // 健身
  RELAXING = "relaxing",            // 放松
  EATING = "eating",               // 吃饭
  BATHROOM = "bathroom",           // 上厕所
  
  // 特殊状态
  ERROR = "error",                 // 错误
  SUCCESS = "success",              // 成功
  URGENT = "urgent",               // 紧急
}

// 情感类型
export enum EmotionType {
  HAPPY = "happy",                 // 开心
  SAD = "sad",                     // 难过
  EXCITED = "excited",             // 兴奋
  WORRIED = "worried",             // 担忧
  CONFIDENT = "confident",         // 自信
  TIRED = "tired",                 // 疲惫
  FOCUSED = "focused",             // 专注
  BORED = "bored",                 // 无聊
  ANGRY = "angry",                 // 生气
  SURPRISED = "surprised",         // 惊讶
}

// 动画类型
export enum AnimationType {
  IDLE = "idle",                   // 待机
  WORK = "work",                   // 工作
  REST = "rest",                   // 休息
  TRANSITION = "transition",        // 过渡
  EMOTION = "emotion",             // 情感
  EFFECT = "effect",                // 特效
}

// 智能体信息
export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
}

// 情感状态
export interface AgentEmotion {
  type: EmotionType;
  intensity: number;  // 0-100
  duration: number;   // ms
}

// 智能体状态信息
export interface AgentStatus {
  state: AgentState;
  emotion: AgentEmotion;
  lastStateChange: Date;
  currentTask?: string;
  progress?: number;  // 0-100
  message?: string;
}

// 动画帧
export interface AnimationFrame {
  timestamp: number;
  pose: string;
  expression: string;
  position?: { x: number; y: number };
}

// 动画配置
export interface AnimationConfig {
  type: AnimationType;
  name: string;
  frames: AnimationFrame[];
  duration: number;
  loop: boolean;
  soundEffect?: string;
}

// 位置
export interface Position {
  x: number;
  y: number;
}

// 6个智能体配置
export const AGENTS_CONFIG: AgentInfo[] = [
  {
    id: 'file',
    name: '文件管理员',
    role: 'File Agent',
    icon: '📁',
    color: '#4CAF50',
    description: '负责文件搜索、整理、归类和备份',
    capabilities: ['文件搜索', '文件整理', '文件归类', '文件备份'],
  },
  {
    id: 'system',
    name: '系统操控师',
    role: 'System Agent',
    icon: '⚙️',
    color: '#2196F3',
    description: '负责系统设置、应用控制和权限管理',
    capabilities: ['应用控制', '系统设置', '权限管理', '系统监控'],
  },
  {
    id: 'knowledge',
    name: '知识库管理员',
    role: 'Knowledge Agent',
    icon: '📚',
    color: '#FF9800',
    description: '负责文档检索、问答和摘要生成',
    capabilities: ['文档检索', '知识问答', '文档摘要', '问答生成'],
  },
  {
    id: 'image',
    name: '图片整理师',
    role: 'Image Agent',
    icon: '🖼️',
    color: '#E91E63',
    description: '负责图片分类、美化和相册管理',
    capabilities: ['图片分类', '图片美化', '相册管理', '图片搜索'],
  },
  {
    id: 'data',
    name: '数据分析师',
    role: 'Data Agent',
    icon: '📊',
    color: '#9C27B0',
    description: '负责数据处理、报表生成和趋势分析',
    capabilities: ['数据处理', '报表生成', '数据可视化', '趋势分析'],
  },
  {
    id: 'general',
    name: '全能助手',
    role: 'General Agent',
    icon: '🔍',
    color: '#00BCD4',
    description: '负责任务协调、多智能体调度和用户交互',
    capabilities: ['任务协调', '多智能体调度', '用户交互', '异常处理'],
  },
];

// 状态到情感的映射
export const STATE_EMOTION_MAP: Record<AgentState, EmotionType> = {
  [AgentState.IDLE]: EmotionType.HAPPY,
  [AgentState.WORKING]: EmotionType.FOCUSED,
  [AgentState.THINKING]: EmotionType.FOCUSED,
  [AgentState.COMMUNICATING]: EmotionType.HAPPY,
  [AgentState.DOZING]: EmotionType.TIRED,
  [AgentState.SLEEPING]: EmotionType.TIRED,
  [AgentState.EXERCISING]: EmotionType.EXCITED,
  [AgentState.RELAXING]: EmotionType.HAPPY,
  [AgentState.EATING]: EmotionType.HAPPY,
  [AgentState.BATHROOM]: EmotionType.RELAXING,
  [AgentState.ERROR]: EmotionType.WORRIED,
  [AgentState.SUCCESS]: EmotionType.EXCITED,
  [AgentState.URGENT]: EmotionType.WORRIED,
};

// 状态中文标签
export const STATE_LABELS: Record<AgentState, string> = {
  [AgentState.IDLE]: '空闲',
  [AgentState.WORKING]: '工作中',
  [AgentState.THINKING]: '思考中',
  [AgentState.COMMUNICATING]: '沟通中',
  [AgentState.DOZING]: '打盹',
  [AgentState.SLEEPING]: '睡觉',
  [AgentState.EXERCISING]: '健身',
  [AgentState.RELAXING]: '放松',
  [AgentState.EATING]: '吃饭',
  [AgentState.BATHROOM]: '休息',
  [AgentState.ERROR]: '错误',
  [AgentState.SUCCESS]: '成功',
  [AgentState.URGENT]: '紧急',
};

// 情感emoji映射
export const EMOTION_EMOJI: Record<EmotionType, string> = {
  [EmotionType.HAPPY]: '😊',
  [EmotionType.SAD]: '😢',
  [EmotionType.EXCITED]: '🤩',
  [EmotionType.WORRIED]: '😟',
  [EmotionType.CONFIDENT]: '😎',
  [EmotionType.TIRED]: '😴',
  [EmotionType.FOCUSED]: '🤔',
  [EmotionType.BORED]: '😐',
  [EmotionType.ANGRY]: '😠',
  [EmotionType.SURPRISED]: '😲',
};

// 状态图标
export const STATE_ICONS: Record<AgentState, string> = {
  [AgentState.IDLE]: '👋',
  [AgentState.WORKING]: '💪',
  [AgentState.THINKING]: '🤔',
  [AgentState.COMMUNICATING]: '💬',
  [AgentState.DOZING]: '💤',
  [AgentState.SLEEPING]: '😴',
  [AgentState.EXERCISING]: '🏃',
  [AgentState.RELAXING]: '☕',
  [AgentState.EATING]: '🍔',
  [AgentState.BATHROOM]: '🚽',
  [AgentState.ERROR]: '❌',
  [AgentState.SUCCESS]: '✅',
  [AgentState.URGENT]: '🚨',
};
