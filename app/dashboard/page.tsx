/* ==================================================
   Dashboard 页面 Dashboard Page
   Dashboard Page
   ================================================== */

'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { StatCard } from '@/components/ui-custom/StatCard';
import { ProjectCard } from '@/components/ui-custom/ProjectCard';
import { Button } from '@/components/ui/button';
import { useProjectStore, selectProjectCount, selectTotalWordCount, selectTotalSceneCount } from '@/lib/stores/projectStore';
import { mockProjects } from '@/lib/mock-data';
import { IconifyIcon } from '@/components/IconifyIcon';

/* ==================================================
   Dashboard 页面组件 Dashboard Page Component
   ================================================== */

export default function DashboardPage() {
  // 状态管理
  const { projects, addProject } = useProjectStore();

  // 统计数据
  const projectCount = selectProjectCount(useProjectStore.getState());
  const totalWordCount = selectTotalWordCount(useProjectStore.getState());
  const totalSceneCount = selectTotalSceneCount(useProjectStore.getState());

  // 只在组件挂载时加载 mock 数据
  useEffect(() => {
    if (projects.length === 0) {
      mockProjects.forEach(project => addProject(project));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ==================================================
     处理函数 Handlers
     ================================================== */

  const handleCreateProject = () => {
    // TODO: 打开创建项目对话框
    console.log('Creating new project...');
  };

  /* ==================================================
     渲染头部 Render Header
     ================================================== */

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          工作台
        </h1>
        <p
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          欢迎回来，继续你的创作之旅
        </p>
      </div>

      <Button
        onClick={handleCreateProject}
        className="gap-2"
        style={{
          backgroundColor: 'var(--brand-gold)',
          color: 'var(--button-text-on-dark)',
        }}
      >
        <IconifyIcon icon="mdi:plus" />
        新建项目
      </Button>
    </div>
  );

  /* ==================================================
     渲染 Render
     ================================================== */

  return (
    <MainLayout header={header}>
      <div className="p-8 space-y-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="项目总数"
            value={projectCount}
            icon="mdi:folder-multiple"
            iconColor="var(--brand-gold)"
          />
          <StatCard
            title="总字数"
            value={totalWordCount.toLocaleString()}
            icon="mdi:text-box"
            iconColor="var(--info-blue)"
          />
          <StatCard
            title="总场景数"
            value={totalSceneCount}
            icon="mdi:movie-open"
            iconColor="var(--success-green)"
          />
        </div>

        {/* 项目列表 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              我的项目
            </h2>
            <div className="flex items-center gap-2">
              {/* 排序按钮 */}
              <Button variant="ghost" size="sm">
                <IconifyIcon icon="mdi:sort" className="mr-2" />
                排序
              </Button>
            </div>
          </div>

          {/* 项目卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => console.log('Open project:', project.id)}
                onEdit={() => console.log('Edit project:', project.id)}
                onDelete={() => console.log('Delete project:', project.id)}
              />
            ))}
          </div>

          {/* 空状态 */}
          {projects.length === 0 && (
            <div
              className="text-center py-16 rounded-lg border-2 border-dashed"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <IconifyIcon
                icon="mdi:folder-open-outline"
                className="text-6xl mx-auto mb-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--ink-black)' }}
              >
                还没有项目
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--text-muted)' }}
              >
                创建你的第一个剧本项目，开始创作之旅
              </p>
              <Button
                onClick={handleCreateProject}
                style={{
                  backgroundColor: 'var(--brand-gold)',
                  color: 'var(--button-text-on-dark)',
                }}
              >
                <IconifyIcon icon="mdi:plus" className="mr-2" />
                新建项目
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
