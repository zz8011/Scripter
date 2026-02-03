# Phase 4: AI 对话系统 - 科学开发计划

> **计划版本**: v1.0  
> **制定日期**: 2026-02-02  
> **开发周期**: 3-4 周  
> **使用流程**: 科学开发工作流 v2.0

---

## 🎯 阶段 0: 准备 (Preparation)

### 项目记忆加载

**已加载上下文**:
- ✅ PRD v2.5 - AI 辅助系统功能定义
- ✅ 科学开发工作流 v2.0
- ✅ Phase 1-3 完成代码
- ✅ 数据库 Schema (user_bazi, user_behaviors)

### 本次会话目标

**目标**: 实现剧灵 AI 对话系统核心功能  
**范围**: 生辰八字 + 技能系统 + 对话 UI + 行为记录  
**预计时间**: 3-4 周  

---

## 📋 阶段 1: 计划 (Plan)

### 1.1 功能需求分析

根据 PRD v2.5，AI 对话系统包含：

| 模块 | 功能 | 优先级 | 依赖 |
|------|------|--------|------|
| **生辰八字** | 八字生成、五行性格、诗号 | P0 | 无 |
| **技能系统** | 格式修复、对白润色等 | P0 | 八字系统 |
| **对话 UI** | 侧边栏、流式响应 | P0 | 技能系统 |
| **行为记录** | 用户行为追踪 | P1 | 无 |
| **不打扰** | 智能建议时机 | P1 | 行为记录 |

### 1.2 技术方案

#### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                        剧灵 AI 系统                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   生辰八字   │───→│   性格引擎   │───→│   对话生成   │     │
│  │  BaziSystem │    │ Personality │    │  Response   │     │
│  └─────────────┘    └─────────────┘    └──────┬──────┘     │
│         │                                     │             │
│         ↓                                     ↓             │
│  ┌─────────────┐                       ┌─────────────┐     │
│  │   诗号生成   │                       │   技能系统   │     │
│  │   Shiho     │                       │   Skills    │     │
│  └─────────────┘                       └──────┬──────┘     │
│                                               │             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────┴─────┐       │
│  │  行为记录   │←───│  不打扰引擎  │←───│ 技能执行器 │       │
│  │  Behavior  │    │ NonIntrusive│    │  Executor │       │
│  └─────────────┘    └─────────────┘    └───────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 数据流

```
用户输入
    ↓
上下文收集 (项目 + 场景 + 历史对话)
    ↓
八字性格注入 (根据用户八字生成 system prompt)
    ↓
技能匹配 (判断是否需要执行技能)
    ↓
智谱 AI 调用
    ↓
流式响应 → UI 展示
    ↓
行为记录
```

### 1.3 数据库 Schema

**已存在** (Phase 1 创建):
- `user_bazi` - 八字配置
- `user_behaviors` - 行为记录

**需要补充**:
- `ai_conversations` - 对话记录
- `ai_messages` - 消息记录
- `skills_executions` - 技能执行记录

### 1.4 接口定义

#### 八字系统接口

```typescript
// lib/bazi/types.ts
interface BaziConfig {
  userId: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
}

interface BaziResult {
  bazi: string // "甲子年乙丑月丙寅日丁卯时"
  wuxing: '金' | '木' | '水' | '火' | '土'
  personality: PersonalityTraits
  shiho: string // 诗号
}

interface PersonalityTraits {
  tone: '温和' | '直接' | '幽默' | '严肃'
  style: '建议型' | '启发型' | '分析型'
  vocabulary: string[] // 常用词汇
  responsePattern: string // 回复模式模板
}
```

#### 技能系统接口

```typescript
// lib/skills/types.ts
interface Skill {
  id: string
  name: string
  description: string
  trigger: TriggerCondition
  execute: (context: ExecutionContext) => Promise<SkillResult>
}

interface TriggerCondition {
  type: 'manual' | 'auto' | 'keyword'
  keywords?: string[]
  contextCheck?: (ctx: ExecutionContext) => boolean
}

interface ExecutionContext {
  projectId?: string
  sceneId?: string
  content: string
  selection?: string
  conversationHistory: Message[]
}

interface SkillResult {
  success: boolean
  content: string
  metadata?: Record<string, unknown>
}
```

---

## 🚀 阶段 2: 执行 (Execute)

### 2.1 任务分解

#### Week 1: 生辰八字系统

| 任务 ID | 任务 | 工时 | 验收标准 |
|---------|------|------|---------|
| B1 | 八字计算算法 | 8h | 准确计算八字 |
| B2 | 五行性格映射 | 6h | 性格特征正确 |
| B3 | 诗号生成器 | 6h | 诗号有韵味 |
| B4 | 八字配置 API | 4h | CRUD 完整 |
| B5 | 八字配置 UI | 6h | 时间选择器 |

#### Week 2: 技能系统

| 任务 ID | 任务 | 工时 | 验收标准 |
|---------|------|------|---------|
| S1 | 技能注册系统 | 8h | 动态注册技能 |
| S2 | 格式修复技能 | 8h | 修复剧本格式 |
| S3 | 对白润色技能 | 8h | 润色效果自然 |
| S4 | 场景扩展技能 | 6h | 扩展合理 |
| S5 | 技能执行 API | 6h | 异步执行 |

#### Week 3: 对话系统

| 任务 ID | 任务 | 工时 | 验收标准 |
|---------|------|------|---------|
| C1 | 对话上下文管理 | 8h | 多轮对话支持 |
| C2 | System Prompt 生成 | 6h | 性格注入正确 |
| C3 | 流式响应 API | 8h | SSE 流式输出 |
| C4 | 侧边栏对话 UI | 10h | 界面美观流畅 |
| C5 | 技能触发集成 | 6h | 快捷触发技能 |

#### Week 4: 行为记录与不打扰

| 任务 ID | 任务 | 工时 | 验收标准 |
|---------|------|------|---------|
| R1 | 行为追踪器 | 8h | 全模块覆盖 |
| R2 | 专注度检测 | 6h | 准确判断 |
| R3 | 不打扰逻辑 | 6h | 合适时机建议 |
| R4 | 智能上下文压缩 | 6h | Token 优化 |
| R5 | 集成测试 | 8h | 全流程通过 |

### 2.2 开发顺序

```
Week 1: 生辰八字系统
  ├─ B1 八字算法
  ├─ B2 性格映射
  ├─ B3 诗号生成
  ├─ B4 API
  └─ B5 UI

Week 2: 技能系统
  ├─ S1 技能框架
  ├─ S2 格式修复
  ├─ S3 对白润色
  ├─ S4 场景扩展
  └─ S5 API

Week 3: 对话系统
  ├─ C1 上下文管理
  ├─ C2 System Prompt
  ├─ C3 流式 API
  ├─ C4 对话 UI
  └─ C5 技能集成

Week 4: 行为与不打扰
  ├─ R1 行为追踪
  ├─ R2 专注度检测
  ├─ R3 不打扰逻辑
  ├─ R4 上下文压缩
  └─ R5 集成测试
```

---

## 🧪 阶段 3: 验证 (Verify)

### 3.1 单元测试

| 模块 | 测试项 | 覆盖率 |
|------|--------|--------|
| 八字系统 | 八字计算、性格映射 | >80% |
| 技能系统 | 技能注册、执行 | >80% |
| 对话系统 | 上下文管理、流式响应 | >70% |

### 3.2 集成测试

| 场景 | 测试内容 |
|------|---------|
| 八字生成 | 输入出生时间 → 正确八字 |
| 性格注入 | 不同八字 → 不同回复风格 |
| 技能执行 | 触发技能 → 正确执行 |
| 对话流 | 多轮对话 → 上下文保持 |
| 不打扰 | 专注写作 → 不弹出建议 |

### 3.3 验收标准

根据 PRD v2.5:

- [ ] 八字计算准确率 > 95%
- [ ] 五行性格映射合理
- [ ] 诗号生成有文学性
- [ ] 技能执行成功率 > 90%
- [ ] 对话响应时间 < 3s
- [ ] 流式响应流畅无卡顿
- [ ] 不打扰触发准确
- [ ] 行为记录完整

---

## 🔍 阶段 4: 改进 (Code Review)

### 4.1 代码审查清单

- [ ] TypeScript 类型完整
- [ ] 错误处理完善
- [ ] 性能优化 (避免重复计算)
- [ ] 安全 (SQL 注入、XSS)
- [ ] 日志记录
- [ ] 文档注释

### 4.2 性能优化

- 八字计算结果缓存
- 对话上下文 LRU 缓存
- 智谱 API 调用限流

---

## 📊 执行计划

### 启动命令

```bash
# Week 1: 生辰八字
/plan 实现剧灵生辰八字系统 (B1-B5)
/tdd 实现八字计算算法

# Week 2: 技能系统
/plan 实现原子化技能系统 (S1-S5)
/tdd 实现技能注册和执行框架

# Week 3: 对话系统
/plan 实现对话系统和 UI (C1-C5)
/tdd 实现流式对话 API

# Week 4: 行为与不打扰
/plan 实现行为记录和不打扰原则 (R1-R5)
/tdd 实现行为追踪器
```

### Codex 开发指令

```bash
# 使用 Codex 开发生辰八字系统
codex exec "实现剧灵生辰八字系统，包括：
1. 八字计算算法 (lib/bazi/calculator.ts)
2. 五行性格映射 (lib/bazi/personality.ts)
3. 诗号生成器 (lib/bazi/shiho.ts)
4. 八字配置 API (app/api/bazi/route.ts)
5. 八字配置 UI (app/juling/bazi/page.tsx)

要求：
- 使用 lunar-javascript 计算八字
- 五行决定 AI 说话风格
- 诗号根据八字生成
- 完整的类型定义
- 错误处理完善"

# 使用 Codex 开发技能系统
codex exec "实现剧灵技能系统，包括：
1. 技能注册框架 (lib/skills/registry.ts)
2. 技能执行引擎 (lib/skills/executor.ts)
3. 格式修复技能 (lib/skills/format-fix.ts)
4. 对白润色技能 (lib/skills/dialogue-polish.ts)
5. 场景扩展技能 (lib/skills/scene-expand.ts)
6. 技能 API (app/api/skills/route.ts)

要求：
- 技能可动态注册
- 支持手动和自动触发
- 异步执行，流式返回
- 完整的类型定义"
```

---

## 📈 进度追踪

### 每日检查清单

**Week 1**:
- [ ] Day 1: B1 八字算法
- [ ] Day 2: B2 性格映射
- [ ] Day 3: B3 诗号生成
- [ ] Day 4: B4 API
- [ ] Day 5: B5 UI

**Week 2**:
- [ ] Day 1: S1 技能框架
- [ ] Day 2: S2 格式修复
- [ ] Day 3: S3 对白润色
- [ ] Day 4: S4 场景扩展
- [ ] Day 5: S5 API

**Week 3**:
- [ ] Day 1: C1 上下文
- [ ] Day 2: C2 System Prompt
- [ ] Day 3: C3 流式 API
- [ ] Day 4: C4 对话 UI
- [ ] Day 5: C5 技能集成

**Week 4**:
- [ ] Day 1: R1 行为追踪
- [ ] Day 2: R2 专注度
- [ ] Day 3: R3 不打扰
- [ ] Day 4: R4 上下文压缩
- [ ] Day 5: R5 集成测试

---

## ⚠️ 风险管理

| 风险 | 可能性 | 影响 | 应对 |
|------|--------|------|------|
| 八字算法复杂 | 中 | 高 | 使用 lunar-javascript 库 |
| 智谱 API 延迟 | 中 | 中 | 添加缓存和降级 |
| 技能效果不佳 | 中 | 高 | 提示词工程优化 |
| 上下文过长 | 高 | 中 | 智能压缩算法 |

---

## 🎯 成功指标

- 八字计算准确率 > 95%
- 技能执行成功率 > 90%
- 对话响应时间 < 3s
- 用户满意度 > 80%

---

*计划制定: 2026-02-02*  
*遵循: 科学开发工作流 v2.0*
