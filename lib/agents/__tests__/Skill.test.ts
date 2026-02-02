/**
 * Skill 测试套件
 * 覆盖：Skill ID稳定性、消息发送
 */

import { Skill, CodeSkill, ReviewSkill, SkillConfig } from '../skills/Skill';
import { agentBus, AgentBus } from '../core/AgentBus';

// 模拟agentBus
jest.mock('../core/AgentBus', () => {
  const mockSend = jest.fn();
  return {
    agentBus: {
      send: mockSend,
      register: jest.fn(),
      subscribe: jest.fn()
    },
    AgentBus: jest.fn().mockImplementation(() => ({
      send: mockSend,
      register: jest.fn(),
      subscribe: jest.fn(),
      isRegistered: jest.fn()
    }))
  };
});

describe('Skill', () => {
  describe('Skill ID稳定性', () => {
    it('CodeSkill应该有稳定的ID', () => {
      const skill1 = new CodeSkill('agent1');
      const skill2 = new CodeSkill('agent2');

      expect(skill1.getId()).toBe('code');
      expect(skill2.getId()).toBe('code');
      expect(skill1.getId()).toBe(skill2.getId());
    });

    it('ReviewSkill应该有稳定的ID', () => {
      const skill1 = new ReviewSkill('agent1');
      const skill2 = new ReviewSkill('agent2');

      expect(skill1.getId()).toBe('review');
      expect(skill2.getId()).toBe('review');
      expect(skill1.getId()).toBe(skill2.getId());
    });

    it('相同类型的Skill应该保持ID一致', () => {
      const skills: string[] = [];
      for (let i = 0; i < 10; i++) {
        const skill = new CodeSkill(`agent${i}`);
        skills.push(skill.getId());
      }

      // 所有ID应该相同
      expect(new Set(skills).size).toBe(1);
    });

    it('不同类型Skill应该有不同ID', () => {
      const codeSkill = new CodeSkill('agent1');
      const reviewSkill = new ReviewSkill('agent1');

      expect(codeSkill.getId()).not.toBe(reviewSkill.getId());
    });
  });

  describe('消息发送兼容性', () => {
    let mockSend: jest.Mock;

    beforeEach(() => {
      mockSend = (agentBus.send as jest.Mock);
      mockSend.mockClear();
    });

    it('sendMessage应该发送正确结构的消息', () => {
      const skill = new CodeSkill('test-agent');
      
      // 调用protected方法，需要类型转换
      (skill as any).sendMessage('target-agent', 'TEST_TYPE', { data: 'test' });

      expect(mockSend).toHaveBeenCalledTimes(1);
      
      const sentMessage = mockSend.mock.calls[0][0];
      expect(sentMessage).toMatchObject({
        type: 'TEST_TYPE',
        from: 'test-agent',
        to: 'target-agent',
        payload: { data: 'test' },
        priority: 'NORMAL'
      });
      expect(sentMessage.id).toBeDefined();
      expect(sentMessage.timestamp).toBeDefined();
    });

    it('sendResult应该发送TASK_COMPLETE消息', () => {
      const skill = new CodeSkill('test-agent');
      
      (skill as any).sendResult('task-123', { output: 'result' });

      expect(mockSend).toHaveBeenCalledTimes(1);
      
      const sentMessage = mockSend.mock.calls[0][0];
      expect(sentMessage.type).toBe('TASK_COMPLETE');
      expect(sentMessage.to).toBe('scheduler');
      expect(sentMessage.payload.taskId).toBe('task-123');
      expect(sentMessage.payload.result).toEqual({ output: 'result' });
    });

    it('sendError应该发送TASK_FAILED消息', () => {
      const skill = new CodeSkill('test-agent');
      
      (skill as any).sendError('task-456', 'Something went wrong');

      expect(mockSend).toHaveBeenCalledTimes(1);
      
      const sentMessage = mockSend.mock.calls[0][0];
      expect(sentMessage.type).toBe('TASK_FAILED');
      expect(sentMessage.to).toBe('scheduler');
      expect(sentMessage.payload.taskId).toBe('task-456');
      expect(sentMessage.payload.error).toBe('Something went wrong');
    });
  });

  describe('Skill配置', () => {
    it('应该返回正确的名称', () => {
      const codeSkill = new CodeSkill('agent1');
      expect(codeSkill.getName()).toBe('代码生成');

      const reviewSkill = new ReviewSkill('agent1');
      expect(reviewSkill.getName()).toBe('代码审查');
    });
  });

  describe('Skill执行', () => {
    it('CodeSkill应该执行并返回结果', async () => {
      const skill = new CodeSkill('agent1');
      
      const result = await skill.execute({
        language: 'typescript',
        prompt: 'Generate a function'
      });

      expect(result).toHaveProperty('code');
      expect(result.code).toContain('Generated code');
    });

    it('ReviewSkill应该执行并返回结果', async () => {
      const skill = new ReviewSkill('agent1');
      
      const result = await skill.execute({
        code: 'function test() { return 1; }'
      });

      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.issues)).toBe(true);
    });
  });
});
