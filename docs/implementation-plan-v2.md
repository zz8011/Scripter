# 剧灵 Scripter - 可执行实施计划 v2.1

> 基于新技术栈（Drizzle + Casdoor + GLM-4.7）的详细开发计划

**更新日期:** 2026-01-23
**技术栈版本:** v2.1
**预计周期:** MVP 10 周

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [PRD v2.3](../prd/2026-01-23-scripter-prd-v2.3.md) | 产品需求文档 |
| [技术设计文档](../tech/tech-design.md) | 技术架构 |
| [迁移计划](../tech/migration-plan-drizzle-casdoor.md) | 技术栈迁移 |

---

## 一、开发阶段概览

```
┌─────────────────────────────────────────────────────────────┐
│                       MVP (10 周)                            │
├─────────────────────────────────────────────────────────────┤
│ Sprint 1-2: 基础架构 (Week 1-2)                              │
│ ├─ 项目初始化                                                │
│ ├─ Drizzle ORM + PostgreSQL                                 │
│ ├─ Casdoor 认证配置                                         │
│ └─ UI 基础框架                                              │
├─────────────────────────────────────────────────────────────┤
│ Sprint 3-6: 核心模块 (Week 3-6)                              │
│ ├─ Dashboard + Editor (TipTap)                              │
│ ├─ Characters + Scenes (拖拽功能)                           │
│ ├─ Worldview + Storyboard                                   │
│ └─ 数据流转验证                                              │
├─────────────────────────────────────────────────────────────┤
│ Sprint 7-8: AI 集成 (Week 7-8)                               │
│ ├─ 智谱 GLM-4.7 集成                                         │
│ ├─ 意图路由系统                                              │
│ ├─ 原子化 Skills (5+)                                       │
│ └─ 专家 Agents (4+)                                          │
├─────────────────────────────────────────────────────────────┤
│ Sprint 9-10: MVP 收尾 (Week 9-10)                            │
│ ├─ 版本控制                                                  │
│ ├─ 多格式导出                                                │
│ ├─ 测试 + 部署                                               │
│ └─ 50 个种子用户                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、Sprint 1-2: 基础架构 (Week 1-2)

### 目标
搭建项目基础架构，配置开发环境，完成认证系统

### Week 1: 项目初始化

#### 开发环境配置
- [ ] 安装 Node.js 18+, pnpm
- [ ] 初始化 Next.js 14 项目 (App Router)
- [ ] 配置 TypeScript, ESLint, Prettier
- [ ] 配置 Git Hooks (Husky + lint-staged)

#### UI 配置
- [ ] 安装 Tailwind CSS
- [ ] 配置品牌 CSS 变量
  ```css
  --paper-bg: #F5F1E8
  --brand-gold: #C9A962
  --ink-black: #1A1A1A
  --text-brown: #5C5548
  ```
- [ ] 安装 shadcn/ui 组件库
- [ ] 配置自定义主题
- [ ] 安装字体（Inter, Noto Sans SC, Noto Serif SC, Courier Prime）

#### 数据库配置
- [ ] 设置 PostgreSQL (Neon/Vercel Postgres/阿里云 RDS)
- [ ] 安装 Drizzle ORM
  ```bash
  pnpm add drizzle-orm postgres
  pnpm add -D drizzle-kit
  ```
- [ ] 编写初始 Schema（User, Project）
- [ ] 配置 Drizzle Kit
- [ ] 运行首次迁移

### Week 2: 认证系统 + 基础组件

#### Casdoor 集成
- [ ] 部署 Casdoor 服务（Docker）
  ```yaml
  # docker-compose.yml
  services:
    casdoor:
      image: casbin/casdoor:latest
      ports:
        - "8000:8000"
      environment:
        - DRIVER_NAME=postgres
        - dataSource=user:password@tcp(db:5432)/casdoor
  ```
- [ ] 配置 Casdoor 应用
- [ ] 安装 Casdoor SDK
  ```bash
  pnpm add casdoor-js-sdk
  ```
- [ ] 实现登录/注册页面
- [ ] 实现 OAuth 回调处理
- [ ] 实现用户会话管理

#### 导航布局
- [ ] 创建根布局 (app/layout.tsx)
- [ ] 实现左侧导航栏（#1A1A1A 背景）
- [ ] 实现导航菜单（6 项）
- [ ] 实现 Logo 区域
- [ ] 实现右侧 AI 面板框架
- [ ] 实现顶部工具栏

#### 基础组件
- [ ] 创建 ProjectCard 组件（玻璃拟态）
- [ ] 创建 CharacterCard 组件
- [ ] 创建 SceneCard 组件
- [ ] 创建 Modal 组件（毛玻璃效果）
- [ ] 创建 Loading 组件

#### 路由结构
- [ ] 创建 (dashboard) 路由组
- [ ] 创建基础路由页面
  - /dashboard
  - /projects/new
  - /projects/[id]/overview

### 验收标准
- [ ] 用户可以通过 Casdoor 注册/登录
- [ ] 创建项目后可跳转到项目详情
- [ ] 导航栏在所有页面正常工作
- [ ] Drizzle 可以正常读写数据库

### 风险与应对
| 风险 | 应对措施 |
|------|----------|
| Casdoor 部署复杂 | 使用 Docker 一键部署；参考官方文档 |
| Drizzle 学习曲线 | 阅读官方文档；参考示例项目 |

---

## 三、Sprint 3-6: 核心模块 (Week 3-6)

### 目标
实现 MVP 六大核心页面的基础功能

### Week 3: Dashboard + Editor 基础

#### Dashboard (控制台)
- [ ] 实现项目卡片流（玻璃拟态效果）
- [ ] 显示今日创作字数
- [ ] 显示最近编辑项目
- [ ] 新建脚本按钮（带 Plus 旋转特效）
- [ ] 实现项目搜索功能
- [ ] 实现项目删除功能

#### Editor 基础
- [ ] 集成 TipTap
  ```bash
  pnpm add @tiptap/react @tiptap/starter-kit
  ```
- [ ] 配置剧本格式扩展
  - SceneHeading（场景标题）
  - Action（动作描述）
  - Character（人物名）
  - Dialogue（对白）
  - OS（内心独白）
- [ ] 实现 A4 纸张布局
- [ ] 实现格式工具栏
- [ ] 实现快捷键（Tab 切换格式）

### Week 4: Characters + Scenes

#### Characters (人物)
- [ ] 人物档案卡片流
- [ ] 人物小传编辑表单
- [ ] 人物诗号生成（AI）
- [ ] AI 生成人设功能（接入预留）
- [ ] 人物搜索功能
- [ ] 人物关系图

#### Scenes (场景)
- [ ] 场景看板视图（3 列）
  - 待写
  - 写作中
  - 已完成
- [ ] 环境标签（日/夜/内/外）
- [ ] 状态流转（草稿→已完成）
- [ ] 场景拖动排序（@dnd-kit）
  ```bash
  pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  ```
- [ ] 金色插入指示线动效
- [ ] 虚拟滚动（react-window）

### Week 5: Worldview + Storyboard

#### Worldview (世界观)
- [ ] 多维设定编辑器
  - 时代背景
  - 地理环境
  - 神秘元素
  - 社会阶层
- [ ] 结构化展示
- [ ] AI 设定编织（接入预留）
- [ ] 设定模板选择

#### Storyboard (分镜)
- [ ] 分镜脚本编辑器
- [ ] 画面-声音四栏排版
- [ ] 镜头类型选择
  - 远景、中景、近景、特写
- [ ] AI 运镜建议（接入预留）
- [ ] 分镜导出 PDF

### Week 6: 集成与优化

#### 集成测试
- [ ] 六大模块联调
- [ ] 数据流转验证
- [ ] UI 统一性检查
- [ ] 跨模块导航测试

#### 性能优化
- [ ] 代码分割（dynamic import）
- [ ] 图片优化（Next.js Image）
- [ ] 懒加载
- [ ] 缓存策略（SWR）

### 验收标准
- [ ] 六大页面可正常操作
- [ ] 数据可正确保存到数据库
- [ ] 基础 UI 符合设计规范
- [ ] 拖拽功能流畅

### 风险与应对
| 风险 | 应对措施 |
|------|----------|
| TipTap 自定义扩展复杂 | 参考官方示例；逐步实现 |
| 拖拽功能性能问题 | 使用虚拟滚动；限制渲染数量 |

---

## 四、Sprint 7-8: AI 集成 (Week 7-8)

### 目标
实现 AI 辅助功能，完成意图路由系统

### Week 7: AI 基础设施

#### 智谱 GLM-4.7 集成
- [ ] 安装 SDK
  ```bash
  pnpm add zhipu-sdk
  ```
- [ ] 创建 GLM 客户端
  ```typescript
  // lib/zhipu/client.ts
  import { ZhipuAI } from 'zhipu-sdk'

  export const glmClient = new ZhipuAI({
    apiKey: process.env.ZHIPU_API_KEY,
    baseURL: process.env.ZHIPU_API_BASE,
  })
  ```
- [ ] 实现流式响应组件
- [ ] 实现错误处理与重试
- [ ] 实现 AI 配额控制
- [ ] 实现 AI 使用统计

#### T8Star 图片生成集成
- [ ] 安装 T8Star SDK
- [ ] 创建图片生成客户端
- [ ] 实现异步任务队列
- [ ] 实现图片缓存

#### Intention Dispatcher
- [ ] 实现意图识别（glm-4-flash）
- [ ] 实现 Skill 路由
- [ ] 实现 Agent 路由
- [ ] 配置上下文注入
  - 游标位置
  - 选中文本
  - 场景信息
  - 角色信息

### Week 8: 核心 Skills 和 Agents

#### 原子化 Skills
- [ ] **格式修复 Skill**
  - 场景标题格式检查
  - 对话块格式检查
  - 自动修复
- [ ] **对白润色 Skill**
  - 保持角色口吻
  - 优化表达
- [ ] **场景扩展 Skill**
  - 基于上下文续写
  - 保持情节连贯
- [ ] **节奏分析 Skill**
  - 对话密度分析
  - 节奏建议
- [ ] **一致性检查 Skill**
  - 人物行为一致性
  - 情节逻辑一致性
- [ ] **人性化 Skill** (humanize-skill.ts)
  - 移除 AI 填充词
  - 替换 AI 词汇
  - 简化复杂句式
  - 支持上下文感知

#### 专家 Agents
- [ ] **观众批判 Agent**
  - 4 维度评分
  - 具体改进建议
- [ ] **剧情反转 Agent**
  - 4 种反转类型
  - 反转建议
- [ ] **角色优化 Agent**
  - 人物心理分析
  - 行为建议
- [ ] **世界观 Agent**
  - 设定一致性检查
  - 考据建议

#### AI 助手面板
- [ ] 实现对话界面
- [ ] 实现流式响应
- [ ] 实现快捷 Skill 按钮
- [ ] 实现配额显示
- [ ] 实现对话历史

### 验收标准
- [ ] AI 响应正常流式输出
- [ ] 意图路由准确率 > 80%
- [ ] 配额控制生效
- [ ] 所有 5+ Skills 可用
- [ ] 所有 4+ Agents 可用

### 风险与应对
| 风险 | 应对措施 |
|------|----------|
| AI 成本超预算 | 严格配额控制；分级定价 |
| GLM API 限流 | 实现请求队列；重试机制 |

---

## 五、Sprint 9-10: MVP 收尾 (Week 9-10)

### 目标
完成 MVP 功能，准备发布

### Week 9: 核心功能完善

#### 版本控制
- [ ] 实现自动版本管理
- [ ] 实现版本对比
- [ ] 实现版本回滚
- [ ] 实现里程碑标记

#### 导出功能
- [ ] PDF 导出（A4 格式）
  - 使用 jsPDF
  - 支持封面页
- [ ] Word 导出
  - 使用 docx.js
- [ ] Text 导出
- [ ] Fountain 格式导出
- [ ] 防盗版选项
  - 纯图 PDF
  - 只读 Word
  - 水印
  - 样张标记

#### 搜索功能
- [ ] 实现全局搜索
- [ ] 实现高亮显示
- [ ] 实现结果导航

### Week 10: 测试与部署

#### 测试
- [ ] 单元测试 (Jest)
  - 关键函数测试
  - AI Skills 测试
- [ ] E2E 测试 (Playwright)
  - 用户注册/登录
  - 创建项目
  - 编辑剧本
  - AI 辅助功能
- [ ] 性能测试
  - 首屏加载
  - 编辑器响应
- [ ] 安全测试
  - SQL 注入
  - XSS
  - CSRF

#### 部署准备
- [ ] 配置生产环境变量
- [ ] 设置 CDN (Cloudflare)
- [ ] 配置监控（Sentry）
- [ ] 配置日志
- [ ] 设置备份策略

#### 用户准备
- [ ] 准备 50 个种子用户邀请
- [ ] 编写用户文档
- [ ] 录制使用视频
- [ ] 设置反馈渠道

### 验收标准
- [ ] 所有 MVP 功能可用
- [ ] 测试覆盖率 > 70%
- [ ] 生产环境部署成功
- [ ] 50 个种子用户激活
- [ ] 周活跃率 > 30%

### 风险与应对
| 风险 | 应对措施 |
|------|----------|
| 部署问题 | 预先部署测试环境；演练部署流程 |
| 用户活跃度低 | 提供详细引导；及时响应用户反馈 |

---

## 六、第二阶段规划 (Week 11-18)

### 高级 AI 功能
- [ ] AI 生成完整场景
- [ ] AI 检查人物一致性
- [ ] AI 检查情节逻辑
- [ ] AI 共创模式（你一句我一句）

### 专注模式
- [ ] 隐藏所有侧边栏
- [ ] 沉浸式写作体验
- [ ] 快捷键切换

### 优化完善模块
- [ ] 对白批量优化
- [ ] 节奏分析
- [ ] 字数统计与时长估算

---

## 七、第三阶段规划 (Week 19-26)

### 实时协作编辑
- [ ] Socket.io 集成
- [ ] 多人同时编辑
- [ ] 实时评论与批注
- [ ] 权限管理

### 高级 AI 图片生成
- [ ] 人物人设图生成
- [ ] 场景概念图生成
- [ ] 图片管理

### 制作准备深化
- [ ] 角色选型建议
- [ ] 道具场景清单
- [ ] 一键导出制作文档

---

## 八、第四阶段规划 (按需启动)

### 高级协作
- [ ] 团队工作区
- [ ] 社区素材库

### 数据分析
- [ ] 创作习惯分析
- [ ] AI 使用效率报告
- [ ] 项目进度报表

### 移动端适配
- [ ] iOS/Android App
- [ ] 移动端阅读模式
- [ ] 快速编辑功能

### API 与集成
- [ ] 开放 API
- [ ] 第三方工具集成
- [ ] 插件系统

---

## 九、关键里程碑

| 里程碑 | 时间 | 验收标准 | 责任人 |
|--------|------|---------|--------|
| **M1: 基础架构完成** | Week 2 | 可运行的空壳项目；Casdoor 登录可用 | 后端 |
| **M2: 六大页面可用** | Week 6 | 所有核心页面可操作；数据可保存 | 前端 |
| **M3: AI 功能可用** | Week 8 | AI 辅助功能正常工作；意图路由可用 | AI 工程师 |
| **M4: MVP 完成** | Week 10 | 所有 MVP 功能就绪；50 用户激活 | 全员 |
| **M5: 第二阶段完成** | Week 18 | 高级功能上线 | 全员 |
| **M6: 第三阶段完成** | Week 26 | 协作功能上线 | 全员 |

---

## 十、开发规范

### Git 提交规范

```bash
feat: 新功能
fix: 修复 bug
docs: 文档变更
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具相关
perf: 性能优化
ci: CI/CD 相关
```

### 代码审查检查清单

- [ ] 代码符合 ESLint 规范
- [ ] 添加必要的注释
- [ ] 更新相关文档
- [ ] 通过所有测试
- [ ] 无安全漏洞
- [ ] 性能无明显下降

### UI 开发检查清单

- [ ] 符合 UI 设计系统
- [ ] 响应式适配（移动端/平板/桌面）
- [ ] 无障碍支持（键盘导航、ARIA）
- [ ] 动效流畅（60fps）
- [ ] 加载状态处理
- [ ] 错误状态处理

### AI 开发检查清单

- [ ] Prompt 优化
- [ ] 上下文注入正确
- [ ] 错误处理完善
- [ ] 配额控制生效
- [ ] 流式响应流畅
- [ ] 结果可验证

---

## 十一、相关资源

### 设计参考
- [UI 设计系统](../design/ui-design-system.md) - 完整视觉规范
- [品牌标识规范](../design/ref/剧灵·品牌标识规范.md) - HTML/CSS 实现
- [图标设计语言](../design/ref/剧灵-图标设计语言.md) - 图标规范

### 技术文档
- [技术设计文档](../tech/tech-design.md) - 技术架构
- [API 规范](../tech/api-spec.md) - API 端点
- [迁移计划](../tech/migration-plan-drizzle-casdoor.md) - 技术栈迁移

### 外部资源
- [Next.js 文档](https://nextjs.org/docs)
- [TipTap 文档](https://tiptap.dev/docs)
- [Drizzle 文档](https://orm.drizzle.team/docs/overview)
- [Casdoor 文档](https://casdoor.org/docs/overview)
- [智谱 AI 文档](https://open.bigmodel.cn/dev/api)

---

**让灵感，在剧本中苏醒** ✨
