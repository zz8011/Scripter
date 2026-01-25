/* ==================================================
   项目卡片组件 Project Card Component
   Project Card Component
   ================================================== */

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { GlassCard } from './GlassCard';
import { IconifyIcon } from '@/components/IconifyIcon';
import type { Project } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/* ==================================================
   组件接口 Component Interface
   ================================================== */

interface ProjectCardProps extends HTMLAttributes<HTMLDivElement> {
  project: Project;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  className?: string;
}

/* ==================================================
   项目卡片 Project Card Component
   ================================================== */

export function ProjectCard({
  project,
  onClick,
  onEdit,
  onDelete,
  isSelected = false,
  className,
  ...props
}: ProjectCardProps) {
  // 计算进度百分比
  const progressPercent = Math.round(project.progress * 100);

  // 格式化更新时间
  const timeAgo = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <GlassCard
      hover
      className={cn(
        // 布局
        'p-5',
        'flex flex-col gap-4',

        // 相对定位（用于操作按钮）
        'relative',

        // 选中状态
        isSelected && [
          'ring-2',
          'ring-gold-500/50',
          'border-gold-500',
        ],

        // 可点击样式
        onClick && 'cursor-pointer',

        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* 顶部：标题和操作按钮 */}
      <div className="flex items-start justify-between gap-3">
        {/* 左侧：封面和标题 */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* 封面图 */}
          {project.coverImage ? (
            <div
              className="shrink-0 rounded-md bg-cover bg-center"
              style={{
                width: '64px',
                height: '64px',
                backgroundImage: `url(${project.coverImage})`,
              }}
            />
          ) : (
            <div
              className="shrink-0 rounded-md flex items-center justify-center"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--brand-gold-light)',
              }}
            >
              <IconifyIcon
                icon="mdi:file-document-outline"
                className="text-2xl"
                style={{ color: 'var(--brand-gold)' }}
              />
            </div>
          )}

          {/* 标题和描述 */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            {/* 标题 */}
            <h3
              className="font-semibold truncate"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--ink-black)',
              }}
            >
              {project.name}
            </h3>

            {/* 描述 */}
            {project.description && (
              <p
                className="text-sm line-clamp-2"
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <IconifyIcon icon="mdi:pencil" className="text-lg" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              style={{ color: 'var(--error-red)' }}
            >
              <IconifyIcon icon="mdi:delete" className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* 中部：统计信息 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 字数 */}
        <div className="flex items-center gap-2">
          <IconifyIcon
            icon="mdi:text-box"
            className="text-base"
            style={{ color: 'var(--brand-gold)' }}
          />
          <div className="flex flex-col">
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              字数
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--ink-black)' }}
            >
              {project.wordCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 场景数 */}
        <div className="flex items-center gap-2">
          <IconifyIcon
            icon="mdi:movie-open"
            className="text-base"
            style={{ color: 'var(--brand-gold)' }}
          />
          <div className="flex flex-col">
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              场景
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--ink-black)' }}
            >
              {project.sceneCount}
            </span>
          </div>
        </div>

        {/* 人物数 */}
        <div className="flex items-center gap-2">
          <IconifyIcon
            icon="mdi:account-group"
            className="text-base"
            style={{ color: 'var(--brand-gold)' }}
          />
          <div className="flex flex-col">
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              人物
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--ink-black)' }}
            >
              {project.characterCount}
            </span>
          </div>
        </div>
      </div>

      {/* 底部：进度条和时间 */}
      <div className="flex flex-col gap-2">
        {/* 进度条 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'var(--brand-gold)',
              }}
            />
          </div>
          <span
            className="text-xs font-medium min-w-[3rem] text-right"
            style={{ color: 'var(--text-muted)' }}
          >
            {progressPercent}%
          </span>
        </div>

        {/* 更新时间 */}
        <p
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          更新于 {timeAgo}
        </p>
      </div>
    </GlassCard>
  );
}
