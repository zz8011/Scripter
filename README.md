# 剧灵 (Scripter)

> AI 驱动的中文短剧剧本创作工具

---

## 项目简介

剧灵是一个专为中文短剧创作者设计的 AI 辅助剧本创作工具，集成了智能编辑、格式检查、人物管理、场景编排等核心功能。

### 核心特性

- ✍️ **智能剧本编辑器**：支持中文短剧剧本格式规范 v2.0
- 🎭 **人物管理系统**：角色档案、性格分析、诗号生成
- 🎬 **场景看板**：可视化场景编排、拖拽排序
- 🌍 **世界观编辑器**：多维度设定管理
- 🎞️ **分镜编辑器**：专业分镜脚本创作
- 🤖 **AI 创作助手**：智能场景生成、台词优化、格式检查

---

## 技术栈

### 前端
- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS + CSS Variables
- **组件库**：shadcn/ui
- **编辑器**：TipTap
- **拖拽**：@dnd-kit/core

### AI 集成
- **LLM**：智谱 GLM-4.7
- **图片**：T8Star

### 数据库
- **ORM**：Prisma
- **数据库**：PostgreSQL (Neon)

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

## 快速开始

### 前置要求

- Node.js 18+
- pnpm
- Claude Code (可选，用于 AI 辅助开发)

### 安装依赖

```bash
# 安装 pnpm（如果还没有）
npm install -g pnpm

# 安装项目依赖
pnpm install
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

## 文档导航

### 开发文档
- [科学开发工作流](docs/scientific-dev-workflow.md)
- [设计实现精准对齐方案](docs/design-implementation-bridge.md)
- [组件使用约定](docs/tech/component-conventions.md)
- [技术决策历史](docs/tech/decisions.md)

### 设计文档
- [UI 设计系统](docs/design/ui-design-system.md)
- [设计系统速查](docs/design/.claude/design-context.md)
- [品牌标识规范](docs/design/ref/剧灵·品牌标识规范.md)

### 产品文档
- [PRD v2.4](docs/prd/2026-01-23-scripter-prd-v2.4.md)
- [实施计划](docs/implementation-plan-v2.md)

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

## 设计系统速查

### 核心色彩

```css
--nav-bg: #1A1A1A;       /* 导航栏：深黑色 */
--brand-gold: #C9A962;   /* 品牌金色 */
--paper-bg: #F5F1E8;     /* 背景：米色 */
--text-primary: #1A1A1A; /* 主文字 */
```

### 间距系统（8px 网格）

```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
```

### 圆角规范

```
4px (小) | 8px (默认) | 12px (大)
```

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

**让灵感，在剧本中苏醒** ✨
