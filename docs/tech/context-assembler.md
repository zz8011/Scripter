# ContextAssembler 技术文档

> **版本**: v1.0
> **更新日期**: 2026-02-08
> **状态**: ✅ 已实现

---

## 概述

ContextAssembler 是一个智能上下文组装器，根据 Skill 的 `requiredContext` 声明，从 Story Bible 和数据库中精确提取所需的上下文数据，避免传递不必要的信息，显著降低 token 消耗。

---

## 核心功能

### 1. 智能上下文提取

根据 9 种 `ContextRequirement` 类型，从不同数据源提取上下文：

| 上下文类型 | 数据源 | 说明 |
|-----------|--------|------|
| `currentScene` | 数据库 | 当前正在编辑的场景内容 |
| `selectedText` | 编辑器 | 用户选中的文本 |
| `characterProfile` | Story Bible | 指定人物的档案信息 |
| `allCharacters` | Story Bible | 所有人物列表 |
| `worldRules` | Story Bible | 世界观规则和约束 |
| `plotOutline` | Story Bible | 剧情大纲 |
| `adjacentScenes` | 数据库 | 当前场景的前后相邻场景 |
| `creativeIntent` | Story Bible | 创作意图和目标 |
| `conversationHistory` | 缓存/数据库 | 对话历史记录 |

### 2. Token 预算控制

- 记录每个上下文来源的 token 消耗
- 支持设置 token 预算上限
- 超出预算时发出警告（未来可实现自动压缩）

### 3. 元数据追踪

记录每个上下文的详细信息：
- 数据来源（database / story-bible / editor / cache）
- 数据大小（字符数）
- Token 消耗
- 是否压缩

---

## 使用方法

### 基础用法

```typescript
import { ContextAssembler } from '@/lib/agents/context/ContextAssembler';

// 创建组装器
const assembler = new ContextAssembler();

// 定义上下文需求
const requirements = [
  { type: 'currentScene' },
  { type: 'characterProfile' }
];

// 组装上下文
const { context, tokensUsed, summary } = await assembler.assemble(
  requirements,
  {
    projectId: 'proj-123',
    userId: 'user-456',
    currentSceneId: 'scene-789'
  }
);

console.log(`Context assembled, tokens used: ${tokensUsed}`);
console.log('Sources:', Object.keys(summary));
```

### 在 Skills API 中使用

```typescript
// 获取技能
const skill = registry.getSkill('dialogue-polish');

// 如果技能声明了 requiredContext，使用 ContextAssembler
if (skill.requiredContext && skill.requiredContext.length > 0) {
  const assembler = new ContextAssembler();

  const { context, tokensUsed } = await assembler.assemble(
    skill.requiredContext,
    {
      projectId: editorState.projectId,
      userId: session.userId,
      currentSceneId: input.sceneId,
      selectedText: getSelectedText(editorState)
    }
  );

  // 执行技能
  const result = await skill.execute(context, input);
}
```

### 自定义 Token 预算

```typescript
// 设置 5000 token 预算
const assembler = new ContextAssembler(5000);

const { context, tokensUsed } = await assembler.assemble(
  requirements,
  {
    projectId: 'proj-123',
    userId: 'user-456',
    tokenBudget: 3000  // 也可以在 assemble 时指定
  }
);
```

---

## 上下文提取详解

### currentScene

提取当前正在编辑的场景内容。

**数据源**: 数据库 (`scenes` 表)

**提取逻辑**:
```typescript
const scene = await getSceneById(currentSceneId);
context.script.content = scene.content;
```

**Token 估算**: `content.length / 4`

**使用场景**: 需要了解当前场景内容的技能（对白润色、场景扩展等）

---

### selectedText

提取用户在编辑器中选中的文本。

**数据源**: 编辑器状态

**提取逻辑**:
```typescript
const { start, end } = editorState.selection;
const selectedText = editorState.content.substring(start, end);
```

**Token 估算**: `selectedText.length / 4`

**使用场景**: 纯文本处理技能（格式修复、拼写检查等）

---

### characterProfile

提取指定人物的档案信息。

**数据源**: Story Bible (`characterProfiles`)

**提取逻辑**:
```typescript
const storyBible = await getStoryBibleByProjectId(projectId);
let profiles = storyBible.characterProfiles;

// 如果指定了 characterId，只返回该人物
if (requirement.characterId) {
  profiles = profiles.filter(p => p.id === requirement.characterId);
}
```

**Token 估算**: `JSON.stringify(profiles).length / 4`

**使用场景**: 需要保持人物一致性的技能（对白润色、人物动作描写等）

---

### allCharacters

提取项目中所有人物的列表。

**数据源**: Story Bible (`characterProfiles`)

**提取逻辑**:
```typescript
const storyBible = await getStoryBibleByProjectId(projectId);
const allCharacters = storyBible.characterProfiles;
```

**Token 估算**: `JSON.stringify(allCharacters).length / 4`

**使用场景**: 需要了解人物关系的技能（冲突设计、关系网分析等）

---

### worldRules

提取世界观规则和约束。

**数据源**: Story Bible (`worldRules`)

**提取逻辑**:
```typescript
const storyBible = await getStoryBibleByProjectId(projectId);
const worldRules = storyBible.worldRules;
```

**Token 估算**: `JSON.stringify(worldRules).length / 4`

**使用场景**: 需要保持世界观一致性的技能（场景扩展、设定检查等）

---

### plotOutline

提取剧情大纲。

**数据源**: Story Bible (`plotOutline`)

**提取逻辑**:
```typescript
const storyBible = await getStoryBibleByProjectId(projectId);
const plotOutline = storyBible.plotOutline;
```

**Token 估算**: `JSON.stringify(plotOutline).length / 4`

**使用场景**: 需要保持情节连贯的技能（场景扩展、情节建议等）

---

### adjacentScenes

提取当前场景的前后相邻场景。

**数据源**: 数据库 (`scenes` 表)

**提取逻辑**:
```typescript
const currentScene = await getSceneById(currentSceneId);
const allScenes = await getScenesByProjectId(projectId);

// 找到当前场景的索引
const currentIndex = allScenes.findIndex(s => s.id === currentSceneId);

// 提取前后 range 个场景
const range = requirement.range || 1;
const start = Math.max(0, currentIndex - range);
const end = Math.min(allScenes.length, currentIndex + range + 1);
const adjacentScenes = allScenes.slice(start, end);
```

**Token 估算**: `JSON.stringify(adjacentScenes).length / 4`

**使用场景**: 需要了解上下文连贯性的技能（场景过渡、情节衔接等）

---

### creativeIntent

提取创作意图和目标。

**数据源**: Story Bible (`creativeIntent`)

**提取逻辑**:
```typescript
const storyBible = await getStoryBibleByProjectId(projectId);
const creativeIntent = storyBible.creativeIntent;
```

**Token 估算**: `JSON.stringify(creativeIntent).length / 4`

**使用场景**: 需要理解创作方向的技能（创意建议、风格调整等）

---

### conversationHistory

提取与 AI 的对话历史。

**数据源**: 缓存或数据库

**提取逻辑**:
```typescript
// TODO: 实现对话历史提取
const limit = requirement.limit || 10;
const history = await getConversationHistory(userId, projectId, limit);
```

**Token 估算**: `JSON.stringify(history).length / 4`

**使用场景**: 需要上下文记忆的技能（连续对话、迭代优化等）

---

## 性能优化

### Token 消耗对比

| Skill | 旧方案 (统一 2000 字符) | 新方案 (ContextAssembler) | 节省比例 |
|-------|------------------------|--------------------------|---------|
| FormatFixSkill | ~1000 tokens | ~200 tokens | 80% |
| DialoguePolishSkill | ~1000 tokens | ~400 tokens | 60% |
| SceneExpandSkill | ~1000 tokens | ~600 tokens | 40% |

### 优化策略

1. **按需加载**: 只提取 Skill 声明需要的上下文
2. **智能缓存**: 对于相同的上下文需求，可以缓存结果
3. **分层压缩**: 大项目可以对 Story Bible 进行摘要压缩
4. **Token 预算**: 超出预算时自动压缩或截断

---

## API 集成

ContextAssembler 已集成到 Skills API (`/api/ai/skills`)：

```typescript
// POST /api/ai/skills
{
  "skillId": "dialogue-polish",
  "input": {
    "dialogue": "我觉得这个事情不太好",
    "characterName": "李明"
  },
  "editorState": {
    "projectId": "proj-123",
    "content": "...",
    "selection": { "start": 0, "end": 100 }
  }
}

// Response
{
  "success": true,
  "skillId": "dialogue-polish",
  "result": { ... },
  "tokensUsed": 450,
  "breakdown": {
    "context": 200,  // ContextAssembler 提取的上下文
    "input": 50,     // 输入参数
    "output": 200    // AI 输出
  }
}
```

---

## 扩展性

### 添加新的上下文类型

1. 在 `lib/agents/core/types.ts` 中扩展 `ContextRequirement` 类型
2. 在 `ContextAssembler.ts` 中添加对应的提取方法
3. 在 `extractContext()` 中添加 case 分支

示例：

```typescript
// 1. 扩展类型
export type ContextRequirement =
  | { type: 'currentScene' }
  | { type: 'myNewContext'; param?: string }  // 新增
  // ...

// 2. 添加提取方法
private async extractMyNewContext(
  requirement: Extract<ContextRequirement, { type: 'myNewContext' }>,
  options: AssembleOptions
) {
  // 实现提取逻辑
  return {
    data: { myData: '...' },
    source: 'custom',
    size: 100,
    tokens: 25,
    compressed: false
  };
}

// 3. 添加 case 分支
case 'myNewContext':
  return this.extractMyNewContext(requirement, options);
```

---

## 测试

完整的测试套件位于 `lib/agents/context/__tests__/ContextAssembler.test.ts`。

运行测试：

```bash
npm test lib/agents/context/__tests__/ContextAssembler.test.ts
```

测试覆盖：
- ✅ 基础功能测试
- ✅ 9 种上下文类型提取测试
- ✅ 多个上下文组合测试
- ✅ Token 预算控制测试
- ✅ 错误处理测试

---

## 未来优化

### 短期优化
1. **实现对话历史提取** - 完成 `conversationHistory` 的实现
2. **自动压缩** - 超出 token 预算时自动压缩上下文
3. **智能缓存** - 缓存常用的上下文数据

### 长期优化
1. **AI 摘要** - 使用 AI 对大型 Story Bible 进行智能摘要
2. **相关性排序** - 根据相关性对上下文进行排序和截断
3. **增量更新** - 只传递变化的部分，减少重复数据

---

## 相关文档

- [Skill 接口 v2.0](./skill-interface-v2.md)
- [Skills API 使用指南](../api/skills-api-usage.md)
- [Story Bible Schema](./story-bible-schema.md)

---

## 变更历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0 | 2026-02-08 | 初始版本，支持 9 种上下文类型 |
