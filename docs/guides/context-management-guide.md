# Scripter 上下文管理系统指南

> **版本**: 1.0
> **更新日期**: 2026-01-25
> **适用范围**: 所有 Scripter 项目开发

---

## 📋 目录

1. [系统概述](#系统概述)
2. [Hook 工作原理](#hook-工作原理)
3. [使用指南](#使用指南)
4. [最佳实践](#最佳实践)
5. [故障排查](#故障排查)
6. [API 参考](#api-参考)

---

## 系统概述

Scripter 上下文管理系统是一套完整的解决方案，用于解决 Claude Code 长期记忆限制问题，实现智能化的上下文管理和持久化。

### 核心功能

| 功能 | 描述 | 效果 |
|------|------|------|
| **智能记忆加载** | 会话开始时自动分层加载项目记忆 | 减少重复解释 60-70% |
| **上下文注入** | 根据任务智能匹配相关文档 | Token 使用效率提升 30-40% |
| **阶段追踪** | 自动检测会话阶段（探索/规划/实施/测试） | 智能压缩建议 |
| **决策记录** | 自动识别并记录技术决策 | 完整的决策历史 |
| **会话总结** | 自动生成结构化 Markdown 报告 | 信息不丢失 |

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    上下文管理系统                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ SessionStart│  │   PreToolUse│  │  SessionEnd │        │
│  │   Hooks     │  │    Hooks    │  │   Hooks     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│  ┌──────────────────────────────────────────────────┐     │
│  │              数据存储层                           │     │
│  │  • memory.json      • session-state.json         │     │
│  │  • decisions.json   • shared-context.json        │     │
│  └──────────────────────────────────────────────────┘     │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────────────────────────────────────────┐     │
│  │              报告生成层                           │     │
│  │  • 会话报告      • 决策记录                       │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Hook 工作原理

### SessionStart Hooks

会话开始时自动执行以下操作：

```bash
node .claude/hooks/project-context.js       # 1. 检查项目配置
node .claude/hooks/memory-loader.js         # 2. 加载项目记忆
node .claude/hooks/context-injector.js      # 3. 注入相关上下文
node .claude/hooks/phase-tracker.js         # 4. 追踪会话阶段
```

#### project-context.js

检查项目级配置文件的存在性：
- `CLAUDE.md` - 项目开发规范
- `docs/prd/prd-v2.5.md` - 产品需求文档

#### memory-loader.js

智能加载项目记忆，根据会话类型分层加载：

```javascript
// 会话类型检测
const SESSION_TYPES = {
  feature_dev: '功能开发',
  bug_fix: 'Bug 修复',
  ui_dev: 'UI 开发',
  review: '代码审查',
  planning: '规划',
  testing: '测试',
  deployment: '部署'
};

// 分层加载
L1: 核心项目配置（CLAUDE.md, PRD, 技术栈）
L2: 当前 Sprint/任务状态
L3: 根据会话类型加载相关内容
L4: 最近的会话总结
```

#### context-injector.js

根据关键词智能匹配相关文档：

```javascript
// 关键词映射
{
  'prd': 'docs/prd/prd-v2.5.md',
  '数据模型': 'docs/tech/data-model.md',
  '设计系统': 'docs/design/ui-design-system.md',
  // ...
}

// Token 估算和优先级排序
// 自动控制在 30000 tokens 以内
```

#### phase-tracker.js

追踪会话所处阶段，检测阶段转换：

```javascript
// 阶段定义
PHASES = {
  exploration: '探索阶段',
  planning: '规划阶段',
  implementation: '实施阶段',
  testing: '测试阶段',
  debugging: '调试阶段',
  review: '审查阶段'
}
```

### PreToolUse Hooks

每次 Edit/Write 操作前执行：

```bash
node .claude/hooks/strategic-compact-v2.js    # 1. 智能压缩提示
node .claude/hooks/decision-logger.js         # 2. 记录技术决策
```

#### strategic-compact-v2.js

基于逻辑断点和阶段检测，在合适的时机提示压缩：

```javascript
// 逻辑断点检测
- 阶段变化
- 任务完成
- 里程碑达成

// 阶段压缩建议
exploration: ✅ 可压缩，保留关键发现
planning: ✅ 强烈建议压缩，保留最终计划
implementation: ⚠️ 建议等里程碑完成后再压缩
testing: ❌ 不建议压缩，保持测试上下文
debugging: ❌ 强烈建议不要压缩
```

#### decision-logger.js

自动识别技术决策并记录：

```javascript
// 决策关键词
'选择', '采用', '决定', '使用', 'prefer', 'choose', ...

// 决策模式匹配
/选择\s+(.+?)\s+(?:来|而不是)/
/决定\s+使用\s+(.+?)\s+(?:因为)/
// ...

// 输出文件
.claude/decisions.json      # JSON 格式
docs/tech/decisions.md      # Markdown 格式
```

### SessionEnd Hooks

会话结束时自动执行：

```bash
node .claude/hooks/session-summary-enhanced.js  # 1. 生成会话报告
node .claude/hooks/memory-persistence.js        # 2. 保存记忆
```

#### session-summary-enhanced.js

生成结构化的 Markdown 报告：

```markdown
# 会话总结 - YYYY-MM-DD HH:MM:SS

> 会话 ID、项目、类型、时长、工具调用、文件修改

## 📋 执行摘要
## 🎯 完成任务
## 🔑 关键决策
## 📝 技术笔记
## 📌 下一步
## 📊 会话元数据
```

---

## 使用指南

### CLI 工具

#### context-manager

管理项目上下文状态、快照和清理。

```bash
# 查看当前状态
node scripts/context-manager.js status

# 保存快照
node scripts/context-manager.js snapshot

# 清理旧上下文
node scripts/context-manager.js cleanup

# 生成上下文报告
node scripts/context-manager.js report
```

#### sync-parallel-context

并行开发时维护多个 Agent 之间的共享上下文。

```bash
# 初始化并行开发上下文
node scripts/sync-parallel-context.js init [agent-count]

# 更新 Agent 进度
node scripts/sync-parallel-context.js update <agent-id> <task> <status> [files]

# 检查冲突
node scripts/sync-parallel-context.js check

# 生成合并计划
node scripts/sync-parallel-context.js merge-plan

# 查看状态
node scripts/sync-parallel-context.js status
```

### 手动操作

#### 查看项目记忆

```bash
cat .claude/memory.json
```

#### 查看会话状态

```bash
cat .claude/session-state.json
```

#### 查看决策记录

```bash
cat .claude/decisions.json
cat docs/tech/decisions.md
```

#### 查看会话报告

```bash
ls docs/reports/sessions/
```

---

## 最佳实践

### 1. 新会话启动流程

```bash
# 1. 查看项目状态
node scripts/context-manager.js status

# 2. 根据提示加载相关文档
# Hook 会自动建议需要阅读的文件

# 3. 明确本次会话目标
# 使用 TodoWrite 创建任务清单

# 4. 开始工作
```

### 2. 压缩时机选择

**好的压缩时机：**
- ✅ 探索阶段完成后
- ✅ 规划阶段完成后
- ✅ 任务里程碑完成后
- ✅ 代码审查完成后

**不好的压缩时机：**
- ❌ 调试错误时
- ❌ 测试失败时
- ❌ 实施进行中
- ❌ 多文件修改中途

### 3. 并行开发工作流

```bash
# 1. 初始化并行上下文
node scripts/sync-parallel-context.js init 3

# 2. 分配任务给各 Agent
# Agent 1: 前端组件
# Agent 2: 后端 API
# Agent 3: 数据库

# 3. 定期更新进度
node scripts/sync-parallel-context.js update agent-1 "实现登录页面" in_progress "page.tsx,form.tsx"

# 4. 检查冲突
node scripts/sync-parallel-context.js check

# 5. 所有 Agent 完成后生成合并计划
node scripts/sync-parallel-context.js merge-plan
```

### 4. 记忆维护

定期清理和更新项目记忆：

```bash
# 每周清理旧快照和报告
node scripts/context-manager.js cleanup

# 重大决策后更新记忆
# 编辑 .claude/memory.json

# Sprint 结束后保存快照
node scripts/context-manager.js snapshot
```

---

## 故障排查

### 问题：Hook 未执行

**症状**: 会话开始/结束时没有看到 Hook 输出

**解决方案**:
1. 检查 `.claude/settings.local.json` 配置
2. 确认 Hook 文件存在且可执行
3. 检查 Node.js 是否可用

### 问题：记忆未加载

**症状**: 新会话需要重新解释项目背景

**解决方案**:
1. 检查 `.claude/memory.json` 是否存在
2. 验证 JSON 格式是否正确
3. 确认 memory-loader.js 在 SessionStart 中配置

### 问题：决策未记录

**症状**: 技术决策没有出现在 decisions.md 中

**解决方案**:
1. 确认 decision-logger.js 在 PreToolUse 中配置
2. 检查关键词是否匹配
3. 验证 docs/tech/ 目录存在

### 问题：会话报告未生成

**症状**: docs/reports/sessions/ 目录为空

**解决方案**:
1. 确认 session-summary-enhanced.js 在 SessionEnd 中配置
2. 检查 reports 目录权限
3. 查看 Hook 执行错误信息

---

## API 参考

### 环境变量

| 变量名 | 用途 | 示例 |
|--------|------|------|
| `USER_PROMPT` | 用户输入提示 | "实现用户登录功能" |
| `SESSION_TYPE` | 会话类型 | "feature_dev" |
| `TOOL_NAME` | 工具名称 | "Edit" |
| `FILE_PATH` | 文件路径 | "src/app/page.tsx" |
| `COMPACT_THRESHOLD` | 压缩阈值 | "50" |

### 数据文件

#### memory.json

```json
{
  "project_state": {
    "current_sprint": "Sprint 1-2",
    "phase": "初始化阶段",
    "last_updated": "2026-01-25T10:00:00Z"
  },
  "decisions": [
    {
      "id": "decision-001",
      "title": "选择 Drizzle ORM",
      "date": "2026-01-24",
      "reason": "性能更优，包体积小"
    }
  ],
  "recent_work": [],
  "blockers": [],
  "next_steps": []
}
```

#### session-state.json

```json
{
  "last_updated": "2026-01-25T10:00:00Z",
  "last_session_id": "abc123",
  "last_session_type": "feature_dev",
  "current_phase": "implementation",
  "phase_updated_at": "2026-01-25T10:00:00Z"
}
```

#### decisions.json

```json
{
  "last_updated": "2026-01-25T10:00:00Z",
  "total_count": 5,
  "decisions": [
    {
      "id": "decision-001",
      "timestamp": "2026-01-25T10:00:00Z",
      "title": "选择 Drizzle ORM",
      "confidence": "high",
      "context": {
        "file": "src/db/index.ts",
        "operation": "Write"
      }
    }
  ]
}
```

---

**文档维护**: 本文档应与上下文管理系统同步更新
**反馈渠道**: 如有问题请在项目 Issues 中提出
