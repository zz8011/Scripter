# Scripter 团队协作指南

> **版本**: v1.0
> **团队**: scripter-ai-refactor
> **更新日期**: 2026-02-08

---

## 📋 目录

1. [团队结构](#团队结构)
2. [工作流程](#工作流程)
3. [沟通机制](#沟通机制)
4. [任务管理](#任务管理)
5. [代码规范](#代码规范)
6. [问题处理](#问题处理)

---

## 团队结构

### 角色与职责

| 角色 | 职责 | 权限 |
|------|------|------|
| **Team Lead** | 任务分配、进度追踪、代码审查、架构决策 | 所有权限 |
| **Security Specialist** | 安全修复、认证系统、API 验证 | 读写代码、创建 PR |
| **Frontend Specialist** | 前端开发、编辑器功能、UI 交互 | 读写代码、创建 PR |
| **Data Specialist** | 数据建模、Schema 设计、数据库迁移 | 读写代码、创建 PR |
| **UI Specialist** | UI 组件、设计系统、用户体验 | 读写代码、创建 PR |

### 团队通信

- **任务分配**: Team Lead → TaskUpdate
- **进度报告**: 成员 → SendMessage → Team Lead
- **问题上报**: 成员 → SendMessage → Team Lead
- **代码审查**: 成员完成 → Team Lead 审查

---

## 工作流程

### 标准工作流

```
1. 接收任务
   ├─ Team Lead 通过 TaskUpdate 分配任务
   └─ 成员收到任务通知

2. 开始工作
   ├─ 阅读任务描述和相关文档
   ├─ 更新任务状态为 in_progress
   └─ 开始编码

3. 开发过程
   ├─ 遵循代码规范
   ├─ 编写必要的测试
   ├─ 提交清晰的 commit 信息
   └─ 遇到问题及时上报

4. 完成任务
   ├─ 自测功能是否符合验收标准
   ├─ 更新任务状态为 completed
   ├─ 向 Team Lead 发送完成消息
   └─ 等待代码审查

5. 代码审查
   ├─ Team Lead 审查代码
   ├─ 如有问题，返回修改
   └─ 审查通过，任务正式完成

6. 下一任务
   ├─ Team Lead 分配新任务
   └─ 重复流程
```

### 并行开发策略

**原则**: 最大化并行，避免阻塞

- ✅ **可以并行**: 无依赖关系的任务
- ❌ **不能并行**: 有依赖关系的任务

**示例**:
```
✅ 可以并行:
  - Task #1 (编辑器保存) + Task #3 (Story Bible Schema)
  - Task #9 (安全修复) + Task #10 (错误处理)

❌ 不能并行:
  - Task #1 必须完成后才能开始 Task #2
  - Task #5 必须完成后才能开始 Task #6
```

---

## 沟通机制

### 消息类型

#### 1. 进度报告

**何时发送**: 任务完成、遇到阻塞、需要帮助

**格式**:
```
类型: message
收件人: team-lead
内容:
  - 任务 ID
  - 当前状态
  - 完成情况
  - 遇到的问题（如有）
  - 下一步计划
```

**示例**:
```typescript
SendMessage({
  type: "message",
  recipient: "team-lead",
  summary: "Task #1 编辑器保存已完成",
  content: `
    任务 #1 已完成，验收标准全部达成：
    - ✅ 编辑器内容自动保存到数据库
    - ✅ 刷新页面后内容正确恢复
    - ✅ 保存状态指示器工作正常
    - ✅ 错误处理完善

    相关文件:
    - app/projects/[id]/editor/page.tsx
    - app/api/scenes/[id]/route.ts

    已更新 Task #1 状态为 completed。
    等待代码审查。
  `
})
```

#### 2. 问题上报

**何时发送**: 遇到技术难题、需要架构决策、任务阻塞

**格式**:
```
类型: message
收件人: team-lead
内容:
  - 问题描述
  - 已尝试的方案
  - 需要的帮助
  - 影响范围
```

**示例**:
```typescript
SendMessage({
  type: "message",
  recipient: "team-lead",
  summary: "Task #3 遇到技术问题",
  content: `
    在实现 Story Bible Schema 时遇到问题：

    问题: Drizzle ORM 的 JSONB 字段不支持部分更新

    已尝试:
    1. 使用 sql 模板语法 - 语法复杂
    2. 读取整个对象后修改 - 性能问题

    需要帮助:
    是否可以接受"读取-修改-写入"的方案？
    或者有更好的技术方案？

    影响: 可能影响 Story Bible 自动聚合的性能
  `
})
```

#### 3. 协作请求

**何时发送**: 需要其他成员协助、跨任务协调

**格式**:
```
类型: message
收件人: 其他成员
内容:
  - 协作需求
  - 相关任务
  - 时间要求
```

### 响应时效

| 消息类型 | 响应时间 |
|---------|---------|
| 紧急问题（阻塞任务） | 1 小时内 |
| 一般问题 | 4 小时内 |
| 进度报告 | 确认收到即可 |
| 代码审查请求 | 24 小时内 |

---

## 任务管理

### 任务状态

| 状态 | 说明 | 操作 |
|------|------|------|
| **pending** | 待开始 | 等待分配或依赖完成 |
| **in_progress** | 进行中 | 成员正在开发 |
| **completed** | 已完成 | 等待审查或已审查通过 |

### 任务更新

#### 开始任务
```typescript
TaskUpdate({
  taskId: "1",
  status: "in_progress"
})
```

#### 完成任务
```typescript
TaskUpdate({
  taskId: "1",
  status: "completed"
})
```

#### 认领任务
```typescript
TaskUpdate({
  taskId: "1",
  owner: "frontend-specialist"
})
```

### 任务查询

#### 查看所有任务
```typescript
TaskList()
```

#### 查看任务详情
```typescript
TaskGet({ taskId: "1" })
```

---

## 代码规范

### 提交规范

**Commit 信息格式**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 重构
- `docs`: 文档更新
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(editor): 实现编辑器服务端自动保存

- 新增 PATCH /api/scenes/[id] 端点
- 实现 debounce 自动保存（2秒延迟）
- 添加保存状态指示器
- 完善错误处理

Task #1
```

### 代码风格

- **TypeScript**: 严格模式，避免 `any`
- **React**: 函数组件 + Hooks
- **命名**: camelCase (变量/函数), PascalCase (组件/类)
- **文件**: kebab-case (文件名)
- **注释**: 复杂逻辑必须注释

### 文件组织

```
新增文件命名规范:
- Schema: lib/db/schema/[name].ts
- Query: lib/db/queries/[name].ts
- Component: components/[category]/[Name].tsx
- API: app/api/[resource]/[...]/route.ts
- Util: lib/utils/[name].ts
```

---

## 问题处理

### 常见问题

#### Q1: 任务依赖未完成怎么办？

**A**:
1. 检查 TaskList 确认依赖状态
2. 如果依赖任务进行中，等待完成
3. 如果有其他独立任务，可以先做
4. 向 Team Lead 报告，请求分配其他任务

#### Q2: 遇到技术难题怎么办？

**A**:
1. 先自己尝试解决（查文档、搜索、实验）
2. 如果 1 小时内无法解决，向 Team Lead 上报
3. 说明问题、已尝试的方案、需要的帮助
4. 等待 Team Lead 响应或调整方案

#### Q3: 发现任务描述不清楚怎么办？

**A**:
1. 向 Team Lead 发送消息询问
2. 说明哪部分不清楚，需要什么信息
3. 等待 Team Lead 补充说明
4. 确认理解后再开始开发

#### Q4: 完成任务后没有新任务怎么办？

**A**:
1. 向 Team Lead 发送消息报告完成
2. 查看 TaskList 是否有其他可做的任务
3. 如果没有，等待 Team Lead 分配
4. 可以利用空闲时间优化代码、补充测试

#### Q5: 需要修改其他成员的代码怎么办？

**A**:
1. 先向 Team Lead 报告
2. 说明为什么需要修改、影响范围
3. 等待 Team Lead 协调
4. 获得批准后再修改

---

## 最佳实践

### ✅ 推荐做法

1. **及时沟通**: 遇到问题立即上报，不要拖延
2. **小步提交**: 功能完成一部分就提交，不要等全部完成
3. **自我测试**: 提交前充分测试，确保符合验收标准
4. **清晰注释**: 复杂逻辑添加注释，方便审查
5. **遵循规范**: 严格遵循代码规范和文件组织
6. **主动学习**: 阅读项目文档，理解整体架构

### ❌ 避免做法

1. **闷头开发**: 遇到问题不上报，浪费时间
2. **随意修改**: 未经批准修改其他模块代码
3. **忽略测试**: 不测试就提交，导致 Bug
4. **不看文档**: 不阅读任务描述和相关文档
5. **格式混乱**: 不遵循代码规范，影响可读性
6. **过度工程**: 超出任务范围，增加不必要的功能

---

## 附录

### 相关文档

- [PRD v2.7](../../prd/prd-v2.7.md)
- [AI 架构重构计划](../../plans/plan-ai-architecture-v2.md)
- [技术栈文档](../../tech/tech-stack.md)
- [数据模型文档](../../tech/data-model.md)
- [设计系统](../../design/ui-design-system.md)

### 工具链

- **任务管理**: TaskList, TaskGet, TaskUpdate
- **团队通信**: SendMessage
- **代码工具**: Read, Write, Edit, Bash
- **测试工具**: Vitest, Playwright

---

**团队协作，高效开发！** 🚀
