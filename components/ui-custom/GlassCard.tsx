/* ==================================================
   玻璃拟态卡片组件 Glass Morphism Card
   Glass Morphism Card Component
   ================================================== */

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

/* ==================================================
   组件接口 Component Interface
   ================================================== */

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle';
  hover?: boolean;
  className?: string;
}

/* ==================================================
   玻璃拟态卡片 Glass Card Component
   ================================================== */

export function GlassCard({
  children,
  variant = 'default',
  hover = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        // 基础样式
        'rounded-lg border',

        // 玻璃拟态效果
        'backdrop-blur-md bg-opacity-60',
        'dark:bg-opacity-60',

        // 浅色主题
        'bg-white dark:bg-gray-900/60',
        'border-gray-200/40 dark:border-gray-700/40',

        // 阴影
        'shadow-sm',

        // 过渡动画
        'transition-all duration-300 ease-in-out',

        // 悬停效果
        hover && [
          'hover:shadow-lg',
          'hover:border-gold-500/50 dark:hover:border-gold-500/50',
          'hover:scale-[1.02]',
        ],

        // 变体
        variant === 'subtle' && [
          'bg-opacity-40 dark:bg-opacity-40',
          'border-opacity-30 dark:border-opacity-30',
        ],

        className
      )}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
