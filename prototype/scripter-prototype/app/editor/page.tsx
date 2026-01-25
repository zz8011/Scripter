"use client";

/* ==================================================
   Editor 剧本编辑器页面
   ================================================== */

import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import Link from "next/link";

// 剧本段落类型
type ParagraphType = "scene-header" | "action" | "dialogue" | "character";

interface ScriptParagraph {
  id: string;
  type: ParagraphType;
  content: string;
  characterName?: string;
  parenthetical?: string;
}

// 初始剧本内容
const INITIAL_PARAGRAPHS: ScriptParagraph[] = [
  {
    id: "title_001",
    type: "scene-header",
    content: "第 1 场：湘西山区·夜·外",
  },
  {
    id: "action_001",
    type: "action",
    content: "△ 月黑风高，雾气如潮水般在密林中翻涌。山路崎岖蜿蜒，两侧古树参天，枝桠在夜色中如怪兽伸出的爪牙。远处，隐约传来阵阵低沉的铃声，回荡在空旷的山谷。",
  },
  {
    id: "dialogue_001",
    type: "dialogue",
    characterName: "雾姝",
    parenthetical: "（手持摄魂铃，目光如炬，望着深林尽头）",
    content: "魂兮归来，引灵还乡。莫听风吟，莫看月光，唯我铃音是汝故乡。",
  },
  {
    id: "action_002",
    type: "action",
    content: "△ 雾姝猛地摇动铜铃。铃声清脆却透着一股肃杀之气。四周的浓雾似乎在铃声干扰下，竟然开始有规律地退散。",
  },
];

export default function EditorPage() {
  const [paragraphs, setParagraphs] = useState<ScriptParagraph[]>(INITIAL_PARAGRAPHS);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // 渲染段落内容
  const renderParagraph = (para: ScriptParagraph) => {
    switch (para.type) {
      case "scene-header":
        return (
          <div className="script-scene-header">
            {para.content}
          </div>
        );

      case "action":
        return (
          <p
            className="mb-10 leading-relaxed indent-10"
            style={{ color: 'var(--ink-black)' }}
          >
            {para.content}
          </p>
        );

      case "dialogue":
        return (
          <div className="script-dialogue-wrap">
            <span
              className="script-char-name"
              style={{ color: 'var(--ink-black)' }}
            >
              {para.characterName}
            </span>
            {para.parenthetical && (
              <p
                className="italic text-sm mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {para.parenthetical}
              </p>
            )}
            <div
              className="leading-relaxed"
              style={{ color: 'var(--ink-black)' }}
            >
              {para.content}
            </div>
          </div>
        );

      default:
        return <p style={{ color: 'var(--ink-black)' }}>{para.content}</p>;
    }
  };

  // 处理拖拽开始
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // 处理放置
  const handleDrop = (dropId: string) => {
    if (!draggedId || draggedId === dropId) return;

    const newParagraphs = [...paragraphs];
    const draggedIndex = newParagraphs.findIndex((p) => p.id === draggedId);
    const dropIndex = newParagraphs.findIndex((p) => p.id === dropId);

    const [removed] = newParagraphs.splice(draggedIndex, 1);
    newParagraphs.splice(dropIndex, 0, removed);

    setParagraphs(newParagraphs);
    setDraggedId(null);
  };

  return (
    <MainLayout
      header={
        <>
          <Link
            href="/dashboard"
            className="p-1 transition-colors"
            style={{ color: 'var(--ink-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-secondary)'; }}
          >
            <iconify-icon icon="lucide:arrow-left" className="text-xl" />
          </Link>
          <div className="flex flex-col">
            <h2
              className="text-sm font-bold"
              style={{ color: 'var(--ink-black)' }}
            >
              我送君归去 (A4 校对模式)
            </h2>
            <p
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              S1 · E1 · 场景 1
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="p-2 transition-colors"
              style={{ color: 'var(--ink-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-secondary)'; }}
              title="格式检查"
            >
              <iconify-icon icon="lucide:file-check" className="text-xl" />
            </button>
            <button
              className="p-2 transition-colors"
              style={{ color: 'var(--ink-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-secondary)'; }}
              title="版本历史"
            >
              <iconify-icon icon="lucide:history" className="text-xl" />
            </button>
            <button
              className="p-2 transition-colors"
              style={{ color: 'var(--ink-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-secondary)'; }}
              title="打印/导出 PDF"
            >
              <iconify-icon icon="lucide:printer" className="text-xl" />
            </button>
            <button
              className="px-5 py-1.5 rounded text-xs font-bold shadow-sm"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-gold-dark)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-gold)'; }}
            >
              保存草稿
            </button>
          </div>
        </>
      }
    >
      {/* 编辑器工作区 */}
      <div className="flex justify-center overflow-y-auto p-12">
        {/* A4 纸张容器 */}
        <div
          className="a4-paper font-editor"
          style={{ color: 'var(--ink-black)' }}
        >
          {/* 标题 */}
          <div className="text-center font-display font-bold text-2xl mb-16 uppercase tracking-[0.3em]">
            【 第 一 集 】
          </div>

          {/* 剧本段落 */}
          {paragraphs.map((para, index) => (
            <div
              key={para.id}
              draggable
              onDragStart={() => handleDragStart(para.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(para.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "script-paragraph relative transition-all",
                draggedId === para.id && "opacity-50"
              )}
              style={{
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(201, 169, 98, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* 拖拽手柄 */}
              <div
                className="absolute -left-10 top-0 w-8 h-6 flex items-center justify-center cursor-move opacity-0 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--border-color)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--border-color)'; }}
              >
                <iconify-icon icon="lucide:grip-vertical" />
              </div>

              {renderParagraph(para)}
            </div>
          ))}

          {/* 光标 */}
          <div
            className="inline-block w-[3px] h-6 animate-cursor-blink ml-1 align-middle"
            style={{ backgroundColor: 'var(--brand-gold)' }}
          />
        </div>
      </div>
    </MainLayout>
  );
}

import { cn } from "@/lib/utils";
