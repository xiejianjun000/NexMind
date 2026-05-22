// 小黄人状态枚举
export enum MinionState {
  IDLE = "idle",              // 空闲等待
  LISTENING = "listening",    // 聆听中
  THINKING = "thinking",       // 思考中
  SPEAKING = "speaking",       // 说话中
  WORKING = "working",         // 工作中
  HAPPY = "happy",           // 开心
  WORRIED = "worried",       // 担忧
  EXCITED = "excited",       // 兴奋
  ERROR = "error",           // 错误
  SUCCESS = "success",        // 成功
}

// 小黄人表情映射
export const MinionExpressions: Record<MinionState, string> = {
  [MinionState.IDLE]: "😊",      // 友好微笑
  [MinionState.LISTENING]: "👂", // 认真倾听
  [MinionState.THINKING]: "🤔", // 思考
  [MinionState.SPEAKING]: "🗣️", // 说话
  [MinionState.WORKING]: "😎",  // 自信工作
  [MinionState.HAPPY]: "😄",    // 开心
  [MinionState.WORRIED]: "😟",  // 担忧
  [MinionState.EXCITED]: "🤩",  // 兴奋
  [MinionState.ERROR]: "😢",    // 错误
  [MinionState.SUCCESS]: "🥳",  // 成功
};

// 小黄人状态描述
export const MinionDescriptions: Record<MinionState, string> = {
  [MinionState.IDLE]: "我在呢，随时准备帮你！",
  [MinionState.LISTENING]: "嗯嗯，我在听...",
  [MinionState.THINKING]: "让我想想...",
  [MinionState.SPEAKING]: "好的，我来帮你...",
  [MinionState.WORKING]: "正在努力工作中！",
  [MinionState.HAPPY]: "太棒了！",
  [MinionState.WORRIED]: "嗯...这个有点难",
  [MinionState.EXCITED]: "哇！这个太酷了！",
  [MinionState.ERROR]: "哎呀，出问题了...",
  [MinionState.SUCCESS]: "完成啦！",
};

// 小黄人尺寸
export type MinionSize = 'small' | 'medium' | 'large' | 'xlarge';

// 组件Props
export interface MinionAvatarProps {
  state?: MinionState;
  size?: MinionSize;
  showSpeechBubble?: boolean;
  speechText?: string;
  showStatus?: boolean;
  className?: string;
}

// 动画类型
export type MinionAnimation = 
  | 'breathe'      // 呼吸
  | 'bounce'       // 弹跳
  | 'shake'        // 抖动
  | 'pulse'        // 脉冲
  | 'jump'         // 跳跃
  | 'wave'         // 挥手
  | 'nod'          // 点头
  | 'dance';       // 跳舞

// 动画映射
export const MinionAnimations: Record<MinionState, MinionAnimation> = {
  [MinionState.IDLE]: 'breathe',
  [MinionState.LISTENING]: 'pulse',
  [MinionState.THINKING]: 'shake',
  [MinionState.SPEAKING]: 'bounce',
  [MinionState.WORKING]: 'bounce',
  [MinionState.HAPPY]: 'jump',
  [MinionState.WORRIED]: 'shake',
  [MinionState.EXCITED]: 'dance',
  [MinionState.ERROR]: 'shake',
  [MinionState.SUCCESS]: 'jump',
};

// 尺寸映射
export const MinionSizes: Record<MinionSize, number> = {
  small: 40,
  medium: 80,
  large: 120,
  xlarge: 200,
};
