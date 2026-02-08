'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

/**
 * 全局错误边界组件
 *
 * 捕获应用中未处理的异常，显示友好的错误页面
 * 符合剧灵设计系统：纸质主题 + 品牌金色
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 在开发环境打印错误详情
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F1E8] paper-texture flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 错误卡片 */}
        <div className="bg-white/60 backdrop-blur-sm border border-[#D3C9B0] rounded-lg p-8 md:p-12 shadow-lg">
          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#C9A962]/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-[#C9A962]" strokeWidth={2} />
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A1A1A] text-center mb-4">
            哎呀，出了点小问题
          </h1>

          {/* 描述 */}
          <p className="text-base text-[#5C5548] text-center mb-8 leading-relaxed">
            别担心，这不是你的错。我们的系统遇到了一个意外情况。
            <br />
            你可以尝试刷新页面，或者返回首页继续创作。
          </p>

          {/* 开发环境显示错误详情 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-[#C96262]/10 border border-[#C96262]/30 rounded text-sm">
              <p className="font-semibold text-[#C96262] mb-2">开发环境错误详情：</p>
              <p className="text-[#5C5548] font-mono text-xs break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-[#8B7355] text-xs mt-2">
                  错误 ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* 重试按钮 */}
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C9A962] text-white font-medium rounded-lg hover:bg-[#A68A45] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <RefreshCw className="w-5 h-5" strokeWidth={2} />
              重试
            </button>

            {/* 返回首页按钮 */}
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#1A1A1A] font-medium rounded-lg border border-[#D3C9B0] hover:border-[#C9A962] hover:bg-[#FAF7F0] transition-all duration-300"
            >
              <Home className="w-5 h-5" strokeWidth={2} />
              返回首页
            </Link>
          </div>

          {/* 温暖提示 */}
          <div className="mt-8 pt-6 border-t border-[#D3C9B0]/50">
            <p className="text-sm text-[#8B7355] text-center">
              创作路上，你不孤单。如果问题持续出现，请联系我们的支持团队。
            </p>
          </div>
        </div>

        {/* 品牌标识 */}
        <div className="mt-8 flex justify-center items-center gap-3 opacity-60">
          <div className="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#C9A962]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <div className="flex flex-col -gap-1">
            <span className="font-display font-bold text-xl tracking-tighter text-[#1A1A1A]">
              剧灵
            </span>
            <span className="text-[8px] font-bold text-[#C9A962] tracking-widest uppercase -mt-1 opacity-70">
              scripter.art
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
