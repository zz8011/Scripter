/* ==================================================
   着陆页 Hero 组件
   ================================================== */

"use client"

import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative px-6 md:px-12 lg:px-24 mb-32 min-h-[70vh] flex items-center pt-32">
      <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left Content */}
        <div className="space-y-8">
          {/* Title Block */}
          <div className="space-y-2 opacity-0 animate-fade-in-up stagger-1">
            <p
              className="text-lg tracking-wider mb-2 italic font-mono-script"
              style={{ color: 'var(--brand-gold)' }}
            >
              THE SPIRIT OF CREATION
            </p>
            <h1 className="text-6xl md:text-8xl font-serif-display font-bold leading-tight" style={{ color: 'var(--white-bg)' }}>
              剧灵
            </h1>
            <p className="text-2xl md:text-3xl font-light" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              让灵感，在剧本中苏醒
            </p>
          </div>

          {/* Description */}
          <div className="max-w-md space-y-4 opacity-0 animate-fade-in-up stagger-2">
            <p
              className="text-lg leading-relaxed"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              剧灵，一支懂你的笔。我们深刻理解编剧的孤独与坚持，用智能工具陪伴你每一步创作。
            </p>
            <div className="flex items-center gap-3 font-medium" style={{ color: 'var(--brand-gold)' }}>
              <span className="h-px w-8" style={{ backgroundColor: 'rgba(201, 169, 98, 0.5)' }}></span>
              <span>沉浸式 · 智能 · 协作</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 opacity-0 animate-fade-in-up stagger-3">
            <Link
              href="/register"
              className="px-10 py-4 rounded-lg font-bold text-lg flex items-center gap-2 transition-all group"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--ink-black)',
                animation: 'goldPulse 2s infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-gold-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-gold)';
              }}
            >
              即刻起笔
              <iconify-icon
                icon="lucide:arrow-right"
                className="group-hover:translate-x-1 transition-transform"
              ></iconify-icon>
            </Link>
            <a
              href="#features"
              className="px-10 py-4 rounded-lg font-bold text-lg transition-all"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--white-bg)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              探索功能
            </a>
          </div>

          {/* Stats */}
          <div className="pt-8 flex gap-8 opacity-0 animate-fade-in-up stagger-3">
            <div className="flex flex-col">
              <span className="text-2xl font-serif-display font-bold" style={{ color: 'var(--white-bg)' }}>
                50k+
              </span>
              <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                已完成剧本
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif-display font-bold" style={{ color: 'var(--white-bg)' }}>
                98%
              </span>
              <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                作家好评率
              </span>
            </div>
          </div>
        </div>

        {/* Right Content - Video Preview */}
        <div className="relative hidden lg:block opacity-0 animate-fade-in-up stagger-2">
          {/* Decorative Background */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px]"
            style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)' }}
          ></div>

          {/* Video Card */}
          <div
            className="relative z-10 border rounded-2xl p-4 backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(26, 26, 26, 0.5)',
              borderColor: 'rgba(201, 169, 98, 0.2)'
            }}
          >
            <div className="aspect-video rounded-xl overflow-hidden relative group">
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <iconify-icon
                  icon="lucide:play-circle"
                  className="text-7xl opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ color: 'var(--brand-gold)' }}
                ></iconify-icon>
              </div>

              {/* Background Image */}
              <div
                className="w-full h-full bg-gradient-to-br opacity-50"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=1200)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  mixBlendMode: 'overlay'
                }}
              ></div>

              {/* Bottom Info Bar */}
              <div
                className="absolute bottom-4 left-4 right-4 p-4 rounded-lg border backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div
                      className="h-2 w-24 rounded"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    ></div>
                    <div
                      className="h-2 w-32 rounded"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    ></div>
                  </div>
                  <iconify-icon
                    icon="lucide:sparkles"
                    className="animate-pulse"
                    style={{ color: 'var(--brand-gold)' }}
                  ></iconify-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
