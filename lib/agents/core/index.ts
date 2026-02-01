/**
 * Gateway Core Module - 多 Agent 协作系统核心
 * 
 * 导出所有核心组件：
 * - AgentBus: Agent 间消息总线
 * - AgentScheduler: 任务调度器
 * - IntentRouter: 意图识别与任务分发
 * - ContextManager: 上下文管理
 */

export {
  AgentBus,
  Message,
  MessageType,
  MessagePriority,
  AgentRegistration,
  agentBus,
} from './AgentBus';

export {
  AgentScheduler,
  Task,
  TaskStatus,
  TaskPriority,
  ScheduleOptions,
  AgentCapacity,
} from './AgentScheduler';

export {
  IntentRouter,
  Intent,
  Entity,
  IntentDefinition,
  RoutingContext,
  RoutingResult,
  RouteRule,
} from './IntentRouter';

export {
  ContextManager,
  Session,
  SessionStatus,
  SessionContext,
  AgentState,
  MessageRecord,
  ContextSnapshot,
  ContextOptions,
  contextManager,
} from './ContextManager';
