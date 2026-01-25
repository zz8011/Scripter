/* ==================================================
   着陆页导航栏组件
   ================================================== */

"use client"

import Link from "next/link";

export function LandingNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-md border-b py-4 px-6 md:px-12 flex items-center justify-between transition-all duration-300"
      style={{
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
          style={{
            backgroundColor: 'var(--brand-gold)',
            boxShadow: '0 10px 30px rgba(201, 169, 98, 0.2)'
          }}
        >
          <iconify-icon
            icon="lucide:feather"
            className="text-xl"
            style={{ color: 'var(--ink-black)' }}
          ></iconify-icon>
        </div>
        <span className="text-2xl font-serif-display font-bold tracking-tight" style={{ color: 'var(--white-bg)' }}>
          剧灵{" "}
          <span className="font-normal text-sm ml-1 tracking-widest uppercase" style={{ color: 'var(--brand-gold)' }}>
            Scripter
          </span>
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <a
          href="#features"
          className="transition-colors"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
        >
          核心功能
        </a>
        <a
          href="#process"
          className="transition-colors"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
        >
          创作流程
        </a>
        <a
          href="#"
          className="transition-colors"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
        >
          专业方案
        </a>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm transition-colors px-4 py-2"
          style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--white-bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'; }}
        >
          登录
        </Link>
        <Link
          href="/register"
          className="px-6 py-2 rounded-md font-bold text-sm transition-all hover:shadow-lg"
          style={{
            backgroundColor: 'var(--brand-gold)',
            color: 'var(--ink-black)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--brand-gold-dark)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--brand-gold)';
          }}
        >
          开始创作
        </Link>
      </div>
    </header>
  );
}
