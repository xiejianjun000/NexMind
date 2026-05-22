// 应用发现器 - 自动发现系统中安装的应用程序
// Windows 应用扫描和管理

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface AppInfo {
  name: string;              // 应用名称
  path: string;              // 可执行文件路径
  icon?: string;             // 图标路径
  publisher?: string;         // 发布者
  version?: string;          // 版本
  size?: number;             // 大小
  installDate?: string;      // 安装日期
  source: 'startmenu' | 'registry' | 'installed' | 'common';
}

export interface RunningApp {
  name: string;
  pid: number;
  memory: number;           // 内存使用（MB）
  cpu?: number;             // CPU使用率
}

export class AppDiscoverer {
  private appCache: AppInfo[] = [];
  private cacheLastUpdated: Date | null = null;
  private cacheValidDuration = 5 * 60 * 1000; // 5分钟

  constructor() {
    console.log('[AppDiscoverer] 应用发现器已初始化');
  }

  // 发现所有应用
  async discoverAll(): Promise<AppInfo[]> {
    // 检查缓存
    if (this.isCacheValid()) {
      console.log('[AppDiscoverer] 使用缓存的应用程序列表');
      return this.appCache;
    }

    console.log('[AppDiscoverer] 开始发现应用程序...');
    const startTime = Date.now();

    const results: AppInfo[] = [];

    // 1. 扫描开始菜单
    const startMenuApps = await this.scanStartMenu();
    results.push(...startMenuApps);

    // 2. 扫描安装目录
    const installedApps = await this.scanInstalledPrograms();
    results.push(...installedApps);

    // 3. 从注册表获取
    const registryApps = await this.scanRegistry();
    results.push(...registryApps);

    // 去重
    const uniqueApps = this.deduplicateApps(results);

    // 更新缓存
    this.appCache = uniqueApps;
    this.cacheLastUpdated = new Date();

    console.log(`[AppDiscoverer] ✅ 发现 ${uniqueApps.length} 个应用程序，耗时 ${Date.now() - startTime}ms`);

    return uniqueApps;
  }

  // 缓存是否有效
  private isCacheValid(): boolean {
    if (!this.cacheLastUpdated || this.appCache.length === 0) return false;
    const elapsed = Date.now() - this.cacheLastUpdated.getTime();
    return elapsed < this.cacheValidDuration;
  }

  // 扫描开始菜单
  private async scanStartMenu(): Promise<AppInfo[]> {
    const apps: AppInfo[] = [];
    const startMenuPaths = [
      process.env.APPDATA + '\\Microsoft\\Windows\\Start Menu\\Programs',
      'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs',
    ];

    for (const startMenuPath of startMenuPaths) {
      try {
        await this.scanDirectoryForShortcuts(startMenuPath, apps, 'startmenu');
      } catch (error) {
        console.error(`[AppDiscoverer] 扫描开始菜单失败: ${startMenuPath}`, error);
      }
    }

    return apps;
  }

  // 递归扫描目录中的快捷方式
  private async scanDirectoryForShortcuts(dir: string, apps: AppInfo[], source: AppInfo['source'], depth: number = 0): Promise<void> {
    if (depth > 5) return; // 最大深度5层

    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectoryForShortcuts(fullPath, apps, source, depth + 1);
        } else if (entry.name.endsWith('.lnk') || entry.name.endsWith('.exe')) {
          const appName = entry.name.replace(/\.(lnk|exe)$/i, '');
          
          // 尝试获取目标路径
          let targetPath = fullPath;
          if (entry.name.endsWith('.lnk')) {
            targetPath = await this.getShortcutTarget(fullPath).catch(() => fullPath);
          }

          apps.push({
            name: appName,
            path: targetPath,
            source,
          });
        }
      }
    } catch (error) {
      // 忽略错误
    }
  }

  // 获取快捷方式目标路径（Windows）
  private async getShortcutTarget(shortcutPath: string): Promise<string> {
    try {
      // 使用 PowerShell 读取快捷方式目标
      const command = `powershell -Command "(New-Object -ComObject WScript.Shell).CreateShortcut('${shortcutPath}').TargetPath"`;
      const { stdout } = await execAsync(command);
      return stdout.trim();
    } catch (error) {
      return shortcutPath;
    }
  }

  // 扫描已安装程序目录
  private async scanInstalledPrograms(): Promise<AppInfo[]> {
    const apps: AppInfo[] = [];
    const programDirs = [
      'C:\\Program Files',
      'C:\\Program Files (x86)',
    ];

    for (const programDir of programDirs) {
      try {
        const entries = await fs.promises.readdir(programDir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory()) {
            const exePath = path.join(programDir, entry.name, entry.name + '.exe');
            try {
              await fs.promises.access(exePath);
              apps.push({
                name: entry.name,
                path: exePath,
                source: 'installed',
              });
            } catch {
              // 尝试查找其他exe
              const dirExes = await fs.promises.readdir(path.join(programDir, entry.name))
                .catch(() => []);
              const exeFiles = dirExes.filter(f => f.endsWith('.exe'));
              if (exeFiles.length > 0) {
                apps.push({
                  name: entry.name,
                  path: path.join(programDir, entry.name, exeFiles[0]),
                  source: 'installed',
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(`[AppDiscoverer] 扫描程序目录失败: ${programDir}`, error);
      }
    }

    return apps;
  }

  // 从注册表扫描
  private async scanRegistry(): Promise<AppInfo[]> {
    const apps: AppInfo[] = [];

    try {
      // 扫描 32位和64位程序
      const registryPaths = [
        'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
        'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
        'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      ];

      for (const regPath of registryPaths) {
        try {
          const command = `powershell -Command "Get-ItemProperty -Path '${regPath}\\*' -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -and $_.InstallLocation } | Select-Object DisplayName, InstallLocation, Publisher, DisplayVersion | ConvertTo-Json"`;
          const { stdout } = await execAsync(command);

          if (stdout.trim()) {
            const programs = JSON.parse(stdout);
            const programArray = Array.isArray(programs) ? programs : [programs];

            for (const prog of programArray) {
              if (prog.DisplayName && prog.InstallLocation) {
                const exePath = this.findMainExe(prog.InstallLocation);
                if (exePath) {
                  apps.push({
                    name: prog.DisplayName,
                    path: exePath,
                    publisher: prog.Publisher,
                    version: prog.DisplayVersion,
                    source: 'registry',
                  });
                }
              }
            }
          }
        } catch (error) {
          // 忽略单个注册表路径的错误
        }
      }
    } catch (error) {
      console.error('[AppDiscoverer] 注册表扫描失败', error);
    }

    return apps;
  }

  // 在目录中查找主exe文件
  private findMainExe(dir: string): string | null {
    try {
      if (!fs.existsSync(dir)) return null;

      // 查找与目录名匹配的exe
      const dirName = path.basename(dir);
      const potentialExe = path.join(dir, dirName + '.exe');
      if (fs.existsSync(potentialExe)) return potentialExe;

      // 查找目录中的第一个exe
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.exe'));
      return files.length > 0 ? path.join(dir, files[0]) : null;
    } catch {
      return null;
    }
  }

  // 去重应用列表
  private deduplicateApps(apps: AppInfo[]): AppInfo[] {
    const seen = new Map<string, AppInfo>();

    for (const app of apps) {
      const key = app.name.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, app);
      } else {
        // 保留来源更好的
        const existing = seen.get(key)!;
        const sourcePriority = { registry: 4, startmenu: 3, installed: 2, common: 1 };
        if ((sourcePriority[app.source] || 0) > (sourcePriority[existing.source] || 0)) {
          seen.set(key, app);
        }
      }
    }

    return Array.from(seen.values());
  }

  // 搜索应用
  async search(query: string, maxResults: number = 10): Promise<AppInfo[]> {
    const allApps = await this.discoverAll();
    
    // 模糊匹配
    const results = allApps
      .map(app => ({
        app,
        score: this.fuzzyMatchScore(query, app.name),
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(r => r.app);

    return results;
  }

  // 模糊匹配评分
  private fuzzyMatchScore(pattern: string, text: string): number {
    const p = pattern.toLowerCase();
    const t = text.toLowerCase();

    if (t === p) return 100;
    if (t.startsWith(p)) return 90;
    if (t.includes(p)) return 70;

    // 首字母匹配
    const pChars = p.split('');
    const tChars = t.split('');
    let matchCount = 0;
    let lastIdx = -1;

    for (const char of pChars) {
      const idx = tChars.indexOf(char, lastIdx + 1);
      if (idx !== -1) {
        matchCount++;
        lastIdx = idx;
      }
    }

    if (matchCount === pChars.length) {
      return 50;
    }

    return matchCount / pChars.length * 30;
  }

  // 获取运行中的应用
  async getRunningApps(): Promise<RunningApp[]> {
    const apps: RunningApp[] = [];

    try {
      // 使用 tasklist 获取运行中的进程
      const command = 'powershell -Command "Get-Process | Where-Object { $_.MainWindowTitle -ne \\\"\\\" } | Select-Object Name, Id, WorkingSet64 | ConvertTo-Json"';
      const { stdout } = await execAsync(command);

      if (stdout.trim()) {
        const processes = JSON.parse(stdout);
        const processArray = Array.isArray(processes) ? processes : [processes];

        for (const proc of processArray) {
          apps.push({
            name: proc.Name,
            pid: proc.Id,
            memory: Math.round(proc.WorkingSet64 / 1024 / 1024),
          });
        }
      }
    } catch (error) {
      console.error('[AppDiscoverer] 获取运行应用失败', error);
    }

    return apps;
  }

  // 启动应用
  async launch(appPath: string): Promise<void> {
    const command = process.platform === 'win32' 
      ? `start "" "${appPath}"`
      : `open "${appPath}"`;

    await execAsync(command);
    console.log(`[AppDiscoverer] 已启动: ${appPath}`);
  }

  // 关闭应用
  async close(appName: string): Promise<void> {
    const command = `taskkill /IM "${appName}.exe" /F`;
    await execAsync(command);
    console.log(`[AppDiscoverer] 已关闭: ${appName}`);
  }

  // 获取缓存状态
  getCacheStatus(): { count: number; lastUpdated: Date | null; valid: boolean } {
    return {
      count: this.appCache.length,
      lastUpdated: this.cacheLastUpdated,
      valid: this.isCacheValid(),
    };
  }

  // 清除缓存
  clearCache(): void {
    this.appCache = [];
    this.cacheLastUpdated = null;
    console.log('[AppDiscoverer] 缓存已清除');
  }
}

// 单例
export const appDiscoverer = new AppDiscoverer();
