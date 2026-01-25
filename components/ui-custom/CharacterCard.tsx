/* ==================================================
   人物卡片组件 Character Card Component
   Character Card Component
   ================================================== */

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import { GlassCard } from './GlassCard';
import { IconifyIcon } from '@/components/IconifyIcon';
import type { Character } from '@/lib/types';

/* ==================================================
   组件接口 Component Interface
   ================================================== */

interface CharacterCardProps extends HTMLAttributes<HTMLDivElement> {
  character: Character;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

/* ==================================================
   人物卡片 Character Card Component
   ================================================== */

export function CharacterCard({
  character,
  onClick,
  onEdit,
  onDelete,
  className,
  ...props
}: CharacterCardProps) {
  // 性别图标
  const genderIcon = {
    male: 'mdi:gender-male',
    female: 'mdi:gender-female',
    other: 'mdi:gender-male-female',
  }[character.gender || 'other'];

  return (
    <GlassCard
      hover
      className={cn(
        // 布局
        'p-5',
        'flex flex-col items-center gap-3',

        // 相对定位
        'relative',

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

      {/* 头像 */}
      {character.avatar ? (
        <div
          className="rounded-full bg-cover bg-center"
          style={{
            width: '80px',
            height: '80px',
            backgroundImage: `url(${character.avatar})`,
          }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--brand-gold-light)',
          }}
        >
          <IconifyIcon
            icon="mdi:account"
            className="text-4xl"
            style={{ color: 'var(--brand-gold)' }}
          />
        </div>
      )}

      {/* 姓名和性别 */}
      <div className="flex items-center gap-2">
        <h3
          className="text-lg font-semibold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--ink-black)',
          }}
        >
          {character.name}
        </h3>
        <IconifyIcon
          icon={genderIcon}
          className="text-lg"
          style={{ color: 'var(--text-muted)' }}
        />
      </div>

      {/* 昵称（如果有） */}
      {character.nickname && (
        <p
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {character.nickname}
        </p>
      )}

      {/* 性格标签 */}
      {character.personality && character.personality.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {character.personality.slice(0, 3).map((trait, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded-md text-xs font-medium"
              style={{
                backgroundColor: 'var(--brand-gold-light)',
                color: 'var(--ink-black)',
              }}
            >
              {trait}
            </span>
          ))}
          {character.personality.length > 3 && (
            <span
              className="px-2 py-1 rounded-md text-xs font-medium"
              style={{
                backgroundColor: 'var(--brand-gold-light)',
                color: 'var(--ink-black)',
              }}
            >
              +{character.personality.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 诗号（如果有） */}
      {character.poem && (
        <p
          className="text-xs italic text-center line-clamp-2"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-muted)',
          }}
        >
          &ldquo;{character.poem}&rdquo;
        </p>
      )}
    </GlassCard>
  );
}
