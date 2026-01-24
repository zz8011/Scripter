# 剧灵 Scripter - 技术设计文档

> 本文档详细说明系统的技术架构、核心实现和技术选型

**更新日期:** 2026-01-23
**技术栈版本:** v2.1 (Drizzle + Casdoor + GLM-4.7)

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [PRD v2.3](../prd/2026-01-23-scripter-prd-v2.3.md) | 产品需求文档（优化版） |
| [UI 设计系统](../design/ui-design-system.md) | 视觉设计规范 |
| [API 规范](api-spec.md) | API 端点定义 |
| [实施计划](../implementation-plan.md) | 开发任务清单 |
| [迁移计划](migration-plan-drizzle-casdoor.md) | 技术栈迁移 |

---

## 一、技术栈

### 1.1 核心技术

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | Next.js | 14+ | App Router, SSR/SSG, View Transitions |
| **UI 组件** | shadcn/ui + Tailwind CSS | latest | 纸质主题, 可定制 |
| **编辑器** | TipTap | latest | 无头设计, 高度可定制 |
| **AI 文本** | 智谱 GLM-4.7 | - | 国产大模型, 成本更低 |
| **AI 图片** | T8Star (nano-banana-2) | - | 专业图片生成服务 |
| **数据库 ORM** | Drizzle ORM | latest | 高性能, SQL 透明, Edge 支持 |
| **数据库** | PostgreSQL | 15+ | 关系型数据库 |
| **认证** | Casdoor | latest | 独立部署, 可视化管理, SSO |
| **拖拽** | @dnd-kit/core | latest | 现代化拖拽库 |
| **存储** | AWS S3 / 阿里云 OSS | - | 对象存储, CDN |
| **实时通信** | Socket.io | latest | WebSocket 实时协作 |

### 1.2 技术选型对比

#### Drizzle ORM vs Prisma

| 特性 | Drizzle ORM | Prisma |
|------|-------------|--------|
| 性能 | ⚡ 快（无查询解析开销） | 中等 |
| 包大小 | ~100KB | ~3MB |
| SQL 控制 | ✅ 显式、透明 | 隐式抽象 |
| Edge Runtime | ✅ 完全支持 | ❌ 不支持 |
| 类型安全 | ✅ 更精确 | ✅ 良好 |
| 迁移灵活度 | ✅ SQL 优先 | ⚠️ 自定义受限 |

**决策理由**: Drizzle 提供更好的性能和 SQL 透明度，完全支持 Edge Runtime，更适合现代 Web 应用。

#### Casdoor vs NextAuth.js

| 特性 | Casdoor | NextAuth.js |
|------|---------|-------------|
| 部署方式 | ✅ 独立服务 | 应用内集成 |
| 管理界面 | ✅ 完整 Web UI | ❌ 无 |
| 多租户 | ✅ 原生支持 | ⚠️ 有限 |
| SSO | ✅ 内置 | ⚠️ 需自建 |
| 协议支持 | OAuth 2.0 + OIDC + SAML | OAuth 2.0 |

**决策理由**: Casdoor 提供企业级身份管理，可视化管理界面降低运维成本，支持未来扩展。

#### 智谱 GLM-4.7 vs Vercel AI SDK (OpenAI)

| 特性 | 智谱 GLM-4.7 | Vercel AI SDK |
|------|--------------|---------------|
| 成本 | ¥0.50/百万tokens | $30/百万tokens |
| 中文能力 | ✅ 专门优化 | 良好 |
| 国内合规 | ✅ 合规 | ⚠️ 需考虑 |
| API 稳定性 | ✅ 国内节点 | ❌ 依赖海外 |

**决策理由**: 成本降低 95%+，中文能力更强，国内访问更稳定。

### 1.2 开发工具

| 工具 | 用途 |
|------|------|
| **TypeScript** | 类型安全 |
| **ESLint + Prettier** | 代码规范 |
| **Husky + lint-staged** | Git hooks |
| **Jest + Testing Library** | 单元测试 |
| **Playwright** | E2E 测试 |
| **Docker** | 容器化部署 |

---

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户界面层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │剧本编辑器│  │世界观管理│  │人物管理  │  │分镜管理  │ │
│  │[拖动功能]│  │          │  │          │  │          │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│  ┌──────────┐  ┌──────────┐                            │
│  │AI助手   │  │图片生成  │                            │
│  └──────────┘  └──────────┘                            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      业务逻辑层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │项目管理  │  │格式检查  │  │拖动逻辑  │  │版本控制  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │图片生成  │  │分镜管理  │  │权限管理  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      数据访问层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Prisma  │  │   AI     │  │  Storage │  │   Cache  │ │
│  │   ORM    │  │  Service │  │  Service │  │  Service │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      数据存储层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │PostgreSQL│  │  AI API  │  │  S3/ OSS │  │  Redis   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.2 前端架构

#### 目录结构

```
app/
├── (auth)/                          # 认证路由组
│   ├── login/
│   └── register/
├── (dashboard)/                     # 主应用路由组
│   ├── dashboard/                   # 仪表板
│   ├── projects/
│   │   ├── [id]/
│   │   │   ├── overview/            # 剧本详情
│   │   │   ├── editor/              # 剧本编辑器
│   │   │   ├── characters/          # 人物管理
│   │   │   ├── scenes/              # 场景管理
│   │   │   ├── worldview/           # 世界观
│   │   │   └── storyboard/          # 分镜
│   │   └── new/
│   └── settings/
├── api/                             # API 路由
│   ├── auth/
│   ├── projects/
│   ├── ai/
│   └── webhooks/
├── layout.tsx                       # 根布局
└── page.tsx                         # 首页
```

#### 组件架构

```
components/
├── ui/                              # shadcn/ui 组件
├── editor/                          # 编辑器组件
│   ├── ScriptEditor.tsx             # 主编辑器
│   ├── SceneNavigator.tsx           # 场景导航
│   ├── FormatToolbar.tsx            # 格式工具栏
│   └── DraggableParagraph.tsx       # 可拖拽段落
├── ai/                              # AI 组件
│   ├── AIAssistant.tsx              # AI 助手面板
│   ├── StreamingResponse.tsx        # 流式响应
│   └── SkillSelector.tsx            # Skill 选择器
├── drag-and-drop/                   # 拖拽组件
│   ├── SceneDraggable.tsx
│   ├── ParagraphDraggable.tsx
│   └── DndContext.tsx
└── shared/                          # 共享组件
    ├── ProjectCard.tsx
    ├── CharacterCard.tsx
    └── SceneCard.tsx
```

---

## 三、核心模块实现

### 3.1 剧本编辑器 (TipTap)

#### 配置

```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Character from './extensions/Character'
import SceneHeading from './extensions/SceneHeading'
import Action from './extensions/Action'
import Dialogue from './extensions/Dialogue'
import OS from './extensions/OS'

export function ScriptEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '开始创作...',
      }),
      Character,
      SceneHeading,
      Action,
      Dialogue,
      OS,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  })

  return <EditorContent editor={editor} />
}
```

#### 自定义扩展示例

```typescript
// extensions/SceneHeading.ts
import { Node, mergeAttributes } from '@tiptap/core'

export default Node.create({
  name: 'sceneHeading',

  group: 'block',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'h2[data-type="scene-heading"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['h2', mergeAttributes(HTMLAttributes, { 'data-type': 'scene-heading' }), 0]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-1': () => this.editor.commands.insertContent({
        type: this.name,
      }),
    }
  },
})
```

### 3.2 AI 意图路由系统

#### 架构

```typescript
// lib/ai/intention-dispatcher.ts
import { glmClient } from '@/lib/zhipu/client'

// Skill 注册表
const SKILLS = {
  formatFix: formatFixSkill,
  dialoguePolish: dialoguePolishSkill,
  sceneExpand: sceneExpandSkill,
  plotAnalyze: plotAnalyzeSkill,
  humanize: humanizeSkill,
}

// Agent 注册表
const AGENTS = {
  audienceCritic: audienceCriticAgent,
  plotTwister: plotTwisterAgent,
  characterOptimizer: characterOptimizerAgent,
}

export async function dispatchIntention(
  input: string,
  context: EditorContext
) {
  // 1. 意图识别
  const intention = await recognizeIntention(input)

  // 2. 路由到对应 Skill 或 Agent
  if (intention.type === 'skill') {
    const skill = SKILLS[intention.skill]
    return await skill.execute(input, context)
  } else if (intention.type === 'agent') {
    const agent = AGENTS[intention.agent]
    return await agent.execute(input, context)
  }

  // 3. 默认通用响应（使用 GLM-4.7）
  return await glmClient.chat({
    messages: [{ role: 'user', content: input }],
    stream: true,
  })
}

// 意图识别（使用轻量级模型）
async function recognizeIntention(input: string) {
  const result = await glmClient.chat({
    model: 'glm-4-flash',
    messages: [
      {
        role: 'system',
        content: `识别用户意图，返回 JSON：
        {
          "type": "skill" | "agent" | "general",
          "skill": "formatFix" | "dialoguePolish" | "sceneExpand" | ...,
          "agent": "audienceCritic" | "plotTwister" | ...
        }`
      },
      { role: 'user', content: input }
    ],
    responseFormat: { type: 'json_object' }
  })

  return JSON.parse(result.choices[0].message.content)
}
```

#### Skill 示例

```typescript
// skills/format-fix.ts
export const formatFixSkill = {
  name: 'formatFix',
  description: '修复剧本格式问题',

  async execute(input: string, context: EditorContext) {
    const { currentScene, scriptContent } = context

    const prompt = `
你是一位剧本格式专家。请检查以下场景的格式是否符合中文短剧剧本格式规范 v2.0：

场景内容：
${currentScene}

全剧本上下文：
${scriptContent}

要求：
1. 场景标题格式：**场X-Y 时间/内外 地点 主要人物**
2. 人物名格式：加粗，居中
3. 对白格式：人物名下方，缩进
4. 动作描述格式：靠左，斜体
5. OS内心独白格式：标注（OS）

请输出修复后的场景内容。
`

    return await glmClient.chat({
      model: 'glm-4-plus',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })
  }
}
```

#### Agent 示例

```typescript
// agents/audience-critic.ts
export const audienceCriticAgent = {
  name: 'audienceCritic',
  persona: '你是一位资深的短剧观众，擅长从观众角度分析剧本问题',

  async execute(input: string, context: EditorContext) {
    const { currentEpisode, characterProfiles } = context

    const prompt = `
${this.persona}

请从观众角度分析以下剧集：

剧集内容：
${currentEpisode}

人物设定：
${characterProfiles}

分析维度：
1. 节奏是否吸引人？哪里拖沓？
2. 情节是否合理？有没有逻辑漏洞？
3. 人物行为是否符合人设？
4. 有没有让观众失望的桥段？
5. 整体观感如何？（1-5分）

请给出具体的改进建议。
`

    return await glmClient.chat({
      model: 'glm-4-plus',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })
  }
}
```

### 3.3 拖拽功能 (@dnd-kit)

#### 场景拖拽

```typescript
'use client'

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SceneList({ scenes, onReorder }) {
  const [items, setItems] = useState(scenes)

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      onReorder(newItems)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(scene => (
          <SortableScene key={scene.id} scene={scene} />
        ))}
      </SortableContext>
    </DndContext>
  )
}

function SortableScene({ scene }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scene.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeft: isDragging ? '2px solid #C9A962' : '2px solid transparent',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {scene.title}
    </div>
  )
}
```

#### 段落拖拽

```typescript
function DraggableParagraph({ content, onMove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: content.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={isDragging ? 'opacity-50' : ''}
    >
      <div {...listeners} {...attributes} className="cursor-move">
        ⋮⋮
      </div>
      {content.text}
    </div>
  )
}
```

### 3.4 实时协作 (Socket.io)

#### 服务端

```typescript
// server/collaboration.ts
import { Server } from 'socket.io'

const io = new Server(server)

io.on('connection', (socket) => {
  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`)
  })

  socket.on('document-change', (data) => {
    const { projectId, change, userId } = data
    socket.to(`project:${projectId}`).emit('document-change', {
      change,
      userId,
    })
  })

  socket.on('cursor-move', (data) => {
    const { projectId, position, userId } = data
    socket.to(`project:${projectId}`).emit('cursor-move', {
      position,
      userId,
    })
  })
})
```

#### 客户端

```typescript
'use client'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

function useCollaboration(projectId: string) {
  const [socket, setSocket] = useState(null)
  const [cursors, setCursors] = useState({})

  useEffect(() => {
    const socketInstance = io()
    setSocket(socketInstance)

    socketInstance.emit('join-project', projectId)

    socketInstance.on('document-change', (data) => {
      // 处理文档变更
      applyChange(data.change)
    })

    socketInstance.on('cursor-move', (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: data.position,
      }))
    })

    return () => socketInstance.disconnect()
  }, [projectId])

  const sendChange = (change) => {
    socket?.emit('document-change', {
      projectId,
      change,
      userId: currentUserId,
    })
  }

  const sendCursorMove = (position) => {
    socket?.emit('cursor-move', {
      projectId,
      position,
      userId: currentUserId,
    })
  }

  return { cursors, sendChange, sendCursorMove }
}
```

---

## 四、数据模型

### 4.1 Drizzle Schema

```typescript
// db/schema.ts
import { pgTable, text, integer, json, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// 用户表
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password').notNull(),
  subscription: text('subscription', { enum: ['FREE', 'PERSONAL', 'TEAM', 'ENTERPRISE'] }).default('FREE').notNull(),
  aiQuota: integer('ai_quota').default(500).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 项目表
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  genre: json('genre').$type<string[]>().notNull(),
  scriptType: text('script_type', { enum: ['movie', 'series', 'short-drama'] }).notNull(),
  orientation: text('orientation', { enum: ['landscape', 'portrait'] }).default('portrait').notNull(),
  targetEpisodes: integer('target_episodes').notNull(),
  currentStage: text('current_stage', { enum: ['worldview', 'character', 'script', 'optimize', 'production'] }).default('worldview').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 人物表
export const characters = pgTable('characters', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  poem: text('poem'), // 人物诗号
  age: integer('age'),
  gender: text('gender'),
  occupation: text('occupation'),
  appearance: text('appearance'),
  personality: json('personality').$type<string[]>().notNull(),
  speechStyle: text('speech_style'),
  behaviorPattern: text('behavior_pattern'),
  growthArc: text('growth_arc'),
  relationships: json('relationships').$type<Relationship[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 场景表
export const scenes = pgTable('scenes', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  episodeNumber: integer('episode_number').notNull(),
  sceneNumber: integer('scene_number').notNull(),
  location: text('location').notNull(),
  timeOfDay: text('time_of_day').notNull(),
  intExt: text('int_ext').notNull(),
  mainCharacters: json('main_characters').$type<string[]>().notNull(),
  content: json('content').notNull(), // TipTap JSON
  duration: integer('duration').notNull(), // 秒
  status: text('status', { enum: ['draft', 'completed'] }).default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 世界观表
export const worldviews = pgTable('worldviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().unique().references(() => projects.id),
  era: text('era'), // 时代背景
  geography: text('geography'), // 地理环境
  mystery: text('mystery'), // 神秘元素
  socialClass: text('social_class'), // 社会阶层
  references: json('references').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 分镜表
export const storyboards = pgTable('storyboards', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().unique().references(() => projects.id),
  shots: json('shots').notNull(), // 分镜数据
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 剧本版本表
export const scriptVersions = pgTable('script_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  scriptId: uuid('script_id').notNull(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  version: integer('version').notNull(),
  label: text('label'),
  isMilestone: integer('is_milestone', { mode: 'boolean' }).default(false).notNull(),
  content: json('content').notNull(), // 完整剧本内容
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// AI 对话历史表
export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  projectId: uuid('project_id').references(() => projects.id),
  agent: text('agent').notNull(), // 使用的 Agent
  messages: json('messages').notNull(), // ConversationMessage[]
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 创作里程碑表
export const creativeMilestones = pgTable('creative_milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  type: text('type', { enum: ['first_scene', 'first_episode', 'completed'] }).notNull(),
  achievedAt: timestamp('achieved_at').defaultNow().notNull(),
  aiContribution: integer('ai_contribution').notNull(), // AI 贡献度 0-100
})

// 关系定义
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  scriptVersions: many(scriptVersions),
  aiConversations: many(aiConversations),
  creativeMilestones: many(creativeMilestones),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  characters: many(characters),
  scenes: many(scenes),
  worldview: one(worldviews),
  storyboard: one(storyboards),
  scriptVersions: many(scriptVersions),
  aiConversations: many(aiConversations),
  creativeMilestones: many(creativeMilestones),
}))

// 类型定义
interface Relationship {
  characterId: string
  relationType: string
  description: string
}
```

---

## 五、API 规范

> 详见 [API 规范文档](api-spec.md)

---

## 六、部署架构

### 6.1 生产环境

```
┌─────────────────────────────────────────────────────────┐
│                      CDN (Cloudflare)                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Next.js App (Vercel)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │静态资源  │  │SSR 页面  │  │API 路由  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    后端服务                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │PostgreSQL│  │  Redis   │  │Socket.io │              │
│  │(Neon DB) │  │(Upstash) │  │  Server  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    外部服务                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │OpenAI API│  │Replicate │  │ AWS S3   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 6.2 环境变量

```bash
# .env.production

# 数据库 (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/scripter

# 智谱 AI
ZHIPU_API_KEY=your_zhipu_api_key
ZHIPU_API_BASE=https://open.bigmodel.cn/api/paas/v4

# T8Star 图片生成
T8STAR_API_KEY=your_t8star_api_key
T8STAR_API_BASE=https://ai.t8star.cn

# Casdoor 认证
CASDOOR_ENDPOINT=http://your-casdoor-server
CASDOOR_CLIENT_ID=your_client_id
CASDOOR_CLIENT_SECRET=your_client_secret
CASDOOR_ORGANIZATION=your_org

# 对象存储 (AWS S3 / 阿里云 OSS)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=scripter-uploads
AWS_REGION=us-east-1

# Redis (可选，用于缓存)
REDIS_URL=redis://localhost:6379

# 应用配置
NEXT_PUBLIC_APP_URL=https://scripter.app
```

---

## 七、性能优化

### 7.1 前端优化

- **代码分割**: 动态导入编辑器组件
- **图片优化**: Next.js Image 组件 + WebP
- **虚拟滚动**: 大场景列表使用 react-window
- **缓存策略**: SWR + Stale-While-Revalidate

### 7.2 后端优化

- **数据库索引**: 关键字段添加索引
- **连接池**: Prisma 连接池配置
- **Redis 缓存**: 热点数据缓存
- **CDN**: 静态资源 CDN 加速

---

## 八、安全策略

### 8.1 认证与授权

- NextAuth.js 认证
- JWT Token 认证
- RBAC 权限控制

### 8.2 数据安全

- 数据加密传输 (HTTPS)
- 密码哈希 (bcrypt)
- AI 配额控制
- Rate Limiting

---

## 九、监控与日志

- **错误监控**: Sentry
- **性能监控**: Vercel Analytics
- **日志服务**: PlanetScale / LogRocket
- **AI 成本监控**: 自建监控面板

---

**让灵感，在剧本中苏醒** ✨
