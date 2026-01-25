/* ==================================================
   Worldview 世界观页面
   ================================================== */

"use client";

import { MainLayout } from "@/components/MainLayout";
import { WorldviewItem } from "@/lib/types";

// 模拟世界观数据
const MOCK_WORLDVIEW: WorldviewItem[] = [
  {
    id: "wv_001",
    category: "时代",
    title: "民国初期 (1912-1927)",
    content: "军阀混战时期，社会动荡不安。湘西地区由于地理偏远，仍保留着许多古老的苗族传统和神秘习俗...",
    relatedItems: ["wv_002", "wv_003"],
  },
  {
    id: "wv_002",
    category: "地理",
    title: "湘西山区",
    content: "位于湖南西部，武陵山脉腹地。山高林密，雾气终年不散，苗族世代聚居于此。蛊术、赶尸等神秘传说发源地...",
    relatedItems: ["wv_001", "wv_004"],
  },
  {
    id: "wv_003",
    category: "阶层",
    title: "苗族蛊女",
    content: "苗族中的特殊群体，多为女性。从小学习蛊术，能够通灵、治病、下蛊。在苗族社会中地位崇高，但也备受争议...",
    relatedItems: ["wv_001", "wv_002"],
  },
  {
    id: "wv_004",
    category: "组织",
    title: "国民党驻军",
    content: "民国政府在湘西地区的军事力量。负责维持治安、剿匪平乱。与苗族关系复杂，既有合作也有冲突...",
    relatedItems: ["wv_001", "wv_002"],
  },
  {
    id: "wv_005",
    category: "其他",
    title: "摄魂铃",
    content: "苗族蛊女的法器，据说能引魂归乡。铜铃材质特殊，声音清脆中带着肃杀之气。传说由百年前的蛊仙铸造...",
    relatedItems: ["wv_003"],
  },
];

// 分类图标映射
const CATEGORY_ICONS: Record<string, string> = {
  时代: "lucide:clock",
  地理: "lucide:map-pin",
  阶层: "lucide:users",
  组织: "lucide:building-2",
  其他: "lucide:sparkles",
};

// 分类颜色映射（使用 inline styles，不支持动态 Tailwind 类）
const getCategoryStyles = (category: string) => {
  const baseStyles = {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    borderWidth: '1px',
    borderStyle: 'solid'
  };

  const colorMap: Record<string, { bg: string; color: string; borderColor: string }> = {
    时代: { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', borderColor: 'rgba(59, 130, 246, 0.2)' },
    地理: { bg: 'rgba(34, 197, 94, 0.1)', color: '#16A34A', borderColor: 'rgba(34, 197, 94, 0.2)' },
    阶层: { bg: 'rgba(168, 85, 247, 0.1)', color: '#9333EA', borderColor: 'rgba(168, 85, 247, 0.2)' },
    组织: { bg: 'rgba(249, 115, 22, 0.1)', color: '#EA580C', borderColor: 'rgba(249, 115, 22, 0.2)' },
    其他: { bg: 'rgba(201, 169, 98, 0.1)', color: '#C9A962', borderColor: 'rgba(201, 169, 98, 0.2)' },
  };

  const colors = colorMap[category] || colorMap.其他;
  return { ...baseStyles, backgroundColor: colors.bg, color: colors.color, borderColor: colors.borderColor };
};

// 世界观卡片组件
function WorldviewCard({ item }: { item: WorldviewItem }) {
  const icon = CATEGORY_ICONS[item.category] || "lucide:file-text";
  const categoryStyles = getCategoryStyles(item.category);

  return (
    <div className="card-flat p-6 rounded cursor-pointer group">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-lg border flex items-center justify-center shrink-0"
          style={categoryStyles}
        >
          <iconify-icon icon={icon} className="text-xl" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span style={categoryStyles}>
              {item.category}
            </span>
          </div>
          <h3
            className="font-display font-bold text-lg transition-colors"
            style={{
              color: 'var(--ink-black)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-black)'; }}
          >
            {item.title}
          </h3>
        </div>
      </div>

      <p
        className="text-sm leading-relaxed line-clamp-3 mb-4"
        style={{ color: 'var(--ink-secondary)' }}
      >
        {item.content}
      </p>

      {item.relatedItems.length > 0 && (
        <div
          className="pt-4 border-t"
          style={{ borderColor: 'rgba(211, 201, 176, 0.5)' }}
        >
          <p
            className="text-[10px] font-bold uppercase mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            相关设定
          </p>
          <div className="flex flex-wrap gap-2">
            {item.relatedItems.map((relatedId) => {
              const relatedItem = MOCK_WORLDVIEW.find((w) => w.id === relatedId);
              return relatedItem ? (
                <span
                  key={relatedId}
                  className="px-3 py-1 rounded-full text-xs border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--code-bg)',
                    color: 'var(--ink-secondary)',
                    borderColor: 'var(--border-color)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  {relatedItem.title}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorldviewPage() {
  // 获取所有分类
  const categories = Array.from(new Set(MOCK_WORLDVIEW.map((item) => item.category)));

  return (
    <MainLayout
      header={
        <>
          <h1
            className="font-display font-bold text-lg"
            style={{ color: 'var(--ink-black)' }}
          >
            世界观设定
          </h1>
          <button
            className="px-5 py-1.5 rounded text-xs font-bold transition-all"
            style={{
              backgroundColor: 'var(--ink-black)',
              color: 'var(--button-text-on-light)'
            }}
          >
            添加设定
          </button>
        </>
      }
    >
      <div className="p-10">
        <div className="max-w-6xl mx-auto">
          {/* 欢迎说明 */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-start gap-4">
              <iconify-icon
                icon="lucide:globe"
                className="text-3xl"
                style={{ color: 'var(--brand-gold)' }}
              />
              <div>
                <h2
                  className="font-display font-bold text-lg mb-2"
                  style={{ color: 'var(--ink-black)' }}
                >
                  构建你的故事世界
                </h2>
                <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                  世界观设定帮助你构建一个完整、自洽的故事世界。按时代、地理、阶层、组织等维度整理设定，
                  让剧本创作更有章法。
                </p>
              </div>
            </div>
          </div>

          {/* 分类筛选 */}
          <div
            className="flex items-center gap-3 mb-8 pb-6 border-b overflow-x-auto"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <button
              className="px-4 py-2 rounded text-sm font-bold whitespace-nowrap"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)'
              }}
            >
              全部 ({MOCK_WORLDVIEW.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded text-sm font-bold border transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--white-bg)',
                  color: 'var(--ink-secondary)',
                  borderColor: 'var(--border-color)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 设定卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_WORLDVIEW.map((item) => (
              <WorldviewCard key={item.id} item={item} />
            ))}

            {/* 添加新设定卡片 */}
            <div
              className="card-flat rounded p-6 cursor-pointer group flex flex-col items-center justify-center min-h-[250px] border-2 border-dashed transition-colors"
              style={{ borderColor: 'var(--border-color)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'var(--code-bg)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201, 169, 98, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--code-bg)'; }}
                >
                  <iconify-icon
                    icon="lucide:plus"
                    className="text-3xl transition-colors"
                    style={{ color: 'var(--border-color)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--border-color)'; }}
                  />
                </div>
                <p
                  className="font-display font-bold text-lg transition-colors"
                  style={{ color: 'var(--ink-black)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-black)'; }}
                >
                  添加新设定
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  构建你的故事世界
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
