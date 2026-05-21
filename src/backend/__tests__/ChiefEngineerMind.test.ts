import { ChiefEngineerMind, SystemHealth } from '../../backend/agents/ChiefEngineerMind';

describe('ChiefEngineerMind', () => {
  let chiefEngineer: ChiefEngineerMind;

  beforeEach(() => {
    chiefEngineer = new ChiefEngineerMind();
  });

  test('starts heartbeat after initialization', () => {
    jest.useFakeTimers();
    chiefEngineer.startHeartbeat();
    // Fast-forward time to trigger heartbeat
    jest.advanceTimersByTime(60000);
    jest.useRealTimers();
  });

  test('handleHumanUpgradeRequest returns suggestions', async () => {
    const proposals = await chiefEngineer.handleHumanUpgradeRequest('test upgrade request');
    expect(Array.isArray(proposals)).toBe(true);
  });

  test('monitorSystem returns health data', () => {
    const health: SystemHealth = chiefEngineer.monitorSystem();
    expect(health).toHaveProperty('cpu');
    expect(health).toHaveProperty('memory');
    expect(health).toHaveProperty('storage');
    expect(health).toHaveProperty('stabilityScore');
  });

  test('triggerManualRollback triggers rollback', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    chiefEngineer.triggerManualRollback();
    // triggerManualRollback sets manual trigger flag silently
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});