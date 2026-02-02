/**
 * AgentScheduler 测试套件
 * 覆盖：调度器启动/停止生命周期、任务超时清理
 */

import { AgentScheduler, Task } from '../core/AgentScheduler';
import { AgentBus } from '../core/AgentBus';

describe('AgentScheduler', () => {
  let agentBus: AgentBus;
  let scheduler: AgentScheduler;

  beforeEach(() => {
    agentBus = new AgentBus();
    // 注册scheduler agent以避免警告
    agentBus.register('scheduler', {});
    scheduler = new AgentScheduler(agentBus);
  });

  afterEach(() => {
    scheduler.stop();
  });

  describe('调度器生命周期', () => {
    it('应该正确启动调度器', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      scheduler.start();
      
      expect(consoleSpy).toHaveBeenCalledWith('AgentScheduler started');
      consoleSpy.mockRestore();
    });

    it('应该正确停止调度器', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      scheduler.start();
      scheduler.stop();
      
      expect(consoleSpy).toHaveBeenCalledWith('AgentScheduler stopped');
      consoleSpy.mockRestore();
    });

    it('重复启动不应出错', () => {
      scheduler.start();
      expect(() => scheduler.start()).not.toThrow();
    });

    it('重复停止不应出错', () => {
      scheduler.start();
      scheduler.stop();
      expect(() => scheduler.stop()).not.toThrow();
    });

    it('未启动时停止不应出错', () => {
      expect(() => scheduler.stop()).not.toThrow();
    });
  });

  describe('任务超时定时器清理', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('任务完成时应该清理定时器', () => {
      scheduler.start();
      
      const taskId = scheduler.submitTask({
        type: 'TEST',
        priority: 'NORMAL',
        payload: {},
        agentId: 'test-agent',
        timeout: 5000
      });

      // 快进时间，触发任务执行
      jest.advanceTimersByTime(150);

      // 模拟任务完成消息
      agentBus.send({
        id: 'complete-1',
        type: 'TASK_COMPLETE',
        priority: 'NORMAL',
        payload: { taskId },
        from: 'test-agent',
        to: 'scheduler',
        timestamp: Date.now()
      });

      // 定时器应该被清理
      expect(scheduler.getRunningCount()).toBe(0);
    });

    it('任务失败时应该清理定时器', () => {
      scheduler.start();
      
      const taskId = scheduler.submitTask({
        type: 'TEST',
        priority: 'NORMAL',
        payload: {},
        agentId: 'test-agent',
        timeout: 5000
      });

      // 快进时间，触发任务执行
      jest.advanceTimersByTime(150);

      // 模拟任务失败消息
      agentBus.send({
        id: 'fail-1',
        type: 'TASK_FAILED',
        priority: 'NORMAL',
        payload: { taskId, error: 'Test error' },
        from: 'test-agent',
        to: 'scheduler',
        timestamp: Date.now()
      });

      // 定时器应该被清理
      expect(scheduler.getRunningCount()).toBe(0);
    });

    it('停止调度器时应该清理所有定时器', () => {
      scheduler.start();
      
      // 提交多个任务
      const taskIds = [];
      for (let i = 0; i < 3; i++) {
        const taskId = scheduler.submitTask({
          type: 'TEST',
          priority: 'NORMAL',
          payload: {},
          agentId: 'test-agent',
          timeout: 10000
        });
        taskIds.push(taskId);
      }

      // 快进时间，触发任务执行
      jest.advanceTimersByTime(150);

      expect(scheduler.getRunningCount()).toBe(3);

      // 停止调度器
      scheduler.stop();

      // 所有任务应该被清理
      expect(scheduler.getRunningCount()).toBe(0);
    });

    it('任务超时时应该自动清理', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      scheduler.start();
      
      const taskId = scheduler.submitTask({
        type: 'TEST',
        priority: 'NORMAL',
        payload: {},
        agentId: 'test-agent',
        timeout: 5000
      });

      // 快进时间，触发任务执行
      jest.advanceTimersByTime(150);
      expect(scheduler.getRunningCount()).toBe(1);

      // 快进时间，触发超时
      jest.advanceTimersByTime(5000);

      // 任务应该被自动清理
      expect(scheduler.getRunningCount()).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('timed out'));

      consoleSpy.mockRestore();
    });
  });

  describe('任务队列', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('应该按优先级排序任务', () => {
      scheduler.start();
      
      // 按不同优先级提交任务
      scheduler.submitTask({
        type: 'TEST',
        priority: 'LOW',
        payload: { order: 3 },
        agentId: 'agent1'
      });
      
      scheduler.submitTask({
        type: 'TEST',
        priority: 'CRITICAL',
        payload: { order: 1 },
        agentId: 'agent1'
      });
      
      scheduler.submitTask({
        type: 'TEST',
        priority: 'HIGH',
        payload: { order: 2 },
        agentId: 'agent1'
      });

      // 检查队列顺序（CRITICAL应该在前）
      expect(scheduler.getQueueLength()).toBe(3);
    });

    it('应该能够取消队列中的任务', () => {
      scheduler.start();
      
      const taskId = scheduler.submitTask({
        type: 'TEST',
        priority: 'NORMAL',
        payload: {},
        agentId: 'agent1'
      });

      expect(scheduler.getQueueLength()).toBe(1);

      const cancelled = scheduler.cancelTask(taskId);
      
      expect(cancelled).toBe(true);
      expect(scheduler.getQueueLength()).toBe(0);
    });

    it('应该能够取消运行中的任务', () => {
      scheduler.start();
      
      const taskId = scheduler.submitTask({
        type: 'TEST',
        priority: 'NORMAL',
        payload: {},
        agentId: 'agent1',
        timeout: 5000
      });

      // 快进时间，触发任务执行
      jest.advanceTimersByTime(150);

      expect(scheduler.getRunningCount()).toBe(1);

      const cancelled = scheduler.cancelTask(taskId);
      
      expect(cancelled).toBe(true);
      expect(scheduler.getRunningCount()).toBe(0);
    });
  });
});
