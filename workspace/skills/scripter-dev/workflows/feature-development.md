# 功能开发工作流

> 从需求到验证的完整功能开发流程

## 工作流概述

这个工作流用于开发 Scripter 项目的新功能，确保代码质量和项目稳定性。

## 触发条件

用户消息包含以下模式：
- "开发 [功能名称]"
- "implement [功能名称]"
- "add [功能名称]"
- "create [功能名称]"

## 执行步骤

### Step 1: 需求分析

**Agent**: Architect Agent

**任务**: 分析用户需求，明确功能边界

**输入**:
- 用户描述的功能需求
- 项目当前状态
- 相关技术栈

**输出**:
- 需求文档
- 功能边界定义
- 技术可行性分析

**示例输出**:
```markdown
## 需求分析

### 功能描述
用户要求开发"导演 Agent"

### 功能边界
- ✅ Agent 基础框架（已有）
- ✅ Agent 通信机制（已有）
- ❌ 导演 Agent 具体实现
- ❌ 导演 Agent 与其他 Agent 的协作

### 技术可行性
- 技术栈：TypeScript, Next.js, 智谱 AI
- 依赖：lib/agents/core/*
- 风险：AI API 调用成本

### 建议实现方案
1. 创建 DirectorAgent 类
2. 实现导演专长（整体把控、艺术指导）
3. 添加导演 Agent 与其他 Agent 的协作逻辑
```

---

### Step 2: 架构设计

**Agent**: Architect Agent

**任务**: 设计功能架构，确定模块和接口

**输入**:
- Step 1 的需求文档
- 项目现有架构
- 设计原则和最佳实践

**输出**:
- 架构设计文档
- 模块和接口定义
- 依赖关系图

**示例输出**:
```markdown
## 架构设计

### 模块结构
```
lib/agents/agents/
├── DirectorAgent.ts        # 导演 Agent 实现
└── ...

app/agents/
├── director/               # 导演 Agent 页面
└── ...
```

### 接口定义
```typescript
interface DirectorCapabilities {
  artisticGuidance(script: Script): Promise<ArtisticAdvice>;
  overallControl(agents: Agent[]): Promise<ControlDecision>;
  coordination(agentA: Agent, agentB: Agent): Promise<CoordinationResult>;
}
```

### 依赖关系
- DirectorAgent extends Agent
- 依赖 lib/agents/core/*
- 与 ScriptDoctorAgent, CharacterCoachAgent 协作

### 设计原则
1. 单一职责：导演 Agent 只负责整体把控
2. 开闭原则：通过接口与 Agent 通信
3. 依赖倒置：高层模块不依赖低层模块
```

---

### Step 3: 代码生成

**Agent**: Claude 主 Agent

**任务**: 根据架构设计生成代码

**输入**:
- Step 2 的架构设计文档
- 代码模板
- 项目代码风格规范

**输出**:
- TypeScript 代码
- React 组件（如需要）
- 单元测试框架

**示例输出**:
```typescript
// lib/agents/agents/DirectorAgent.ts
import { Agent, Context, Thought, Action, AgentRole, Personality, Feedback } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

export class DirectorAgent extends Agent {
  constructor(personality: Personality, agentBus: any) {
    super(
      '导演',
      AgentRole.DIRECTOR,
      personality,
      agentBus
    );
  }
  
  public async think(context: Context): Promise<Thought> {
    // 导演思考逻辑
    const analysis = await this.analyzeScript(context);
    
    return {
      agentId: this.id,
      taskId: context.taskId,
      analysis,
      insights: [],
      suggestions: [],
      confidence: 0.8,
      timestamp: new Date(),
    };
  }
  
  public async act(context: Context, thought: Thought): Promise<Action> {
    // 导演行动逻辑
    return {
      agentId: this.id,
      taskId: context.taskId,
      type: 'suggest',
      target: 'script',
      content: {},
      reason: '导演建议',
      timestamp: new Date(),
    };
  }
  
  public async learn(feedback: Feedback): Promise<void> {
    // 学习逻辑
  }
}
```

---

### Step 4: 代码审查

**Agent**: Code Reviewer Agent

**任务**: 审查生成的代码，检查安全性和最佳实践

**输入**:
- Step 3 生成的代码
- 代码审查标准
- 项目安全要求

**输出**:
- 审查报告
- 问题列表
- 改进建议

**示例输出**:
```markdown
## 代码审查报告

### 审查文件
- lib/agents/agents/DirectorAgent.ts

### 发现的问题

#### 问题 1: 类型安全
**严重性**: 高
**位置**: Line 15
**描述**: 使用了 `any` 类型
**建议**: 使用具体的类型或 `unknown`

```typescript
// 不好的做法
const data: any = await fetchData();

// 好的做法
interface ApiResponse {
  data: unknown;
}
const response: ApiResponse = await fetchData();
```

#### 问题 2: 错误处理
**严重性**: 中
**位置**: Line 42
**描述**: 异步操作缺少 try-catch
**建议**: 添加错误处理

```typescript
// 不好的做法
const result = await riskyOperation();

// 好的做法
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw error;
}
```

### 改进建议
1. ✅ 添加完整的错误处理
2. ✅ 使用具体的类型定义
3. ✅ 添加单元测试
4. ✅ 添加 JSDoc 注释

### 审查结论
代码质量：良好
需要改进：2 个问题
建议：修复后继续
```

---

### Step 5: 测试生成

**Agent**: Tester Agent

**任务**: 为生成的代码编写测试

**输入**:
- Step 3 生成的代码
- 测试框架（Jest）
- 测试覆盖率要求

**输出**:
- 单元测试代码
- Mock 数据
- 测试工具函数

**示例输出**:
```typescript
// lib/agents/agents/__tests__/DirectorAgent.test.ts
import { DirectorAgent } from '../DirectorAgent';
import { AgentBus } from '../../core/AgentBus';

describe('DirectorAgent', () => {
  let agent: DirectorAgent;
  let agentBus: AgentBus;
  
  beforeEach(() => {
    agentBus = new AgentBus();
    agent = new DirectorAgent(
      {
        element: 'fire',
        speakingStyle: { formal: 0.7, humorous: 0.3, direct: 0.8, poetic: 0.2 },
        decisionStyle: { cautious: 0.6, creative: 0.8, analytical: 0.7 },
      },
      agentBus
    );
  });
  
  describe('think', () => {
    it('should analyze script and return thought', async () => {
      const context = {
        taskId: 'test-001',
        projectId: 'test-project',
        userId: 'test-user',
        script: {
          content: 'test script',
          metadata: { wordCount: 10, sceneCount: 1, characterCount: 2 },
        },
        projectSettings: {
          genre: ['剧情'],
          scriptType: 'movie',
          targetEpisodes: 1,
        },
        agentStates: new Map(),
        conversationHistory: [],
      };
      
      const thought = await agent.think(context);
      
      expect(thought).toBeDefined();
      expect(thought.agentId).toBe(agent.id);
      expect(thought.confidence).toBeGreaterThan(0);
    });
  });
  
  describe('act', () => {
    it('should generate action based on thought', async () => {
      const context = { /* ... */ };
      const thought = await agent.think(context);
      
      const action = await agent.act(context, thought);
      
      expect(action).toBeDefined();
      expect(action.agentId).toBe(agent.id);
      expect(action.type).toBe('suggest');
    });
  });
  
  describe('learn', () => {
    it('should learn from feedback', async () => {
      const feedback = {
        agentId: agent.id,
        taskId: 'test-001',
        type: 'positive',
        content: 'Good suggestion',
        rating: 5,
        timestamp: new Date(),
      };
      
      await agent.learn(feedback);
      
      // 验证学习效果
      expect(agent.getFeedbackHistory()).toContain(feedback);
    });
  });
});
```

---

### Step 6: 文档生成

**Agent**: Documenter Agent

**任务**: 为代码生成文档和注释

**输入**:
- Step 3 生成的代码
- 文档模板
- 项目文档规范

**输出**:
- JSDoc 注释
- README 文档
- 使用指南

**示例输出**:
```markdown
# Director Agent

导演 Agent，负责整体把控和艺术指导。

## 功能

- 整体把控剧本
- 协调其他 Agent
- 提供艺术指导
- 决策优先级

## 使用方法

```typescript
import { DirectorAgent } from '@/lib/agents/agents/DirectorAgent';
import { AgentManager } from '@/lib/agents/AgentManager';

// 创建导演 Agent
const agentManager = AgentManager.getInstance();
const director = new DirectorAgent(
  {
    element: 'fire',
    speakingStyle: { formal: 0.7, humorous: 0.3, direct: 0.8, poetic: 0.2 },
    decisionStyle: { cautious: 0.6, creative: 0.8, analytical: 0.7 },
  },
  agentManager.getAgentBus()
);

// 注册 Agent
agentManager.registerAgent(director);
```

## API

### think(context: Context): Promise<Thought>
分析剧本，生成思考结果。

### act(context: Context, thought: Thought): Promise<Action>
根据思考结果生成行动。

### learn(feedback: Feedback): Promise<void>
根据反馈学习。

## 个性

导演 Agent 的个性：
- 五行：火（热情、活跃）
- 说话风格：正式但略带幽默
- 决策风格：创造型但谨慎
```

---

### Step 7: 集成验证

**Agent**: 所有 Agent 协同

**任务**: 运行测试，验证功能完整性

**输入**:
- Step 5 生成的测试代码
- 项目构建配置
- 验收标准

**输出**:
- 测试结果
- 覆盖率报告
- 验收结论

**示例输出**:
```markdown
## 集成验证报告

### 测试执行

#### 单元测试
```
npm test -- lib/agents/agents/DirectorAgent.test.ts

PASS  lib/agents/agents/DirectorAgent.test.ts
  DirectorAgent
    think
      ✓ should analyze script and return thought (45ms)
    act
      ✓ should generate action based on thought (32ms)
    learn
      ✓ should learn from feedback (28ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

#### 测试覆盖率
```
npm test -- --coverage

--------------------------|---------|----------|----------|----------|----------
File               | % Stmts | % Branch | % Funcs | % Lines
--------------------------|---------|----------|----------|----------
lib/agents/agents/DirectorAgent.ts |    85.23 |   78.95 |   88.89 |   85.23
--------------------------|---------|----------|----------|----------
All files            |    85.23 |   78.95 |   88.89 |   85.23
```

### 验收标准

- [x] 所有单元测试通过
- [x] 测试覆盖率 > 80%
- [x] 代码通过 TypeScript 类型检查
- [x] 代码通过 ESLint 检查
- [ ] 人工测试通过
- [ ] 功能文档完整

### 验收结论

✅ **代码质量良好**
✅ **测试覆盖率达标（85.23%）**
⚠️ **需要人工测试**
⚠️ **需要完善文档**

### 建议

1. 运行应用，进行人工测试
2. 补充功能文档
3. 添加集成测试
4. 性能测试和优化

### 下一步

等待用户确认后继续：
- [ ] 人工测试
- [ ] 文档补充
- [ ] 集成测试
```

---

## 协同模式

### 串行协作

每个步骤完成后，下一个 Agent 基于前一个的结果继续。

**流程**:
```
Step 1 (Architect) → Step 2 (Architect) → Step 3 (Claude) → Step 4 (Code Reviewer) → Step 5 (Tester) → Step 6 (Documenter) → Step 7 (All Agents)
```

### 并行协作

代码审查、测试生成、文档生成可以并行执行。

**流程**:
```
Step 3 (Claude) → Step 4 (Code Reviewer) ─┐
                                    ├─→ Step 5 (Tester)
                                    └─→ Step 6 (Documenter)
```

### 反馈循环

如果任何步骤发现问题，可以返回到前面的步骤重新执行。

**流程**:
```
Step 4 (Code Reviewer) 发现问题
    ↓
返回 Step 3 (Claude) 修复问题
    ↓
重新执行 Step 4-7
```

---

## 验收标准

### 代码质量

- [ ] 所有单元测试通过
- [ ] 测试覆盖率 > 80%
- [ ] 代码通过 TypeScript 类型检查
- [ ] 代码通过 ESLint 检查
- [ ] 没有安全漏洞

### 功能完整性

- [ ] 功能按需求实现
- [ ] 边界情况处理正确
- [ ] 错误处理完善
- [ ] 性能可接受

### 文档

- [ ] API 文档完整
- [ ] 使用指南清晰
- [ ] 代码注释充分
- [ ] 示例代码可用

### 人工验证

- [ ] 人工测试通过
- [ ] 用户确认功能
- [ ] 性能测试通过
- [ ] 安全测试通过

---

## 完成标准

所有以下条件满足时，工作流才算完成：

1. ✅ 所有 Agent 步骤执行完成
2. ✅ 代码审查通过（无严重问题）
3. ✅ 所有测试通过
4. ✅ 测试覆盖率 > 80%
5. ✅ 文档生成完成
6. ✅ 集成验证通过
7. ✅ 用户确认功能正常

---

## 工作流配置

```yaml
workflow:
  name: "功能开发"
  version: "1.0.0"
  
  steps:
    - name: "需求分析"
      agent: "Architect Agent"
      parallel: false
    
    - name: "架构设计"
      agent: "Architect Agent"
      parallel: false
    
    - name: "代码生成"
      agent: "Claude"
      parallel: false
    
    - name: "代码审查"
      agent: "Code Reviewer Agent"
      parallel: true  # 可以与测试生成并行
    
    - name: "测试生成"
      agent: "Tester Agent"
      parallel: true  # 可以与代码审查并行的
    
    - name: "文档生成"
      agent: "Documenter Agent"
      parallel: true  # 可以与测试并行的
    
    - name: "集分验证"
      agent: "All Agents"
      parallel: false
  
  validation:
    test_coverage: 80
    type_check: true
    lint: true
    manual_test: true
```

---

## 注意事项

1. **AI 生成代码需要人工审查**
   - 不要直接使用 AI 生成的代码
   - 检查安全性、错误处理、边界情况

2. **测试覆盖率目标**
   - 单元测试覆盖率 > 80%
   - 关键路径必须有集成测试

3. **文档质量**
   - API 文档必须完整
   - 使用指南必须清晰
   - 代码注释必须充分

4. **用户确认**
   - 关键功能需要用户确认
   - 人工测试必须通过
   - 性能和安全测试必须通过

---

**让功能开发更规范、更可靠！** 🚀
