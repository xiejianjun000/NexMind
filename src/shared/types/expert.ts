// 专家系统类型定义
export interface Expert {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  specialty: string[];
  description: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'busy';
  isAvailable: boolean;
  version: string;
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

export interface ExpertInvocation {
  expertId: string;
  request: string;
  parameters?: Record<string, any>;
}

export interface ExpertResponse {
  expertId: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

// 预定义的专家列表
export const PRESET_EXPERTS: Expert[] = [
  {
    id: 'code-architect',
    name: '代码架构师',
    role: '首席软件架构师',
    specialty: ['系统设计', '代码审查', '架构优化'],
    description: '精通软件架构设计，能提供最佳的代码组织和架构建议',
    capabilities: ['代码架构设计', '代码审查', '性能优化建议', '技术选型建议'],
    status: 'idle',
    isAvailable: true,
    version: '1.0.0',
    createdAt: new Date('2026-05-01'),
    useCount: 0,
  },
  {
    id: 'data-analyst',
    name: '数据分析师',
    role: '高级数据分析师',
    specialty: ['数据分析', '数据可视化', '统计建模'],
    description: '擅长数据分析和可视化，能从数据中发现有价值的信息',
    capabilities: ['数据分析', '数据可视化', '统计模型', '报表生成'],
    status: 'idle',
    isAvailable: true,
    version: '1.0.0',
    createdAt: new Date('2026-05-05'),
    useCount: 0,
  },
  {
    id: 'content-writer',
    name: '内容创作者',
    role: '首席内容官',
    specialty: ['文案创作', '内容营销', '创意策划'],
    description: '专业的内容创作专家，能写出吸引人的文案和内容',
    capabilities: ['文案创作', '博客撰写', '营销文案', '创意策划'],
    status: 'idle',
    isAvailable: true,
    version: '1.0.0',
    createdAt: new Date('2026-05-10'),
    useCount: 0,
  },
  {
    id: 'project-manager',
    name: '项目经理',
    role: '高级项目经理',
    specialty: ['项目管理', '进度规划', '团队协调'],
    description: '专业的项目管理专家，帮助你规划和管理项目进度',
    capabilities: ['项目规划', '任务分解', '进度跟踪', '风险管理'],
    status: 'idle',
    isAvailable: true,
    version: '1.0.0',
    createdAt: new Date('2026-05-15'),
    useCount: 0,
  },
  {
    id: 'devops-engineer',
    name: 'DevOps 工程师',
    role: 'DevOps 专家',
    specialty: ['部署自动化', 'CI/CD', '系统运维'],
    description: '专注于自动化部署和运维，让你的应用部署更高效',
    capabilities: ['CI/CD配置', '自动化部署', '系统监控', '性能调优'],
    status: 'idle',
    isAvailable: true,
    version: '1.0.0',
    createdAt: new Date('2026-05-20'),
    useCount: 0,
  },
  {
    id: 'ux-designer',
    name: 'UI/UX 设计师',
    role: '用户体验设计师',
    specialty: ['UI设计', '用户体验', '交互设计'],
    description: '专注于用户体验和界面设计，创造优美又好用的产品',
    capabilities: ['界面设计', '用户体验优化', '交互原型', '设计系统'],
    status: 'idle',
    isAvailable: true,
    version: '1.0.0',
    createdAt: new Date('2026-05-21'),
    useCount: 0,
  },
];
