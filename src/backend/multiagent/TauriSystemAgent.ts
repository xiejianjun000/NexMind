// TauriSystemAgent - 集成Tauri后端的系统智能体
// 真实调用Tauri命令的系统控制智能体

import { BaseAgent } from './BaseAgent';
import { AgentMessage } from './AgentCommunicationBus';
import { invoke } from '@tauri-apps/api/tauri';

export interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  processes: number;
}

export interface AppInfo {
  name: string;
  path: string;
  running: boolean;
}

export class TauriSystemAgent extends BaseAgent {
  constructor() {
    super('tauri-system-agent', '系统操控师（真）', [
      { id: 'app.launch', name: '应用启动', description: '启动应用程序' },
      { id: 'app.close', name: '应用关闭', description: '关闭应用程序' },
      { id: 'app.list', name: '应用列表', description: '获取运行中的应用' },
      { id: 'system.health', name: '系统健康', description: '获取系统健康状态' },
      { id: 'system.info', name: '系统信息', description: '获取系统详细信息' },
      { id: 'clipboard.get', name: '获取剪贴板', description: '获取剪贴板内容' },
      { id: 'clipboard.set', name: '设置剪贴板', description: '设置剪贴板内容' },
      { id: 'shell.execute', name: '执行命令', description: '执行Shell命令' },
      { id: 'url.open', name: '打开URL', description: '在浏览器中打开URL' },
    ]);
  }

  protected async handleRequest(message: AgentMessage): Promise<void> {
    const { action, payload, from, id } = message;

    try {
      let result: any;

      switch (action) {
        case 'app.launch':
          result = await this.launchApp(payload.appName);
          break;

        case 'app.close':
          result = await this.closeApp(payload.appName);
          break;

        case 'app.list':
          result = await this.getRunningApps();
          break;

        case 'system.health':
          result = await this.getSystemHealth();
          break;

        case 'system.info':
          result = await this.getSystemInfo();
          break;

        case 'clipboard.get':
          result = await this.getClipboard();
          break;

        case 'clipboard.set':
          result = await this.setClipboard(payload.text);
          break;

        case 'shell.execute':
          result = await this.executeShell(payload.command);
          break;

        case 'url.open':
          result = await this.openUrl(payload.url);
          break;

        default:
          throw new Error(`未知操作: ${action}`);
      }

      this.respond(from, id, action, { success: true, data: result });
      this.broadcast('tauri-system-agent:completed', { action, result });
    } catch (error) {
      console.error(`[TauriSystemAgent] Error in ${action}:`, error);
      this.respond(from, id, action, { 
        success: false, 
        error: (error as Error).message 
      });
    }
  }

  private async launchApp(appName: string): Promise<AppInfo> {
    console.log(`[TauriSystemAgent] Launching app: ${appName}`);

    this.status = 'busy';
    
    try {
      await invoke('launch_app', { appName });
      return {
        name: appName,
        path: '',
        running: true,
      };
    } finally {
      this.status = 'idle';
    }
  }

  private async closeApp(appName: string): Promise<{ closed: boolean }> {
    console.log(`[TauriSystemAgent] Closing app: ${appName}`);

    this.status = 'busy';
    
    try {
      await invoke('close_app', { appName });
      return { closed: true };
    } finally {
      this.status = 'idle';
    }
  }

  private async getRunningApps(): Promise<AppInfo[]> {
    console.log(`[TauriSystemAgent] Getting running apps`);

    this.status = 'busy';
    
    try {
      return await invoke<AppInfo[]>('get_running_apps');
    } finally {
      this.status = 'idle';
    }
  }

  private async getSystemHealth(): Promise<SystemStatus> {
    console.log(`[TauriSystemAgent] Getting system health`);

    this.status = 'busy';
    
    try {
      return await invoke<SystemStatus>('get_system_status');
    } finally {
      this.status = 'idle';
    }
  }

  private async getSystemInfo(): Promise<any> {
    console.log(`[TauriSystemAgent] Getting system info`);

    this.status = 'busy';
    
    try {
      return await invoke('get_system_info');
    } finally {
      this.status = 'idle';
    }
  }

  private async getClipboard(): Promise<string> {
    console.log(`[TauriSystemAgent] Getting clipboard`);

    this.status = 'busy';
    
    try {
      return await invoke<string>('get_clipboard');
    } finally {
      this.status = 'idle';
    }
  }

  private async setClipboard(text: string): Promise<{ success: boolean }> {
    console.log(`[TauriSystemAgent] Setting clipboard`);

    this.status = 'busy';
    
    try {
      await invoke('set_clipboard', { text });
      return { success: true };
    } finally {
      this.status = 'idle';
    }
  }

  private async executeShell(command: string): Promise<string> {
    console.log(`[TauriSystemAgent] Executing: ${command}`);

    this.status = 'busy';
    
    try {
      return await invoke<string>('execute_shell', { command });
    } finally {
      this.status = 'idle';
    }
  }

  private async openUrl(url: string): Promise<{ opened: boolean }> {
    console.log(`[TauriSystemAgent] Opening URL: ${url}`);

    this.status = 'busy';
    
    try {
      await invoke('open_url', { url });
      return { opened: true };
    } finally {
      this.status = 'idle';
    }
  }
}

export const tauriSystemAgent = new TauriSystemAgent();
