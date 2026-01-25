# Scripter 并行开发完整指南

> 充分利用 Claude Code 的并行能力，大幅提升开发效率

---

## 📊 并行开发概览

### 为什么需要并行开发？

```
传统串行开发：
Agent A (2小时) → Agent B (2小时) → Agent C (2小时) = 6小时

并行开发：
Agent A (2小时) ──┐
                 ├──→ 2小时 (同时进行)
Agent B (2小时) ──┤
                 │
Agent C (2小时) ──┘

效率提升: 3倍
```

### 适用场景

| 场景 | 串行时间 | 并行时间 | 提升 |
|------|---------|---------|------|
| 3个独立功能 | 6h | 2h | 3x |
| 前后端分离 | 4h | 2h | 2x |
| 多模块测试 | 3h | 1h | 3x |
| 文档+代码 | 2h | 1h | 2x |

---

## 🎯 并行开发的三种方式

### 方式一：Task 工具并行 Agent（推荐）

**适用场景**：独立任务、功能模块开发

#### 基础用法
```javascript
// 在 Claude Code 中同时启动多个 Agent
[
  Task({
    subagent_type: "general-purpose",
    prompt: "实现用户登录功能...",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "实现用户注册功能...",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "实现密码重置功能...",
    run_in_background: true
  })
]
```

#### 获取结果
```javascript
// 使用 TaskOutput 获取各 Agent 的结果
TaskOutput({ task_id: "agent-1-id" })
TaskOutput({ task_id: "agent-2-id" })
TaskOutput({ task_id: "agent-3-id" })
```

#### 优势
- ✅ 最简单：无需额外配置
- ✅ 快速启动：一条命令完成
- ✅ 实时监控：可随时查看进度

---

### 方式二：Git Worktree 多目录

**适用场景**：大型重构、多个独立功能

#### 设置步骤

1. **创建 Worktree**
```bash
# 使用自动化脚本
bash scripts/parallel-dev-setup.sh auth-system

# 或手动创建
git worktree add ../scripter-auth feature/auth-login
git worktree add ../scripter-perm feature/auth-perm
git worktree add ../scripter-log feature/auth-log
```

2. **启动多个 Claude Code**
```bash
# 终端 1
cd ../scripter-auth && claude-code

# 终端 2
cd ../scripter-perm && claude-code

# 终端 3
cd ../scripter-log && claude-code
```

3. **分配任务**
```javascript
// 终端 1
"实现登录功能"

// 终端 2
"实现权限管理"

// 终端 3
"实现日志记录"
```

4. **合并结果**
```bash
# 返回主项目
git checkout main

# 合并各功能
git merge feature/auth-login
git merge feature/auth-perm
git merge feature/auth-log
```

#### 清理
```bash
# 使用自动化脚本
bash scripts/parallel-dev-cleanup.sh --all

# 或手动清理
git worktree remove ../scripter-auth
git worktree remove ../scripter-perm
git worktree remove ../scripter-log
git branch -D feature/auth-login
git branch -D feature/auth-perm
git branch -D feature/auth-log
```

#### 优势
- ✅ 完全隔离：各 Agent 互不干扰
- ✅ 独立测试：每个 Worktree 可独立运行
- ✅ 灵活合并：选择性合并功能

---

### 方式三：子 Agent 驱动开发

**适用场景**：复杂项目、需要详细规划

#### 配置 Subagent

1. **创建专用 Agent**
```markdown
<!-- .claude/agents/ui-dev-agent.md -->
---
name: ui-dev-agent
description: 前端 UI 开发专家
color: 3B82F6
---

你专门负责前端 UI 组件开发...
```

2. **使用 Agent**
```javascript
Task({
  subagent_type: "ui-dev-agent",
  prompt: "实现用户设置页面的 UI..."
})
```

#### 使用 superpowers 技能

```javascript
// 使用内置技能
Skill({ skill: "superpowers:subagent-driven-development" })

// 自动启动多个子 Agent
```

#### 优势
- ✅ 专业化：每个 Agent 专注特定领域
- ✅ 可复用：Agent 配置可重复使用
- ✅ 质量保证：遵循统一规范

---

## 🛠️ 实用工具和脚本

### 快速设置脚本

```bash
# 创建 3 个并行 Worktree
bash scripts/parallel-dev-setup.sh feature-name

# 创建 5 个并行 Worktree，自定义前缀
bash scripts/parallel-dev-setup.sh -n 5 -p feature refactor

# 指定基础分支
bash scripts/parallel-dev-setup.sh -b develop new-feature
```

### 清理脚本

```bash
# 清理所有 Worktree
bash scripts/parallel-dev-cleanup.sh --all

# 清理特定前缀的 Worktree
bash scripts/parallel-dev-cleanup.sh -p scripter-task

# 模拟运行，查看将要删除什么
bash scripts/parallel-dev-cleanup.sh --all --dry-run

# 保留分支，只删除 Worktree
bash scripts/parallel-dev-cleanup.sh --all --keep-branches
```

### Windows 支持

```powershell
# PowerShell 版本（如果需要）
# scripts/parallel-dev-setup.ps1
# scripts/parallel-dev-cleanup.ps1
```

---

## 📋 并行任务规划模板

使用模板规划并行任务：`.claude/templates/parallel-task-planner.md`

```markdown
## 任务分析

### 主任务
实现剧灵的 AI 创作伙伴系统

### 子任务拆分
| ID | 任务 | 依赖 | 独立性 |
|----|------|------|--------|
| 1 | 八字生成算法 | 无 | 高 |
| 2 | 性格映射系统 | 任务 1 | 中 |
| 3 | 诗号生成器 | 任务 1 | 中 |
| 4 | 对话模式 | 任务 2 | 中 |
| 5 | 行为记录 | 无 | 高 |

### 依赖关系
```
任务 1 (八字) ──┬──► 任务 2 (性格)
                ├──► 任务 3 (诗号)
                └──► 任务 4 (对话)

任务 5 (行为记录) ──► 任务 6 (上下文注入)
```

### Agent 分配
| Agent | 任务 | Worktree |
|-------|------|----------|
| Agent-1 | 任务 1 | ../scripter-bazi |
| Agent-2 | 任务 2 | ../scripter-personality |
| Agent-3 | 任务 3 | ../scripter-poem |
```

---

## 🎓 最佳实践

### 1. 任务拆分原则

```
✅ 好的拆分：
- 功能独立（模块 A、模块 B）
- 层级分离（前端、后端、测试）
- 数据隔离（用户数据、订单数据）

❌ 不好的拆分：
- 循环依赖（A 依赖 B，B 依赖 A）
- 共享状态（都在修改同一个文件）
- 紧密耦合（需要频繁通信）
```

### 2. 接口预定义

```typescript
// 预先定义接口，避免冲突
interface AuthModule {
  login(credentials: LoginCredentials): Promise<User>;
  register(data: RegisterData): Promise<User>;
  logout(): Promise<void>;
}

interface PermissionModule {
  check(user: User, resource: string): Promise<boolean>;
  grant(user: User, permission: string): Promise<void>;
}
```

### 3. 定期同步

```
时间线：
00:00 - 启动所有 Agent
00:30 - 第一次同步检查
01:00 - 第二次同步检查
01:30 - 合并阶段
02:00 - 完成
```

### 4. 冲突解决

```
文件级冲突：
├─ 使用 git merge 工具
├─ 预先分配文件
└─ 统一代码风格

逻辑级冲突：
├─ 分析冲突原因
├─ 调整任务边界
└─ 重新定义接口

依赖级冲突：
├─ 调整执行顺序
├─ 使用共享库
└─ 统一 package.json
```

---

## 🚀 实战示例

### 示例 1：快速并行开发（Task 工具）

```javascript
// 场景：同时开发 3 个独立功能

// 一步启动 3 个 Agent
[
  Task({
    subagent_type: "general-purpose",
    prompt: "实现剧本编辑器的格式检查功能",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "实现人物管理的关系图可视化",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "实现场景看板的拖拽排序",
    run_in_background: true
  })
]

// 等待完成后获取结果
// 使用 /tasks 命令查看各 Agent 状态
```

### 示例 2：大型重构（Git Worktree）

```bash
# 场景：重构整个前端架构

# 1. 创建 Worktree
bash scripts/parallel-dev-setup.sh -n 4 frontend-refactor

# 2. 分配任务
# 终端 1: cd ../scripter-task-1 && claude-code
# 任务: "重构组件目录结构"

# 终端 2: cd ../scripter-task-2 && claude-code
# 任务: "重构状态管理系统"

# 终端 3: cd ../scripter-task-3 && claude-code
# 任务: "重构 API 调用层"

# 终端 4: cd ../scripter-task-4 && claude-code
# 任务: "更新测试用例"

# 3. 逐个合并
git checkout main
git merge feature/frontend-refactor-task-1
# 测试通过后继续
git merge feature/frontend-refactor-task-2
# ...

# 4. 清理
bash scripts/parallel-dev-cleanup.sh -p scripter-task
```

### 示例 3：专业化 Agent

```javascript
// 场景：使用专业 Agent 完成不同类型任务

// 前端开发
Task({
  subagent_type: "ui-dev-agent",
  prompt: "实现剧本编辑器 UI，符合设计系统规范"
})

// 后端开发
Task({
  subagent_type: "api-dev-agent",
  prompt: "实现用户认证 API，使用 JWT"
})

// 测试
Task({
  subagent_type: "test-agent",
  prompt: "编写认证模块的集成测试"
})

// 文档
Task({
  subagent_type: "doc-agent",
  prompt: "编写 API 文档，包含示例"
})
```

---

## 📊 性能对比

### 实测数据

| 项目类型 | 串行开发 | 并行开发 | 提升 |
|---------|---------|---------|------|
| 小功能 (3个模块) | 3h | 1h | 3x |
| 中型功能 (5个模块) | 8h | 2.5h | 3.2x |
| 大型重构 (4个部分) | 16h | 5h | 3.2x |
| 全栈开发 (前后端) | 6h | 3h | 2x |

### 注意事项

```
并行开发的效率提升取决于：
- 任务独立性（越高越好）
- 任务粒度（适中最佳）
- 团队规模（Agent 数量）
- 合并复杂度（越低越好）
```

---

## 🔧 故障排除

### 问题 1：Agent 冲突

**症状**：多个 Agent 修改同一个文件

**解决方案**：
```bash
# 1. 预先分配文件
# Agent-1: src/auth/*
# Agent-2: src/user/*

# 2. 使用 Git Worktree 隔离
git worktree add ../scripter-auth feature/auth
git worktree add ../scripter-user feature/user

# 3. 定义清晰的接口
# 预先约定 API 契约
```

### 问题 2：合并冲突

**症状**：git merge 时出现冲突

**解决方案**：
```bash
# 1. 逐个合并，及时解决
git checkout main
git merge feature/task-1
# 解决冲突后继续
git merge feature/task-2

# 2. 使用合并工具
git mergetool

# 3. 如无法解决，回滚
git merge --abort
```

### 问题 3：上下文丢失

**症状**：Agent 忘记之前的上下文

**解决方案**：
```javascript
// 1. 明确指定上下文文件
Task({
  subagent_type: "general-purpose",
  prompt: "阅读 docs/prd/v2.4.md 了解需求，然后实现功能..."
})

// 2. 使用记忆持久化
// 会话开始时：阅读 .claude/memory.json

// 3. 定期总结
"将当前进度记录到 docs/progress.md"
```

---

## 📚 延伸阅读

- [Claude Code 最佳实践](https://www.anthropic.com/engineering/claude-code-best-practices)
- [使用 Git Worktree 并行开发](https://medium.com/@lorenzozar/use-git-worktree-to-run-multiple-claude-code-agents-a1d47ef972d5)
- [并行 AI 编码实战](https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/)
- [Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

---

**最后更新**: 2026-01-24
**维护者**: Scripter 项目组
