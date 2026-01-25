"use client"

/**
 * 剧灵 Scripter - 主题切换 Provider
 * 版本: v1.0
 *
 * 功能:
 * - 管理浅色/深色主题切换
 * - 持久化用户偏好到 localStorage
 * - 支持 system 主题自动切换
 * - 防止服务端渲染不匹配
 */

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: "light" | "dark" // 实际应用的主题（解析 system 后）
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  actualTheme: "light",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "scripter-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (typeof window !== "undefined" && (localStorage.getItem(storageKey) as Theme)) || defaultTheme
  )
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let resolvedTheme: "light" | "dark"

    if (theme === "system") {
      // 检测系统主题偏好
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      resolvedTheme = systemTheme
    } else {
      resolvedTheme = theme
    }

    setActualTheme(resolvedTheme)
    root.classList.add(resolvedTheme)
  }, [theme])

  // 监听系统主题变化（当 theme 为 system 时）
  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")

      const newTheme = mediaQuery.matches ? "dark" : "light"
      setActualTheme(newTheme)
      root.classList.add(newTheme)
    }

    // 现代浏览器使用 addEventListener
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    actualTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
