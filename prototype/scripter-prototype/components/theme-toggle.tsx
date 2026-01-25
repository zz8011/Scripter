"use client"

/**
 * 剧灵 Scripter - 主题切换按钮组件
 * 版本: v1.0
 *
 * 功能:
 * - 切换浅色/深色主题
 * - 显示当前主题状态
 * - 平滑过渡动画
 * - 可访问性支持（aria-label）
 */

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/app/providers/theme-provider"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 防止服务端渲染不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="relative h-9 w-9 rounded-md border border-[var(--border-color)] bg-[var(--white-bg)] hover:bg-[var(--hover-bg)] transition-all duration-200"
        aria-label="切换主题"
      >
        <div className="h-4 w-4" /> {/* 占位符 */}
      </button>
    )
  }

  const isDark = actualTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-9 rounded-md border border-[var(--border-color)] bg-[var(--white-bg)] hover:bg-[var(--hover-bg)] hover:border-[var(--brand-gold)] transition-all duration-200 flex items-center justify-center group shadow-sm hover:shadow-md"
      aria-label={isDark ? "切换到浅色主题" : "切换到深色主题"}
      title={isDark ? "切换到浅色主题" : "切换到深色主题"}
    >
      {/* 图标容器 */}
      <div className="relative h-4 w-4">
        {/* 太阳图标（浅色主题显示） */}
        <Sun
          className={`absolute inset-0 h-4 w-4 text-[var(--brand-gold)] transition-all duration-300 ${
            isDark
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100"
          }`}
          strokeWidth={2}
        />

        {/* 月亮图标（深色主题显示） */}
        <Moon
          className={`absolute inset-0 h-4 w-4 text-[var(--brand-gold)] transition-all duration-300 ${
            isDark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
          strokeWidth={2}
        />
      </div>

      {/* 悬停提示文本 */}
      <span className="sr-only">{isDark ? "切换到浅色主题" : "切换到深色主题"}</span>
    </button>
  )
}
