# NexMind 本地部署脚本

## 快速启动

### 方式1：使用 npm（推荐）

```bash
# 进入项目目录
cd C:\nexmind

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 方式2：使用 yarn

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

### 方式3：使用 pnpm

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 访问地址

开发服务器启动后，访问：

- **本地地址**: http://localhost:5173
- **局域网地址**: http://192.168.x.x:5173（用于手机测试）

## 启动后测试步骤

1. 打开浏览器访问 http://localhost:5173
2. 查看NexMindHub智能中枢界面
3. 测试小黄人吉祥物动画
4. 测试多智能体协作
5. 测试设置页面（主题切换等）
6. 测试命令行输入（Ctrl+K）

## 常用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 运行测试
npm test

# 运行压力测试
npm run stress-test

# 代码格式化和检查
npm run lint
npm run format
```

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3.4
- **图标**: Lucide React
- **桌面应用**: Tauri（可选）

## 系统要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0 或 pnpm >= 8.0.0
- 操作系统: Windows 10+ / macOS 10.14+ / Ubuntu 18.04+

## 故障排除

### 问题1：端口被占用

如果5173端口被占用，可以修改vite.config.ts中的端口号：

```typescript
export default defineConfig({
  server: {
    port: 3000, // 改为其他端口
  },
});
```

### 问题2：依赖安装失败

清理缓存后重新安装：

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 问题3：TypeScript错误

运行类型检查：

```bash
npx tsc --noEmit
```

## 功能测试清单

### 界面测试
- [ ] NexMindHub主页加载
- [ ] 小黄人吉祥物动画
- [ ] 多智能体面板
- [ ] 办公室场景
- [ ] 设置页面（6个Tab）
- [ ] 主题切换（暗色/亮色/系统）

### 交互测试
- [ ] 命令行输入（Ctrl+K）
- [ ] 智能体选择
- [ ] 任务执行
- [ ] 记忆树浏览
- [ ] 专家面板

### 性能测试
- [ ] 页面加载速度 < 2s
- [ ] 意图解析响应 < 5ms
- [ ] 内存占用 < 200MB

## 部署检查清单

- [x] 项目结构完整
- [ ] npm install 成功
- [ ] npm run dev 成功
- [ ] 浏览器访问正常
- [ ] 所有页面加载正常
- [ ] 功能测试通过

---
*NexMind 本地部署指南 v1.0.0*
