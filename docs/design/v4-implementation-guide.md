# 剧灵 Scripter - v4 原型实现指南

> 本文档指导开发人员按照 `prototypes/v4/` 原型进行开发

---

## 原型文件结构

| 文件 | 页面类型 | 关键特性 |
|------|---------|---------|
| `00-welcome.html` | 欢迎页/登录 | 黑色背景、纸质纹理、浮动粒子 |
| `01-dashboard.html` | 控制台 | 三栏布局、项目卡片、AI 面板 |
| `02-editor.html` | 剧本编辑器 | A4 纸张、拖拽段落、可折叠侧边栏 |
| `03-characters.html` | 人物管理 | 卡片网格、方形头像 |
| `04-worldview.html` | 世界观编辑 | 知识卡片、关系图 |
| `05-scenes.html` | 场景看板 | 场景列表、预览图 |
| `06-storyboard.html` | 分镜编辑 | 分镜条目、视频导入 |

---

## 核心实现规范

### 1. 全局 HTML 结构

所有页面必须遵循以下结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>剧灵 - 页面标题</title>
    <meta name="view-transition" content="same-origin">
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Iconify Icons -->
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <!-- 自定义脚本 -->
    <script src="js/ai-chat.js"></script>
    <script src="js/modal.js"></script>
    <script src="js/drag-drop.js"></script>
    <!-- 字体 -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@600;700&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
    <style>
        /* CSS 变量 */
        :root {
            --paper-bg: #F5F1E8;
            --white-bg: #FFFFFF;
            --brand-gold: #C9A962;
            --brand-gold-dark: #A68A45;
            --text-main: #1A1A1A;
            --text-sub: #5C5548;
            --text-muted: #8B7355;
            --border-color: #D3C9B0;
            --hover-bg: #FAF7F0;
        }
        /* 字体类 */
        .font-ui { font-family: 'Inter', 'Noto Sans SC', sans-serif; }
        .font-display { font-family: 'Noto Serif SC', serif; }
        .font-editor { font-family: 'Courier Prime', 'Noto Sans SC', monospace; }
        /* 纸质纹理 */
        .paper-texture {
            background-color: var(--paper-bg);
            background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
        }
        /* 更多样式... */
    </style>
</head>
<body class="h-screen flex overflow-hidden font-ui">
    <!-- 页面内容 -->
</body>
</html>
```

### 2. 三栏布局标准结构

```html
<body class="h-screen flex overflow-hidden font-ui">

    <!-- 边缘折叠按钮 -->
    <button onclick="toggleSidebar('left')" class="edge-toggle toggle-left-edge">
        <iconify-icon id="icon-toggle-left" icon="lucide:chevron-left"></iconify-icon>
    </button>
    <button onclick="toggleSidebar('right')" class="edge-toggle toggle-right-edge">
        <iconify-icon id="icon-toggle-right" icon="lucide:chevron-right"></iconify-icon>
    </button>

    <!-- 左侧导航栏 -->
    <aside id="sidebar-left" class="integrated-sidebar w-64 lg:w-72 shrink-0 flex flex-col sidebar-transition overflow-hidden">
        <!-- Logo 区域 -->
        <a href="00-welcome.html" class="p-6 border-b border-[#D3C9B0]/50 flex items-center gap-3">
            <div class="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center">
                <img src="https://api.iconify.design/lucide/feather.svg?color=%23C9A962" class="w-5 h-5">
            </div>
            <div class="flex flex-col -gap-1">
                <span class="font-display font-bold text-2xl tracking-tighter text-[#1A1A1A]">剧灵</span>
                <span class="text-[8px] font-bold text-[#C9A962] tracking-widest uppercase -mt-1 opacity-70">scripter.art</span>
            </div>
        </a>

        <!-- 导航菜单 - 六大核心子系统 -->
        <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            <a href="01-dashboard.html" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded bg-[#FAF7F0] text-[#C9A962] font-semibold border-r-4 border-[#C9A962] rounded-r-none">
                <iconify-icon icon="lucide:layout-dashboard" class="text-xl"></iconify-icon>
                <span class="text-sm">控制台</span>
            </a>
            <a href="02-editor.html" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded text-[#5C5548] hover:bg-[#FAF7F0] transition-colors">
                <iconify-icon icon="lucide:scroll" class="text-xl"></iconify-icon>
                <span class="text-sm font-medium">剧本</span>
            </a>
            <!-- 人物、场景、世界观、分镜... -->
        </nav>

        <!-- 底部版本信息 -->
        <div class="p-4 border-t border-[#D3C9B0]/40 text-[10px] text-[#8B7355] font-bold text-center uppercase tracking-widest">
            v4.6 UNIFIED EDITION
        </div>
    </aside>

    <!-- 主工作区 -->
    <main class="flex-1 h-full flex flex-col paper-texture overflow-hidden">
        <!-- 顶部工具栏 -->
        <header class="h-16 bg-white/90 border-b border-[#D3C9B0] flex items-center justify-between px-8 z-10 shrink-0">
            <div class="flex items-center gap-4">
                <a href="01-dashboard.html" class="text-[#5C5548] hover:text-[#C9A962]">
                    <iconify-icon icon="lucide:arrow-left" class="text-xl"></iconify-icon>
                </a>
                <h1 class="font-display font-bold text-lg text-[#1A1A1A]">页面标题</h1>
            </div>
            <div class="flex items-center gap-4">
                <button class="px-5 py-1.5 bg-[#C9A962] text-white rounded text-xs font-bold hover:bg-[#A68A45]">
                    操作按钮
                </button>
            </div>
        </header>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
            <!-- 页面内容 -->
        </div>
    </main>

    <!-- 右侧 AI 面板 -->
    <aside id="sidebar-right" class="integrated-sidebar integrated-sidebar-right w-80 shrink-0 flex flex-col sidebar-transition overflow-hidden">
        <!-- 用户信息头部 -->
        <div class="p-6 border-b border-[#D3C9B0]/50 bg-white">
            <div class="flex items-center justify-between p-2 rounded hover:bg-[#FAF7F0] transition-colors cursor-pointer group">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <img src="avatar.jpg" class="w-9 h-9 rounded-full object-cover border border-[#D3C9B0]">
                        <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-[#1A1A1A]">用户名</span>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[9px] text-[#C9A962] font-black uppercase tracking-widest bg-[#C9A962]/10 px-1 rounded">Pro</span>
                            <span class="text-[9px] text-[#8B7355]">编剧资深会员</span>
                        </div>
                    </div>
                </div>
                <button class="text-gray-300 group-hover:text-[#1A1A1A]">
                    <iconify-icon icon="lucide:settings"></iconify-icon>
                </button>
            </div>
        </div>

        <!-- AI 聊天容器 -->
        <div id="ai-chat-container" class="flex flex-col flex-1 overflow-hidden">
            <!-- AI 聊天内容由 ai-chat.js 渲染 -->
        </div>
    </aside>

    <!-- JavaScript -->
    <script>
        function toggleSidebar(side) {
            const sidebar = document.getElementById(`sidebar-${side}`);
            const icon = document.getElementById(`icon-toggle-${side}`);
            const isCollapsed = sidebar.classList.toggle(`sidebar-${side}-collapsed`);
            if (side === 'left') {
                icon.setAttribute('icon', isCollapsed ? 'lucide:chevron-right' : 'lucide:chevron-left');
            } else {
                icon.setAttribute('icon', isCollapsed ? 'lucide:chevron-left' : 'lucide:chevron-right');
            }
        }
    </script>
</body>
</html>
```

### 3. 必需的 CSS 类

#### 侧边栏样式

```css
.integrated-sidebar {
    background: white;
    border-right: 1px solid var(--border-color);
    position: relative;
    z-index: 30;
    height: 100vh;
}

.integrated-sidebar-right {
    border-right: none;
    border-left: 1px solid var(--border-color);
}

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

#### 边缘折叠按钮

```css
.edge-toggle {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    width: 1.25rem;
    height: 4rem;
    background: white;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.edge-toggle:hover {
    background: var(--hover-bg);
    color: var(--brand-gold);
    border-color: var(--brand-gold);
}

.toggle-left-edge {
    left: 0;
    border-radius: 0 0.5rem 0.5rem 0;
    border-left: none;
}

.toggle-right-edge {
    right: 0;
    border-radius: 0.5rem 0 0 0.5rem;
    border-right: none;
}
```

#### 滚动条样式

```css
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--brand-gold);
}
```

#### 玻璃拟态卡片

```css
.glass-card {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(211, 201, 176, 0.4);
    border-radius: 8px;
}
```

### 4. Logo 规范

**重要**: Logo 必须使用 `lucide:feather` 图标（不是 `pen-tool`）

```html
<!-- 正确的 Logo 实现 -->
<div class="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center">
    <img src="https://api.iconify.design/lucide/feather.svg?color=%23C9A962" class="w-5 h-5">
</div>
<div class="flex flex-col -gap-1">
    <span class="font-display font-bold text-2xl tracking-tighter text-[#1A1A1A]">剧灵</span>
    <span class="text-[8px] font-bold text-[#C9A962] tracking-widest uppercase -mt-1 opacity-70">scripter.art</span>
</div>
```

### 5. 图标使用规范

| 功能 | Lucide Icon | 说明 |
|------|-------------|------|
| Logo | `lucide:feather` | 羽毛笔图标 |
| 控制台 | `lucide:layout-dashboard` | 仪表板 |
| 剧本 | `lucide:scroll` | 卷轴 |
| 人物 | `lucide:users` | 用户组 |
| 场景 | `lucide:clapperboard` | 场景板 |
| 世界观 | `lucide:globe` | 地球 |
| 分镜 | `lucide:layout` | 布局 |
| 返回 | `lucide:arrow-left` | 左箭头 |
| 设置 | `lucide:settings` | 设置齿轮 |
| AI | `lucide:sparkles` | 闪光 |

### 6. 导航激活状态

```css
/* 激活状态 */
.nav-item-active {
    background: #FAF7F0;
    color: #C9A962;
    font-weight: 600;
    border-right: 4px solid #C9A962;
    border-radius: 0;
}
```

```html
<!-- 激活的导航项 -->
<a href="current-page.html" class="nav-item nav-item-active flex items-center gap-3 px-3 py-2.5 rounded">
    <iconify-icon icon="lucide:layout-dashboard" class="text-xl"></iconify-icon>
    <span class="text-sm">控制台</span>
</a>

<!-- 未激活的导航项 -->
<a href="other-page.html" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded text-[#5C5548] hover:bg-[#FAF7F0] transition-colors">
    <iconify-icon icon="lucide:scroll" class="text-xl"></iconify-icon>
    <span class="text-sm font-medium">剧本</span>
</a>
```

### 7. AI 面板用户头部

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

## 页面实现检查清单

实现任何页面时，确保满足以下要求：

### 布局结构
- [ ] 使用三栏布局（左侧导航 + 主内容 + 右侧 AI 面板）
- [ ] 侧边栏宽度：左侧 256px，右侧 320px
- [ ] 侧边栏背景为白色 (#FFFFFF)
- [ ] 主内容区应用纸质纹理

### 导航
- [ ] Logo 使用 `lucide:feather` 图标
- [ ] Logo 包含中文"剧灵"和英文"scripter.art"
- [ ] 六大核心菜单全部存在
- [ ] 当前页面导航项处于激活状态（金色边框）
- [ ] 导航图标使用正确的 Lucide Icon

### AI 面板
- [ ] 用户信息头部包含头像、在线状态、Pro 标签
- [ ] 设置按钮使用 `lucide:settings` 图标
- [ ] 用户名、会员类型显示正确

### 交互
- [ ] 侧边栏可以折叠
- [ ] 折叠后边缘显示展开按钮
- [ ] 自定义滚动条样式生效
- [ ] 所有按钮有悬停效果

### 样式
- [ ] 字体使用 Inter + Noto Sans SC（UI）或 Noto Serif SC（标题）
- [ ] 品牌金色 #C9A962 用于高亮和激活状态
- [ ] 边框颜色 #D3C9B0
- [ ] 悬停背景 #FAF7F0

---

## Next.js 实现转换

当将 v4 原型转换为 Next.js 组件时：

### 目录结构

```
app/
├── layout.tsx          # 根布局
├── page.tsx            # 首页/控制台
├── dashboard/
│   └── page.tsx        # 控制台
├── editor/
│   └── page.tsx        # 剧本编辑器
├── characters/
│   └── page.tsx        # 人物管理
├── scenes/
│   └── page.tsx        # 场景看板
├── worldview/
│   └── page.tsx        # 世界观
└── storyboard/
    └── page.tsx        # 分镜编辑

components/
├── layout/
│   ├── app-layout.tsx       # 三栏布局
│   ├── navigation.tsx       # 左侧导航
│   └── ai-panel.tsx         # 右侧 AI 面板
└── ui/
    ├── button.tsx
    ├── card.tsx
    └── ...
```

### Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        paper: '#F5F1E8',
        brand: {
          gold: '#C9A962',
          'gold-dark': '#A68A45',
          'gold-light': '#E6D3A3',
        },
        ink: {
          black: '#1A1A1A',
          secondary: '#5C5548',
          muted: '#8B7355',
        },
        border: {
          DEFAULT: '#D3C9B0',
        },
        hover: '#FAF7F0',
      },
      fontFamily: {
        ui: ['Inter', 'Noto Sans SC', 'sans-serif'],
        display: ['Noto Serif SC', 'serif'],
        editor: ['Courier Prime', 'Noto Sans SC', 'monospace'],
      },
    },
  },
}
```

---

## 相关资源

- [UI 设计系统 v4.6](ui-design-system.md) - 完整设计规范
- [v4 原型](../prototypes/v4/) - HTML/CSS 参考实现
- [设计参考](../ref/) - 设计参考文档

---

**v4.6 UNIFIED EDITION**

让灵感，在剧本中苏醒 ✨
