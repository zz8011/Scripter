# 并行开发快速参考

> 快速查询并行开发的关键命令和模式

---

## 🚀 快速启动

### 方式一：Task 工具（最快）
```javascript
// 同时启动 3 个 Agent
[
  Task({ subagent_type: "general-purpose", prompt: "任务A", run_in_background: true }),
  Task({ subagent_type: "general-purpose", prompt: "任务B", run_in_background: true }),
  Task({ subagent_type: "general-purpose", prompt: "任务C", run_in_background: true })
]
```

### 方式二：Git Worktree（最隔离）
```bash
# Windows PowerShell
.\scripts\parallel-dev-setup.ps1 -TaskName feature-name -Count 3

# Linux/Mac
bash scripts/parallel-dev-setup.sh feature-name
```

### 方式三：专业化 Agent
```javascript
Task({ subagent_type: "ui-dev-agent", prompt: "实现UI..." })
Task({ subagent_type: "api-dev-agent", prompt: "实现API..." })
```

---

## 📊 并行模式对比

| 模式 | 速度 | 隔离度 | 复杂度 | 适用场景 |
|------|------|--------|--------|---------|
| Task 工具 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | 快速原型 |
| Git Worktree | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 大型功能 |
| 专业 Agent | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 复杂项目 |

---

## 🛠️ 常用命令

### 查看并行任务
```bash
# 查看所有后台任务
/tasks

# 查看特定任务输出
TaskOutput({ task_id: "xxx" })
```

### Git Worktree 管理
```bash
# 列出所有 Worktree
git worktree list

# 创建 Worktree
git worktree add ../project-feature feature/branch

# 删除 Worktree
git worktree remove ../project-feature

# 清理所有
./scripts/parallel-dev-cleanup.ps1 -All
```

### 合并分支
```bash
# 逐个合并
git checkout main
git merge feature/task-1
git merge feature/task-2

# 或使用 octopus merge
git merge feature/task-1 feature/task-2 feature/task-3
```

---

## 📋 任务规划检查表

使用此检查表确保并行任务规划正确：

- [ ] **任务独立**：各任务无循环依赖
- [ ] **接口定义**：预先定义模块间接口
- [ ] **文件分配**：各 Agent 操作不同文件
- [ ] **共享状态**：明确共享状态的管理方式
- [ ] **测试策略**：各任务独立可测
- [ ] **合并计划**：预先规划合并顺序
- [ ] **回滚预案**：如有冲突如何回滚

---

## ⚡ 性能优化技巧

### 1. 合理的粒度
```
太大 → 并行度低
太小 → 开销大

适中 → 3-10 个子任务，每个 30min-2h
```

### 2. 减少通信
```
❌ Agent 频繁通信
✅ 预定义接口，减少通信
```

### 3. 批量操作
```javascript
// 批量启动（效率更高）
[
  Task(...), Task(...), Task(...)
]

// 而不是
Task(...) → 等待 → Task(...) → 等待
```

---

## 🚨 常见问题

### Agent 无响应？
```bash
# 检查任务状态
/tasks

# 强制终止（如果需要）
# 关闭并重启 Claude Code
```

### 合并冲突？
```bash
# 使用合并工具
git mergetool

# 或回滚
git merge --abort
```

### 找不到 Worktree？
```bash
# 列出所有 Worktree
git worktree list

# 清理损坏的 Worktree
git worktree prune
```

---

## 📈 效率提升参考

| 场景 | 串行 | 并行 | 提升 |
|------|------|------|------|
| 3 独立功能 | 6h | 2h | 3x |
| 5 个模块 | 10h | 3h | 3.3x |
| 全栈开发 | 6h | 3h | 2x |

---

## 🎯 实战模板

### 模板 1：快速功能开发
```javascript
// 使用 Task 工具快速并行
[
  Task({ subagent_type: "general-purpose", prompt: "实现用户登录", run_in_background: true }),
  Task({ subagent_type: "general-purpose", prompt: "实现用户注册", run_in_background: true }),
  Task({ subagent_type: "general-purpose", prompt: "实现密码重置", run_in_background: true })
]

// 完成后合并
// 使用 /tasks 查看进度
```

### 模板 2：大型重构
```bash
# 1. 创建 Worktree
./scripts/parallel-dev-setup.ps1 -TaskName refactor -Count 4

# 2. 在不同终端启动 Claude Code
cd ../scripter-task-1 && claude-code
cd ../scripter-task-2 && claude-code
cd ../scripter-task-3 && claude-code
cd ../scripter-task-4 && claude-code

# 3. 分配独立任务
# 终端 1: "重构组件层"
# 终端 2: "重构状态管理"
# 终端 3: "重构 API 层"
# 终端 4: "更新测试"

# 4. 逐个合并
git checkout main
git merge feature/refactor-task-1
# 测试 → 继续
```

### 模板 3：专业化开发
```javascript
// 使用专业 Agent
Task({ subagent_type: "ui-dev-agent", prompt: "实现编辑器UI" })
Task({ subagent_type: "api-dev-agent", prompt: "实现保存API" })
Task({ subagent_type: "test-agent", prompt: "编写测试用例" })
Task({ subagent_type: "doc-agent", prompt: "编写文档" })
```

---

## 📚 相关文档

- 完整指南：`docs/parallel-development-guide.md`
- 任务规划：`.claude/templates/parallel-task-planner.md`
- 并行 Agent：`.claude/agents/parallel-orchestrator.md`

---

**提示**：将此文件加入收藏，随时快速查询！
