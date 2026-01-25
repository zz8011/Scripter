/* ==================================================
   着陆页 Footer 组件
   ================================================== */

"use client"

export function LandingFooter() {
  return (
    <footer
      className="px-6 md:px-12 lg:px-24 py-12 border-t"
      style={{
        backgroundColor: '#0a0a0a',
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        {/* Brand Section */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: 'var(--brand-gold)' }}
            >
              <iconify-icon
                icon="lucide:feather"
                className="text-base"
                style={{ color: 'var(--ink-black)' }}
              ></iconify-icon>
            </div>
            <span className="text-xl font-serif-display font-bold" style={{ color: 'var(--white-bg)' }}>
              剧灵 Scripter
            </span>
          </div>
          <p
            className="text-sm max-w-xs leading-relaxed"
            style={{ color: 'rgba(255, 255, 255, 0.3)' }}
          >
            剧灵，一支懂你的笔。专为短剧创作打造，通过智能技术赋予灵感以形，让每一位创作者的故事都能在此优雅起笔。
          </p>
        </div>

        {/* Platform Links */}
        <div className="space-y-6">
          <h5 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--white-bg)' }}>
            平台
          </h5>
          <ul className="space-y-4 text-sm">
            {['剧本编辑器', '剧灵 AI', '多人协作', '资产库'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'; }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links */}
        <div className="space-y-6">
          <h5 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--white-bg)' }}>
            支持
          </h5>
          <ul className="space-y-4 text-sm">
            {['帮助中心', 'API 文档', '隐私政策', '服务条款'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'; }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-6"
        style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
      >
        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
          © 2024 Scripter Inc. All Rights Reserved. 剧灵创作平台 版权所有
        </p>
        <div className="flex gap-6">
          {[
            { icon: "ri:wechat-fill", label: "微信" },
            { icon: "ri:tiktok-fill", label: "抖音" },
            { icon: "ri:github-fill", label: "GitHub" }
          ].map((social) => (
            <a
              key={social.icon}
              href="#"
              className="transition-colors"
              style={{ color: 'rgba(255, 255, 255, 0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.2)'; }}
              aria-label={social.label}
            >
              <iconify-icon icon={social.icon} className="text-xl"></iconify-icon>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
