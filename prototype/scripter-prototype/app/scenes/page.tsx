"use client";

/* ==================================================
   Scenes 场景管理页面
   ================================================== */

import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Scene } from "@/lib/types";

// 模拟场景数据
const MOCK_SCENES: Scene[] = [
  {
    id: "scene_001",
    episodeNumber: 1,
    sceneNumber: 1,
    location: "湘西山区",
    time: "夜",
    interiorExterior: "外",
    content: "月黑风高，雾气如潮水般在密林中翻涌...",
    duration: 120,
    characters: ["雾姝"],
    tags: ["开篇", "氛围"],
  },
  {
    id: "scene_002",
    episodeNumber: 1,
    sceneNumber: 2,
    location: "苗寨·雾姝家",
    time: "夜",
    interiorExterior: "内",
    content: "雾姝回到家中，整理蛊药，回忆往事...",
    duration: 180,
    characters: ["雾姝", "长老"],
    tags: ["回忆", "世界观"],
  },
  {
    id: "scene_003",
    episodeNumber: 1,
    sceneNumber: 3,
    location: "山路",
    time: "日",
    interiorExterior: "外",
    content: "顾云深带队巡逻，与雾姝初次相遇...",
    duration: 240,
    characters: ["雾姝", "顾云深", "士兵们"],
    tags: ["相遇", "冲突"],
  },
  {
    id: "scene_004",
    episodeNumber: 1,
    sceneNumber: 4,
    location: "苗寨广场",
    time: "日",
    interiorExterior: "外",
    content: "苗族节日庆典，众人欢庆，暗流涌动...",
    duration: 300,
    characters: ["雾姝", "顾云深", "长老", "村民"],
    tags: ["庆典", "冲突"],
  },
];

// 场景卡片组件
function SceneCard({ scene }: { scene: Scene }) {
  const getTimeIcon = () => {
    return scene.time === "夜" ? "lucide:moon" : "lucide:sun";
  };

  const getLocationIcon = () => {
    return scene.interiorExterior === "内" ? "lucide:home" : "lucide:tree-pine";
  };

  return (
    <div className="card-flat p-5 rounded cursor-pointer group hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className="text-2xl font-display font-bold"
            style={{ color: 'var(--brand-gold)' }}
          >
            S{scene.episodeNumber.toString().padStart(2, "0")}
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            场景 {scene.sceneNumber}
          </span>
        </div>
        <div
          className="flex items-center gap-2"
          style={{ color: 'var(--text-muted)' }}
        >
          <iconify-icon icon={getTimeIcon()} className="text-sm" />
          <iconify-icon icon={getLocationIcon()} className="text-sm" />
        </div>
      </div>

      <h3
        className="font-display font-bold text-lg mb-1"
        style={{ color: 'var(--ink-black)' }}
      >
        {scene.location} · {scene.time} · {scene.interiorExterior}
      </h3>

      <p
        className="text-sm line-clamp-2 mb-3"
        style={{ color: 'var(--ink-secondary)' }}
      >
        {scene.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {scene.characters.map((char) => (
            <span
              key={char}
              className="px-2 py-1 text-[10px] rounded"
              style={{
                backgroundColor: 'var(--code-bg)',
                color: 'var(--ink-secondary)'
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {scene.duration && (
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <iconify-icon
              icon="lucide:clock"
              style={{ color: 'var(--brand-gold)' }}
            />
            <span>{Math.floor(scene.duration / 60)}:{(scene.duration % 60).toString().padStart(2, "0")}</span>
          </div>
        )}
      </div>

      {/* 标签 */}
      {scene.tags.length > 0 && (
        <div
          className="mt-3 pt-3 border-t flex flex-wrap gap-1"
          style={{ borderColor: 'rgba(211, 201, 176, 0.5)' }}
        >
          {scene.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-bold rounded"
              style={{
                backgroundColor: 'rgba(201, 169, 98, 0.1)',
                color: 'var(--brand-gold)'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ScenesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <MainLayout
      header={
        <>
          <h1
            className="font-display font-bold text-lg"
            style={{ color: 'var(--ink-black)' }}
          >
            场景看板
          </h1>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center rounded-lg p-1"
              style={{ backgroundColor: 'var(--code-bg)' }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className="p-2 rounded transition-colors"
                style={{
                  backgroundColor: viewMode === "grid" ? 'var(--white-bg)' : 'transparent',
                  color: viewMode === "grid" ? 'var(--brand-gold)' : 'var(--text-muted)',
                  boxShadow: viewMode === "grid" ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <iconify-icon icon="lucide:layout-grid" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="p-2 rounded transition-colors"
                style={{
                  backgroundColor: viewMode === "list" ? 'var(--white-bg)' : 'transparent',
                  color: viewMode === "list" ? 'var(--brand-gold)' : 'var(--text-muted)',
                  boxShadow: viewMode === "list" ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <iconify-icon icon="lucide:list" />
              </button>
            </div>
            <button
              className="px-5 py-1.5 rounded text-xs font-bold transition-all"
              style={{
                backgroundColor: 'var(--ink-black)',
                color: 'var(--button-text-on-light)'
              }}
            >
              添加场景
            </button>
          </div>
        </>
      }
    >
      <div className="p-10">
        <div className="max-w-6xl mx-auto">
          {/* 筛选栏 */}
          <div
            className="flex items-center gap-4 mb-6 pb-6 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <button
              className="px-4 py-2 rounded text-sm font-bold"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)'
              }}
            >
              全部 ({MOCK_SCENES.length})
            </button>
            <button
              className="px-4 py-2 rounded text-sm font-bold border transition-colors"
              style={{
                backgroundColor: 'var(--white-bg)',
                color: 'var(--ink-secondary)',
                borderColor: 'var(--border-color)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              第 1 集
            </button>
            <button
              className="px-4 py-2 rounded text-sm font-bold border transition-colors"
              style={{
                backgroundColor: 'var(--white-bg)',
                color: 'var(--ink-secondary)',
                borderColor: 'var(--border-color)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              已完成
            </button>
            <div className="flex-1" />
            <div className="relative">
              <iconify-icon
                icon="lucide:search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="搜索场景..."
                className="pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none transition-colors w-64"
                style={{
                  backgroundColor: 'var(--white-bg)',
                  borderColor: 'var(--border-color)'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-gold)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              />
            </div>
          </div>

          {/* 场景列表 */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_SCENES.map((scene) => (
                <SceneCard key={scene.id} scene={scene} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {MOCK_SCENES.map((scene) => (
                <div key={scene.id} className="card-flat p-5 rounded flex items-center gap-6">
                  <div className="shrink-0">
                    <span
                      className="text-3xl font-display font-bold"
                      style={{ color: 'var(--brand-gold)' }}
                    >
                      S{scene.episodeNumber.toString().padStart(2, "0")}
                    </span>
                    <p
                      className="text-xs text-center mt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      场景 {scene.sceneNumber}
                    </p>
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-display font-bold text-lg"
                      style={{ color: 'var(--ink-black)' }}
                    >
                      {scene.location} · {scene.time} · {scene.interiorExterior}
                    </h3>
                    <p
                      className="text-sm mt-1 line-clamp-1"
                      style={{ color: 'var(--ink-secondary)' }}
                    >
                      {scene.content}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-4 text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <div className="flex items-center gap-1">
                      <iconify-icon
                        icon="lucide:users"
                        style={{ color: 'var(--brand-gold)' }}
                      />
                      <span>{scene.characters.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <iconify-icon
                        icon="lucide:clock"
                        style={{ color: 'var(--brand-gold)' }}
                      />
                      <span>{Math.floor(scene.duration! / 60)}:{(scene.duration! % 60).toString().padStart(2, "0")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
