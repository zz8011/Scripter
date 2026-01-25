/* ==================================================
   着陆页 CTA 邮箱注册组件
   ================================================== */

"use client"

import { useState } from "react";

export function LandingCTA() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email submission
    console.log("Email submitted:", email);
  };

  return (
    <section className="px-6 md:px-12 lg:px-24 py-32 text-center">
      <div
        className="max-w-4xl mx-auto p-12 md:p-20 rounded-3xl border relative overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom right, var(--ink-black), #0a0a0a)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{ backgroundColor: 'var(--brand-gold)' }}
        ></div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <h2
            className="text-4xl md:text-6xl font-serif-display font-bold"
            style={{ color: 'var(--white-bg)' }}
          >
            创作路上，你不孤单
          </h2>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            加入数万名专业编剧的选择。让每一秒灵感都能被精准捕获，让每一个故事都能熠熠生辉。
          </p>

          {/* Email Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="输入邮箱，开启创作之旅"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--white-bg)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-gold)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 font-bold rounded-lg whitespace-nowrap transition-colors"
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
              免费注册
            </button>
          </form>

          {/* Trust Badge */}
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: 'rgba(255, 255, 255, 0.3)' }}
          >
            无需信用卡 · 14天专业版试用
          </p>
        </div>

        {/* Decorative Orbs */}
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[80px]"
          style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)' }}
        ></div>
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px]"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
        ></div>
      </div>
    </section>
  );
}
