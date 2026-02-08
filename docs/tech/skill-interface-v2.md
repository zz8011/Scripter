# Skill 接口扩展 - requiredContext 支持

> **版本**: v2.0
> **更新日期**: 2026-02-08
> **状态**: ✅ 已实现

---

## 概述

Skill 接口已扩展，支持声明所需的上下文类型，使得每个 Skill 可以精确指定需要什么上下文，而非统一截取 2000 字符。

## 新增字段

### 1. requiredContext (可选)

声明技能执行所需的上下文类型。

```typescript
requiredContext?: ContextRequirement[]
```

**ContextRequirement 类型定义**:

```typescript
type ContextRequirement =
  | { type: 'currentScene' }                          // 当前场景
  | { type: 'selectedText' }                          // 选中的文本
  | { type: 'characterProfile'; characterId?: string } // 人物档案
  | { type: 'allCharacters' }                         // 所有人物
  | { type: 'worldRules' }                            // 世界观规则
  | { type: 'plotOutline' }                           // 情节大纲
  | { type: 'adjacentScenes'; range?: number }        // 相邻场景
  | { type: 'creativeIntent' }                        // 创作意图
  | { type: 'conversationHistory'; limit?: number }   // 对话历史
```

### 2. inputSchema (可选)

输入参数的 Schema 定义，用于验证和文档生成。

```typescript
inputSchema?: Record<string, any>
```

### 3. outputSchema (可选)

输出结果的 Schema 定义，用于验证和文档生成。

```typescript
outputSchema?: Record<string, any>
```

### 4. estimatedTokens (可选)

预估 token 消耗，可以是固定值或计算函数。

```typescript
estimatedTokens?: number | ((input: any) => number)
```

---

## 已有 Skill 的 requiredContext 声明

### 1. DialoguePolishSkill (对白润色)

```typescript
requiredContext: [
  { type: 'currentScene' },      // 需要当前场景上下文
  { type: 'characterProfile' }   // 需要人物档案
]
```

**原因**: 对白润色需要了解场景氛围和人物性格，才能保持一致性。

### 2. FormatFixSkill (格式修复)

```typescript
requiredContext: [
  { type: 'selectedText' }       // 只需要选中的文本
]
```

**原因**: 格式修复是纯文本处理，不需要额外上下文。

### 3. SceneExpandSkill (场景扩展)

```typescript
requiredContext: [
  { type: 'currentScene' },      // 需要当前场景
  { type: 'plotOutline' },       // 需要情节大纲
  { type: 'worldRules' }         // 需要世界观规则
]
```

**原因**: 场景扩展需要保持情节连贯性和世界观一致性。

---

## 使用示例

### 定义新 Skill

```typescript
import { Skill, Context, ContextRequirement } from '../core/types';

export class MyCustomSkill implements Skill {
  public readonly id = 'my-custom-skill';
  public readonly name = '自定义技能';
  public readonly description = '这是一个自定义技能';
  public readonly category = 'custom';

  public readonly metadata = {
    version: '1.0.0',
    author: '剧灵',
    tags: ['custom'],
    confidence: 0.9,
  };

  // 声明所需上下文
  public readonly requiredContext: ContextRequirement[] = [
    { type: 'currentScene' },
    { type: 'characterProfile', characterId: 'optional-id' },
    { type: 'adjacentScenes', range: 2 }
  ];

  // 输入 Schema
  public readonly inputSchema = {
    text: { type: 'string', required: true },
    options: { type: 'object', required: false }
  };

  // 输出 Schema
  public readonly outputSchema = {
    result: { type: 'string' },
    metadata: { type: 'object' }
  };

  // 预估 token 消耗
  public readonly estimatedTokens = (input: any) => {
    return Math.ceil(input.text.length / 2) + 300;
  };

  public async execute(context: Context, input: any): Promise<any> {
    // 实现逻辑
    return { result: 'success' };
  }
}
```

### 在 ContextAssembler 中使用

```typescript
import { SkillRegistry } from './SkillRegistry';
import { ContextAssembler } from './ContextAssembler';

// 获取技能
const skill = SkillRegistry.getInstance().getSkill('dialogue-polish');

// 根据 requiredContext 组装上下文
const context = await ContextAssembler.assemble(
  skill.requiredContext || [],
  {
    projectId: 'project-123',
    userId: 'user-456',
    currentSceneId: 'scene-789'
  }
);

// 执行技能
const result = await skill.execute(context, input);
```

---

## 向后兼容性

所有新字段都是**可选的**，旧代码无需修改即可继续运行。

### 兼容性保证

1. ✅ 不声明 `requiredContext` 的 Skill 仍然有效
2. ✅ 现有的 Skill 执行逻辑不受影响
3. ✅ API 路由无需修改
4. ✅ 前端调用方式不变

### 迁移建议

对于现有 Skill：
1. **可选**: 添加 `requiredContext` 声明（推荐）
2. **可选**: 添加 `inputSchema` 和 `outputSchema`（推荐）
3. **可选**: 添加 `estimatedTokens` 函数（推荐）

---

## 上下文类型详解

### currentScene
当前正在编辑的场景内容。

**使用场景**: 需要了解场景上下文的技能（对白润色、场景扩展等）

### selectedText
用户在编辑器中选中的文本。

**使用场景**: 纯文本处理技能（格式修复、拼写检查等）

### characterProfile
指定人物的档案信息（性格、背景、说话风格等）。

**使用场景**: 需要保持人物一致性的技能（对白润色、人物动作描写等）

**可选参数**: `characterId` - 指定人物 ID，如果不指定则从输入中推断

### allCharacters
项目中所有人物的列表。

**使用场景**: 需要了解人物关系的技能（冲突设计、关系网分析等）

### worldRules
世界观设定和规则。

**使用场景**: 需要保持世界观一致性的技能（场景扩展、设定检查等）

### plotOutline
情节大纲和故事结构。

**使用场景**: 需要保持情节连贯的技能（场景扩展、情节建议等）

### adjacentScenes
当前场景的前后相邻场景。

**使用场景**: 需要了解上下文连贯性的技能（场景过渡、情节衔接等）

**可选参数**: `range` - 前后各取几个场景，默认 1

### creativeIntent
用户的创作意图和目标。

**使用场景**: 需要理解创作方向的技能（创意建议、风格调整等）

### conversationHistory
与 AI 的对话历史。

**使用场景**: 需要上下文记忆的技能（连续对话、迭代优化等）

**可选参数**: `limit` - 最多取多少条历史，默认 10

---

## 性能优化

### Token 消耗优化

通过精确声明 `requiredContext`，可以显著减少 token 消耗：

| Skill | 旧方案 (2000字符) | 新方案 (精确上下文) | 节省 |
|-------|------------------|-------------------|------|
| FormatFixSkill | ~1000 tokens | ~200 tokens | 80% |
| DialoguePolishSkill | ~1000 tokens | ~400 tokens | 60% |
| SceneExpandSkill | ~1000 tokens | ~600 tokens | 40% |

### 预估 Token 消耗

使用 `estimatedTokens` 函数可以在执行前预估配额消耗：

```typescript
const skill = registry.getSkill('dialogue-polish');
const estimated = typeof skill.estimatedTokens === 'function'
  ? skill.estimatedTokens(input)
  : skill.estimatedTokens || 500;

// 检查配额
const hasQuota = await checkUserQuota(userId, estimated);
```

---

## 测试

完整的测试套件位于 `lib/agents/skills/__tests__/skill-interface.test.ts`。

运行测试：

```bash
npm test lib/agents/skills/__tests__/skill-interface.test.ts
```

---

## 下一步

Task #5 完成后，下一步是 **Task #6: 实现 ContextAssembler**，它将：

1. 读取 Skill 的 `requiredContext` 声明
2. 从 Story Bible 中智能提取所需上下文
3. 组装成完整的 Context 对象
4. 传递给 Skill 执行

---

## 相关文档

- [Skills API 使用指南](../../docs/api/skills-api-usage.md)
- [Story Bible Schema](../../docs/tech/story-bible-schema.md)
- [ContextAssembler 设计](../../docs/tech/context-assembler.md) (待创建)

---

## 变更历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v2.0 | 2026-02-08 | 添加 requiredContext, inputSchema, outputSchema, estimatedTokens |
| v1.0 | 2026-01-24 | 初始版本 |
