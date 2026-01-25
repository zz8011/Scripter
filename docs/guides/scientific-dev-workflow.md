# 剧灵 (Scripter) - 科学开发工作流 v2.0

> 基于 Claude Code + everything-claude-code + superpowers 的完整项目开发流程
> 集成上下文优化、并行开发、记忆持久化等高级能力

---

## 🎯 核心理念

```
开发 = 计划 + 执行 + 验证 + 改进
     ↓        ↓        ↓        ↓
   /plan    /tdd    /verify  /code-review
     ↓        ↓        ↓        ↓
  上下文优化 + 并行开发 + 记忆持久化
```

---

## 📊 工作流总览

### 五个核心阶段（新增准备阶段）

```mermaid
准备阶段 → 计划阶段 → 执行阶段 → 验证阶段 → 改进阶段
   ↓         ↓         ↓         ↓         ↓
加载记忆   /plan     /tdd    /verify  /code-review
恢复上下文  专注      测试      循环      审查
   ↓         ↓         ↓         ↓         ↓
策略性压缩 并行Agent  TodoWrite  全面测试  质量把关
```

### 对应的工具和 Agent

| 阶段 | 命令/工具 | Agent | Skill | 新增能力 |
|------|----------|-------|-------|---------|
| **准备** | 加载记忆 | - | - | 记忆持久化 |
| **计划** | `/plan` | planner, architect | superpowers:writing-plans | 并行规划 |
| **执行** | `/tdd` | - | superpowers:test-driven-development | Task 并行 |
| **验证** | `/verify` | - | superpowers:verification-before-completion | 全面测试 |
| **改进** | `/code-review` | code-reviewer | pr-review-toolkit:review-pr | PR 审查 |

---

## 🔄 阶段 0：准备（Preparation）⭐ 新增

**目标**：恢复上下文，避免重复解释

### 步骤 1：加载项目记忆

```bash
# 新会话开始时，告诉 Claude
"请阅读以下文件了解项目状态：
- .claude/templates/session-context.md
- docs/progress.md
- .claude/memory.json"
```

### 步骤 2：明确本次会话目标

```bash
"本次会话目标：实现剧灵生辰八字系统"
"范围：包括八字生成、性格映射、诗号生成"
"预计时间：2小时"
```

### 步骤 3：创建任务清单

```bash
# 使用 TodoWrite 工具
"创建任务清单：
1. 研究八字算法
2. 实现八字生成器
3. 实现性格映射
4. 实现诗号生成
5. 集成测试"
```

### 记忆持久化配置

已配置的 Hooks 会自动：
- 会话开始时：加载 `.claude/memory.json`
- 会话结束时：保存会话摘要
- 工具调用时：提示策略性压缩

---

## 📋 阶段 1：计划（Plan）

**目标**：明确要做什么，怎么做

### 基础用法

```bash
# 使用场景 1：新功能开发
/plan 实现剧灵生辰八字系统

# 使用场景 2：架构决策
/plan 如何设计剧本导出系统的架构

# 使用场景 3：问题修复
/plan 修复 AI 流式响应中断的问题
```

### 并行规划 ⭐ 新增

```javascript
// 识别可并行的子任务
"规划以下任务的并行执行：
- 八字生成算法
- 性格映射系统
- 诗号生成器

请分析：
1. 哪些任务可以并行？
2. 任务间的依赖关系？
3. 需要预定义哪些接口？"
```

### 计划文档化

```bash
# 将计划写入文件
"将实施计划保存到 docs/plans/YYYY-MM-DD-bazi-system.md"

# 计划内容应包括：
- 功能描述
- 技术方案
- 实施步骤
- 接口定义
- 验收标准
```

### 使用 superpowers 规划

```bash
# 使用 brainstorming 技能
"使用 superpowers:brainstorming 探索生辰八字系统的设计"

# 使用 writing-plans 技能
"使用 superpowers:writing-plans 编写详细实施计划"
```

---

## 🚀 阶段 2：执行（Execute）

**目标**：高效实现功能

### 串行执行（传统方式）

```bash
# 启动 TDD 工作流
/tdd 实现场景拖拽排序功能
```

### 并行执行 ⭐ 新增（推荐）

#### 方式一：Task 工具并行

```javascript
// 同时启动 3 个 Agent 并行工作
[
  Task({
    subagent_type: "general-purpose",
    prompt: "实现八字生成算法，参考 config/agents-config.yaml",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "实现性格映射系统，五行对应性格特征",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "实现诗号生成器，基于角色性格",
    run_in_background: true
  })
]
```

#### 方式二：Git Worktree 并行

```bash
# 1. 创建并行工作环境
.\scripts\parallel-dev-setup.ps1 -TaskName juling-system -Count 3

# 2. 在不同终端启动 Claude Code
# 终端 1: cd ../scripter-task-1; claude-code
# 终端 2: cd ../scripter-task-2; claude-code
# 终端 3: cd ../scripter-task-3; claude-code

# 3. 分配独立任务
# 终端 1: "实现八字生成算法"
# 终端 2: "实现性格映射系统"
# 终端 3: "实现诗号生成器"

# 4. 逐个合并结果
git checkout main
git merge feature/juling-system-task-1
git merge feature/juling-system-task-2
git merge feature/juling-system-task-3
```

#### 方式三：专业 Agent 并行

```javascript
// 使用专业化的 Agent
Task({
  subagent_type: "ui-component-agent",
  prompt: "实现八字输入界面，符合设计系统"
})

Task({
  subagent_type: "ai-integration-agent",
  prompt: "集成 GLM-4.7 API 进行性格分析"
})

Task({
  subagent_type: "data-agent",
  prompt: "设计八字数据存储模型"
})
```

### TDD 循环

```
┌─────────────────────────────────────┐
│ 1. RED（编写失败测试）               │
│    - 定义接口                        │
│    - 编写测试用例                    │
│    - 运行测试（应该失败）            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 2. GREEN（实现最小代码）             │
│    - 编写最少代码使测试通过          │
│    - 运行测试（应该通过）            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 3. REFACTOR（重构优化）              │
│    - 清理代码                        │
│    - 优化性能                        │
│    - 确保测试仍通过                  │
└─────────────────────────────────────┘
```

### 任务跟踪

```bash
# 使用 TodoWrite 跟踪进度
"更新任务状态：
- ✅ 八字生成算法
- 🔄 性格映射系统（进行中）
- ⏳ 诗号生成器（待开始）"
```

---

## ✅ 阶段 3：验证（Verify）

**目标**：确保功能正确工作

### 基础验证

```bash
# 运行验证循环
/verify
```

**验证内容：**
1. ✅ 所有测试通过
2. ✅ 构建成功（npm run build）
3. ✅ 无 TypeScript 错误
4. ✅ 无 ESLint 警告
5. ✅ 功能实际可用（手动测试）

### 全面验证 ⭐ 新增

```bash
# 使用 verification-before-completion 技能
"使用 superpowers:verification-before-completion 进行全面验证"

# 验证包括：
- 功能完整性
- 代码质量
- 性能测试
- 安全检查
- 设计系统一致性
```

### 并行验证

```javascript
// 同时运行多个验证任务
[
  Task({
    subagent_type: "general-purpose",
    prompt: "运行所有单元测试并生成报告",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "检查构建状态和类型错误",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "验证设计系统一致性",
    run_in_background: true
  })
]
```

---

## 🔍 阶段 4：改进（Improve）

**目标**：提升代码质量

### 代码审查

```bash
# 运行代码审查
/code-review
```

### PR 审查 ⭐ 新增

```bash
# 使用 PR 审查工具
"使用 pr-review-toolkit:review-pr 审查当前变更"

# 或创建 PR 后审查
gh pr create --title "feat: 生辰八字系统" --body "..."
"使用 pr-review-toolkit:review-pr 审查 PR #123"
```

### 多维度审查

| 检查项 | 工具 | 说明 |
|--------|------|------|
| **代码质量** | code-reviewer | 可读性、可维护性 |
| **安全性** | security-review | XSS、注入等 |
| **性能** | performance | 渲染性能、内存 |
| **最佳实践** | react-best-practices | React/Next.js 模式 |
| **设计一致性** | design-context | UI 设计系统 |

---

## 💾 上下文管理最佳实践 ⭐ 新增

### 策略性压缩

**原则**：在逻辑断点手动压缩，而非依赖自动压缩

```bash
# ✅ 什么时候压缩
- 探索阶段结束，开始实施前
- 完成一个里程碑后
- 从研究转向编码时
- 重大决策确定后

# ❌ 什么时候不压缩
- 调试进行中
- 多文件编辑中间
- 需要上下文连贯的任务

# 压缩前先保存
"总结当前进度到 docs/progress.md，然后使用 /compact"
```

### 记忆持久化

```bash
# 保存重要决策
"将技术决策记录到 docs/tech/decisions.md"

# 更新进度
"更新 docs/progress.md 中的完成状态"

# 保存 API 设计
"将 API 设计保存到 docs/tech/api-spec.md"
```

### 文档化优先

```
原则：计划写文件，上下文留窗口

❌ 不好的做法：
"记住我所有的要求..."
"就像我之前说的..."

✅ 好的做法：
"阅读 docs/prd/2026-01-23-scripter-prd-v2.4.md"
"参考 docs/design/.claude/design-context.md"
```

---

## 🎬 典型开发场景

### 场景 A：开发新功能（串行）

```bash
# 1. 准备阶段
"阅读 docs/progress.md 了解项目状态"
"创建任务清单：实现生辰八字系统"

# 2. 计划阶段
/plan 实现剧灵生辰八字系统

# 3. 执行阶段
/tdd 实现生辰八字系统

# 4. 验证阶段
/verify

# 5. 改进阶段
/code-review

# 6. 提交代码
git add .
git commit -m "feat: 添加生辰八字系统"
```

### 场景 B：开发新功能（并行）⭐ 推荐

```bash
# 1. 准备阶段
"阅读 docs/progress.md 和 parallel-quick-ref.md"

# 2. 并行规划
"规划生辰八字系统的并行实现：
- Task 1: 八字生成算法（独立）
- Task 2: 性格映射系统（依赖 Task 1）
- Task 3: 诗号生成器（依赖 Task 1）
- Task 4: UI 界面（独立）"

# 3. 创建 Worktree
.\scripts\parallel-dev-setup.ps1 -TaskName juling -Count 3

# 4. 并行执行
# 终端 1-3 分别启动 Claude Code，执行各任务

# 5. 合并结果
git checkout main
git merge feature/juling-task-1
git merge feature/juling-task-2
git merge feature/juling-task-3

# 6. 全面验证
/verify

# 7. 清理
.\scripts\parallel-dev-cleanup.ps1 -All
```

### 场景 C：快速原型（Task 并行）

```javascript
// 使用 Task 工具快速并行
[
  Task({
    subagent_type: "general-purpose",
    prompt: "实现剧本编辑器基础UI",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "实现格式检查功能",
    run_in_background: true
  }),
  Task({
    subagent_type: "general-purpose",
    prompt: "实现人物管理CRUD",
    run_in_background: true
  })
]

// 等待完成后合并
```

---

## 📈 效率对比

| 开发方式 | 时间 | 适用场景 |
|---------|------|---------|
| **传统串行** | 6h | 简单功能、学习探索 |
| **TDD 串行** | 5h | 需要高质量代码 |
| **Task 并行** | 2h | 独立功能（3x 提升）|
| **Worktree 并行** | 2.5h | 大型功能、完全隔离 |

---

## 🛠️ 工具和脚本

### 自动化脚本

| 脚本 | 功能 |
|------|------|
| `scripts/parallel-dev-setup.ps1` | 创建 Git Worktree |
| `scripts/parallel-dev-cleanup.ps1` | 清理 Worktree |

### Hooks 配置

| Hook | 触发时机 | 功能 |
|------|---------|------|
| `memory-persistence.js` | 会话开始/结束 | 加载/保存记忆 |
| `strategic-compact.js` | 工具调用时 | 提示压缩时机 |
| `session-summary.js` | 会话结束时 | 保存会话摘要 |

---

## 📚 最佳实践

### 1. 选择合适的开发方式

```
简单任务 → 串行 TDD
独立功能 → Task 并行
大型功能 → Git Worktree 并行
专业任务 → 专业 Agent
```

### 2. 上下文管理原则

```
✅ 文档化优先
✅ 策略性压缩
✅ 记忆持久化
✅ 明确会话目标

❌ 依赖自动压缩
❌ 重复解释背景
❌ 无限增长上下文
```

### 3. 并行开发原则

```
✅ 任务独立
✅ 接口预定义
✅ 文件分配
✅ 定期同步

❌ 循环依赖
❌ 共享状态
❌ 频繁通信
```

---

## 🔧 故障排查

### 上下文丢失

```bash
# 症状：Claude 忘记之前的内容
# 解决：使用记忆持久化
"阅读 .claude/memory.json 和 docs/progress.md"
```

### Agent 冲突

```bash
# 症状：多个 Agent 修改同一文件
# 解决：使用 Git Worktree 隔离
git worktree add ../scripter-task-1 feature/task-1
git worktree add ../scripter-task-2 feature/task-2
```

### 合并冲突

```bash
# 症状：git merge 时冲突
# 解决：
git checkout main
git merge feature/task-1  # 逐个合并
# 解决冲突后
git merge feature/task-2
```

---

## 📚 文档引用更新工作流

### 引用关系概述

Scripter 项目采用**单一真相来源 (Single Source of Truth)** 模式:

| 内容类型 | 权威来源 | PRD 处理方式 |
|---------|---------|-------------|
| 产品定位 | `product-positioning.md` | ✅ 仅引用，不重复 |
| 商业模式 | `business-model.md` | ✅ 仅引用，不重复 |
| 风险分析 | `risk-analysis.md` | ✅ 仅引用，不重复 |
| 技术栈 | `tech/tech-stack.md` | ✅ 仅引用，不重复 |
| 数据模型 | `tech/data-model.md` | ✅ 仅引用，不重复 |
| 实施计划 | `plans/plan-sprint-mvp.md` | ✅ 仅引用，不重复 |
| 功能需求 | PRD 本身 | ✅ 完整定义 |
| UI 设计 | `design/ui-design-system.md` | ✅ 仅引用，不重复 |

### 更新工作流程

当被引用文档更新时，按以下步骤处理:

```
1. 识别更新类型
   ├─ 类型 A: 版本号更新（无实质内容变化）
   ├─ 类型 B: 核心内容变化
   └─ 类型 C: 错误修正/补充说明

2. 评估影响范围
   ├─ 是否影响 PRD 中的功能定义？
   ├─ 是否影响其他引用此文档的内容？
   └─ 是否需要通知相关开发人员？

3. 决定行动
   ├─ 仅更新版本号引用
   ├─ 更新 PRD 相关内容并升级版本
   └─ 无需更新 PRD（仅文档完善）

4. 执行更新
   ├─ 更新 PRD 中的引用版本号
   ├─ 如有内容变化，更新相关章节
   └─ 更新 PRD 版本历史记录
```

### 场景示例

**场景 1: 技术栈版本更新**
```
变化: tech-stack.md 从 v1.0 → v1.0.1（修正排版，无实质变化）
行动: PRD 中更新版本号引用，无需升级 PRD 版本
```

**场景 2: 产品定位核心变更**
```
变化: product-positioning.md 修改目标用户定位
影响: PRD 中功能优先级需调整
行动: 更新 PRD 相关章节，升级 PRD 版本号
```

**场景 3: 数据模型字段修正**
```
变化: data-model.md 修正字段描述错误
影响: 不影响 PRD 功能定义
行动: 无需更新 PRD
```

### 自动化建议

在 `.claude/hooks/` 中添加 pre-commit 检查:

```yaml
# .claude/hooks/PreToolUse
# 检查 PRD 引用版本是否与实际文档版本一致

when:
  tool: Write
  file_matches:
    - "docs/prd/*.md"

validate: |
  # 检查引用的文档版本是否最新
  # 提示用户确认是否需要更新
```

### 最佳实践

| ✅ DO | ❌ DON'T |
|-------|---------|
| 在 PRD 中仅引用，不复制权威文档内容 | 在 PRD 中重复定义技术栈/数据模型 |
| 权威文档更新时评估对 PRD 的影响 | 忽略引用文档的更新 |
| 使用清晰的引用标记和链接 | 直接复制粘贴内容导致漂移 |
| 在 PRD 版本历史中记录引用更新 | 静默更新引用，不记录变更 |

---

## 📁 项目文件命名规范

### 命名原则

| 原则 | 说明 | 示例 |
|------|------|------|
| **语义化** | 文件名应清晰表达内容 | `prd.md` 而非 `doc1.md` |
| **版本化** | 使用统一版本号管理 | `v2.5` 而非 `final-v2` |
| **小写化** | 全部使用小写字母 | `prd.md` 而非 `PRD.md` |
| **连字符** | 使用连字符分隔单词 | `tech-design.md` |

### 核心文件命名

| 类型 | 格式 | 示例 |
|------|------|------|
| **PRD** | `prd-v{major}.{minor}.md` | `prd-v2.5.md` |
| **设计文档** | `{category}-{name}-v{ver}.md` | `ui-design-system-v4.6.md` |
| **技术文档** | `{category}-{name}.md` | `tech-architecture.md` |
| **计划文档** | `plan-{date}-{name}.md` | `plan-2026-01-24-sprint-1.md` |
| **配置文件** | `{purpose}-config.{ext}` | `dev-config.yaml` |

### 版本管理规则

**格式**: `v{major}.{minor}`

| 版本类型 | 示例 | 说明 |
|---------|------|------|
| **Major** | v2.0 → v3.0 | 重大变更、架构调整 |
| **Minor** | v2.4 → v2.5 | 新功能、重要更新 |

**PRD 版本示例**:
```
v1.0 → v2.0 → v2.1 → v2.2 → v2.3 → v2.4 → v2.5
```

### 文件迁移规则

**新建文件**:
- 使用新命名规范
- 更新文档内相互引用

**重命名旧文件**:
- 添加 `-legacy` 后缀保留历史版本
- 更新所有引用链接

### 速查表

| 废弃格式 | 正确格式 |
|---------|---------|
| `2026-01-22-scripter-prd-v2.2.md` | `prd-v2.2-legacy.md` |
| `scripter-prd-v2.4.md` | `prd-v2.4-legacy.md` |
| `prd-final.md` | `prd-v2.5.md` |

> 📖 **完整规范**: 参见 [文件命名规范](file-naming-convention.md)

---

## 📖 延伸阅读

- **文件命名规范**：`docs/file-naming-convention.md`
- **上下文优化**：`docs/claude-code-optimization-guide.md`
- **并行开发**：`docs/parallel-development-guide.md`
- **快速参考**：`.claude/templates/parallel-quick-ref.md`
- **设计系统**：`docs/design/.claude/design-context.md`
- **API 规范**：`docs/tech/api-spec.md`

---

## 🔗 资源链接

- **Claude Code 官方**: [docs.claude.com](https://code.claude.com/docs/en/costs)
- **everything-claude-code**: [GitHub](https://github.com/affaan-m/everything-claude-code)
- **superpowers**: [GitHub](https://github.com/obra/superpowers)
- **并行开发实战**: [Medium](https://medium.com/@lorenzozar/use-git-worktree-to-run-multiple-claude-code-agents-a1d47ef972d5)

---

**让灵感，在代码中苏醒** ✨
**让效率，在并行中绽放** 🚀

**最后更新**: 2026-01-24
**版本**: v2.1
