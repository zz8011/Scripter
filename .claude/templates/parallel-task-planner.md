# 并行任务规划模板

> 在启动并行 Agent 之前使用此模板规划任务

## 任务分析

### 主任务描述
{{ 描述要完成的主要任务 }}

---

## 并行性分析

### 可拆分的子任务
| 子任务 | 依赖 | 独立性 | 估计时间 |
|--------|------|--------|---------|
| {{ 子任务 1 }} | 无 | 高 | 30min |
| {{ 子任务 2 }} | 无 | 高 | 45min |
| {{ 子任务 3 }} | 任务 1 | 中 | 20min |

### 依赖关系图
```
任务 A ──┐
         ├──► 任务 D
任务 B ──┘
         │
任务 C ──┴──► 任务 E
```

---

## Agent 分配计划

### Agent 配置
| Agent ID | 任务 | 类型 | 工作目录 | 分支 |
|----------|------|------|---------|------|
| Agent-1 | {{ 任务 1 }} | general-purpose | projects/scripter-nextjs | feature/task-1 |
| Agent-2 | {{ 任务 2 }} | general-purpose | ../scripter-task-2 | feature/task-2 |
| Agent-3 | {{ 任务 3 }} | general-purpose | ../scripter-task-3 | feature/task-3 |

### Git Worktree 设置
```bash
# 在启动 Agent 前执行
git worktree add ../scripter-task-2 feature/task-2
git worktree add ../scripter-task-3 feature/task-3
```

---

## 接口定义

### 模块间接口
```typescript
// 预先定义的接口，避免冲突
interface Task1Output {
  data: any;
  endpoint: string;
}

interface Task2Output {
  config: any;
  dependencies: string[];
}
```

### 共享状态
- 数据库: {{ 是否需要共享数据库 }}
- API 端点: {{ 共享的 API 端点 }}
- 环境变量: {{ 共享的环境变量 }}

---

## 进度跟踪

### 检查点
| 时间 | Agent-1 | Agent-2 | Agent-3 | 同步操作 |
|------|---------|---------|---------|---------|
| 0:00 | ✅ 启动 | ✅ 启动 | ✅ 启动 | 初始同步 |
| 0:30 | 🔄 进行中 | ✅ 完成 | 🔄 进行中 | 合并 Agent-2 |
| 1:00 | ✅ 完成 | 🔄 等待 | 🔄 进行中 | 合并 Agent-1 |
| 1:30 | ✅ 完成 | ✅ 完成 | ✅ 完成 | 最终合并 |

---

## 冲突预案

### 可能的冲突
| 类型 | 概率 | 解决方案 |
|------|------|---------|
| 文件冲突 | 中 | 预先分配文件 |
| 接口冲突 | 低 | 预定义接口 |
| 依赖冲突 | 高 | 统一 package.json |

### 回滚计划
```bash
# 如果出现无法解决的冲突
git worktree remove ../scripter-task-2
git worktree remove ../scripter-task-3
git branch -D feature/task-2
git branch -D feature/task-3
```

---

## 成功标准

- [ ] 所有子任务完成
- [ ] 无合并冲突
- [ ] 测试通过
- [ ] 性能达标
