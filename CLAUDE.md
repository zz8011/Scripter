# Scripter 项目 Claude 配置

> **版本**: v1.0
> **更新日期**: 2026-01-24
> **项目**: 剧灵 (Scripter) - AI 剧本创作平台

---

## 核心指导原则

### 1. PRD 是开发的唯一权威来源

**Scripter 项目以 PRD v2.5 为核心指导文档**。

在执行任何开发任务前:
1. **优先阅读** `docs/prd/prd-v2.5.md` 了解功能需求
2. **引用而非复制** - PRD 中的技术/设计/商业部分引用独立文档
3. **遵循单一真相来源** - 不在多处重复定义同一内容

### 2. 文档引用关系

```
PRD v2.5 (功能需求)
    ├─→ 产品定位: docs/product-positioning.md (仅引用)
    ├─→ 商业模式: docs/business-model.md (仅引用)
    ├─→ 风险分析: docs/risk-analysis.md (仅引用)
    ├─→ 技术栈: docs/tech/tech-stack.md (仅引用)
    ├─→ 数据模型: docs/tech/data-model.md (仅引用)
    ├─→ 实施计划: docs/plans/plan-sprint-mvp.md (仅引用)
    └─→ 设计系统: docs/design/ui-design-system.md (仅引用)
```

**关键规则**:
- ✅ PRD 中引用其他文档时,使用明确的引用标记
- ✅ 被引用文档更新时,评估是否需要更新 PRD
- ❌ 不要在 PRD 中复制技术栈/数据模型/设计规范的详细内容

### 3. 开发工作流

遵循 **科学开发工作流** (`docs/guides/scientific-dev-workflow.md`):

```
1. 计划阶段 (/plan)
   ├─ 阅读 PRD 相关章节
   ├─ 理解功能需求
   └─ 制定实施计划

2. 执行阶段 (/tdd)
   ├─ 先写测试
   ├─ 实现功能
   └─ 实时验证

3. 验证阶段 (/verify)
   ├─ 运行所有测试
   ├─ 检查代码质量
   └─ 确认符合 PRD

4. 改进阶段 (/code-review)
   ├─ 使用 code-review agent
   └─ 持续优化
```

### 4. 上下文管理

Scripter 项目使用**智能上下文管理系统**来提升开发效率，解决 Claude Code 长期记忆限制。

#### 核心功能

| 功能 | 描述 | 效果 |
|------|------|------|
| **智能记忆加载** | 会话开始时自动分层加载项目记忆 | 减少重复解释 60-70% |
| **上下文注入** | 根据任务智能匹配相关文档 | Token 使用效率提升 30-40% |
| **阶段追踪** | 自动检测会话阶段 | 智能压缩建议 |
| **决策记录** | 自动识别并记录技术决策 | 完整的决策历史 |
| **会话总结** | 自动生成结构化报告 | 信息不丢失 |
| **并行同步** | 多 Agent 上下文共享 | 降低冲突率 |

#### CLI 工具

```bash
# 上下文管理
node scripts/context-manager.js status    # 查看状态
node scripts/context-manager.js snapshot  # 保存快照
node scripts/context-manager.js cleanup   # 清理旧数据
node scripts/context-manager.js report    # 生成报告

# 并行开发
node scripts/sync-parallel-context.js init       # 初始化
node scripts/sync-parallel-context.js update     # 更新进度
node scripts/sync-parallel-context.js check      # 检查冲突
node scripts/sync-parallel-context.js merge-plan # 合并计划
```

#### 数据文件

```
.claude/
├── memory.json           # 项目记忆
├── session-state.json    # 会话状态
├── decisions.json        # 决策记录
└── shared-context.json   # 并行共享上下文
```

#### 详细文档

- 📖 [上下文管理指南](docs/guides/context-management-guide.md)
- 📖 [并行开发指南](docs/guides/parallel-context-sync.md)

### 5. UI 开发规范

UI 组件开发 **必须遵循设计系统**:

1. **阅读设计上下文**: `docs/design/.claude/design-context.md`
2. **使用设计令牌**: 颜色、间距、圆角等按规范使用
3. **组件选择**: 优先使用 shadcn/ui 组件
4. **验证一致性**: 开发后检查是否符合设计系统

**核心色彩**:
```css
--nav-bg: #1A1A1A;       /* 导航栏：深黑色 */
--brand-gold: #C9A962;   /* 品牌金色 */
--paper-bg: #F5F1E8;     /* 背景：米色 */
--text-primary: #1A1A1A; /* 主文字 */
```

### 6. 技术决策

**技术栈已确定** (`docs/tech/tech-stack.md`):

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js 14+ | App Router |
| ORM | Drizzle ORM | 高性能、Edge 支持 |
| 认证 | Casdoor | 独立部署 |
| AI | 智谱 GLM-4.7 | 成本优化 |

**不要**:
- ❌ 提议更换技术栈(除非有充分理由并更新 tech-stack.md)
- ❌ 使用未在技术栈中的库/框架(必要时先讨论)

### 7. 数据模型

**严格遵循数据模型定义** (`docs/tech/data-model.md`):

- 实体结构
- 字段类型
- 关系定义
- 索引策略

**修改数据模型前**:
1. 更新 `data-model.md`
2. 评估迁移成本
3. 编写迁移脚本
4. 更新 PRD 引用版本(如影响功能定义)

### 8. 文档更新工作流

当被引用文档更新时:

```
1. 识别更新类型
   ├─ 版本号更新 → 仅更新 PRD 中的版本引用
   ├─ 核心内容变化 → 评估影响,可能需要更新 PRD
   └─ 错误修正 → 无需更新 PRD

2. 更新 PRD 版本历史
   └─ 记录引用文档的版本变更
```

详见: `docs/guides/scientific-dev-workflow.md` → "📚 文档引用更新工作流"

### 9. 开发报告管理

**所有开发过程中的报告必须统一存放到 `docs/reports/` 目录**。

#### 文件夹结构

```
docs/reports/
├── sessions/        # 会话总结报告
├── tasks/           # 任务完成报告
├── analysis/        # 分析报告
├── reviews/         # 代码审查报告
├── progress/        # 进度报告
└── archive/         # 归档的旧报告
```

#### 命名规则

**格式**: `YYYY-MM-DD-[type]-[short-title]-v{version}.md`

| 部分 | 说明 | 示例 |
|------|------|------|
| `YYYY-MM-DD` | 报告日期 | `2026-01-24` |
| `[type]` | 报告类型 | `session` / `task` / `analysis` / `review` / `progress` |
| `[short-title]` | 简短标题(kebab-case) | `user-auth` / `ui-design-system` |
| `v{version}` | 版本号(如需要) | `v1` / `v2` |

**示例**:
```
2026-01-24-session-initial-project-setup.md
2026-01-24-task-auth-integration-v2.md
2026-01-24-analysis-performance-issues.md
2026-01-24-review-pr-123.md
2026-01-24-progress-sprint-1-week-2.md
```

#### 报告类型说明

| 类型 | 用途 | 触发时机 | 存放位置 |
|------|------|---------|---------|
| **session** | 会话总结 | SessionEnd hook 自动生成 | `docs/reports/sessions/` |
| **task** | 任务完成 | 完成一个功能/任务后 | `docs/reports/tasks/` |
| **analysis** | 问题分析 | 遇到问题需要深入分析时 | `docs/reports/analysis/` |
| **review** | 代码审查 | 代码审查后 | `docs/reports/reviews/` |
| **progress** | 进度报告 | 定期(周/月)或里程碑 | `docs/reports/progress/` |

#### 报告内容模板

```markdown
# [报告标题]

> **类型**: [session/task/analysis/review/progress]
> **日期**: YYYY-MM-DD
> **作者**: [Claude/用户名]
> **相关任务/PR**: [链接]

## 📋 执行摘要

[1-3 句话总结本报告的核心内容]

## 背景

[为什么需要这份报告]

## 内容

### [章节 1]
...

### [章节 2]
...

## 结论与建议

- [结论 1]
- [结论 2]

## 后续行动

- [ ] [待办事项 1]
- [ ] [待办事项 2]

## 相关文档

- [文档 1](链接)
- [文档 2](链接)
```

#### 自动化

**SessionEnd hook** 已配置自动生成会话总结:
- 保存到 `docs/reports/sessions/YYYY-MM-DD-session-{auto-id}.md`
- 包含会话摘要、完成任务、决策记录

#### 归档策略

- **保留期**: 所有报告永久保留
- **归档**: 超过 6 个月的旧报告移至 `archive/`
- **索引**: 在 `docs/reports/README.md` 中维护报告索引

#### 查找报告

```bash
# 按日期查找
ls docs/reports/sessions/ | grep "2026-01-"

# 按类型查找
ls docs/reports/tasks/

# 搜索关键词
grep -r "关键词" docs/reports/
```

---

## 常用命令速查

### 计划与实现
```bash
/plan [功能描述]        # 进入计划阶段
/tdd [功能描述]         # 测试驱动开发
/verify                 # 验证阶段
/code-review            # 代码审查
```

### UI 开发
```bash
"阅读 docs/design/.claude/design-context.md"
"描述你要实现的组件的视觉效果"
/tdd 实现[组件名]
"检查是否符合设计系统"
```

### 文档操作
```bash
# 读取 PRD
"请阅读 docs/prd/prd-v2.5.md"

# 读取特定章节
"请阅读 PRD 中关于[功能]的部分"

# 查询技术细节
"请查看 docs/tech/tech-stack.md 中的[技术]决策"
```

---

## 文件组织

```
docs/
├── prd/prd-v2.5.md              # ⭐ 核心指导文档
├── product-positioning.md       # 产品定位(权威)
├── business-model.md            # 商业模式(权威)
├── risk-analysis.md             # 风险分析(权威)
├── tech/
│   ├── tech-stack.md            # 技术栈(权威)
│   └── data-model.md            # 数据模型(权威)
├── design/
│   ├── ui-design-system.md      # 设计系统(权威)
│   └── .claude/design-context.md # 设计速查
├── guides/
│   └── scientific-dev-workflow.md # 开发工作流
├── reports/
│   ├── sessions/                 # 会话总结（自动生成）
│   ├── tasks/                    # 任务完成报告
│   ├── analysis/                 # 分析报告
│   ├── reviews/                  # 代码审查报告
│   ├── progress/                 # 进度报告
│   └── README.md                 # 报告索引
└── plans/
    └── plan-sprint-mvp.md       # 实施计划
```

---

## 品牌语调

**剧灵的品牌语调**: 专业、温暖、鼓励、陪伴

- 使用"我们"而非"你们"
- 避免过度技术化的术语
- 强调"创作伙伴"而非"AI 工具"
- 金句: "剧灵，一支懂你的笔"

---

## 安全注意事项

### API 密钥
- ❌ **禁止**将 API 密钥提交到代码库
- ✅ 使用环境变量 (`.env.local`)
- ✅ 参考历史教训: `docs/.archive/findings-legacy.md`

### 数据验证
- 所有用户输入必须验证
- 遵循 OWASP 安全最佳实践
- Server Actions 中添加权限检查

---

**最后更新**: 2026-01-24
**维护者**: Scripter Team

> 💡 **提示**: 本文件是项目级的 Claude Code 配置。会话开始时请优先阅读本文档以了解项目规范。
