/* ==================================================
   Dashboard 控制台页面
   ================================================== */

"use client";

import { MainLayout } from "@/components/MainLayout";
import { Project } from "@/lib/types";
import Link from "next/link";

// 模拟项目数据
const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_20241201_wsjgq",
    name: "我送君归去",
    description: "一个关于离别与归来的湘西秘事",
    coverImage: "https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&q=80&w=1200",
    createdAt: new Date("2024-12-01T14:32:00"),
    updatedAt: new Date("2024-12-15T09:18:00"),
    wordCount: 48526,
    sceneCount: 82,
    characterCount: 12,
    progress: 60.5,
    type: "民国 / 悬疑 / 爱情",
    estimatedEpisodes: 80,
  },
  {
    id: "proj_20241215_mnts",
    name: "明月天涯",
    description: "武侠江湖的恩怨情仇",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200",
    createdAt: new Date("2024-12-15T10:00:00"),
    updatedAt: new Date("2024-12-20T16:45:00"),
    wordCount: 12580,
    sceneCount: 24,
    characterCount: 8,
    progress: 15.2,
    type: "武侠 / 动作",
    estimatedEpisodes: 60,
  },
];

// 统计卡片组件
function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="card-flat p-5 rounded">
      <p
        className="text-[10px] font-bold uppercase mb-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <div className="flex items-center gap-2">
        <iconify-icon
          icon={icon}
          style={{ color: 'var(--brand-gold)' }}
        />
        <p
          className="text-2xl font-display font-bold"
          style={{ color: 'var(--ink-black)' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// 项目卡片组件
function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/editor?project=${project.id}`} className="block">
      <div className="card-flat rounded-lg cursor-pointer group overflow-hidden">
        <div className="h-64 relative overflow-hidden">
          <img
            src={project.coverImage}
            alt={project.name}
            className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h3 className="text-2xl font-display font-bold text-white mb-1">{project.name}</h3>
            <p className="text-sm text-white/70">{project.description}</p>
          </div>
          {/* 进度条 */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <div
              className="h-full transition-all"
              style={{ width: `${project.progress}%`, backgroundColor: 'var(--brand-gold)' }}
            />
          </div>
        </div>
        <div
          className="p-4 flex items-center justify-between text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <div className="flex items-center gap-4">
            <span>{project.wordCount.toLocaleString()} 字</span>
            <span>{project.sceneCount} 场景</span>
            <span>{project.characterCount} 人物</span>
          </div>
          <span
            className="font-bold"
            style={{ color: 'var(--brand-gold)' }}
          >
            {project.progress.toFixed(1)}%
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const todayWordCount = 3124;

  return (
    <MainLayout
      header={
        <>
          <h1
            className="font-display font-bold text-lg"
            style={{ color: 'var(--ink-black)' }}
          >
            控制台 Overview
          </h1>
          <button
            className="px-5 py-1.5 rounded text-xs font-bold transition-all shadow-sm"
            style={{
              backgroundColor: 'var(--brand-gold)',
              color: 'var(--button-text-on-dark)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-gold-dark)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-gold)'; }}
          >
            开启新创作
          </button>
        </>
      }
    >
      <div className="p-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* 统计卡片网格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="今日字数" value={todayWordCount.toLocaleString()} icon="lucide:pen-tool" />
            <StatCard label="项目总数" value={MOCK_PROJECTS.length} icon="lucide:folder" />
            <StatCard label="总场景数" value={106} icon="lucide:clapperboard" />
            <StatCard label="完成进度" value="38%" icon="lucide:trending-up" />
          </div>

          {/* 项目列表 */}
          <section className="space-y-6">
            <h2
              className="text-sm font-bold uppercase tracking-widest border-l-4 pl-3"
              style={{
                color: 'var(--text-muted)',
                borderLeftColor: 'var(--brand-gold)'
              }}
            >
              最近编辑
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_PROJECTS.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>

          {/* 欢迎卡片 */}
          <section className="glass-card p-8">
            <div className="flex items-start gap-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)' }}
              >
                <iconify-icon
                  icon="lucide:sparkles"
                  className="text-3xl"
                  style={{ color: 'var(--brand-gold)' }}
                />
              </div>
              <div>
                <h3
                  className="font-display font-bold text-xl mb-2"
                  style={{ color: 'var(--ink-black)' }}
                >
                  欢迎回到剧灵
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: 'var(--ink-secondary)' }}
                >
                  今天是你连续创作的第 <span
                    className="font-bold"
                    style={{ color: 'var(--brand-gold)' }}
                  >7</span> 天。
                  你已经完成了 <span
                    className="font-bold"
                    style={{ color: 'var(--brand-gold)' }}
                  >48,526</span> 字的创作，
                  继续保持这个势头！
                </p>
                <button
                  className="px-4 py-2 rounded text-sm font-bold transition-colors"
                  style={{
                    backgroundColor: 'var(--ink-black)',
                    color: 'var(--button-text-on-light)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-gold-dark)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--ink-black)'; }}
                >
                  继续创作
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
