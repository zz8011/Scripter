# 并行开发上下文同步指南

> **版本**: 1.0
> **更新日期**: 2026-01-25
> **适用范围**: Scripter 项目并行开发场景

---

## 📋 目录

1. [概述](#概述)
2. [shared-context.json 规范](#sharedcontextjson-规范)
3. [实战案例](#实战案例)
4. [冲突解决模式](#冲突解决模式)
5. [最佳实践](#最佳实践)

---

## 概述

并行开发是提升开发效率的关键手段，但多个 Agent 同时工作会产生上下文同步和冲突问题。本指南介绍如何使用 Scripter 的并行上下文同步工具来管理多 Agent 协作。

### 核心工具

- **sync-parallel-context.js**: CLI 工具，管理并行开发状态
- **shared-context.json**: 共享上下文文件，维护 Agent 状态
- **parallel-context-sync.md**: 模板文件，定义上下文格式

### 工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                    并行开发工作流                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 初始化                                                 │
│     ├── node sync-parallel-context.js init 3               │
│     └── 创建 shared-context.json                           │
│                                                             │
│  2. 任务分配                                               │
│     ├── Agent-1: 前端组件                                  │
│     ├── Agent-2: 后端 API                                  │
│     └── Agent-3: 数据库                                    │
│                                                             │
│  3. 并行执行                                               │
│     ├── 各 Agent 独立工作                                  │
│     └── 定期更新进度                                       │
│                                                             │
│  4. 冲突检测                                               │
│     ├── node sync-parallel-context.js check                │
│     └── 识别文件冲突、分支冲突                             │
│                                                             │
│  5. 合并阶段                                               │
│     ├── node sync-parallel-context.js merge-plan           │
│     ├── 按计划合并                                         │
│     └── 清理临时分支                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## shared-context.json 规范

### 文件结构

```json
{
  "version": "1.0",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp",
  "agents": [...],
  "shared_state": {...},
  "sync_checkpoints": [...],
  "conflicts": [],
  "metadata": {...}
}
```

### Agent 对象

```json
{
  "id": "agent-1",
  "name": "Frontend Agent",
  "task": "实现用户登录页面",
  "status": "in_progress",
  "branch": "feature/login-page",
  "files": [
    "src/app/login/page.tsx",
    "src/components/LoginForm.tsx"
  ],
  "last_sync": "2026-01-25T08:15:00Z"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✅ | Agent 唯一标识 |
| name | string | ✅ | Agent 显示名称 |
| task | string | ✅ | 当前任务描述 |
| status | string | ✅ | pending/in_progress/completed/blocked/failed |
| branch | string | ❌ | 工作分支名称 |
| files | string[] | ❌ | 修改的文件列表 |
| last_sync | string | ❌ | 最后同步时间 |

### shared_state 对象

```json
{
  "database": {
    "status": "schema_ready",
    "schema_version": "0.0.1",
    "last_migration": "2026-01-25T08:10:00Z"
  },
  "branches": {
    "main": "main",
    "feature_branches": [
      "feature/login-page",
      "feature/login-api"
    ]
  },
  "interfaces": {
    "LoginRequest": {
      "email": "string",
      "password": "string"
    }
  }
}
```

### sync_checkpoints 数组

```json
[
  {
    "timestamp": "2026-01-25T08:10:00Z",
    "agent": "agent-3",
    "event": "Schema 创建完成",
    "status": "success"
  }
]
```

### conflicts 数组

```json
[
  {
    "type": "file",
    "file": "src/app/api/auth/route.ts",
    "agents": ["agent-1", "agent-2"],
    "resolution": "agent-2 优先，agent-1 使用 API"
  }
]
```

---

## 实战案例

### 案例 1: 用户认证功能并行开发

#### 场景

需要同时开发登录前端、认证 API 和用户数据模型。

#### 步骤

**1. 初始化并行上下文**

```bash
node scripts/sync-parallel-context.js init 3
```

生成 `shared-context.json`:

```json
{
  "agents": [
    {"id": "agent-1", "status": "pending"},
    {"id": "agent-2", "status": "pending"},
    {"id": "agent-3", "status": "pending"}
  ]
}
```

**2. 分配任务**

```bash
# Agent-1: 前端
node scripts/sync-parallel-context.js update agent-1 "实现登录页面" in_progress "" "page.tsx,form.tsx"

# Agent-2: 后端
node scripts/sync-parallel-context.js update agent-2 "实现认证 API" in_progress "" "route.ts,auth.ts"

# Agent-3: 数据库
node scripts/sync-parallel-context.js update agent-3 "创建用户 schema" in_progress "" "users.ts"
```

**3. 定期同步**

每完成一个里程碑，更新进度：

```bash
# Agent-3 完成 schema
node scripts/sync-parallel-context.js update agent-3 "" completed "" "users.ts"
```

**4. 检查冲突**

```bash
node scripts/sync-parallel-context.js check
```

**5. 生成合并计划**

所有 Agent 完成后：

```bash
node scripts/sync-parallel-context.js merge-plan
```

---

### 案例 2: 多页面并行开发

#### 场景

同时开发 Dashboard、Settings 和 Profile 三个页面。

#### 接口定义

在 `shared_state.interfaces` 中定义共享接口：

```json
{
  "interfaces": {
    "UserProps": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "ApiResponse": {
      "success": "boolean",
      "data": "any",
      "error": "string | null"
    }
  }
}
```

#### 文件依赖

在 `shared_state.file_dependencies` 中声明：

```json
{
  "file_dependencies": {
    "shared": [
      "src/types/user.ts",
      "src/lib/api.ts"
    ],
    "conflict_risk": [
      "src/app/layout.tsx",
      "src/components/Header.tsx"
    ]
  }
}
```

---

## 冲突解决模式

### 文件冲突

#### 检测

```bash
node scripts/sync-parallel-context.js check
```

#### 输出

```
⚠️  检测到冲突:

📄 文件冲突:
   src/app/api/auth/route.ts
     Agents: agent-1, agent-2
```

#### 解决方案

**方案 1: 优先级协商**

```json
{
  "conflicts": [
    {
      "file": "src/app/api/auth/route.ts",
      "agents": ["agent-1", "agent-2"],
      "resolution": "agent-2 负责 API 实现，agent-1 通过客户端调用"
    }
  ]
}
```

**方案 2: 接口隔离**

```json
{
  "shared_state": {
    "interfaces": {
      "AuthService": {
        "login": "() => Promise<AuthResult>",
        "logout": "() => Promise<void>"
      }
    }
  }
}
```

**方案 3: 时间分片**

```json
{
  "sync_checkpoints": [
    {
      "timestamp": "2026-01-25T09:00:00Z",
      "agent": "agent-1",
      "event": "完成前端部分，释放文件锁"
    }
  ]
}
```

### 逻辑冲突

#### 类型

1. **数据结构不一致**: Agent-1 期望 `User.email`，Agent-2 使用 `User.emailAddress`
2. **API 签名冲突**: 同一函数的不同参数定义
3. **状态管理冲突**: 不同 Agent 使用不同的状态管理方案

#### 解决

1. **统一接口定义**: 在 `shared_state.interfaces` 中明确定义
2. **代码审查**: 在合并前进行人工审查
3. **类型检查**: 使用 TypeScript/TypeScript-LSP 检测类型冲突

---

## 最佳实践

### 1. 任务分解原则

```
✅ 好的任务分解:
- Agent-1: 登录页面 UI
- Agent-2: 认证 API
- Agent-3: 用户数据模型

❌ 不好的任务分解:
- Agent-1: 前端所有功能
- Agent-2: 后端所有功能
- Agent-3: 数据库所有功能
```

### 2. 接口优先

```bash
# 1. 先定义接口
# 在 shared_state.interfaces 中

# 2. 各 Agent 基于接口开发

# 3. 最后集成
```

### 3. 频繁同步

```bash
# 每 15-30 分钟同步一次
node scripts/sync-parallel-context.js update <agent-id> ...

# 定期检查冲突
node scripts/sync-parallel-context.js check
```

### 4. 明确依赖关系

```json
{
  "shared_state": {
    "dependencies": {
      "agent-2": ["agent-3"],  // API 依赖数据模型
      "agent-1": ["agent-2"]   // 前端依赖 API
    }
  }
}
```

### 5. 使用 Git Worktree

```bash
# 为每个 Agent 创建独立工作目录
git worktree add ../agent-1 feature/login-page
git worktree add ../agent-2 feature/login-api

# Agent 在各自目录工作
# 避免文件冲突
```

---

## 故障排查

### 问题：Agent 状态未更新

**症状**: `status` 显示的状态与实际不符

**解决方案**:
```bash
# 手动更新状态
node scripts/sync-parallel-context.js update agent-1 "" completed
```

### 问题：冲突检测不准确

**症状**: `check` 命令未检测到明显冲突

**解决方案**:
1. 检查 `files` 字段是否完整
2. 手动审查共享文件
3. 使用 `git diff` 检查实际变更

### 问题：合并计划不合理

**症状**: `merge-plan` 生成的顺序导致冲突

**解决方案**:
1. 调整 `shared_state.dependencies` 中的依赖顺序
2. 手动编辑合并计划
3. 分阶段合并，而非一次性合并所有分支

---

**相关文档**:
- [上下文管理指南](./context-management-guide.md)
- [科学开发工作流](./scientific-dev-workflow.md)
