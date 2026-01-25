# Scripter 前端 MVP 开发实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 完成 Scripter 前端 MVP 开发，包括 7 个核心模块的完整实现

**架构:** 基于 Next.js 14 App Router，复用原型项目的布局和组件系统，实现完整的剧本创作平台

**技术栈:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS v4
- React 19
- @dnd-kit (拖拽功能)
- shadcn/ui 风格组件

---

## 项目状态

### 已完成（原型项目）
✅ Next.js 14 项目初始化
✅ Tailwind CSS v4 配置
✅ 字体系统（Inter, Noto Sans SC, Noto Serif SC, Courier Prime）
✅ 主题系统（浅色/深色双主题）
✅ 核心布局组件（MainLayout, LeftSidebar, AISidebar）
✅ 基础路由结构（6 个主页面）
✅ 设计系统 CSS 变量
✅ 玻璃拟态效果
✅ 着陆页

### 待完成（MVP 功能）
- [ ] 数据层集成（类型定义、API 客户端）
- [ ] Dashboard 完整功能
- [ ] Editor 剧本编辑器（TipTap 集成）
- [ ] Characters 人物管理
- [ ] Scenes 场景看板
- [ ] Worldview 世界观编辑
- [ ] Storyboard 分镜脚本
- [ ] AI 助手面板功能

---

## 实施计划概览

```
Phase 1: 项目迁移与基础数据层 (1-2天)
    ├─ 从原型项目复制到新仓库
    ├─ 配置类型系统
    └─ 创建 API 客户端基础

Phase 2: 核心页面完善 (3-4天)
    ├─ Dashboard 功能完整化
    ├─ Editor TipTap 集成
    ├─ Characters 人物卡片
    ├─ Scenes 拖拽看板
    ├─ Worldview 多维编辑
    └─ Storyboard 四栏排版

Phase 3: 交互功能 (2-3天)
    ├─ 拖拽功能集成
    ├─ 状态管理
    └─ 数据持久化

Phase 4: AI 功能集成 (2-3天)
    ├─ AI 面板交互
    ├─ 流式响应
    └─ 快捷 Skills

Phase 5: 验证与优化 (1-2天)
    ├─ 响应式测试
    ├─ 性能优化
    └── 主题切换测试
```

---

## Phase 1: 项目迁移与基础数据层 (Tasks 1-5)

### Task 1: 初始化新项目

**目标:** 在 `scripter-frontend` 目录创建完整的 Next.js 项目

**Files:**
- Create: `D:\Develop\Scripter\scripter-frontend\package.json`
- Create: `D:\Develop\Scripter\scripter-frontend\tsconfig.json`
- Create: `D:\Develop\Scripter\scripter-frontend\next.config.ts`
- Create: `D:\Develop\Scripter\scripter-frontend\tailwind.config.ts`

**Step 1: 创建 package.json**

```bash
cd "D:\Develop\Scripter\scripter-frontend"
```

创建文件 `package.json`:

```json
{
  "name": "scripter-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@tiptap/react": "^2.12.2",
    "@tiptap/starter-kit": "^2.12.2",
    "@tiptap/extension-placeholder": "^2.12.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "iconify-icon": "^3.0.2",
    "lucide-react": "^0.563.0",
    "next": "15.1.4",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.1.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**Step 2: 安装依赖**

```bash
npm install
```

Expected: 所有依赖成功安装，node_modules 目录创建

**Step 3: 创建 TypeScript 配置**

创建 `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 4: 创建 Next.js 配置**

创建 `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
```

**Step 5: 创建 Tailwind 配置**

创建 `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

**Step 6: 提交**

```bash
git add package.json tsconfig.json next.config.ts tailwind.config.ts
git commit -m "feat: initialize Next.js project with dependencies"
```

---

### Task 2: 复制核心文件

**目标:** 从原型项目复制已完成的组件和配置

**Files:**
- Copy: `app/globals.css`
- Copy: `app/layout.tsx`
- Copy: `app/providers/theme-provider.tsx`
- Copy: `components/MainLayout.tsx`
- Copy: `components/LeftSidebar.tsx`
- Copy: `components/AISidebar.tsx`
- Copy: `components/theme-toggle.tsx`
- Copy: `components/IconifyIcon.tsx`
- Copy: `lib/utils.ts`
- Copy: `lib/types.ts`

**Step 1: 复制目录结构**

```bash
# 创建目录
mkdir -p app/providers components lib public
mkdir -p app/dashboard app/editor app/characters app/scenes app/worldview app/storyboard
```

**Step 2: 复制核心文件**

```bash
# 从原型项目复制
cp "D:\Develop\Scripter\prototype\scripter-prototype\app\globals.css" "D:\Develop\Scripter\scripter-frontend\app\globals.css"
cp "D:\Develop\Scripter\prototype\scripter-prototype\app\layout.tsx" "D:\Develop\Scripter\scripter-frontend\app\layout.tsx"
cp "D:\Develop\Scripter\prototype\scripter-prototype\app\providers\theme-provider.tsx" "D:\Develop\Scripter\scripter-frontend\app\providers\theme-provider.tsx"
cp "D:\Develop\Scripter\prototype\scripter-prototype\components\MainLayout.tsx" "D:\Develop\Scripter\scripter-frontend\components\MainLayout.tsx"
cp "D:\Develop\Scripter\prototype\scripter-prototype\components\LeftSidebar.tsx" "D:\Develop\Scripter\scripter-frontend\components\LeftSidebar.tsx"
cp "D:\Develop\Scripter\prototype\scripter-prototype\components\AISidebar.tsx" "D:\Develop\Scripter\scripter-frontend\components\AISidebar.tsx"
cp "D:\Develop\Scripter\prototype\scripter-prototype\components\theme-toggle.tsx" "D:\Develop\Scripter\scripter-frontend\components\theme-toggle.tsx"
cp "D:\Develop\Scripter\prototype\scripter-prototype\components\IconifyIcon.tsx" "D:\Develop\Scripter\scripter-frontend\components\IconifyIcon.tsx"
```

**Step 3: 创建 lib 目录工具文件**

创建 `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;

  return formatDate(date);
}
```

**Step 4: 创建类型定义**

创建 `lib/types.ts`:

```typescript
/* ==================================================
   类型定义 Type Definitions
   ================================================== */

// 项目类型
export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  sceneCount: number;
  characterCount: number;
  progress: number;
  type: string;
  estimatedEpisodes: number;
}

// 人物类型
export interface Character {
  id: string;
  projectId: string;
  name: string;
  avatar?: string;
  nickname?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  personality?: string[];
  speechStyle?: string;
  behaviorPattern?: string;
  backstory?: string;
  poem?: string; // 诗号
  relationships?: Relationship[];
}

export interface Relationship {
  characterId: string;
  type: 'family' | 'friend' | 'enemy' | 'lover' | 'mentor' | 'other';
  description: string;
}

// 场景类型
export interface Scene {
  id: string;
  projectId: string;
  episodeNumber: number;
  sceneNumber: number;
  title?: string;
  location?: string;
  time?: 'day' | 'night' | 'dawn' | 'dusk';
  environment?: 'interior' | 'exterior' | 'both';
  status: 'draft' | 'in_progress' | 'completed';
  content?: string; // TipTap JSON
  duration?: number; // 时长（秒）
}

// 世界观设定类型
export interface WorldviewItem {
  id: string;
  projectId: string;
  category: 'era' | 'geography' | 'mystery' | 'social' | 'other';
  title: string;
  content: string;
  order: number;
}

// 分镜类型
export interface Storyboard {
  id: string;
  sceneId: string;
  shotNumber: number;
  shotType: 'long' | 'medium' | 'close' | 'extreme_close';
  cameraMovement?: string;
  visual: string;
  audio?: string;
  duration?: number;
}

// 导航项类型
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}
```

**Step 5: 创建首页**

创建 `app/page.tsx`:

```typescript
/* ==================================================
   首页 - 重定向到 Dashboard
   ================================================== */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}
```

**Step 6: 运行开发服务器验证**

```bash
npm run dev
```

Expected: 浏览器访问 http://localhost:3000/dashboard 正常显示

**Step 7: 提交**

```bash
git add .
git commit -m "feat: copy core components and layout from prototype"
```

---

### Task 3: 复制并完善页面

**目标:** 创建所有主页面基础结构

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/editor/page.tsx`
- Create: `app/characters/page.tsx`
- Create: `app/scenes/page.tsx`
- Create: `app/worldview/page.tsx`
- Create: `app/storyboard/page.tsx`

**Step 1: 复制 Dashboard 页面**

```bash
cp "D:\Develop\Scripter\prototype\scripter-prototype\app\dashboard\page.tsx" "D:\Develop\Scripter\scripter-frontend\app\dashboard\page.tsx"
```

**Step 2: 创建基础 Editor 页面**

创建 `app/editor/page.tsx`:

```typescript
"use client";

import { MainLayout } from "@/components/MainLayout";

export default function EditorPage() {
  return (
    <MainLayout
      header={
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
          剧本编辑器 Script Editor
        </h1>
      }
    >
      <div className="p-10">
        <div className="max-w-4xl mx-auto">
          <div className="a4-paper">
            <p style={{ color: 'var(--text-muted)' }}>
              剧本编辑器即将推出...
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
```

**Step 3: 创建基础 Characters 页面**

创建 `app/characters/page.tsx`:

```typescript
"use client";

import { MainLayout } from "@/components/MainLayout";

export default function CharactersPage() {
  return (
    <MainLayout
      header={
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
          人物管理 Characters
        </h1>
      }
    >
      <div className="p-10">
        <p style={{ color: 'var(--text-muted)' }}>
          人物管理即将推出...
        </p>
      </div>
    </MainLayout>
  );
}
```

**Step 4: 创建基础 Scenes 页面**

创建 `app/scenes/page.tsx`:

```typescript
"use client";

import { MainLayout } from "@/components/MainLayout";

export default function ScenesPage() {
  return (
    <MainLayout
      header={
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
          场景管理 Scenes
        </h1>
      }
    >
      <div className="p-10">
        <p style={{ color: 'var(--text-muted)' }}>
          场景看板即将推出...
        </p>
      </div>
    </MainLayout>
  );
}
```

**Step 5: 创建基础 Worldview 页面**

创建 `app/worldview/page.tsx`:

```typescript
"use client";

import { MainLayout } from "@/components/MainLayout";

export default function WorldviewPage() {
  return (
    <MainLayout
      header={
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
          世界观 Worldview
        </h1>
      }
    >
      <div className="p-10">
        <p style={{ color: 'var(--text-muted)' }}>
          世界观设定即将推出...
        </p>
      </div>
    </MainLayout>
  );
}
```

**Step 6: 创建基础 Storyboard 页面**

创建 `app/storyboard/page.tsx`:

```typescript
"use client";

import { MainLayout } from "@/components/MainLayout";

export default function StoryboardPage() {
  return (
    <MainLayout
      header={
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
          分镜脚本 Storyboard
        </h1>
      }
    >
      <div className="p-10">
        <p style={{ color: 'var(--text-muted)' }}>
          分镜脚本即将推出...
        </p>
      </div>
    </MainLayout>
  );
}
```

**Step 7: 验证所有页面可访问**

在浏览器中依次访问:
- http://localhost:3000/dashboard
- http://localhost:3000/editor
- http://localhost:3000/characters
- http://localhost:3000/scenes
- http://localhost:3000/worldview
- http://localhost:3000/storyboard

Expected: 所有页面正常显示，左侧导航栏可正常切换

**Step 8: 提交**

```bash
git add .
git commit -m "feat: create basic page structure for all modules"
```

---

### Task 4: 创建可复用 UI 组件

**目标:** 创建页面共用的 UI 组件

**Files:**
- Create: `components/ui/StatCard.tsx`
- Create: `components/ui/ProjectCard.tsx`
- Create: `components/ui/Modal.tsx`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Input.tsx`

**Step 1: 创建组件目录**

```bash
mkdir -p components/ui
```

**Step 2: 创建 StatCard 组件**

创建 `components/ui/StatCard.tsx`:

```typescript
/* ==================================================
   统计卡片组件
   ================================================== */

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="card-flat p-5 rounded">
      <p
        className="text-[10px] font-bold uppercase mb-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <iconify-icon
            icon={icon}
            style={{ color: 'var(--brand-gold)' }}
          />
          <p
            className="text-2xl font-display font-bold"
            style={{ color: 'var(--ink-black)' }}
          >
            {value}
          </p>
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-bold"
            style={{ color: trend.isPositive ? 'var(--success-green)' : 'var(--error-red)' }}
          >
            <iconify-icon
              icon={trend.isPositive ? 'lucide:trending-up' : 'lucide:trending-down'}
            />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 3: 创建 Button 组件**

创建 `components/ui/Button.tsx`:

```typescript
/* ==================================================
   按钮组件
   ================================================== */

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = "rounded font-bold transition-all inline-flex items-center justify-center";

    const variantStyles = {
      primary: "text-white",
      secondary: "text-white",
      outline: "border",
    };

    const sizeStyles = {
      sm: "px-3 py-1 text-xs",
      md: "px-5 py-1.5 text-xs",
      lg: "px-6 py-2 text-sm",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
        style={{
          backgroundColor: variant === 'primary' ? 'var(--brand-gold)' :
                           variant === 'secondary' ? 'var(--ink-black)' :
                           'transparent',
          borderColor: variant === 'outline' ? 'var(--border-color)' : undefined,
        }}
        onMouseEnter={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = 'var(--brand-gold-dark)';
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = 'var(--brand-gold-dark)';
          } else if (variant === 'outline') {
            e.currentTarget.style.borderColor = 'var(--brand-gold)';
            e.currentTarget.style.color = 'var(--brand-gold)';
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = 'var(--brand-gold)';
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = 'var(--ink-black)';
          } else if (variant === 'outline') {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'inherit';
          }
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**Step 4: 创建 Input 组件**

创建 `components/ui/Input.tsx`:

```typescript
/* ==================================================
   输入框组件
   ================================================== */

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 rounded border bg-white text-sm transition-all ${
            error ? 'border-red-500' : ''
          } ${className || ''}`}
          style={{
            borderColor: error ? undefined : 'var(--border-color)',
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--brand-gold)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 169, 98, 0.1)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
          {...props}
        />
        {error && (
          <p className="text-xs" style={{ color: 'var(--error-red)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Step 5: 创建 Modal 组件**

创建 `components/ui/Modal.tsx`:

```typescript
"use client";

/* ==================================================
   模态框组件 Modal Component
   ================================================== */

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        style={{ width: '700px', maxWidth: '90vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <iconify-icon icon="lucide:x" className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="px-6 py-4 border-t flex items-center justify-end gap-3"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 6: 提交**

```bash
git add components/ui
git commit -m "feat: add reusable UI components (Button, Input, Modal, StatCard)"
```

---

### Task 5: 创建状态管理 Hooks

**目标:** 创建简单的状态管理 hooks（暂不需要复杂状态管理库）

**Files:**
- Create: `lib/hooks/useProjects.ts`
- Create: `lib/hooks/useCharacters.ts`
- Create: `lib/hooks/useScenes.ts`
- Create: `lib/hooks/useLocalStorage.ts`

**Step 1: 创建 hooks 目录**

```bash
mkdir -p lib/hooks
```

**Step 2: 创建 useLocalStorage hook**

创建 `lib/hooks/useLocalStorage.ts`:

```typescript
/* ==================================================
   useLocalStorage Hook
   ================================================== */

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}
```

**Step 3: 创建 useProjects hook**

创建 `lib/hooks/useProjects.ts`:

```typescript
/* ==================================================
   useProjects Hook
   ================================================== */

import { useLocalStorage } from './useLocalStorage';
import { Project } from '../types';

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_20241201_wsjgq",
    name: "我送君归去",
    description: "一个关于离别与归来的湘西秘事",
    coverImage: "https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&q=80&w=1200",
    createdAt: new Date("2024-12-01T14:32:00"),
    updatedAt: new Date("2024-12-15T09:18:00"),
    wordCount: 48526,
    sceneCount: 82,
    characterCount: 12,
    progress: 60.5,
    type: "民国 / 悬疑 / 爱情",
    estimatedEpisodes: 80,
  },
  {
    id: "proj_20241215_mnts",
    name: "明月天涯",
    description: "武侠江湖的恩怨情仇",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200",
    createdAt: new Date("2024-12-15T10:00:00"),
    updatedAt: new Date("2024-12-20T16:45:00"),
    wordCount: 12580,
    sceneCount: 24,
    characterCount: 8,
    progress: 15.2,
    type: "武侠 / 动作",
    estimatedEpisodes: 60,
  },
];

export function useProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>('scripter-projects', MOCK_PROJECTS);

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects([...projects, newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const getProject = (id: string) => {
    return projects.find(p => p.id === id);
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProject,
  };
}
```

**Step 4: 提交**

```bash
git add lib/hooks
git commit -m "feat: add state management hooks (useLocalStorage, useProjects)"
```

---

## Phase 2: Editor 剧本编辑器实现 (Tasks 6-10)

### Task 6: 集成 TipTap 编辑器

**目标:** 实现剧本格式的 TipTap 编辑器

**Files:**
- Create: `components/editor/ScriptEditor.tsx`
- Create: `lib/tiptap/extensions.ts`
- Create: `lib/tiptap/config.ts`
- Modify: `app/editor/page.tsx`

**Step 1: 安装 TipTap 依赖**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-task-list @tiptap/extension-task-item
```

**Step 2: 创建剧本格式扩展**

创建 `lib/tiptap/extensions.ts`:

```typescript
/* ==================================================
   TipTap 剧本格式扩展
   ================================================== */

import { Extension } from '@tiptap/core';

// 场景标题
export const SceneHeading = Extension.create({
  name: 'sceneHeading',

  addAttributes() {
    return {
      location: {
        default: null,
      },
      time: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'h2[data-type="scene-heading"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['h2', { 'data-type': 'scene-heading', class: 'script-scene-header' }, 0];
  },
});

// 动作描述
export const Action = Extension.create({
  name: 'action',

  parseHTML() {
    return [
      {
        tag: 'p[data-type="action"]',
      },
    ];
  },

  renderHTML() {
    return ['p', { 'data-type': 'action', class: 'script-action' }, 0];
  },
});

// 人物名
export const Character = Extension.create({
  name: 'character',

  parseHTML() {
    return [
      {
        tag: 'p[data-type="character"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', { 'data-type': 'character', class: 'script-char-name text-center font-bold mt-6 mb-1' }, 0];
  },
});

// 对白
export const Dialogue = Extension.create({
  name: 'dialogue',

  parseHTML() {
    return [
      {
        tag: 'p[data-type="dialogue"]',
      },
    ];
  },

  renderHTML() {
    return ['p', { 'data-type': 'dialogue', class: 'w-[80%] mx-auto text-center mb-6' }, 0];
  },
});

// 内心独白 (OS)
export const OS = Extension.create({
  name: 'os',

  parseHTML() {
    return [
      {
        tag: 'p[data-type="os"]',
      },
    ];
  },

  renderHTML() {
    return ['p', { 'data-type': 'os', class: 'italic text-gray-600 mb-4' }, 0];
  },
});
```

**Step 3: 创建编辑器配置**

创建 `lib/tiptap/config.ts`:

```typescript
/* ==================================================
   TipTap 编辑器配置
   ================================================== */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { SceneHeading, Action, Character, Dialogue, OS } from './extensions';

export function useScriptEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
      SceneHeading,
      Action,
      Character,
      Dialogue,
      OS,
    ],
    content: '<p>开始你的剧本创作...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none font-editor',
      },
    },
  });

  return editor;
}
```

**Step 4: 创建 ScriptEditor 组件**

创建 `components/editor/ScriptEditor.tsx`:

```typescript
"use client";

/* ==================================================
   剧本编辑器组件 Script Editor Component
   ================================================== */

import { useScriptEditor } from '@/lib/tiptap/config';
import { Button } from '@/components/ui/Button';

export function ScriptEditor() {
  const editor = useScriptEditor();

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-3 rounded border"
           style={{ borderColor: 'var(--border-color)' }}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph')}
        >
          正文
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <iconify-icon icon="lucide:bold" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <iconify-icon icon="lucide:italic" />
        </Button>
      </div>

      {/* 编辑区域 */}
      <div className="a4-paper">
        <EditorContent editor={editor} />
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between text-xs"
           style={{ color: 'var(--text-muted)' }}>
        <span>{editor.storage.characterCount?.characters || 0} 字</span>
        <span>自动保存于 刚刚</span>
      </div>
    </div>
  );
}
```

**Step 5: 更新 Editor 页面**

修改 `app/editor/page.tsx`:

```typescript
"use client";

import { MainLayout } from "@/components/MainLayout";
import { ScriptEditor } from "@/components/editor/ScriptEditor";

export default function EditorPage() {
  return (
    <MainLayout
      header={
        <div className="flex items-center justify-between flex-1">
          <h1 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
            剧本编辑器 Script Editor
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              我送君归去 - 第 1 集
            </span>
          </div>
        </div>
      }
    >
      <div className="p-10">
        <div className="max-w-4xl mx-auto">
          <ScriptEditor />
        </div>
      </div>
    </MainLayout>
  );
}
```

**Step 6: 添加编辑器样式**

在 `app/globals.css` 末尾添加:

```css
/* ==================================================
   TipTap 编辑器样式
   ================================================== */

.ProseMirror {
  min-height: 297mm;
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: var(--text-muted);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* 剧本格式样式 */
.script-scene-header {
  background: #F0F0F0;
  padding: 8px 15px;
  font-weight: bold;
  margin-bottom: 25px;
  border-bottom: 2px solid var(--ink-black);
  text-transform: uppercase;
}

.script-char-name {
  font-weight: bold;
  letter-spacing: 2px;
  display: block;
}

.script-action {
  margin-bottom: 16px;
  line-height: 1.6;
}
```

**Step 7: 验证编辑器功能**

在浏览器访问 http://localhost:3000/editor，验证:
- [ ] 编辑器正常显示
- [ ] 可以输入文字
- [ ] 工具栏按钮可点击
- [ ] A4 纸张布局正确

**Step 8: 提交**

```bash
git add .
git commit -m "feat: integrate TipTap script editor"
```

---

### Task 7-10: 其他核心页面实现

**说明:** 由于篇幅限制，以下任务仅提供概要，详细实现类似 Dashboard 和 Editor

#### Task 7: Characters 人物管理
- 创建人物卡片组件
- 实现人物列表展示
- 添加新建/编辑人物表单
- AI 生成人设功能（预留接口）

#### Task 8: Scenes 场景看板
- 实现看板布局（3 列）
- 集成 @dnd-kit 拖拽功能
- 实现场景状态流转
- 自动重新编号

#### Task 9: Worldview 世界观编辑
- 创建多维设定编辑器
- 实现 4 大分类（时代/地理/神秘/社会）
- 结构化展示

#### Task 10: Storyboard 分镜脚本
- 实现四栏排版
- 添加镜头类型选择
- 运镜建议（预留接口）

---

## Phase 3: 拖拽功能集成 (Tasks 11-12)

### Task 11: 实现场景拖拽排序

**目标:** 在 Scenes 页面实现看板拖拽功能

**Files:**
- Create: `components/dnd/DraggableSceneCard.tsx`
- Create: `components/dnd/SceneColumn.tsx`
- Modify: `app/scenes/page.tsx`

**关键实现:**

```typescript
// 使用 @dnd-kit/core 和 @dnd-kit/sortable
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// 实现场景拖动
// 拖动后自动重新编号
```

### Task 12: 实现段落拖拽排序

**目标:** 在 Editor 中实现段落拖拽

**关键实现:**

```typescript
// TipTap + @dnd-kit 集成
// 段落拖动显示金色指示线
```

---

## Phase 4: AI 功能集成 (Tasks 13-15)

### Task 13: 实现流式响应组件

**目标:** 创建 AI 流式响应显示组件

**Files:**
- Create: `components/ai/StreamingResponse.tsx`
- Create: `lib/ai/mock-stream.ts` (模拟流式响应)

### Task 14: AI 助手面板交互

**目标:** 完善 AISidebar 组件交互

**Files:**
- Modify: `components/AISidebar.tsx`

### Task 15: 快捷 Skills 按钮

**目标:** 实现快捷 AI Skills

**功能:**
- 格式修复
- 对白润色
- 场景扩展
- 节奏分析

---

## Phase 5: 验证与优化 (Tasks 16-17)

### Task 16: 响应式测试

**检查点:**
- [ ] 移动端（< 768px）
- [ ] 平板（768px - 1024px）
- [ ] 桌面（> 1024px）

### Task 17: 性能优化

**优化项:**
- 代码分割（dynamic import）
- 图片优化
- 懒加载

---

## 执行总结

**完成标准:**
- ✅ 所有 6 个主页面可正常访问和操作
- ✅ Editor 支持 TipTap 编辑
- ✅ 拖拽功能正常工作
- ✅ AI 面板可交互
- ✅ 主题切换正常
- ✅ 响应式布局适配
- ✅ 所有测试通过

**预计时间:** 10-14 天

**关键风险:**
- TipTap 自定义扩展可能需要额外时间
- 拖拽功能性能优化
- AI 流式响应实现复杂度

**成功指标:**
- 用户可以在 30 分钟内完成第一个场景
- 所有功能符合 PRD v2.5 规范
- 代码通过 ESLint 检查

---

**让灵感，在剧本中苏醒** ✨
