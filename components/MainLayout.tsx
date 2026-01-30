"use client";

/* ==================================================
   主布局组件 Main Layout Component
   ================================================== */

import { useState } from "react";
import { LeftSidebar } from "@/components/LeftSidebar";
import { AISidebar } from "@/components/AISidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export function MainLayout({ children, header }: MainLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden font-ui">
      {/* 左侧导航栏 */}
      <LeftSidebar
        collapsed={leftCollapsed}
        onToggle={() => setLeftCollapsed(!leftCollapsed)}
      />

      {/* 主内容区 */}
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        {/* 顶部头部 */}
        {header && (
          <header
            className="h-16 flex items-center justify-between px-8 z-10 shrink-0 backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--white-bg)',
              borderBottomColor: 'var(--border-color)',
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid'
            }}
          >
            {header}
          </header>
        )}

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

      {/* 右侧 AI 面板 */}
      <AISidebar
        collapsed={rightCollapsed}
        onToggle={() => setRightCollapsed(!rightCollapsed)}
      />
    </div>
  );
}
