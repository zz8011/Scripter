# Scripter 数据模型文档

> **版本**: v1.0
> **创建日期**: 2026-01-24
> **更新日期**: 2026-01-24
> **状态**: 生效

---

## 📋 文档说明

**本文档是 Scripter 数据模型的权威定义**

- ✅ 完整的数据库结构和实体关系
- ✅ PRD、技术设计文档都应引用本文档
- ⚠️ **本文档变更需要技术团队共识**
- 📌 **PRD 变更不影响本文档**

---

## 一、核心实体

### 1.1 项目 (Project)

```typescript
interface Project {
  id: string                    // UUID
  userId: string               // 所属用户 ID
  name: string                 // 项目名称
  genre: string[]              // 类型：悬疑/爱情/喜剧/等
  scriptType: 'movie' | 'series' | 'short-drama'  // 剧本类型
  orientation: 'landscape' | 'portrait'         // 横屏/竖屏
  targetEpisodes: number       // 目标集数
  currentStage: 'worldview' | 'character' | 'script' | 'optimize' | 'production'
  createdAt: Date
  updatedAt: Date
}
```

**字段说明**：
- `id`: 主键，UUID 格式
- `userId`: 外键，关联 User 表
- `genre`: 数组，支持多类型标签
- `currentStage`: 项目当前所处阶段

---

### 1.2 人物 (Character)

```typescript
interface Character {
  id: string                    // UUID
  projectId: string            // 所属项目 ID
  name: string                 // 人物姓名
  poem: string                 // 诗号
  basicInfo: {
    age: number               // 年龄
    gender: string            // 性别
    occupation: string        // 职业
    appearance: string        // 外貌描述
  }
  personality: string[]        // 性格标签
  speechStyle: string          // 说话风格描述
  behaviorPattern: string      // 行为模式
  growthArc: string            // 成长轨迹
  relationships: Relationship[]  // 人物关系
  avatar?: string              // 头像 URL
  createdAt: Date
}
```

**关系定义**：
```typescript
interface Relationship {
  targetCharacterId: string    // 目标人物 ID
  type: string                 // 关系类型：师徒/父子/恋人/仇敌/等
  description: string          // 关系描述
}
```

---

### 1.3 场景 (Scene)

```typescript
interface Scene {
  id: string                    // UUID
  projectId: string            // 所属项目 ID
  episodeNumber: number        // 集数
  sceneNumber: number          // 场景编号（集内序号）
  location: string             // 场景地点
  timeOfDay: string            // 时间：日/夜/黄昏/黎明/等
  intExt: string               // 内景/外景/内外景
  content: string              // TipTap JSON 格式
  duration: number             // 时长（秒）
  status: 'draft' | 'completed'
  createdAt: Date
}
```

**字段说明**：
- `content`: TipTap 编辑器的 JSON 格式，存储场景内容
- `duration`: 预估时长，用于集长统计
- `intExt`: 枚举值，'INT' | 'EXT' | 'INT/EXT'

---

### 1.4 世界观设定 (WorldviewItem)

```typescript
interface WorldviewItem {
  id: string                    // UUID
  projectId: string            // 所属项目 ID
  category: 'era' | 'geography' | 'social' | 'mystery' | 'culture' | 'economy' | 'custom'
  title: string                // 设定标题
  content: string              // 设定内容（支持富文本）
  order: number                // 排序序号
  createdAt: Date
}
```

**分类说明**：
- `era`: 时代背景
- `geography`: 地理环境
- `social`: 社会阶层
- `mystery`: 神秘元素
- `culture`: 文化习俗
- `economy`: 经济体系
- `custom`: 自定义分类

---

### 1.5 分镜 (Storyboard)

```typescript
interface Storyboard {
  id: string                    // UUID
  projectId: string            // 所属项目 ID
  sceneId: string              // 关联场景 ID
  shotNumber: number           // 镜头编号
  shotType: string             // 镜头类型：远景/中景/特写/等
  angle: string                // 拍摄角度：平视/仰视/俯视/等
  movement: string             // 运镜方式：推/拉/摇/移/跟/升降
  description: string          // 画面描述
  audio: string                // 声音/对白描述
  duration: number             // 时长（秒）
  referenceImage?: string      // 参考图 URL
  order: number                // 排序序号
  createdAt: Date
}
```

---

### 1.6 AI 对话历史 (AIConversation)

```typescript
interface AIConversation {
  id: string                    // UUID
  userId: string               // 用户 ID
  projectId?: string           // 关联项目 ID（可选）
  agent: string                // 使用的 Agent：intention-router / format-fixer / 等
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    skill?: string             // 如果使用了 Skill
    intention?: string         // 识别到的意图
    tokensUsed?: number        // 消耗的 tokens
  }
}
```

---

### 1.7 剧灵配置 (JulingConfig)

```typescript
interface JulingConfig {
  id: string                    // UUID
  userId: string               // 用户 ID
  name: string                 // 自定义剧灵名称
  birthDate: Date              // 注册时间/生日，用于计算八字
  personality: {
    elements: string[]         // 五行属性：金木水火土
    style: string             // 说话风格描述
  }
  createdAt: Date
  updatedAt: Date
}
```

**八字性格系统**：
- 根据注册时间计算生辰八字
- 五行属性决定性格倾向
- 说话风格与五行属性关联

---

### 1.8 创作里程碑 (CreativeMilestone)

```typescript
interface CreativeMilestone {
  id: string                    // UUID
  userId: string               // 用户 ID
  projectId: string            // 项目 ID
  type: 'first_scene' | 'first_episode' | 'completed'
  achievedAt: Date             // 达成时间
  aiContribution: number       // AI 贡献度 0-100（%）
}
```

**里程碑类型**：
- `first_scene`: 完成第一个场景
- `first_episode`: 完成第一集
- `completed`: 完成整部剧本

---

### 1.9 用户 (User)

```typescript
interface User {
  id: string                    // UUID（来自 Casdoor）
  email: string                // 邮箱
  name: string                 // 显示名称
  avatar?: string              // 头像 URL
  plan: 'free' | 'creator' | 'pro' | 'studio'
  aiQuota: {                   // AI 配额
    monthlyLimit: number       // 月度限额
    used: number              // 已使用
    resetAt: Date             // 重置时间
  }
  createdAt: Date
  updatedAt: Date
}
```

---

## 二、实体关系图

```
User (1) ──┬── (N) Project
            │
            ├── (1) JulingConfig
            │
            ├── (N) AIConversation
            │
            └── (N) CreativeMilestone

Project (1) ──┬── (N) Character
             │
             ├── (N) Scene
             │
             ├── (N) WorldviewItem
             │
             ├── (N) Storyboard
             │
             └── (N) CreativeMilestone

Scene (1) ─── (N) Storyboard

Character (N) ── (N) Relationship (自关联)
```

---

## 三、数据库设计 (Drizzle Schema)

### 3.1 Schema 示例

```typescript
// drizzle/schema.ts

import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  plan: text('plan').notNull().default('free'),
  aiQuota: jsonb('ai_quota').$type<{
    monthlyLimit: number
    used: number
    resetAt: Date
  }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  genre: jsonb('genre').$type<string[]>().notNull(),
  scriptType: text('script_type').notNull(), // 'movie' | 'series' | 'short-drama'
  orientation: text('orientation').notNull(), // 'landscape' | 'portrait'
  targetEpisodes: integer('target_episodes').notNull(),
  currentStage: text('current_stage').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  poem: text('poem'),
  basicInfo: jsonb('basic_info').notNull(),
  personality: jsonb('personality').$type<string[]>().notNull(),
  speechStyle: text('speech_style').notNull(),
  behaviorPattern: text('behavior_pattern').notNull(),
  growthArc: text('growth_arc').notNull(),
  relationships: jsonb('relationships').$type<Relationship[]>().notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ... 其他表定义
```

---

## 四、索引和约束

### 4.1 推荐索引

```typescript
// 用户查询
users.id (主键)
users.email (唯一索引)

// 项目查询
projects.userId (索引)
projects.updatedAt (索引，用于排序)

// 场景查询
scenes.projectId (索引)
scenes.episodeNumber (索引)

// 对话历史
ai_conversations.userId (索引)
ai_conversations.projectId (索引)
```

### 4.2 约束

```typescript
// 外键约束
projects.userId → users.id (CASCADE)
characters.projectId → projects.id (CASCADE)
scenes.projectId → projects.id (CASCADE)

// 唯一约束
users.email (UNIQUE)

// 非空约束
所有 .notNull() 字段
```

---

## 五、数据迁移策略

### 5.1 版本控制

使用 Drizzle Kit 进行迁移：

```bash
# 生成迁移
drizzle-kit generate:pg

# 执行迁移
drizzle-kit push:pg

# 回滚迁移
drizzle-kit rollback
```

### 5.2 备份策略

- 每日自动备份（PostgreSQL pg_dump）
- 保留最近 30 天备份
- 重要变更前手动备份

---

## 六、相关文档

### 6.1 引用本文档的文档

| 文档 | 引用方式 |
|------|---------|
| PRD v2.5 | 引用数据模型摘要，完整内容见本文档 |
| 技术设计文档 | 引用本文档进行数据库设计 |
| API 规范 | 引用本文档定义请求/响应格式 |

### 6.2 相关文档链接

- [技术栈文档](tech-stack.md) - 技术选型
- [技术设计文档](tech-design.md) - 技术架构
- [API 规范](api-spec.md) - API 端点定义
- [技术决策历史](decisions.md) - 决策记录

---

## 七、版本管理

### 7.1 版本规则

**格式**: `v{major}.{minor}.{patch}`

| 类型 | 说明 | 示例 |
|------|------|------|
| **Major** | 数据结构重大变更 | v1.0 → v2.0 |
| **Minor** | 新增实体或字段 | v1.0 → v1.1 |
| **Patch** | 字段属性调整 | v1.0.0 → v1.0.1 |

### 7.2 变更流程

```
1. 发现数据模型需要调整
       ↓
2. 技术团队评估影响（迁移成本）
       ↓
3. 更新数据模型文档
       ↓
4. 编写迁移脚本
       ↓
5. 团队评审
       ↓
6. 发布新版本（含迁移）
       ↓
7. 更新所有引用本文档的材料
```

---

**最后更新**: 2026-01-24
**版本**: v1.0
**维护者**: 技术团队
**变更门槛**: 中（需要技术团队共识，需评估迁移成本）
