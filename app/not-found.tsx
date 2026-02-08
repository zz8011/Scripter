import Link from 'next/link';
import { FileQuestion, Home, Search, Compass } from 'lucide-react';

/**
 * 404 页面 - 资源未找到
 *
 * 友好的 404 提示页面，符合剧灵设计系统
 * 提供导航链接帮助用户返回正常流程
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] paper-texture flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 404 卡片 */}
        <div className="bg-white/60 backdrop-blur-sm border border-[#D3C9B0] rounded-lg p-8 md:p-12 shadow-lg">
          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#C9A962]/10 rounded-full flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-[#C9A962]" strokeWidth={2} />
            </div>
          </div>

          {/* 404 标题 */}
          <div className="text-center mb-4">
            <h1 className="text-6xl md:text-7xl font-display font-bold text-[#C9A962] mb-2">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[#1A1A1A]">
              页面走丢了
            </h2>
          </div>

          {/* 描述 */}
          <p className="text-base text-[#5C5548] text-center mb-8 leading-relaxed">
            抱歉，我们找不到你要访问的页面。
            <br />
            可能是链接失效了，或者页面已经被移动到其他地方。
          </p>

          {/* 推荐链接 */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 text-center">
              你可以尝试以下操作：
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 返回首页 */}
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-4 bg-white border border-[#D3C9B0] rounded-lg hover:border-[#C9A962] hover:bg-[#FAF7F0] transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-[#C9A962]/10 rounded-full flex items-center justify-center group-hover:bg-[#C9A962]/20 transition-colors">
                  <Home className="w-5 h-5 text-[#C9A962]" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">返回首页</p>
                  <p className="text-xs text-[#8B7355]">回到控制台</p>
                </div>
              </Link>

              {/* 创建新项目 */}
              <Link
                href="/dashboard?action=new"
                className="flex items-center gap-3 p-4 bg-white border border-[#D3C9B0] rounded-lg hover:border-[#C9A962] hover:bg-[#FAF7F0] transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-[#C9A962]/10 rounded-full flex items-center justify-center group-hover:bg-[#C9A962]/20 transition-colors">
                  <Compass className="w-5 h-5 text-[#C9A962]" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">创建项目</p>
                  <p className="text-xs text-[#8B7355]">开始新的创作</p>
                </div>
              </Link>
            </div>
          </div>

          {/* 主要操作按钮 */}
          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C9A962] text-white font-medium rounded-lg hover:bg-[#A68A45] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Home className="w-5 h-5" strokeWidth={2} />
              返回控制台
            </Link>
          </div>

          {/* 温暖提示 */}
          <div className="mt-8 pt-6 border-t border-[#D3C9B0]/50">
            <p className="text-sm text-[#8B7355] text-center">
              创作路上，你不孤单。剧灵始终陪伴你的每一步创作旅程。
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
