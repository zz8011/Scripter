# Scripter 产品需求文档 PRD v2.7

> **版本**: v2.7
> **创建日期**: 2026-01-24
> **更新日期**: 2026-02-08
> **状态**: 生效

---

## ⚠️ 重要：文档引用与更新规范

**本文档采用"完全引用"模式 - 避免重复定义，确保单一真相来源**

### 引用关系

| 内容类型 | 权威来源 | 本文档处理方式 |
|---------|---------|---------------|
| 产品定位 | `product-positioning.md` | ✅ 仅引用，不重复 |
| 商业模式 | `business-model.md` | ✅ 仅引用，不重复 |
| 风险分析 | `risk-analysis.md` | ✅ 仅引用，不重复 |
| 技术栈 | `tech/tech-stack.md` | ✅ 仅引用，不重复 |
| 数据模型 | `tech/data-model.md` | ✅ 仅引用，不重复 |
| 实施计划 | `plans/plan-sprint-mvp.md` | ✅ 仅引用，不重复 |
| 功能需求 | 本文档 | ✅ 完整定义 |
| 验收标准 | 本文档 | ✅ 完整定义 |
| 成功指标 | 本文档 | ✅ 完整定义 |

### 🔄 更新工作流（重要！）

**当被引用的文档更新时，本文档需要同步更新引用版本号，但不重复内容。**

```
被引用文档更新
    ↓
1. 检查是否影响 PRD 内容
    ↓
2. 如不影响 PRD 功能定义 → 仅更新版本号
3. 如影响 PRD 功能定义 → 更新 PRD 并升级版本号
    ↓
更新本文档的文档导航中的版本号
```

**示例**：
- `tech/tech-stack.md` 从 v1.0 → v1.1（仅增加技术说明）
  → PRD 不变，仅更新引用版本号
- `product-positioning.md` 从 v1.0 → v2.0（核心定位变更）
  → PRD 需要评估影响，可能升级到 v2.8

---

## 📋 文档导航

| 文档 | 版本 | 说明 |
|------|------|------|
| **[产品定位](../product-positioning.md)** | v1.0 | **产品定位、愿景、核心价值（权威来源）** |
| **[商业模式](../business-model.md)** | v1.0 | **定价策略、收入预测（权威来源）** |
| **[风险分析](../risk-analysis.md)** | v1.0 | **风险分析与应对（权威来源）** |
| **[技术栈](../tech/tech-stack.md)** | v1.1 | **技术选型（权威来源）** |
| **[数据模型](../tech/data-model.md)** | v1.0 | **数据结构定义（权威来源）** |
| **[实施计划](../plans/plan-sprint-mvp.md)** | v2.1 | **Sprint 清单（权威来源）** |
| **[AI 架构重构计划](../plans/plan-ai-architecture-v2.md)** | v1.0 | **AI 系统重构实施计划（权威来源）** |
| **[项目评估报告](../reports/analysis/2026-02-08-analysis-project-evaluation.md)** | - | **2026-02-08 综合评估** |
| **PRD v2.7（本文档）** | v2.7 | **功能需求与验收标准（完整定义）** |
| [PRD v2.6](prd-v2.6-legacy.md) | v2.6 | 评估驱动修正版 |
| [PRD v2.5](prd-v2.5-legacy.md) | v2.5 | 综合整合版 + 引用模式 |
| [PRD v2.4](prd-v2.4-legacy.md) | v2.4 | 剧灵生辰八字系统版 |
| [PRD 变更日志](prd-changelog.md) | - | 完整版本历史 |

> ⚠️ **重要提示**：产品定位、商业模式、风险分析、技术栈、数据模型、实施计划等定义见独立文档。本文档专注功能需求与验收标准。

---

## 一、产品概述

### 1.1 产品定位（引用）

> ⚠️ **产品定位的完整定义请参阅**：[产品定位文档 v1.0](../product-positioning.md)

本文档不重复定义产品定位。产品定位、愿景、核心价值、目标用户等定义详见产品定位文档。

**快速链接**：
- [产品定位](../product-positioning.md#一产品定位)
- [产品愿景](../product-positioning.md#二产品愿景)
- [核心理念](../product-positioning.md#三核心理念)
- [目标用户](../product-positioning.md#四目标用户)
- [核心价值](../product-positioning.md#五核心价值主张)

### 1.2 PRD v2.7 范围

本文档定义 Scripter 的**功能需求**和**实现方案**，包括：

| 章节 | 内容 | 状态 |
|------|------|------|
| 功能需求 | 六大功能模块详细定义 | ✅ |
| AI 架构 | 能力注册制 + Story Bible | ✅ v2.7 重构 |
| 安全需求 | 安全基线与验收标准 | ✅ |
| 技术栈 | 技术选型和架构 | ✅ 已修正 |
| 数据模型 | 核心实体定义 | ✅ 已扩展 |
| 验收标准 | 功能和非功能性标准 | ✅ 已修正 |
| 商业模式 | 定价和收入预测 | ✅ |
| 实施计划 | Sprint 规划 + AI 架构重构计划 | ✅ 已扩展 |

### 1.3 创作流程

```mermaid
graph LR
    A[灵感捕捉] --> B[世界观设定]
    B --> C[人物创建]
    C --> D[剧本写作]
    D --> E[场景管理]
    E --> F[AI 优化]
    F --> G[导出制作]

    style A fill:#F5F1E8,stroke:#C9A962
    style F fill:#F5F1E8,stroke:#C9A962,stroke-width:4px
    style G fill:#F5F1E8,stroke:#C9A962,stroke-width:4px
```

---

## 二、功能需求

### 2.1 功能模块架构

```
Scripter
├── 创作空间 (Creative Space)
│   ├── 剧本编辑器 (Script Editor)
│   │   ├── TipTap 富文本编辑
│   │   ├── 实时格式检查
│   │   ├── 段落拖拽排序
│   │   ├── 服务端自动保存          ← MVP 必须
│   │   └── 版本管理               ← MVP 后
│   └── 阅读模式 (Reader Mode)     ← MVP 后
│       ├── 沉浸式阅读视图
│       └── AI 分析注释
│
├── AI 辅助系统 (AI Assistant)              ← v2.7 架构重构
│   ├── 剧灵系统 (Juling)
│   │   ├── 生辰八字性格
│   │   ├── 五行说话风格
│   │   ├── 诗号生成
│   │   └── 自定义名称
│   ├── Story Bible（项目知识库）           ← v2.7 新增
│   │   ├── 世界规则（从世界观自动聚合）
│   │   ├── 人物档案（从人物管理自动聚合）
│   │   ├── 剧情大纲（从场景自动聚合）
│   │   └── 创作意图（从项目设置聚合）
│   ├── 能力注册制 (Skill Registry)         ← v2.7 重构
│   │   ├── Skill 自描述接口（requiredContext）
│   │   ├── ContextAssembler（智能上下文组装）
│   │   └── 统一 Skill 执行入口
│   ├── 编辑类 Skills (editing)
│   │   ├── 格式修复 (format-fix)          ← MVP
│   │   ├── 对白润色 (dialogue-polish)     ← MVP
│   │   └── 人性化 (humanize)              ← MVP
│   ├── 分析类 Skills (analysis)
│   │   ├── 节奏分析 (rhythm-analyze)      ← MVP
│   │   └── 一致性检查 (consistency-check) ← MVP
│   ├── 生成类 Skills (generation)
│   │   ├── 场景扩展 (scene-expand)        ← MVP
│   │   ├── 人物生成 (character-generate)  ← 第二阶段
│   │   └── 场景生成 (scene-generate)      ← 第二阶段
│   ├── 知识类 Skills (knowledge)           ← v2.7 新增
│   │   ├── 网络搜索 (web-search)          ← 第二阶段
│   │   ├── 类型参考 (genre-reference)     ← 第二阶段
│   │   ├── 术语查询 (terminology-lookup)  ← 第二阶段
│   │   └── 文化研究 (cultural-research)   ← 第二阶段
│   ├── 审阅类 Skills (review)              ← v2.7 新增
│   │   └── 剧本诊断 (script-doctor)       ← 第二阶段（编排多个 Skill）
│   ├── 交互方式
│   │   ├── 对话式交互（侧栏）             ← MVP
│   │   ├── 编辑器内联 AI（选中文本触发）   ← MVP
│   │   ├── 命令面板（/ 触发）             ← 第二阶段
│   │   └── 智能续写（灰色预览）           ← 第二阶段
│   └── 对话模式
│       ├── 对话式 - 自由交流       ← MVP
│       ├── 共创式 - 轮流创作       ← 第二阶段
│       └── 反馈式 - 建议优化       ← 第二阶段
│
├── 项目管理 (Project Management)
│   ├── 控制台 (Dashboard)
│   │   ├── 项目概览（真实数据聚合）
│   │   ├── 今日字数统计
│   │   └── 最近编辑项目
│   ├── 项目创建向导
│   └── 创作进度追踪
│
├── 创作资源 (Creative Resources)
│   ├── 人物管理 (Characters)
│   │   ├── 人物档案卡片
│   │   ├── AI 生成人设
│   │   ├── 诗号生成
│   │   └── 关系图谱
│   ├── 场景管理 (Scenes)
│   │   ├── 看板视图
│   │   ├── 拖拽排序
│   │   ├── 环境标签
│   │   └── 自动编号
│   ├── 世界观 (Worldview)
│   │   ├── 多维设定编辑
│   │   └── 结构化展示
│   └── 分镜 (Storyboard)
│       ├── 四栏排版
│       └── 运镜建议
│
├── 导出 (Export)
│   ├── 多格式导出
│   │   ├── PDF（标准）             ← MVP
│   │   ├── Word (.docx)           ← MVP
│   │   ├── 纯文本 (.txt)          ← MVP
│   │   ├── Fountain (.fountain)   ← MVP 后
│   │   └── PDF（纯图/防盗版）      ← MVP 后
│   └── 制作准备文档
│       ├── 角色清单
│       ├── 场景列表
│       └── 集长统计
│
├── 安全与错误处理 (Security & Error Handling)  ← v2.6 新增
│   ├── 会话安全（签名 Cookie）
│   ├── API 输入验证（Zod）
│   ├── 统一认证中间件
│   ├── 全局错误边界 (error.tsx)
│   └── 404 页面 (not-found.tsx)
│
└── 协作分享 (Collaboration)        ← 第三阶段
    ├── 链接分享
    └── 权限控制
```

### 2.2 MVP 功能范围

#### P0 必须功能（MVP 核心）

| 模块 | 功能 | 验收标准 | 优先级 |
|------|------|---------|--------|
| **Dashboard** | 项目概览、今日字数、最近编辑 | < 3 秒加载；显示最近 5 个项目；统计数据来自真实聚合 | P0 |
| **Editor** | A4 布局、段落拖拽、格式检查、**服务端保存** | 支持 4 种元素；格式检查准确率 ≥ 95%；内容可持久化到数据库 | P0 |
| **Characters** | 人物卡片、诗号生成 | 卡片流展示；AI 生成诗号 | P0 |
| **Scenes** | 看板管理、环境标签、拖拽排序 | 拖动调整顺序；自动重新编号 | P0 |
| **Worldview** | 多维设定、结构化编辑 | 时代/地理/阶层分类编辑 | P0 |
| **Storyboard** | 四栏排版、镜头类型 | 专业格式显示 | P0 |
| **AI 助手** | 剧灵八字系统、6 个 MVP Skills、Story Bible、ContextAssembler、对话式+内联交互 | AI 使用率 > 40%；流式响应；Skill 可通过 API 执行 | P0 |
| **导出** | PDF/Word/Text 导出 | 可分享可打印 | P0 |
| **安全基线** | Cookie 签名、API 输入验证、统一认证 | 无 P0 安全漏洞 | P0 |
| **错误处理** | 全局错误边界、404 页面 | 用户遇到错误有友好提示 | P0 |

#### P1 增强功能（MVP 期间尽量完成）

| 模块 | 功能 | 验收标准 | 优先级 |
|------|------|---------|--------|
| **Characters** | AI 生成人设、关系图谱 | AI 可生成完整人设；关系可视化 | P1 |
| **Editor** | 版本管理 | 版本对比/回滚 | P1 |
| **Dashboard** | 项目创建向导、搜索、排序 | 引导式创建流程 | P1 |
| **Storyboard** | AI 运镜建议 | 基于场景内容推荐镜头 | P1 |

#### MVP 验收标准

- ✅ 用户可以在 30 分钟内完成第一个剧本场景创作
- ✅ 编辑器内容可保存到服务端并可恢复
- ✅ AI 辅助功能使用率 > 40%
- ✅ 格式检查准确率 > 95%
- ✅ 无 P0 级安全漏洞
- ✅ 核心路径测试覆盖率 > 40%
- ✅ 获取 50 个种子用户，周活跃率 > 30%

### 2.3 AI 架构设计理念（v2.7 新增）

> 详细实施计划请参阅：[AI 架构重构计划 v1.0](../plans/plan-ai-architecture-v2.md)

#### 核心理念：能力注册制

**从"Agent 框架"转向"以创作为中心的能力注册制"**：

| 维度 | 旧架构（v2.6 及之前） | 新架构（v2.7） |
|------|---------------------|---------------|
| **上下文** | 统一截取前 2000 字符 | Skill 自描述所需上下文，ContextAssembler 精确组装 |
| **意图识别** | IntentRouter 关键词匹配 | 用户明确选择 Skill（工具栏/命令面板/对话） |
| **Agent 角色** | 独立调用 LLM | 编排多个 Skill，综合结果 |
| **扩展方式** | 修改 AgentManager 硬编码 | 新文件 + 一行注册 |
| **知识来源** | 仅当前文本 | Story Bible（世界规则+人物档案+剧情大纲） |
| **交互方式** | 仅侧栏对话 | 侧栏对话 + 编辑器内联 + 命令面板 |

#### Story Bible：AI 的"记忆"

Story Bible 是每个项目的结构化知识库，让 AI 能"理解"整个项目：

```
Story Bible
├── worldRules        ← 从世界观模块自动聚合
│   ├── era           时代背景摘要
│   ├── geography     地理环境摘要
│   ├── socialRules   社会规则摘要
│   └── constraints   世界观约束条件
├── characterProfiles ← 从人物管理自动聚合
│   ├── name, role, personality
│   ├── speechStyle, relationships
│   └── arc           人物弧光
├── plotOutline       ← 从场景管理自动聚合
│   ├── sceneNumber, summary
│   ├── characters    出场人物
│   └── plotPoints    关键剧情点
└── creativeIntent    ← 从项目设置聚合
    ├── genre, tone
    ├── themes
    └── targetAudience
```

#### Skill 自描述与 ContextAssembler

每个 Skill 声明自己需要什么上下文，ContextAssembler 按需组装：

```
对白润色 Skill:
  requiredContext: [currentScene, characterProfile]
  → ContextAssembler 只提供当前场景 + 说话人物的档案

一致性检查 Skill:
  requiredContext: [allCharacters, plotOutline, worldRules]
  → ContextAssembler 提供完整的人物列表 + 剧情大纲 + 世界规则

网络搜索 Skill:
  requiredContext: [creativeIntent, worldRules]
  → ContextAssembler 提供创作意图 + 世界观，用于关联搜索结果
```

#### Skill 分类体系

| 类别 | 说明 | MVP Skills | 第二阶段 Skills |
|------|------|-----------|----------------|
| **editing** | 编辑类 | format-fix, dialogue-polish, humanize | - |
| **analysis** | 分析类 | rhythm-analyze, consistency-check | continuity-checker, pacing-optimizer |
| **generation** | 生成类 | scene-expand | character-generate, scene-generate, co-write |
| **knowledge** | 知识类 | - | web-search, genre-reference, terminology-lookup |
| **review** | 审阅类 | - | script-doctor（编排多个 Skill） |

### 2.4 分阶段规划

| 阶段 | 时间 | 核心功能 | 目标 |
|------|------|---------|------|
| **MVP** | 1-2 个月 | 基础编辑 + AI 辅助 | 验证核心价值 |
| **第二阶段** | 2-3 个月 | AI 共创 + 完整场景生成 | 提升创作效率 |
| **第三阶段** | 3-4 个月 | 实时协作 + AI 图片生成 | 团队协作 |
| **第四阶段** | 按需启动 | 团队工作区 + 移动端 | 生态完善 |

---

## 三、技术栈（引用）

> ⚠️ **完整的技术栈定义、选型对比、架构设计请参阅**：[技术栈文档 v1.1](../tech/tech-stack.md)

### 3.1 技术栈概要

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Next.js 15.x | App Router, SSR/SSG |
| **UI 组件** | shadcn/ui + Tailwind CSS 4 | 纸质主题 (#F5F1E8 + #C9A962) |
| **编辑器** | TipTap 2.x | 无头设计、高度可定制 |
| **状态管理** | Zustand 5.x | 轻量级客户端状态管理 |
| **AI 文本** | 智谱 GLM-4 系列 | 国产大模型、成本降低 95%+（当前使用 GLM-4-plus） |
| **AI 图片** | T8Star (nano-banana-2) | 专业图片生成服务（第二阶段） |
| **数据库 ORM** | Drizzle ORM | 高性能、SQL 透明、Edge 支持 |
| **数据库** | PostgreSQL 15+ | 关系型数据库 |
| **认证** | Casdoor | 独立部署、可视化管理、SSO |
| **拖拽** | @dnd-kit/core | 现代化拖拽库 |
| **测试** | Vitest + Playwright | 单元测试 + E2E 测试 |

### 3.2 关键技术决策

| 决策 | 选择 | 核心理由 |
|------|------|---------|
| **ORM** | Drizzle vs Prisma | 性能更好、包体积小、Edge 支持 |
| **认证** | Casdoor vs NextAuth.js | 企业级功能、可视化管理 |
| **AI 模型** | 智谱 GLM-4 系列 | 成本降低 95%+、中文优化、国内合规 |
| **编辑器** | TipTap | 无头设计、剧本扩展成熟、支持协作 |
| **状态管理** | Zustand | 轻量、无 boilerplate、支持 SSR |
| **测试框架** | Vitest | 与 Vite 生态一致、速度快、兼容 Jest API |

> 💡 **详细的技术选型对比、架构设计、部署方案请参阅**：[技术栈文档](../tech/tech-stack.md)

---

## 四、数据模型（引用）

> ⚠️ **完整的数据模型定义、实体关系、Schema 设计请参阅**：[数据模型文档 v1.0](../tech/data-model.md)

### 4.1 核心实体概要

```typescript
// 核心实体
Project           // 项目
Character         // 人物（含诗号、关系）
Scene             // 场景（含 TipTap JSON 内容）
WorldviewItem     // 世界观设定
Storyboard        // 分镜
AIConversation    // AI 对话历史
JulingConfig      // 剧灵配置（八字性格）
CreativeMilestone // 创作里程碑
User              // 用户（含配额）
StoryBible        // 项目知识库（v2.7 新增）
```

### 4.2 关键数据结构

**Story Bible (v2.7 新增)**：
- 项目级结构化知识库，AI 的"记忆"
- 从人物/世界观/场景自动聚合
- 包含：世界规则、人物档案、剧情大纲、创作意图
- 支持增量更新，编辑任何模块时自动同步

**项目 (Project)**：
- 支持多种剧本类型（电影/长剧/短剧）
- 支持横竖屏方向
- 阶段追踪（世界观 → 人物 → 剧本 → 优化 → 制作）

**人物 (Character)**：
- 诗号生成
- 性格标签、说话风格、行为模式
- 人物关系图谱

**场景 (Scene)**：
- TipTap JSON 格式存储
- 时长估算
- 集数/场景编号

> 💡 **完整的字段定义、实体关系图、数据库 Schema、索引策略请参阅**：[数据模型文档](../tech/data-model.md)

---

## 五、验收标准

### 5.1 功能验收标准

| 功能 | 验收标准 | 优先级 |
|------|---------|--------|
| **控制台** | < 3 秒加载；显示最近 5 个项目；统计数据来自真实聚合 | P0 |
| **编辑器** | 支持 4 种元素；实时格式检查准确率 ≥ 95%；A4 布局；**内容可保存到服务端** | P0 |
| **拖动** | 场景拖动自动重新编号；段落拖动显示金色指示线 | P0 |
| **人物** | 卡片流展示；诗号生成 | P0 |
| **世界观** | 多维设定编辑；结构化展示 | P0 |
| **分镜** | 四栏排版；镜头类型选择 | P0 |
| **AI 助手** | SkillRegistry 统一执行；6 个 Skill；流式响应；Story Bible 自动聚合 | P0 |
| **导出** | PDF/Word/Text 导出 | P0 |
| **安全** | Cookie 签名；API 输入验证；统一认证中间件 | P0 |
| **错误处理** | 全局 error.tsx；not-found.tsx；API 错误友好提示 | P0 |

### 5.2 非功能性验收标准

| 指标 | 目标 | 优先级 |
|------|------|--------|
| **首屏加载** | < 2 秒 | P0 |
| **编辑器响应** | < 100ms | P0 |
| **正常运行时间** | > 99% | P0 |
| **兼容性** | Chrome/Edge/Safari 最新版 | P1 |
| **安全** | 会话 Cookie 签名/加密；所有 API 输入 Zod 验证；统一 `withAuth` 认证；数据加密传输；AI 配额控制 | P0 |
| **测试覆盖** | MVP 核心路径 > 40%（认证、CRUD、编辑器保存） | P1 |

### 5.3 AI 功能验收标准

| 指标 | 目标 | 阶段 |
|------|------|------|
| AI 对话深度 | 平均 > 5 轮/次 | MVP |
| AI 建议采纳率 | > 30% | MVP |
| 格式检查准确率 | ≥ 95% | MVP |
| MVP Skills 数量 | 6 个（格式修复、对白润色、场景扩展、节奏分析、一致性检查、人性化） | MVP |
| Skill 可通过 API 执行 | POST /api/ai/skill 返回结构化结果 | MVP |
| Story Bible 自动聚合 | 编辑人物/世界观/场景后自动更新 | MVP |
| ContextAssembler 精确上下文 | Token 使用量相比固定截取降低 30%+ | MVP |
| 知识类 Skill 可用 | 网络搜索、类型参考至少 1 个可用 | 第二阶段 |
| Agent 编排可用 | 剧本诊断编排 3+ 个 Skill | 第二阶段 |
| 编辑器内联 AI | 选中文本可触发 AI 操作 | MVP |

### 5.4 AI 架构验收标准（v2.7 新增）

| 指标 | 目标 | 阶段 |
|------|------|------|
| Skill 自描述 | 所有 Skill 包含 requiredContext 声明 | MVP |
| 新增 Skill 成本 | 添加新 Skill = 新文件 + 一行注册 | MVP |
| Story Bible 覆盖率 | 项目的人物/世界观/场景数据 100% 聚合 | MVP |
| 上下文精确度 | ContextAssembler 只提供 Skill 声明的上下文 | MVP |
| 扩展性验证 | 成功添加 1 个知识类 Skill 验证架构 | 第二阶段 |

---

## 5.5 安全需求（v2.6 新增）

> 基于 2026-02-08 项目评估发现的 P0 安全问题，明确安全基线要求。

### 5.5.1 会话安全

| 要求 | 说明 | 优先级 |
|------|------|--------|
| Cookie 签名/加密 | 使用 `iron-session` 或 `jose` 对会话 Cookie 进行签名，防止伪造 | P0 |
| HTTPS 强制 | 生产环境强制 HTTPS，Cookie 设置 `Secure` 和 `HttpOnly` 标志 | P0 |
| 会话过期 | 设置合理的会话过期时间，支持 Token 刷新 | P1 |

### 5.5.2 API 安全

| 要求 | 说明 | 优先级 |
|------|------|--------|
| 输入验证 | 所有 POST/PATCH/PUT API 使用 Zod Schema 验证请求体 | P0 |
| 统一认证 | 所有 API 路由使用 `withAuth` 中间件包装，禁止手动调用 `getSession` | P0 |
| 速率限制 | AI 相关 API 实施速率限制，防止滥用 | P1 |
| CSRF 防护 | 表单提交和状态变更 API 添加 CSRF Token | P1 |

### 5.5.3 数据安全

| 要求 | 说明 | 优先级 |
|------|------|--------|
| 敏感信息管理 | API 密钥、数据库密码等仅通过环境变量管理，禁止硬编码 | P0 |
| Git 历史检查 | 确认 `.env.local` 等敏感文件未被提交到 Git 历史 | P0 |
| 数据隔离 | 用户只能访问自己的项目数据，API 层强制 userId 过滤 | P0 |

### 5.5.4 错误处理

| 要求 | 说明 | 优先级 |
|------|------|--------|
| 全局错误边界 | `app/error.tsx` 捕获未处理异常，显示友好错误页面 | P0 |
| 404 页面 | `app/not-found.tsx` 提供友好的 404 提示 | P0 |
| API 错误格式 | 统一 API 错误响应格式 `{ error: string, details?: object }` | P1 |
| 错误日志 | 生产环境接入 Sentry 或类似服务进行错误追踪 | P2 |

---

## 六、商业模式（引用）

> ⚠️ **完整的商业模式定义请参阅**：[商业模式文档 v1.0](../business-model.md)

本文档不重复定义商业模式。定价策略、收入预测、成本预算等详见商业模式文档。

**快速链接**：
- [定价策略](../business-model.md#一定价策略)
- [收入预测](../business-model.md#二收入预测)
- [成本预算](../business-model.md#三成本预算)
- [竞争分析](../business-model.md#六竞争分析)

---

## 七、风险分析（引用）

> ⚠️ **完整的风险分析请参阅**：[风险分析文档 v1.0](../risk-analysis.md)

本文档不重复定义风险分析。技术、产品、商业风险的详细分析见风险分析文档。

**快速链接**：
- [风险矩阵](../risk-analysis.md#一风险矩阵)
- [技术风险](../risk-analysis.md#二技术风险)
- [产品风险](../risk-analysis.md#三产品风险)
- [商业风险](../risk-analysis.md#四商业风险)
- [应对策略](../risk-analysis.md#七应急预案)

---

## 八、成功指标

### 8.1 产品指标

| 指标 | 目标 | 时间框架 |
|------|------|---------|
| **注册用户** | 1,000 | 6 个月 |
| **付费转化率** | 5% | 6 个月 |
| **周活跃率** | 30% | 3 个月 |
| **完成率** | 20% 完成第一部剧本 | 6 个月 |

### 8.2 质量指标

| 指标 | 目标 |
|------|------|
| 格式符合率 | ≥ 95% |
| 时长准确率 | ≥ 90% |
| 场景生成时间 | ≤ 2 分钟 |

---

## 九、实施计划（引用）

> ⚠️ **完整的 Sprint 计划、任务清单、里程碑定义请参阅**：[实施计划文档](../plans/plan-sprint-mvp.md)
> ⚠️ **AI 架构重构的详细实施计划请参阅**：[AI 架构重构计划 v1.0](../plans/plan-ai-architecture-v2.md)

### 9.1 开发阶段概要

> ⚠️ **注意**：Sprint 计划文档 (`plan-sprint-mvp.md`) 中部分内容需要同步更新：
> - 文档导航引用的 "PRD v2.3" 应更新为 "PRD v2.7"
> - Week 10 测试框架应从 "Jest" 更正为 "Vitest"
> - Week 7 智谱 SDK 安装命令应更正为直接 fetch 调用（项目未使用 zhipu-sdk 包）
> - Week 7-8 AI 集成部分应参照 AI 架构重构计划执行

```
Sprint 1-2: 基础架构 (Week 1-2)
    ├─ 项目初始化
    ├─ UI 配置
    ├─ 认证系统 (Casdoor)
    └─ 数据库 (Drizzle + PostgreSQL)

Sprint 3-6: 核心模块 (Week 3-6)
    ├─ Dashboard + Editor（含服务端保存）
    ├─ Characters + Scenes
    ├─ Worldview + Storyboard
    ├─ 拖拽功能集成
    └─ 安全基线（Cookie 签名、API 验证、error.tsx）

Sprint 7-8: AI 集成 (Week 7-8)                ← v2.7 重构
    ├─ 智谱 GLM-4 系列集成
    ├─ 剧灵八字系统
    ├─ Story Bible 数据结构 + 自动聚合
    ├─ ContextAssembler 实现
    ├─ Skill 自描述接口 + SkillRegistry 接入 API
    ├─ 6 个 MVP Skills（含 requiredContext）
    └─ 编辑器内联 AI 交互

Sprint 9-10: MVP 收尾 (Week 9-10)
    ├─ 导出功能
    ├─ 核心路径测试（Vitest + Playwright）
    ├─ 安全审查
    └─ 部署准备
```

### 9.2 AI 架构重构阶段（v2.7 新增）

> 详细计划请参阅：[AI 架构重构计划 v1.0](../plans/plan-ai-architecture-v2.md)

```
Phase 0: 基础修复（前置条件）
    ├─ 编辑器服务端保存
    └─ 接通 Skills API

Phase 1: Story Bible 数据结构
    ├─ Story Bible Schema 设计
    └─ 自动聚合机制

Phase 2: ContextAssembler + Skill 自描述
    ├─ 扩展 Skill 接口（requiredContext）
    └─ 实现 ContextAssembler

Phase 3: 知识类 Skill（验证可扩展性）
    ├─ 网络搜索 Skill
    └─ 类型参考 Skill

Phase 4: Agent 编排层
    ├─ Agent 重构为 Skill 编排者
    └─ ScriptDoctor 编排多个 Skill

Phase 5: AI 嵌入创作流程
    ├─ 编辑器内联 AI
    ├─ 人物页面 AI 增强
    └─ 场景页面 AI 增强
```

### 9.3 关键里程碑

| 里程碑 | 时间 | 验收标准 |
|--------|------|---------|
| **M1: 基础架构完成** | Week 2 | 可运行的空壳项目 |
| **M2: 六大页面可用** | Week 6 | 所有核心页面可操作 |
| **M3: AI 功能可用** | Week 8 | Story Bible 聚合正常；6 个 Skill 可通过 API 执行；ContextAssembler 工作正常 |
| **M4: MVP 完成** | Week 10 | 所有 MVP 功能就绪 |

> 💡 **详细的任务分解、时间估算、依赖关系、风险评估请参阅**：[实施计划文档](../plans/plan-sprint-mvp.md)

---

## 十、相关文档

### 核心文档（权威来源）
- **[产品定位](../product-positioning.md)** - 产品定位、愿景、核心价值
- **[商业模式](../business-model.md)** - 定价策略、收入预测
- **[风险分析](../risk-analysis.md)** - 风险分析与应对

### 技术文档（权威来源）
- **[技术栈](../tech/tech-stack.md)** - 技术选型、对比分析
- **[数据模型](../tech/data-model.md)** - 数据结构、实体关系
- **[技术设计文档](../tech/tech-design.md)** - 技术架构
- **[API 规范](../tech/api-spec.md)** - API 端点定义
- **[编辑器设计](../tech/editor-design.md)** - TipTap 编辑器定制

### 设计文档
- [UI 设计系统](../design/ui-design-system.md) - 完整视觉设计规范
- [v4 实现指南](../design/v4-implementation-guide.md) - 开发实现参考
- [AI 伙伴交互设计](../design/ai-partner-interaction-design.md) - 剧灵八字系统
- [行为记录系统设计](../design/behavior-tracking-design.md) - 行为记录详细设计

### 执行文档
- **[实施计划](../plans/plan-sprint-mvp.md)** - Sprint 清单
- **[AI 架构重构计划](../plans/plan-ai-architecture-v2.md)** - AI 系统重构实施计划
- [文件命名规范](../file-naming-convention.md) - 项目文件管理

### 其他 PRD 版本
- [PRD 变更日志](prd-changelog.md)
- [PRD v2.6](prd-v2.6-legacy.md) - 评估驱动修正版
- [PRD v2.5](prd-v2.5-legacy.md) - 综合整合版 + 引用模式
- [PRD v2.4](prd-v2.4-legacy.md) - 剧灵生辰八字系统版
- [PRD v2.2](prd-v2.2-legacy.md) - 编剧伙伴版

### 评估报告
- [项目综合评估报告 2026-02-08](../reports/analysis/2026-02-08-analysis-project-evaluation.md) - v2.6 更新依据

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v2.7 | 2026-02-08 | **AI 架构重构版**: 将 AI 系统从"Agent 框架 + 意图路由"重构为"能力注册制 + Story Bible"。新增 Story Bible 项目知识库概念；新增 ContextAssembler 智能上下文组装；Skill 接口扩展 requiredContext 自描述；废弃 IntentRouter 关键词匹配；Agent 重定义为 Skill 编排者；新增知识类 Skill 分类（网络搜索、类型参考等）；新增编辑器内联 AI 交互方式；新增 AI 架构重构实施计划引用；更新 AI 验收标准 |
| v2.6 | 2026-02-08 | **评估驱动修正版**: 基于项目综合评估修正 18 项问题。修正技术栈版本（Next.js 15.x、GLM-4-plus、Tailwind CSS 4、Vitest）；新增安全需求章节（Cookie 签名、API 验证、错误处理）；重新划分 MVP/后续功能边界（协作分享移至第三阶段、不打扰原则/相关性判断移至第二阶段）；明确 6 个 MVP Skills；修正 Dashboard 加载时间标准；新增编辑器服务端保存为 P0 验收标准；调整测试覆盖率目标为核心路径 40%；新增 Zustand 状态管理到技术栈 |
| v2.5 | 2026-01-24 | **综合整合版 + 引用模式**: 平衡产品功能与实现，采用完全引用模式，技术栈/数据模型/实施计划引用独立文档，添加文档更新工作流提示 |
| v2.4 | 2026-01-23 | 剧灵生辰八字系统版：统一剧灵设计、八字性格、不打扰交互 |
| v2.3 | 2026-01-23 | 优化整合版：重新结构、补充验收标准 |
| v2.2 | 2026-01-23 | 编剧伙伴版：产品愿景升级，AI 是伙伴而非工具 |
| v2.1 | 2026-01-23 | 技术栈更新：Drizzle ORM + Casdoor + GLM-4.7 |
| v2.0 | 2026-01-23 | 精简优化版 |
| v1.0 | 2026-01-22 | 初始版本 |

---

**让灵感，在剧本中苏醒** ✨

**AI 不是工具，而是创作搭档** 🤝

**让创作，更高效专业** 🚀
