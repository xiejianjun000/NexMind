// TauriFileAgent - 集成Tauri后端的文件智能体
// 真实调用Tauri命令的文件管理智能体

import { BaseAgent } from './BaseAgent';
import { AgentMessage } from './AgentCommunicationBus';
import { invoke } from '@tauri-apps/api/tauri';

export interface FileSearchResult {
  files: Array<{
    name: string;
    path: string;
    size: number;
    modified: Date;
    type: string;
  }>;
  total: number;
}

export interface FileOrganizeOptions {
  targetFolder: string;
  strategy: 'by-type' | 'by-date' | 'by-size' | 'by-name';
}

export class TauriFileAgent extends BaseAgent {
  constructor() {
    super('tauri-file-agent', '文件管理员（真）', [
      { id: 'file.search', name: '文件搜索', description: '使用Tauri搜索文件' },
      { id: 'file.move', name: '文件移动', description: '移动文件到目标位置' },
      { id: 'file.copy', name: '文件复制', description: '复制文件到目标位置' },
      { id: 'file.delete', name: '文件删除', description: '删除文件到回收站' },
      { id: 'file.rename', name: '文件重命名', description: '重命名文件' },
      { id: 'file.list', name: '列出文件', description: '列出目录中的文件' },
      { id: 'file.info', name: '文件信息', description: '获取文件详细信息' },
    ]);
  }

  protected async handleRequest(message: AgentMessage): Promise<void> {
    const { action, payload, from, id } = message;

    try {
      let result: any;

      switch (action) {
        case 'file.search':
          result = await this.searchFiles(payload.query, payload.directory);
          break;

        case 'file.move':
          result = await this.moveFile(payload.source, payload.destination);
          break;

        case 'file.copy':
          result = await this.copyFile(payload.source, payload.destination);
          break;

        case 'file.delete':
          result = await this.deleteFile(payload.path, payload.toTrash !== false);
          break;

        case 'file.rename':
          result = await this.renameFile(payload.path, payload.newName);
          break;

        case 'file.list':
          result = await this.listDirectory(payload.path);
          break;

        case 'file.info':
          result = await this.getFileInfo(payload.path);
          break;

        default:
          throw new Error(`未知操作: ${action}`);
      }

      this.respond(from, id, action, { success: true, data: result });
      this.broadcast('tauri-file-agent:completed', { action, result });
    } catch (error) {
      console.error(`[TauriFileAgent] Error in ${action}:`, error);
      this.respond(from, id, action, { 
        success: false, 
        error: (error as Error).message 
      });
    }
  }

  private async searchFiles(query: string, directory?: string): Promise<FileSearchResult> {
    console.log(`[TauriFileAgent] Searching for: ${query} in ${directory || 'C:\\'}`);

    this.status = 'busy';
    
    try {
      const files = await invoke<any[]>('search_files', { 
        query, 
        directory: directory || 'C:\\' 
      });

      return {
        files: files.map(f => ({
          name: f.name,
          path: f.path,
          size: f.size,
          modified: new Date(f.modified),
          type: f.isDirectory ? 'folder' : this.getFileType(f.name),
        })),
        total: files.length,
      };
    } finally {
      this.status = 'idle';
    }
  }

  private async moveFile(source: string, destination: string): Promise<{ moved: boolean }> {
    console.log(`[TauriFileAgent] Moving: ${source} → ${destination}`);

    this.status = 'busy';
    
    try {
      await invoke('move_file', { source, destination });
      return { moved: true };
    } finally {
      this.status = 'idle';
    }
  }

  private async copyFile(source: string, destination: string): Promise<{ copied: boolean }> {
    console.log(`[TauriFileAgent] Copying: ${source} → ${destination}`);

    this.status = 'busy';
    
    try {
      await invoke('copy_file', { source, destination });
      return { copied: true };
    } finally {
      this.status = 'idle';
    }
  }

  private async deleteFile(path: string, toTrash: boolean = true): Promise<{ deleted: boolean }> {
    console.log(`[TauriFileAgent] Deleting: ${path} (toTrash: ${toTrash})`);

    this.status = 'busy';
    
    try {
      await invoke('delete_file', { path, toTrash });
      return { deleted: true };
    } finally {
      this.status = 'idle';
    }
  }

  private async renameFile(path: string, newName: string): Promise<{ renamed: boolean }> {
    console.log(`[TauriFileAgent] Renaming: ${path} → ${newName}`);

    this.status = 'busy';
    
    try {
      await invoke('rename_file', { path, newName });
      return { renamed: true };
    } finally {
      this.status = 'idle';
    }
  }

  private async listDirectory(path: string): Promise<any[]> {
    console.log(`[TauriFileAgent] Listing: ${path}`);

    this.status = 'busy';
    
    try {
      return await invoke<any[]>('list_directory', { path });
    } finally {
      this.status = 'idle';
    }
  }

  private async getFileInfo(path: string): Promise<any> {
    console.log(`[TauriFileAgent] Getting info: ${path}`);

    this.status = 'busy';
    
    try {
      return await invoke('get_file_info', { path });
    } finally {
      this.status = 'idle';
    }
  }

  private getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      'pdf': 'pdf',
      'doc': 'word', 'docx': 'word',
      'xls': 'excel', 'xlsx': 'excel',
      'ppt': 'powerpoint', 'pptx': 'powerpoint',
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
      'mp3': 'audio', 'wav': 'audio',
      'mp4': 'video', 'avi': 'video',
      'zip': 'archive', 'rar': 'archive', '7z': 'archive',
      'txt': 'text', 'md': 'text',
      'js': 'code', 'ts': 'code', 'py': 'code', 'rs': 'code',
    };
    return typeMap[ext] || 'file';
  }
}

export const tauriFileAgent = new TauriFileAgent();
