/**
 * 多 Agent 协作类型定义
 * Multi-Agent Collaboration Types
 */

// Agent 类型（基于五行）
export type AgentType = 'doctor' | 'coach' | 'plot' | 'scene' | 'world';

// Agent 状态
export type AgentStatus = 'idle' | 'thinking' | 'working' | 'completed' | 'error';

// 消息类型
export type MessageType = 'user' | 'agent' | 'system' | 'collaboration';

// Agent 定义
export interface Agent {
  id: AgentType;
  name: string;
  title: string;
  element: '金' | '水' | '火' | '木' | '土';
  color: string;
  icon: string;
  description: string;
  personality: string;
  status: AgentStatus;
  isActive: boolean;
}

// 消息
export interface Message {
  id: string;
  type: MessageType;
  agentId?: AgentType;
  content: string;
  timestamp: Date;
  metadata?: {
    thinking?: string;
    suggestions?: string[];
    references?: string[];
  };
}

// 协作会话
export interface CollaborationSession {
  id: string;
  title: string;
  agents: AgentType[];
  messages: Message[];
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// WebSocket 消息
export interface WebSocketMessage {
  type: 'agent_status' | 'agent_message' | 'collaboration_start' | 'collaboration_end' | 'user_message' | 'error';
  payload: unknown;
}

// 控制操作
export type ControlAction = 'pause' | 'resume' | 'intervene' | 'skip' | 'reset';
