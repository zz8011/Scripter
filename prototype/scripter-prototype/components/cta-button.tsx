"use client"

export function CTAButton() {
  return (
    <a
      href="/dashboard"
      className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
      style={{
        backgroundColor: 'var(--brand-gold)',
        color: '#FFFFFF',
        transition: 'background-color var(--transition-base), box-shadow var(--transition-base)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-gold-dark)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-gold)'}
    >
      <iconify-icon icon="lucide:pen-tool"></iconify-icon>
      开始创作
    </a>
  )
}
