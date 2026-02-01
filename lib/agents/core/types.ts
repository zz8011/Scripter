/* ==================================================
   Agent 类型定义
   Agent Type Definitions
   ================================================== */

/**
 * Agent 角色
 */
export enum AgentRole {
  SCRIPT_DOCTOR = 'script-doctor',      // 剧本医生
  CHARACTER_COACH = 'character-coach',  // 角色教练
  SCENE_DESIGNER = 'scene-designer',    // 场景设计师
  DIRECTOR = 'director',                // 导演
  SCREENWRITER = 'screenwriter',        // 编剧
  READER = 'reader',                    // 读者
  PRODUCER = 'producer',                // 制片人
  PLOT_PLANNER = 'plot-planner', // 情节策划
  WORLD_BUILDER = 'world-builder', // 世界观构建
}

/**
 * Agent 状态
 */
export enum AgentState {
  IDLE = 'idle',                          // 空闲
  THINKING = 'thinking',                  // 思考中
  ACTING = 'acting',                      // 执行中
  WAITING = 'waiting',                    // 等待中
  ERROR = 'error',                        // 错误
}

/**
 * Agent 个性（类似剧灵生辰八字）
 */
export interface Personality {
  // 五行性格
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  
  // 说话风格
  speakingStyle: {
    formal: number;        // 正式程度 0-1
    humorous: number;      // 幽默程度 0-1
    direct: number;        // 直接程度 0-1
    poetic: number;        // 诗意程度 0-1
  };
  
  // 决策倾向
  decisionStyle: {
    cautious: number;      // 谨慎程度 0-1
    creative: number;      // 创造性 0-1
    analytical: number;    // 分析性 0-1
  };
  
  // 诗号（可选）
  motto?: string;
}

/**
 * 消息类型
 */
export enum MessageType {
  REQUEST = 'request',          // 请求
  RESPONSE = 'response',        // 响应
  NOTIFICATION = 'notification', // 通知
  FEEDBACK = 'feedback',        // 反馈
}

/**
 * Agent 消息
 */
export interface Message {
  id: string;
  from: string;                 // 发送者 Agent ID
  to: string;                   // 接收者 Agent ID（或 'broadcast'）
  type: MessageType;
  content: any;
  timestamp: Date;
  metadata?: {
    priority?: 'low' | 'normal' | 'high';
    requiresResponse?: boolean;
    relatedTaskId?: string;
  };
}

/**
 * 思考结果
 */
export interface Thought {
  agentId: string;
  taskId: string;
  analysis: string;             // 分析内容
  insights: string[];           // 洞察
  suggestions: string[];        // 建议
  confidence: number;            // 置信度 0-1
  timestamp: Date;
}

/**
 * 行动
 */
export interface Action {
  agentId: string;
  taskId: string;
  type: 'suggest' | 'modify' | 'query' | 'collaborate';
  target: string;               // 目标（如场景 ID、人物 ID）
  content: any;
  reason: string;                // 行动原因
  timestamp: Date;
}

/**
 * 反馈
 */
export interface Feedback {
  agentId: string;
  taskId: string;
  type: 'positive' | 'negative' | 'neutral';
  content: string;
  rating?: number;               // 评分 0-5
  timestamp: Date;
}

/**
 * 上下文
 */
export interface Context {
  taskId: string;
  projectId: string;
  userId: string;
  script: {
    content: string;
    metadata: {
      wordCount: number;
      sceneCount: number;
      characterCount: number;
    };
  };
  projectSettings: {
    genre: string[];
    scriptType: string;
    targetEpisodes: number;
  };
  agentStates: Map<string, AgentState>;  // 所有 Agent 的状态
  conversationHistory: Message[];        // 对话历史
}

/**
 * 技能
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  
  // 技能执行
  execute(context: Context, input: any): Promise<any>;
  
  // 技能元数据
  metadata: {
    version: string;
    author: string;
    tags: string[];
    confidence: number;        // 技能置信度 0-1
  };
}

/**
 * Agent 配置
 */
export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  personality: Personality;
  skills: string[];             // 技能 ID 列表
  enabled: boolean;
}
