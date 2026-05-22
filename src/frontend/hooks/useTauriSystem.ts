// useTauriSystem - Tauri系统集成Hook
// 前端与Tauri后端的实时连接

import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

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

export interface SystemInfo {
  os: string;
  arch: string;
  hostname: string;
  username: string;
}

export interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
}

export function useTauriSystem() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查连接状态
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await invoke('ping');
      setIsConnected(true);
      setError(null);
      console.log('[useTauriSystem] ✅ Tauri后端已连接');
    } catch (err) {
      setIsConnected(false);
      setError('Tauri后端未连接');
      console.log('[useTauriSystem] ⚠️ Tauri后端未连接');
    }
  };

  // 文件操作
  const fileOperations = {
    search: useCallback(async (query: string, directory?: string): Promise<FileInfo[]> => {
      setIsLoading(true);
      try {
        const result = await invoke<FileInfo[]>('search_files', { 
          query, 
          directory: directory || 'C:\\' 
        });
        return result;
      } catch (err) {
        setError(`搜索失败: ${err}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    move: useCallback(async (source: string, destination: string): Promise<void> => {
      setIsLoading(true);
      try {
        await invoke('move_file', { source, destination });
      } catch (err) {
        setError(`移动失败: ${err}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    copy: useCallback(async (source: string, destination: string): Promise<void> => {
      setIsLoading(true);
      try {
        await invoke('copy_file', { source, destination });
      } catch (err) {
        setError(`复制失败: ${err}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    delete: useCallback(async (path: string, toTrash: boolean = true): Promise<void> => {
      setIsLoading(true);
      try {
        await invoke('delete_file', { path, toTrash });
      } catch (err) {
        setError(`删除失败: ${err}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    rename: useCallback(async (path: string, newName: string): Promise<void> => {
      setIsLoading(true);
      try {
        await invoke('rename_file', { path, newName });
      } catch (err) {
        setError(`重命名失败: ${err}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    getInfo: useCallback(async (path: string): Promise<FileInfo> => {
      try {
        return await invoke<FileInfo>('get_file_info', { path });
      } catch (err) {
        setError(`获取信息失败: ${err}`);
        throw err;
      }
    }, []),

    list: useCallback(async (path: string): Promise<FileInfo[]> => {
      try {
        return await invoke<FileInfo[]>('list_directory', { path });
      } catch (err) {
        setError(`列出目录失败: ${err}`);
        throw err;
      }
    }, []),

    createDir: useCallback(async (path: string): Promise<void> => {
      try {
        await invoke('create_directory', { path });
      } catch (err) {
        setError(`创建目录失败: ${err}`);
        throw err;
      }
    }, []),
  };

  // 应用控制
  const appControl = {
    launch: useCallback(async (appName: string): Promise<void> => {
      setIsLoading(true);
      try {
        await invoke('launch_app', { appName });
      } catch (err) {
        setError(`启动应用失败: ${err}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    close: useCallback(async (appName: string): Promise<void> => {
      setIsLoading(true);
      try {
        await invoke('close_app', { appName });
      } catch (err) {
        setError(`关闭应用失败: ${err}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    getRunning: useCallback(async (): Promise<AppInfo[]> => {
      try {
        return await invoke<AppInfo[]>('get_running_apps');
      } catch (err) {
        setError(`获取运行应用失败: ${err}`);
        throw err;
      }
    }, []),

    openUrl: useCallback(async (url: string): Promise<void> => {
      try {
        await invoke('open_url', { url });
      } catch (err) {
        setError(`打开URL失败: ${err}`);
        throw err;
      }
    }, []),

    openFile: useCallback(async (path: string): Promise<void> => {
      try {
        await invoke('open_file', { path });
      } catch (err) {
        setError(`打开文件失败: ${err}`);
        throw err;
      }
    }, []),
  };

  // 系统操作
  const systemOperations = {
    getInfo: useCallback(async (): Promise<SystemInfo> => {
      try {
        return await invoke<SystemInfo>('get_system_info');
      } catch (err) {
        setError(`获取系统信息失败: ${err}`);
        throw err;
      }
    }, []),

    getClipboard: useCallback(async (): Promise<string> => {
      try {
        return await invoke<string>('get_clipboard');
      } catch (err) {
        setError(`获取剪贴板失败: ${err}`);
        throw err;
      }
    }, []),

    setClipboard: useCallback(async (text: string): Promise<void> => {
      try {
        await invoke('set_clipboard', { text });
      } catch (err) {
        setError(`设置剪贴板失败: ${err}`);
        throw err;
      }
    }, []),

    executeShell: useCallback(async (command: string): Promise<string> => {
      setIsLoading(true);
      try {
        return await invoke<string>('execute_shell', { command });
      } catch (err) {
        setError(`执行命令失败: ${err}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    screenshot: useCallback(async (): Promise<string> => {
      try {
        return await invoke<string>('take_screenshot');
      } catch (err) {
        setError(`截图失败: ${err}`);
        throw err;
      }
    }, []),
  };

  // 通知
  const showNotification = useCallback(async (title: string, body: string): Promise<void> => {
    try {
      await invoke('show_notification', { title, body });
    } catch (err) {
      console.error('[useTauriSystem] 通知失败:', err);
    }
  }, []);

  return {
    // 连接状态
    isConnected,
    isLoading,
    error,
    checkConnection,
    
    // 文件操作
    fileOperations,
    
    // 应用控制
    appControl,
    
    // 系统操作
    systemOperations,
    
    // 通知
    showNotification,
  };
}
