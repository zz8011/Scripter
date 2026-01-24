# 剧灵 Scripter - API 规范

> RESTful API 端点定义

---

## 基础信息

| 项目 | 值 |
|------|-----|
| **Base URL** | `https://api.scripter.art/v1` |
| **认证方式** | Bearer Token (JWT) |
| **响应格式** | JSON |
| **字符编码** | UTF-8 |

---

## 认证

### POST /auth/login

用户登录

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "用户名",
    "subscription": "PERSONAL",
    "aiQuota": 5000
  }
}
```

---

## 项目管理

### GET /projects

获取用户的所有项目

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |
| stage | string | 否 | 筛选阶段 |

**响应：**
```json
{
  "projects": [
    {
      "id": "cuid123",
      "name": "我送君归去",
      "genre": ["权谋", "动作"],
      "targetEpisodes": 80,
      "currentStage": "script",
      "createdAt": "2026-01-23T10:00:00Z",
      "updatedAt": "2026-01-23T14:30:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

### POST /projects

创建新项目

**请求体：**
```json
{
  "name": "剧名",
  "genre": ["权谋", "动作"],
  "targetEpisodes": 80
}
```

**响应：**
```json
{
  "id": "cuid123",
  "name": "剧名",
  "genre": ["权谋", "动作"],
  "targetEpisodes": 80,
  "currentStage": "worldview",
  "createdAt": "2026-01-23T10:00:00Z"
}
```

### GET /projects/:id

获取项目详情

**响应：**
```json
{
  "id": "cuid123",
  "name": "剧名",
  "genre": ["权谋", "动作"],
  "targetEpisodes": 80,
  "currentStage": "script",
  "worldview": {...},
  "characters": [...],
  "stats": {
    "totalScenes": 240,
    "totalWords": 125000,
    "estimatedDuration": 4800
  }
}
```

### PUT /projects/:id

更新项目信息

**请求体：**
```json
{
  "name": "新剧名",
  "currentStage": "character"
}
```

### DELETE /projects/:id

删除项目

**响应：**
```json
{
  "message": "项目已删除"
}
```

---

## 人物管理

### GET /projects/:projectId/characters

获取项目所有人物

**响应：**
```json
{
  "characters": [
    {
      "id": "cuid456",
      "name": "雾姝",
      "poem": "魂兮归来，引灵还乡",
      "age": 28,
      "gender": "女",
      "occupation": "赶尸传人",
      "personality": ["坚韧", "聪慧", "重情义"],
      "speechStyle": "简洁有力，常用四字成语"
    }
  ]
}
```

### POST /projects/:projectId/characters

创建人物

**请求体：**
```json
{
  "name": "雾姝",
  "age": 28,
  "gender": "女",
  "occupation": "赶尸传人",
  "personality": ["坚韧", "聪慧", "重情义"]
}
```

### PUT /characters/:id

更新人物信息

### DELETE /characters/:id

删除人物

---

## 场景管理

### GET /projects/:projectId/scenes

获取项目所有场景

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| episode | number | 筛选集数 |
| status | string | 筛选状态 |

**响应：**
```json
{
  "scenes": [
    {
      "id": "cuid789",
      "episodeNumber": 1,
      "sceneNumber": 1,
      "location": "湘西山区",
      "timeOfDay": "夜",
      "intExt": "外",
      "mainCharacters": ["雾姝", "厉君"],
      "duration": 45,
      "status": "completed"
    }
  ]
}
```

### POST /projects/:projectId/scenes

创建场景

**请求体：**
```json
{
  "episodeNumber": 1,
  "sceneNumber": 1,
  "location": "湘西山区",
  "timeOfDay": "夜",
  "intExt": "外",
  "mainCharacters": ["雾姝", "厉君"]
}
```

### PUT /scenes/:id

更新场景内容

**请求体：**
```json
{
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "sceneHeading",
        "attrs": { "number": "1-1" },
        "content": [{"type": "text", "text": "湘西山区·夜·外"}]
      },
      {
        "type": "action",
        "content": [{"type": "text", "text": "月黑风高，雾气翻涌。"}]
      }
    ]
  },
  "duration": 45
}
```

### PUT /scenes/:id/reorder

调整场景顺序

**请求体：**
```json
{
  "newEpisodeNumber": 1,
  "newSceneNumber": 5
}
```

### DELETE /scenes/:id

删除场景

---

## 世界观管理

### GET /projects/:projectId/worldview

获取世界观设定

**响应：**
```json
{
  "id": "cuid999",
  "era": "民国末期",
  "geography": "湘西山区",
  "mystery": "赶尸秘术",
  "socialClass": "军阀、土匪、平民",
  "references": [
    {
      "type": "image",
      "url": "https://..."
    }
  ]
}
```

### PUT /worldview/:id

更新世界观设定

**请求体：**
```json
{
  "era": "民国末期",
  "geography": "湘西山区",
  "mystery": "赶尸秘术",
  "socialClass": "军阀、土匪、平民"
}
```

---

## AI 功能

### POST /ai/stream

流式 AI 响应

**请求体：**
```json
{
  "intention": "dialoguePolish",
  "input": "润色这段对白",
  "context": {
    "projectId": "cuid123",
    "currentScene": {...},
    "characters": [...]
  }
}
```

**响应：** `text/event-stream`

```
data: {"type":"token","content":"润"}
data: {"type":"token","content":"色"}
data: {"type":"token","content":"后"}
data: {"type":"token","content":"的"}
data: {"type":"done"}
```

### POST /ai/skills/:skillName

执行特定 Skill

**可用 Skills：**
- `formatFix` - 格式修复
- `dialoguePolish` - 对白润色
- `sceneExpand` - 场景扩展
- `plotAnalyze` - 情节分析

### POST /ai/agents/:agentName

执行特定 Agent

**可用 Agents：**
- `audienceCritic` - 观众批判者
- `plotTwister` - 剧情反转专家
- `characterOptimizer` - 人物优化师

### GET /ai/quota

获取 AI 配额使用情况

**响应：**
```json
{
  "limit": 5000,
  "used": 1234,
  "remaining": 3766,
  "resetAt": "2026-02-01T00:00:00Z"
}
```

---

## 图片生成

### POST /images/generate

生成图片

**请求体：**
```json
{
  "prompt": "一个古装女子，手持摄魂铃，湘西山区背景",
  "type": "character",
  "model": "stable-diffusion-xl"
}
```

**响应：**
```json
{
  "taskId": "task_abc123",
  "status": "processing",
  "estimatedTime": 30
}
```

### GET /images/tasks/:taskId

查询生成任务状态

**响应（进行中）：**
```json
{
  "taskId": "task_abc123",
  "status": "processing",
  "progress": 60
}
```

**响应（完成）：**
```json
{
  "taskId": "task_abc123",
  "status": "completed",
  "imageUrl": "https://s3.scripter.art/images/abc123.png"
}
```

---

## 版本控制

### GET /scripts/:scriptId/versions

获取版本列表

**响应：**
```json
{
  "versions": [
    {
      "id": "ver_123",
      "version": 1,
      "label": "初稿",
      "isMilestone": true,
      "createdAt": "2026-01-23T10:00:00Z"
    },
    {
      "id": "ver_456",
      "version": 2,
      "label": "人物优化后",
      "isMilestone": false,
      "createdAt": "2026-01-23T14:30:00Z"
    }
  ]
}
```

### POST /scripts/:scriptId/versions

创建新版本

**请求体：**
```json
{
  "label": "重要修改",
  "isMilestone": true
}
```

### GET /scripts/:scriptId/versions/compare

版本对比

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| from | number | 是 | 起始版本号 |
| to | number | 是 | 目标版本号 |

**响应：**
```json
{
  "diff": [
    {
      "type": "added",
      "scene": "1-5",
      "content": "..."
    },
    {
      "type": "modified",
      "scene": "1-3",
      "before": "...",
      "after": "..."
    }
  ]
}
```

### POST /scripts/:scriptId/versions/:versionId/restore

回滚到指定版本

---

## 导出

### POST /projects/:projectId/export

导出项目

**请求体：**
```json
{
  "formats": ["pdf", "word", "fountain"],
  "includeCover": true,
  "includeTOC": true
}
```

**响应：**
```json
{
  "downloadUrl": "https://s3.scripter.art/exports/abc123.zip",
  "expiresAt": "2026-01-23T15:00:00Z"
}
```

---

## 搜索

### GET /projects/:projectId/search

全局搜索

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| q | string | 搜索关键词 |
| type | string | 筛选类型 |
| scope | string | 搜索范围 |

**响应：**
```json
{
  "results": [
    {
      "type": "dialogue",
      "scene": "1-3",
      "character": "雾姝",
      "match": "魂兮归来，路引在此",
      "context": "...魂兮归来，路引在此..."
    }
  ],
  "total": 23
}
```

---

## 错误码

| 状态码 | 错误类型 | 说明 |
|--------|---------|------|
| 400 | BAD_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 未认证 |
| 403 | FORBIDDEN | 无权限 |
| 404 | NOT_FOUND | 资源不存在 |
| 429 | TOO_MANY_REQUESTS | 超出配额 |
| 500 | INTERNAL_ERROR | 服务器错误 |

**错误响应格式：**
```json
{
  "error": {
    "code": "INSUFFICIENT_QUOTA",
    "message": "AI 配额已用完，请升级订阅",
    "details": {
      "limit": 5000,
      "used": 5000
    }
  }
}
```

---

**让灵感，在剧本中苏醒** ✨
