"use client";

/* ==================================================
   左侧导航栏组件 Left Sidebar Component
   ================================================== */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/* 导航菜单配置 */
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "控制台", href: "/dashboard", icon: "lucide:layout-dashboard" },
  { id: "editor", label: "剧本", href: "/editor", icon: "lucide:scroll" },
  { id: "characters", label: "人物", href: "/characters", icon: "lucide:users" },
  { id: "scenes", label: "场景", href: "/scenes", icon: "lucide:clapperboard" },
  { id: "worldview", label: "世界观", href: "/worldview", icon: "lucide:globe" },
  { id: "storyboard", label: "分镜", href: "/storyboard", icon: "lucide:layout" },
];

interface LeftSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function LeftSidebar({ collapsed, onToggle }: LeftSidebarProps) {
  const pathname = usePathname();
  // Force HMR refresh
  void pathname;

  // 侧边栏宽度（lg 断点）
  const sidebarWidth = 288; // 18rem = 288px

  return (
    <>
      <aside
        className={cn(
          "integrated-sidebar w-64 lg:w-72 shrink-0 flex flex-col sidebar-transition relative",
          collapsed && "!w-0 lg:!w-0 min-w-0 opacity-0 pointer-events-none"
        )}
      >
        {/* 装饰背景 - 发光羽毛笔 */}
        <div className="sidebar-decoration">
          <div className="sidebar-glow" />
          <iconify-icon
            icon="lucide:feather"
            className="sidebar-feather animate-float-glow"
          />
        </div>

        {/* 内容层 */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo 区域 */}
          <Link
            href="/"
            className="p-6 border-b flex items-center gap-3 hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div
              className="w-8 h-8 rounded flex items-center justify-center border"
              style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}
            >
              <iconify-icon
                icon="lucide:feather"
                className="text-lg"
                style={{ color: 'var(--brand-gold)' }}
              />
            </div>
            <div className="flex flex-col -gap-1">
              <span
                className="font-display font-bold text-2xl tracking-tighter"
                style={{ color: 'var(--sidebar-text)' }}
              >
                剧灵
              </span>
              <span
                className="text-[8px] font-bold tracking-widest uppercase -mt-1 opacity-70"
                style={{ color: 'var(--brand-gold)' }}
              >
                scripter.art
              </span>
            </div>
          </Link>

          {/* 导航菜单 */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "nav-item flex items-center gap-4 px-6 py-4 rounded-xl transition-all group",
                    isActive
                      ? "border-l-3"
                      : ""
                  )}
                  style={isActive ? {
                    backgroundColor: 'var(--sidebar-active-bg)',
                    borderLeftColor: 'var(--sidebar-active-border)',
                    color: 'var(--sidebar-active-text)'
                  } : {
                    color: 'var(--sidebar-text-muted)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--sidebar-text)';
                      e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--sidebar-text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <iconify-icon icon={item.icon} className="text-xl" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 版本标识 */}
          <div
            className="p-4 border-t text-[10px] font-bold text-center uppercase tracking-widest bg-gradient-to-t from-black/5 to-transparent"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--sidebar-text-muted)'
            }}
          >
            v4.7 DUAL-THEME EDITION
          </div>
        </div>
      </aside>

      {/* 折叠/展开按钮 - 独立于侧边栏，不受 opacity 影响 */}
      <div
        className="fixed top-1/2 -translate-y-1/2 z-20 sidebar-transition no-print hidden lg:flex"
        style={{
          left: collapsed ? '0px' : `${sidebarWidth}px`
        }}
      >
        <button
          onClick={onToggle}
          className="w-6 h-12 border border-l-0 rounded-r flex items-center justify-center cursor-pointer hover:shadow-sm"
          style={{
            backgroundColor: 'var(--white-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--ink-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            e.currentTarget.style.borderColor = 'var(--brand-gold)';
            e.currentTarget.style.color = 'var(--brand-gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--white-bg)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--ink-secondary)';
          }}
          aria-label={collapsed ? "展开导航" : "折叠导航"}
        >
          <iconify-icon icon={collapsed ? "lucide:chevron-right" : "lucide:chevron-left"} className="text-sm" />
        </button>
      </div>
    </>
  );
}
