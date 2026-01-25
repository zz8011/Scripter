/* ==================================================
   剧本编辑器演示页面
   Script Editor Demo Page
   ================================================== */

'use client';

import { ScriptEditor } from '@/components/editor/ScriptEditor';
import { useState } from 'react';

/* ==================================================
   示例剧本内容 Sample Script Content
   ================================================== */

const SAMPLE_SCRIPT = `
<div data-type="scene-heading">场景1 - 室内 咖啡馆 白天</div>
<div data-type="action">温馨的咖啡馆，阳光透过玻璃窗洒在木质地板上。张三独自坐在角落的桌子旁，盯着手中的咖啡杯，神情凝重。</div>
<div data-type="character">张三</div>
<div data-type="parenthetical">(低声自语)</div>
<div data-type="dialogue">终于还是到了这一天...</div>
<div data-type="action">咖啡店的门铃响起，李四推门而入，环顾四周，目光最终锁定在张三身上。</div>
<div data-type="character">李四</div>
<div data-type="dialogue">你果然在这里。</div>
<div data-type="character">张三</div>
<div data-type="parenthetical">(抬头，苦笑)</div>
<div data-type="dialogue">我就知道你会找到我。</div>
`;

/* ==================================================
   演示页面 Demo Page
   ================================================== */

export default function ScriptDemoPage() {
  const [content, setContent] = useState(SAMPLE_SCRIPT);
  const [errors, setErrors] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-paper-bg">
      {/* 页面标题 */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-ink-black dark:text-ink-black">
            剧本编辑器演示
          </h1>
          <p className="mt-2 text-muted">
            专业的中文短剧剧本编辑器，支持场景、人物、对白、动作和括号说明
          </p>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3">使用说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">工具栏按钮</h3>
              <ul className="space-y-1 text-muted">
                <li>• 场景 - 切换到场景标题格式</li>
                <li>• 人物 - 切换到人物名称格式</li>
                <li>• 对白 - 切换到对白格式</li>
                <li>• 括号 - 切换到括号说明格式</li>
                <li>• 动作 - 切换到动作描述格式</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">键盘快捷键</h3>
              <ul className="space-y-1 text-muted">
                <li>• Tab - 循环切换格式类型</li>
                <li>• Ctrl+Alt+S - 场景标题</li>
                <li>• Ctrl+Alt+C - 人物名称</li>
                <li>• Ctrl+Alt+D - 对白</li>
                <li>• Ctrl+Alt+P - 括号说明</li>
                <li>• Ctrl+Alt+A - 动作描述</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 编辑器 */}
        <ScriptEditor
          content={content}
          onChange={setContent}
          onValidationChange={(errs, warns) => {
            setErrors(errs);
            setWarnings(warns);
          }}
          editable
          showValidation
          className="h-[800px]"
        />

        {/* 统计信息 */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3">剧本统计</h3>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted">场景数：</span>
              <span className="font-medium ml-1">1</span>
            </div>
            <div>
              <span className="text-muted">人物数：</span>
              <span className="font-medium ml-1">2</span>
            </div>
            <div>
              <span className="text-muted">对白数：</span>
              <span className="font-medium ml-1">4</span>
            </div>
            <div>
              <span className="text-muted">动作段：</span>
              <span className="font-medium ml-1">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
