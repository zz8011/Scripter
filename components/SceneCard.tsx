/* ==================================================
   场景卡片组件 Scene Card Component
   Scene Card Component with Glass Morphism
   ================================================== */

'use client';

import { Scene } from '@/lib/types';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconifyIcon } from '@/components/IconifyIcon';
import { cn } from '@/lib/utils';

/* ==================================================
   类型定义 Type Definitions
   ================================================== */

interface SceneCardProps {
  scene: Scene;
  onEdit?: (scene: Scene) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

/* ==================================================
   工具函数 Utility Functions
   ================================================== */

// 获取环境标签文字
function getEnvironmentText(environment?: Scene['environment']): string {
  switch (environment) {
    case 'interior':
      return '室内';
    case 'exterior':
      return '室外';
    case 'both':
      return '内外';
    default:
      return '未知';
  }
}

// 获取时间标签文字
function getTimeText(time?: Scene['time']): string {
  switch (time) {
    case 'day':
      return '日';
    case 'night':
      return '夜';
    case 'dawn':
      return '黎明';
    case 'dusk':
      return '黄昏';
    default:
      return '未知';
  }
}

// 获取状态标签文字和样式
function getStatusInfo(status: Scene['status']) {
  switch (status) {
    case 'draft':
      return { text: '草稿', className: 'bg-gray-100 text-gray-700 border-gray-200' };
    case 'in_progress':
      return { text: '进行中', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'completed':
      return { text: '已完成', className: 'bg-green-50 text-green-700 border-green-200' };
  }
}

// 获取环境标签颜色
function getEnvironmentColor(environment?: Scene['environment']): string {
  switch (environment) {
    case 'interior':
      return 'var(--info-blue)'; // 蓝色
    case 'exterior':
      return 'var(--success-green)'; // 绿色
    case 'both':
      return 'var(--brand-gold)'; // 金色
    default:
      return 'var(--text-muted)';
  }
}

// 获取时间标签颜色
function getTimeColor(time?: Scene['time']): string {
  switch (time) {
    case 'day':
      return '#E8A858'; // 橙色
    case 'night':
      return '#5B7FC9'; // 深蓝
    case 'dawn':
      return '#F4C78C'; // 浅橙
    case 'dusk':
      return '#9B7BC9'; // 紫色
    default:
      return 'var(--text-muted)';
  }
}

/* ==================================================
   场景卡片组件 Scene Card Component
   ================================================== */

export function SceneCard({ scene, onEdit, onDelete, className }: SceneCardProps) {
  const statusInfo = getStatusInfo(scene.status);
  const environmentColor = getEnvironmentColor(scene.environment);
  const timeColor = getTimeColor(scene.time);

  return (
    <Card
      className={cn(
        // 玻璃拟态效果
        'backdrop-blur-md',
        'bg-white/70',
        'border border-[var(--glass-border)]',
        'shadow-[var(--shadow-base)]',
        'hover:shadow-[var(--shadow-card-hover)]',
        'transition-all duration-300',
        'group', // 用于拖拽手柄显示

        // 布局
        'relative',
        'overflow-hidden',

        // 交互
        'cursor-pointer',
        'hover:scale-[1.02]',

        className
      )}
    >
      {/* 状态指示条 */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          statusInfo.className
        )}
      />

      <CardHeader className="pb-3">
        {/* 场景编号和标题 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium" style={{ color: 'var(--brand-gold)' }}>
                第 {scene.episodeNumber} 集
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                场景 {scene.sceneNumber}
              </span>
            </div>
            <h3 className="font-display font-semibold text-base truncate" style={{ color: 'var(--ink-black)' }}>
              {scene.title || '未命名场景'}
            </h3>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(scene);
                }}
              >
                <IconifyIcon icon="mdi:pencil" className="text-base" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(scene.id);
                }}
              >
                <IconifyIcon icon="mdi:delete" className="text-base" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 地点和时间 */}
        {scene.location && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-secondary)' }}>
            <IconifyIcon icon="mdi:map-marker" className="text-base" style={{ color: 'var(--brand-gold)' }} />
            <span className="truncate">{scene.location}</span>
          </div>
        )}

        {/* 环境和时间标签 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 环境标签 */}
          {scene.environment && (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: environmentColor,
                color: environmentColor,
                backgroundColor: `${environmentColor}10`,
              }}
            >
              {getEnvironmentText(scene.environment)}
            </Badge>
          )}

          {/* 时间标签 */}
          {scene.time && (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: timeColor,
                color: timeColor,
                backgroundColor: `${timeColor}10`,
              }}
            >
              {getTimeText(scene.time)}
            </Badge>
          )}

          {/* 状态标签 */}
          <Badge variant="outline" className={cn('text-xs', statusInfo.className)}>
            {statusInfo.text}
          </Badge>
        </div>

        {/* 环境描述 */}
        {scene.content && (
          <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {/* 如果 content 是 TipTap JSON，这里简化处理，实际应该解析 */}
            {typeof scene.content === 'string' ? scene.content : '场景内容...'}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {/* 时长 */}
        {scene.duration && (
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <IconifyIcon icon="mdi:clock-outline" className="text-sm" />
            <span>{Math.floor(scene.duration / 60)}分钟</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
