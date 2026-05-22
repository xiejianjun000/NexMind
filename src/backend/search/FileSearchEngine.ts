// 文件搜索引擎 - 完整实现
// 支持文件名模糊匹配、内容搜索、索引加速

import * as fs from 'fs';
import * as path from 'path';
import { FileInfo } from './TauriAPI';

export interface SearchOptions {
  query: string;                    // 搜索关键词
  directory?: string;               // 搜索目录
  maxResults?: number;              // 最大结果数（默认50）
  includeContent?: boolean;         // 是否搜索文件内容
  fileTypes?: string[];             // 文件类型过滤
  dateRange?: {                     // 日期范围
    start?: Date;
    end?: Date;
  };
  sizeRange?: {                     // 文件大小范围
    min?: number;
    max?: number;
  };
  caseSensitive?: boolean;          // 区分大小写
  useIndex?: boolean;               // 是否使用索引
}

export interface SearchResult extends FileInfo {
  score: number;                   // 相关性评分
  matchType: 'name' | 'content' | 'both';  // 匹配类型
  highlightedName?: string;         // 高亮的名字
  snippet?: string;                // 内容匹配片段
}

export interface SearchIndex {
  lastUpdated: Date;
  fileCount: number;
  totalSize: number;
}

// 模糊匹配算法
export function fuzzyMatch(pattern: string, text: string, caseSensitive: boolean = false): { matches: boolean; score: number } {
  if (!pattern || !text) return { matches: false, score: 0 };

  const p = caseSensitive ? pattern : pattern.toLowerCase();
  const t = caseSensitive ? text : text.toLowerCase();

  // 完全匹配
  if (t.includes(p)) {
    return { matches: true, score: 100 + (p.length / t.length) * 10 };
  }

  // 模糊匹配
  let patternIdx = 0;
  let score = 0;
  let consecutiveBonus = 0;

  for (let textIdx = 0; textIdx < t.length && patternIdx < p.length; textIdx++) {
    if (t[textIdx] === p[patternIdx]) {
      score += 1;
      consecutiveBonus += 1;
      score += consecutiveBonus; // 连续匹配加分
      patternIdx++;
    } else {
      consecutiveBonus = 0;
    }
  }

  if (patternIdx === p.length) {
    return { matches: true, score: score + (pattern.length / text.length) * 20 };
  }

  return { matches: false, score: 0 };
}

// 文件搜索引擎
export class FileSearchEngine {
  private index: Map<string, SearchIndexEntry> = new Map();
  private indexLastUpdated: Date | null = null;
  private isIndexing: boolean = false;

  constructor() {
    console.log('[FileSearchEngine] 文件搜索引擎已初始化');
  }

  // 索引条目
  private interface SearchIndexEntry {
    path: string;
    name: string;
    nameLower: string;
    extension: string;
    size: number;
    modified: Date;
    contentPreview?: string;  // 前1KB预览
  }

  // 构建索引
  async buildIndex(directories: string[] = ['C:\\']): Promise<void> {
    if (this.isIndexing) {
      console.log('[FileSearchEngine] 索引正在构建中...');
      return;
    }

    this.isIndexing = true;
    console.log('[FileSearchEngine] 开始构建索引...');
    const startTime = Date.now();
    let fileCount = 0;

    for (const dir of directories) {
      try {
        await this.indexDirectory(dir, (entry) => {
          this.index.set(entry.path, entry);
          fileCount++;

          if (fileCount % 1000 === 0) {
            console.log(`[FileSearchEngine] 已索引 ${fileCount} 个文件...`);
          }
        });
      } catch (error) {
        console.error(`[FileSearchEngine] 索引目录失败: ${dir}`, error);
      }
    }

    this.indexLastUpdated = new Date();
    this.isIndexing = false;

    console.log(`[FileSearchEngine] ✅ 索引构建完成，共索引 ${fileCount} 个文件，耗时 ${Date.now() - startTime}ms`);
  }

  // 递归索引目录
  private async indexDirectory(dir: string, onFile: (entry: SearchIndexEntry) => void, depth: number = 0): Promise<void> {
    if (depth > 10) return; // 最大深度10层

    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        try {
          if (entry.isDirectory()) {
            // 跳过系统目录
            if (this.shouldSkipDirectory(entry.name)) continue;
            await this.indexDirectory(fullPath, onFile, depth + 1);
          } else if (entry.isFile()) {
            const stats = await fs.promises.stat(fullPath);

            // 读取文件前1KB作为预览
            let contentPreview = '';
            try {
              const fd = await fs.promises.open(fullPath, 'r');
              const buffer = Buffer.alloc(1024);
              const { bytesRead } = await fd.read(buffer, 0, 1024, 0);
              contentPreview = buffer.toString('utf-8', 0, bytesRead);
              await fd.close();
            } catch (e) {
              // 忽略读取错误
            }

            onFile({
              path: fullPath,
              name: entry.name,
              nameLower: entry.name.toLowerCase(),
              extension: path.extname(entry.name).toLowerCase(),
              size: stats.size,
              modified: stats.mtime,
              contentPreview,
            });
          }
        } catch (error) {
          // 忽略单个文件的错误
        }
      }
    } catch (error) {
      // 忽略目录读取错误
    }
  }

  // 判断是否跳过目录
  private shouldSkipDirectory(name: string): boolean {
    const skipDirs = [
      'node_modules', '.git', '.svn', '__pycache__',
      'Windows', 'Program Files', 'Program Files (x86)',
      '$Recycle.Bin', 'System Volume Information',
      'AppData', '.cache', '.temp',
    ];
    return skipDirs.includes(name) || name.startsWith('.');
  }

  // 搜索文件
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const {
      query,
      directory,
      maxResults = 50,
      includeContent = false,
      fileTypes,
      dateRange,
      sizeRange,
      caseSensitive = false,
      useIndex = true,
    } = options;

    console.log(`[FileSearchEngine] 搜索: "${query}" in ${directory || '所有目录'}`);

    const results: SearchResult[] = [];

    if (useIndex && this.index.size > 0) {
      // 使用索引搜索
      results.push(...this.searchWithIndex(options));
    } else {
      // 直接搜索
      results.push(...await this.searchDirectory(options));
    }

    // 过滤文件类型
    let filtered = results;
    if (fileTypes && fileTypes.length > 0) {
      filtered = filtered.filter(r => {
        const ext = '.' + r.extension.replace('.', '');
        return fileTypes.some(t => t.toLowerCase() === ext || t === '*');
      });
    }

    // 过滤日期范围
    if (dateRange) {
      filtered = filtered.filter(r => {
        const modified = new Date(r.modified);
        if (dateRange.start && modified < dateRange.start) return false;
        if (dateRange.end && modified > dateRange.end) return false;
        return true;
      });
    }

    // 过滤大小范围
    if (sizeRange) {
      filtered = filtered.filter(r => {
        if (sizeRange.min && r.size < sizeRange.min) return false;
        if (sizeRange.max && r.size > sizeRange.max) return false;
        return true;
      });
    }

    // 按相关性排序
    filtered.sort((a, b) => b.score - a.score);

    // 限制结果数
    return filtered.slice(0, maxResults);
  }

  // 使用索引搜索
  private searchWithIndex(options: SearchOptions): SearchResult[] {
    const { query, caseSensitive } = options;
    const results: SearchResult[] = [];

    for (const [filePath, entry] of this.index) {
      // 文件名匹配
      const nameMatch = fuzzyMatch(query, entry.name, caseSensitive);

      // 内容匹配
      let contentMatch = { matches: false, score: 0 };
      let snippet = '';
      if (options.includeContent && entry.contentPreview) {
        const idx = entry.contentPreview.toLowerCase().indexOf(query.toLowerCase());
        if (idx !== -1) {
          contentMatch.matches = true;
          contentMatch.score = 50;
          // 提取片段
          const start = Math.max(0, idx - 50);
          const end = Math.min(entry.contentPreview.length, idx + query.length + 50);
          snippet = (start > 0 ? '...' : '') + entry.contentPreview.slice(start, end) + (end < entry.contentPreview.length ? '...' : '');
        }
      }

      if (nameMatch.matches || contentMatch.matches) {
        const score = nameMatch.score + contentMatch.score;
        results.push({
          path: entry.path,
          name: entry.name,
          size: entry.size,
          modified: entry.modified.toISOString(),
          isDirectory: false,
          score,
          matchType: nameMatch.matches && contentMatch.matches ? 'both' : nameMatch.matches ? 'name' : 'content',
          highlightedName: this.highlightMatch(query, entry.name, caseSensitive),
          snippet,
        });
      }
    }

    return results;
  }

  // 直接搜索目录
  private async searchDirectory(options: SearchOptions): Promise<SearchResult[]> {
    const { query, directory = 'C:\\', caseSensitive, includeContent } = options;
    const results: SearchResult[] = [];

    await this.searchDirRecursive(directory, query, results, { caseSensitive, includeContent }, 0);

    return results;
  }

  private async searchDirRecursive(
    dir: string,
    query: string,
    results: SearchResult[],
    options: { caseSensitive: boolean; includeContent: boolean },
    depth: number
  ): Promise<void> {
    if (depth > 10 || results.length >= (options.maxResults || 50)) return;

    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (results.length >= 50) break;

        const fullPath = path.join(dir, entry.name);

        try {
          if (entry.isDirectory()) {
            if (!this.shouldSkipDirectory(entry.name)) {
              await this.searchDirRecursive(fullPath, query, results, options, depth + 1);
            }
          } else if (entry.isFile()) {
            const stats = await fs.promises.stat(fullPath);
            const nameMatch = fuzzyMatch(query, entry.name, options.caseSensitive);

            if (nameMatch.matches) {
              let snippet = '';
              if (options.includeContent) {
                // 读取文件内容（限制大小）
                if (stats.size < 1024 * 1024) { // < 1MB
                  const content = await fs.promises.readFile(fullPath, 'utf-8').catch(() => '');
                  const idx = content.toLowerCase().indexOf(query.toLowerCase());
                  if (idx !== -1) {
                    const start = Math.max(0, idx - 50);
                    const end = Math.min(content.length, idx + query.length + 50);
                    snippet = (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '');
                  }
                }
              }

              results.push({
                path: fullPath,
                name: entry.name,
                size: stats.size,
                modified: stats.mtime.toISOString(),
                isDirectory: false,
                score: nameMatch.score,
                matchType: snippet ? 'both' : 'name',
                highlightedName: this.highlightMatch(query, entry.name, options.caseSensitive),
                snippet,
              });
            }
          }
        } catch (error) {
          // 忽略错误
        }
      }
    } catch (error) {
      // 忽略目录错误
    }
  }

  // 高亮匹配文本
  private highlightMatch(query: string, text: string, caseSensitive: boolean): string {
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${this.escapeRegex(query)})`, flags);
    return text.replace(regex, '**$1**');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 获取索引状态
  getIndexStatus(): SearchIndex | null {
    if (!this.indexLastUpdated) return null;

    return {
      lastUpdated: this.indexLastUpdated,
      fileCount: this.index.size,
      totalSize: Array.from(this.index.values()).reduce((sum, e) => sum + e.size, 0),
    };
  }

  // 清除索引
  clearIndex(): void {
    this.index.clear();
    this.indexLastUpdated = null;
    console.log('[FileSearchEngine] 索引已清除');
  }
}

// 单例
export const fileSearchEngine = new FileSearchEngine();
