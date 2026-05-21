import { expertManager } from '../../backend/agents/ExpertAgent';
import { ExpertResponse } from '../../shared/types/expert';

describe('ExpertAgent', () => {
  beforeEach(async () => {
    await expertManager.initialize();
  });

  test('ExpertManager initializes all experts', () => {
    const experts = expertManager.getAllExperts();
    expect(experts.length).toBeGreaterThan(0);
  });

  test('summonExpert calls correctly', async () => {
    const experts = expertManager.getAllExperts();
    if (experts.length > 0) {
      const response: ExpertResponse = await expertManager.summonExpert(experts[0].id, 'test request');
      expect(response).toHaveProperty('success');
    }
  });

  test('summonExpert returns error for non-existent expert', async () => {
    const response: ExpertResponse = await expertManager.summonExpert('non-existent-id', 'test request');
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
});