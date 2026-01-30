/* ==================================================
   Editor 页面 Editor Page
   Script Editor Page
   ================================================== */

'use client';

import { MainLayout } from '@/components/MainLayout';
import { ScriptEditor } from '@/components/editor/ScriptEditor';
import { Button } from '@/components/ui/button';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useEditorStore } from '@/lib/stores/editorStore';
import { getProject, type Project } from '@/lib/api/projects';
import { getScenes, type Scene } from '@/lib/api/scenes';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

/* ==================================================
   Editor 页面组件 Editor Page Component
   ================================================== */

/**
 * 从 TipTap JSON 中提取纯文本内容
 * TipTap JSON 结构: { type: 'doc', content: [{ type: 'paragraph', content: [...] }] }
 */
function extractTextFromTipTap(json: any): string {
  if (!json || typeof json !== 'object') return '';

  function extractText(node: any): string {
    if (!node) return '';

    // 如果是文本节点
    if (node.type === 'text') {
      return node.text || '';
    }

    // 如果有子节点，递归提取
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join('');
    }

    return '';
  }

  try {
    // 从根节点开始提取
    if (json.content && Array.isArray(json.content)) {
      return json.content.map(extractText).join('\n');
    }
  } catch (error) {
    console.error('Failed to extract text from TipTap JSON:', error);
  }

  return '';
}

export default function EditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  const mode = searchParams.get('mode');

  // 编辑器状态
  const { plainText, wordCount, sceneCount, dialogueCount, updatePlainText, isDirty, setPlainText } = useEditorStore();
  const [isSaving, setIsSaving] = useState(false);

  // 项目状态
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ==================================================
     加载项目数据 Load Project Data
     ================================================== */

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);

        // 加载项目信息
        const projectData = await getProject(projectId);
        setProject(projectData);

        // 加载场景数据（如果有的话）
        try {
          const scenesData = await getScenes(projectId);

          // 将 TipTap JSON 内容转换为纯文本显示
          // 如果场景有 content（TipTap JSON），提取文本内容
          // 否则使用 location 作为占位符
          const scriptText = scenesData
            .map(scene => {
              if (scene.content && typeof scene.content === 'object') {
                // TipTap JSON 格式 - 提取文本内容
                return extractTextFromTipTap(scene.content);
              }
              // 如果没有内容，显示场景标题
              return `场景 ${scene.episodeNumber}-${scene.sceneNumber}: ${scene.location}`;
            })
            .join('\n\n');

          setPlainText(scriptText);
        } catch (sceneError) {
          console.error('Failed to load scenes:', sceneError);
          // 场景加载失败不影响编辑器使用
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        setError('加载项目失败');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  /* ==================================================
     自动保存 Auto Save
     ================================================== */

  useEffect(() => {
    if (!isDirty || !project) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000); // 2秒后自动保存

    return () => clearTimeout(timer);
  }, [isDirty, project]);

  /* ==================================================
     处理函数 Handlers
     ================================================== */

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    // TODO: 保存到服务器
    // await updateProject(projectId, { script: plainText });
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const handleExport = () => {
    // TODO: 导出剧本
    console.log('Exporting script...');
  };

  const handlePrint = () => {
    window.print();
  };

  /* ==================================================
     渲染头部 Render Header
     ================================================== */

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
        >
          <IconifyIcon icon="lucide:arrow-left" className="mr-2" />
          返回
        </Button>

        {/* 项目信息 */}
        {loading ? (
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ) : project ? (
          <>
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {project.name}
            </h1>
            <span
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: 'var(--brand-gold-light)',
                color: 'var(--ink-black)',
              }}
            >
              {project.scriptType === 'short-drama' ? '短剧' : project.scriptType === 'movie' ? '电影' : '连续剧'}
            </span>
            {project.genre && project.genre.length > 0 && (
              <span
                className="px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: 'var(--white-bg)',
                  color: 'var(--ink-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {project.genre[0]}
              </span>
            )}
          </>
        ) : error ? (
          <span className="text-sm" style={{ color: 'var(--error-red)' }}>
            {error}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {/* 状态指示 */}
        {isDirty && !isSaving && (
          <span
            className="text-xs mr-2"
            style={{ color: 'var(--text-muted)' }}
          >
            有未保存的更改
          </span>
        )}
        {isSaving && (
          <span
            className="text-xs mr-2"
            style={{ color: 'var(--info-blue)' }}
          >
            保存中...
          </span>
        )}

        {/* 工具按钮 */}
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <IconifyIcon icon="lucide:download" className="mr-2" />
          导出
        </Button>
        <Button variant="ghost" size="sm" onClick={handlePrint}>
          <IconifyIcon icon="lucide:printer" className="mr-2" />
          打印
        </Button>
        <Button
          onClick={handleSave}
          size="sm"
          style={{
            backgroundColor: 'var(--brand-gold)',
            color: 'var(--button-text-on-dark)',
          }}
        >
          <IconifyIcon icon="lucide:save" className="mr-2" />
          保存
        </Button>
      </div>
    </div>
  );

  /* ==================================================
     加载状态 Loading State
     ================================================== */

  if (loading) {
    return (
      <MainLayout header={header}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <IconifyIcon
              icon="lucide:loader-2"
              className="text-4xl mx-auto mb-4 animate-spin"
              style={{ color: 'var(--brand-gold)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              加载项目中...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  /* ==================================================
     错误状态 Error State
     ================================================== */

  if (error && !project) {
    return (
      <MainLayout header={header}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-4">
            <IconifyIcon
              icon="lucide:alert-circle"
              className="text-6xl mx-auto"
              style={{ color: 'var(--error-red)' }}
            />
            <h2 className="text-xl font-semibold">加载失败</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {error}
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)',
              }}
            >
              返回工作台
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  /* ==================================================
     空项目状态 Empty Project State
     ================================================== */

  if (!project) {
    return (
      <MainLayout header={header}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-4">
            <IconifyIcon
              icon="lucide:file-question"
              className="text-6xl mx-auto"
              style={{ color: 'var(--text-muted)' }}
            />
            <h2 className="text-xl font-semibold">未找到项目</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              请从工作台选择一个项目
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)',
              }}
            >
              前往工作台
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  /* ==================================================
     渲染 Render
     ================================================== */

  return (
    <MainLayout header={header}>
      <div className="flex h-full">
        {/* 主编辑区 */}
        <div className="flex-1 overflow-hidden">
          <ScriptEditor
            content={plainText || ''}
            onChange={updatePlainText}
            className="h-full"
          />
        </div>

        {/* 右侧统计面板 */}
        <div
          className="w-64 border-l p-4 overflow-y-auto"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--white-bg)',
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            剧本统计
          </h3>

          {/* 统计列表 */}
          <div className="space-y-4">
            {/* 字数 */}
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                总字数
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--ink-black)' }}
              >
                {wordCount.toLocaleString()}
              </p>
            </div>

            {/* 场景数 */}
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                场景数
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--ink-black)' }}
              >
                {sceneCount}
              </p>
            </div>

            {/* 对白段落数 */}
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                对白段落数
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--ink-black)' }}
              >
                {dialogueCount}
              </p>
            </div>

            {/* 项目信息 */}
            {project && (
              <>
                <div
                  className="h-px my-4"
                  style={{ backgroundColor: 'var(--border-color)' }}
                />
                <div className="space-y-3 text-sm">
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      类型
                    </p>
                    <p style={{ color: 'var(--ink-black)' }}>
                      {project.scriptType === 'short-drama' ? '短剧' : project.scriptType === 'movie' ? '电影' : '连续剧'}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      目标集数
                    </p>
                    <p style={{ color: 'var(--ink-black)' }}>
                      {project.targetEpisodes} 集
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      当前阶段
                    </p>
                    <p style={{ color: 'var(--ink-black)' }}>
                      {project.currentStage === 'worldview' && '世界观'}
                      {project.currentStage === 'character' && '人物'}
                      {project.currentStage === 'script' && '剧本'}
                      {project.currentStage === 'optimize' && '优化'}
                      {project.currentStage === 'production' && '制作'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* 分隔线 */}
            <div
              className="h-px my-4"
              style={{ backgroundColor: 'var(--border-color)' }}
            />

            {/* 快捷键提示 */}
            <div>
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: 'var(--ink-black)' }}
              >
                快捷键
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>切换格式</span>
                  <kbd
                    className="px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'var(--hover-bg)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    Tab
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>保存</span>
                  <kbd
                    className="px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'var(--hover-bg)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    Ctrl S
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>撤销</span>
                  <kbd
                    className="px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'var(--hover-bg)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    Ctrl Z
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
