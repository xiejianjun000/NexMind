// MemoryStorage - 记忆持久化系统
// 使用SQLite作为本地数据库，支持记忆的增删改查

import { Database } from 'sql.js';
import { MemoryNode, MemoryTree, MemoryType } from '../../shared/types/memory';

class MemoryStorage {
  private db: Database | null = null;
  private dbPath: string;
  private initialized: boolean = false;

  constructor(dbPath: string = './data/nexmind.db') {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 初始化SQL.js
      const SQL = await require('sql.js');
      
      // 尝试从本地存储加载数据库
      const savedDb = localStorage.getItem('nexmind_memory_db');
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new SQL.Database(uint8Array);
      } else {
        this.db = new SQL.Database();
      }

      // 创建表
      this.createTables();
      this.initialized = true;
      console.log('✅ MemoryStorage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MemoryStorage:', error);
      throw error;
    }
  }

  private createTables(): void {
    if (!this.db) return;

    // 记忆节点表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS memory_nodes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        parent_id TEXT,
        metadata TEXT,
        importance REAL DEFAULT 1.0,
        access_count INTEGER DEFAULT 0,
        last_access INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // 记忆树表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS memory_trees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        root_id TEXT,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // 索引
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_nodes_type ON memory_nodes(type)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_nodes_timestamp ON memory_nodes(timestamp)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_nodes_parent ON memory_nodes(parent_id)`);

    this.saveToStorage();
  }

  // 保存到localStorage
  private saveToStorage(): void {
    if (!this.db) return;
    const data = this.db.export();
    const arr = Array.from(data);
    localStorage.setItem('nexmind_memory_db', JSON.stringify(arr));
  }

  // 记忆节点操作
  async saveNode(node: MemoryNode): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memory_nodes 
      (id, content, type, timestamp, parent_id, metadata, importance, access_count, last_access, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      node.id,
      node.content,
      node.type,
      node.timestamp.getTime(),
      node.parentId || null,
      JSON.stringify(node.metadata || {}),
      node.importance || 1.0,
      node.accessCount || 0,
      node.lastAccess?.getTime() || null,
      node.createdAt.getTime(),
      node.updatedAt.getTime(),
    ]);

    stmt.free();
    this.saveToStorage();
  }

  async getNode(id: string): Promise<MemoryNode | null> {
    await this.initialize();
    if (!this.db) return null;

    const result = this.db.exec(`SELECT * FROM memory_nodes WHERE id = ?`, [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0];
    return this.rowToNode(row, result[0].columns);
  }

  async getChildNodes(parentId: string): Promise<MemoryNode[]> {
    await this.initialize();
    if (!this.db) return [];

    const result = this.db.exec(`SELECT * FROM memory_nodes WHERE parent_id = ? ORDER BY timestamp DESC`, [parentId]);
    if (result.length === 0) return [];

    return result[0].values.map(row => this.rowToNode(row, result[0].columns));
  }

  async getAllNodes(): Promise<MemoryNode[]> {
    await this.initialize();
    if (!this.db) return [];

    const result = this.db.exec(`SELECT * FROM memory_nodes ORDER BY timestamp DESC`);
    if (result.length === 0) return [];

    return result[0].values.map(row => this.rowToNode(row, result[0].columns));
  }

  async getNodesByType(type: MemoryType): Promise<MemoryNode[]> {
    await this.initialize();
    if (!this.db) return [];

    const result = this.db.exec(`SELECT * FROM memory_nodes WHERE type = ? ORDER BY importance DESC`, [type]);
    if (result.length === 0) return [];

    return result[0].values.map(row => this.rowToNode(row, result[0].columns));
  }

  async deleteNode(id: string): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    // 删除节点及其所有子节点
    this.db.run(`DELETE FROM memory_nodes WHERE id = ? OR parent_id = ?`, [id, id]);
    this.saveToStorage();
  }

  async updateAccessCount(id: string): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    const now = Date.now();
    this.db.run(`
      UPDATE memory_nodes 
      SET access_count = access_count + 1, last_access = ?
      WHERE id = ?
    `, [now, id]);

    this.saveToStorage();
  }

  async searchNodes(query: string): Promise<MemoryNode[]> {
    await this.initialize();
    if (!this.db) return [];

    const result = this.db.exec(`
      SELECT * FROM memory_nodes 
      WHERE content LIKE ? 
      ORDER BY importance DESC, access_count DESC
    `, [`%${query}%`]);

    if (result.length === 0) return [];

    return result[0].values.map(row => this.rowToNode(row, result[0].columns));
  }

  private rowToNode(row: any[], columns: string[]): MemoryNode {
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });

    return {
      id: obj.id,
      content: obj.content,
      type: obj.type as MemoryType,
      timestamp: new Date(obj.timestamp),
      parentId: obj.parent_id,
      metadata: obj.metadata ? JSON.parse(obj.metadata) : {},
      importance: obj.importance,
      accessCount: obj.access_count,
      lastAccess: obj.last_access ? new Date(obj.last_access) : undefined,
      createdAt: new Date(obj.created_at),
      updatedAt: new Date(obj.updated_at),
    };
  }

  // 记忆树操作
  async saveTree(tree: MemoryTree): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memory_trees 
      (id, name, description, root_id, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      tree.id,
      tree.name,
      tree.description || null,
      tree.rootId || null,
      JSON.stringify(tree.metadata || {}),
      tree.createdAt.getTime(),
      tree.updatedAt.getTime(),
    ]);

    stmt.free();
    this.saveToStorage();
  }

  async getTree(id: string): Promise<MemoryTree | null> {
    await this.initialize();
    if (!this.db) return null;

    const result = this.db.exec(`SELECT * FROM memory_trees WHERE id = ?`, [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0];
    const obj: any = {};
    result[0].columns.forEach((col, i) => {
      obj[col] = row[i];
    });

    return {
      id: obj.id,
      name: obj.name,
      description: obj.description,
      rootId: obj.root_id,
      metadata: obj.metadata ? JSON.parse(obj.metadata) : {},
      createdAt: new Date(obj.created_at),
      updatedAt: new Date(obj.updated_at),
    };
  }

  async getAllTrees(): Promise<MemoryTree[]> {
    await this.initialize();
    if (!this.db) return [];

    const result = this.db.exec(`SELECT * FROM memory_trees ORDER BY updated_at DESC`);
    if (result.length === 0) return [];

    return result[0].values.map(row => {
      const obj: any = {};
      result[0].columns.forEach((col, i) => {
        obj[col] = row[i];
      });

      return {
        id: obj.id,
        name: obj.name,
        description: obj.description,
        rootId: obj.root_id,
        metadata: obj.metadata ? JSON.parse(obj.metadata) : {},
        createdAt: new Date(obj.created_at),
        updatedAt: new Date(obj.updated_at),
      };
    });
  }

  // 统计
  async getStats(): Promise<{
    totalNodes: number;
    totalTrees: number;
    nodesByType: Record<string, number>;
    avgAccessCount: number;
  }> {
    await this.initialize();
    if (!this.db) {
      return {
        totalNodes: 0,
        totalTrees: 0,
        nodesByType: {},
        avgAccessCount: 0,
      };
    }

    const nodesResult = this.db.exec(`SELECT COUNT(*) as count FROM memory_nodes`);
    const treesResult = this.db.exec(`SELECT COUNT(*) as count FROM memory_trees`);
    const typeResult = this.db.exec(`SELECT type, COUNT(*) as count FROM memory_nodes GROUP BY type`);
    const avgResult = this.db.exec(`SELECT AVG(access_count) as avg FROM memory_nodes`);

    const nodesByType: Record<string, number> = {};
    if (typeResult.length > 0) {
      typeResult[0].values.forEach(row => {
        nodesByType[row[0] as string] = row[1] as number;
      });
    }

    return {
      totalNodes: nodesResult[0]?.values[0]?.[0] as number || 0,
      totalTrees: treesResult[0]?.values[0]?.[0] as number || 0,
      nodesByType,
      avgAccessCount: avgResult[0]?.values[0]?.[0] as number || 0,
    };
  }

  // 清理
  async clear(): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    this.db.run(`DELETE FROM memory_nodes`);
    this.db.run(`DELETE FROM memory_trees`);
    this.saveToStorage();
  }

  // 导出数据
  async exportData(): Promise<{
    nodes: MemoryNode[];
    trees: MemoryTree[];
  }> {
    const nodes = await this.getAllNodes();
    const trees = await this.getAllTrees();
    return { nodes, trees };
  }

  // 导入数据
  async importData(data: { nodes: MemoryNode[]; trees: MemoryTree[] }): Promise<void> {
    await this.clear();
    
    for (const tree of data.trees) {
      await this.saveTree(tree);
    }
    
    for (const node of data.nodes) {
      await this.saveNode(node);
    }
  }

  // 关闭数据库
  close(): void {
    if (this.db) {
      this.saveToStorage();
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

// 导出单例实例
export const memoryStorage = new MemoryStorage();
export default MemoryStorage;
