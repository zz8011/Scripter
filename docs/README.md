# Scripter 文档中心

> **版本**: v1.0
> **更新日期**: 2026-01-24
> **状态**: 生效

---

## 📚 文档结构

```
docs/
├── 📄 核心文档（权威来源）
│   ├── product-positioning.md    # 产品定位声明
│   ├── business-model.md          # 商业模式
│   ├── risk-analysis.md           # 风险分析
│   ├── file-naming-convention.md  # 文件命名规范
│   └── README.md                 # 文档中心索引
│
├── 📋 prd/                        # 产品需求文档
│   ├── prd-v2.5.md               # 当前版本（功能需求）
│   ├── prd-v2.4-legacy.md        # 历史版本
│   ├── prd-v2.2-legacy.md
│   ├── prd-v2.1-legacy.md
│   ├── prd-v1.0-legacy.md
│   ├── prd-archive.md            # 早期版本归档
│   ├── prd-changelog.md          # PRD 变更日志
│   └── README.md                 # PRD 目录说明
│
├── 🎨 design/                    # 设计文档
│   ├── ui-design-system.md       # UI 设计系统
│   ├── v4-implementation-guide.md # v4 实现指南
│   ├── ai-partner-interaction-design.md # AI 伙伴交互设计
│   ├── behavior-tracking-design.md     # 行为记录系统设计
│   ├── design-implementation-bridge.md # 设计实现精准对齐方案
│   ├── .claude/                  # 设计系统速查
│   │   └── design-context.md
│   ├── ref/                      # 参考文档
│   │   ├── 剧灵·品牌标识规范.md
│   │   ├── 剧灵-图标设计语言.md
│   │   └── 完整设计系统应用指南.md
│   └── prototypes/               # 原型设计
│       └── v5/
│
├── 🔧 tech/                      # 技术文档
│   ├── tech-design.md            # 技术设计文档
│   ├── api-spec.md               # API 规范
│   ├── editor-design.md           # 编辑器设计
│   ├── export-system.md           # 导出系统设计
│   ├── component-conventions.md   # 组件规范
│   ├── decisions.md              # 技术决策历史
│   └── migration-plan-drizzle-casdoor.md # 迁移计划
│
├── 📅 plans/                     # 开发计划
│   ├── plan-sprint-mvp.md        # MVP Sprint 计划（当前）
│   ├── 2026-01-23-*.md           # 早期计划（待整理）
│   └── [需要按新命名规范重命名]
│
├── 📖 guides/                    # 指南文档
│   ├── scientific-dev-workflow.md      # 科学开发工作流 v2.1
│   ├── claude-code-optimization-guide.md # Claude Code 优化指南
│   └── parallel-development-guide.md    # 并行开发指南
│
├── 📊 reports/                   # 开发报告
│   ├── sessions/                 # 会话总结（自动生成）
│   ├── tasks/                    # 任务完成报告
│   ├── analysis/                 # 分析报告
│   ├── reviews/                  # 代码审查报告
│   ├── progress/                 # 进度报告
│   ├── archive/                  # 归档报告（>6个月）
│   └── README.md                 # 报告索引
│
├── 🏢 brand/                     # 品牌文档
│   └── ju-ling-taglines.md       # 品牌金句集
│
└── 🗃️ .archive/                  # 归档文档
    ├── progress-legacy.md        # 历史进度记录
    ├── task-plan-legacy.md       # 旧版任务规划
    ├── findings-legacy.md        # 旧版研究发现（已移除API密钥）
    └── implementation-plan-legacy.md # 旧版实施计划
```

---

## 🗂️ 文档分类

### 一、核心文档（权威来源）

| 文档 | 用途 | 版本管理 |
|------|------|---------|
| **product-positioning.md** | 产品定位、愿景、核心价值 | 独立版本，高门槛 |
| **business-model.md** | 定价策略、收入预测、成本预算 | 独立版本，中门槛 |
| **risk-analysis.md** | 技术、产品、商业风险分析 | 独立版本，中门槛 |

**特点**：
- ✅ 单一真相来源
- ✅ 独立版本管理
- ✅ 其他文档引用，不重复定义

---

### 二、产品文档（PRD）

| 文档类型 | 命名格式 | 说明 |
|---------|---------|------|
| **当前版本** | `prd-v2.5.md` | 生效的 PRD |
| **历史版本** | `prd-v2.x-legacy.md` | 旧版本，保留参考 |
| **变更日志** | `prd-changelog.md` | 完整版本历史 |
| **归档** | `prd-archive.md` | 早期版本 |

**注意**：PRD 只关注功能需求，产品定位、商业模式、风险分析已分离。

---

### 三、设计文档

| 类别 | 文件 | 说明 |
|------|------|------|
| **设计系统** | `ui-design-system.md` | 完整视觉设计规范 |
| **实现指南** | `v4-implementation-guide.md` | 开发实现参考 |
| **交互设计** | `ai-partner-interaction-design.md` | AI 伙伴交互 |
| **系统设计** | `behavior-tracking-design.md` | 行为记录系统 |
| **设计速查** | `.claude/design-context.md` | 快速参考 |
| **品牌规范** | `ref/*.md` | 品牌、图标规范 |

---

### 四、技术文档

| 文档 | 说明 |
|------|------|
| **tech-design.md** | 技术架构总览 |
| **api-spec.md** | API 端点定义 |
| **editor-design.md** | TipTap 编辑器定制 |
| **export-system.md** | 导出系统设计 |
| **component-conventions.md** | 组件开发规范 |
| **decisions.md** | 技术决策历史 |
| **migration-plan-*.md** | 技术栈迁移计划 |

---

### 五、开发计划

| 文档 | 说明 |
|------|------|
| **plan-sprint-mvp.md** | MVP Sprint 计划（当前） |
| `2026-01-23-*.md` | 早期计划（待整理/归档） |

**待处理**：
- [ ] 重命名早期计划文件（按日期格式）
- [ ] 归档过时计划

---

### 六、指南文档

| 文档 | 说明 |
|------|------|
| **scientific-dev-workflow.md** | 科学开发工作流 v2.1 |
| **claude-code-optimization-guide.md** | Claude Code 优化指南 |
| **parallel-development-guide.md** | 并行开发指南 |
| **file-naming-convention.md** | 文件命名规范 |

### 七、开发报告

| 类型 | 说明 | 存放位置 |
|------|------|---------|
| **sessions** | 会话总结（SessionEnd 自动生成） | `reports/sessions/` |
| **tasks** | 任务完成报告 | `reports/tasks/` |
| **analysis** | 问题分析报告 | `reports/analysis/` |
| **reviews** | 代码审查报告 | `reports/reviews/` |
| **progress** | 进度报告 | `reports/progress/` |

**命名规则**: `YYYY-MM-DD-[type]-[short-title]-v{version}.md`

> 💡 **详细规范**: 参见 [报告索引](reports/README.md) 或项目根目录 `CLAUDE.md`

### 八、品牌文档

| 文档 | 说明 |
|------|------|
| **ju-ling-taglines.md** | 品牌金句集、标语、文案 |

### 九、归档文档

| 文档 | 说明 |
|------|------|
| **progress-legacy.md** | 历史会话日志（开发进度记录） |
| **task-plan-legacy.md** | 旧版7阶段规划（已被 plan-sprint-mvp.md 替代） |
| **findings-legacy.md** | 旧版研究发现（API密钥已移除，有价值内容已整合） |
| **implementation-plan-legacy.md** | 旧版实施计划（已被 plan-sprint-mvp.md 替代） |

> ⚠️ **归档文档仅供参考，不维护。当前版本请参考各分类下的最新文档。**

---

## 📋 待整理文件

以下文件需要处理：

| 文件 | 操作 |
|------|------|
| ~~`progress.md`~~ | ✅ 已归档到 `.archive/progress-legacy.md` |
| ~~`task_plan.md`~~ | ✅ 已归档到 `.archive/task-plan-legacy.md` |
| ~~`findings.md`~~ | ✅ 已归档到 `.archive/findings-legacy.md`（API密钥已移除） |
| ~~`implementation-plan.md`~~ | ✅ 已归档到 `.archive/implementation-plan-legacy.md` |
| ~~`design-implementation-bridge.md`~~ | ✅ 已移入 `design/` |
| ~~`scientific-dev-workflow.md`~~ | ✅ 已移入 `guides/` |
| ~~`claude-code-optimization-guide.md`~~ | ✅ 已移入 `guides/` |
| ~~`parallel-development-guide.md`~~ | ✅ 已移入 `guides/` |
| ~~`《我送君归去》剧本.txt`~~ | ✅ 已移入 `projects/sample-scripts/` |
| `prd/2026-01-22-scripter-prd-v2.0.md` | 已归档到 `prd-archive.md` |
| `plans/2026-01-23-*.md` | ⏳ 待重命名为 `plan-YYYY-MM-DD-*.md` |

---

## 🎯 统一文档格式

### 核心文档头部模板

```markdown
# Scripter [文档类型] 文档

> **版本**: v1.0
> **创建日期**: YYYY-MM-DD
> **状态**: 生效
> **变更门槛**: [高/中/低]（[团队]共识）

---

## 📋 文档说明

**本文档是 [文档类型] 的权威来源**

- ✅ [说明]
- ✅ [说明]
- ⚠️ **本文档变更需要 [条件]**
- 📌 **[说明]**

---
```

### PRD 头部模板

```markdown
# Scripter 产品需求文档 PRD v2.5

> **版本**: v2.5
> **创建日期**: YYYY-MM-DD
> **更新日期**: YYYY-MM-DD
> **状态**: 生效

---

## 📋 文档导航

| 文档 | 版本 | 说明 |
|------|------|------|
| **[产品定位](../product-positioning.md)** | v1.0 | **产品定位（权威来源）** |
| **[商业模式](../business-model.md)** | v1.0 | **商业模式（权威来源）** |
| **[风险分析](../risk-analysis.md)** | v1.0 | **风险分析（权威来源）** |
| **PRD v2.5（本文档）** | v2.5 | 功能需求与实现 |

> ⚠️ **重要提示**：产品定位、商业模式、风险分析等定义见独立文档。本文档专注功能需求。

---
```

### 技术文档头部模板

```markdown
# [技术文档标题]

> **版本**: v1.0
> **创建日期**: YYYY-MM-DD
> **最后更新**: YYYY-MM-DD
> **状态**: [draft/review/approved/deprecated]

---

## 📋 文档说明

本文档描述 [技术领域] 的 [内容]。

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | YYYY-MM-DD | 初始版本 |

---
```

---

## 🔄 文档引用关系

```
product-positioning.md ←←←← 单一真相来源
        ↑ 引用
        ├─→ PRD (只引用，不复制)
        ├─→ business-model.md (独立)
        ├─→ risk-analysis.md (独立)
        └─→ design/ (遵循定位)
```

---

## 📖 快速查找

### 按类型

| 想找什么 | 查看文档 |
|---------|---------|
| 产品定位是什么？ | `product-positioning.md` |
| 如何定价？ | `business-model.md` |
| 有什么风险？ | `risk-analysis.md` |
| 功能需求是什么？ | `prd/prd-v2.5.md` |
| 如何开发？ | `scientific-dev-workflow.md` |
| UI 怎么设计？ | `design/ui-design-system.md` |
| API 是什么？ | `tech/api-spec.md` |

### 按角色

| 角色 | 常用文档 |
|------|---------|
| **产品经理** | product-positioning.md, business-model.md, prd/ |
| **设计师** | design/, product-positioning.md (品牌语调) |
| **前端开发** | design/, tech/, scientific-dev-workflow.md |
| **后端开发** | tech/, business-model.md (成本控制) |
| **测试工程师** | prd/, tech/ |

---

## 📝 文档更新流程

### 创建新文档

```bash
1. 确定文档类型（核心文档/PRD/技术/设计）
2. 使用对应的头部模板
3. 按照文件命名规范命名
4. 更新本文档索引
```

### 更新核心文档

```bash
1. 创建新版本草稿
2. 团队评审
3. 发布新版本
4. 更新所有引用方的链接版本号（如需要）
```

---

## 🔗 外部参考

- **Claude Code 官方**: [docs.claude.com](https://code.claude.com/docs/en/costs)
- **everything-claude-code**: [GitHub](https://github.com/affaan-m/everything-claude-code)
- **superpowers**: [GitHub](https://github.com/obra/superpowers)

---

**最后更新**: 2026-01-24
**版本**: v1.0
**维护者**: Scripter Team
