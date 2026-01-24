# 剧灵 (Scripter) - 设计实现精准对齐方案

> 解决 PRD → 实现差距和上下文丢失问题

---

## 问题分析

### 核心矛盾

```
你的大脑：完整的视觉预期 + 设计感觉 + 历史讨论
     ↓
PRD 文档：文字描述（信息密度低）
     ↓
Claude：基于文字理解实现（可能偏差）
     ↓
实现结果：与你心理预期有差距
```

### 根本原因

| 问题 | 原因 | 影响 |
|------|------|------|
| **视觉细节偏差** | PRD 是文字，缺少视觉参考 | 颜色、间距、字体不准确 |
| **布局尺寸不对** | 没有明确的尺寸标注 | 响应式断点、组件大小偏差 |
| **动效交互缺失** | 文字难以描述动态效果 | 缺少动画、过渡效果 |
| **设计感觉不对** | 无法传达整体氛围 | 风格、气质不符合预期 |
| **上下文丢失** | Token 限制，长对话被压缩 | 重复讨论、决策被遗忘 |

---

## 解决方案：三层验证机制

```
┌─────────────────────────────────────────────┐
│ 第一层：视觉参考层（解决设计差距）           │
│   原型图 + 设计标注 + 实时预览              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 第二层：上下文持久层（解决信息丢失）         │
│   设计系统缓存 + 决策历史 + 组件文档        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 第三层：分阶段验证层（及时发现问题）         │
│   原型对比 → 渐进实现 → 迭代修正            │
└─────────────────────────────────────────────┘
```

---

## 第一层：视觉参考层

### 1.1 创建视觉参考文件

在项目根目录创建：`docs/design/.claude/design-context.md`

```markdown
# 剧灵 - 设计系统速查表

> Claude 每次实现 UI 前必须先阅读此文件

## 核心色彩（必读）

```css
/* 纸质背景系统 */
--paper-bg: #F5F1E8;        /* 主背景：温暖米色 */
--paper-texture: url('/natural-paper.png');

/* 导航栏 */
--nav-bg: #1A1A1A;          /* 左侧导航：深黑色（注意不是白色！） */
--nav-text: #FFFFFF;         /* 导航文字：白色 */

/* 品牌色系 */
--brand-gold: #C9A962;       /* 品牌金色：高亮、边框、AI 功能 */
--brand-gold-dark: #A68A45;  /* 暗金色：hover 状态 */

/* 文字色系 */
--text-primary: #1A1A1A;     /* 主文字：深墨黑 */
--text-secondary: #5C5548;   /* 副文字：深褐 */

/* 表面与边框 */
--surface: #FFFFFF;          /* 编辑容器：纯白 */
--border: #D3C9B0;           /* 边框：浅褐 */
```

## 字体系统（必读）

```css
/* UI 字体 */
font-family: 'Inter', 'Noto Sans SC', sans-serif;

/* 品牌标题 */
font-family: 'Noto Serif SC', serif;  /* 使用宋体突出品牌 */

/* 编辑器字体 */
font-family: 'Courier Prime', 'Noto Sans SC', monospace;
font-size: 18px;
line-height: 1.6;
```

## 间距系统（8px 网格）

```css
/* 必须使用以下间距值 */
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px

/* 示例 */
padding: 16px 24px;    /* ✅ 正确 */
padding: 15px 23px;    /* ❌ 错误 */
```

## 圆角规范

```css
border-radius: 4px;    /* sm: 小元素 */
border-radius: 8px;    /* base: 默认 */
border-radius: 12px;   /* lg: 大卡片 */
border-radius: 9999px; /* full: 胶囊按钮 */
```

## 特殊效果（必读）

### 玻璃拟态
```css
background: rgba(255, 255, 255, 0.6);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.3);
```

### 浮动光晕动画
```css
@keyframes float-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(201, 169, 98, 0.1); }
  50% { box-shadow: 0 0 30px rgba(201, 169, 98, 0.2); }
}
```

### 金色悬停边框
```css
transition: border-color 0.3s ease;
&:hover {
  border-color: #C9A962;
}
```

## 组件尺寸标准

### 导航栏
```css
width: 240px;           /* 折叠前 */
width: 72px;            /* 折叠后 */
```

### 模态框
```css
width: 700px;           /* 固定宽度，不可调整 */
max-height: 80vh;       /* 最大高度 */
```

### 编辑器（A4）
```css
width: 210mm;
min-height: 297mm;
padding: 25.4mm;        /* A4 标准页边距 */
```

### 卡片
```css
/* 统计卡片 */
width: 280px;
height: 140px;

/* 项目卡片 */
width: 320px;
min-height: 180px;
```

## 响应式断点

```css
/* 移动端 */
@media (max-width: 768px) { }

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) { }

/* 桌面 */
@media (min-width: 1025px) { }
```

## 动画时长

```css
/* 快速交互 */
transition: all 0.15s ease;

/* 常规过渡 */
transition: all 0.3s ease;

/* 慢速动画 */
transition: all 0.5s ease;
```

## 图标规范

```
使用：Lucide React 图标库
描边：2px stroke
尺寸：32x32px（标准）、24x24px（小）、40x40px（大）
```

## 常见错误（Claude 避免这些）

❌ **错误示例：**
- 左侧导航栏使用白色背景 → ❌ 应该是 #1A1A1A
- 模态框宽度自适应 → ❌ 应该固定 700px
- 使用 5px、10px 等非 8px 网格间距 → ❌ 应该是 4px、8px、12px、16px
- 金色直接用于背景 → ❌ 金色只用于高亮、边框、AI 功能
- 没有玻璃拟态效果 → ❌ 卡片需要 backdrop-filter

✅ **正确示例：**
- 导航栏：`background: #1A1A1A`
- 模态框：`width: 700px`
- 间距：`padding: 16px 24px`
- 高亮：`border-color: #C9A962`
- 卡片：`backdrop-filter: blur(8px)`

## 实现前检查清单

每次实现 UI 组件前，Claude 必须：

- [ ] 已读取此设计系统文件
- [ ] 已查看原型图（如果存在）
- [ ] 确认使用了正确的颜色值
- [ ] 确认使用了正确的间距（8px 网格）
- [ ] 确认使用了正确的圆角值
- [ ] 确认添加了必要的动画效果
- [ ] 确认实现了玻璃拟态（如适用）
```

### 1.2 原型图对比工作流

```bash
# 步骤 1：实现前先查看原型
请查看 docs/design/prototypes/v4/xx-xxx.html 的原型

# 步骤 2：描述关键视觉元素
列出原型中的：
- 主色调
- 布局结构
- 间距关系
- 特殊效果

# 步骤 3：实现代码
基于上述分析实现组件

# 步骤 4：视觉对比
实现后，对比原型图检查：
- [ ] 颜色是否一致
- [ ] 布局是否一致
- [ ] 间距是否一致
- [ ] 效果是否完整
```

---

## 第二层：上下文持久层

### 2.1 创建决策历史文件

创建：`docs/tech/decisions.md`

```markdown
# 技术决策历史

> 记录所有重要的技术决策，避免重复讨论

## 决策记录格式

```md
## [YYYY-MM-DD] 决策标题

**背景**：为什么需要这个决策

**选项**：
- 选项 A：描述
- 选项 B：描述

**选择**：选项 B

**理由**：
1. 理由一
2. 理由二

**影响**：
- 影响范围
- 需要注意的事项

```

## 实际决策记录

### [2026-01-23] 编辑器技术选型

**背景**：需要选择剧本编辑器的实现方案

**选项**：
- TipTap：富文本编辑器，可扩展性强
- Slate：完全自定义，灵活性最高
- Monaco：代码编辑器，不适合剧本
- Contentful：过于重量级

**选择**：TipTap

**理由**：
1. 已有成熟的剧本格式扩展
2. React 生态集成好
3. 支持实时协作（未来需求）
4. 社区活跃，文档完善

**影响**：
- 需要自定义场景标题、对话、动作描述节点
- 编辑器状态管理需要特别设计

---

### [2026-01-23] 拖拽库选择

**背景**：场景看板需要拖拽排序功能

**选项**：
- @dnd-kit/core：现代化，性能好
- react-beautiful-dnd：已废弃
- react-dnd：过于复杂

**选择**：@dnd-kit/core

**理由**：
1. 已经安装在项目中
2. 性能优秀，支持虚拟滚动
3. TypeScript 支持好
4. 文档清晰

**影响**：
- 需要配置 DndContext provider
- 拖拽手柄需要自定义样式

---

### [2026-01-23] 导航栏颜色

**背景**：左侧导航栏的颜色选择

**选项**：
- 白色：浅色，普通
- 黑色 #1A1A1A：深色，品牌感
- 灰色：折中方案

**选择**：黑色 #1A1A1A

**理由**：
1. 符合品牌设计系统
2. 对比度高，视觉冲击力强
3. 与品牌金色形成鲜明对比
4. 参考原型设计

**影响**：
- 所有导航相关组件必须使用此颜色
- 导航文字必须是白色
- 活动状态用金色高亮
```

### 2.2 创建组件使用约定

创建：`docs/tech/component-conventions.md`

```markdown
# 组件使用约定

## 组件组织规则

### 文件结构
```
components/
├── ui/              # shadcn/ui 基础组件（不修改）
├── layout/          # 布局组件
├── editor/          # 编辑器组件
├── dashboard/       # 控制台组件
└── shared/          # 共享组件
```

### 命名规范

```tsx
// ✅ 好的命名
<ProjectCard />
<SceneBoard />
<AIChatPanel />

// ❌ 不好的命名
<Card />             /* 太通用 */
<Board />            /* 不清晰 */
<Panel />            /* 不明确 */
```

### Props 设计

```tsx
// ✅ 好的 Props 设计
interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  variant?: 'default' | 'compact';
}

// ❌ 不好的 Props 设计
interface CardProps {
  data: any;              /* 类型不明确 */
  callback?: Function;    /* 不清晰 */
}
```

## 通用组件使用指南

### Modal 组件

```tsx
// ✅ 正确使用
<Modal isOpen={open} onClose={close} width={700}>
  {/* 内容 */}
</Modal>

// ⚠️ 注意：模态框宽度固定为 700px
// 不要使用 width 属性调整
```

### Button 组件

```tsx
// 使用品牌金色作为主要操作
<Button variant="brand">主要操作</Button>

// 使用默认样式作为次要操作
<Button variant="outline">次要操作</Button>
```

### 卡片组件

```tsx
// 玻璃拟态效果
<div className="glass-card">
  {/* 内容 */}
</div>

// CSS
.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

## 数据流规范

### 状态提升原则

```tsx
// ✅ 正确：状态在父组件管理
function Parent() {
  const [data, setData] = useState();
  return <Child data={data} onUpdate={setData} />;
}

// ❌ 错误：状态分散在子组件
function Child() {
  const [data, setData] = useState();  /* 应该提升到父组件 */
}
```

### API 调用位置

```tsx
// ✅ 正确：API 调用在 hooks 或 Server Components
// lib/api/project.ts
export async function getProject(id: string) {
  const response = await fetch(`/api/projects/${id}`);
  return response.json();
}

// ❌ 错误：直接在组件中调用 fetch
function Component() {
  useEffect(() => {
    fetch('/api/projects/1');  /* 应该封装到 lib/api */
  }, []);
}
```
```

### 2.3 创建会话模板

创建：`.claude/templates/ui-development.md`

```markdown
# UI 开发会话模板

> 每次开发 UI 组件时使用此模板

## 第一阶段：理解需求

**请 Claude 执行以下步骤：**

1. 阅读设计系统文件
   ```
   Read: docs/design/.claude/design-context.md
   ```

2. 查看原型图（如果存在）
   ```
   查找：docs/design/prototypes/v4/ 相关原型
   ```

3. 确认需求理解
   ```
   请用你自己的话描述：
   - 要实现什么功能
   - 视觉上应该是什么样子
   - 使用哪些设计系统参数
   ```

## 第二阶段：实现

**请 Claude 按以下步骤实现：**

1. 先实现结构（HTML）
2. 再添加样式（CSS）
3. 最后添加交互（JS）

**实现时必须：**
- [ ] 使用正确的颜色值（从设计系统）
- [ ] 使用正确的间距（8px 网格）
- [ ] 使用正确的圆角值
- [ ] 添加必要的动画效果
- [ ] 实现玻璃拟态（如适用）

## 第三阶段：验证

**视觉检查清单：**

- [ ] 颜色是否与设计系统一致
- [ ] 间距是否符合 8px 网格
- [ ] 尺寸是否正确
- [ ] 动画是否流畅
- [ ] 响应式是否正常

**代码质量检查清单：**

- [ ] TypeScript 类型正确
- [ ] 没有硬编码的样式值
- [ ] 组件可复用
- [ ] Props 设计合理

## 第四阶段：对比原型

如果存在原型图，请：

1. 截图当前实现
2. 与原型图并排对比
3. 列出差异点
4. 修复差异

```

---

## 第三层：分阶段验证层

### 3.1 渐进式实现策略

```
❌ 不好的做法：一次性实现整个页面

/tdd 实现完整的控制台页面
# 规模太大，容易出错，难以调试

✅ 好的做法：分阶段实现

/tdd 实现统计卡片组件
  → 验证：颜色、尺寸、效果
  → 确认无误后继续

/tdd 实现项目卡片组件
  → 验证：颜色、尺寸、效果
  → 确认无误后继续

/tdd 组装控制台布局
  → 验证：整体布局、响应式
  → 确认无误后完成
```

### 3.2 视觉验证命令

创建自定义命令：`.claude/commands/verify-ui.md`

```markdown
---
description: 验证 UI 实现与设计系统的一致性
---

# UI 视觉验证

## 检查项

### 1. 颜色验证
- [ ] 背景色是否使用 `#F5F1E8`
- [ ] 导航栏是否使用 `#1A1A1A`
- [ ] 品牌色是否使用 `#C9A962`
- [ ] 文字色是否使用 `#1A1A1A` 或 `#5C5548`

### 2. 间距验证
- [ ] 所有间距是否为 4/8/12/16/20/24/32/40/48px
- [ ] 没有 5/10/15 等非 8px 网格间距

### 3. 圆角验证
- [ ] 小元素使用 4px
- [ ] 默认使用 8px
- [ ] 大卡片使用 12px

### 4. 效果验证
- [ ] 卡片是否有玻璃拟态效果
- [ ] 金色元素是否有悬停动画
- [ ] 是否有浮动光晕（如适用）

### 5. 布局验证
- [ ] 模态框宽度是否为 700px
- [ ] 导航栏宽度是否正确
- [ ] 响应式断点是否正确

## 验证方法

对于每个检查项：
1. 读取相关组件文件
2. 检查 CSS 类名和内联样式
3. 对比设计系统文档
4. 列出所有不符合项

## 输出格式

```markdown
## UI 验证报告

### ✅ 符合设计系统的项
- 统计卡片颜色正确
- 间距符合 8px 网格

### ⚠️ 需要调整的项
- ⚠️ 项目卡片宽度应为 320px，当前是 300px
- ⚠️ 缺少玻璃拟态效果

### 修复建议
1. 修改项目卡片宽度
2. 添加 backdrop-filter: blur(8px)
```
```

---

## 完整工作流示例

### 开发新组件的标准流程

```bash
# === 步骤 1：准备工作 ===
# 创建会话，加载模板
# （手动）打开 .claude/templates/ui-development.md

# === 步骤 2：理解需求 ===
# 让 Claude 阅读设计系统
"请先阅读 docs/design/.claude/design-context.md"

# 让 Claude 查看原型（如果存在）
"请查看 docs/design/prototypes/v4/xx-xxx.html"

# === 步骤 3：确认理解 ===
"请描述你要实现的组件的视觉效果"

# === 步骤 4：实现组件 ===
/tdd 实现场景卡片组件

# === 步骤 5：视觉验证 ===
/verify-ui

# === 步骤 6：原型对比 ===
"截图并与原型图对比，列出差异"

# === 步骤 7：迭代修正 ===
# 根据验证结果修复差异

# === 步骤 8：最终确认 ===
"再次运行 /verify-ui 确认所有检查项通过"

# === 步骤 9：代码审查 ===
/code-review
```

---

## 上下文持久化配置

### 使用 Hooks 自动保存会话

在 `.claude/settings.local.json` 中配置：

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "type": "command",
        "command": "node scripts/save-session-context.js"
      }
    ],
    "SessionStart": [
      {
        "type": "command",
        "command": "node scripts/load-session-context.js"
      }
    ]
  }
}
```

### 脚本示例

`scripts/save-session-context.js`:

```javascript
const fs = require('fs');
const path = require('path');

const contextFile = path.join(__dirname, '../.claude/session-context.json');
const summary = process.argv[2] || 'Development session';

const context = {
  date: new Date().toISOString(),
  summary: summary,
  recentDecisions: [], // 从会话中提取
  recentChanges: [],   // 修改的文件列表
};

fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
```

---

## 快速参考

### 常用文件位置

| 文件 | 用途 |
|------|------|
| `docs/design/.claude/design-context.md` | 设计系统速查 |
| `docs/tech/decisions.md` | 技术决策历史 |
| `docs/tech/component-conventions.md` | 组件使用约定 |
| `.claude/templates/ui-development.md` | UI 开发模板 |

### 常用命令

| 命令 | 用途 |
|------|------|
| `/verify-ui` | UI 视觉验证 |
| `/plan` | 创建实施计划 |
| `/tdd` | 测试驱动开发 |

---

**让设计，精准落地** ✨
