# 剧灵 Scripter

> **剧灵，你的专属 AI 创作伙伴** — 生辰八字决定性格，静默观察不打扰

---

## 产品愿景

> **"让每个有故事的人都能成为编剧"**

剧灵是一个面向所有有创作梦想的人的 AI 编剧创作平台。通过深度集成的 AI 伙伴系统，我们帮助用户从灵感到成品，完成完整的剧本创作旅程。

### 核心理念

- 🤝 **AI 是创作伙伴，不是工具** — 共创而非替代
- 🌱 **创作民主化** — 消除技术门槛，让创意落地
- ✨ **硅基碳基共生** — 体验人机共创带来的全新可能

---

## 目标用户

| 用户类型 | 占比 | 核心需求 |
|---------|------|---------|
| **业余创作者** | 40% | 降低门槛、实现梦想 |
| **独立编剧** | 30% | 效率工具、专业提升 |
| **编剧新人** | 20% | 学习引导、快速入门 |
| **专业团队** | 10% | 协作、版本管理 |

---

## 核心功能

### 1. 创作空间 (Creative Space)

- **灵感捕捉** — 随手记、语音转文字
- **剧本编辑器** — TipTap 富文本、实时格式检查
- **阅读模式** — 沉浸式阅读、AI 注释

### 2. AI 创作伙伴 (剧灵 Juling)

#### 生辰八字系统
- 用户注册时间生成八字
- 五行性格决定说话风格
- 诗号生成
- 用户可自定义剧灵名字

#### 交互系统
- **不打扰原则** — 创作时静默观察
- **相关性判断** — 智能注入上下文
- **行为记录** — 全模块关键动作追踪

#### 原子化技能 (Skills)
- 格式修复、对白润色、场景扩展
- 节奏分析、一致性检查、人性化转换
- 集长计算

#### 对话模式
- 对话式 — 自由交流讨论
- 共创式 — 你一句我一句
- 反馈式 — 基于上下文的建议

### 3. 项目管理

- **仪表板** — 项目概览、进度追踪
- **项目创建向导** — 引导式设置
- **创作进度追踪** — 里程碑管理

### 4. 创作资源

- **人物管理** — 档案卡片、小传编辑、AI 生成人设
- **场景管理** — 看板视图、拖拽排序、环境标签
- **世界观** — 多维设定编辑、结构化展示
- **分镜** — 四栏排版、运镜建议

### 5. 导出与分享

- **多格式导出** — PDF/Word/Text/纯图PDF
- **制作准备文档** — 角色清单、场景列表
- **协作分享** — 链接分享、权限控制

---

## 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | Next.js | 14+ | App Router, SSR/SSG |
| **UI 组件** | shadcn/ui + Tailwind CSS | latest | 纸质主题 (#F5F1E8 + #C9A962) |
| **编辑器** | TipTap | latest | 无头设计、高度可定制 |
| **AI 文本** | 智谱 GLM-4.7 | - | 国产大模型、成本更低 |
| **AI 图片** | T8Star (nano-banana-2) | - | 专业图片生成服务 |
| **数据库 ORM** | Drizzle ORM | latest | 高性能、SQL 透明、Edge 支持 |
| **数据库** | PostgreSQL | 15+ | 关系型数据库 |
| **认证** | Casdoor | latest | 独立部署、可视化管理、SSO |
| **拖拽** | @dnd-kit/core | latest | 现代化拖拽库 |

### 技术选型说明

#### Drizzle ORM vs Prisma
- **性能**：Drizzle 快（无查询解析开销）
- **包大小**：~100KB vs ~3MB
- **Edge Runtime**：Drizzle 完全支持

#### Casdoor vs NextAuth.js
- **部署方式**：独立服务 vs 应用内集成
- **管理界面**：完整 Web UI vs 无
- **SSO**：内置 vs 需自建

#### 智谱 GLM-4.7 vs Vercel AI SDK
- **成本**：¥0.50/百万tokens vs $30/百万tokens（降低 95%+）
- **中文能力**：专门优化
- **国内合规**：合规

---

## 快速开始

### 前置要求

- Node.js 18+
- pnpm
- PostgreSQL 15+
- Casdoor（可选，用于认证）

### 安装

```bash
# 安装 pnpm（如果还没有）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 配置

```bash
# 复制环境变量模板
cp .env.example .env.local

# 配置数据库
DATABASE_URL=postgresql://user:password@localhost:5432/scripter

# 配置 AI API
ZHIPU_API_KEY=your_zhipu_api_key
T8STAR_API_KEY=your_t8star_api_key

# 配置 Casdoor（可选）
CASDOOR_ENDPOINT=http://localhost:8000
CASDOOR_CLIENT_ID=your_client_id
CASDOOR_CLIENT_SECRET=your_client_secret
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

### 构建

```bash
# 生产构建
pnpm build

# 预览生产构建
pnpm preview
```

---

## 项目结构

```
Scripter/
├── docs/                    # 项目文档
│   ├── design/             # 设计相关
│   │   └── .claude/        # 设计系统速查
│   ├── tech/               # 技术文档
│   │   ├── decisions.md    # 技术决策历史
│   │   └── component-conventions.md  # 组件规范
│   ├── prd/                # 产品需求文档
│   └── plans/              # 开发计划
├── config/                 # 配置文件
├── projects/               # 参考项目
├── .claude/                # Claude Code 配置
│   ├── agents/            # 自定义 Agent
│   ├── templates/         # 开发模板
│   └── settings.local.json # 插件配置
└── README.md              # 本文件
```

---

## 文档导航

### 产品文档
- [PRD v2.4 - 剧灵生辰八字系统版](docs/prd/2026-01-23-scripter-prd-v2.4.md)
- [PRD v2.2 - 编剧伙伴版](docs/prd/2026-01-22-scripter-prd-v2.2.md)

### 开发文档
- [科学开发工作流](docs/scientific-dev-workflow.md)
- [设计实现精准对齐方案](docs/design-implementation-bridge.md)
- [组件使用约定](docs/tech/component-conventions.md)
- [技术决策历史](docs/tech/decisions.md)

### 设计文档
- [UI 设计系统](docs/design/ui-design-system.md)
- [设计系统速查](docs/design/.claude/design-context.md)
- [品牌标识规范](docs/design/ref/剧灵·品牌标识规范.md)
- [AI 伙伴交互设计](docs/design/ai-partner-interaction-design.md)

### 技术文档
- [技术设计文档](docs/tech/tech-design.md)
- [API 规范](docs/tech/api-spec.md)
- [编辑器设计](docs/tech/editor-design.md)
- [导出系统设计](docs/tech/export-system.md)

---

## Claude Code 使用

### 插件配置

本项目已启用以下 Claude Code 插件：

- **everything-claude-code**：通用开发工作流
- **typescript-lsp**：TypeScript 语言服务

### 常用命令

```bash
# 计划阶段
/plan [功能描述]

# 执行阶段（TDD）
/tdd [功能描述]

# 验证阶段
/verify

# 改进阶段
/code-review
```

### UI 开发流程

```bash
# 1. 阅读设计系统
"请阅读 docs/design/.claude/design-context.md"

# 2. 确认理解
"请描述你要实现的组件的视觉效果"

# 3. 实现组件
/tdd 实现[组件名]

# 4. 验证
"检查是否符合设计系统"
```

---

## 开发规范

### Git 提交规范

```bash
feat: 新功能
fix: Bug 修复
refactor: 重构
style: 样式修改（不影响功能）
docs: 文档变更
test: 测试相关
chore: 构建/工具相关
```

### 分支策略

```
main（生产）
  ↑
  └── develop（开发）
        ↑
        ├── feature/*（功能分支）
        ├── fix/*（修复分支）
        └── refactor/*（重构分支）
```

---

## 验收标准

### MVP 验收标准

- ✅ 用户可以在 30 分钟内完成第一个剧本场景创作
- ✅ AI 辅助功能使用率 > 40%
- ✅ 格式检查准确率 > 95%
- ✅ 获取 50 个种子用户，周活跃率 > 30%
- ✅ 用户反馈"AI 像真正的创作伙伴" > 60%

### 成功指标

| 指标 | 目标 | 时间框架 |
|------|------|---------|
| **注册用户** | 1,000 | 6 个月 |
| **付费转化率** | 5% | 6 个月 |
| **周活跃率** | 30% | 3 个月 |
| **完成率** | 20% 完成第一部剧本 | 6 个月 |

---

## 定价策略

| 版本 | 价格 | 功能限制 |
|------|------|---------|
| **免费版** | ¥0 | 1个项目、基础 AI、500次/月 |
| **创作版** | ¥299/年 | 5个项目、高级 AI、5000次/月 |
| **专业版** | ¥999/年 | 20个项目、AI 共创、20000次/月 |
| **工作室版** | ¥2999/年 | 无限项目、团队协作、专属支持 |

---

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交变更 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 许可证

MIT License

---

## 联系方式

- GitHub：[zz8011/Scripter](https://github.com/zz8011/Scripter)
- Issues：[GitHub Issues](https://github.com/zz8011/Scripter/issues)

---

## 相关资源

### 外部资源
- [Next.js 文档](https://nextjs.org/docs)
- [TipTap 文档](https://tiptap.dev/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Casdoor 文档](https://casdoor.org/)
- [智谱 AI](https://open.bigmodel.cn/)

### 设计系统速查

#### 核心色彩

```css
--nav-bg: #1A1A1A;       /* 导航栏：深黑色 */
--brand-gold: #C9A962;   /* 品牌金色 */
--paper-bg: #F5F1E8;     /* 背景：米色 */
--text-primary: #1A1A1A; /* 主文字 */
```

#### 间距系统（8px 网格）

```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
```

#### 圆角规范

```
4px (小) | 8px (默认) | 12px (大)
```

---

**让灵感，在剧本中苏醒** ✨

**AI 不是工具，而是创作伙伴** 🤝
