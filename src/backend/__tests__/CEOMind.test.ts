import { CEOMind } from '../../backend/agents/CEOMind';

describe('CEOMind', () => {
  let ceoMind: CEOMind;

  beforeEach(() => {
    ceoMind = new CEOMind();
  });

  test('handleUserMessage returns correct message format', async () => {
    const response = await ceoMind.handleUserMessage('test message');
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('role', 'assistant');
    expect(response).toHaveProperty('content');
    expect(response.timestamp).toBeInstanceOf(Date);
  });

  test('getMessages returns message history', () => {
    const messages = ceoMind.getMessages();
    expect(Array.isArray(messages)).toBe(true);
  });

  test('getCurrentTasks returns task list', () => {
    const tasks = ceoMind.getCurrentTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });
});