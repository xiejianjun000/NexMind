# NexMind - 下一代智能中枢

![NexMind Banner](https://example.com/banner.png)

## 🚀 项目介绍

**NexMind** - Next Generation Intelligent Hub**（下一代智能中枢）是一个结合了 Marvis 的系统级 AI 助手理念，整合了 OpenHuman 的记忆系统，并创新的双智能体架构的 AI 平台。

### 核心理念：
- **Nex** (连接、下一代
- **Mind** 智能思维
- **Nexus** 核心连接点

### 核心特性

- 🤖 **双智能体架构
  - **CEO 智能体**：用户交互的主要智能体，负责聊天、任务执行
  - **总工程师智能体**：隐藏的后台智能体，7x24小时监控系统，负责技术升级和优化

- 🧠 **记忆树系统
  - 层次化记忆管理
  - Obsidian 兼容
  - Token 智能压缩

- 🗣️ **语音对话系统
  - 语音识别（STT）
  - 语音合成（TTS）
  - 实时语音交互

- 💾 **TokenJuice 压缩引擎
  - 节省 80% Token
  - 智能内容压缩

- 🔄 **自我进化引擎
  - 自动技术升级建议
  - 沙箱安全验证
  - 版本控制和回滚

## 🛠️ 技术架构

```
NexMind 系统架构
┌─────────────────────────────────────────────────────────────────┐
│                      🎨 Frontend (Tauri + React                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ 智能工作台 │ │ 记忆浏览器 │ │ 语音对话 │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                      🧠 Agent Layer                            │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              👨‍💼 CEO (可见) │ 🔧 总工程师 (隐藏) │     │
│  └─────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│                      ⚡ Core Layer                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ 记忆树系统 │ │ TokenJuice │ │ 安全沙箱 │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                      💾 Infrastructure                             │
│  SQLite • VectorDB • Ollama • OAuth                     │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 项目结构

```
nexmind/
├── src/
│   ├── frontend/              # 前端代码
│   │   ├── components/    # UI 组件
│   │   ├── pages/       # 页面
│   │   ├── hooks/       # React Hooks
│   │   ├── utils/       # 工具函数
│   │   ├── App.tsx      # 主应用组件
│   │   ├── main.tsx     # 入口文件
│   │   └── index.css    # 样式文件
│   ├── backend/             # 后端代码
│   │   ├── agents/      # 智能体系统
│   │   │   ├── CEOMind.ts          # CEO 智能体
│   │   │   └── ChiefEngineerMind.ts # 总工程师智能体
│   │   ├── core/        # 核心引擎
│   │   │   └── NexMindSystem.ts  # 核心系统集成
│   │   └── services/    # 服务层
│   └── shared/             # 共享代码
├── public/                 # 静态资源
├── docs/                   # 文档
├── package.json           # 项目配置
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── README.md            # 本文件
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
cd nexmind
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

## 📚 核心功能详解

### 双智能体工作流

#### CEO 智能体（用户看到的智能体）

- 与用户对话
- 执行任务
- 提供帮助和建议

#### 总工程师智能体（隐藏在后台工作）

- 7x24小时系统监控
- GitHub 技术升级建议
- 依赖更新检查
- 系统优化分析
- 安全沙箱测试
- 版本控制和回滚

### 记忆树系统

采用 OpenHuman 的记忆管理方式：

- 层次化的记忆结构
- 自动摘要
- Obsidian 导出
- 快速检索

### TokenJuice 压缩引擎

节省 80% 的 Token 消耗：

- HTML → Markdown 转换
- 内容去重
- 智能摘要
- 无损保留

## 🛣️ 开发路线图

### Phase 1: MVP (当前进度
- [x] 项目基础架构
- [ ] 基础 UI 界面
- [ ] 基础聊天功能
- [ ] 记忆树系统
- [ ] 语音对话

### Phase 2: 核心功能
- [ ] 本地 LLM 集成
- [ ] TokenJuice 压缩引擎
- [ ] OAuth 集成
- [ ] 自动同步

### Phase 3: 自我进化
- [ ] 元智能体系统
- [ ] 技能生成系统
- [ ] 安全沙箱
- [ ] 版本控制

### Phase 4: 平台化
- [ ] 技能市场
- [ ] 插件系统
- [ ] 企业版功能

## 🤝 贡献

欢迎贡献！请查看 CONTRIBUTING.md 了解如何参与项目。

## 📄 许可证

MIT License

## 🌟 特别感谢

- **OpenHuman** - 记忆系统和 UI 灵感
- **Marvis** - 系统级 AI 理念
- **OpenClaw** - Agent 生态系统

## 📧 联系方式

- 项目地址: [GitHub](https://github.com/your-nexmind)
- 问题反馈: [Issues](https://github.com/your-nexmind/issues)

---

**Made with ❤️ by the NexMind Team
