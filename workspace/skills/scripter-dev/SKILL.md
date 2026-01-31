
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
