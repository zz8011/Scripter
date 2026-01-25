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
import { useState, useEffect } from 'react';

/* ==================================================
   Editor 页面组件 Editor Page Component
   ================================================== */

export default function EditorPage() {
  // 编辑器状态
  const { plainText, wordCount, sceneCount, dialogueCount, updatePlainText, isDirty } = useEditorStore();
  const [isSaving, setIsSaving] = useState(false);

  /* ==================================================
     自动保存 Auto Save
     ================================================== */

  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000); // 2秒后自动保存

    return () => clearTimeout(timer);
  }, [isDirty]);

  /* ==================================================
     处理函数 Handlers
     ================================================== */

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: 保存到服务器
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
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          我送君归去
        </h1>
        <span
          className="px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: 'var(--brand-gold-light)',
            color: 'var(--ink-black)',
          }}
        >
          第 3 集
        </span>
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
          <IconifyIcon icon="mdi:download" className="mr-2" />
          导出
        </Button>
        <Button variant="ghost" size="sm" onClick={handlePrint}>
          <IconifyIcon icon="mdi:printer" className="mr-2" />
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
          <IconifyIcon icon="mdi:content-save" className="mr-2" />
          保存
        </Button>
      </div>
    </div>
  );

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
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                    Tab
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>保存</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                    Ctrl S
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>撤销</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
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
