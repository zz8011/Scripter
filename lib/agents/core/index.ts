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
  agentBus,
} from './AgentBus';

export type {
  AgentMessage,
  Agent as AgentBusAgent,
  AgentBusOptions,
} from './AgentBus';

export {
  AgentScheduler,
} from './AgentScheduler';

export type {
  Task,
} from './AgentScheduler';

export { TaskPriority } from './AgentScheduler';

export {
  IntentRouter,
} from './IntentRouter';

export type {
  Intent,
  Entity,
  IntentDefinition,
  RoutingContext,
  RoutingResult,
  RouteRule,
} from './IntentRouter';

export {
  ContextManager,
  contextManager,
} from './ContextManager';

export type {
  Session,
  SessionStatus,
  SessionContext,
  AgentState,
  MessageRecord,
  ContextSnapshot,
  ContextOptions,
} from './ContextManager';

export {
  ContextAssembler,
} from './ContextAssembler';

export type {
  AssembledContext,
  CacheStats,
  ContextAssemblerOptions,
  AssemblerInput,
} from './ContextAssembler';
