# Phase 4 Week 2: 技能系统详细设计

> **设计版本**: v1.0  
> **制定日期**: 2026-02-02  
> **负责模块**: 原子化技能系统 (Skills)  
> **开发周期**: 1 周

---

## 🎯 设计目标

实现剧灵 AI 的**原子化技能系统**，让 AI 能够执行具体的剧本创作辅助任务。

**核心概念**:
- **技能 (Skill)**: 原子化的 AI 能力，如格式修复、对白润色
- **技能注册器 (Registry)**: 统一管理所有技能
- **技能执行器 (Executor)**: 异步执行技能，流式返回结果
- **触发器 (Trigger)**: 决定何时执行技能（手动/自动/关键词）

---

## 🏗️ 架构设计

### 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        技能系统 (Skills System)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   触发层 (Trigger Layer)                                        │
│   ├─ 手动触发 ──→ 用户点击技能按钮                              │
│   ├─ 自动触发 ──→ AI 判断需要执行技能                           │
│   └─ 关键词触发 ─→ 检测到特定关键词                             │
│                          ↓                                      │
│   调度层 (Dispatcher)                                           │
│   ├─ 技能匹配 ──→ 根据上下文选择合适的技能                       │
│   ├─ 参数提取 ──→ 从上下文提取执行参数                           │
│   └─ 权限检查 ──→ 检查用户配额和权限                             │
│                          ↓                                      │
│   执行层 (Execution Layer)                                      │
│   ├─ SkillRegistry ──→ 技能注册和查找                           │
│   ├─ SkillExecutor ──→ 异步执行引擎                             │
│   ├─ ContextBuilder ─→ 构建执行上下文                           │
│   └─ ResultFormatter ─→ 格式化执行结果                          │
│                          ↓                                      │
│   技能层 (Skill Layer)                                          │
│   ├─ format-fix ─────→ 剧本格式修复                             │
│   ├─ dialogue-polish ─→ 对白润色                                │
│   ├─ scene-expand ───→ 场景扩展                                 │
│   ├─ rhythm-analyze ──→ 节奏分析                                │
│   ├─ consistency-check → 一致性检查                             │
│   └─ duration-calc ──→ 集长计算                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户触发技能
    ↓
构建执行上下文 (项目 + 场景 + 选中内容 + 历史)
    ↓
查找并验证技能
    ↓
构建 System Prompt (八字性格 + 技能描述)
    ↓
调用智谱 AI (流式)
    ↓
实时返回结果 → UI 展示
    ↓
记录执行历史
```

---

## 📋 接口设计

### 核心类型定义

```typescript
// lib/skills/types.ts

/**
 * 技能定义
 */
export interface Skill {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 功能描述 */
  description: string
  /** 图标 */
  icon: string
  /** 分类 */
  category: 'format' | 'polish' | 'expand' | 'analyze' | 'calculate'
  /** 触发方式 */
  trigger: TriggerConfig
  /** 执行函数 */
  execute: (context: ExecutionContext) => AsyncGenerator<SkillChunk, void, unknown>
  /** 是否需要选中文本 */
  requireSelection?: boolean
  /** 示例 */
  examples?: SkillExample[]
}

/**
 * 触发配置
 */
export interface TriggerConfig {
  type: 'manual' | 'auto' | 'keyword'
  /** 自动触发条件 (当 type='auto' 时) */
  autoCondition?: (ctx: ExecutionContext) => boolean
  /** 关键词列表 (当 type='keyword' 时) */
  keywords?: string[]
  /** 触发优先级 (越高越优先) */
  priority?: number
}

/**
 * 执行上下文
 */
export interface ExecutionContext {
  /** 当前用户 */
  userId: string
  /** 当前项目 */
  projectId?: string
  /** 当前场景 */
  sceneId?: string
  /** 剧本完整内容 */
  content: string
  /** 用户选中的文本 */
  selection?: string
  /** 选中的位置信息 */
  selectionRange?: { start: number; end: number }
  /** 历史对话 */
  conversationHistory: Message[]
  /** 用户八字配置 (影响性格) */
  baziConfig?: BaziConfig
  /** 额外参数 */
  params?: Record<string, unknown>
}

/**
 * 技能执行结果块 (流式)
 */
export interface SkillChunk {
  type: 'content' | 'thinking' | 'error' | 'complete'
  content: string
  metadata?: Record<string, unknown>
}

/**
 * 技能执行结果 (完整)
 */
export interface SkillResult {
  success: boolean
  content: string
  /** 修改建议 (如果是修改类技能) */
  changes?: TextChange[]
  /** 分析结果 (如果是分析类技能) */
  analysis?: AnalysisResult
  /** 使用的 token 数 */
  tokensUsed?: number
  /** 执行时间 (ms) */
  executionTime: number
  /** 错误信息 */
  error?: string
}

/**
 * 文本修改建议
 */
export interface TextChange {
  /** 原文 */
  original: string
  /** 建议修改 */
  suggested: string
  /** 修改原因 */
  reason: string
  /** 位置 */
  position: { start: number; end: number }
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  /** 评分 */
  score?: number
  /** 优点 */
  strengths: string[]
  /** 改进点 */
  improvements: string[]
  /** 详细分析 */
  details: Record<string, string>
}

/**
 * 技能示例
 */
export interface SkillExample {
  input: string
  output: string
  description: string
}
```

---

## 🛠️ 技能列表

### 1. 格式修复 (format-fix)

**功能**: 自动修复剧本格式错误

**触发方式**: 手动 / 自动 (保存时检测)

**输入**: 剧本内容

**输出**: 修复后的剧本 + 修改列表

**修复内容**:
- 场景标题格式 (内外景 + 地点 + 时间)
- 人物名称大写
- 对白缩进
- 动作描述格式
- 括号说明格式

**System Prompt 模板**:
```
你是一位专业的剧本格式编辑。请检查以下剧本内容，修复格式错误。
修复规则：
1. 场景标题格式: 内外景 + 地点 + 时间，如 "内景 咖啡馆 - 日"
2. 人物名称: 首次出现时全大写，如 "张三" → "张三"
3. 对白: 人物名下方，首行不缩进，换行缩进
4. 动作描述: 场景标题和对白之间，括号包裹
5. 括号说明: 对白中的情绪说明，用括号包裹

请输出：
1. 修复后的完整剧本
2. 修改列表 (原文 → 修改后 → 原因)
```

---

### 2. 对白润色 (dialogue-polish)

**功能**: 优化对白，使其更自然、更有表现力

**触发方式**: 手动 (选中文字) / 关键词 ("润色这段")

**输入**: 选中的对白

**输出**: 润色后的对白 + 修改建议

**润色维度**:
- 口语化程度
- 情感表达
- 节奏感
- 人物性格一致性

**System Prompt 模板**:
```
你是一位资深的对白编辑。请润色以下对白，使其更加自然、有表现力。

润色原则：
1. 口语化: 符合人物身份的说话方式
2. 情感: 准确传达情绪，避免平淡
3. 节奏: 长短句结合，有韵律感
4. 性格: 符合人物设定

请输出：
1. 润色后的对白 (3个版本: 保守/平衡/大胆)
2. 每版的修改说明
3. 推荐版本及理由
```

---

### 3. 场景扩展 (scene-expand)

**功能**: 扩写场景，增加细节描写

**触发方式**: 手动

**输入**: 场景标题 + 简要描述

**输出**: 扩展后的完整场景

**扩展内容**:
- 环境描写
- 人物动作
- 氛围渲染
- 镜头建议

**System Prompt 模板**:
```
你是一位擅长场景描写的编剧。请根据以下场景标题和简要描述，扩写成一个完整的场景。

扩展要求：
1. 环境: 详细描写场景的视觉、听觉、嗅觉
2. 动作: 人物的具体动作，而非状态
3. 氛围: 营造情绪氛围，让读者身临其境
4. 镜头: 提供分镜建议 (远景/中景/特写等)

请输出：
1. 扩展后的完整场景 (500-800字)
2. 分镜建议
3. 氛围关键词
```

---

### 4. 节奏分析 (rhythm-analyze)

**功能**: 分析剧本节奏，给出优化建议

**触发方式**: 手动 (针对整场或整个剧本)

**输入**: 剧本内容

**输出**: 节奏分析报告

**分析维度**:
- 场景长度分布
- 对白长度变化
- 动作/对白比例
- 高潮位置建议

**输出示例**:
```typescript
{
  score: 75,
  strengths: ['前3场节奏紧凑', '高潮位置合适'],
  improvements: ['第5场过长，建议拆分', '中间部分略显平淡'],
  details: {
    sceneLengthVariance: '中等',
    dialoguePacing: '前快后慢',
    climaxPosition: '约75%位置',
    recommendedChanges: ['第5场在第3个动作点后切镜']
  }
}
```

---

### 5. 一致性检查 (consistency-check)

**功能**: 检查剧本中的人物、时间、地点一致性

**触发方式**: 手动 / 自动 (导出前)

**输入**: 整个剧本

**输出**: 一致性问题和建议

**检查项目**:
- 人物名字拼写一致性
- 时间线逻辑
- 地点切换合理性
- 人物年龄/特征一致性

---

### 6. 集长计算 (duration-calc)

**功能**: 估算剧本的影视时长

**触发方式**: 手动

**输入**: 剧本内容

**输出**: 时长估算

**计算规则**:
- 场景数 × 平均场景时长
- 对白字数 ÷ 语速
- 动作描述复杂度调整

**输出示例**:
```typescript
{
  estimatedMinutes: 45,
  estimatedSeconds: 30,
  breakdown: {
    scenes: { count: 12, minutes: 36 },
    dialogue: { wordCount: 3500, minutes: 7 },
    action: { adjustment: 2.5 }
  },
  format: '电视剧单集标准时长 (45分钟)'
}
```

---

## 🔧 核心模块实现

### 1. 技能注册器 (SkillRegistry)

```typescript
// lib/skills/registry.ts

class SkillRegistry {
  private skills = new Map<string, Skill>()
  
  /** 注册技能 */
  register(skill: Skill): void {
    this.skills.set(skill.id, skill)
  }
  
  /** 获取技能 */
  get(id: string): Skill | undefined {
    return this.skills.get(id)
  }
  
  /** 获取所有技能 */
  getAll(): Skill[] {
    return Array.from(this.skills.values())
  }
  
  /** 根据分类获取技能 */
  getByCategory(category: SkillCategory): Skill[] {
    return this.getAll().filter(s => s.category === category)
  }
  
  /** 获取手动触发的技能 */
  getManualSkills(): Skill[] {
    return this.getAll().filter(s => s.trigger.type === 'manual')
  }
  
  /** 匹配自动触发的技能 */
  matchAutoSkills(context: ExecutionContext): Skill[] {
    return this.getAll().filter(s => {
      if (s.trigger.type !== 'auto') return false
      return s.trigger.autoCondition?.(context) ?? false
    })
  }
}

// 单例导出
export const skillRegistry = new SkillRegistry()
```

### 2. 技能执行器 (SkillExecutor)

```typescript
// lib/skills/executor.ts

import { callZhipuAIStream } from '@/lib/zhipu'

class SkillExecutor {
  /** 执行技能 (流式) */
  async *execute(
    skillId: string,
    context: ExecutionContext
  ): AsyncGenerator<SkillChunk, SkillResult, unknown> {
    const skill = skillRegistry.get(skillId)
    if (!skill) {
      yield { type: 'error', content: '技能不存在' }
      return { success: false, content: '', executionTime: 0, error: '技能不存在' }
    }
    
    const startTime = Date.now()
    
    try {
      // 调用技能的 execute 方法
      for await (const chunk of skill.execute(context)) {
        yield chunk
      }
      
      return {
        success: true,
        content: '', // 由流式数据组装
        executionTime: Date.now() - startTime
      }
    } catch (error) {
      yield { type: 'error', content: error instanceof Error ? error.message : '执行失败' }
      return {
        success: false,
        content: '',
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '执行失败'
      }
    }
  }
  
  /** 构建技能 System Prompt */
  private buildSystemPrompt(skill: Skill, context: ExecutionContext): string {
    const basePrompt = `你是一位专业的剧本创作助手，擅长${skill.description}。`
    
    // 注入八字性格
    const personalityPrompt = context.baziConfig 
      ? `你的性格特质：${context.baziConfig.personality.tone}、${context.baziConfig.personality.style}。`
      : ''
    
    return `${basePrompt}\n${personalityPrompt}\n${skill.description}`
  }
}

export const skillExecutor = new SkillExecutor()
```

### 3. 技能工厂 (SkillFactory)

```typescript
// lib/skills/factory.ts

/** 创建标准技能 */
export function createStandardSkill(config: {
  id: string
  name: string
  description: string
  icon: string
  category: SkillCategory
  systemPrompt: string
  requireSelection?: boolean
}): Skill {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    icon: config.icon,
    category: config.category,
    requireSelection: config.requireSelection,
    trigger: { type: 'manual' },
    
    async *execute(context: ExecutionContext) {
      const prompt = buildPrompt(config.systemPrompt, context)
      
      const stream = await callZhipuAIStream({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: buildUserMessage(context) }
        ]
      })
      
      for await (const chunk of stream) {
        yield {
          type: 'content',
          content: chunk.content
        }
      }
      
      yield { type: 'complete', content: '' }
    }
  }
}
```

---

## 🗄️ 数据库设计

### 技能执行记录表

```typescript
// lib/db/schema/skill-executions.ts

export const skillExecutions = pgTable('skill_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  projectId: uuid('project_id').references(() => projects.id),
  sceneId: uuid('scene_id').references(() => scenes.id),
  skillId: text('skill_id').notNull(), // 技能标识
  skillName: text('skill_name').notNull(), // 技能名称
  inputContent: text('input_content'), // 输入内容摘要
  outputContent: text('output_content'), // 输出内容摘要
  tokensUsed: integer('tokens_used'), // 使用的 token 数
  executionTime: integer('execution_time'), // 执行时间 (ms)
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

---

## 🌐 API 设计

### 技能相关 API

```typescript
// GET /api/skills
// 获取所有可用技能
{
  skills: [
    { id: 'format-fix', name: '格式修复', icon: 'lucide:align-left', category: 'format' },
    { id: 'dialogue-polish', name: '对白润色', icon: 'lucide:wand-2', category: 'polish' },
    // ...
  ]
}

// POST /api/skills/execute
// 执行技能
{
  skillId: 'dialogue-polish',
  projectId: 'xxx',
  sceneId: 'yyy',
  selection: '选中的对白内容',
  params: { style: 'balanced' }
}
// 返回: SSE 流式响应

// GET /api/skills/executions?projectId=xxx
// 获取技能执行历史
{
  executions: [
    { id: '...', skillName: '对白润色', createdAt: '...', success: true }
  ]
}
```

---

## 🎨 UI 设计

### 技能面板

```
┌─────────────────────────────────────────────┐
│  💡 剧灵技能                                  │
├─────────────────────────────────────────────┤
│                                             │
│  📐 格式                                      │
│  ┌─────────────┐ ┌─────────────┐            │
│  │  格式修复   │ │  一致性检查  │            │
│  └─────────────┘ └─────────────┘            │
│                                             │
│  ✨ 润色                                      │
│  ┌─────────────┐ ┌─────────────┐            │
│  │  对白润色   │ │  场景扩展    │            │
│  └─────────────┘ └─────────────┘            │
│                                             │
│  📊 分析                                      │
│  ┌─────────────┐ ┌─────────────┐            │
│  │  节奏分析   │ │  集长计算    │            │
│  └─────────────┘ └─────────────┘            │
│                                             │
└─────────────────────────────────────────────┘
```

### 技能执行弹窗

```
┌─────────────────────────────────────────────┐
│  ✨ 对白润色                         [×]    │
├─────────────────────────────────────────────┤
│                                             │
│  原文:                                       │
│  ┌─────────────────────────────────────┐    │
│  │ "你来了。"                          │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  润色中... [████████░░] 80%                 │
│                                             │
│  结果:                                       │
│  ┌─────────────────────────────────────┐    │
│  │ 版本1 (保守): "你终于来了。"        │    │
│  │ 版本2 (平衡): "你可算来了。"        │    │
│  │ 版本3 (大胆): "你倒是舍得来啊。"    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│        [使用版本1] [使用版本2] [使用版本3]   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📁 文件结构

```
lib/
├── skills/
│   ├── index.ts                 # 统一导出
│   ├── types.ts                 # 类型定义
│   ├── registry.ts              # 技能注册器
│   ├── executor.ts              # 技能执行器
│   ├── factory.ts               # 技能工厂
│   ├── context-builder.ts       # 上下文构建
│   └── skills/                  # 具体技能
│       ├── format-fix.ts
│       ├── dialogue-polish.ts
│       ├── scene-expand.ts
│       ├── rhythm-analyze.ts
│       ├── consistency-check.ts
│       └── duration-calc.ts

app/
├── api/
│   └── skills/
│       ├── route.ts             # GET /api/skills
│       └── execute/route.ts     # POST /api/skills/execute
└── editor/
    └── page.tsx                 # 集成技能面板

components/
├── skills/
│   ├── SkillPanel.tsx           # 技能面板
│   ├── SkillButton.tsx          # 技能按钮
│   ├── SkillExecutionDialog.tsx # 执行弹窗
│   └── SkillResultViewer.tsx    # 结果展示
```

---

## ✅ 验收标准

| 检查项 | 标准 |
|--------|------|
| 技能注册 | 可以动态注册新技能 |
| 手动触发 | 点击技能按钮正常执行 |
| 流式响应 | SSE 实时返回结果 |
| 格式修复 | 准确率 > 90% |
| 对白润色 | 提供3个版本选择 |
| 执行记录 | 完整记录到数据库 |
| 错误处理 | 优雅处理异常情况 |

---

## 🚀 开发顺序

1. **Day 1**: 类型定义 + 注册器 + 执行器框架
2. **Day 2**: 格式修复技能 + API
3. **Day 3**: 对白润色技能 + UI 组件
4. **Day 4**: 场景扩展 + 节奏分析技能
5. **Day 5**: 其他技能 + 集成测试

---

*设计完成: 2026-02-02*  
*等待八字系统完成后启动开发*
