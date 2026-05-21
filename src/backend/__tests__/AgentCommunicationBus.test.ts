import { communicationBus } from '../../shared/types/agentCommunication';

describe('AgentCommunicationBus', () => {
  beforeEach(() => {
    // Reset communication bus state
    communicationBus['agents'].clear();
    communicationBus['messageQueue'] = [];
    communicationBus['subscribers'].clear();
  });

  test('registerAgent registers agent', () => {
    communicationBus.registerAgent({
      agentId: 'agent1',
      agentType: 'test',
      capabilities: [],
      status: 'active'
    });
    // Check if agent is registered by trying to get it from internal map
    expect(communicationBus['agents'].has('agent1')).toBe(true);
  });

  test('sendMessage sends and delivers message', () => {
    const handler = jest.fn();
    communicationBus.subscribe('agent2', handler);
    
    const messageId = communicationBus.sendMessage({
      from: 'agent1',
      to: 'agent2',
      type: 'request',
      action: 'test-action',
      payload: { data: 'test' },
      priority: 'medium'
    });
    
    expect(typeof messageId).toBe('string');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].action).toBe('test-action');
  });

  test('subscribe/unsubscribe works', () => {
    const handler = jest.fn();
    communicationBus.subscribe('agent1', handler);
    
    communicationBus.sendMessage({
      from: 'agent2',
      to: 'agent1',
      type: 'notification',
      action: 'test',
      payload: {},
      priority: 'low'
    });
    
    expect(handler).toHaveBeenCalledTimes(1);
    
    communicationBus.unsubscribe('agent1', handler);
    
    communicationBus.sendMessage({
      from: 'agent2',
      to: 'agent1',
      type: 'notification',
      action: 'test2',
      payload: {},
      priority: 'low'
    });
    
    expect(handler).toHaveBeenCalledTimes(1); // Should not be called after unsubscribe
  });

  test('broadcast broadcasts message to all agents', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    
    communicationBus.registerAgent({
      agentId: 'agent1',
      agentType: 'test',
      capabilities: [],
      status: 'active'
    });
    
    communicationBus.registerAgent({
      agentId: 'agent2',
      agentType: 'test',
      capabilities: [],
      status: 'active'
    });
    
    communicationBus.subscribe('agent1', handler1);
    communicationBus.subscribe('agent2', handler2);
    
    communicationBus.broadcast('agent3', 'test-broadcast', { data: 'broadcast' });
    
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});