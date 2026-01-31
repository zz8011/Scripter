/* ==================================================
   Clawdbot Scripter 开发助手
   Clawdbot Scripter Development Assistant
   ================================================== */

## 📋 概述

这是一个为 **Scripter（剧灵）** 项目定制的 Clawdbot 技能/Agent 系统。

**目标**：
- 利用 Clawdbot 的多 Agent 框架
- 辅助开发 Scripter 项目
- 提供专业的剧本创作领域知识
- 实现自动化开发流程

---

## 🏗️ 架构设计

### Clawdbot 技能结构

```
~/.openclaw/workspace/skills/scripter-dev/
├── SKILL.md                    # 技能元数据
├── agents/                      # Agent 定义
│   ├── code-reviewer.ts        # 代码审查 Agent
│   ├── architect.ts            # 架构设计 Agent
│   ├── tester.ts              # 测试生成 Agent
│   └── documenter.ts         # 文档生成 Agent
├── workflows/                    # 工作流
│   ├── feature-development.md   # 功能开发工作流
│   ├── bug-fix.md           # Bug 修复工作流
│   └── refactoring.md        # 重构工作流
├── templates/                    # 代码模板
│   ├── agent-template.ts      # Agent 模板
│   ├── api-route-template.ts  # API 路由模板
│   └── component-template.ts  # 组件模板
└── knowledge/                     # 领域知识
    ├── scripter-architecture.md # Scripter 架构知识
    ├── best-practices.md      # 最佳实践
    └── common-patterns.md    # 常见模式
```

---

## 👥 Agent 角色定义

### 1. 代码审查 Agent (Code Reviewer Agent)

**角色**：审查 Scripter 代码，提供专业建议

**专长**：
- TypeScript 类型安全
- React/Next.js 最佳实践
- 多 Agent 系统架构
- 错误处理和边界情况

**个性**：
```yaml
personality:
  element: metal  # 金：严谨、精准
  speaking_style:
    formal: 0.9
    humorous: 0.1
    direct: 0.9
    poetic: 0.1
  decision_style:
    cautious: 0.8
    creative: 0.4
    analytical: 0.9
  motto: "代码质量是产品的生命线"
```

**能力**：
- 代码安全审查
- 性能优化建议
- 架构一致性检查
- TypeScript 类型检查

### 2. 架构设计 Agent (Architect Agent)

**角色**：设计 Scripter 的架构和模块

**专长**：
- 多 Agent 系统设计
- WebSocket 协议设计
- 事件驱动架构
- 模块解耦

**个性**：
```yaml
personality:
  element: wood  # 木：生长、创造
  speaking_style:
    formal: 0.7
    humorous: 0.3
    direct: 0.7
    poetic: 0.4
  decision_style:
    cautious: 0.6
    creative: 0.9
    analytical: 0.7
  motto: "架构决定上限，细节决定成败"
```

**能力**：
- 模块设计
- 接口定义
- 依赖关系分析
- 可扩展性评估

### 3. 测试生成 Agent (Tester Agent)

**角色**：为 Scripter 生成测试代码

**专长**：
- Jest 测试框架
- 单元测试设计
- 集成测试设计
- 测试覆盖率优化

**个性**：
```yaml
personality:
  element: water  # 水：灵活、深邃
  speaking_style:
    formal: 0.6
    humorous: 0.4
    direct: 0.8
    poetic: 0.2
  decision_style:
    cautious: 0.7
    creative: 0.5
    analytical: 0.8
  motto: "测试不是负担，而是保障"
```

**能力**：
- 单元测试生成
- 集成测试生成
- Mock 数据生成
- 测试场景设计

### 4. 文档生成 Agent (Documenter Agent)

**角色**：为 Scripter 生成文档和注释

**专长**：
- Markdown 文档
- TypeScript 注释
- API 文档
- 最佳实践指南

**个性**：
```yaml
personality:
  element: earth  # 土：稳重、可靠
  speaking_style:
    formal: 0.8
    humorous: 0.2
    direct: 0.7
    poetic: 0.3
  decision_style:
    cautious: 0.6
    creative: 0.6
    analytical: 0.7
  motto: "好文档是最好的注释"
```

**能力**：
- 代码注释生成
- README 文档生成
- API 文档生成
- 使用指南生成

---

## 🔄 工作流设计

### 工作流 1：功能开发 (Feature Development)

**触发**：用户说"开发 [功能名称]"

**流程**：
```
1. 需求分析 (Architect Agent)
   ↓
2. 架构设计 (Architect Agent)
   ↓
3. 代码生成 (Claude 主 Agent)
   ↓
4. 代码审查 (Code Reviewer Agent)
   ↓
5. 测试生成 (Tester Agent)
   ↓
6. 文档生成 (Documenter Agent)
   ↓
7. 集成验证 (所有 Agent 协同)
```

**实现**：
```markdown
## 工作流：功能开发

### 触发条件
用户消息包含："开发 [功能名称]" 或 "implement [功能名称]"

### 执行步骤

#### Step 1: 需求分析
**Agent**: Architect Agent
**任务**: 分析用户需求，明确功能边界
**输出**: 需求文档

#### Step 2: 架构设计
**Agent**: Architect Agent
**任务**: 设计功能架构，确定模块和接口
**输出**: 架构设计文档

#### Step 3: 代码生成
**Agent**: Claude 主 Agent
**任务**: 根据架构设计生成代码
**输出**: TypeScript/React 代码

#### Step 4: 代码审查
**Agent**: Code Reviewer Agent
**任务**: 审查生成的代码，检查安全性和最佳实践
**输出**: 审查报告和改进建议

#### Step 5: 测试生成
**Agent**: Tester Agent
**任务**: 为生成的代码编写测试
**输出**: Jest 测试代码

#### Step 6: 文档生成
**Agent**: Documenter Agent
**任务**: 为代码生成文档和注释
**输出**: Markdown 文档

#### Step 7: 集成验证
**Agent**: 所有 Agent 协同
**任务**: 运行测试，验证功能完整性
**输出**: 验证报告

### 协同模式
- 串行：每个步骤完成后，下一个 Agent 基于前一个的结果
- 并行：代码审查、测试生成、文档生成可以并行执行
- 反馈：如果审查发现问题，返回代码生成步骤

### 验收标准
- [ ] 代码通过 TypeScript 类型检查
- [ ] 代码通过 ESLint 检查
- [ ] 所有测试通过
- [ ] 测试覆盖率 > 80%
- [ ] 文档完整
- [ ] 用户确认
```

### 工作流 2：Bug 修复 (Bug Fix)

**触发**：用户说"修复 [Bug 描述]"或报告错误日志

**流程**：
```
1. 错误分析 (Code Reviewer Agent)
   ↓
2. 根因定位 (Code Reviewer Agent)
   ↓
3. 修复方案设计 (Architect Agent)
   ↓
4. 代码修复 (Claude 主 Agent)
   ↓
5. 回归测试生成 (Tester Agent)
   ↓
6. 验证修复 (所有 Agent 协同)
```

**实现**：
```markdown
## 工作流：Bug 修复

### 触发条件
用户消息包含："修复 [Bug 描述]"、"fix [Bug 描述]"或错误日志

### 执行步骤

#### Step 1: 错误分析
**Agent**: Code Reviewer Agent
**任务**: 分析错误日志，确定错误类型和严重性
**输出**: 错误分析报告

#### Step 2: 根因定位
**Agent**: Code Reviewer Agent
**任务**: 定位错误代码位置，分析根因
**输出**: 根因分析报告

#### Step 3: 修复方案设计
**Agent**: Architect Agent
**任务**: 设计修复方案，确保不引入新问题
**输出**: 修复方案文档

#### Step 4: 代码修复
**Agent**: Claude 主 Agent
**任务**: 根据修复方案修改代码
**输出**: 修复后的代码

#### Step 5: 回归测试生成
**Agent**: Tester Agent
**任务**: 为修复编写回归测试
**输出**: Jest 测试代码

#### Step 6: 验证修复
**Agent**: 所有 Agent 协同
**任务**: 运行回归测试，验证修复有效
**输出**: 验证报告

### 验收标准
- [ ] 原有测试通过
- [ ] 新增回归测试通过
- [ ] 错误已修复
- [ ] 没有引入新 Bug
- [ ] 性能没有退化
```

### 工作流 3：代码重构 (Refactoring)

**触发**：用户说"重构 [模块名称]"或"优化 [代码描述]"

**流程**：
```
1. 代码分析 (Code Reviewer Agent)
   ↓
2. 重构方案设计 (Architect Agent)
   ↓
3. 重构执行 (Claude 主 Agent)
   ↓
4. 测试更新 (Tester Agent)
   ↓
5. 文档更新 (Documenter Agent)
```

---

## 🧠 领域知识

### Scripter 架构知识

```markdown
## Scripter 项目架构

### 技术栈
- 前端框架：Next.js 15
- UI 框架：React 19
- 语言：TypeScript 5
- 样式：Tailwind CSS 4
- 编辑器：TipTap
- 数据库 ORM：Drizzle ORM
- 数据库：PostgreSQL
- AI：智谱 GLM-4.7
- 认证：Casdoor

### 目录结构
```
app/
├── api/                    # API 路由
├── agents/                  # Agent 页面
├── dashboard/              # Dashboard 页面
├── editor/                 # 编辑器页面
├── characters/              # 人物管理
├── scenes/                 # 场景管理
├── worldview/               # 世界观管理
└── storyboard/              # 分镜管理

lib/
├── agents/                 # 多 Agent 系统
│   ├── core/              # Agent 核心
│   ├── agents/             # 具体 Agent
│   └── skills/             # 技能系统
├── api/                    # API 客户端
├── db/                     # 数据库
├── stores/                  # 状态管理
└── utils/                  # 工具函数
```

### 多 Agent 系统设计
- Agent 基类：所有 Agent 继承此类
- Agent 通信总线：Agent 间消息传递
- Agent 调度器：Agent 执行调度
- 技能系统：Agent 技能注册和管理
- Agent 管理器：Agent 初始化和管理

### 关键设计原则
1. 解耦：Agent 不直接依赖，通过 Gateway 通信
2. 可扩展：可以动态添加/移除 Agent
3. 可观测：所有事件都被记录
4. 可演化：Agent 根据反馈自我改进
5. 安全：配对和权限控制
```

### 最佳实践

```markdown
## Scripter 开发最佳实践

### TypeScript
- 使用严格模式：`"strict": true`
- 避免使用 `any`，使用 `unknown`
- 使用接口定义类型
- 使用类型守卫进行运行时验证

### React
- 使用函数组件
- 使用 Hooks 进行状态管理
- 避免不必要的重渲染
- 使用 useMemo/useCallback 优化性能

### Next.js
- 使用 App Router
- 使用 Server Actions 进行数据操作
- 使用 Streaming Response 进行 AI 流式输出
- 优化图片和字体加载

### 错误处理
- 所有异步操作使用 try-catch
- 定义自定义错误类
- 提供清晰的错误消息
- 实现降级策略

### 测试
- 单元测试覆盖率 > 80%
- 集成测试覆盖关键流程
- 使用 Mock 隔离外部依赖
- 测试边界情况和错误场景

### 性能
- 避免不必要的重渲染
- 使用虚拟列表处理大数据
- 优化图片加载和缓存
- 使用 Web Workers 处理计算密集型任务
```

### 常见模式

```markdown
## Scripter 常见模式

### API 路由模式
```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证权限
    // 2. 解析参数
    // 3. 执行业务逻辑
    // 4. 返回响应
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Agent 模式
```typescript
// lib/agents/agents/CustomAgent.ts
export class CustomAgent extends Agent {
  public async think(context: Context): Promise<Thought> {
    // 1. 分析上下文
    // 2. 调用 AI
    // 3. 返回思考结果
  }
  
  public async act(context: Context, thought: Thought): Promise<Action> {
    // 1. 根据思考结果生成行动
    // 2. 返回行动
  }
  
  public async learn(feedback: Feedback): Promise<void> {
    // 1. 分析反馈
    // 2. 调整个性参数
  }
}
```

### 状态管理模式
```typescript
// lib/stores/useStore.ts
import { create } from 'zustand';

export const useStore = create((set) => ({
  state: initialState,
  
  setState: (newState) => set({ state: newState }),
  
  updateState: (updater) => set(state => updater(state)),
}));
```
```

---

## 🔧 技能实现

### SKILL.md

```markdown
# Scripter 开发助手

> 专为 Scripter（剧灵）项目定制的 Clawdbot 技能
> 利用多 Agent 协同机制，提供专业的剧本创作领域开发支持

## 技能信息

- **名称**: Scripter Development Assistant
- **版本**: 1.0.0
- **作者**: Scripter Team
- **类别**: Development Assistant
- **标签**: scripter, multi-agent, development, typescript, nextjs

## 功能

### 多 Agent 协同开发
- 代码审查 Agent：提供专业的代码审查建议
- 架构设计 Agent：设计模块和接口
- 测试生成 Agent：自动生成测试代码
- 文档生成 Agent：生成代码文档和注释

### 工作流自动化
- 功能开发工作流：从需求到验证的完整流程
- Bug 修复工作流：从分析到验证的完整流程
- 代码重构工作流：从分析到优化的完整流程

### 领域知识
- Scripter 架构知识
- TypeScript/React/Next.js 最佳实践
- 多 Agent 系统设计原则
- 测试和性能优化建议

## 使用方法

### 功能开发
发送消息："开发 [功能名称]"
示例："开发导演 Agent"

### Bug 修复
发送消息："修复 [Bug 描述]"
示例："修复 WebSocket 连接断开的问题"

### 代码重构
发送消息："重构 [模块名称]"
示例："重构 Agent 通信总线"

### 代码审查
发送消息："审查 [文件路径]"
示例："审查 lib/agents/core/Agent.ts"

### 测试生成
发送消息："测试 [文件路径]"
示例："测试 lib/agents/core/AgentBus.ts"

## Agent 配置

### 代码审查 Agent
- 个性：严谨、分析型
- 专长：TypeScript、React、多 Agent 系统
- 能力：安全审查、性能优化、架构一致性

### 架构设计 Agent
- 个性：创造、综合型
- 专长：多 Agent 系统、WebSocket、事件驱动
- 能力：模块设计、接口定义、依赖分析

### 测试生成 Agent
- 个性：灵活、分析型
- 专长：Jest、单元测试、集成测试
- 能力：测试生成、Mock 数据、场景设计

### 文档生成 Agent
- 个性：稳重、可靠型
- 专长：Markdown、TypeScript 注释、API 文档
- 能力：注释生成、文档生成、指南编写

## 工作流

所有工作流都遵循以下原则：
1. **多 Agent 协同**：不同 Agent 负责不同阶段
2. **反馈循环**：每个阶段的输出作为下一阶段的输入
3. **质量保证**：代码审查、测试、文档三重保障
4. **用户确认**：关键步骤需要用户确认

## 依赖

- Clawdbot Gateway
- Claude Agent（主 Agent）
- 文件系统访问
- Git 操作（可选）
- 测试运行（可选）

## 注意事项

1. 此技能专为 Scripter 项目设计，其他项目可能不适用
2. 所有生成的代码都需要人工审查
3. 测试覆盖率目标 > 80%
4. 遵循 Scripter 的代码规范和最佳实践
5. 敏感信息（API Key、密码）不会包含在生成内容中

## 更新日志

### v1.0.0 (2026-01-31)
- 初始版本
- 实现多 Agent 协同开发机制
- 实现功能开发、Bug 修复、代码重构工作流
- 添加 Scripter 领域知识
```

---

## 🚀 安装和使用

### 安装

```bash
# 1. 创建技!能目录
mkdir -p ~/.openclaw/workspace/skills/scripter-dev

# 2. 复制技!能文件
cp SKILL.md ~/.openclaw/workspace/skills/scripter-dev/
cp -r agents ~/.openclaw/workspace/skills/scripter-dev/
cp -r workflows ~/.openclaw/workspace/skills/scripter-dev/
cp -r templates ~/.openclaw/workspace/skills/scripter-dev/
cp -r knowledge ~/.openclaw/workspace/skills/scripter-dev/

# 3. 重启 Clawdbot Gateway
openclaw gateway restart
```

### 使用

```bash
# 在 Clawdbot 中发送消息
openclaw agent --message "开发导演 Agent"

# 或者在连接的聊天界面中直接发送
"开发导演 Agent"
```

---

## 📊 示例对话

### 示例 1：功能开发

```
你: 开发导演 Agent

Clawdbot: [Architect Agent] 正在分析需求...
Clawdbot: [Architect Agent] 需求分析完成
Clawdbot: [Architect Agent] 开始设计架构...

Clawdbot: [Architect Agent] 架构设计完成
Clawdbot: [Claude] 正在生成代码...

[生成代码...]

Clawdbot: [Claude] 代码生成完成
Clawdbot: [Code Reviewer Agent] 正在审查代码...

[代码审查报告]

Clawdbot: [Code Reviewer Agent] 审查完成，发现 2 个问题
Clawdbot: [Claude] 正在修复问题...

[修复代码...]

Clawdbot: [Tester Agent] 正在生成测试...

[生成测试...]

Clawdbot: [Tester Agent] 测试生成完成
Clawdbot: [Documenter Agent] 正在生成文档...

[生成文档...]

Clawdbot: [Documenter Agent] 文档生成完成
Clawdbot: [所有 Agent] 正在运行测试...

[测试结果...]

Clawdbot: ✅ 功能开发完成！
```

### 示例 2：Bug 修复

```
你: 修复 WebSocket 连接断开的问题

Clawdbot: [Code Reviewer Agent] 正在分析错误...
Clawdbot: [Code Reviewer Agent] 错误分析完成
Clawdbot: [Code Reviewer Agent] 错误类型：网络连接超时

Clawdbot: [Code Reviewer Agent] 正在定位根因...

[根因分析...]

Clawdbot: [Architect Agent] 正在设计修复方案...

[修复方案...]

Clawdbot: [Claude] 正在修复代码...

[修复代码...]

Clawdbot: [Tester Agent] 正在生成回归测试...

[生成测试...]

Clawdbot: [Tester Agent] 测试生成完成
Clawdbot: [所有 Agent] 正在运行回归测试...

[测试结果...]

Clawdbot: ✅ Bug 修复完成！
```

---

## 🎯 总结

### 核心价值

1. **多 Agent 协同** — 不同 Agent 负责不同专业领域
2. **工工作流自动化** — 从需求到验证的完整流程
3. **领域知识** — 专门针对 Scripter 项目优化
4. **质量保证** — 代码审查、测试、文档三重保障
5. **持续改进** — Agent 根据反馈自我学习

### 关键优势

- ✅ **专业性** — 每个 Agent 都是领域专家
- ✅ **协同性** — Agent 之间可以互相交流
- ✅ **自动化** — 减少重复性工作
- ✅ **质量保证** — 多重审查和测试
- ✅ **可扩展** — 可以轻松添加新的 Agent 和工工作流

### 适用场景

- 功能开发
- Bug 修复
- 代码重构
- 性能优化
- 文档生成
- 测试编写

---

**让 Scripter 开发更高效、更专业！** 🚀
