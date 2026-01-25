# 双色主题切换功能 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 为 Scripter Next.js 原型实现完整的浅色/深色双主题切换功能，支持用户偏好持久化和系统级自动检测。

**架构:** 基于 Context API 的主题管理系统 + CSS 变量动态切换 + localStorage 持久化。

**技术栈:** Next.js 14 App Router, Tailwind CSS v4, React Context, TypeScript, iconify-icon

---

## 项目背景

**项目位置:** `D:\Develop\Scripter\prototype\scripter-prototype`

**当前状态:**
- ✅ 使用 Tailwind CSS v4
- ✅ 已有完整的浅色主题 CSS 变量 (v4.6)
- ✅ 设计系统 v4.7 已定义深色主题规范
- ❌ 缺少深色主题 CSS 变量
- ❌ 缺少主题管理 Provider
- ❌ 缺少主题切换组件

**参考文档:**
- 设计系统: `docs/design/ui-design-system.md` (v4.7)
- 配色方案: `docs/design/ref/剧灵-双色配色方案.md`

---

## Task 1: 更新 CSS 变量 - 添加深色主题

**Files:**
- Modify: `prototype/scripter-prototype/app/globals.css:1-416`

**Step 1: 在 globals.css 中添加深色主题变量**

在现有 `:root` 选择器后添加 `.dark-mode` 选择器，包含完整的深色主题 CSS 变量。

**关键要求:**
- 版本号更新为 v4.7
- 保持品牌金色 `#C9A962` 在双主题中一致
- 深色背景: `#1A1A1A` → `#2A2A2A`
- 文字反转: `#1A1A1A` → `#FFFFFF`
- 阴影系统调整透明度
- 添加主题过渡动画

**预期 CSS 结构:**
```css
/* 在 :root 后添加 */
.dark-mode {
  /* 核心色彩 */
  --paper-bg: #1A1A1A;
  --surface: #2A2A2A;
  --ink-black: #FFFFFF;
  --brand-gold: #C9A962; /* 保持一致 */
  /* ... 其他变量 */
}

/* 添加主题过渡 */
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

**Step 2: 验证 CSS 变量**

重启开发服务器确认无语法错误:
```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
npm run dev
```

预期: 服务器正常启动，无 CSS 解析错误

**Step 3: Commit**

```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
git add app/globals.css
git commit -m "feat: add dark theme CSS variables (v4.7)"
```

---

## Task 2: 创建主题 Provider

**Files:**
- Create: `prototype/scripter-prototype/app/providers/theme-provider.tsx`

**Step 1: 创建 ThemeContext 类型定义**

创建 `app/providers/theme-provider.tsx`，定义:

```typescript
// 主题类型
type Theme = 'light' | 'dark' | 'system'

// Context 类型
interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark' // 解析后的实际主题
}
```

**Step 2: 实现主题 Provider 组件**

实现功能:
- `use client` 组件
- localStorage 持久化 (key: `scripter-theme`)
- 系统主题检测 `window.matchMedia('(prefers-color-scheme: dark)')`
- 防闪烁处理 (使用 nonce 提前注入)
- useEffect 同步 theme class 到 `document.documentElement`

**关键代码结构:**
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // 初始化主题
  useEffect(() => {
    const stored = localStorage.getItem('scripter-theme') as Theme | null
    const initialTheme = stored || 'system'
    setTheme(initialTheme)
  }, [])

  // 应用主题到 DOM
  useEffect(() => {
    const root = document.documentElement

    const resolveTheme = () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return theme
    }

    const resolved = resolveTheme()
    setActualTheme(resolved)

    if (resolved === 'dark') {
      root.classList.add('dark-mode')
    } else {
      root.classList.remove('dark-mode')
    }
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('scripter-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

**Step 3: 创建防闪烁脚本 (可选优化)**

创建 `app/providers/theme-script.ts` 用于服务端渲染时注入主题:

```typescript
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const theme = localStorage.getItem('scripter-theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (theme === 'dark' || (!theme && systemDark)) {
              document.documentElement.classList.add('dark-mode');
            }
          })();
        `,
      }}
    />
  )
}
```

**Step 4: 验证 TypeScript 编译**

```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
npx tsc --noEmit
```

预期: 无类型错误

**Step 5: Commit**

```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
git add app/providers/
git commit -m "feat: create theme provider with persistence and system detection"
```

---

## Task 3: 创建主题切换组件

**Files:**
- Create: `prototype/scripter-prototype/components/theme-toggle.tsx`

**Step 1: 创建主题切换按钮组件**

实现一个优雅的主题切换按钮:

```typescript
'use client'

import { useTheme } from '@/app/providers/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--brand-gold)] transition-all hover:bg-[var(--hover-bg)]"
      aria-label="切换主题"
    >
      {actualTheme === 'dark' ? (
        <>
          <iconify-icon icon="lucide:sun" class="text-lg" />
          <span className="text-sm font-medium">浅色</span>
        </>
      ) : (
        <>
          <iconify-icon icon="lucide:moon" class="text-lg" />
          <span className="text-sm font-medium">深色</span>
        </>
      )}
    </button>
  )
}
```

**Step 2: 验证组件导入**

确保 TypeScript 能正确解析 `@/` 路径别名。

**Step 3: Commit**

```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
git add components/theme-toggle.tsx
git commit -m "feat: create theme toggle button component"
```

---

## Task 4: 集成到应用布局

**Files:**
- Modify: `prototype/scripter-prototype/app/layout.tsx:1-93`
- Modify: `prototype/scripter-prototype/components/LeftSidebar.tsx` (或合适位置)

**Step 1: 更新根布局引入 ThemeProvider**

在 `app/layout.tsx` 中:

```typescript
import { ThemeProvider } from './providers/theme-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <head>
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
      </head>
      <body
        className={`${inter.variable} ${notoSansSC.variable} ${notoSerifSC.variable} ${courierPrime.variable} font-ui antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 2: 将主题切换按钮添加到左侧边栏**

在 `components/LeftSidebar.tsx` 中的合适位置添加 `<ThemeToggle />`，建议在 Logo 下方或菜单顶部。

**Step 3: 验证布局无破坏**

```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
npm run build
```

预期: 构建成功，无错误

**Step 4: Commit**

```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
git add app/layout.tsx components/LeftSidebar.tsx
git commit -m "feat: integrate theme provider and toggle button into layout"
```

---

## Task 5: 功能验证

**Files:**
- Manual Testing Required

**Step 1: 启动开发服务器**

```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
npm run dev
```

访问: `http://localhost:3000`

**Step 2: 测试主题切换**

验证清单:
- [ ] 点击主题切换按钮，颜色即时变化
- [ ] 浅色模式: 背景 #F5F1E8, 文字 #1A1A1A
- [ ] 深色模式: 背景 #1A1A1A, 文字 #FFFFFF
- [ ] 品牌金色 #C9A962 在双主题中保持一致
- [ ] 过渡动画流畅 (0.3s ease)

**Step 3: 测试持久化**

- [ ] 切换到深色模式
- [ ] 刷新页面 (F5)
- [ ] 确认主题保持为深色
- [ ] 检查 localStorage: `localStorage.getItem('scripter-theme')`

**Step 4: 测试系统主题检测**

- [ ] 设置为 `system` 模式
- [ ] 修改操作系统颜色偏好 (深色/浅色)
- [ ] 刷新页面
- [ ] 确认主题自动适配系统设置

**Step 5: 测试所有页面**

- [ ] Dashboard 页面
- [ ] Editor 页面
- [ ] Characters 页面
- [ ] Scenes 页面
- [ ] Worldview 页面
- [ ] Storyboard 页面

确认所有页面正确应用主题。

**Step 6: 测试响应式**

- [ ] 移动端视图 (320px - 640px)
- [ ] 平板视图 (768px - 1024px)
- [ ] 桌面视图 (1280px+)

确认主题切换按钮在所有尺寸下可见且可点击。

**Step 7: 测试无障碍**

- [ ] 按钮有 `aria-label`
- [ ] 键盘导航 (Tab 键聚焦, Enter 激活)
- [ ] 色彩对比度符合 WCAG AA 标准

**Step 8: 最终修复**

根据测试结果修复任何发现的问题。

**Step 9: Commit**

```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
git add .
git commit -m "test: validate dual theme functionality across all pages"
```

---

## Task 6: 代码优化与文档

**Files:**
- Update: `docs/design/ui-design-system.md`
- Create: `prototype/scripter-prototype/docs/theme-implementation.md` (可选)

**Step 1: 更新设计系统版本**

更新 `docs/design/ui-design-system.md`:
- 版本号: v4.7 → v4.8 (如需要)
- 添加主题切换使用说明
- 记录实现细节

**Step 2: 添加代码注释**

为关键代码添加注释:
- `theme-provider.tsx`: 主题解析逻辑
- `globals.css`: CSS 变量用途

**Step 3: 性能检查**

- [ ] 使用 React DevTools Profiler 检查性能
- [ ] 确认无不必要的重渲染
- [ ] localStorage 操作优化

**Step 4: 最终 Commit**

```bash
cd D:\Develop\Scripter\prototype\scripter-prototype
git add docs/ app/ components/
git commit -m "docs: update design system and add theme implementation notes"
```

---

## 验收标准

### 功能完整性
- ✅ 点击切换按钮能即时切换主题
- ✅ 刷新页面后主题选择保持
- ✅ 修改系统颜色偏好能自动适配
- ✅ 所有页面都能正确应用主题

### 视觉质量
- ✅ 深色主题所有颜色正确
- ✅ 品牌金色在双主题中一致
- ✅ 过渡动画流畅自然
- ✅ 无样式闪烁

### 代码质量
- ✅ TypeScript 无类型错误
- ✅ 遵循项目代码规范
- ✅ 组件职责清晰
- ✅ 无性能问题

### 用户体验
- ✅ 按钮位置合理易用
- ✅ 所有设备上可用
- ✅ 无障碍友好
- ✅ 无破坏性变更

---

## 参考资料

**设计文档:**
- `docs/design/ui-design-system.md` (v4.7)
- `docs/design/ref/剧灵-双色配色方案.md`

**技术文档:**
- Next.js App Router: https://nextjs.org/docs/app
- Tailwind CSS v4: https://tailwindcss.com/docs
- React Context: https://react.dev/reference/react/useContext

**类似实现:**
- next-themes: https://github.com/pacocoursey/next-themes (参考)

---

## 风险与注意事项

1. **CSS 变量命名冲突**
   - 确保深色主题变量名与浅色一致
   - 使用 `.dark-mode` class 覆盖，而非重复定义

2. **主题闪烁问题**
   - 使用 nonce 脚本提前注入主题
   - 避免服务端渲染与客户端不一致

3. **localStorage 可用性**
   - 私密模式下可能禁用
   - 添加 try-catch 处理

4. **系统主题监听**
   - 添加 `addEventListener('change')` 监听系统主题变化
   - 组件卸载时移除监听器

5. **性能影响**
   - 避免频繁写入 localStorage
   - 使用 debounce 优化主题切换

---

**计划版本:** v1.0
**创建日期:** 2026-01-25
**预计耗时:** 45-60 分钟
**难度等级:** 中等
**依赖任务:** 无
**后续任务:** 可能需要添加用户账户级主题设置
