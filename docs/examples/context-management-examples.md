# 上下文管理系统使用示例

> **版本**: 1.0
> **更新日期**: 2026-01-25

---

## 📋 目录

1. [新会话启动](#新会话启动)
2. [并行开发](#并行开发)
3. [上下文恢复](#上下文恢复)
4. [日常维护](#日常维护)

---

## 新会话启动

### 示例 1: 功能开发会话

**场景**: 开始开发用户认证功能

#### 会话开始时

```
========================================
📋 Scripter 项目配置检查
========================================

✅ 项目级 CLAUDE.md 存在 (更新于: 2026-01-24)
⚠️  重要: 请在会话开始时优先阅读此文件

✅ PRD v2.5 存在 (更新于: 2026-01-24)
========================================

========================================
🧠 记忆加载器
========================================

[MemoryLoader] ✅ 已加载项目记忆 (5 项)

[MemoryLoader] 📚 会话类型: feature_dev
[MemoryLoader] 📋 分层加载上下文:

📦 上下文加载建议:

🔴 L1: 核心项目配置
   项目规范、PRD、技术栈
   文件:
     - CLAUDE.md (9KB)
     - docs/prd/prd-v2.5.md (17KB)
     - docs/tech/tech-stack.md (12KB)

🟠 L2: 当前 Sprint/任务状态
   项目当前状态、最近工作、阻塞问题
   数据: { "current_sprint": "Sprint 1-2: 基础架构搭建", ... }

🟡 L3: 功能开发相关
   数据模型、设计系统、待办事项
   文件:
     - docs/tech/data-model.md (8KB)
     - docs/design/ui-design-system.md (15KB)

📊 预估 Token 使用: 29000 tokens

💡 建议: 优先阅读 PRD 相关章节，然后查看数据模型
========================================

========================================
📄 上下文注入建议
========================================

📊 匹配到 3 个文档，建议注入 3 个

✅ 建议注入的文档:

🔴 docs/prd/prd-v2.5.md
   原因: 关键词匹配: "功能"
   预估: ~12750 tokens

🔴 docs/tech/data-model.md
   原因: 关键词匹配: "开发"
   预估: ~6000 tokens

🟠 docs/tech/tech-stack.md
   原因: 会话类型默认文档 (feature_dev)
   预估: ~9000 tokens

📊 总计: ~27750 tokens
========================================

========================================
🔍 当前阶段: 探索阶段
========================================

💡 压缩建议: 是压缩的好时机，已收集足够信息

📌 建议:
   - 已收集足够信息后，使用 /plan 进入规划
   - 压缩时可保留探索发现的关键信息
========================================
```

#### 用户操作

```bash
# 1. 阅读建议的文档
Read("docs/prd/prd-v2.5.md")
Read("docs/tech/data-model.md")

# 2. 创建任务清单
TodoWrite([
  { content: "设计用户认证流程", status: "pending" },
  { content: "实现登录 API", status: "pending" },
  { content: "创建登录页面", status: "pending" }
])
```

---

### 示例 2: Bug 修复会话

**场景**: 修复登录页面的样式问题

#### 会话开始时

```
========================================
🧠 记忆加载器
========================================

[MemoryLoader] 📚 会话类型: bug_fix
[MemoryLoader] 📋 分层加载上下文:

📦 上下文加载建议:

🔴 L1: 核心项目配置
🟠 L2: 当前 Sprint/任务状态
   数据: {
     "blockers": ["登录页面样式错乱"],
     "recent_work": ["实现登录页面", "集成认证 API"]
   }

🟡 L3: 问题修复相关
   数据: 最近工作记录、已知问题
========================================

========================================
🐛 当前阶段: 调试阶段
========================================

💡 压缩建议: 不建议压缩，保持错误信息上下文

📌 建议:
   - 保持错误堆栈和相关信息
   - 问题解决前不要压缩
========================================
```

#### 用户操作

```bash
# 1. 查看最近工作记录
cat .claude/memory.json | grep recent_work

# 2. 读取问题报告
Read("docs/reports/analysis/login-style-issue.md")

# 3. 开始调试
```

---

## 并行开发

### 示例 1: 用户认证功能并行开发

**场景**: 3 个 Agent 同时开发认证功能的不同部分

#### 步骤 1: 初始化

```bash
$ node scripts/sync-parallel-context.js init 3

========================================
🚀 初始化并行开发上下文
========================================

✅ 共享上下文已创建: .claude/shared-context.json

📋 配置了 3 个 Agent

💡 下一步:
   1. 为每个 Agent 分配任务
   2. 使用 update 命令更新进度
========================================
```

#### 步骤 2: 分配任务

```bash
# Agent 1: 前端
$ node scripts/sync-parallel-context.js update agent-1 "实现登录页面" in_progress "" "page.tsx,form.tsx"

✅ Agent agent-1 已更新
   任务: 实现登录页面
   状态: in_progress
   文件: 2 个

# Agent 2: 后端
$ node scripts/sync-parallel-context.js update agent-2 "实现认证 API" in_progress "" "route.ts,auth.ts"

✅ Agent agent-2 已更新
   任务: 实现认证 API
   状态: in_progress
   文件: 2 个

# Agent 3: 数据库
$ node scripts/sync-parallel-context.js update agent-3 "创建用户 schema" completed "" "users.ts"

✅ Agent agent-3 已更新
   任务: 创建用户 schema
   状态: completed
   文件: 1 个
```

#### 步骤 3: 检查状态

```bash
$ node scripts/sync-parallel-context.js status

========================================
📊 并行开发状态
========================================

📅 创建时间: 2026/1/25 16:15:00
🔄 更新时间: 2026/1/25 16:20:00
👥 Agent 数量: 3

📋 Agent 状态:

🔄 agent-1
   任务: 实现登录页面
   状态: in_progress
   分支: feature/login-page
   文件: 2 个
   同步: 16:18:00

🔄 agent-2
   任务: 实现认证 API
   状态: in_progress
   分支: feature/login-api
   文件: 2 个
   同步: 16:19:00

✅ agent-3
   任务: 创建用户 schema
   状态: completed
   分支: feature/user-schema
   文件: 1 个
   同步: 16:15:00

========================================
```

#### 步骤 4: 检查冲突

```bash
$ node scripts/sync-parallel-context.js check

========================================
🔍 检查冲突
========================================

✅ 未检测到冲突
========================================
```

#### 步骤 5: 生成合并计划

```bash
$ node scripts/sync-parallel-context.js merge-plan

========================================
📋 生成合并计划
========================================

⚠️  2 个 Agent 尚未完成:
   - agent-1: in_progress
   - agent-2: in_progress

✅ 合并计划:

1. 检查冲突
   node scripts/sync-parallel-context.js check

2. 合并分支
   git merge feature/login-page
   git merge feature/login-api
   git merge feature/user-schema

3. 清理临时分支
   git branch -d feature/login-page
   git branch -d feature/login-api
   git branch -d feature/user-schema

========================================
```

---

## 上下文恢复

### 示例 1: 从中断的会话恢复

**场景**: 昨天的会话因意外中断，今天继续

#### 会话开始时

```
========================================
🧠 记忆加载器
========================================

[MemoryLoader] ✅ 已加载项目记忆 (5 项)
[MemoryLoader] ✅ 上次会话: 2026-01-24 18:30:15 (16小时前)

[MemoryLoader] 📚 会话类型: general
[MemoryLoader] 📋 分层加载上下文:

🟢 L4: 最近会话总结
   数据: {
     "latest_session_summary": "实现了用户登录页面的基础结构和样式",
     "latest_session_date": "2026-01-24"
   }

📦 上下文加载建议:
   ...
========================================
```

#### 查看上次会话报告

```bash
$ ls docs/reports/sessions/ | tail -1
2026-01-24-session-abc123.md

$ cat docs/reports/sessions/2026-01-24-session-abc123.md

# 会话总结 - 2026-01-24 18:30:15

## 📋 执行摘要
本次会话完成了用户登录页面的基础实现。

## 🎯 完成任务
- [x] 创建登录页面结构
- [x] 实现表单验证
- [x] 添加基础样式

## 🔑 关键决策
1. 选择 shadcn/ui Form 组件
   理由: 与项目设计系统一致

## 📌 下一步
- [ ] 集成认证 API
- [ ] 添加错误处理
- [ ] 实现记住密码功能
```

#### 继续工作

```bash
# 1. 更新任务清单
TodoWrite([
  { content: "集成认证 API", status: "in_progress" },
  { content: "添加错误处理", status: "pending" },
  { content: "实现记住密码功能", status: "pending" }
])

# 2. 继续开发
```

---

## 日常维护

### 示例 1: 每周上下文清理

**场景**: 每周五清理旧的上下文数据

```bash
# 1. 查看当前状态
$ node scripts/context-manager.js status

========================================
📊 上下文状态
========================================

✅ 项目记忆
   记忆项: 8
   Sprint: Sprint 1-2: 基础架构搭建
   最近工作: 6 项
   决策: 3 条

✅ 会话报告: 15 个

📸 快照: 2 个
========================================

# 2. 保存快照
$ node scripts/context-manager.js snapshot

========================================
📸 保存快照
========================================

✅ memory.json
✅ session-state.json
✅ decisions.json
✅ phase-log.json

📁 快照已保存到: .claude/snapshots/2026-01-25T...
📊 共复制 4 个文件
========================================

# 3. 清理旧数据
$ node scripts/context-manager.js cleanup

========================================
🧹 清理旧上下文
========================================

✅ 清理临时文件: 5 个
✅ 清理旧报告: 3 个

📊 共清理 8 项
========================================
```

### 示例 2: Sprint 结束时归档

**场景**: Sprint 1-2 结束，归档所有数据

```bash
# 1. 生成完整报告
$ node scripts/context-manager.js report

========================================
📊 上下文使用报告
========================================

📁 文件大小:
   项目记忆: 2 KB
   会话状态: 1 KB
   决策日志: 3 KB
   阶段日志: 1 KB
   总计: 7 KB (4 个文件)

📊 会话报告: 15 个

   按日期统计:
     2026-01-20: 2 个报告
     2026-01-21: 3 个报告
     2026-01-22: 4 个报告
     2026-01-23: 3 个报告
     2026-01-24: 2 个报告
     2026-01-25: 1 个报告

📸 快照: 3 个
========================================

# 2. 更新项目记忆
$ cat .claude/memory.json

{
  "project_state": {
    "current_sprint": "Sprint 3-4: 核心模块开发",
    "phase": "实施阶段",
    "last_updated": "2026-01-25T17:00:00Z"
  },
  "decisions": [...],
  "recent_work": [
    "完成基础架构搭建",
    "实现用户认证功能",
    "建立上下文管理系统"
  ],
  "blockers": [],
  "next_steps": [
    "开发 Dashboard 页面",
    "实现剧本编辑器",
    "集成 AI 辅助功能"
  ]
}

# 3. 归档到进度报告
# 创建 docs/reports/progress/2026-01-25-progress-sprint-1-2.md
```

---

**相关文档**:
- [上下文管理指南](../guides/context-management-guide.md)
- [并行开发指南](../guides/parallel-context-sync.md)
