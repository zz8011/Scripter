/* ==================================================
   统计卡片组件 Stat Card Component
   Stat Card Component
   ================================================== */

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { GlassCard } from './GlassCard';
import { IconifyIcon } from '@/components/IconifyIcon';

/* ==================================================
   组件接口 Component Interface
   ================================================== */

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/* ==================================================
   统计卡片 Stat Card Component
   ================================================== */

export function StatCard({
  title,
  value,
  icon,
  iconColor = 'var(--brand-gold)',
  trend,
  className,
  ...props
}: StatCardProps) {
  return (
    <GlassCard
      hover
      className={cn(
        // 布局
        'p-6',
        'flex items-start justify-between',

        // 最小高度
        'min-h-[140px]',

        className
      )}
      {...props}
    >
      {/* 左侧：统计信息 */}
      <div className="flex flex-col gap-2">
        {/* 标题 */}
        <p
          className="text-sm font-medium"
          style={{
            color: 'var(--text-muted)',
          }}
        >
          {title}
        </p>

        {/* 数值 */}
        <p
          className="text-3xl font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--ink-black)',
          }}
        >
          {value}
        </p>

        {/* 趋势（如果有） */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            <IconifyIcon
              icon={trend.isPositive ? 'mdi:trending-up' : 'mdi:trending-down'}
            />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* 右侧：图标 */}
      <div
        className="flex items-center justify-center"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: `${iconColor}15`, // 15% opacity
        }}
      >
        <IconifyIcon
          icon={icon}
          className="text-2xl"
          style={{ color: iconColor }}
        />
      </div>
    </GlassCard>
  );
}
