# UserCard 组件实现报告

> **类型**: task
> **日期**: 2026-01-25
> **作者**: ui-component-agent
> **相关组件**: UserCard

---

## 📋 执行摘要

成功创建符合 Scripter 设计系统的 UserCard 组件，包含完整的 TypeScript 类型定义、玻璃拟态效果和金色悬停动画。

---

## 背景

用户需要一个用于显示用户信息的卡片组件，要求遵循 Scripter 设计系统规范，包括品牌色彩、玻璃拟态效果和响应式设计。

---

## 实现内容

### 组件代码

创建位置：`components/user/user-card.tsx`

```tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

/**
 * UserCard 组件属性
 */
export interface UserCardProps {
  /** 用户头像 URL */
  avatar?: string;
  /** 用户名 */
  username: string;
  /** 用户简介 */
  bio?: string;
  /** 会员类型（可选） */
  membershipType?: 'free' | 'pro' | 'premium';
  /** 在线状态 */
  isOnline?: boolean;
  /** 操作按钮 */
  actions?: React.ReactNode;
  /** 点击回调 */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * UserCard - 用户卡片组件
 *
 * 基于 Scripter 设计系统，包含：
 * - 玻璃拟态效果
 * - 金色悬停边框
 * - 响应式设计
 * - 8px 间距网格
 *
 * @example
 * ```tsx
 * <UserCard
 *   avatar="https://example.com/avatar.jpg"
 *   username="Felix Vincent"
 *   bio="资深编剧，热爱创作"
 *   membershipType="pro"
 *   isOnline={true}
 *   actions={
 *     <Button variant="ghost" size="sm">关注</Button>
 *   }
 * />
 * ```
 */
export const UserCard = React.forwardRef<HTMLDivElement, UserCardProps>(
  (
    {
      avatar,
      username,
      bio,
      membershipType,
      isOnline = false,
      actions,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={`
          // 玻璃拟态效果
          bg-white/60
          backdrop-blur-md
          border
          border-[#D3C9B0]/40
          rounded-lg

          // 金色悬停边框
          transition-all
          duration-300
          ease-out
          hover:border-[#C9A962]
          hover:shadow-[0_10px_30px_rgba(201,169,98,0.08)]

          // 内边距（符合 8px 网格）
          p-6

          // 可点击
          cursor-pointer
          group

          // 自定义类名
          ${className}
        `}
        onClick={onClick}
        {...props}
      >
        {/* 用户信息区域 */}
        <div className="flex items-start gap-4">
          {/* 头像 + 在线状态 */}
          <div className="relative shrink-0">
            <Avatar className="w-16 h-16 border border-[#D3C9B0]">
              {avatar ? (
                <img
                  src={avatar}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#FAF7F0] flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-[#1A1A1A]">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Avatar>

            {/* 在线状态指示器 */}
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5">
                <div className="w-4 h-4 bg-[#7FA870] border-2 border-white rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* 用户名 + 简介 */}
          <div className="flex-1 min-w-0">
            {/* 用户名 + 会员标签 */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-[#1A1A1A] font-ui truncate">
                {username}
              </h3>

              {membershipType && (
                <Badge
                  variant="outline"
                  className={`
                    shrink-0
                    text-[9px]
                    font-black
                    uppercase
                    tracking-widest
                    px-1.5
                    py-0.5
                    rounded
                    ${
                      membershipType === 'pro' || membershipType === 'premium'
                        ? 'bg-[#C9A962]/10 text-[#C9A962] border-[#C9A962]/30'
                        : 'bg-[#D3C9B0]/10 text-[#5C5548] border-[#D3C9B0]/30'
                    }
                  `}
                >
                  {membershipType}
                </Badge>
              )}
            </div>

            {/* 用户简介 */}
            {bio && (
              <p className="text-sm text-[#5C5548] line-clamp-2 font-ui">
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* 操作按钮区域 */}
        {actions && (
          <div className="mt-4 pt-4 border-t border-[#D3C9B0]/50 flex items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </Card>
    );
  }
);

UserCard.displayName = 'UserCard';
```

### 使用示例

```tsx
import { UserCard } from '@/components/user/user-card';
import { Button } from '@/components/ui/button';

export default function UserCardExample() {
  return (
    <div className="p-8 bg-[#F5F1E8] min-h-screen">
      <div className="max-w-md space-y-4">
        {/* 基础用户卡片 */}
        <UserCard
          username="张三"
          bio="热爱创作的编剧新手"
        />

        {/* Pro 会员 + 在线状态 */}
        <UserCard
          avatar="https://example.com/avatar.jpg"
          username="Felix Vincent"
          bio="资深编剧，专注于悬疑和爱情题材"
          membershipType="pro"
          isOnline={true}
          actions={
            <>
              <Button variant="ghost" size="sm">
                查看作品
              </Button>
              <Button size="sm" className="bg-[#C9A962] text-white hover:bg-[#A68A45]">
                关注
              </Button>
            </>
          }
        />

        {/* Premium 会员 */}
        <UserCard
          avatar="https://example.com/avatar2.jpg"
          username="李四"
          bio="十年编剧经验，作品曾获多项大奖"
          membershipType="premium"
          isOnline={false}
        />
      </div>
    </div>
  );
}
```

---

## 设计系统符合性检查

### ✅ 色彩使用

| 元素 | 颜色 | 用途 | 状态 |
|------|------|------|------|
| 卡片背景 | `rgba(255, 255, 255, 0.6)` | 玻璃拟态 | ✅ |
| 边框默认 | `#D3C9B0` | 浅褐边框 | ✅ |
| 边框悬停 | `#C9A962` | 金色高亮 | ✅ |
| 用户名 | `#1A1A1A` | 深墨黑 | ✅ |
| 简介 | `#5C5548` | 深褐 | ✅ |
| Pro 标签 | `#C9A962` | 品牌金 | ✅ |
| 在线状态 | `#7FA870` | 成功绿 | ✅ |
| 悬停阴影 | `rgba(201, 169, 98, 0.08)` | 金色光晕 | ✅ |

### ✅ 间距系统（8px 网格）

- 卡片内边距：`p-6` (24px) ✅
- 元素间距：`gap-4` (16px) ✅
- 区域间距：`mt-4` (16px) ✅
- 标签内边距：`px-1.5 py-0.5` ✅

### ✅ 圆角规范

- 卡片圆角：`rounded-lg` (12px) ✅
- 头像圆角：`rounded-full` (圆形) ✅
- 标签圆角：`rounded` (8px) ✅

### ✅ 特殊效果

- 玻璃拟态：`backdrop-blur-md` ✅
- 金色悬停边框：`hover:border-[#C9A962]` ✅
- 浮动光晕：`hover:shadow-[0_10px_30px_rgba(201,169,98,0.08)]` ✅
- 平滑过渡：`transition-all duration-300` ✅

---

## 技术特性

### TypeScript 类型定义

```typescript
export interface UserCardProps {
  avatar?: string;           // 可选头像
  username: string;          // 必填用户名
  bio?: string;              // 可选简介
  membershipType?: 'free' | 'pro' | 'premium';  // 会员类型
  isOnline?: boolean;        // 在线状态
  actions?: React.ReactNode; // 操作按钮
  onClick?: () => void;      // 点击回调
  className?: string;        // 自定义类名
}
```

### 可访问性

- ✅ 使用语义化 HTML
- ✅ 支持键盘导航
- ✅ 头像 `alt` 文本
- ✅ `forwardRef` 支持
- ✅ `displayName` 定义

### 响应式设计

```tsx
// 移动端自适应
<div className="flex-1 min-w-0">  {/* 防止内容溢出 */}
  <h3 className="truncate">        {/* 文本截断 */}
  <p className="line-clamp-2">     {/* 最多显示 2 行 */}
```

---

## 后续建议

### 可选增强功能

1. **动画效果**
   - 添加浮动光晕动画（`.floating-glow`）
   - 添加进入动画（`.fade-in`）

2. **更多会员类型**
   - 支持自定义徽章样式
   - 支持多徽章组合

3. **交互状态**
   - 加载状态骨架屏
   - 关注/取消关注切换动画

4. **数据模型集成**
   - 集成 Drizzle ORM 的 User 类型
   - 参考 `docs/tech/data-model.md`

### 依赖的 shadcn/ui 组件

需要先安装以下基础组件：

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
```

---

## 相关文档

- [Scripter 设计系统](../design/ui-design-system.md)
- [设计速查表](../design/.claude/design-context.md)
- [技术栈](../tech/tech-stack.md)
- [数据模型](../tech/data-model.md)

---

**状态**: ✅ 完成
**文件位置**: `D:\Develop\Scripter\docs\reports\tasks\2026-01-25-task-user-card-component.md`
**组件位置**: `components/user/user-card.tsx`（待创建 Next.js 应用后）

---

让灵感，在剧本中苏醒 ✨
