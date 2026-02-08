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
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ExportDialog } from '@/components/export/ExportDialog';
import { useToast } from '@/components/ui/use-toast';

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

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  const { toast } = useToast();
  // const mode = searchParams.get('mode'); // eslint-disable-line @typescript-eslint/no-unused-vars

  // 编辑器状态
  const {
    plainText,
    wordCount,
    sceneCount,
    dialogueCount,
    updatePlainText,
    isDirty,
    setPlainText,
    startSaving,
    finishSaving,
    clearDirty
  } = useEditorStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // 项目状态
  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 导出对话框状态
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // 保存定时器引用
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

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
          setScenes(scenesData);

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
  }, [projectId, setPlainText]);

  /* ==================================================
     自动保存 Auto Save
     ================================================== */

  // 保存到服务端的函数
  const saveToServer = useCallback(async () => {
    if (!scenes || scenes.length === 0) {
      console.warn('No scenes to save');
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus('saving');
      startSaving();

      // 将纯文本转换为 TipTap JSON 格式
      // 简化版本：将文本包装为段落节点
      const content = {
        type: 'doc',
        content: plainText.split('\n').map(line => ({
          type: 'paragraph',
          content: line ? [{ type: 'text', text: line }] : []
        }))
      };

      // 保存到第一个场景（简化实现）
      // TODO: 未来支持多场景编辑
      const sceneId = scenes[0].id;

      const response = await fetch(`/api/scenes/${sceneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      const data = await response.json();

      // 保存成功
      setLastSavedAt(new Date(data.savedAt));
      setSaveStatus('saved');
      finishSaving();
      clearDirty();

      // 显示成功提示
      toast({
        title: '保存成功',
        description: `已保存到云端 · ${new Date(data.savedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
        variant: 'default',
      });

      // 3秒后清除保存状态提示
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);

    } catch (err) {
      console.error('Failed to save:', err);
      setSaveStatus('error');

      // 根据错误类型提供更详细的提示
      let errorTitle = '保存失败';
      let errorDescription = '无法保存到服务器，请稍后重试';

      if (err instanceof Error) {
        if (err.message.includes('Unauthorized') || err.message.includes('401')) {
          errorTitle = '未授权';
          errorDescription = '登录已过期，请重新登录';
        } else if (err.message.includes('Forbidden') || err.message.includes('403')) {
          errorTitle = '权限不足';
          errorDescription = '您没有权限编辑此项目';
        } else if (err.message.includes('Not Found') || err.message.includes('404')) {
          errorTitle = '场景不存在';
          errorDescription = '无法找到要保存的场景';
        } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
          errorTitle = '网络错误';
          errorDescription = '网络连接失败，请检查网络后重试';
        } else {
          errorDescription = err.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });

      // 5秒后清除错误状态
      setTimeout(() => {
        setSaveStatus(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  }, [scenes, plainText, startSaving, finishSaving, clearDirty, toast]);

  // Debounced 自动保存
  useEffect(() => {
    if (!isDirty || !project || !scenes || scenes.length === 0) return;

    // 清除之前的定时器
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // 设置新的定时器（2秒延迟）
    saveTimerRef.current = setTimeout(() => {
      saveToServer();
    }, 2000);

    // 清理函数
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [isDirty, project, scenes, saveToServer]);

  /* ==================================================
     处理函数 Handlers
     ================================================== */

  const handleSave = async () => {
    await saveToServer();
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  /* ==================================================
     快捷键监听 Keyboard Shortcuts
     ================================================== */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S 或 Cmd+S 保存
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();

        // 如果有未保存的更改，立即保存
        if (isDirty && !isSaving) {
          handleSave();

          // 显示快捷键反馈
          toast({
            title: '正在保存...',
            description: '使用 Ctrl+S 快捷键保存',
            variant: 'default',
          });
        } else if (!isDirty) {
          // 没有未保存的更改
          toast({
            title: '无需保存',
            description: '当前没有未保存的更改',
            variant: 'default',
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isSaving, handleSave, toast]);

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
        {saveStatus === 'saved' && (
          <div
            className="flex items-center gap-1 text-sm animate-in fade-in slide-in-from-right-2 duration-300"
            style={{ color: 'var(--success-green)' }}
          >
            <IconifyIcon icon="lucide:check-circle-2" className="text-base" />
            <span className="font-medium">已保存</span>
            {lastSavedAt && (
              <span style={{ color: 'var(--text-muted)' }} className="ml-1 text-xs">
                {lastSavedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}
        {saveStatus === 'saving' && (
          <div
            className="flex items-center gap-1 text-sm animate-in fade-in duration-200"
            style={{ color: 'var(--info-blue)' }}
          >
            <IconifyIcon icon="lucide:loader-2" className="text-base animate-spin" />
            <span>保存中...</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div
            className="flex items-center gap-1 text-sm animate-in fade-in shake duration-300"
            style={{ color: 'var(--error-red)' }}
          >
            <IconifyIcon icon="lucide:alert-circle" className="text-base" />
            <span className="font-medium">保存失败</span>
          </div>
        )}
        {!saveStatus && isDirty && !isSaving && (
          <span
            className="text-xs animate-in fade-in duration-200"
            style={{ color: 'var(--text-muted)' }}
          >
            有未保存的更改
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
          disabled={isSaving || !isDirty}
          style={{
            backgroundColor: 'var(--brand-gold)',
            color: 'var(--button-text-on-dark)',
            opacity: isSaving || !isDirty ? 0.5 : 1,
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
    <>
      <MainLayout header={header}>
        <div className="flex h-full">
          {/* 主编辑区 */}
          <div className="flex-1 overflow-hidden">
            <ScriptEditor
              content={plainText || ''}
              onChange={updatePlainText}
              onExport={handleExport}
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

      {/* 导出对话框 */}
      {project && (
        <ExportDialog
          projectId={project.id}
          projectName={project.name}
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
        />
      )}
    </>
  );
}

/* ==================================================
   页面导出 Page Export
   ================================================== */

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <IconifyIcon icon="lucide:loader-2" className="text-4xl mx-auto mb-4 animate-spin" style={{ color: 'var(--brand-gold)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>加载中...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}


