# Skills API 使用指南

> **版本**: v1.0
> **更新日期**: 2026-02-08
> **状态**: ✅ 已实现

---

## 概述

Skills API 提供了执行剧本编辑技能的接口，支持格式修复、对白润色、场景扩展等功能。

## 端点

### GET /api/ai/skills

获取所有可用的技能列表。

**请求**

```bash
GET /api/ai/skills
Authorization: Bearer <token>
```

**响应**

```json
{
  "skills": [
    {
      "id": "format-fix",
      "name": "格式修复",
      "description": "检查剧本格式是否符合规范，自动修复格式错误",
      "category": "editing",
      "metadata": {
        "version": "1.0.0",
        "author": "剧灵",
        "tags": ["format", "fix", "script", "editing"],
        "confidence": 0.9
      }
    },
    {
      "id": "dialogue-polish",
      "name": "对白润色",
      "description": "优化对白表达，保持人物性格一致性，提供多个润色选项",
      "category": "writing",
      "metadata": {
        "version": "1.0.0",
        "author": "剧灵",
        "tags": ["dialogue", "polish", "writing", "style"],
        "confidence": 0.85
      }
    },
    {
      "id": "scene-expand",
      "name": "场景扩展",
      "description": "根据现有场景内容扩展，增加动作描述、环境描写，保持情节连贯性",
      "category": "writing",
      "metadata": {
        "version": "1.0.0",
        "author": "剧灵",
        "tags": ["scene", "expand", "writing", "description"],
        "confidence": 0.8
      }
    }
  ]
}
```

---

### POST /api/ai/skills

执行指定的技能。

**请求**

```bash
POST /api/ai/skills
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**

```json
{
  "skillId": "format-fix",
  "input": {
    "content": "场景1 咖啡厅\n李明：你好",
    "format": "standard"
  },
  "editorState": {
    "projectId": "project-123",
    "content": "场景1 咖啡厅\n李明：你好",
    "selection": {
      "start": 0,
      "end": 20
    }
  }
}
```

**字段说明**

- `skillId` (必需): 技能ID
- `input` (必需): 技能输入参数，根据不同技能而异
- `editorState` (可选): 编辑器状态信息
  - `projectId`: 项目ID
  - `content`: 当前编辑器内容
  - `selection`: 当前选中范围

**响应 - 成功**

```json
{
  "success": true,
  "skillId": "format-fix",
  "result": {
    "fixed": true,
    "content": "**场1-1 日/内 咖啡厅 李明**\n\n**李明**\n你好",
    "errors": [
      {
        "type": "scene-heading",
        "line": 1,
        "message": "场景标题格式不规范",
        "suggestion": "使用标准格式：**场X-Y 时间/内外 地点 主要人物**"
      }
    ],
    "changes": [
      "修正场景标题格式",
      "添加人物名格式"
    ]
  },
  "tokensUsed": 245
}
```

**响应 - 错误**

```json
{
  "error": "技能不存在: invalid-skill",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

---

## 技能详细说明

### 1. format-fix (格式修复)

检查并修复剧本格式问题。

**输入参数**

```typescript
{
  content: string;        // 剧本内容
  format?: 'standard' | 'short-drama';  // 格式类型，默认 'standard'
}
```

**输出结果**

```typescript
{
  fixed: boolean;         // 是否进行了修复
  content: string;        // 修复后的内容
  errors: FormatError[];  // 发现的错误列表
  changes: string[];      // 变更说明
}
```

**示例**

```javascript
const response = await fetch('/api/ai/skills', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skillId: 'format-fix',
    input: {
      content: '场景1 咖啡厅\n李明：你好',
      format: 'standard'
    }
  })
});

const data = await response.json();
console.log(data.result.content); // 修复后的内容
```

---

### 2. dialogue-polish (对白润色)

优化对白表达，保持人物性格一致性。

**输入参数**

```typescript
{
  dialogue: string;       // 对白内容
  characterName: string;  // 人物名称
  characterProfile?: {    // 人物档案（可选）
    personality?: string[];
    speechStyle?: string;
    age?: number;
    occupation?: string;
  };
  sceneContext?: string;  // 场景上下文（可选）
  style?: 'natural' | 'dramatic' | 'concise' | 'poetic';  // 润色风格
}
```

**输出结果**

```typescript
{
  original: string;       // 原始对白
  polished: string;       // 润色后的对白
  alternatives: string[]; // 备选方案
  explanation: string;    // 润色说明
}
```

**示例**

```javascript
const response = await fetch('/api/ai/skills', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skillId: 'dialogue-polish',
    input: {
      dialogue: '我觉得这个事情不太好',
      characterName: '李明',
      characterProfile: {
        personality: ['直率', '果断'],
        age: 35,
        occupation: '律师'
      },
      style: 'natural'
    }
  })
});

const data = await response.json();
console.log(data.result.polished);      // 润色后的对白
console.log(data.result.alternatives);  // 备选方案
```

---

### 3. scene-expand (场景扩展)

根据现有场景内容扩展，增加细节描写。

**输入参数**

```typescript
{
  sceneContent: string;   // 场景内容
  sceneHeading?: string;  // 场景标题（可选）
  characters?: string[];  // 出场人物（可选）
  expandType?: 'action' | 'description' | 'emotion' | 'dialogue';  // 扩展类型
  targetLength?: 'short' | 'medium' | 'long';  // 目标长度
  focus?: string;         // 扩展重点（可选）
}
```

**输出结果**

```typescript
{
  original: string;       // 原始场景
  expanded: string;       // 扩展后的场景
  additions: Array<{     // 新增内容列表
    type: ExpandType;
    content: string;
    position: 'before' | 'after' | 'inline';
  }>;
  explanation: string;    // 扩展说明
}
```

**示例**

```javascript
const response = await fetch('/api/ai/skills', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skillId: 'scene-expand',
    input: {
      sceneContent: '李明走进咖啡厅。',
      sceneHeading: '场1-1 日/内 咖啡厅 李明',
      characters: ['李明'],
      expandType: 'description',
      targetLength: 'medium'
    }
  })
});

const data = await response.json();
console.log(data.result.expanded);  // 扩展后的场景
```

---

## 错误处理

### 错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | BAD_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 未授权，需要登录 |
| 404 | NOT_FOUND | 技能不存在 |
| 422 | VALIDATION_FAILED | 输入验证失败 |
| 429 | TOO_MANY_REQUESTS | AI 配额不足 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

### 配额不足错误

```json
{
  "error": "AI 配额不足",
  "code": "TOO_MANY_REQUESTS",
  "statusCode": 429,
  "details": {
    "reason": "AI_QUOTA_EXCEEDED",
    "remaining": 0,
    "resetAt": "2026-03-01T00:00:00.000Z"
  }
}
```

---

## 配额管理

每次技能执行都会消耗 AI 配额。配额消耗计算方式：

```
tokensUsed = (输入字符数 + 输出字符数) / 2
```

不同计划的月度配额限制：

| 计划 | 月度配额 |
|------|----------|
| 免费版 | 50万 tokens |
| 创作者版 | 200万 tokens |
| 专业版 | 500万 tokens |
| 工作室版 | 2000万 tokens |

---

## 最佳实践

1. **批量处理**: 如果需要处理多个场景，建议合并后一次性调用，减少 API 请求次数
2. **错误重试**: 遇到 500 错误时，可以使用指数退避策略重试
3. **配额监控**: 定期检查配额使用情况，避免超限
4. **缓存结果**: 对于相同输入，可以缓存结果避免重复调用

---

## 相关文档

- [技能系统架构](../tech/skills-architecture.md)
- [配额管理](../tech/quota-management.md)
- [API 认证](../tech/api-authentication.md)
