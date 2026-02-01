/**
 * ContextManager - 上下文管理
 * 负责管理对话上下文、会话状态和历史记录
 */

export interface Session {
  id: string;
  userId?: string;
  createdAt: number;
  lastActivityAt: number;
  context: SessionContext;
  history: MessageRecord[];
  metadata: Record<string, unknown>;
  status: SessionStatus;
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CLOSED = 'closed',
}

export interface SessionContext {
  currentIntent?: string;
  currentTask?: string;
  variables: Map<string, unknown>;
  agentStates: Map<string, AgentState>;
}

export interface AgentState {
  agentId: string;
  status: 'idle' | 'busy' | 'error';
  currentTask?: string;
  lastActivity: number;
  data?: Record<string, unknown>;
}

export interface MessageRecord {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  agentId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface ContextSnapshot {
  sessionId: string;
  timestamp: number;
  context: SessionContext;
  history: MessageRecord[];
}

export interface ContextOptions {
  maxHistorySize?: number;
  sessionTimeoutMs?: number;
  cleanupIntervalMs?: number;
  persistPath?: string;
}

export class ContextManager {
  private sessions: Map<string, Session> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();
  private readonly maxHistorySize: number;
  private readonly sessionTimeoutMs: number;
  private cleanupInterval?: ReturnType<typeof setInterval>;
  private snapshots: Map<string, ContextSnapshot[]> = new Map();
  private readonly maxSnapshots: number = 10;

  constructor(options: ContextOptions = {}) {
    this.maxHistorySize = options.maxHistorySize ?? 100;
    this.sessionTimeoutMs = options.sessionTimeoutMs ?? 30 * 60 * 1000; // 30分钟

    // 启动清理定时器
    const cleanupInterval = options.cleanupIntervalMs ?? 5 * 60 * 1000; // 5分钟
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupInterval);
  }

  /**
   * 创建新会话
   */
  createSession(userId?: string, metadata?: Record<string, unknown>): Session {
    const sessionId = this.generateId();
    const now = Date.now();

    const session: Session = {
      id: sessionId,
      userId,
      createdAt: now,
      lastActivityAt: now,
      context: {
        variables: new Map(),
        agentStates: new Map(),
      },
      history: [],
      metadata: metadata ?? {},
      status: SessionStatus.ACTIVE,
    };

    this.sessions.set(sessionId, session);

    // 关联到用户
    if (userId) {
      const userSess = this.userSessions.get(userId) ?? new Set();
      userSess.add(sessionId);
      this.userSessions.set(userId, userSess);
    }

    console.log(`Session created: ${sessionId}`);
    return session;
  }

  /**
   * 获取会话
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 获取或创建会话
   */
  getOrCreateSession(
    sessionId: string,
    userId?: string
  ): Session {
    let session = this.sessions.get(sessionId);
    
    if (!session || session.status === SessionStatus.EXPIRED) {
      session = this.createSession(userId);
    }
    
    return session;
  }

  /**
   * 关闭会话
   */
  closeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = SessionStatus.CLOSED;
    console.log(`Session closed: ${sessionId}`);
    return true;
  }

  /**
   * 暂停会话
   */
  pauseSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== SessionStatus.ACTIVE) return false;

    session.status = SessionStatus.PAUSED;
    console.log(`Session paused: ${sessionId}`);
    return true;
  }

  /**
   * 恢复会话
   */
  resumeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== SessionStatus.PAUSED) return false;

    session.status = SessionStatus.ACTIVE;
    session.lastActivityAt = Date.now();
    console.log(`Session resumed: ${sessionId}`);
    return true;
  }

  /**
   * 添加消息到会话历史
   */
  addMessage(
    sessionId: string,
    role: MessageRecord['role'],
    content: string,
    options?: {
      agentId?: string;
      metadata?: Record<string, unknown>;
    }
  ): MessageRecord | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const message: MessageRecord = {
      id: this.generateId(),
      role,
      content,
      agentId: options?.agentId,
      timestamp: Date.now(),
      metadata: options?.metadata,
    };

    session.history.push(message);
    session.lastActivityAt = Date.now();

    // 限制历史记录大小
    if (session.history.length > this.maxHistorySize) {
      session.history = session.history.slice(-this.maxHistorySize);
    }

    return message;
  }

  /**
   * 获取会话历史
   */
  getHistory(
    sessionId: string,
    options?: {
      limit?: number;
      roles?: MessageRecord['role'][];
      since?: number;
    }
  ): MessageRecord[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    let history = [...session.history];

    if (options?.roles) {
      history = history.filter((m) => options.roles?.includes(m.role));
    }

    if (options?.since) {
      history = history.filter((m) => m.timestamp >= options.since!);
    }

    if (options?.limit) {
      history = history.slice(-options.limit);
    }

    return history;
  }

  /**
   * 设置上下文变量
   */
  setVariable(
    sessionId: string,
    key: string,
    value: unknown
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.context.variables.set(key, value);
    session.lastActivityAt = Date.now();
    return true;
  }

  /**
   * 获取上下文变量
   */
  getVariable(sessionId: string, key: string): unknown {
    const session = this.sessions.get(sessionId);
    return session?.context.variables.get(key);
  }

  /**
   * 删除上下文变量
   */
  deleteVariable(sessionId: string, key: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    return session.context.variables.delete(key);
  }

  /**
   * 获取所有变量
   */
  getAllVariables(sessionId: string): Record<string, unknown> {
    const session = this.sessions.get(sessionId);
    if (!session) return {};

    const result: Record<string, unknown> = {};
    for (const [key, value] of session.context.variables) {
      result[key] = value;
    }
    return result;
  }

  /**
   * 设置当前意图
   */
  setCurrentIntent(sessionId: string, intent: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.context.currentIntent = intent;
    session.lastActivityAt = Date.now();
    return true;
  }

  /**
   * 获取当前意图
   */
  getCurrentIntent(sessionId: string): string | undefined {
    const session = this.sessions.get(sessionId);
    return session?.context.currentIntent;
  }

  /**
   * 设置当前任务
   */
  setCurrentTask(sessionId: string, taskId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.context.currentTask = taskId;
    session.lastActivityAt = Date.now();
    return true;
  }

  /**
   * 获取当前任务
   */
  getCurrentTask(sessionId: string): string | undefined {
    const session = this.sessions.get(sessionId);
    return session?.context.currentTask;
  }

  /**
   * 更新 Agent 状态
   */
  updateAgentState(
    sessionId: string,
    agentId: string,
    state: Partial<AgentState>
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const existing = session.context.agentStates.get(agentId);
    const newState: AgentState = {
      agentId,
      status: 'idle',
      lastActivity: Date.now(),
      ...existing,
      ...state,
    };

    session.context.agentStates.set(agentId, newState);
    session.lastActivityAt = Date.now();
    return true;
  }

  /**
   * 获取 Agent 状态
   */
  getAgentState(sessionId: string, agentId: string): AgentState | undefined {
    const session = this.sessions.get(sessionId);
    return session?.context.agentStates.get(agentId);
  }

  /**
   * 获取所有 Agent 状态
   */
  getAllAgentStates(sessionId: string): AgentState[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.context.agentStates.values());
  }

  /**
   * 创建上下文快照
   */
  createSnapshot(sessionId: string): ContextSnapshot | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const snapshot: ContextSnapshot = {
      sessionId,
      timestamp: Date.now(),
      context: {
        currentIntent: session.context.currentIntent,
        currentTask: session.context.currentTask,
        variables: new Map(session.context.variables),
        agentStates: new Map(session.context.agentStates),
      },
      history: [...session.history],
    };

    // 保存快照
    const snapshots = this.snapshots.get(sessionId) ?? [];
    snapshots.push(snapshot);
    
    // 限制快照数量
    if (snapshots.length > this.maxSnapshots) {
      snapshots.shift();
    }
    
    this.snapshots.set(sessionId, snapshots);
    return snapshot;
  }

  /**
   * 恢复快照
   */
  restoreSnapshot(
    sessionId: string,
    timestamp?: number
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const snapshots = this.snapshots.get(sessionId);
    if (!snapshots || snapshots.length === 0) return false;

    let snapshot: ContextSnapshot | undefined;
    
    if (timestamp) {
      snapshot = snapshots.find((s) => s.timestamp === timestamp);
    } else {
      snapshot = snapshots[snapshots.length - 1];
    }

    if (!snapshot) return false;

    // 恢复上下文
    session.context = {
      currentIntent: snapshot.context.currentIntent,
      currentTask: snapshot.context.currentTask,
      variables: new Map(snapshot.context.variables),
      agentStates: new Map(snapshot.context.agentStates),
    };
    session.history = [...snapshot.history];
    session.lastActivityAt = Date.now();

    console.log(`Session ${sessionId} restored to snapshot at ${snapshot.timestamp}`);
    return true;
  }

  /**
   * 获取用户的所有会话
   */
  getUserSessions(userId: string): Session[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter((s): s is Session => s !== undefined);
  }

  /**
   * 获取所有活跃会话
   */
  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === SessionStatus.ACTIVE
    );
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    pausedSessions: number;
    expiredSessions: number;
    closedSessions: number;
    totalUsers: number;
  } {
    const sessions = Array.from(this.sessions.values());
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.status === SessionStatus.ACTIVE).length,
      pausedSessions: sessions.filter((s) => s.status === SessionStatus.PAUSED).length,
      expiredSessions: sessions.filter((s) => s.status === SessionStatus.EXPIRED).length,
      closedSessions: sessions.filter((s) => s.status === SessionStatus.CLOSED).length,
      totalUsers: this.userSessions.size,
    };
  }

  /**
   * 清理过期会话
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions) {
      if (session.status === SessionStatus.CLOSED) {
        this.sessions.delete(sessionId);
        cleaned++;
        continue;
      }

      if (
        session.status === SessionStatus.ACTIVE &&
        now - session.lastActivityAt > this.sessionTimeoutMs
      ) {
        session.status = SessionStatus.EXPIRED;
        console.log(`Session expired: ${sessionId}`);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessions.clear();
    this.userSessions.clear();
    this.snapshots.clear();
    console.log('ContextManager destroyed');
  }

  private generateId(): string {
    return `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const contextManager = new ContextManager();
