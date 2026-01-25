/* ==================================================
   场景卡片组件 Scene Card Component
   Scene Card Component
   ================================================== */

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { GlassCard } from './GlassCard';
import { IconifyIcon } from '@/components/IconifyIcon';
import type { Scene } from '@/lib/types';

/* ==================================================
   组件接口 Component Interface
   ================================================== */

interface SceneCardProps extends HTMLAttributes<HTMLDivElement> {
  scene: Scene;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

/* ==================================================
   场景卡片 Scene Card Component
   ================================================== */

export function SceneCard({
  scene,
  onClick,
  onEdit,
  onDelete,
  className,
  ...props
}: SceneCardProps) {
  // 状态标签配置
  const statusConfig = {
    draft: {
      label: '草稿',
      icon: 'mdi:file-document-outline',
      color: 'var(--text-muted)',
      bgColor: 'var(--hover-bg)',
    },
    in_progress: {
      label: '进行中',
      icon: 'mdi:clock-outline',
      color: 'var(--info-blue)',
      bgColor: '#E8F2F8',
    },
    completed: {
      label: '已完成',
      icon: 'mdi:check-circle-outline',
      color: 'var(--success-green)',
      bgColor: '#E8F5E8',
    },
  };

  const config = statusConfig[scene.status];

  // 时间图标
  const timeIcon = {
    day: 'mdi:white-balance-sunny',
    night: 'mdi:moon-waning-crescent',
    dawn: 'mdi:weather-sunset-up',
    dusk: 'mdi:weather-sunset-down',
  }[scene.time || 'day'];

  // 环境图标
  const environmentIcon = {
    interior: 'mdi:home-variant',
    exterior: 'mdi:nature',
    both: 'mdi:home-switch',
  }[scene.environment || 'interior'];

  return (
    <GlassCard
      hover
      className={cn(
        // 布局
        'p-4',
        'flex flex-col gap-3',

        // 相对定位
        'relative',

        // 拖拽手柄样式（配合 dnd-kit）
        'group',

        // 可点击样式
        onClick && 'cursor-pointer',

        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* 顶部：场景编号和状态 */}
      <div className="flex items-start justify-between gap-2">
        {/* 场景编号 */}
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-mono font-bold px-2 py-1 rounded"
            style={{
              backgroundColor: 'var(--brand-gold-light)',
              color: 'var(--ink-black)',
            }}
          >
            E{scene.episodeNumber}S{scene.sceneNumber}
          </span>
        </div>

        {/* 状态标签 */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
          style={{
            backgroundColor: config.bgColor,
            color: config.color,
          }}
        >
          <IconifyIcon icon={config.icon} className="text-sm" />
          <span>{config.label}</span>
        </div>
      </div>

      {/* 场景标题 */}
      {scene.title && (
        <h3
          className="font-semibold line-clamp-2"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--ink-black)',
          }}
        >
          {scene.title}
        </h3>
      )}

      {/* 场景信息 */}
      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        {/* 时间 */}
        {scene.time && (
          <div className="flex items-center gap-1">
            <IconifyIcon icon={timeIcon} className="text-sm" />
            <span>
              {scene.time === 'day' && '日'}
              {scene.time === 'night' && '夜'}
              {scene.time === 'dawn' && '黎明'}
              {scene.time === 'dusk' && '黄昏'}
            </span>
          </div>
        )}

        {/* 环境 */}
        {scene.environment && (
          <div className="flex items-center gap-1">
            <IconifyIcon icon={environmentIcon} className="text-sm" />
            <span>
              {scene.environment === 'interior' && '内景'}
              {scene.environment === 'exterior' && '外景'}
              {scene.environment === 'both' && '内外景'}
            </span>
          </div>
        )}

        {/* 时长 */}
        {scene.duration && (
          <div className="flex items-center gap-1">
            <IconifyIcon icon="mdi:timer-outline" className="text-sm" />
            <span>{scene.duration}s</span>
          </div>
        )}
      </div>

      {/* 地点（如果有） */}
      {scene.location && (
        <div className="flex items-start gap-1.5">
          <IconifyIcon
            icon="mdi:map-marker-outline"
            className="text-sm mt-0.5"
            style={{ color: 'var(--brand-gold)' }}
          />
          <p
            className="text-xs line-clamp-2 flex-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {scene.location}
          </p>
        </div>
      )}

      {/* 操作按钮（悬停显示） */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: 'var(--text-muted)' }}
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
          >
            <IconifyIcon icon="mdi:delete" className="text-base" />
          </button>
        )}
      </div>

      {/* 拖拽手柄 */}
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <IconifyIcon
          icon="mdi:drag-vertical"
          className="text-lg"
          style={{ color: 'var(--text-muted)' }}
        />
      </div>
    </GlassCard>
  );
}
