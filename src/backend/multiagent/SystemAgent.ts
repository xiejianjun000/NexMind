// SystemAgent - 系统操控师智能体
// 负责系统设置、应用控制和权限管理

import { BaseAgent } from './BaseAgent';
import { AgentMessage } from './AgentCommunicationBus';

export interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  processes: number;
}

export interface AppInfo {
  name: string;
  pid: number;
  status: 'running' | 'stopped' | 'suspended';
  cpu: number;
  memory: number;
}

export class SystemAgent extends BaseAgent {
  private runningApps: Map<string, AppInfo> = new Map();

  constructor() {
    super('system-agent', '系统操控师', [
      { id: 'app.launch', name: '应用启动', description: '启动指定应用程序' },
      { id: 'app.close', name: '应用关闭', description: '关闭指定应用程序' },
      { id: 'system.health', name: '系统健康检查', description: '检查系统健康状态' },
      { id: 'system.config', name: '系统配置', description: '读取或设置系统配置' },
      { id: 'app.list', name: '应用列表', description: '获取运行中的应用列表' },
    ]);
  }

  protected async handleRequest(message: AgentMessage): Promise<void> {
    const { action, payload, from, id } = message;

    try {
      let result: any;

      switch (action) {
        case 'app.launch':
          result = await this.launchApp(payload);
          break;

        case 'app.close':
          result = await this.closeApp(payload);
          break;

        case 'system.health':
          result = await this.getSystemHealth();
          break;

        case 'system.config.get':
          result = await this.getSystemConfig(payload.key);
          break;

        case 'system.config.set':
          result = await this.setSystemConfig(payload.key, payload.value);
          break;

        case 'app.list':
          result = await this.listApps();
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      this.respond(from, id, action, { success: true, data: result });
      this.broadcast('system-agent:status', { action, result: 'completed' });
    } catch (error) {
      this.respond(from, id, action, { 
        success: false, 
        error: (error as Error).message 
      });
    }
  }

  private async launchApp(options: { name: string; args?: string[] }): Promise<AppInfo> {
    console.log(`[SystemAgent] Launching app: ${options.name}`);

    await this.simulateProcessing(800);

    const appInfo: AppInfo = {
      name: options.name,
      pid: Math.floor(Math.random() * 10000) + 1000,
      status: 'running',
      cpu: 0,
      memory: 0,
    };

    this.runningApps.set(options.name, appInfo);

    return appInfo;
  }

  private async closeApp(options: { name: string; force?: boolean }): Promise<{ closed: boolean }> {
    console.log(`[SystemAgent] Closing app: ${options.name}`);

    await this.simulateProcessing(300);

    this.runningApps.delete(options.name);

    return { closed: true };
  }

  private async getSystemHealth(): Promise<SystemStatus> {
    console.log(`[SystemAgent] Getting system health`);

    await this.simulateProcessing(500);

    return {
      cpu: Math.random() * 100,
      memory: 40 + Math.random() * 30,
      disk: 60 + Math.random() * 20,
      uptime: Date.now() / 1000,
      processes: this.runningApps.size,
    };
  }

  private async getSystemConfig(key: string): Promise<any> {
    console.log(`[SystemAgent] Getting config: ${key}`);

    await this.simulateProcessing(100);

    const configs: Record<string, any> = {
      'theme': 'dark',
      'language': 'zh-CN',
      'notifications': true,
      'autoUpdate': false,
    };

    return configs[key] || null;
  }

  private async setSystemConfig(key: string, value: any): Promise<{ updated: boolean }> {
    console.log(`[SystemAgent] Setting config: ${key} = ${value}`);

    await this.simulateProcessing(200);

    return { updated: true };
  }

  private async listApps(): Promise<AppInfo[]> {
    console.log(`[SystemAgent] Listing running apps`);

    await this.simulateProcessing(300);

    return Array.from(this.runningApps.values());
  }

  private async simulateProcessing(ms: number): Promise<void> {
    this.status = 'busy';
    await new Promise(resolve => setTimeout(resolve, ms));
    this.status = 'idle';
  }
}

export const systemAgent = new SystemAgent();
