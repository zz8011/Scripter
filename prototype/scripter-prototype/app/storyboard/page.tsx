"use client";

/* ==================================================
   Storyboard 分镜页面
   ================================================== */

import { MainLayout } from "@/components/MainLayout";

// 分镜项数据
interface StoryboardItem {
  id: string;
  sceneNumber: number;
  shotNumber: number;
  shotType: string;
  cameraMovement: string;
  description: string;
  duration: number;
  dialogue?: string;
}

// 模拟分镜数据
const MOCK_STORYBOARD: StoryboardItem[] = [
  {
    id: "sb_001",
    sceneNumber: 1,
    shotNumber: 1,
    shotType: "远景 (LS)",
    cameraMovement: "摇镜",
    description: "湘西山区全景，雾气缭绕的密林，山路蜿蜒",
    duration: 8,
  },
  {
    id: "sb_002",
    sceneNumber: 1,
    shotNumber: 2,
    shotType: "中景 (MS)",
    cameraMovement: "推镜",
    description: "雾姝从树林中走出，手持摄魂铃",
    duration: 5,
    dialogue: "雾姝：魂兮归来，引灵还乡。",
  },
  {
    id: "sb_003",
    sceneNumber: 1,
    shotNumber: 3,
    shotType: "特写 (CU)",
    cameraMovement: "固定",
    description: "摄魂铃特写，铜铃上的纹路清晰可见",
    duration: 3,
  },
  {
    id: "sb_004",
    sceneNumber: 1,
    shotNumber: 4,
    shotType: "中景 (MS)",
    cameraMovement: "跟镜",
    description: "雾姝摇动铜铃，四周雾气开始退散",
    duration: 6,
  },
];

// 四栏布局：镜号、画面、运镜/对白、时长
function StoryboardRow({ item }: { item: StoryboardItem }) {
  return (
    <div className="card-flat p-4 rounded mb-4 flex items-start gap-4 hover:shadow-md transition-all">
      {/* 第一栏：镜号 */}
      <div className="w-20 shrink-0">
        <div className="text-center">
          <p
            className="text-2xl font-display font-bold"
            style={{ color: 'var(--brand-gold)' }}
          >
            {item.shotNumber}
          </p>
          <p
            className="text-[10px] uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Shot
          </p>
        </div>
      </div>

      {/* 第二栏：画面描述 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-0.5 text-[10px] font-bold rounded"
            style={{
              backgroundColor: 'rgba(201, 169, 98, 0.1)',
              color: 'var(--brand-gold)'
            }}
          >
            {item.shotType}
          </span>
          <span
            className="px-2 py-0.5 text-[10px] rounded"
            style={{
              backgroundColor: 'var(--code-bg)',
              color: 'var(--ink-secondary)'
            }}
          >
            {item.cameraMovement}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--ink-black)' }}>
          {item.description}
        </p>
        {item.dialogue && (
          <div
            className="mt-2 p-2 border-l-2 rounded-r"
            style={{
              backgroundColor: 'var(--code-bg)',
              borderColor: 'var(--brand-gold)'
            }}
          >
            <p
              className="text-xs italic"
              style={{ color: 'var(--ink-secondary)' }}
            >
              {item.dialogue}
            </p>
          </div>
        )}
      </div>

      {/* 第三栏：运镜建议 */}
      <div className="w-48 shrink-0">
        <div
          className="p-3 rounded border"
          style={{
            backgroundColor: 'var(--code-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <iconify-icon
              icon="lucide:video"
              className="text-sm"
              style={{ color: 'var(--brand-gold)' }}
            />
            <p
              className="text-[10px] font-bold uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              运镜
            </p>
          </div>
          <p
            className="text-xs"
            style={{ color: 'var(--ink-secondary)' }}
          >
            {item.cameraMovement}
          </p>
        </div>
      </div>

      {/* 第四栏：时长 */}
      <div className="w-16 shrink-0 text-right">
        <p
          className="text-lg font-display font-bold"
          style={{ color: 'var(--ink-black)' }}
        >
          {item.duration}s
        </p>
        <p
          className="text-[10px]"
          style={{ color: 'var(--text-muted)' }}
        >
          时长
        </p>
      </div>
    </div>
  );
}

// 分镜图例
function ShotTypeLegend() {
  const shotTypes = [
    { type: "远景 (LS)", description: "Long Shot - 展示环境全貌" },
    { type: "中景 (MS)", description: "Medium Shot - 人物腰部以上" },
    { type: "近景 (MCU)", description: "Medium Close Up - 胸部以上" },
    { type: "特写 (CU)", description: "Close Up - 面部或细节" },
  ];

  return (
    <div className="glass-card p-4 rounded mb-6">
      <h3
        className="text-xs font-bold uppercase mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        景别图例
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {shotTypes.map((shot) => (
          <div key={shot.type} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--brand-gold)' }}
            />
            <div>
              <p
                className="text-xs font-bold"
                style={{ color: 'var(--ink-black)' }}
              >
                {shot.type}
              </p>
              <p
                className="text-[10px]"
                style={{ color: 'var(--text-muted)' }}
              >
                {shot.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoryboardPage() {
  const totalDuration = MOCK_STORYBOARD.reduce((sum, item) => sum + item.duration, 0);

  return (
    <MainLayout
      header={
        <>
          <h1
            className="font-display font-bold text-lg"
            style={{ color: 'var(--ink-black)' }}
          >
            分镜设计
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p
                className="text-[10px] uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                总时长
              </p>
              <p
                className="text-lg font-display font-bold"
                style={{ color: 'var(--brand-gold)' }}
              >
                {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, "0")}
              </p>
            </div>
            <button
              className="px-5 py-1.5 rounded text-xs font-bold transition-all"
              style={{
                backgroundColor: 'var(--ink-black)',
                color: 'var(--button-text-on-light)'
              }}
            >
              添加镜头
            </button>
          </div>
        </>
      }
    >
      <div className="p-10">
        <div className="max-w-5xl mx-auto">
          {/* 场景信息 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="px-3 py-1 text-sm font-bold rounded"
                style={{
                  backgroundColor: 'var(--brand-gold)',
                  color: 'var(--button-text-on-dark)'
                }}
              >
                第 1 集
              </span>
              <span
                className="px-3 py-1 text-sm font-bold rounded border"
                style={{
                  backgroundColor: 'var(--code-bg)',
                  color: 'var(--ink-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                场景 1
              </span>
            </div>
            <h2
              className="text-xl font-display font-bold"
              style={{ color: 'var(--ink-black)' }}
            >
              湘西山区·夜·外
            </h2>
          </div>

          {/* 景别图例 */}
          <ShotTypeLegend />

          {/* 四栏布局表头 */}
          <div
            className="flex items-center gap-4 mb-4 pb-4 border-b text-xs font-bold uppercase"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            <div className="w-20 shrink-0 text-center">镜号</div>
            <div className="flex-1">画面描述</div>
            <div className="w-48 shrink-0">运镜</div>
            <div className="w-16 shrink-0 text-right">时长</div>
          </div>

          {/* 分镜列表 */}
          {MOCK_STORYBOARD.map((item) => (
            <StoryboardRow key={item.id} item={item} />
          ))}

          {/* 添加新镜头 */}
          <button
            className="w-full card-flat p-6 rounded flex items-center justify-center gap-3 border-2 border-dashed transition-colors group"
            style={{ borderColor: 'var(--border-color)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <iconify-icon
              icon="lucide:plus"
              className="text-xl transition-colors"
              style={{ color: 'var(--border-color)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--border-color)'; }}
            />
            <span
              className="font-display font-bold transition-colors"
              style={{ color: 'var(--ink-black)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-black)'; }}
            >
              添加新镜头
            </span>
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
