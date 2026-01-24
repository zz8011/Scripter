# 剧灵 Scripter - UI 设计系统 v4.6

> 基于 `ref/` 设计参考文档和 `prototypes/v4/` 原型的完整设计规范

---

## 快速导航

| 参考文档 | 内容 | 链接 |
|---------|------|------|
| **完整设计系统应用指南** | 品牌价值观、图标系统、Logo、字体系统 | [查看](ref/完整设计系统应用指南.md) |
| **品牌标识规范** | HTML/CSS 实现、变量、动效、View Transitions | [查看](ref/剧灵·品牌标识规范.md) |
| **图标设计语言** | Lucide Icons 规范、32×32px、2px 线条 | [查看](ref/剧灵-图标设计语言.md) |
| **v4 原型** | 实际 HTML/CSS 实现参考 | [查看](prototypes/v4/) |

---

## 核心品牌价值观

| 项目 | 内容 |
|------|------|
| **Slogan** | 让灵感，在剧本中苏醒 |
| **产品定位** | 剧灵，一支懂你的笔 |
| **品牌金句** | 创作路上，你不孤单 |
| **目标用户** | 短剧编剧、编剧助理、创意写作爱好者 |
| **版本标识** | v4.6 UNIFIED EDITION |

---

## 色彩系统 (Brand Palette)

### CSS 变量定义

```css
:root {
  /* 核心色彩 */
  --paper-bg: #F5F1E8;        /* 纸张米色 - 主背景 */
  --white-bg: #FFFFFF;        /* 纯白 - 编辑区、卡片 */
  --ink-black: #1A1A1A;       /* 墨黑 - 主文字、深色侧边栏 */
  --brand-gold: #C9A962;      /* 古典金 - 品牌色、高亮 */
  --brand-gold-dark: #A68A45; /* 暗金 - 悬停状态 */
  --brand-gold-light: #E6D3A3; /* 亮金 - 背景高亮 */
  --ink-secondary: #5C5548;   /* 深褐 - 副文本 */
  --text-muted: #8B7355;      /* 弱化文本 */
  --border-color: #D3C9B0;    /* 浅褐 - 边框 */
  --hover-bg: #FAF7F0;        /* 悬停背景 */

  /* 语义色彩 */
  --success-green: #7FA870;   /* 成功绿 */
  --info-blue: #7EA0C9;       /* 信息蓝 - AI相关 */
  --error-red: #C96262;       /* 错误红 */
  --warning-orange: #E8A858;  /* 警告橙 */
}
```

### 色彩使用规范

| 用途 | 颜色 | 代码 | 说明 |
|------|------|------|---------|
| **基础背景** | 纸张米色 | #F5F1E8 | 主背景，带纸质纹理 |
| **白色背景** | 纯白 | #FFFFFF | 编辑区、卡片、侧边栏 |
| **深色背景** | 墨黑 | #1A1A1A | Logo 背景 |
| **主文字** | 墨黑 | #1A1A1A | 主要内容 |
| **副文字** | 深褐 | #5C5548 | 次要信息 |
| **品牌色** | 古典金 | #C9A962 | 按钮、高亮、激活状态 |
| **边框色** | 浅褐 | #D3C9B0 | 分隔线、边框 |

---

## 字体系统 (Typography)

### 字体家族

| 用途 | 字体 | 字重 | 应用场景 |
|------|------|------|---------|
| **UI 正文 (font-ui)** | Inter + Noto Sans SC | 300/400/500/600/700 | 界面、菜单、表单、按钮 |
| **品牌标题 (font-display)** | Noto Serif SC | 600/700 | Logo、页面大标题 |
| **编辑区 (font-editor)** | Courier Prime + Noto Sans SC | 400 | 剧本编辑器（18px，行高1.5） |

### 字体应用示例

```css
/* UI 正文 */
.font-ui {
  font-family: 'Inter', 'Noto Sans SC', sans-serif;
  letter-spacing: -0.01em;
}

/* 品牌标题 */
.font-display {
  font-family: 'Noto Serif SC', serif;
  letter-spacing: -0.02em;
}

/* 编辑区 */
.font-editor {
  font-family: 'Courier Prime', 'Noto Sans SC', monospace;
  font-size: 18px;
  line-height: 1.5;
}
```

---

## Logo 设计规范

### Logo 核心元素

| 属性 | 值 |
|------|-----|
| **设计构成** | 黑色圆角方形 + 金色羽毛笔图标 |
| **背景形状** | 圆角方形 (border-radius: 4-8px) |
| **背景颜色** | #1A1A1A |
| **图标** | lucide:feather（羽毛笔） |
| **图标颜色** | #C9A962 |
| **默认尺寸** | 32×32px (可扩展 16-64px) |

### Logo 标准字

| 属性 | 值 |
|------|-----|
| **字体** | Noto Serif SC (思源宋体) |
| **字重** | 600 (SemiBold) / 700 (Bold) |
| **字间距** | -0.02em (紧凑) |
| **文本** | 剧灵（中文） |
| **颜色** | #1A1A1A |

### 英文后缀规范 (scripter.art)

在 Logo 下方添加小字：

| 属性 | 值 |
|------|-----|
| **位置** | Logo 文字下方 |
| **字号** | 8px (Bold) |
| **颜色** | #C9A962 |
| **字间距** | 0.3em (Tracking 极宽) |
| **透明度** | 70% |

### Logo HTML 实现

```html
<div class="flex items-center gap-3">
  <div class="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center">
    <iconify-icon icon="lucide:feather" class="text-[#C9A962] text-xl"></iconify-icon>
  </div>
  <div class="flex flex-col -gap-1">
    <span class="font-display font-bold text-2xl tracking-tighter text-[#1A1A1A]">剧灵</span>
    <span class="text-[8px] font-bold text-[#C9A962] tracking-widest uppercase -mt-1 opacity-70">scripter.art</span>
  </div>
</div>
```

---

## 图标系统 (Icon Library v1.0)

### Icon 设计原则

| 属性 | 值 | 说明 |
|------|-----|------|
| **线条粗度** | 2px | 统一视觉重量 |
| **圆角** | 2px | 保持现代感 |
| **标准尺寸** | 32×32px | 可扩展至 16-64px |
| **设计语言** | 极简几何 | 与 Lucide Icons 一致 |

### Icon 色彩规范

| 类型 | 颜色 | 代码 | 应用场景 |
|------|------|------|---------|
| **常规操作** | 深黑 | #1A1A1A | 默认图标 |
| **AI生成/选中/激活** | 古典金 | #C9A962 | AI功能、高亮状态 |
| **禁用/次要** | 深褐 | #5C5548 | 次要状态 |
| **禁用/弱化** | 灰色 | #A0A0A0 | 禁用状态 |
| **成功** | 绿色 | #7FA870 | 成功状态 |
| **错误** | 红色 | #C96262 | 错误状态 |
| **信息** | 钢蓝 | #7EA0C9 | AI 相关 |

### Icon 分类

| 分类 | 图标示例 | Lucide Icon |
|------|---------|-------------|
| **品牌 Logo** | 羽毛笔 | `lucide:feather` |
| **导航** | 返回、菜单、关闭 | `arrow-left`, `menu`, `x` |
| **编辑操作** | 新建、保存、删除、编辑 | `plus-square`, `save`, `trash-2`, `edit-3` |
| **剧本编辑** | 大纲、场景、人物、对话框 | `scroll`, `map-pin`, `user`, `message-square` |
| **内容管理** | 人物、世界观、分镜 | `users`, `globe`, `layout` |
| **功能操作** | AI生成（✨）、刷新、搜索 | `sparkles`, `refresh-cw`, `search` |
| **状态指示** | 成功✓、错误✗、警告⚠ | `check-circle`, `x-circle`, `alert-triangle` |

---

## 布局规范 (Layout System)

### 三栏式浸入式工作台

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [← Toggle]  剧名 (A4 校对模式)  [✓] [🖨️] [保存]                      [Toggle →] │
├──────────────┬─────────────────────────────────────────────────────────────┬──────┤
│              │                                                             │      │
│  ┌────────┐  │  ┌─────────────────────────────────────────────────────────┐ │ ┌──┐ │
│  │ Logo   │  │  │                                                          │ │ │用户│ │
│  │剧灵    │  │  │                    【第 1 集】                          │ │ │👤 │ │
│  │scripter│  │  │                                                          │ │ │Pro│ │
│  └────────┘  │  │      第 1 场：湘西山区·夜·外                            │ │ └──┘ │
│              │  │                                                          │ │      │
│  🎛️ 控制台   │  │  △ 月黑风高，雾气如潮水般在密林中翻涌。山路崎岖蜿蜒... │ │ [AI] │ │
│  📜 剧本     │  │                                                          │ │ 助手 │ │
│  👥 人物     │  │            雾姝                                          │ │      │
│              │  │     （手持摄魂铃，目光如炬，望着深林尽头）               │ │ 💬   │
│  🎬 场景     │  │                                                          │ │ 聊天 │
│  🌍 世界观   │  │  魂兮归来，引灵还乡。莫听风吟，莫看月光，唯我铃音...    │ │      │
│              │  │                                                          │ │      │
│  🎞️ 分镜     │  │                                                          │ │ ⌨️  │ │
│              │  │                                                          │ │ 输入 │ │
│              │  │                                                          │ │      │
└──────────────┴─────────────────────────────────────────────────────────────┴──────┘
```

### 侧边栏规范

#### 左侧导航栏

| 属性 | 值 |
|------|-----|
| **宽度** | 256px (lg: 288px) |
| **背景** | 白色 (#FFFFFF) |
| **边框** | 1px solid #D3C9B0 |
| **过渡动画** | 0.3s cubic-bezier(0.4, 0, 0.2, 1) |
| **可折叠** | ✅ 是 |

#### 右侧 AI 面板

| 属性 | 值 |
|------|-----|
| **宽度** | 320px |
| **背景** | 白色 (#FFFFFF) |
| **边框** | 1px solid #D3C9B0 (左侧) |
| **过渡动画** | 0.3s cubic-bezier(0.4, 0, 0.2, 1) |
| **可折叠** | ✅ 是 |

#### 边缘折叠按钮 (Edge Toggle)

| 属性 | 值 |
|------|-----|
| **位置** | fixed, top: 50%, transform: translateY(-50%) |
| **尺寸** | width: 1.25rem, height: 4rem |
| **背景** | 白色 |
| **边框** | 1px solid #D3C9B0 |
| **悬停效果** | 背景 #FAF7F0，颜色/边框 #C9A962 |
| **z-index** | 100 |

### 导航菜单结构 (Unified Nav)

六大核心子系统：

| 菜单项 | 图标 | 链接 | 说明 |
|--------|------|------|------|
| **控制台** | `layout-dashboard` | 01-dashboard.html | 项目仪表板 |
| **剧本** | `scroll` | 02-editor.html | 剧本编辑器 |
| **人物** | `users` | 03-characters.html | 人物管理 |
| **场景** | `clapperboard` | 05-scenes.html | 场景看板 |
| **世界观** | `globe` | 04-worldview.html | 世界观编辑 |
| **分镜** | `layout` | 06-storyboard.html | 分镜编辑器 |

### 导航激活状态

```css
/* 激活状态 */
.nav-item-active {
  background: #FAF7F0;
  color: #C9A962;
  font-weight: 600;
  border-right: 4px solid #C9A962;
  border-radius: 0;
}

/* 默认状态 */
.nav-item {
  color: #5C5548;
  border-radius: 0.5rem;
}

.nav-item:hover {
  background: #FAF7F0;
  color: #C9A962;
}
```

---

## AI 面板规范 (Unified AI Sidebar)

### 用户信息头部

位于侧栏最顶部，包含：

| 元素 | 规范 |
|------|------|
| **头像尺寸** | 36px (w-9) |
| **头像边框** | 1px solid #D3C9B0 |
| **在线状态** | 绿色呼吸灯 (w-3 h-3, bg-green-500, border-2) |
| **用户名** | 12px Bold, #1A1A1A |
| **Pro 标签** | 9px, uppercase, bg-[#C9A962]/10, text-[#C9A962] |
| **会员类型** | 9px, text-[#8B7355] |
| **设置按钮** | `lucide:settings` icon, hover: text-[#1A1A1A] |

### HTML 实现

```html
<div class="p-6 border-b border-[#D3C9B0]/50 bg-white">
  <div class="flex items-center justify-between p-2 rounded hover:bg-[#FAF7F0] transition-colors cursor-pointer group">
    <div class="flex items-center gap-3">
      <div class="relative">
        <img src="avatar.jpg" class="w-9 h-9 rounded-full object-cover border border-[#D3C9B0]">
        <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      </div>
      <div class="flex flex-col">
        <span class="text-xs font-bold text-[#1A1A1A]">Felix Vincent</span>
        <div class="flex items-center gap-1.5">
          <span class="text-[9px] text-[#C9A962] font-black uppercase tracking-widest bg-[#C9A962]/10 px-1 rounded">Pro</span>
          <span class="text-[9px] text-[#8B7355]">编剧资深会员</span>
        </div>
      </div>
    </div>
    <button class="text-gray-300 group-hover:text-[#1A1A1A] transition-colors">
      <iconify-icon icon="lucide:settings"></iconify-icon>
    </button>
  </div>
</div>
```

---

## 间距系统 (Spacing)

基于 **8px 网格系统**：

| 名称 | 值 | Tailwind | 应用场景 |
|------|-----|---------|---------|
| **xs** | 4px | text-xs | 最小间距 |
| **sm** | 8px | text-sm | 小间距 |
| **base** | 12px | text-base | 基础间距 |
| **md** | 16px | text-base | 中等间距 |
| **lg** | 20px | text-lg | 大间距 |
| **xl** | 24px | text-xl | 超大间距 |
| **2xl** | 32px | text-2xl | 两倍超大间距 |

---

## 圆角规范 (Border Radius)

| 名称 | 值 | Tailwind | 应用场景 |
|------|-----|---------|---------|
| **sm** | 4px | rounded-sm | 小圆角、标签 |
| **base** | 8px | rounded | 基础圆角、卡片 |
| **lg** | 12px | rounded-lg | 大圆角、模态框 |
| **xl** | 16px | rounded-xl | 超大圆角 |
| **2xl** | 24px | rounded-2xl | 大卡片 |
| **full** | 9999px | rounded-full | 完全圆角、头像 |

---

## 阴影规范 (Shadow)

| 名称 | 值 | 应用场景 |
|------|-----|---------|
| **subtle** | 0 2px 8px rgba(0,0,0,0.04) | 微妙阴影 |
| **base** | 0 4px 12px rgba(26,26,26,0.05) | 基础阴影 |
| **float** | 0 8px 24px rgba(26,26,26,0.08) | 浮动阴影 |
| **card-hover** | 0 10px 30px rgba(201,169,98,0.08) | 卡片悬停 |

---

## 纹理应用规范

### 纸质纹理

```css
.paper-texture {
  background-color: #F5F1E8;
  background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
}
```

### 应用区域

| 区域 | 是否应用纹理 |
|------|-------------|
| **主工作区背景** | ✅ 应用 |
| **仪表板主区域** | ✅ 应用 |
| **剧本详情页主区域** | ✅ 应用 |
| **白色侧边栏** | ❌ 不应用 |
| **右侧 AI 面板** | ❌ 不应用 |
| **A4 白色编辑器容器** | ❌ 不应用 |
| **模态框与弹窗** | ❌ 不应用 |

---

## 组件规范

### 玻璃拟态卡片 (Glass Card)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(211, 201, 176, 0.4);
  border-radius: 8px;
}
```

### 平面卡片 (Card Flat)

```css
.card-flat {
  background: white;
  border: 1px solid #D3C9B0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.card-flat:hover {
  border-color: #C9A962;
  box-shadow: 0 10px 30px rgba(201, 169, 98, 0.08);
}
```

### 按钮规范

| 类型 | 背景色 | 文字色 | Tailwind |
|------|--------|--------|---------|
| **主按钮** | #C9A962 | #FFFFFF | bg-[#C9A962] text-white |
| **主按钮悬停** | #A68A45 | #FFFFFF | hover:bg-[#A68A45] |
| **次按钮** | white | #1A1A1A | bg-white text-[#1A1A1A] |
| **文字按钮** | 透明 | #C9A962 | text-[#C9A962] |

---

## 动效设计

### 侧边栏过渡动画

```css
.sidebar-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-left-collapsed {
  width: 0 !important;
  min-width: 0 !important;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-20px);
}

.sidebar-right-collapsed {
  width: 0 !important;
  min-width: 0 !important;
  opacity: 0;
  pointer-events: none;
  transform: translateX(20px);
}
```

### View Transitions

```css
@view-transition {
  navigation: auto;
}

::view-transition-old(sidebar),
::view-transition-new(sidebar) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(main-content) {
  animation: 0.3s ease-out both fade-out;
}

::view-transition-new(main-content) {
  animation: 0.4s ease-in 0.1s both fade-in;
}

@keyframes fade-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(10px); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 响应式断点

| 断点 | 宽度范围 | 布局策略 |
|------|---------|---------|
| **xs** | 0-640px | 隐藏侧栏，全屏编辑 |
| **sm** | 640-768px | 隐藏侧栏，全屏编辑 |
| **md** | 768-1024px | 默认隐藏 AI 面板，侧划唤出 |
| **lg** | 1024-1280px | 三栏布局 |
| **xl** | 1280-1536px | 三栏布局（标准） |
| **2xl** | 1536px+ | 三栏布局（大屏） |

---

## 自定义滚动条

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #D3C9B0;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #C9A962;
}
```

---

## 剧本编辑器规范

### A4 纸张容器

| 属性 | 值 |
|------|-----|
| **宽度** | 210mm |
| **最小高度** | 297mm |
| **背景** | #FFFFFF |
| **内边距** | 25.4mm (1 inch) |
| **阴影** | 0 10px 40px rgba(0, 0, 0, 0.06) |
| **边框** | 1px solid #D3C9B0 |

### 剧本段落样式

| 元素 | 样式 |
|------|------|
| **场景标题** | background: #F0F0F0, padding: 8px 15px, font-weight: bold, border-bottom: 2px solid #1A1A1A |
| **对话块** | width: 80%, margin: 0 auto 30px, text-align: center |
| **角色名** | font-weight: bold, letter-spacing: 2px, display: block |
| **动作描述** | margin-bottom: 25px, leading-relaxed, indent-10 |

---

## 相关资源

- [完整设计系统应用指南](ref/完整设计系统应用指南.md) - 品牌价值观、完整规范
- [品牌标识规范](ref/剧灵·品牌标识规范.md) - HTML/CSS 实现示例
- [图标设计语言](ref/剧灵-图标设计语言.md) - 图标库完整规范
- [v4 原型](prototypes/v4/) - 实际 HTML/CSS 实现参考
- [中文短剧剧本格式规范 v2.0](../../script-format-v2.md) - 剧本格式标准

---

**v4.6 UNIFIED EDITION**

让灵感，在剧本中苏醒 ✨
