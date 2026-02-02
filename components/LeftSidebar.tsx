"use client";

/* ==================================================
   左侧导航栏组件 Left Sidebar Component
   ================================================== */

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconifyIcon } from "@/components/IconifyIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* 导航菜单配置 */
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "控制台", href: "/dashboard", icon: "lucide:layout-dashboard" },
  { id: "agents", label: "Agent 工作台", href: "/agents", icon: "lucide:bot" },
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

/* ==================================================
   用户菜单组件 User Menu Component
   ================================================== */

function UserMenu() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 模拟用户信息（实际应从 API 获取）
  const user = {
    name: '剧灵用户',
    email: 'user@example.com',
    avatar: undefined,
  };

  /**
   * 处理登出
   */
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // 清除本地状态
        localStorage.removeItem('scripter_remember_email');
        sessionStorage.removeItem('scripter_redirect_after_login');
        
        // 跳转到登录页
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-full p-4 border-t flex items-center gap-3 hover:bg-black/5 transition-colors outline-none"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback
              className="text-sm"
              style={{ backgroundColor: 'var(--brand-gold-light)', color: 'var(--brand-gold-dark)' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--sidebar-text)' }}>
              {user.name}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--sidebar-text-muted)' }}>
              {user.email}
            </p>
          </div>
          <IconifyIcon
            icon="lucide:chevrons-up-down"
            className="text-sm shrink-0"
            style={{ color: 'var(--sidebar-text-muted)' }}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        alignOffset={16}
        sideOffset={8}
        className="w-56"
        style={{ backgroundColor: 'var(--white-bg)', borderColor: 'var(--border-color)' }}
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium" style={{ color: 'var(--ink-black)' }}>
            {user.name}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {user.email}
          </p>
        </div>

        <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-color)' }} />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile" className="flex items-center gap-2">
            <IconifyIcon icon="lucide:user" className="text-sm" />
            个人资料
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile" className="flex items-center gap-2">
            <IconifyIcon icon="lucide:settings" className="text-sm" />
            账户设置
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-color)' }} />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          {isLoggingOut ? (
            <>
              <IconifyIcon icon="lucide:loader-2" className="text-sm animate-spin" />
              登出中...
            </>
          ) : (
            <>
              <IconifyIcon icon="lucide:log-out" className="text-sm" />
              退出登录
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ==================================================
   侧边栏组件 Sidebar Component
   ================================================== */

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
          <IconifyIcon
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
              style={{
                backgroundColor: 'var(--logo-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <IconifyIcon icon="lucide:feather" className="text-lg" style={{ color: 'var(--logo-icon)' }} />
            </div>
            <div className="flex flex-col -gap-1">
              <span
                className="font-display font-bold text-2xl tracking-tighter"
                style={{ color: 'var(--logo-icon)' }}
              >
                剧灵
              </span>
              <span
                className="text-[8px] font-bold tracking-widest uppercase -mt-1 opacity-70"
                style={{ color: 'var(--logo-icon)' }}
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
                  <IconifyIcon icon={item.icon} className="text-xl" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 用户菜单 */}
          <UserMenu />
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
          <IconifyIcon icon={collapsed ? "lucide:chevron-right" : "lucide:chevron-left"} className="text-sm" />
        </button>
      </div>
    </>
  );
}
