# Scripter 项目 Agent Team 组织方案

> **创建日期**: 2026-02-08
> **团队规模**: 5 个专业 Agent
> **目标**: 完成 AI 架构重构和核心功能开发

---

## 一、团队组织结构

### 1.1 团队成员

| Agent | 角色 | 主要职责 | 当前任务 |
|-------|------|---------|---------|
| **team-lead** | 项目协调者 | 任务分配、进度跟踪、代码审查 | 协调整体开发 |
| **backend-specialist** | 后端专家 | API 开发、Skills 系统、数据库 | Task #2: 接通 Skills API |
| **data-specialist** | 数据架构师 | Story Bible、数据聚合、Schema 设计 | Task #4: Story Bible 聚合 |
| **frontend-specialist** | 前端专家 | 编辑器、UI 交互、状态管理 | Task #8: 编辑器内联 AI |
| **ai-specialist** | AI 工程师 | Skill 开发、ContextAssembler、Agent 重构 | Task #5-7: AI 架构重构 |

### 1.2 团队协作模式

```
team-lead (协调)
    ↓
    ├─→ backend-specialist (API + Skills)
    ├─→ data-specialist (Story Bible)
    ├─→ frontend-specialist (编辑器 + UI)
    └─→ ai-specialist (AI 架构)
```

---

## 二、任务分配

### Phase 0: 基础修复（已完成部分）

| 任务 | 负责人 | 状态 | 优先级 |
|------|--------|------|--------|
| ✅ P0-1: 编辑器服务端保存 | frontend-specialist | completed | P0 |
| 🔄 P0-2: 接通 Skills API | backend-specialist | pending | P0 |
| ✅ 错误处理完善 | ui-specialist | completed | P0 |
| 🔄 安全基线修复 | security-specialist | in_progress | P0 |

### Phase 1: Story Bible 数据结构

| 任务 | 负责人 | 状态 | 依赖 |
|------|--------|------|------|
| ✅ P1-1: Story Bible Schema | data-specialist | completed | - |
| 🔄 P1-2: Story Bible 自动聚合 | data-specialist | pending | P0-2 |

### Phase 2: ContextAssembler + Skill 自描述

| 任务 | 负责人 | 状态 | 依赖 |
|------|--------|------|------|
| 🔄 P2-1: 扩展 Skill 接口 | ai-specialist | pending | P0-2 |
| 🔄 P2-2: ContextAssembler | ai-specialist | pending | P0-2, P2-1 |

### Phase 3: 新增 Skills

| 任务 | 负责人 | 状态 | 依赖 |
|------|--------|------|------|
| 🔄 P3-1: 新增 3 个 MVP Skills | ai-specialist | pending | P2-1, P2-2 |

### Phase 4: 编辑器 AI 集成

| 任务 | 负责人 | 状态 | 依赖 |
|------|--------|------|------|
| 🔄 P4-1: 编辑器内联 AI | frontend-specialist | pending | P3-1 |

### Phase 5: Dashboard 数据聚合

| 任务 | 负责人 | 状态 | 依赖 |
|------|--------|------|------|
| 🔄 P5-1: Dashboard 真实数据 | data-specialist | pending | - |

---

## 三、关键路径分析

### 3.1 阻塞链

```
P0-2 (Skills API)
  ↓
P1-2 (Story Bible 聚合)
  ↓
P2-1 (Skill 接口扩展)
  ↓
P2-2 (ContextAssembler)
  ↓
P3-1 (新增 Skills)
  ↓
P4-1 (编辑器内联 AI)
```

**关键路径**: P0-2 是最大阻塞点，必须优先完成。

### 3.2 并行任务

以下任务可以并行开发：
- P0-2 (Skills API) + 安全基线修复
- P1-2 (Story Bible 聚合) + P5-1 (Dashboard 数据)
- P2-1 + P2-2 可以部分并行（接口设计 → 实现）

---

## 四、团队启动计划

### 4.1 立即启动的任务

**优先级 P0 - 必须立即完成**:

1. **backend-specialist**: Task #2 - 接通 Skills API
   - 补全 `POST /api/ai/skills` handler
   - 修复 Skill.sendMessage bug
   - 确保 3 个 Skill 可通过 API 调用
   - 预计时间: 2-3 小时

2. **security-specialist**: Task #9 - 安全基线修复（继续）
   - Cookie 签名
   - API 验证
   - 预计时间: 1-2 小时

### 4.2 第二批任务（P0 完成后）

**优先级 P1**:

3. **data-specialist**: Task #4 - Story Bible 自动聚合
   - 实现聚合逻辑
   - 集成到各模块保存 API
   - 预计时间: 3-4 小时

4. **data-specialist**: Task #11 - Dashboard 真实数据（并行）
   - 聚合项目统计
   - 实现真实数据查询
   - 预计时间: 2-3 小时

### 4.3 第三批任务（P1 完成后）

**优先级 P2**:

5. **ai-specialist**: Task #5 - 扩展 Skill 接口
   - 添加 requiredContext
   - 添加 inputSchema/outputSchema
   - 预计时间: 2-3 小时

6. **ai-specialist**: Task #6 - ContextAssembler
   - 实现智能上下文组装
   - 集成 Story Bible
   - 预计时间: 4-5 小时

### 4.4 第四批任务（P2 完成后）

**优先级 P3**:

7. **ai-specialist**: Task #7 - 新增 3 个 MVP Skills
   - 一致性检查 Skill
   - 节奏分析 Skill
   - 人物生成 Skill
   - 预计时间: 6-8 小时

8. **frontend-specialist**: Task #8 - 编辑器内联 AI
   - 选中文本工具栏
   - 命令面板
   - 智能续写
   - 预计时间: 5-6 小时

---

## 五、团队协作规范

### 5.1 沟通机制

- **每日同步**: 每个 Agent 完成任务后向 team-lead 报告
- **阻塞上报**: 遇到阻塞立即通知 team-lead
- **代码审查**: 关键功能由 team-lead 审查后合并

### 5.2 代码规范

- 遵循 `CLAUDE.md` 中的开发规范
- 使用统一错误处理 (`lib/errors/api-error.ts`)
- 符合设计系统 (`docs/design/ui-design-system.md`)
- 所有 API 使用 TypeScript 类型定义

### 5.3 文档要求

- 每个任务完成后创建报告：`docs/reports/tasks/YYYY-MM-DD-task-xxx.md`
- 重要决策记录到 `.claude/decisions.json`
- 更新 PRD 相关章节（如有功能变更）

---

## 六、成功指标

### 6.1 Phase 0 完成标准

- ✅ 编辑器可保存内容
- ✅ 错误处理完善
- ⏳ Skills API 可调用
- ⏳ 安全基线修复完成

### 6.2 Phase 1 完成标准

- ⏳ Story Bible 自动聚合
- ⏳ Dashboard 显示真实数据

### 6.3 Phase 2 完成标准

- ⏳ Skill 接口支持 requiredContext
- ⏳ ContextAssembler 正常工作
- ⏳ Token 使用量降低 50%+

### 6.4 Phase 3 完成标准

- ⏳ 新增 3 个 MVP Skills
- ⏳ 所有 Skills 可通过 API 调用

### 6.5 Phase 4 完成标准

- ⏳ 编辑器内联 AI 可用
- ⏳ 用户可在编辑器中直接使用 AI

---

## 七、风险管理

### 7.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Skills API 集成复杂 | 阻塞后续开发 | backend-specialist 优先处理 |
| ContextAssembler 性能问题 | AI 响应慢 | 实现缓存机制 |
| 编辑器 AI 集成复杂 | 用户体验差 | 分阶段实现，先简单后复杂 |

### 7.2 进度风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 任务依赖链长 | 整体进度慢 | 识别可并行任务 |
| Agent 阻塞 | 资源浪费 | team-lead 及时调度 |

---

## 八、下一步行动

### 立即执行

1. **team-lead**: 启动 backend-specialist 和 security-specialist
2. **backend-specialist**: 开始 Task #2 - 接通 Skills API
3. **security-specialist**: 继续 Task #9 - 安全基线修复

### 准备工作

4. **data-specialist**: 准备 Task #4 的技术方案
5. **ai-specialist**: 准备 Task #5-7 的技术方案
6. **frontend-specialist**: 准备 Task #8 的技术方案

---

**让团队，高效协作** ✨
