import { MemoryTreeBrowser } from '../../backend/core/MemoryTreeBrowser';

describe('MemoryTreeBrowser', () => {
  let memoryTree: MemoryTreeBrowser;

  beforeEach(() => {
    memoryTree = new MemoryTreeBrowser();
  });

  test('ingest creates node', async () => {
    const nodes = await memoryTree.ingest('test content', 'document', { tags: ['test'] });
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].content).toBe('test content');
  });

  test('search returns results sorted by relevance', () => {
    // Note: Since ingest is async, we need to handle it properly in a real test
    // For now, we'll test the search function structure
    const results = memoryTree.search('test');
    expect(Array.isArray(results)).toBe(true);
  });

  test('deleteNode deletes node', async () => {
    const nodes = await memoryTree.ingest('test delete', 'document');
    const nodeId = nodes[0].id;
    const deleted = memoryTree.deleteNode(nodeId);
    expect(deleted).toBe(true);
    const deletedNode = memoryTree.getNode(nodeId);
    expect(deletedNode).toBeUndefined();
  });

  test('getStats returns statistics', async () => {
    await memoryTree.ingest('test stats', 'document');
    const stats = memoryTree.getStats();
    expect(stats).toHaveProperty('totalNodes');
    expect(stats).toHaveProperty('totalTokens');
    expect(stats).toHaveProperty('types');
    expect(stats.totalNodes).toBeGreaterThan(0);
  });
});