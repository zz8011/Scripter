# 剧灵 Scripter - 行为记录系统设计

**项目**: 剧灵 Scripter
**版本**: v1.0
**日期**: 2026-01-23
**状态**: 初稿

---

## 文档说明

本文档详细设计剧灵的行为记录系统。该系统静默记录用户在各个模块的关键动作，为 AI 剧灵提供上下文感知能力，同时为产品优化提供数据支撑。

**核心原则**：
- 只记录关键动作，不记录密集噪音
- 云端存储 + 精确时间戳
- 防抖采样优化性能
- 支持用户画像长期积累

---

## 一、系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     行为记录系统架构                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│  │  前端采集   │ → │  采样缓冲   │ → │  批量写入   │      │
│  │             │   │             │   │             │      │
│  │ • 各模块集成 │   │ • 防抖处理  │   │ • 异步队列  │      │
│  │ • 关键动作   │   │ • 节流控制  │   │ • 批量优化  │      │
│  └─────────────┘   └─────────────┘   └─────────────┘      │
│         │                                     │            │
│         ↓                                     ↓            │
│  ┌─────────────┐                     ┌─────────────┐      │
│  │  本地缓存   │                     │  云端存储   │      │
│  │             │                     │             │      │
│  │ • Session   │                     │ PostgreSQL │      │
│  │ • 内存队列  │                     │ • 时序数据  │      │
│  └─────────────┘                     │ • 用户画像  │      │
│                                      └─────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 数据流

```
用户操作
    ↓
【采集层】判断是否为关键动作
    ↓ 是
【采样层】防抖/节流处理
    ↓
【缓冲层】批量累积（最多10条或2秒）
    ↓
【写入层】异步批量写入数据库
    ↓
【分析层】用户画像生成、产品分析
```

---

## 二、数据模型

### 2.1 行为记录表

```sql
-- Drizzle Schema
CREATE TABLE user_behavior_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID REFERENCES projects(id),

  -- 行为类型
  action_type VARCHAR(50) NOT NULL,

  -- 行为详情（JSON，灵活存储）
  action_data JSONB NOT NULL,

  -- 上下文信息
  context JSONB,

  -- 时间戳（重要！精确到毫秒）
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 会话信息
  session_id UUID,

  -- 元数据
  device_info JSONB,

  -- 索引
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 关键索引
CREATE INDEX idx_behavior_logs_user_timestamp ON user_behavior_logs(user_id, timestamp DESC);
CREATE INDEX idx_behavior_logs_project ON user_behavior_logs(project_id);
CREATE INDEX idx_behavior_logs_action_type ON user_behavior_logs(action_type);
CREATE INDEX idx_behavior_logs_session ON user_behavior_logs(session_id);
```

### 2.2 TypeScript 类型定义

```typescript
// types/behavior.ts

export type ActionType =
  // Dashboard
  | 'open_project'
  | 'create_project'
  | 'delete_project'
  | 'search_projects'

  // Characters
  | 'create_character'
  | 'edit_character_bio'
  | 'ai_generate_bio'
  | 'generate_poem'
  | 'view_relationship_map'

  // Scenes
  | 'create_scene'
  | 'change_scene_status'
  | 'reorder_scenes'
  | 'batch_change_status'
  | 'start_editing_scene'

  // Worldview
  | 'create_category'
  | 'add_setting'
  | 'ai_weave_settings'
  | 'use_template'
  | 'view_setting_relations'

  // Storyboard
  | 'create_shot'
  | 'ai_suggest_shot'
  | 'export_storyboard'
  | 'reorder_shots'

  // Export
  | 'export_script'
  | 'generate_production_docs'
  | 'share_project'

  // Editor（防抖后）
  | 'edit_scene'
  | 'select_content'
  | 'change_scene_format'
  | 'save_scene'

  // AI
  | 'ai_query'
  | 'ai_accept'
  | 'ai_reject'

export interface BehaviorLog {
  id: string
  userId: string
  projectId: string | null
  actionType: ActionType
  actionData: ActionData
  context: BehaviorContext
  timestamp: Date
  sessionId: string
  deviceInfo: DeviceInfo
}

export interface ActionData {
  // 通用
  length?: number
  text?: string

  // Dashboard
  projectId?: string
  projectName?: string
  openMethod?: 'click' | 'recent' | 'search'
  genre?: string[]
  scriptType?: string
  query?: string
  resultCount?: number
  clickedResult?: string | null

  // Characters
  characterId?: string
  name?: string
  hasGeneratedBio?: boolean
  bioLength?: number
  editedFields?: string[]
  generatedFields?: string[]
  accepted?: boolean

  // Scenes
  sceneId?: string
  episodeNumber?: number
  sceneNumber?: number
  location?: string
  from?: string
  to?: string
  sceneIds?: string[]
  newOrder?: number[]
  fromKanban?: boolean

  // Worldview
  categoryId?: string
  categoryType?: string
  title?: string
  contentLength?: number
  hasReference?: boolean
  relatedSettings?: string[]
  templateId?: string
  templateType?: string

  // Storyboard
  shotType?: string
  duration?: number
  sceneContent?: string
  suggestedType?: string

  // Export
  format?: string
  includeWatermark?: boolean
  exportScope?: string
  docTypes?: string[]
  shareType?: string
  permission?: string

  // AI
  query?: string
  queryType?: string
  suggestionId?: string
  suggestionType?: string
}

export interface BehaviorContext {
  scene?: {
    number: number
    title: string
  }
  character?: string
  position: number
  wordCount?: number
  episodeNumber?: number
}

export interface DeviceInfo {
  browser: string
  os: string
  screenSize: string
  timezone: string
}
```

---

## 三、各模块关键动作定义

### 3.1 Dashboard（控制台）

| 动作类型 | 记录内容 | 产品价值 |
|---------|---------|---------|
| `open_project` | 项目ID、打开方式 | 分析用户如何找到项目 |
| `create_project` | 题材、类型 | 了解用户偏好 |
| `delete_project` | 项目年龄 | 分析用户流失原因 |
| `search_projects` | 搜索词、结果数 | 了解用户需求 |

```typescript
// Dashboard 集成示例
const tracker = useBehaviorTracker()

const handleOpenProject = (project: Project) => {
  tracker.track('open_project', {
    projectId: project.id,
    projectName: project.name,
    lastEditTime: project.updatedAt,
    openMethod: 'click'
  }, {})
}
```

### 3.2 Characters（人物管理）

| 动作类型 | 记录内容 | 产品价值 |
|---------|---------|---------|
| `create_character` | 角色名、是否AI生成 | AI 功能使用率 |
| `edit_character_bio` | 编辑字段 | 用户关注点 |
| `ai_generate_bio` | 生成字段、是否采纳 | AI 质量评估 |
| `generate_poem` | 生成方式 | 功能使用情况 |
| `view_relationship_map` | 查看角色 | 功能使用率 |

### 3.3 Scenes（场景管理）

| 动作类型 | 记录内容 | 产品价值 |
|---------|---------|---------|
| `create_scene` | 集数、场景号 | 创作节奏 |
| `change_scene_status` | 状态转换 | 创作进度分析 |
| `reorder_scenes` | 场景重排 | 结构调整频率 |
| `start_editing_scene` | 来源 | 用户路径分析 |

### 3.4 Worldview（世界观）

| 动作类型 | 记录内容 | 产品价值 |
|---------|---------|---------|
| `create_category` | 分类类型 | 设定偏好 |
| `add_setting` | 内容长度、是否有引用 | 创作深度 |
| `ai_weave_settings` | 相关设定、采纳情况 | AI 功能评估 |
| `use_template` | 模板类型 | 模板使用情况 |

### 3.5 Storyboard（分镜）

| 动作类型 | 记录内容 | 产品价值 |
|---------|---------|---------|
| `create_shot` | 镜头类型 | 镜头偏好 |
| `ai_suggest_shot` | 场景内容、采纳情况 | AI 质量评估 |
| `export_storyboard` | 导出格式 | 功能使用情况 |

### 3.6 Export（导出）

| 动作类型 | 记录内容 | 产品价值 |
|---------|---------|---------|
| `export_script` | 格式、防盗版选项 | 格式偏好 |
| `generate_production_docs` | 文档类型 | 制作阶段转化 |
| `share_project` | 分享类型、权限 | 协作需求分析 |

### 3.7 Editor（编辑器，防抖后）

| 动作类型 | 记录内容 | 防抖策略 |
|---------|---------|---------|
| `edit_scene` | 编辑次数、总长度、持续时长 | 2秒内合并 |
| `select_content` | 选中文本、节点类型 | 不防抖 |
| `change_scene_format` | 格式转换 | 记录转换 |
| `save_scene` | 场景ID、字数 | 自动保存时不记录 |

### 3.8 AI（剧灵交互）

| 动作类型 | 记录内容 | 产品价值 |
|---------|---------|---------|
| `ai_query` | 问题类型、上下文 | 需求分析 |
| `ai_accept` | 建议类型 | 采纳率 |
| `ai_reject` | 建议类型 | 拒绝原因分析 |

---

## 四、采样与防抖策略

### 4.1 编辑动作防抖

```typescript
// lib/behavior/sampler.ts

class BehaviorSampler {
  private editBuffer: Map<string, EditBuffer> = new Map()
  private debounceTime = 2000  // 2秒

  trackEdit(sceneId: string, editData: EditData) {
    const key = `${sceneId}`

    // 清除之前的定时器
    if (this.editBuffer.has(key)) {
      clearTimeout(this.editBuffer.get(key)!.timer)
    }

    // 累积编辑数据
    const existing = this.editBuffer.get(key)
    const accumulated = existing ? {
      editsCount: existing.data.editsCount + 1,
      totalLength: existing.data.totalLength + (editData.length || 0),
      duration: existing.data.duration + this.debounceTime,
      ...editData
    } : {
      editsCount: 1,
      totalLength: editData.length || 0,
      duration: 0,
      ...editData
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      this.flushEdit(key, accumulated)
      this.editBuffer.delete(key)
    }, this.debounceTime)

    this.editBuffer.set(key, { timer, data: accumulated })
  }

  private flushEdit(key: string, data: any) {
    tracker.track('edit_scene', {
      editsCount: data.editsCount,
      totalLength: data.totalLength,
      duration: data.duration
    }, {
      sceneId: data.sceneId,
      wordCount: data.wordCount
    })
  }
}
```

### 4.2 光标移动采样

```typescript
// 光标移动不记录，除非：
// 1. 停留超过 5 秒（思考点）
// 2. 切换到其他场景

class CursorSampler {
  private lastPosition: { sceneId: string, position: number } | null = null
  private stayTimer: NodeJS.Timeout | null = null
  private stayThreshold = 5000  // 5秒

  onCursorMove(sceneId: string, position: number) {
    // 位置变化，清除停留计时
    if (this.stayTimer) {
      clearTimeout(this.stayTimer)
      this.stayTimer = null
    }

    // 场景切换，记录
    if (this.lastPosition && this.lastPosition.sceneId !== sceneId) {
      tracker.track('change_scene', {
        from: this.lastPosition.sceneId,
        to: sceneId
      }, {})
    }

    this.lastPosition = { sceneId, position }

    // 开始新的停留计时
    this.stayTimer = setTimeout(() => {
      // 停留超过 5 秒，记录思考点
      tracker.track('user_pause', {
        sceneId,
        position,
        pauseDuration: this.stayThreshold
      }, {})
    }, this.stayThreshold)
  }
}
```

### 4.3 不记录的动作

```
❌ 光标移动（未停留）
❌ 滚动
❌ 悬停
❌ 聚焦
❌ 单字输入（被防抖合并）
❌ 小范围选择（< 10 字符）
```

---

## 五、行为记录服务

### 5.1 核心服务

```typescript
// lib/behavior/behaviorTracker.ts

import { db } from '@/db'
import { userBehaviorLogs } from '@/db/schema'
import { nanoid } from 'nanoid'

class BehaviorTracker {
  private sessionId: string
  private userId: string
  private projectId: string | null = null
  private batchBuffer: BehaviorLog[] = []
  private batchSize = 10

  constructor(userId: string) {
    this.userId = userId
    this.sessionId = nanoid()
  }

  setProject(projectId: string) {
    this.projectId = projectId
  }

  // 记录行为
  async track(
    actionType: ActionType,
    actionData: ActionData,
    context: Partial<BehaviorContext>
  ) {
    const log: Omit<BehaviorLog, 'id'> = {
      userId: this.userId,
      projectId: this.projectId,
      actionType,
      actionData,
      context: {
        position: 0,
        ...context
      } as BehaviorContext,
      timestamp: new Date(),
      sessionId: this.sessionId,
      deviceInfo: this.getDeviceInfo()
    }

    // 异步批量写入
    this.batchBuffer.push(log as BehaviorLog)

    if (this.batchBuffer.length >= this.batchSize) {
      await this.flush()
    }
  }

  // 刷新缓冲区
  async flush() {
    if (this.batchBuffer.length === 0) return

    try {
      await db.insert(userBehaviorLogs).values(this.batchBuffer)
      this.batchBuffer = []
    } catch (error) {
      console.error('Failed to log behavior:', error)
    }
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      browser: navigator.userAgent,
      os: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }
}

// 单例
let trackerInstance: BehaviorTracker | null = null

export function getBehaviorTracker(userId: string): BehaviorTracker {
  if (!trackerInstance || trackerInstance['userId'] !== userId) {
    trackerInstance = new BehaviorTracker(userId)
  }
  return trackerInstance
}

// 页面卸载时刷新
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    trackerInstance?.flush()
  })
}
```

### 5.2 React Hook

```typescript
// hooks/useBehaviorTracker.ts

import { getBehaviorTracker } from '@/lib/behavior/behaviorTracker'
import { useUser } from '@/hooks/useUser'

export function useBehaviorTracker() {
  const { user } = useUser()

  const tracker = useMemo(() => {
    if (!user?.id) return null
    return getBehaviorTracker(user.id)
  }, [user?.id])

  return {
    track: (
      actionType: ActionType,
      actionData: ActionData,
      context?: Partial<BehaviorContext>
    ) => {
      if (tracker) {
        tracker.track(actionType, actionData, context || {})
      }
    },
    setProject: (projectId: string) => {
      if (tracker) {
        tracker.setProject(projectId)
      }
    }
  }
}
```

---

## 六、各模块集成示例

### 6.1 Dashboard

```typescript
// app/(dashboard)/dashboard/page.tsx

export function DashboardPage() {
  const tracker = useBehaviorTracker()

  const handleOpenProject = (project: Project, method: 'click' | 'recent' | 'search') => {
    tracker.track('open_project', {
      projectId: project.id,
      projectName: project.name,
      lastEditTime: project.updatedAt,
      openMethod: method
    }, {})

    router.push(`/projects/${project.id}`)
  }

  const handleCreateProject = (newProject: Project) => {
    tracker.track('create_project', {
      projectId: newProject.id,
      projectName: newProject.name,
      genre: newProject.genre,
      scriptType: newProject.scriptType
    }, {})
  }

  return (
    <div>
      <ProjectList onOpen={(p) => handleOpenProject(p, 'click')} />
      <RecentProjects onOpen={(p) => handleOpenProject(p, 'recent')} />
      <SearchBar
        onSearch={(q, results) => {
          tracker.track('search_projects', {
            query: q,
            resultCount: results.length,
            clickedResult: null
          }, {})
        }}
        onClickResult={(p) => handleOpenProject(p, 'search')}
      />
    </div>
  )
}
```

### 6.2 Editor

```typescript
// components/editor/ScriptEditor.tsx

export function ScriptEditor({ userId, projectId }: Props) {
  const tracker = useBehaviorTracker()
  const sampler = useMemo(() => new BehaviorSampler(), [])

  useEffect(() => {
    tracker.setProject(projectId)
  }, [projectId, tracker])

  const editor = useEditor({
    extensions: [...],
    onUpdate: ({ editor }) => {
      // 防抖记录编辑
      sampler.trackEdit(projectId, {
        sceneId: currentSceneId,
        editsCount: 1,
        length: getEditLength(editor),
        wordCount: getWordCount(editor)
      })
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection

      if (from !== to && to - from >= 10) {
        // 选中超过10个字符，记录
        tracker.track('select_content', {
          text: editor.state.doc.textBetween(from, to),
          nodeType: editor.state.doc.nodeAt(from)?.type.name,
          length: to - from
        }, {
          position: from,
          scene: getCurrentScene(editor)
        })
      }
    }
  })

  return <EditorContent editor={editor} />
}
```

### 6.3 AI Panel

```typescript
// components/ai/AIPanel.tsx

export function AIPanel({ userId, projectId }: Props) {
  const tracker = useBehaviorTracker()

  const handleSendMessage = async (message: string) => {
    tracker.track('ai_query', {
      query: message,
      queryType: analyzeQueryType(message)
    }, {
      position: getCurrentEditorPosition(),
      scene: getCurrentScene()
    })

    const response = await callAI(message)
    return response
  }

  const handleAcceptSuggestion = (suggestionId: string, type: string) => {
    tracker.track('ai_accept', {
      suggestionId,
      suggestionType: type
    }, {})
  }

  const handleRejectSuggestion = (suggestionId: string, type: string) => {
    tracker.track('ai_reject', {
      suggestionId,
      suggestionType: type
    }, {})
  }

  return (
    <ChatInterface
      onSendMessage={handleSendMessage}
      onAccept={handleAcceptSuggestion}
      onReject={handleRejectSuggestion}
    />
  )
}
```

---

## 七、数据分析与用户画像

### 7.1 数据查询示例

```sql
-- 用户创作高峰时段
SELECT
  EXTRACT(HOUR FROM timestamp) as hour,
  COUNT(*) as action_count
FROM user_behavior_logs
WHERE user_id = ?
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY hour
ORDER BY action_count DESC;

-- 平均创作会话时长
SELECT
  session_id,
  MIN(timestamp) as session_start,
  MAX(timestamp) as session_end,
  EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) / 60 as duration_minutes
FROM user_behavior_logs
WHERE user_id = ?
GROUP BY session_id;

-- AI 功能使用统计
SELECT
  action_type,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users
FROM user_behavior_logs
WHERE action_type LIKE 'ai_%'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY action_type;
```

### 7.2 用户画像生成

```typescript
// lib/analytics/userProfiler.ts

import { eq, gte, and } from 'drizzle-orm'

export async function generateUserProfile(userId: string): Promise<UserProfile> {
  const behaviors = await db.select()
    .from(userBehaviorLogs)
    .where(
      and(
        eq(userBehaviorLogs.userId, userId),
        gte(userBehaviorLogs.timestamp, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      )
    )

  return {
    userId,
    dialogueStyle: analyzeDialogueStyle(behaviors),
    writingSchedule: analyzeWritingSchedule(behaviors),
    aiUsage: analyzeAIUsage(behaviors),
    editingPatterns: analyzeEditingPatterns(behaviors),
    lastUpdated: new Date()
  }
}
```

---

## 八、隐私与合规

### 8.1 隐私保护措施

| 措施 | 说明 |
|------|------|
| **数据匿名化** | 分析时使用匿名 ID |
| **聚合统计** | 产品优化只看群体数据 |
| **用户知情** | 隐私政策明确说明 |
| **数据导出** | 用户可导出自己的数据 |
| **数据删除** | 用户可要求删除 |
| **合规存储** | 国内服务器 |

### 8.2 用户控制

```typescript
// 用户可以控制行为记录
interface BehaviorSettings {
  enabled: boolean              // 总开关
  shareForProduct: boolean      // 用于产品优化
  shareForAI: boolean           // 用于 AI 个性化
  retentionDays: number         // 保留天数
}
```

---

## 九、相关文档

- [AI 伙伴交互设计](./ai-partner-interaction-design.md) - 剧灵系统设计
- [PRD v2.3](../prd/2026-01-23-scripter-prd-v2.3.md) - 产品需求文档
- [技术设计文档](../tech/tech-design.md) - 技术架构

---

**剧灵 Scripter — 行为记录系统设计 v1.0**

*"静默观察，只为更好地理解你"* 🤝
