/* ==================================================
   着陆页核心功能展示组件
   ================================================== */

"use client"

import { useEffect, useRef } from "react";

const FEATURES = [
  {
    id: 1,
    icon: "lucide:pen-tool",
    title: "沉浸式编辑器",
    description: "基于 Courier Prime 行业标准的专业写作界面，支持全屏专注模式，消除灵感噪音。"
  },
  {
    id: 2,
    icon: "lucide:sparkles",
    title: "剧灵 AI 引擎",
    description: "突破卡顿的 AI 续写与桥段优化，基于千万级短剧数据训练，更懂当下爆点逻辑。"
  },
  {
    id: 3,
    icon: "lucide:users-2",
    title: "角色演化系统",
    description: "多维度角色档案管理，自动追踪人物弧光与冲突曲线，确保角色不再脸谱化。"
  },
  {
    id: 4,
    icon: "lucide:layout-dashboard",
    title: "场景库与世界观",
    description: "全局世界观设定面板，支持场景参考图 AI 生成，视觉化构建你的故事疆域。"
  }
];

export function LandingFeatures() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.feature-card-landing');
    cards.forEach((card) => {
      card.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observerRef.current?.observe(card);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <section id="features" className="px-6 md:px-12 lg:px-24 py-24" style={{ backgroundColor: '#0F0F0F' }}>
      {/* Section Header */}
      <div className="max-w-3xl mb-16">
        <p className="text-sm tracking-widest uppercase mb-4 font-mono-script" style={{ color: 'var(--brand-gold)' }}>
          Core Features
        </p>
        <h2 className="text-4xl md:text-5xl font-serif-display font-bold mb-6" style={{ color: 'var(--white-bg)' }}>
          重构你的创作流
        </h2>
        <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          我们剔除了所有干扰，只留下让你能全神贯注于故事的核心工具。
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="feature-card-landing p-8 rounded-xl space-y-6 transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: 'var(--ink-black)',
              border: '1px solid rgba(201, 169, 98, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.borderColor = 'var(--brand-gold)';
              e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(201, 169, 98, 0.3)';
              const icon = e.currentTarget.querySelector('iconify-icon');
              if (icon) {
                (icon as HTMLElement).style.transform = 'rotate(12deg) scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(201, 169, 98, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
              const icon = e.currentTarget.querySelector('iconify-icon');
              if (icon) {
                (icon as HTMLElement).style.transform = 'rotate(0deg) scale(1)';
              }
            }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)' }}
            >
              <iconify-icon
                icon={feature.icon}
                className="text-2xl transition-all duration-300"
                style={{ color: 'var(--brand-gold)' }}
              ></iconify-icon>
            </div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--white-bg)' }}>
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
