// 回收站管理器 - Windows回收站操作
// 支持列出、恢复、永久删除、清空回收站

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface RecycledFile {
  id: string;                 // 回收站中的ID
  originalPath: string;       // 原始路径
  name: string;              // 文件名
  size: number;              // 文件大小
  deletedDate: string;       // 删除日期
  type: 'file' | 'folder';
}

export interface RecycleBinInfo {
  totalSize: number;         // 回收站总大小（字节）
  fileCount: number;         // 文件数量
  drive: string;             // 驱动器
}

export class RecycleBinManager {
  constructor() {
    console.log('[RecycleBin] 回收站管理器已初始化');
  }

  // 获取回收站信息
  async getInfo(): Promise<RecycleBinInfo> {
    try {
      // 使用 PowerShell 获取回收站信息
      const script = `
        $shell = New-Object -ComObject Shell.Application
        $recycleBin = $shell.Namespace(10)
        $items = $recycleBin.Items()
        
        $totalSize = 0
        foreach ($item in $items) {
          try { $totalSize += $item.Size } catch {}
        }
        
        @{
          totalSize = $totalSize
          fileCount = $items.Count
          drive = 'C:'
        } | ConvertTo-Json
      `;

      const { stdout } = await execAsync(`powershell -Command "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
      const result = JSON.parse(stdout.trim());

      return {
        totalSize: result.totalSize || 0,
        fileCount: result.fileCount || 0,
        drive: result.drive || 'C:',
      };
    } catch (error) {
      console.error('[RecycleBin] 获取回收站信息失败', error);
      return { totalSize: 0, fileCount: 0, drive: 'C:' };
    }
  }

  // 列出回收站中的文件
  async listFiles(): Promise<RecycledFile[]> {
    try {
      const script = `
        $shell = New-Object -ComObject Shell.Application
        $recycleBin = $shell.Namespace(10)
        $items = $recycleBin.Items()
        
        $files = @()
        foreach ($item in $items) {
          $files += @{
            id = $item.Path
            name = $item.Name
            size = try { $item.Size } catch { 0 }
            deletedDate = $recycleBin.GetDetailsOf($item, 2)
            type = if ($item.IsFolder) { 'folder' } else { 'file' }
            originalPath = $recycleBin.GetDetailsOf($item, 1)
          }
        }
        
        $files | ConvertTo-Json -Depth 3
      `;

      const { stdout } = await execAsync(`powershell -Command "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
      
      if (!stdout.trim()) return [];

      let result = JSON.parse(stdout.trim());
      // 确保是数组
      if (!Array.isArray(result)) {
        result = [result];
      }

      return result.map((item: any, index: number) => ({
        id: item.id || `item-${index}`,
        originalPath: item.originalPath || '',
        name: item.name || 'Unknown',
        size: item.size || 0,
        deletedDate: item.deletedDate || '',
        type: item.type || 'file',
      }));
    } catch (error) {
      console.error('[RecycleBin] 列出回收站文件失败', error);
      return [];
    }
  }

  // 恢复文件
  async restore(fileId: string): Promise<boolean> {
    try {
      // 使用 PowerShell 的 FileSystemObject 恢复文件
      const script = `
        $fso = New-Object -ComObject Scripting.FileSystemObject
        $item = $fso.GetFile('${fileId.replace(/'/g, "''")}')
        $item.UndoDelete()
      `;

      await execAsync(`powershell -Command "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
      console.log(`[RecycleBin] 已恢复: ${fileId}`);
      return true;
    } catch (error) {
      console.error('[RecycleBin] 恢复文件失败', error);
      return false;
    }
  }

  // 恢复多个文件
  async restoreMultiple(fileIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const fileId of fileIds) {
      const result = await this.restore(fileId);
      if (result) {
        success.push(fileId);
      } else {
        failed.push(fileId);
      }
    }

    console.log(`[RecycleBin] 批量恢复完成: 成功 ${success.length}, 失败 ${failed.length}`);
    return { success, failed };
  }

  // 永久删除文件
  async permanentDelete(fileId: string): Promise<boolean> {
    try {
      const script = `
        $fso = New-Object -ComObject Scripting.FileSystemObject
        $item = $fso.GetFile('${fileId.replace(/'/g, "''")}')
        $item.Delete($true)
      `;

      await execAsync(`powershell -Command "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
      console.log(`[RecycleBin] 已永久删除: ${fileId}`);
      return true;
    } catch (error) {
      console.error('[RecycleBin] 永久删除失败', error);
      return false;
    }
  }

  // 永久删除多个文件
  async permanentDeleteMultiple(fileIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const fileId of fileIds) {
      const result = await this.permanentDelete(fileId);
      if (result) {
        success.push(fileId);
      } else {
        failed.push(fileId);
      }
    }

    console.log(`[RecycleBin] 批量删除完成: 成功 ${success.length}, 失败 ${failed.length}`);
    return { success, failed };
  }

  // 清空回收站
  async empty(driveLetter?: string): Promise<boolean> {
    try {
      let script: string;
      
      if (driveLetter) {
        // 清空指定驱动器
        script = `
          $shell = New-Object -ComObject Shell.Application
          $recycleBin = $shell.Namespace(0x${driveLetter.charCodeAt(0).toString(16)}a)
          $items = $recycleBin.Items()
          
          # 使用 SHEmptyRecycleBin
          $result = [System.Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer(
            (Add-Type -MemberDefinition '[DllImport("shell32.dll")] public static extern int SHEmptyRecycleBin(IntPtr hwnd, string pszRootPath, uint32 dwFlags);' -Name "Shell32" -Namespace "Win32" -PassThru)::SHEmptyRecycleBin,
            ([IntPtr]::Zero),
            '${driveLetter}\\',
            0x00000007  # SHERB_NOCONFIRMATION | SHERB_NOPROGRESSUI | SHERB_NOSOUND
          )
        `;
      } else {
        // 清空所有
        script = `
          $shell = New-Object -ComObject Shell.Application
          $recycleBin = $shell.Namespace(10)
          $items = $recycleBin.Items()
          
          # 逐个删除
          foreach ($item in $items) {
            try {
              Remove-Item -Path $item.Path -Force -Recurse -ErrorAction SilentlyContinue
            } catch {}
          }
        `;
      }

      await execAsync(`powershell -Command "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
      console.log(`[RecycleBin] 已清空回收站${driveLetter ? ` (驱动器 ${driveLetter})` : ''}`);
      return true;
    } catch (error) {
      console.error('[RecycleBin] 清空回收站失败', error);
      return false;
    }
  }

  // 移动文件到回收站
  async moveToRecycleBin(filePath: string): Promise<boolean> {
    try {
      const script = `
        $fso = New-Object -ComObject Scripting.FileSystemObject
        if (Test-Path '${filePath.replace(/'/g, "''")}') {
          $fso.DeleteFile('${filePath.replace(/'/g, "''")}', $true)
        } else {
          $fso.DeleteFolder('${filePath.replace(/'/g, "''")}', $true)
        }
      `;

      await execAsync(`powershell -Command "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
      console.log(`[RecycleBin] 已移动到回收站: ${filePath}`);
      return true;
    } catch (error) {
      console.error('[RecycleBin] 移动到回收站失败', error);
      return false;
    }
  }

  // 移动多个文件到回收站
  async moveMultipleToRecycleBin(filePaths: string[]): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const filePath of filePaths) {
      const result = await this.moveToRecycleBin(filePath);
      if (result) {
        success.push(filePath);
      } else {
        failed.push(filePath);
      }
    }

    console.log(`[RecycleBin] 批量移动完成: 成功 ${success.length}, 失败 ${failed.length}`);
    return { success, failed };
  }

  // 搜索回收站
  async search(query: string): Promise<RecycledFile[]> {
    const files = await this.listFiles();
    
    const lowerQuery = query.toLowerCase();
    return files.filter(file => 
      file.name.toLowerCase().includes(lowerQuery) ||
      file.originalPath.toLowerCase().includes(lowerQuery)
    );
  }

  // 格式化文件大小
  formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// 单例
export const recycleBinManager = new RecycleBinManager();
