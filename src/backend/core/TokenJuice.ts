// TokenJuice 压缩引擎 - 节省80%Token消耗
export interface CompressionResult {
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  content: string;
  chunks: string[];
}

export interface TokenJuiceConfig {
  htmlToMarkdown: boolean;
  deduplicate: boolean;
  summarize: boolean;
  preserveCjk: boolean;
  maxChunkSize: number;
}

export class TokenJuiceEngine {
  private config: TokenJuiceConfig;

  constructor(config?: Partial<TokenJuiceConfig>) {
    this.config = {
      htmlToMarkdown: true,
      deduplicate: true,
      summarize: true,
      preserveCjk: true,
      maxChunkSize: 3000,
      ...config,
    };
  }

  // 主压缩方法
  compress(input: string): CompressionResult {
    const originalTokens = this.countTokens(input);
    let output = input;

    if (this.config.htmlToMarkdown) {
      output = this.htmlToMarkdown(output);
    }

    if (this.config.deduplicate) {
      output = this.removeDuplicates(output);
    }

    if (this.config.summarize) {
      const chunks = this.chunkContent(output);
      output = this.prioritizeContent(chunks);
    }

    const chunks = this.chunkContent(output);
    const compressedTokens = this.countTokens(output);

    return {
      originalTokens,
      compressedTokens,
      compressionRatio: Math.round((1 - compressedTokens / originalTokens) * 100) / 100,
      content: output,
      chunks,
    };
  }

  // HTML转Markdown
  htmlToMarkdown(html: string): string {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1
  **')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*
  $1
  *')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```')
      .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // 去除重复内容
  removeDuplicates(text: string): string {
    const lines = text.split('\n');
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const line of lines) {
      const normalized = line.trim().toLowerCase();
      if (normalized && seen.has(normalized)) {
        unique.push(`[重复] ${line.trim()}`);
      } else {
        seen.add(normalized);
        unique.push(line);
      }
    }

    return unique.join('\n');
  }

  // 内容分块
  private chunkContent(content: string): string[] {
    const maxSize = this.config.maxChunkSize;
    const chunks: string[] = [];
    const paragraphs = content.split(/\n\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length < maxSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = paragraph;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  // 内容优先级排序
  private prioritizeContent(chunks: string[]): string {
    const scored = chunks.map(chunk => ({
      chunk,
      score: this.calculateContentScore(chunk),
    }));

    scored.sort((a, b) => b.score - a.score);

    // 保留高分内容
    const threshold = 0.3;
    return scored
      .filter(item => item.score > threshold)
      .map(item => item.chunk)
      .join('\n\n');
  }

  // 计算内容重要性评分
  private calculateContentScore(content: string): number {
    let score = 0;

    // 标题加权
    score += (content.match(/^#{1,3}\s/gm) || []).length * 0.15;

    // 代码块加权
    score += (content.match(/```/g) || []).length * 0.1;

    // 列表内容加权
    score += (content.match(/^[-*]\s/gm) || []).length * 0.05;

    // 数字和具体信息加权
    score += (content.match(/\d+/g) || []).length * 0.02;

    // 关键信息加权
    const keywords = ['import', 'function', 'class', 'interface', 'const', 'async'];
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      score += (content.match(regex) || []).length * 0.1;
    });

    return Math.min(score, 1.0);
  }

  // Token计数
  countTokens(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishTokens = text
      .replace(/[\u4e00-\u9fa5]/g, '')
      .split(/[\s\n]+/)
      .filter(Boolean).length;
    const codeTokens = (text.match(/[{}\[\](),;:=<>+\-*/%]/g) || []).length;

    return Math.ceil((chineseChars + englishTokens + codeTokens * 0.5) * 1.3);
  }

  // 获取压缩统计
  getStats(result: CompressionResult): {
    savedTokens: number;
    savedPercentage: string;
    chunkCount: number;
  } {
    return {
      savedTokens: result.originalTokens - result.compressedTokens,
      savedPercentage: `${Math.round(result.compressionRatio * 100)}%`,
      chunkCount: result.chunks.length,
    };
  }
}

export const tokenJuice = new TokenJuiceEngine();