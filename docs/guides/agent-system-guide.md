# Agent 注册系统使用指南

> **版本**: 1.0
> **更新日期**: 2026-01-25
> **项目**: 剧灵 (Scripter)

---

## 概述

Scripter 项目实现了 **Agent 注册系统**，允许不同的专家 Agents 协同工作，自动执行科学开发工作流。

### 核心组件

| 组件 | 位置 | 作用 |
|------|------|------|
| **注册表** | `.claude/agent-registry.json` | 定义所有可用的 agents |
| **加载器** | `.claude/hooks/agent-registry-loader.js` | 会话开始时加载注册表 |
| **Agent 定义** | `.claude/agents/*.md` | 每个 agent 的详细规范 |

---

## 快速开始

### 1. 会话开始时

系统会自动加载 Agent 注册表，显示可用的 agents 和工作流：

```
========================================
🤖 已注册的 Agents
========================================

📋 协调器 (Orchestrators):
   • 科学开发工作流 Agent (scientific-dev)
     ...

👨‍💻 专家 (Specialists):
   • UI组件专家 (ui-component-agent)
   • 数据层专家 (data-agent)
   • AI集成专家 (ai-integration-agent)
   ...

========================================
```

### 2. 根据任务选择调用方式

| 任务类型 | 推荐方式 | 示例 |
|---------|---------|------|
| **全栈功能开发** | `scientific-dev` agent | "使用 scientific-dev 实现[功能]" |
| **纯 UI 开发** | `ui-component-agent` | "使用 ui-component-agent 创建[组件]" |
| **数据模型** | `data-agent` | "使用 data-agent 设计[模型]" |
| **AI 集成** | `ai-integration-agent` | "使用 ai-integration-agent 集成[功能]" |

---

## 使用方式详解

### 方式 1: 使用科学开发 Agent（推荐）

**适用场景**: 完整功能开发

```
"使用 scientific-dev agent 实现用户登录功能"
```

**执行流程**:
```
1️⃣ 计划阶段
   ├─ 阅读 PRD
   ├─ 分析任务
   ├─ 制定实施计划
   └─ 创建 TodoWrite

2️⃣ TDD 实施
   ├─ 根据任务类型调用专家 agents:
   │  ├─ ui-component-agent (UI 组件)
   │  ├─ data-agent (数据模型)
   │  └─ ai-integration-agent (AI 功能)
   └─ 可并行执行

3️⃣ 验证阶段
   ├─ 运行测试
   ├─ 检查代码质量
   └─ 确认符合 PRD

4️⃣ 代码审查
   ├─ 审查代码
   └─ 生成报告
```

### 方式 2: 直接调用专家 Agent

**适用场景**: 单一领域任务

```
"使用 ui-component-agent 创建用户卡片组件"
```

**执行流程**:
```
任务分析 → 专家 agent 执行 → 完成
```

### 方式 3: 使用预定义工作流

**适用场景**: 标准化开发流程

| 工作流 | 触发方式 | 流程 |
|--------|---------|------|
| `full_stack_feature` | "使用 full_stack_feature 工作流" | 计划 → (UI+数据并行) → AI → 测试 → 审查 |
| `ui_only_feature` | "使用 ui_only_feature 工作流" | 计划 → UI → 审查 |
| `data_only_feature` | "使用 data_only_feature 工作流" | 计划 → 数据 → 测试 → 审查 |

---

## Agent 协作示例

### 示例 1: 创建全栈功能

**用户输入**:
```
"使用 scientific-dev 实现剧本编辑器"
```

**Agent 执行**:
```javascript
// 阶段 2: TDD 实施时自动调用专家 agents

// 并行调用 UI 和数据专家
[
  Task({
    subagent_type: "general-purpose",
    prompt: `作为 ui-component-agent，创建剧本编辑器 UI 组件：
    - 使用 shadcn/ui
    - 米色背景主题
    - 三栏布局`,
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: `作为 data-agent，设计剧本数据模型：
    - Prisma Schema
    - 场景、人物关系
    - 索引优化`,
    run_in_background: true
  })
]
```

### 示例 2: 纯 UI 开发

**用户输入**:
```
"使用 ui-component-agent 创建用户卡片组件"
```

**Agent 执行**:
```
ui-component-agent 接收任务
    ↓
1. 分析需求
2. 选择 shadcn/ui Card 组件作为基础
3. 应用主题色（米色背景、金色品牌）
4. 实现响应式布局
5. 完成组件
```

---

## 注册新的 Agent

### 步骤 1: 创建 Agent 定义

在 `.claude/agents/` 创建新文件：

```markdown
---
name: my-agent
description: 我的 Agent
color: 123456
---

# 我的 Agent

## 职责范围
...

## 核心能力
...

## 触发场景
...
```

### 步骤 2: 注册到注册表

编辑 `.claude/agent-registry.json`：

```json
{
  "registry": {
    "my-agent": {
      "id": "my-agent",
      "name": "我的 Agent",
      "description": "...",
      "type": "specialist",
      "definition": ".claude/agents/my-agent.md",
      "capabilities": ["capability1", "capability2"],
      "triggers": ["关键词1", "关键词2"]
    }
  }
}
```

### 步骤 3: 更新元数据

```json
{
  "metadata": {
    "total_agents": 7,
    "last_updated": "2026-01-25"
  }
}
```

---

## 工作流配置

### 定义新工作流

编辑 `.claude/agent-registry.json`：

```json
{
  "workflows": {
    "my_workflow": {
      "name": "我的工作流",
      "orchestrator": "scientific-dev",
      "steps": [
        {
          "phase": "planning",
          "agents": ["scientific-dev"]
        },
        {
          "phase": "implementation",
          "agents": ["ui-component-agent", "data-agent"],
          "parallel": true
        },
        {
          "phase": "testing",
          "agents": ["integration-agent"]
        }
      ]
    }
  }
}
```

---

## 最佳实践

### 1. 任务分配原则

| 规则 | 说明 |
|------|------|
| **单一职责** | 每个 agent 专注于自己的领域 |
| **智能调度** | scientific-dev 自动分析并调用合适的专家 |
| **并行执行** | 独立任务可并行，提高效率 |
| **状态追踪** | 使用 TodoWrite 追踪进度 |

### 2. 调用时机

**使用 scientific-dev 当**:
- ✅ 开发完整功能
- ✅ 需要多领域协作
- ✅ 需要完整验证流程

**直接调用专家 agent 当**:
- ✅ 单一领域任务
- ✅ 已有明确计划
- ✅ 快速迭代

### 3. 错误处理

```
Agent 执行失败
    ↓
1. 记录错误
2. 分析原因
3. 向用户报告
4. 寻求决策:
   - 重试？
   - 跳过？
   - 中止？
```

---

## 故障排查

### Agent 注册表未加载

**检查**:
```bash
# 确认文件存在
ls .claude/agent-registry.json

# 验证 JSON 格式
cat .claude/agent-registry.json | jq .
```

### Agent 调用失败

**可能原因**:
1. Agent 定义文件路径错误
2. Prompt 格式不正确
3. Agent 依赖未满足

**解决**:
```bash
# 检查 Agent 定义
cat .claude/agents/xxx-agent.md

# 查看注册表
cat .claude/agent-registry.json | jq '.registry.xxx-agent'
```

---

## 相关文档

- 📖 [科学开发工作流](scientific-dev-workflow.md)
- 📖 [上下文管理指南](context-management-guide.md)
- 📖 [并行开发指南](parallel-context-sync.md)

---

**最后更新**: 2026-01-25
**维护者**: Scripter Team
