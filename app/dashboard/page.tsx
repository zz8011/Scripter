/* ==================================================
   Dashboard 页面 Dashboard Page
   Dashboard Page
   ================================================== */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import { StatCard } from '@/components/ui-custom/StatCard';
import { ProjectCardPoster } from '@/components/ui-custom/ProjectCardPoster';
import { Button } from '@/components/ui/button';
import { getProjects, createProject, deleteProject, type Project, type CreateProjectInput, ApiError } from '@/lib/api/projects';
import { IconifyIcon } from '@/components/IconifyIcon';

/* ==================================================
   Dashboard 页面组件 Dashboard Page Component
   ================================================== */

export default function DashboardPage() {
  // 状态管理
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 路由
  const router = useRouter();

  // 统计数据
  const projectCount = projects.length;
  const totalWordCount = projects.reduce((sum, p) => sum + (p.targetEpisodes || 0), 0);
  const totalSceneCount = projects.reduce((sum, p) => sum + (p.targetEpisodes || 0), 0);

  // 加载项目列表
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('加载项目失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 组件挂载时加载项目
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /* ==================================================
     处理函数 Handlers
     ================================================== */

  const handleCreateProject = async () => {
    // TODO: 打开创建项目对话框
    // 临时实现：创建一个测试项目
    try {
      const newProjectInput: CreateProjectInput = {
        name: '新项目 ' + new Date().toLocaleDateString(),
        scriptType: 'short-drama',
        orientation: 'portrait',
        targetEpisodes: 80,
        genre: ['悬疑'],
      };

      const newProject = await createProject(newProjectInput);
      setProjects([newProject, ...projects]);
    } catch (err) {
      console.error('Failed to create project:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('创建项目失败，请稍后重试');
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('删除项目失败，请稍后重试');
      }
    }
  };

  const handleProjectClick = (projectId: string) => {
    // 导航到编辑器页面，传递项目 ID
    router.push(`/editor?projectId=${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    // 导航到项目设置或编辑页面
    router.push(`/editor?projectId=${projectId}&mode=settings`);
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
        {/* 错误提示 */}
        {error && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'var(--error-bg)',
              borderColor: 'var(--error-border)',
              color: 'var(--error-text)',
            }}
          >
            <div className="flex items-center gap-2">
              <IconifyIcon icon="mdi:alert-circle" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadProjects}
                className="ml-auto"
              >
                重试
              </Button>
            </div>
          </div>
        )}

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

          {/* 加载状态 */}
          {loading && (
            <div className="text-center py-16">
              <IconifyIcon
                icon="mdi:loading"
                className="text-4xl mx-auto mb-4 animate-spin"
                style={{ color: 'var(--brand-gold)' }}
              />
              <p style={{ color: 'var(--text-muted)' }}>加载中...</p>
            </div>
          )}

          {/* 项目卡片网格 */}
          {!loading && projects.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {projects.map((project) => (
                <ProjectCardPoster
                  key={project.id}
                  project={{
                    ...project,
                    wordCount: 0,
                    sceneCount: 0,
                    characterCount: 0,
                  }}
                  onClick={() => handleProjectClick(project.id)}
                  onEdit={(e) => {
                    e.stopPropagation();
                    handleEditProject(project.id);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                />
              ))}
            </div>
          )}

          {/* 空状态 */}
          {!loading && projects.length === 0 && (
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
