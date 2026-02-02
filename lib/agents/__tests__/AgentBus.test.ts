/**
 * AgentBus 测试套件
 * 覆盖：CRITICAL消息去重、消息结构兼容、生命周期
 */

import { AgentBus, AgentMessage } from '../core/AgentBus';

describe('AgentBus', () => {
  let agentBus: AgentBus;

  beforeEach(() => {
    agentBus = new AgentBus();
  });

  afterEach(() => {
    // 清理
  });

  describe('CRITICAL消息去重', () => {
    it('应该去重相同的CRITICAL消息', () => {
      const receivedMessages: AgentMessage[] = [];
      
      // 注册agent
      agentBus.register('agent1', {});
      agentBus.subscribe('agent1', (msg) => receivedMessages.push(msg));

      const criticalMessage: AgentMessage = {
        id: 'msg-1',
        type: 'ALERT',
        priority: 'CRITICAL',
        payload: { data: 'critical' },
        from: 'sender',
        to: 'agent1',
        timestamp: Date.now()
      };

      // 发送相同ID的CRITICAL消息两次
      agentBus.send(criticalMessage);
      agentBus.send(criticalMessage);

      // 应该只接收一次
      expect(receivedMessages.length).toBe(1);
    });

    it('应该允许不同的CRITICAL消息', () => {
      const receivedMessages: AgentMessage[] = [];
      
      agentBus.register('agent1', {});
      agentBus.subscribe('agent1', (msg) => receivedMessages.push(msg));

      const msg1: AgentMessage = {
        id: 'msg-1',
        type: 'ALERT',
        priority: 'CRITICAL',
        payload: { data: 'first' },
        from: 'sender',
        to: 'agent1',
        timestamp: Date.now()
      };

      const msg2: AgentMessage = {
        id: 'msg-2',
        type: 'ALERT',
        priority: 'CRITICAL',
        payload: { data: 'second' },
        from: 'sender',
        to: 'agent1',
        timestamp: Date.now()
      };

      agentBus.send(msg1);
      agentBus.send(msg2);

      expect(receivedMessages.length).toBe(2);
    });

    it('NORMAL消息不应该去重', () => {
      const receivedMessages: AgentMessage[] = [];
      
      agentBus.register('agent1', {});
      agentBus.subscribe('agent1', (msg) => receivedMessages.push(msg));

      const normalMessage: AgentMessage = {
        id: 'msg-1',
        type: 'INFO',
        priority: 'NORMAL',
        payload: { data: 'normal' },
        from: 'sender',
        to: 'agent1',
        timestamp: Date.now()
      };

      // 发送相同ID的NORMAL消息两次
      agentBus.send(normalMessage);
      agentBus.send(normalMessage);

      // NORMAL消息应该接收两次
      expect(receivedMessages.length).toBe(2);
    });
  });

  describe('AgentBus/Agent消息结构兼容', () => {
    it('应该支持send(message)签名', () => {
      const receivedMessages: AgentMessage[] = [];
      
      agentBus.register('agent1', {});
      agentBus.subscribe('agent1', (msg) => receivedMessages.push(msg));

      const message: AgentMessage = {
        id: 'msg-1',
        type: 'TEST',
        priority: 'NORMAL',
        payload: { test: true },
        from: 'sender',
        to: 'agent1',
        timestamp: Date.now()
      };

      agentBus.send(message);

      expect(receivedMessages.length).toBe(1);
      expect(receivedMessages[0]).toMatchObject(message);
    });

    it('应该支持send(to, type, payload)签名', () => {
      const receivedMessages: AgentMessage[] = [];
      
      agentBus.register('agent1', {});
      agentBus.subscribe('agent1', (msg) => receivedMessages.push(msg));

      agentBus.send('agent1', 'TEST', { test: true });

      expect(receivedMessages.length).toBe(1);
      expect(receivedMessages[0].type).toBe('TEST');
      expect(receivedMessages[0].to).toBe('agent1');
      expect(receivedMessages[0].payload).toEqual({ test: true });
    });
  });

  describe('订阅前注册检查', () => {
    it('应该允许未注册的agent订阅（带警告）', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // 不应该抛出错误
      expect(() => {
        agentBus.subscribe('unregistered-agent', () => {});
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('unregistered-agent'));
      
      consoleSpy.mockRestore();
    });

    it('应该允许已注册的agent订阅', () => {
      agentBus.register('registered-agent', {});
      
      expect(() => {
        agentBus.subscribe('registered-agent', () => {});
      }).not.toThrow();
    });
  });

  describe('广播功能', () => {
    it('应该向所有agent广播消息', () => {
      const messages1: AgentMessage[] = [];
      const messages2: AgentMessage[] = [];
      
      agentBus.register('agent1', {});
      agentBus.register('agent2', {});
      agentBus.subscribe('agent1', (msg) => messages1.push(msg));
      agentBus.subscribe('agent2', (msg) => messages2.push(msg));

      agentBus.broadcast({
        id: 'broadcast-1',
        type: 'ANNOUNCEMENT',
        priority: 'HIGH',
        payload: { message: 'hello all' },
        from: 'admin',
        timestamp: Date.now()
      });

      expect(messages1.length).toBe(1);
      expect(messages2.length).toBe(1);
    });
  });

  describe('Agent数量限制', () => {
    it('应该在达到maxAgents时抛出错误', () => {
      const bus = new AgentBus(2);
      
      bus.register('agent1', {});
      bus.register('agent2', {});
      
      expect(() => {
        bus.register('agent3', {});
      }).toThrow(/Max agents limit/);
    });
  });
});
