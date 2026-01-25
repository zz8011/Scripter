/* ==================================================
   世界观设定卡片组件 Worldview Card Component
   Worldview Card Component
   ================================================== */

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { GlassCard } from './GlassCard';
import { IconifyIcon } from '@/components/IconifyIcon';
import type { WorldviewItem, WorldviewCategory } from '@/lib/types';

/* ==================================================
   组件接口 Component Interface
   ================================================== */

interface WorldviewCardProps extends HTMLAttributes<HTMLDivElement> {
  item: WorldviewItem;
  category?: WorldviewCategory;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

/* ==================================================
   世界观设定卡片 Worldview Card Component
   ================================================== */

export function WorldviewCard({
  item,
  category,
  onClick,
  onEdit,
  onDelete,
  className,
  ...props
}: WorldviewCardProps) {
  return (
    <GlassCard
      hover
      className={cn(
        // 布局
        'p-5',
        'flex flex-col gap-3',

        // 相对定位
        'relative',

        // 最小高度
        'min-h-[160px]',

        // 可点击样式
        onClick && 'cursor-pointer',

        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* 操作按钮 */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="编辑"
          >
            <IconifyIcon icon="mdi:pencil" className="text-base" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            style={{ color: 'var(--error-red)' }}
            title="删除"
          >
            <IconifyIcon icon="mdi:delete" className="text-base" />
          </button>
        )}
      </div>

      {/* 分类图标和名称 */}
      <div className="flex items-center gap-2 mb-1">
        {category?.icon && (
          <IconifyIcon
            icon={category.icon}
            className="text-xl"
            style={{ color: 'var(--brand-gold)' }}
          />
        )}
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          {category?.name || item.category}
        </span>
      </div>

      {/* 标题 */}
      <h3
        className="text-base font-semibold pr-16 line-clamp-2"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--ink-black)',
        }}
      >
        {item.title}
      </h3>

      {/* 描述 */}
      <p
        className="text-sm flex-1 line-clamp-3"
        style={{ color: 'var(--text-muted)' }}
      >
        {item.description}
      </p>

      {/* 标签 */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {item.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-md text-xs font-medium"
              style={{
                backgroundColor: 'var(--brand-gold-light)',
                color: 'var(--ink-black)',
              }}
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span
              className="px-2 py-0.5 rounded-md text-xs font-medium"
              style={{
                backgroundColor: 'var(--brand-gold-light)',
                color: 'var(--ink-black)',
              }}
            >
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}
