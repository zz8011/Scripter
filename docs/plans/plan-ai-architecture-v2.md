# AI 架构重构实施计划 v1.0

> **版本**: v1.0
> **创建日期**: 2026-02-08
> **状态**: 待审批
> **目标**: 将 AI 系统从"过度工程化的基础设施"重构为"以创作为中心的能力注册制"

---

## 一、背景与动机

### 1.1 当前问题

基于 2026-02-08 项目评估，当前 AI 系统存在以下核心问题：

| 问题 | 影响 | 严重度 |
|------|------|--------|
| Agent 只能看到剧本前 2000 字符 | AI 无法理解完整剧本上下文 | 致命 |
| Agent 之间完全隔离，无法协作 | 无法做跨维度分析（如人物+剧情） | 高 |
| AgentBus/Scheduler 过度工程化 | 增加维护成本，实际未被 API 使用 | 中 |
| IntentRouter 用关键词匹配做意图识别 | 创作场景下准确率低，且是错误的交互模式 | 高 |
| SkillRegistry 存在但 API 未接入 | 3 个 Skill 无法通过 API 调用 | 高 |
| Skills API POST/DELETE 是空壳 | 前端无法执行 Skill | 致命 |
| 编辑器无法保存 | AI 功能无法在实际创作中使用 | 致命 |

### 1.2 目标架构

**从"Agent 框架"转向"能力注册制 + Story Bible"**：

```
当前架构（过度工程化）:
  IntentRouter → AgentBus → Agent → LLM
  （关键词匹配）  （消息总线）（隔离执行）

目标架构（以创作为中心）:
  用户操作 → SkillRegistry → ContextAssembler → Skill → LLM
  （明确意图）  （能力查找）    （智能上下文）    （执行）
```

核心理念：
- **Story Bible** 作为核心数据结构，而非 Agent 框架
- **Skill 自描述** 所需上下文，而非统一截取 2000 字符
- **Agent 是 Skill 的编排者**，而非独立的 LLM 调用者
- **添加新能力 = 新文件 + 一行注册**

---

## 二、分阶段实施计划

### Phase 0: 基础修复（前置条件）

> 不修复这些，AI 功能无法在实际创作中使用。

#### P0-1: 编辑器服务端保存

**目标**: 编辑器内容可持久化到数据库

**涉及文件**:
- `app/projects/[id]/editor/page.tsx` - 编辑器页面
- `app/api/scenes/[id]/route.ts` - 场景 API（需新增 PATCH）
- `lib/db/queries/scenes.ts` - 数据库查询

**验收标准**:
- 编辑器内容自动保存（debounce 2 秒）
- 刷新页面后内容不丢失
- 保存状态指示器（已保存/保存中/保存失败）

#### P0-2: 接通 Skills API

**目标**: 前端可以通过 API 调用已有的 3 个 Skill

**涉及文件**:
- `app/api/ai/skills/route.ts` - 补全 POST handler
- `lib/agents/skills/Skill.ts` - 修复 sendMessage bug
- `lib/agents/skills/SkillRegistry.ts` - 确保 3 个 Skill 已注册

**验收标准**:
- `POST /api/ai/skills` 可执行 format-fix、dialogue-polish、scene-expand
- 返回结构化结果
- 配额扣减正常

---

### Phase 1: Story Bible 数据结构

> 让 AI 能"理解"整个项目，而不是只看 2000 字符。

#### P1-1: 设计 Story Bible Schema

**Story Bible** 是项目的结构化知识库，包含：

```typescript
// 新增 lib/db/schema/story-bible.ts

interface StoryBible {
  projectId: string;

  // 世界规则（从 worldviewItems 聚合）
  worldRules: {
    era: string;           // 时代背景摘要
    geography: string;     // 地理环境摘要
    socialRules: string;   // 社会规则摘要
    constraints: string[]; // 世界观约束条件
  };

  // 人物档案（从 characters 聚合）
  characterProfiles: {
    id: string;
    name: string;
    role: 'protagonist' | 'antagonist' | 'supporting';
    personality: string;   // 性格摘要
    speechStyle: string;   // 说话风格
    relationships: { targetId: string; relation: string }[];
    arc: string;           // 人物弧光
  }[];

  // 剧情大纲（从 scenes 聚合）
  plotOutline: {
    sceneId: string;
    sceneNumber: number;
    summary: string;       // 场景摘要（AI 生成或手动）
    characters: string[];  // 出场人物
    plotPoints: string[];  // 关键剧情点
  }[];

  // 创作意图
  creativeIntent: {
    genre: string;
    tone: string;
    themes: string[];
    targetAudience: string;
  };

  // 自动更新时间戳
  lastUpdatedAt: Date;
}
```

**涉及文件**:
- `lib/db/schema/story-bible.ts` - 新增 Schema
- `lib/db/queries/story-bible.ts` - CRUD 查询
- `lib/db/schema.ts` - 导出新 Schema

**验收标准**:
- Story Bible 表可正常读写
- 支持按 projectId 查询
- 支持增量更新（不需要每次全量写入）

#### P1-2: Story Bible 自动聚合

**目标**: 当用户编辑人物/世界观/场景时，自动更新 Story Bible

**涉及文件**:
- `lib/story-bible/aggregator.ts` - 聚合逻辑
- 各模块的保存 API - 触发聚合

**聚合策略**:
```
人物保存 → 更新 characterProfiles
世界观保存 → 更新 worldRules
场景保存 → 更新 plotOutline（AI 生成摘要）
项目设置保存 → 更新 creativeIntent
```

**验收标准**:
- 编辑人物后，Story Bible 自动更新对应 characterProfile
- 编辑世界观后，Story Bible 自动更新 worldRules
- 场景保存后，AI 自动生成场景摘要并更新 plotOutline

---

### Phase 2: ContextAssembler + Skill 自描述

> 让每个 Skill 声明自己需要什么上下文，而非统一截取。

#### P2-1: 扩展 Skill 接口

```typescript
// 修改 lib/agents/skills/Skill.ts

export interface SkillDescriptor {
  id: string;
  name: string;
  description: string;

  // 新增：自描述能力
  requiredContext: ContextRequirement[];
  inputSchema: Record<string, any>;   // JSON Schema
  outputSchema: Record<string, any>;  // JSON Schema
  category: SkillCategory;
  tags: string[];

  // 新增：成本估算
  estimatedTokens: { min: number; max: number };
}

export type ContextRequirement =
  | { type: 'currentScene' }                    // 当前正在编辑的场景
  | { type: 'selectedText' }                     // 用户选中的文本
  | { type: 'characterProfile'; characterId?: string }  // 指定人物档案
  | { type: 'allCharacters' }                    // 所有人物列表
  | { type: 'worldRules' }                       // 世界观规则
  | { type: 'plotOutline' }                      // 剧情大纲
  | { type: 'adjacentScenes'; range?: number }   // 前后 N 个场景
  | { type: 'creativeIntent' }                   // 创作意图
  | { type: 'conversationHistory'; limit?: number }; // 对话历史

export type SkillCategory =
  | 'editing'      // 编辑类（格式修复、对白润色）
  | 'analysis'     // 分析类（节奏分析、一致性检查）
  | 'generation'   // 生成类（场景扩展、人物生成）
  | 'knowledge'    // 知识类（网络搜索、类型参考）
  | 'review';      // 审阅类（剧本诊断、综合评审）
```

**涉及文件**:
- `lib/agents/skills/Skill.ts` - 扩展接口
- `lib/agents/skills/DialoguePolishSkill.ts` - 添加 requiredContext
- `lib/agents/skills/FormatFixSkill.ts` - 添加 requiredContext
- `lib/agents/skills/SceneExpandSkill.ts` - 添加 requiredContext

#### P2-2: 实现 ContextAssembler

```typescript
// 新增 lib/agents/context/ContextAssembler.ts

export class ContextAssembler {
  /**
   * 根据 Skill 的 requiredContext 声明，
   * 从 Story Bible + 数据库中组装精确的上下文
   */
  async assemble(
    projectId: string,
    requirements: ContextRequirement[],
    editorState?: { cursorPosition, selectedText, currentSceneId }
  ): Promise<AssembledContext>;
}
```

**涉及文件**:
- `lib/agents/context/ContextAssembler.ts` - 核心实现
- `lib/agents/context/index.ts` - 导出

**验收标准**:
- 对白润色 Skill 声明需要 `currentScene` + `characterProfile`，ContextAssembler 只提供这些
- 一致性检查 Skill 声明需要 `allCharacters` + `plotOutline`，ContextAssembler 提供完整数据
- Token 使用量相比"截取 2000 字符"方案显著降低

---

### Phase 3: 新增知识类 Skill（验证可扩展性）

> 添加第一个"知识类"Skill，验证架构的可扩展性。

#### P3-1: 网络搜索 Skill

**目标**: 用户可以让 AI 搜索参考资料（历史背景、行业术语、地理信息等）

```typescript
// 新增 lib/agents/skills/WebSearchSkill.ts

export class WebSearchSkill extends Skill {
  static descriptor: SkillDescriptor = {
    id: 'web-search',
    name: '参考资料搜索',
    description: '搜索网络获取创作参考资料，如历史背景、地理信息、行业术语等',
    requiredContext: [
      { type: 'creativeIntent' },    // 了解创作方向
      { type: 'worldRules' },        // 了解世界观设定
    ],
    inputSchema: {
      query: 'string',              // 搜索关键词
      category: 'history | geography | terminology | culture | custom',
    },
    outputSchema: {
      results: 'SearchResult[]',
      summary: 'string',            // AI 整理的摘要
      relevance: 'string',          // 与当前创作的关联说明
    },
    category: 'knowledge',
    tags: ['search', 'reference', 'research'],
    estimatedTokens: { min: 500, max: 2000 },
  };
}
```

**涉及文件**:
- `lib/agents/skills/WebSearchSkill.ts` - Skill 实现
- `lib/agents/skills/index.ts` - 注册
- 搜索 API 集成（可选：Bing Search API / SerpAPI / 自建）

**验收标准**:
- 用户输入"帮我查一下唐朝的官职体系"，返回结构化参考资料
- 结果与当前项目的世界观设定关联
- 搜索结果可保存到项目的参考资料库

#### P3-2: 类型参考 Skill

**目标**: 根据剧本类型提供专业参考（悬疑剧的叙事技巧、喜剧的节奏把控等）

```typescript
// 新增 lib/agents/skills/GenreReferenceSkill.ts

export class GenreReferenceSkill extends Skill {
  static descriptor: SkillDescriptor = {
    id: 'genre-reference',
    name: '类型参考',
    description: '根据剧本类型提供专业创作参考和技巧建议',
    requiredContext: [
      { type: 'creativeIntent' },
      { type: 'plotOutline' },
    ],
    inputSchema: {
      aspect: 'narrative | rhythm | character | dialogue | structure',
    },
    outputSchema: {
      references: 'Reference[]',
      techniques: 'Technique[]',
      examples: 'Example[]',
    },
    category: 'knowledge',
    tags: ['genre', 'reference', 'technique'],
    estimatedTokens: { min: 800, max: 3000 },
  };
}
```

**涉及文件**:
- `lib/agents/skills/GenreReferenceSkill.ts` - Skill 实现
- 内置知识库（Prompt 内嵌各类型的创作技巧）

---

### Phase 4: Agent 编排层

> Agent 不再直接调用 LLM，而是编排多个 Skill 完成复杂任务。

#### P4-1: 重构 Agent 为 Skill 编排者

```typescript
// 修改 lib/agents/core/Agent.ts

export abstract class Agent {
  // 不再直接调用 LLM
  // 而是声明自己编排哪些 Skill

  abstract getWorkflow(): SkillWorkflow;

  async execute(context: Context): Promise<AgentResult> {
    const workflow = this.getWorkflow();
    const results: SkillResult[] = [];

    for (const step of workflow.steps) {
      const skill = skillRegistry.getSkill(step.skillId);
      const assembledContext = await contextAssembler.assemble(
        context.projectId,
        skill.descriptor.requiredContext,
        context.editorState
      );
      const result = await skill.execute(assembledContext, step.params);
      results.push(result);
    }

    // Agent 的价值：综合多个 Skill 的结果，给出整体建议
    return this.synthesize(results);
  }
}
```

#### P4-2: 重构 ScriptDoctorAgent

**目标**: 剧本诊断 Agent 编排多个 Skill 做综合评审

```
ScriptDoctorAgent 工作流:
  1. 调用 consistency-check Skill → 一致性问题
  2. 调用 rhythm-analyze Skill → 节奏问题
  3. 调用 dialogue-polish Skill（分析模式）→ 对白质量
  4. 综合以上结果 → 生成诊断报告
```

**涉及文件**:
- `lib/agents/agents/ScriptDoctorAgent.ts` - 重构
- `lib/agents/core/Agent.ts` - 基类修改

**验收标准**:
- ScriptDoctor 不再直接调用 LLM
- 而是编排 3+ 个 Skill，综合结果
- 诊断报告包含多维度分析

---

### Phase 5: AI 嵌入创作流程

> AI 不是侧边栏聊天，而是嵌入到每个创作环节。

#### P5-1: 编辑器内联 AI

**目标**: 在编辑器中直接触发 AI 能力

**交互方式**:
- 选中文本 → 浮动工具栏出现 AI 选项（润色/扩展/分析）
- 输入 `/` → 命令面板（类似 Notion）
- 段落末尾 → 智能续写建议（灰色预览文本）

**涉及文件**:
- `components/editor/` - 编辑器组件
- TipTap 扩展 - AI 相关扩展

#### P5-2: 人物页面 AI 增强

**目标**: 在人物管理页面嵌入 AI 能力

**交互方式**:
- 创建人物时 → AI 建议性格特征（基于世界观）
- 编辑人物时 → AI 检查与其他人物的一致性
- 查看人物时 → AI 生成人物关系分析

#### P5-3: 场景页面 AI 增强

**目标**: 在场景管理页面嵌入 AI 能力

**交互方式**:
- 创建场景时 → AI 建议场景内容（基于剧情大纲）
- 排序场景时 → AI 分析节奏变化
- 查看场景时 → AI 标注连续性问题

---

## 三、技术架构图

### 3.1 目标架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 编辑器    │  │ 人物管理  │  │ 场景管理  │  ...         │
│  │ (内联AI)  │  │ (AI增强)  │  │ (AI增强)  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       └──────────────┼──────────────┘                    │
│                      ↓                                   │
│              ┌───────────────┐                           │
│              │  AI 操作面板   │  (选中文本/命令面板/侧栏)  │
│              └───────┬───────┘                           │
└──────────────────────┼───────────────────────────────────┘
                       ↓
┌──────────────────────┼───────────────────────────────────┐
│                  API 层                                   │
│              ┌───────────────┐                           │
│              │ /api/ai/skill │  统一 Skill 执行入口       │
│              └───────┬───────┘                           │
│                      ↓                                   │
│  ┌───────────────────────────────────────────────┐      │
│  │              SkillRegistry                     │      │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │      │
│  │  │format-  │ │dialogue-│ │scene-   │ ...     │      │
│  │  │fix      │ │polish   │ │expand   │         │      │
│  │  └─────────┘ └─────────┘ └─────────┘        │      │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │      │
│  │  │web-     │ │genre-   │ │consist- │ ...     │      │
│  │  │search   │ │reference│ │ency     │         │      │
│  │  └─────────┘ └─────────┘ └─────────┘        │      │
│  └───────────────────┬───────────────────────────┘      │
│                      ↓                                   │
│  ┌───────────────────────────────────────────────┐      │
│  │           ContextAssembler                     │      │
│  │  根据 Skill.requiredContext 从 Story Bible     │      │
│  │  + 数据库中组装精确上下文                        │      │
│  └───────────────────┬───────────────────────────┘      │
│                      ↓                                   │
│  ┌───────────────────────────────────────────────┐      │
│  │             Story Bible                        │      │
│  │  worldRules | characterProfiles | plotOutline  │      │
│  │  creativeIntent | constraints                  │      │
│  └───────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│                  外部服务                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 智谱 GLM │  │ 搜索 API │  │ T8Star   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Skill 执行流程

```
用户操作（选中文本 → 点击"润色"）
    ↓
前端调用 POST /api/ai/skill
    body: { skillId: 'dialogue-polish', input: { ... }, editorState: { ... } }
    ↓
API 层:
    1. 认证 + 配额检查
    2. SkillRegistry.getSkill('dialogue-polish')
    3. 读取 skill.descriptor.requiredContext
       → [{ type: 'currentScene' }, { type: 'characterProfile' }]
    4. ContextAssembler.assemble(projectId, requiredContext, editorState)
       → 从 Story Bible 获取人物档案
       → 从数据库获取当前场景内容
    5. skill.execute(assembledContext, input)
       → 调用智谱 GLM API
    6. 返回结构化结果
    ↓
前端展示结果（内联替换/侧栏展示/对话框确认）
```

---

## 四、迁移策略

### 4.1 保留什么

| 组件 | 处理方式 | 理由 |
|------|---------|------|
| `AgentBus` | **保留但降级** | 生产级代码，可用于 Agent 编排通信 |
| `AgentScheduler` | **保留但降级** | 可用于异步任务调度 |
| `SkillRegistry` | **保留并增强** | 核心组件，添加 descriptor 支持 |
| `IntentRouter` | **废弃** | 创作场景下关键词匹配不适用 |
| 5 个 Agent 类 | **重构** | 保留领域知识，改为 Skill 编排者 |
| 3 个 Skill 类 | **增强** | 添加 requiredContext 声明 |
| `/api/ai/chat` | **保留** | 对话式交互仍然需要 |
| `/api/ai/stream` | **保留** | 流式响应仍然需要 |
| `/api/ai/skills` | **重写** | 接入 SkillRegistry |

### 4.2 废弃什么

| 组件 | 理由 |
|------|------|
| `IntentRouter` | 创作工具应该让用户明确选择能力，而非猜测意图 |
| `AgentManager.initializeDefaultAgents()` | 硬编码的 coder/reviewer/tester 与剧本创作无关 |
| `ContextManager` | 被 ContextAssembler 替代 |

### 4.3 渐进式迁移

```
Phase 0 → 修复基础，不改架构
Phase 1 → 新增 Story Bible，不影响现有代码
Phase 2 → 扩展 Skill 接口，向后兼容
Phase 3 → 新增 Skill，验证架构
Phase 4 → 重构 Agent，此时旧代码可安全删除
Phase 5 → 前端集成，用户可见的变化
```

每个 Phase 独立可交付，可以在任意 Phase 后暂停。

---

## 五、扩展能力路线图

### 5.1 MVP 阶段 Skills（Phase 0-2）

| Skill | 类别 | 状态 | 说明 |
|-------|------|------|------|
| format-fix | editing | 已有，需增强 | 格式修复 |
| dialogue-polish | editing | 已有，需增强 | 对白润色 |
| scene-expand | generation | 已有，需增强 | 场景扩展 |
| rhythm-analyze | analysis | 需新建 | 节奏分析 |
| consistency-check | analysis | 需新建 | 一致性检查 |
| humanize | editing | 需新建 | 去 AI 味 |

### 5.2 第二阶段 Skills（Phase 3-4）

| Skill | 类别 | 说明 |
|-------|------|------|
| web-search | knowledge | 网络搜索参考资料 |
| genre-reference | knowledge | 类型创作技巧参考 |
| terminology-lookup | knowledge | 专业术语查询 |
| cultural-research | knowledge | 文化背景研究 |
| character-generate | generation | AI 生成完整人设 |
| scene-generate | generation | AI 生成完整场景 |

### 5.3 第三阶段 Skills（Phase 5+）

| Skill | 类别 | 说明 |
|-------|------|------|
| continuity-checker | analysis | 跨场景连续性检查 |
| pacing-optimizer | analysis | 全剧节奏优化 |
| dialogue-voice | analysis | 人物语音一致性 |
| market-analysis | knowledge | 市场趋势分析 |
| co-write | generation | AI 共创模式 |

---

## 六、验收标准

### Phase 0 验收

- [ ] 编辑器内容可保存到数据库并恢复
- [ ] 3 个已有 Skill 可通过 API 调用
- [ ] 配额扣减正常

### Phase 1 验收

- [ ] Story Bible 表结构创建完成
- [ ] 编辑人物/世界观/场景后 Story Bible 自动更新
- [ ] Story Bible 数据可通过 API 查询

### Phase 2 验收

- [ ] Skill 接口包含 requiredContext 声明
- [ ] ContextAssembler 可根据声明组装上下文
- [ ] 对白润色使用精确上下文（非 2000 字符截取）
- [ ] Token 使用量相比旧方案降低 30%+

### Phase 3 验收

- [ ] 网络搜索 Skill 可正常工作
- [ ] 添加新 Skill 只需：新文件 + SkillRegistry.register()
- [ ] 类型参考 Skill 可根据项目类型提供建议

### Phase 4 验收

- [ ] ScriptDoctorAgent 编排 3+ 个 Skill
- [ ] Agent 不再直接调用 LLM
- [ ] 诊断报告包含多维度分析

### Phase 5 验收

- [ ] 编辑器内可直接触发 AI 能力
- [ ] 人物/场景页面有 AI 增强功能
- [ ] AI 使用率 > 40%

---

## 七、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|---------|
| Story Bible 聚合延迟 | 用户编辑后 AI 上下文不是最新的 | 异步聚合 + 乐观更新；关键操作同步聚合 |
| ContextAssembler Token 超限 | 大项目的 Story Bible 可能很大 | 实现摘要压缩；按需加载；设置 Token 上限 |
| 网络搜索 API 成本 | 搜索 API 按次计费 | 结果缓存；每日搜索配额；优先使用内置知识 |
| 渐进式迁移期间新旧代码共存 | 维护成本增加 | 每个 Phase 完成后清理旧代码；保持向后兼容 |
| Skill 数量增长后管理复杂 | 用户不知道用哪个 Skill | 智能推荐（基于当前操作上下文）；分类展示 |

---

## 八、相关文档

- [PRD v2.7](../prd/prd-v2.7.md) - 更新后的产品需求文档
- [技术栈 v1.1](../tech/tech-stack.md) - 技术选型
- [数据模型 v1.0](../tech/data-model.md) - 数据结构
- [项目评估报告](../reports/analysis/2026-02-08-analysis-project-evaluation.md) - 评估依据

---

**让 AI 成为创作的一部分，而不是创作的旁观者。**
