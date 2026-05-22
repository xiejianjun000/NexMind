# NexMind 智能体通信机制

## 概述

NexMind 采用 **消息总线（AgentCommunicationBus）** 作为所有智能体之间的通信基础设施。所有智能体通过统一的通信总线进行消息传递，实现了松耦合、高可用的智能体协作。

## 通信架构图

```
                                    ┌─────────────────┐
                                    │   消息总线      │
                                    │ (CommunicationBus)│
                                    └────────┬────────┘
                                             │
           ┌────────────────────────────────┼────────────────────────────────┐
           │                                │                                │
           ▼                                ▼                                ▼
    ┌─────────────┐                  ┌─────────────┐                  ┌─────────────┐
    │   CEO       │                  │  Meta-Agent │                  │Chief Engineer│
    │ (主协调者)  │◄────────────────►│  (元智能体) │◄───────────────►│ (总工程师)  │
    └──────┬──────┘                  └──────┬──────┘                  └──────┬──────┘
           │                                │                                │
           │         订阅消息               │         订阅消息               │
           │◄──────────────────────────────┼──────────────────────────────►│
           │                                │                                │
           └────────────────────────────────┼────────────────────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────┐
                              │   ExpertManager           │
                              │   (专家管理系统)          │
                              └──────────┬───────────────┘
                                         │
           ┌──────────────────────────────┼──────────────────────────────┐
           │                              │                              │
           ▼                              ▼                              ▼
    ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
    │ 代码架构师  │              │ 代码审查员  │              │ 安全审计师  │
    └─────────────┘              └─────────────┘              └─────────────┘
           │                              │                              │
           ▼                              ▼                              ▼
    ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
    │ 文档撰写员  │              │ 测试工程师  │              │ 数据分析师  │
    └─────────────┘              └─────────────┘              └─────────────┘
```

## 消息类型

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| `request` | 请求消息 | CEO请求专家咨询、元智能体编排任务 |
| `response` | 响应消息 | 专家返回咨询结果、CE0确认升级 |
| `notification` | 通知消息 | 总工程师通知升级提案、CEO通知紧急回滚 |
| `broadcast` | 广播消息 | CEO广播专家请求、系统事件广播 |

## 消息格式

```typescript
interface AgentMessage {
  id: string;                    // 消息唯一ID
  from: string;                   // 发送者ID
  to: string;                     // 接收者ID ('*' 表示广播)
  type: 'request' | 'response' | 'notification' | 'broadcast';
  action: string;                // 动作类型
  payload: any;                  // 消息内容
  timestamp: Date;               // 时间戳
  correlationId?: string;        // 关联ID（用于请求-响应对）
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ttl?: number;                  // 消息有效期
}
```

## 智能体通信流程

### 1. CEO 协调专家流程

```
用户 ──► CEO ──► [消息总线] ──► ExpertAgent ──► [消息总线] ──► CEO ──► 用户

详细步骤:
1. 用户发送消息给CEO
2. CEO解析意图，识别需要专家
3. CEO通过 broadcast() 广播专家请求
4. 相关ExpertAgent收到请求
5. ExpertAgent通过 sendMessage() 返回响应
6. CEO汇总结果返回用户
```

### 2. CEO 请求总工程师升级

```
CEO ──► [消息总线] ──► ChiefEngineer ──► [消息总线] ──► CEO
                │
                └──► 用户（通知）

详细步骤:
1. CEO发送 request 消息给 chief-engineer
2. ChiefEngineer执行升级检查
3. ChiefEngineer返回升级提案
4. 如需人类确认，ChiefEngineer通知用户
5. 用户确认后，ChiefEngineer执行升级
6. 升级完成后通知CEO和用户
```

### 3. 元智能体任务编排

```
任意智能体 ──► [消息总线] ──► Meta-Agent ──► [消息总线] ──► 目标智能体

详细步骤:
1. 智能体发送编排请求给 meta-agent
2. MetaAgent分析任务类型
3. MetaAgent根据关键词匹配最佳智能体
4. MetaAgent将任务路由到目标智能体
5. 目标智能体处理任务
6. 结果通过消息总线返回
```

### 4. 每日心跳任务

```
Meta-Agent (定时) ──► [消息总线] ──► ChiefEngineer ──► [消息总线] ──► CEO

详细步骤:
1. MetaAgent每分钟发送心跳
2. 心跳触发系统健康检查
3. ChiefEngineer执行日常检查:
   - 检查GitHub热门技术
   - 检查依赖更新
   - 分析系统优化点
4. 生成每日报告
5. 通过消息总线发送给CEO
6. CEO通知用户或自动处理
```

## 核心代码实现

### AgentCommunicationBus（消息总线）

```typescript
class AgentCommunicationBus {
  private agents: Map<string, AgentRegistration> = new Map();
  private subscribers: Map<string, Array<(message: AgentMessage) => void>> = new Map();

  // 注册智能体
  registerAgent(registration: AgentRegistration): void {
    this.agents.set(registration.agentId, registration);
  }

  // 发送消息
  sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): string {
    // 生成消息ID并投递
  }

  // 发送请求并等待响应
  async sendRequest(from, to, action, payload, timeout): Promise<Response> {
    // 发送请求并等待响应
  }

  // 广播消息
  broadcast(from, action, payload): void {
    // 广播给所有智能体
  }

  // 订阅消息
  subscribe(agentId, handler): void {
    // 添加订阅者
  }

  // 投递消息
  private deliverMessage(message: AgentMessage): void {
    // 将消息投递给订阅者
  }
}
```

### CEO 智能体通信

```typescript
class CEOMind {
  start(): void {
    // 注册到消息总线
    communicationBus.registerAgent({
      agentId: 'ceo',
      capabilities: [...]
    });

    // 订阅消息
    communicationBus.subscribe('ceo', this.handleMessage.bind(this));
  }

  async handleUserMessage(content: string): Promise<Message> {
    const intent = this.parseIntent(content);

    switch (intent.type) {
      case 'expert_request':
        return await this.coordinateExpert(intent);
      case 'upgrade_request':
        return await this.coordinateUpgrade(intent);
      case 'task_orchestration':
        return await this.coordinateTask(intent);
    }
  }

  private async coordinateExpert(intent: any): Promise<string> {
    // 广播专家请求
    communicationBus.broadcast('ceo', 'expert-request', {
      expertId: intent.expertId,
      query: intent.query,
    });

    // 等待专家响应
    const response = await communicationBus.sendRequest(
      'ceo',
      `expert-${intent.expertId}`,
      'consult',
      { query: intent.query }
    );

    return response.data;
  }

  private async coordinateUpgrade(intent: any): Promise<string> {
    // 请求总工程师检查升级
    const response = await communicationBus.sendRequest(
      'ceo',
      'chief-engineer',
      'check-upgrades',
      {}
    );

    return response.data;
  }
}
```

### 总工程师智能体通信

```typescript
class ChiefEngineerMind {
  start(): void {
    // 注册到消息总线
    communicationBus.registerAgent({
      agentId: 'chief-engineer',
      capabilities: [
        { id: 'system-monitor', name: '系统监控' },
        { id: 'upgrade', name: '技术升级' },
        { id: 'optimize', name: '性能优化' },
        { id: 'rollback', name: '版本回滚' },
      ]
    });

    // 订阅消息
    communicationBus.subscribe('chief-engineer', this.handleMessage.bind(this));
  }

  private handleMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'request':
        this.handleRequest(message);
        break;
      case 'notification':
        this.handleNotification(message);
        break;
      case 'broadcast':
        this.handleBroadcast(message);
        break;
    }
  }

  private async handleRequest(message: AgentMessage): Promise<void> {
    let result;

    switch (message.action) {
      case 'check-upgrades':
        result = await this.checkForUpgrades();
        break;
      case 'apply-upgrade':
        result = await this.applyUpgrade(message.payload);
        break;
      case 'system-health':
        result = this.checkSystemHealth();
        break;
    }

    // 发送响应
    communicationBus.sendMessage({
      from: 'chief-engineer',
      to: message.from,
      type: 'response',
      action: `${message.action}-response`,
      payload: result,
    });
  }
}
```

## 通信序列图

### 完整对话流程

```
┌────────┐     ┌─────────┐     ┌──────────────┐     ┌────────────────┐     ┌────────┐
│  用户  │     │   CEO   │     │ MessageBus   │     │ ChiefEngineer │     │ Expert │
└───┬────┘     └────┬────┘     └──────┬───────┘     └───────┬────────┘     └───┬────┘
    │               │                  │                    │                  │
    │ 对话请求      │                  │                    │                  │
    │──────────────►                  │                    │                  │
    │               │                  │                    │                  │
    │               │  broadcast()     │                    │                  │
    │               │──────────────────────────────────────►                  │
    │               │                  │                    │                  │
    │               │                  │  sendRequest()     │                  │
    │               │◄────────────────────────────────────                  │
    │               │                  │                    │                  │
    │               │ 解析意图         │                    │                  │
    │               │──────────────────                    │                  │
    │               │                  │                    │                  │
    │               │  broadcast()     │                    │                  │
    │               │────────────────────────────────────────────────────────►
    │               │                  │                    │                  │
    │               │                  │  sendMessage()     │                  │
    │               │◄────────────────────────────────────────────────────────
    │               │                  │                    │                  │
    │ 返回结果      │                  │                    │                  │
    │◄──────────────                  │                    │                  │
    │               │                  │                    │                  │
```

## 优先级和超时

| 优先级 | 说明 | 超时时间 |
|--------|------|----------|
| `urgent` | 紧急消息 | 5秒 |
| `high` | 高优先级 | 10秒 |
| `medium` | 普通请求 | 30秒 |
| `low` | 低优先级 | 60秒 |

## 最佳实践

### 1. 消息设计
- 使用清晰的动作名称（如 `expert-request`、`check-upgrades`）
- 合理设置消息优先级
- 为长时间操作设置超时

### 2. 错误处理
- 始终处理响应超时
- 实现重试机制
- 记录失败消息用于调试

### 3. 性能优化
- 避免频繁的大消息广播
- 使用相关性过滤减少不必要投递
- 定期清理过期消息

## 监控和调试

消息总线提供以下监控能力：

```typescript
// 获取所有注册的智能体
communicationBus.getRegisteredAgents();

// 获取智能体能力
communicationBus.getAgentCapabilities('ceo');

// 查看消息队列（用于调试）
// 消息队列存储最近的消息
```

## 总结

NexMind 的智能体通信机制通过统一的消息总线实现了：

✅ **松耦合** - 智能体之间不直接依赖
✅ **可扩展** - 易于添加新智能体
✅ **可追踪** - 所有消息都有ID和关联
✅ **高可用** - 支持超时和错误处理
✅ **灵活路由** - 支持广播、单播、请求-响应模式
