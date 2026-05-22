// NexMind API - 前端调用接口
// 提供简洁的API给前端使用

import { nexMindMARVIS, ChatMessage, ChatResponse } from '../backend/ai/NexMindMARVIS';

export interface SendMessageOptions {
  stream?: boolean;
  onProgress?: (partial: string) => void;
}

class NexMindAPI {
  private initialized: boolean = false;
  private messageQueue: string[] = [];
  private isProcessing: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('[NexMindAPI] 初始化中...');
    await nexMindMARVIS.initialize();
    this.initialized = true;
    console.log('[NexMindAPI] ✅ 初始化完成');
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return;
    
    console.log('[NexMindAPI] 关闭中...');
    await nexMindMARVIS.shutdown();
    this.initialized = false;
    console.log('[NexMindAPI] 已关闭');
  }

  async sendMessage(
    message: string, 
    options?: SendMessageOptions
  ): Promise<ChatResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`[NexMindAPI] 发送消息: "${message}"`);

    // 如果正在处理，将消息加入队列
    if (this.isProcessing) {
      console.log('[NexMindAPI] 队列中添加消息');
      this.messageQueue.push(message);
      return {
        message: {
          id: `queued-${Date.now()}`,
          role: 'assistant',
          content: '消息已加入队列，请稍候...',
          timestamp: new Date(),
        },
      };
    }

    this.isProcessing = true;

    try {
      const response = await nexMindMARVIS.processMessage(message);
      console.log('[NexMindAPI] ✅ 处理完成');
      
      // 处理队列中的下一条消息
      this.processQueue();
      
      return response;
    } catch (error) {
      console.error('[NexMindAPI] ❌ 处理失败:', error);
      
      this.isProcessing = false;
      throw error;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.messageQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    const nextMessage = this.messageQueue.shift();
    if (nextMessage) {
      console.log('[NexMindAPI] 处理队列中的下一条消息');
      await this.sendMessage(nextMessage);
    }
  }

  getHistory(): ChatMessage[] {
    return nexMindMARVIS.getConversationHistory();
  }

  clearHistory(): void {
    nexMindMARVIS.clearHistory();
  }

  getStatus() {
    return nexMindMARVIS.getSystemStatus();
  }

  // 快捷命令
  async searchFiles(query: string): Promise<ChatResponse> {
    return this.sendMessage(`搜索文件：${query}`);
  }

  async openApp(appName: string): Promise<ChatResponse> {
    return this.sendMessage(`打开${appName}`);
  }

  async closeApp(appName: string): Promise<ChatResponse> {
    return this.sendMessage(`关闭${appName}`);
  }

  async moveFile(source: string, destination: string): Promise<ChatResponse> {
    return this.sendMessage(`移动${source}到${destination}`);
  }

  async copyFile(source: string, destination: string): Promise<ChatResponse> {
    return this.sendMessage(`复制${source}到${destination}`);
  }

  async deleteFile(path: string): Promise<ChatResponse> {
    return this.sendMessage(`删除${path}`);
  }

  async renameFile(path: string, newName: string): Promise<ChatResponse> {
    return this.sendMessage(`重命名${path}为${newName}`);
  }

  async consultExpert(expertId: string, question: string): Promise<ChatResponse> {
    return this.sendMessage(`咨询${expertId}：${question}`);
  }

  async searchMemory(query: string): Promise<ChatResponse> {
    return this.sendMessage(`记得${query}`);
  }

  async webSearch(query: string): Promise<ChatResponse> {
    return this.sendMessage(`搜索${query}`);
  }

  async getHelp(): Promise<ChatResponse> {
    return this.sendMessage('你能做什么');
  }
}

// 单例实例
export const nexmindAPI = new NexMindAPI();

export default nexmindAPI;
