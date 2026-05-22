// Tauri系统API - 操作系统层级集成
// 通过Tauri实现真正的系统级操作

import { invoke } from '@tauri-apps/api/tauri';

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  modified: string;
  isDirectory: boolean;
}

export interface AppInfo {
  name: string;
  path: string;
  running: boolean;
}

export interface SystemConfig {
  key: string;
  value: string;
}

// 文件操作
export const fileOperations = {
  // 搜索文件
  async search(query: string, directory?: string): Promise<FileInfo[]> {
    try {
      return await invoke('search_files', { query, directory: directory || 'C:\\' });
    } catch (error) {
      console.error('[TauriAPI] 搜索文件失败:', error);
      throw error;
    }
  },

  // 移动文件
  async move(source: string, destination: string): Promise<void> {
    try {
      await invoke('move_file', { source, destination });
    } catch (error) {
      console.error('[TauriAPI] 移动文件失败:', error);
      throw error;
    }
  },

  // 复制文件
  async copy(source: string, destination: string): Promise<void> {
    try {
      await invoke('copy_file', { source, destination });
    } catch (error) {
      console.error('[TauriAPI] 复制文件失败:', error);
      throw error;
    }
  },

  // 删除文件
  async delete(path: string, toTrash: boolean = true): Promise<void> {
    try {
      await invoke('delete_file', { path, toTrash });
    } catch (error) {
      console.error('[TauriAPI] 删除文件失败:', error);
      throw error;
    }
  },

  // 重命名文件
  async rename(path: string, newName: string): Promise<void> {
    try {
      await invoke('rename_file', { path, newName });
    } catch (error) {
      console.error('[TauriAPI] 重命名文件失败:', error);
      throw error;
    }
  },

  // 获取文件信息
  async getInfo(path: string): Promise<FileInfo> {
    try {
      return await invoke('get_file_info', { path });
    } catch (error) {
      console.error('[TauriAPI] 获取文件信息失败:', error);
      throw error;
    }
  },

  // 创建文件夹
  async createDirectory(path: string): Promise<void> {
    try {
      await invoke('create_directory', { path });
    } catch (error) {
      console.error('[TauriAPI] 创建文件夹失败:', error);
      throw error;
    }
  },

  // 列出目录内容
  async listDirectory(path: string): Promise<FileInfo[]> {
    try {
      return await invoke('list_directory', { path });
    } catch (error) {
      console.error('[TauriAPI] 列出目录失败:', error);
      throw error;
    }
  },
};

// 应用控制
export const appControl = {
  // 启动应用
  async launch(appName: string): Promise<void> {
    try {
      await invoke('launch_app', { appName });
    } catch (error) {
      console.error('[TauriAPI] 启动应用失败:', error);
      throw error;
    }
  },

  // 关闭应用
  async close(appName: string): Promise<void> {
    try {
      await invoke('close_app', { appName });
    } catch (error) {
      console.error('[TauriAPI] 关闭应用失败:', error);
      throw error;
    }
  },

  // 获取运行中的应用
  async getRunningApps(): Promise<AppInfo[]> {
    try {
      return await invoke('get_running_apps');
    } catch (error) {
      console.error('[TauriAPI] 获取运行应用失败:', error);
      throw error;
    }
  },

  // 打开URL
  async openUrl(url: string): Promise<void> {
    try {
      await invoke('open_url', { url });
    } catch (error) {
      console.error('[TauriAPI] 打开URL失败:', error);
      throw error;
    }
  },

  // 打开文件
  async openFile(path: string): Promise<void> {
    try {
      await invoke('open_file', { path });
    } catch (error) {
      console.error('[TauriAPI] 打开文件失败:', error);
      throw error;
    }
  },
};

// 系统配置
export const systemConfig = {
  // 获取配置
  async get(key: string): Promise<string> {
    try {
      return await invoke('get_system_config', { key });
    } catch (error) {
      console.error('[TauriAPI] 获取配置失败:', error);
      throw error;
    }
  },

  // 设置配置
  async set(key: string, value: string): Promise<void> {
    try {
      await invoke('set_system_config', { key, value });
    } catch (error) {
      console.error('[TauriAPI] 设置配置失败:', error);
      throw error;
    }
  },

  // 获取系统信息
  async getSystemInfo(): Promise<any> {
    try {
      return await invoke('get_system_info');
    } catch (error) {
      console.error('[TauriAPI] 获取系统信息失败:', error);
      throw error;
    }
  },

  // 获取系统剪贴板
  async getClipboard(): Promise<string> {
    try {
      return await invoke('get_clipboard');
    } catch (error) {
      console.error('[TauriAPI] 获取剪贴板失败:', error);
      throw error;
    }
  },

  // 设置系统剪贴板
  async setClipboard(text: string): Promise<void> {
    try {
      await invoke('set_clipboard', { text });
    } catch (error) {
      console.error('[TauriAPI] 设置剪贴板失败:', error);
      throw error;
    }
  },
};

// 系统操作
export const systemOperations = {
  // 显示通知
  async showNotification(title: string, body: string): Promise<void> {
    try {
      await invoke('show_notification', { title, body });
    } catch (error) {
      console.error('[TauriAPI] 显示通知失败:', error);
      throw error;
    }
  },

  // 获取屏幕信息
  async getScreenInfo(): Promise<any> {
    try {
      return await invoke('get_screen_info');
    } catch (error) {
      console.error('[TauriAPI] 获取屏幕信息失败:', error);
      throw error;
    }
  },

  // 执行Shell命令
  async executeShell(command: string): Promise<string> {
    try {
      return await invoke('execute_shell', { command });
    } catch (error) {
      console.error('[TauriAPI] 执行Shell命令失败:', error);
      throw error;
    }
  },

  // 截取屏幕
  async takeScreenshot(): Promise<string> {
    try {
      return await invoke('take_screenshot');
    } catch (error) {
      console.error('[TauriAPI] 截取屏幕失败:', error);
      throw error;
    }
  },
};

// 便捷组合函数
export const tauriAPI = {
  fileOperations,
  appControl,
  systemConfig,
  systemOperations,

  // 初始化检查
  async checkAvailability(): Promise<boolean> {
    try {
      await invoke('ping');
      console.log('[TauriAPI] ✅ Tauri后端可用');
      return true;
    } catch (error) {
      console.log('[TauriAPI] ⚠️ Tauri后端不可用');
      return false;
    }
  },
};

export default tauriAPI;
