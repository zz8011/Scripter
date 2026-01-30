/* ==================================================
   剧本封面卡片组件 - 电影海报风格
   Script Cover Card Component - Movie Poster Style
   ================================================== */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { IconifyIcon } from '@/components/IconifyIcon';
import type { Project } from '@/lib/api/projects';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ProjectCardPosterProps {
  project: Project & {
    wordCount?: number;
    sceneCount?: number;
    characterCount?: number;
  };
  onClick?: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  className?: string;
}

/* 剧本类型映射 */
const SCRIPT_TYPE_LABELS = {
  'short-drama': '短剧',
  'movie': '电影',
  'series': '连续剧',
};

/* 获取剧本类型图标 */
function getTypeIcon(type: Project['scriptType']): string {
  switch (type) {
    case 'short-drama':
      return 'lucide:film';
    case 'movie':
      return 'lucide:clapperboard';
    case 'series':
      return 'lucide:tv-2';
    default:
      return 'lucide:file-text';
  }
}

/* 阶段配置 - 使用剧灵设计系统 */
function getStageConfig(stage: Project['currentStage']) {
  const stages = {
    'worldview': { label: '世界观', icon: 'lucide:globe' },
    'character': { label: '人物', icon: 'lucide:users' },
    'script': { label: '剧本', icon: 'lucide:scroll-text' },
    'optimize': { label: '优化', icon: 'lucide:sparkles' },
    'production': { label: '制作', icon: 'lucide:clapperboard' },
  };
  return stages[stage];
}

export function ProjectCardPoster({
  project,
  onClick,
  onEdit,
  onDelete,
  className,
}: ProjectCardPosterProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 格式化更新时间
  const timeAgo = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
    locale: zhCN,
  });

  // 类型标签
  const typeLabel = SCRIPT_TYPE_LABELS[project.scriptType];
  const typeIcon = getTypeIcon(project.scriptType);

  // 当前阶段配置
  const stageConfig = getStageConfig(project.currentStage);

  // 进度百分比
  const progressPercent = project.targetEpisodes > 0
    ? Math.min(((project.sceneCount || 0) / project.targetEpisodes) * 100, 100)
    : 0;

  return (
    <div
      className={cn(
        'group relative aspect-[2/3] overflow-hidden cursor-pointer',
        'transition-all duration-500 ease-out',
        'hover:shadow-2xl',
        'hover:scale-[1.02]',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        borderRadius: 'var(--radius)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 背景层 - 纸张质感 */}
      <div
        className="absolute inset-0 transition-transform duration-700"
        style={{
          backgroundColor: 'var(--paper-bg)',
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
          backgroundSize: '300px',
        }}
      />

      {/* 金色装饰渐变 - 根据剧灵主题色 */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-opacity duration-500',
          isHovered ? 'opacity-100' : 'opacity-60'
        )}
        style={{
          background: 'radial-gradient(circle at 30% 20%, var(--brand-gold-light) 0%, transparent 50%), radial-gradient(circle at 70% 80%, var(--brand-gold) 0%, transparent 50%)',
        }}
      />

      {/* 底部深色渐变 - 确保文字可读 */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"
      />

      {/* 左上角 - 类型图标 */}
      <div className="absolute top-4 left-4 z-10">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300"
          style={{
            backgroundColor: 'var(--logo-bg)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <IconifyIcon
            icon={typeIcon}
            className="text-lg"
            style={{ color: 'var(--logo-icon)' }}
          />
        </div>
      </div>

      {/* 右上角 - 题材标签 */}
      {project.genre && project.genre.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-300"
            style={{
              backgroundColor: 'var(--logo-bg)',
              color: 'var(--logo-icon)',
              borderColor: 'var(--border-color)',
            }}
          >
            {project.genre[0]}
          </div>
        </div>
      )}

      {/* 操作按钮 - 悬停时显示 */}
      <div
        className={cn(
          'absolute top-4 right-14 z-10 flex items-center gap-2 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(e);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: 'var(--white-bg)',
              borderColor: 'var(--border-color)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <IconifyIcon
              icon="lucide:pencil"
              className="text-sm"
              style={{ color: 'var(--ink-secondary)' }}
            />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: 'var(--error-red)',
              border: '1px solid var(--error-red)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <IconifyIcon icon="lucide:trash-2" className="text-sm text-white" />
          </button>
        )}
      </div>

      {/* 底部信息层 */}
      <div className="absolute inset-x-0 bottom-0 p-5 z-10">
        <div className="flex flex-col gap-3">
          {/* 顶部标签栏 */}
          <div className="flex items-center gap-2">
            {/* 类型标签 */}
            <div
              className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)',
              }}
            >
              {typeLabel}
            </div>

            {/* 阶段标签 */}
            <div className="flex items-center gap-1 px-2 py-1 rounded border backdrop-blur-sm">
              <IconifyIcon icon={stageConfig.icon} className="text-xs" style={{ color: 'var(--brand-gold)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--overlay-text)' }}>
                {stageConfig.label}
              </span>
            </div>
          </div>

          {/* 项目标题 */}
          <h3
            className="font-display font-bold text-xl leading-tight line-clamp-2"
            style={{
              color: 'var(--overlay-text)',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {project.name}
          </h3>

          {/* 进度信息 - 悬停展开 */}
          <div
            className={cn(
              'space-y-2 overflow-hidden transition-all duration-500',
              isHovered ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            {/* 集数进度 */}
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--overlay-text-muted)' }}>
                集数进度
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--overlay-text)' }}>
                {project.sceneCount || 0} / {project.targetEpisodes}
              </span>
            </div>

            {/* 进度条 */}
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--brand-gold)',
                }}
              />
            </div>

            {/* 统计信息 */}
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--overlay-text-muted)' }}>
              <span>{project.wordCount?.toLocaleString() || 0} 字</span>
              <span>·</span>
              <span>{project.characterCount || 0} 人物</span>
            </div>
          </div>

          {/* 底部元数据 */}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--overlay-text-muted)' }}>
              更新于 {timeAgo}
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--brand-gold)' }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--brand-gold)' }}>
                进行中
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 装饰边框 - 使用剧灵的边框样式 */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-color)',
        }}
      />
    </div>
  );
}
