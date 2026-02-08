/* ==================================================
   AI 结果预览组件
   AI Result Preview Component
   ================================================== */

'use client';

import { Button } from '@/components/ui/button';
import { IconifyIcon } from '@/components/IconifyIcon';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/* ==================================================
   类型定义 Type Definitions
   ================================================== */

export interface AIResultPreviewProps {
  original: string;
  result: string;
  alternatives?: string[];
  explanation?: string;
  onAccept: (selectedResult: string) => void;
  onReject: () => void;
  type: 'polish' | 'expand' | 'fix';
}

/* ==================================================
   AI 结果预览组件
   ================================================== */

export function AIResultPreview({
  original,
  result,
  alternatives = [],
  explanation,
  onAccept,
  onReject,
  type,
}: AIResultPreviewProps) {
  const [selectedOption, setSelectedOption] = useState<number>(0); // 0 = 主要结果, 1-3 = 备选方案

  const getTitle = () => {
    switch (type) {
      case 'polish':
        return '润色结果';
      case 'expand':
        return '扩展结果';
      case 'fix':
        return '格式修复';
      default:
        return 'AI 结果';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'polish':
        return 'lucide:sparkles';
      case 'expand':
        return 'lucide:file-plus';
      case 'fix':
        return 'lucide:wrench';
      default:
        return 'lucide:wand-2';
    }
  };

  const getCurrentResult = () => {
    if (selectedOption === 0) return result;
    return alternatives[selectedOption - 1] || result;
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/50 backdrop-blur-sm',
        'flex items-center justify-center p-4',
        'animate-in fade-in duration-200'
      )}
      onClick={onReject}
    >
      <div
        className={cn(
          'w-full max-w-3xl max-h-[80vh]',
          'bg-white dark:bg-gray-900',
          'rounded-lg shadow-2xl',
          'overflow-hidden',
          'animate-in slide-in-from-bottom-4 duration-300'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <IconifyIcon
              icon={getIcon()}
              className="text-xl"
              style={{ color: 'var(--brand-gold)' }}
            />
            <h3 className="text-lg font-semibold">{getTitle()}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onReject}>
            <IconifyIcon icon="lucide:x" className="text-lg" />
          </Button>
        </div>

        {/* 内容区 */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* 原始内容 */}
          <div className="mb-4">
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              原始内容
            </div>
            <div
              className="p-3 rounded-md text-sm"
              style={{
                backgroundColor: 'var(--hover-bg)',
                color: 'var(--text-secondary)',
              }}
            >
              {original}
            </div>
          </div>

          {/* AI 结果 */}
          <div className="mb-4">
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              AI 建议
            </div>
            <div
              className="p-3 rounded-md text-sm border-2"
              style={{
                backgroundColor: 'var(--white-bg)',
                borderColor: 'var(--brand-gold)',
              }}
            >
              {getCurrentResult()}
            </div>
          </div>

          {/* 备选方案 */}
          {alternatives.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                备选方案
              </div>
              <div className="space-y-2">
                {alternatives.map((alt, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index + 1)}
                    className={cn(
                      'w-full p-3 rounded-md text-sm text-left',
                      'border transition-all',
                      'hover:border-gold-300 dark:hover:border-gold-700',
                      selectedOption === index + 1
                        ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="text-xs font-medium mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {index + 1}
                      </span>
                      <span className="flex-1">{alt}</span>
                      {selectedOption === index + 1 && (
                        <IconifyIcon
                          icon="lucide:check"
                          className="text-base flex-shrink-0"
                          style={{ color: 'var(--brand-gold)' }}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 说明 */}
          {explanation && (
            <div className="mb-4">
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                AI 说明
              </div>
              <div
                className="p-3 rounded-md text-sm"
                style={{
                  backgroundColor: 'var(--hover-bg)',
                  color: 'var(--text-secondary)',
                }}
              >
                {explanation}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div
          className="flex items-center justify-end gap-2 p-4 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <Button variant="ghost" onClick={onReject}>
            <IconifyIcon icon="lucide:x" className="mr-2" />
            拒绝
          </Button>
          <Button
            onClick={() => onAccept(getCurrentResult())}
            style={{
              backgroundColor: 'var(--brand-gold)',
              color: 'var(--button-text-on-dark)',
            }}
          >
            <IconifyIcon icon="lucide:check" className="mr-2" />
            接受
            {selectedOption > 0 && ` (方案${selectedOption})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
