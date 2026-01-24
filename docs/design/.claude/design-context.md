# 剧灵 - 设计系统速查表

> Claude 每次实现 UI 前必须先阅读此文件
>
> **重要**：此文件包含所有关键设计参数，实现前必须参考

---

## 核心色彩（必读）

```css
/* 纸质背景系统 */
--paper-bg: #F5F1E8;        /* 主背景：温暖米色 */
--paper-texture: url('/natural-paper.png');

/* 导航栏 */
--nav-bg: #1A1A1A;          /* 左侧导航：深黑色（注意不是白色！） */
--nav-text: #FFFFFF;        /* 导航文字：白色 */

/* 品牌色系 */
--brand-gold: #C9A962;      /* 品牌金色：高亮、边框、AI 功能 */
--brand-gold-dark: #A68A45; /* 暗金色：hover 状态 */

/* 文字色系 */
--text-primary: #1A1A1A;    /* 主文字：深墨黑 */
--text-secondary: #5C5548;  /* 副文字：深褐 */

/* 表面与边框 */
--surface: #FFFFFF;         /* 编辑容器：纯白 */
--border: #D3C9B0;          /* 边框：浅褐 */
```

### 色彩使用规则

```
✅ 金色 #C9A962 用于：
- 高亮边框
- 按钮主要操作
- AI 功能相关元素
- 悬停状态

❌ 金色不用于：
- 大面积背景
- 普通文字
- 非重点元素
```

---

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

### 字体使用场景

| 场景 | 字体 | 说明 |
|------|------|------|
| UI 正文 | Inter + Noto Sans SC | 界面文字 |
| 品牌标题 | Noto Serif SC | 强调品牌感 |
| 剧本编辑 | Courier Prime | 等宽字体，适合编剧 |
| 代码显示 | JetBrains Mono | 代码块 |

---

## 间距系统（8px 网格）

```css
/* 必须使用以下间距值 */
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
```

### 使用示例

```css
/* ✅ 正确 */
padding: 16px 24px;
gap: 12px;
margin: 0 32px;

/* ❌ 错误 */
padding: 15px 23px;  /* 不在 8px 网格上 */
gap: 10px;
```

### 常用间距对照

| 用途 | 值 | 说明 |
|------|-----|------|
| 元素内边距（小） | 12px 16px | 小卡片、紧凑布局 |
| 元素内边距（中） | 16px 24px | 默认卡片 |
| 元素内边距（大） | 24px 32px | 大卡片、宽松布局 |
| 元素间距 | 12px-16px | 相邻元素之间 |
| 组间距 | 24px-32px | 不同组之间 |
| 区域间距 | 40px-48px | 大区域之间 |

---

## 圆角规范

```css
border-radius: 4px;    /* sm: 小元素、按钮 */
border-radius: 8px;    /* base: 默认卡片 */
border-radius: 12px;   /* lg: 大卡片 */
border-radius: 9999px; /* full: 胶囊按钮、标签 */
```

---

## 特殊效果（必读）

### 玻璃拟态

```css
.glass-effect {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

**适用场景**：所有卡片、面板、浮层

### 浮动光晕动画

```css
@keyframes float-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(201, 169, 98, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(201, 169, 98, 0.2);
  }
}

.floating-glow {
  animation: float-glow 3s ease-in-out infinite;
}
```

**适用场景**：统计卡片、重点元素

### 金色悬停边框

```css
.gold-hover-border {
  border: 1px solid #D3C9B0;
  transition: border-color 0.3s ease;
}

.gold-hover-border:hover {
  border-color: #C9A962;
}
```

**适用场景**：项目卡片、场景卡片

---

## 组件尺寸标准

### 导航栏

```css
/* 展开状态 */
.nav-expanded {
  width: 240px;
}

/* 折叠状态 */
.nav-collapsed {
  width: 72px;
}
```

### 模态框

```css
.modal {
  width: 700px;        /* 固定宽度，不可调整 */
  max-height: 80vh;    /* 最大高度 */
  max-width: 90vw;     /* 移动端响应式 */
}
```

**重要**：模态框宽度固定为 700px，不要使用其他值

### 编辑器（A4 纸张）

```css
.editor-a4 {
  width: 210mm;
  min-height: 297mm;
  padding: 25.4mm;      /* A4 标准页边距 */
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### 卡片尺寸

```css
/* 统计卡片 */
.stats-card {
  width: 280px;
  height: 140px;
}

/* 项目卡片 */
.project-card {
  width: 320px;
  min-height: 180px;
}

/* 场景卡片 */
.scene-card {
  width: 100%;
  min-height: 120px;
}
```

---

## 响应式断点

```css
/* 移动端 */
@media (max-width: 768px) {
  /* 单列布局 */
  /* 折叠导航 */
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  /* 两列布局 */
}

/* 桌面 */
@media (min-width: 1025px) {
  /* 三列布局 */
  /* 完整导航 */
}
```

---

## 动画时长

```css
/* 快速交互（按钮、链接） */
transition: all 0.15s ease;

/* 常规过渡（卡片、面板） */
transition: all 0.3s ease;

/* 慢速动画（页面切换、复杂效果） */
transition: all 0.5s ease;
```

---

## 图标规范

```
图标库：Lucide React
描边：2px stroke
标准尺寸：32x32px
小尺寸：24x24px
大尺寸：40x40px
```

---

## 阴影规范

```css
/* 轻微阴影（卡片） */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* 中等阴影（浮层） */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

/* 强烈阴影（模态框、下拉菜单） */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
```

---

## 常见错误（Claude 必须避免）

### ❌ 绝对不要做的

```css
/* 1. 左侧导航栏颜色错误 */
background: #FFFFFF;        /* ❌ 应该是 #1A1A1A */
background: #F5F1E8;        /* ❌ 应该是 #1A1A1A */

/* 2. 模态框宽度错误 */
width: auto;                /* ❌ 应该固定 700px */
width: 600px;               /* ❌ 应该是 700px */
width: 800px;               /* ❌ 应该是 700px */

/* 3. 非 8px 网格间距 */
padding: 10px 15px;         /* ❌ 应该是 8px 12px 或 16px 24px */
gap: 5px;                   /* ❌ 应该是 4px 或 8px */
margin: 20px;               /* ❌ 应该是 16px 或 24px */

/* 4. 金色滥用 */
background: #C9A962;        /* ❌ 金色不用于背景 */
color: #C9A962;             /* ❌ 金色不用于普通文字 */

/* 5. 缺少效果 */
/* ❌ 卡片没有玻璃拟态 */
.card {
  background: #FFFFFF;      /* 应该添加 backdrop-filter */
}

/* ❌ 没有过渡效果 */
.button {
  /* 应该添加 transition */
}
```

### ✅ 正确做法

```css
/* 1. 导航栏 */
.nav {
  background: #1A1A1A;      /* ✅ 正确 */
  color: #FFFFFF;           /* ✅ 正确 */
}

/* 2. 模态框 */
.modal {
  width: 700px;             /* ✅ 正确 */
  max-height: 80vh;         /* ✅ 正确 */
}

/* 3. 间距 */
.card {
  padding: 16px 24px;       /* ✅ 符合 8px 网格 */
  gap: 12px;                /* ✅ 符合 8px 网格 */
}

/* 4. 金色使用 */
.button-primary {
  border-color: #C9A962;    /* ✅ 用于边框 */
  color: #C9A962;           /* ✅ 用于按钮文字 */
}
.button-primary:hover {
  border-color: #C9A962;    /* ✅ hover 效果 */
}

/* 5. 特殊效果 */
.card {
  background: rgba(255, 255, 255, 0.6);  /* ✅ 玻璃拟态 */
  backdrop-filter: blur(8px);             /* ✅ 毛玻璃效果 */
  transition: all 0.3s ease;             /* ✅ 平滑过渡 */
}
```

---

## 实现前检查清单

**Claude 每次实现 UI 组件前必须确认：**

- [ ] 已阅读此设计系统文件
- [ ] 已查看原型图（如果存在）
- [ ] 确认使用了正确的颜色值
- [ ] 确认使用了正确的间距（8px 网格）
- [ ] 确认使用了正确的圆角值
- [ ] 确认添加了必要的过渡动画
- [ ] 确认实现了玻璃拟态（如适用）
- [ ] 确认组件尺寸符合标准

---

## 快速参考

### 最常用的设计令牌

```css
/* 颜色 */
--nav-bg: #1A1A1A;
--brand-gold: #C9A962;
--paper-bg: #F5F1E8;

/* 间距 */
--spacing-sm: 12px;
--spacing-md: 16px;
--spacing-lg: 24px;

/* 圆角 */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;

/* 过渡 */
--transition-fast: 0.15s ease;
--transition-normal: 0.3s ease;
```

### 常用组件类名

```
.glass-effect          /* 玻璃拟态 */
.gold-hover-border     /* 金色悬停边框 */
.floating-glow         /* 浮动光晕 */
.nav-expanded          /* 导航展开 */
.nav-collapsed         /* 导航折叠 */
```

---

**记住**：当不确定时，回来查看此文件！

---

**让设计，精准落地** ✨
