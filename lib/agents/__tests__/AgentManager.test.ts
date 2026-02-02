/**
 * AgentManager 测试套件
 * 覆盖：幂等初始化、Agent注册
 */

import { AgentManager } from '../core/AgentManager';
import { AgentBus } from '../core/AgentBus';

describe('AgentManager', () => {
  let agentBus: AgentBus;
  let agentManager: AgentManager;

  beforeEach(() => {
    agentBus = new AgentBus();
    agentManager = new AgentManager(agentBus);
  });

  afterEach(() => {
    agentManager.destroy();
  });

  describe('initializeDefaultAgents 幂等性', () => {
    it('第一次调用应该创建默认Agent', () => {
      agentManager.initializeDefaultAgents();
      
      const agents = agentManager.getAllAgents();
      expect(agents.length).toBe(3);
      expect(agents.map(a => a.id)).toContain('coder');
      expect(agents.map(a => a.id)).toContain('reviewer');
      expect(agents.map(a => a.id)).toContain('tester');
    });

    it('多次调用不应该重复创建Agent', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      agentManager.initializeDefaultAgents();
      agentManager.initializeDefaultAgents();
      agentManager.initializeDefaultAgents();
      
      const agents = agentManager.getAllAgents();
      expect(agents.length).toBe(3); // 仍然是3个，不是9个
      expect(consoleSpy).toHaveBeenCalledWith('Default agents already initialized');
      
      consoleSpy.mockRestore();
    });

    it('不应该在部分Agent已存在时报错', () => {
      // 先手动注册一个默认Agent
      agentBus.register('coder', {});
      agentManager['agents'].set('coder', {
        id: 'coder',
        name: '代码助手',
        skills: ['code'],
        status: 'idle',
        sendMessage: () => {}
      });

      // 初始化不应该报错
      expect(() => agentManager.initializeDefaultAgents()).not.toThrow();
      
      const agents = agentManager.getAllAgents();
      expect(agents.length).toBe(3);
    });
  });

  describe('Agent生命周期', () => {
    it('应该正确注册Agent', () => {
      const agent = {
        id: 'custom-agent',
        name: '自定义Agent',
        skills: ['custom'],
        status: 'idle' as const,
        sendMessage: () => {}
      };

      agentManager.registerAgent(agent);

      expect(agentManager.getAgent('custom-agent')).toBe(agent);
      expect(agentBus.isRegistered('custom-agent')).toBe(true);
    });

    it('重复注册应该抛出错误', () => {
      const agent = {
        id: 'custom-agent',
        name: '自定义Agent',
        skills: ['custom'],
        status: 'idle' as const,
        sendMessage: () => {}
      };

      agentManager.registerAgent(agent);

      expect(() => agentManager.registerAgent(agent)).toThrow(/already exists/);
    });

    it('应该正确注销Agent', () => {
      const agent = {
        id: 'custom-agent',
        name: '自定义Agent',
        skills: ['custom'],
        status: 'idle' as const,
        sendMessage: () => {}
      };

      agentManager.registerAgent(agent);
      agentManager.unregisterAgent('custom-agent');

      expect(agentManager.getAgent('custom-agent')).toBeUndefined();
      expect(agentBus.isRegistered('custom-agent')).toBe(false);
    });
  });

  describe('调度器集成', () => {
    it('应该能够获取调度器', () => {
      const scheduler = agentManager.getScheduler();
      expect(scheduler).toBeDefined();
    });

    it('销毁时应该停止调度器', () => {
      const scheduler = agentManager.getScheduler();
      const stopSpy = jest.spyOn(scheduler, 'stop');

      agentManager.destroy();

      expect(stopSpy).toHaveBeenCalled();
    });
  });
});
