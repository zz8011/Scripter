/**
 * IntentRouter - 意图识别与任务分发
 * 负责解析用户输入，识别意图，并将任务分发给合适的 Agent
 */

import { AgentBus } from './AgentBus';
import { AgentScheduler, TaskPriority } from './AgentScheduler';

export interface Intent {
  name: string;
  confidence: number;
  entities: Entity[];
  rawInput: string;
  metadata?: Record<string, unknown>;
}

export interface Entity {
  name: string;
  value: string;
  type: string;
  confidence: number;
  start?: number;
  end?: number;
}

export interface IntentDefinition {
  name: string;
  patterns: string[];
  keywords: string[];
  requiredEntities: string[];
  targetAgents: string[];
  handler?: (intent: Intent, context: RoutingContext) => Promise<unknown>;
  priority?: TaskPriority;
}

export interface RoutingContext {
  sessionId: string;
  userId?: string;
  conversationHistory: string[];
  metadata?: Record<string, unknown>;
}

export interface RoutingResult {
  success: boolean;
  intent?: Intent;
  targetAgents: string[];
  taskIds: string[];
  error?: string;
}

export interface RouteRule {
  id: string;
  intentPattern: RegExp;
  targetAgents: string[];
  condition?: (intent: Intent, context: RoutingContext) => boolean;
  priority?: number;
  transform?: (intent: Intent) => unknown;
}

type IntentClassifier = (input: string, context: RoutingContext) => Promise<Intent[]>;

export class IntentRouter {
  private intents: Map<string, IntentDefinition> = new Map();
  private rules: RouteRule[] = [];
  private agentBus: AgentBus;
  private scheduler: AgentScheduler;
  private classifier?: IntentClassifier;
  private fallbackAgent?: string;
  private confidenceThreshold: number;

  constructor(
    agentBus: AgentBus,
    scheduler: AgentScheduler,
    options: {
      confidenceThreshold?: number;
      fallbackAgent?: string;
    } = {}
  ) {
    this.agentBus = agentBus;
    this.scheduler = scheduler;
    this.confidenceThreshold = options.confidenceThreshold ?? 0.6;
    this.fallbackAgent = options.fallbackAgent;

    // 注册默认意图
    this.registerDefaultIntents();
  }

  /**
   * 注册意图定义
   */
  registerIntent(definition: IntentDefinition): void {
    this.intents.set(definition.name, definition);
    console.log(`Intent registered: ${definition.name}`);
  }

  /**
   * 注销意图
   */
  unregisterIntent(intentName: string): boolean {
    return this.intents.delete(intentName);
  }

  /**
   * 添加路由规则
   */
  addRule(rule: Omit<RouteRule, 'id'>): string {
    const id = this.generateId();
    this.rules.push({ ...rule, id });
    // 按优先级排序
    this.rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return id;
  }

  /**
   * 移除路由规则
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex((r) => r.id === ruleId);
    if (index === -1) return false;
    this.rules.splice(index, 1);
    return true;
  }

  /**
   * 设置意图分类器
   */
  setClassifier(classifier: IntentClassifier): void {
    this.classifier = classifier;
  }

  /**
   * 设置 fallback Agent
   */
  setFallbackAgent(agentId: string): void {
    this.fallbackAgent = agentId;
  }

  /**
   * 路由输入到合适的 Agent
   */
  async route(
    input: string,
    context: RoutingContext
  ): Promise<RoutingResult> {
    try {
      // 1. 识别意图
      const intents = await this.classify(input, context);
      
      if (intents.length === 0) {
        return this.handleNoIntent(input, context);
      }

      // 2. 选择最佳意图
      const bestIntent = intents[0];
      
      if (bestIntent.confidence < this.confidenceThreshold) {
        console.warn(`Low confidence intent: ${bestIntent.name} (${bestIntent.confidence})`);
      }

      // 3. 查找匹配的路由规则
      const targetAgents = this.resolveTargetAgents(bestIntent, context);
      
      if (targetAgents.length === 0) {
        return {
          success: false,
          intent: bestIntent,
          targetAgents: [],
          taskIds: [],
          error: 'No target agents found for intent',
        };
      }

      // 4. 分发任务
      const taskIds: string[] = [];
      const intentDef = this.intents.get(bestIntent.name);

      for (const agentId of targetAgents) {
        const taskId = this.scheduler.submitTask({
          type: `intent:${bestIntent.name}`,
          payload: {
            intent: bestIntent,
            context,
            input,
          },
          agentId,
          priority: intentDef?.priority ?? TaskPriority.NORMAL,
        });
        taskIds.push(taskId);
      }

      // 5. 执行自定义处理器（如果有）
      if (intentDef?.handler) {
        try {
          await intentDef.handler(bestIntent, context);
        } catch (error) {
          console.error(`Intent handler error for ${bestIntent.name}:`, error);
        }
      }

      return {
        success: true,
        intent: bestIntent,
        targetAgents,
        taskIds,
      };
    } catch (error) {
      console.error('Routing error:', error);
      return {
        success: false,
        targetAgents: [],
        taskIds: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 批量路由多个输入
   */
  async routeBatch(
    inputs: string[],
    context: RoutingContext
  ): Promise<RoutingResult[]> {
    return Promise.all(inputs.map((input) => this.route(input, context)));
  }

  /**
   * 获取所有注册的意图
   */
  getIntents(): IntentDefinition[] {
    return Array.from(this.intents.values());
  }

  /**
   * 获取所有路由规则
   */
  getRules(): RouteRule[] {
    return [...this.rules];
  }

  /**
   * 获取意图统计信息
   */
  getStats(): {
    registeredIntents: number;
    routingRules: number;
    confidenceThreshold: number;
    fallbackAgent?: string;
  } {
    return {
      registeredIntents: this.intents.size,
      routingRules: this.rules.length,
      confidenceThreshold: this.confidenceThreshold,
      fallbackAgent: this.fallbackAgent,
    };
  }

  /**
   * 简单的关键词意图分类
   */
  async classify(input: string, context: RoutingContext): Promise<Intent[]> {
    const results: Intent[] = [];

    // 如果使用自定义分类器
    if (this.classifier) {
      return this.classifier(input, context);
    }

    // 默认关键词匹配
    const lowerInput = input.toLowerCase();

    for (const [name, def] of this.intents) {
      let score = 0;
      const matchedKeywords: string[] = [];

      // 检查关键词匹配
      for (const keyword of def.keywords) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          score += 0.3;
          matchedKeywords.push(keyword);
        }
      }

      // 检查模式匹配
      for (const pattern of def.patterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(input)) {
          score += 0.5;
        }
      }

      // 提取实体
      const entities = this.extractEntities(input, def);

      // 检查必需实体
      const hasRequiredEntities = def.requiredEntities.every((req) =>
        entities.some((e) => e.name === req)
      );

      if (!hasRequiredEntities) {
        score *= 0.5;
      }

      if (score > 0) {
        results.push({
          name,
          confidence: Math.min(score, 1.0),
          entities,
          rawInput: input,
          metadata: {
            matchedKeywords,
            hasRequiredEntities,
          },
        });
      }
    }

    // 按置信度排序
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 提取实体
   */
  extractEntities(input: string, intentDef: IntentDefinition): Entity[] {
    const entities: Entity[] = [];
    
    // 简单的实体提取（可扩展为更复杂的 NLP）
    const patterns: Record<string, RegExp> = {
      date: /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/g,
      time: /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      url: /\bhttps?:\/\/[^\s]+/g,
      number: /\b\d+\.?\d*\b/g,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = input.matchAll(pattern);
      for (const match of matches) {
        entities.push({
          name: type,
          value: match[0],
          type,
          confidence: 0.9,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }

    return entities;
  }

  private resolveTargetAgents(
    intent: Intent,
    context: RoutingContext
  ): string[] {
    // 1. 检查路由规则
    for (const rule of this.rules) {
      if (rule.intentPattern.test(intent.name)) {
        if (!rule.condition || rule.condition(intent, context)) {
          return rule.targetAgents;
        }
      }
    }

    // 2. 使用意图定义中的目标 Agent
    const intentDef = this.intents.get(intent.name);
    if (intentDef?.targetAgents.length) {
      return intentDef.targetAgents;
    }

    // 3. 使用 fallback
    if (this.fallbackAgent) {
      return [this.fallbackAgent];
    }

    return [];
  }

  private async handleNoIntent(
    input: string,
    context: RoutingContext
  ): Promise<RoutingResult> {
    console.warn(`No intent recognized for input: ${input}`);

    if (this.fallbackAgent) {
      const taskId = this.scheduler.submitTask({
        type: 'unknown_intent',
        payload: { input, context },
        agentId: this.fallbackAgent,
        priority: TaskPriority.LOW,
      });

      return {
        success: true,
        targetAgents: [this.fallbackAgent],
        taskIds: [taskId],
      };
    }

    return {
      success: false,
      targetAgents: [],
      taskIds: [],
      error: 'No intent recognized and no fallback agent configured',
    };
  }

  private registerDefaultIntents(): void {
    // 帮助意图
    this.registerIntent({
      name: 'help',
      patterns: ['^help', '^帮助', '^怎么用'],
      keywords: ['help', '帮助', '支持', 'support', '怎么用', '如何使用'],
      requiredEntities: [],
      targetAgents: [],
      priority: TaskPriority.HIGH,
    });

    // 问候意图
    this.registerIntent({
      name: 'greeting',
      patterns: ['^hello', '^hi', '^你好', '^您好'],
      keywords: ['hello', 'hi', '你好', '您好', '早上好', '下午好'],
      requiredEntities: [],
      targetAgents: [],
      priority: TaskPriority.NORMAL,
    });

    // 取消意图
    this.registerIntent({
      name: 'cancel',
      patterns: ['^cancel', '^停止', '^取消', '^终止'],
      keywords: ['cancel', '停止', '取消', '终止', 'stop', 'quit', '退出'],
      requiredEntities: [],
      targetAgents: [],
      priority: TaskPriority.CRITICAL,
    });
  }

  private generateId(): string {
    return `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

