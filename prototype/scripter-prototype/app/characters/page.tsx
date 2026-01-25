/* ==================================================
   Characters 人物管理页面
   ================================================== */

"use client";

import { MainLayout } from "@/components/MainLayout";
import { Character } from "@/lib/types";

// 模拟人物数据
const MOCK_CHARACTERS: Character[] = [
  {
    id: "char_001",
    name: "雾姝",
    portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    description: "苗族蛊女，拥有通灵能力。性格坚韧冷静，背负着家族的秘密和诅咒。",
    personality: ["坚韧", "冷静", "神秘", "护短"],
    speakingStyle: "话少言精，带有古风韵味，常用诗词表达情感",
    behaviorPattern: "眼神深邃，动作优雅缓慢，喜欢独处",
    poemNumber: "雾中寻魂铃声响，姝影独行夜未央",
    relationships: [
      {
        characterId: "char_002",
        characterName: "顾云深",
        type: "love",
        description: "相爱相杀的恋人关系",
      },
    ],
  },
  {
    id: "char_002",
    name: "顾云深",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    description: "国民党军官，正义感强，内心矛盾。在执行任务中与雾姝相遇。",
    personality: ["正义", "矛盾", "深情", "责任感强"],
    speakingStyle: "沉稳有力，简洁直接，偶尔流露柔情",
    behaviorPattern: "站姿挺拔，眼神坚定，眉头常皱",
    relationships: [
      {
        characterId: "char_001",
        characterName: "雾姝",
        type: "love",
        description: "相爱相杀的恋人关系",
      },
    ],
  },
];

// 人物卡片组件
function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="char-card-flat rounded overflow-hidden cursor-pointer group flex flex-col">
      <div
        className="aspect-[3/4] relative overflow-hidden bg-gray-100 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <img
          src={character.portrait}
          alt={character.name}
          className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
        />
        <div
          className="absolute inset-x-0 bottom-0 p-6"
          style={{
            background: 'linear-gradient(to top, var(--ink-black), transparent)'
          }}
        >
          <h2
            className="text-2xl font-display font-bold"
            style={{ color: 'var(--overlay-text)' }}
          >
            {character.name}
          </h2>
          {character.poemNumber && (
            <p
              className="text-sm mt-1 italic"
              style={{ color: 'var(--overlay-text-muted)' }}
            >
              {character.poemNumber}
            </p>
          )}
        </div>

        {/* 悬浮显示的性格标签 */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {character.personality.slice(0, 3).map((trait) => (
            <span
              key={trait}
              className="px-2 py-1 backdrop-blur-sm text-white text-[10px] font-bold rounded"
              style={{
                backgroundColor: 'rgba(201, 169, 98, 0.9)'
              }}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* 快速信息 */}
      <div className="p-4 space-y-3">
        <p
          className="text-sm line-clamp-2"
          style={{ color: 'var(--ink-secondary)' }}
        >
          {character.description}
        </p>

        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {/* @ts-ignore - iconify-icon Web Component */}
          <iconify-icon
            icon="lucide:message-circle"
            style={{ color: 'var(--brand-gold)' }}
          />
          <span className="line-clamp-1">{character.speakingStyle}</span>
        </div>

        {character.relationships.length > 0 && (
          <div
            className="pt-2 border-t"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <p
              className="text-[10px] font-bold uppercase mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              关系
            </p>
            <div className="flex flex-wrap gap-1">
              {character.relationships.map((rel) => (
                <span
                  key={rel.characterId}
                  className="px-2 py-0.5 border rounded text-[10px]"
                  style={{
                    backgroundColor: 'var(--hover-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--ink-secondary)'
                  }}
                >
                  {rel.characterName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CharactersPage() {
  return (
    <MainLayout
      header={
        <>
          <h1
            className="font-display font-bold text-lg"
            style={{ color: 'var(--ink-black)' }}
          >
            人物档案库
          </h1>
          <button
            className="px-5 py-1.5 rounded text-xs font-bold transition-all"
            style={{
              backgroundColor: 'var(--ink-black)',
              color: 'var(--button-text-on-light)'
            }}
          >
            创建新角色
          </button>
        </>
      }
    >
      <div className="p-10">
        <div className="max-w-6xl mx-auto">
          {/* 统计概览 */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-5 rounded text-center">
              <p
                className="text-3xl font-display font-bold"
                style={{ color: 'var(--brand-gold)' }}
              >
                {MOCK_CHARACTERS.length}
              </p>
              <p
                className="text-[10px] font-bold uppercase mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                人物总数
              </p>
            </div>
            <div className="glass-card p-5 rounded text-center">
              <p
                className="text-3xl font-display font-bold"
                style={{ color: 'var(--brand-gold)' }}
              >
                2
              </p>
              <p
                className="text-[10px] font-bold uppercase mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                主要角色
              </p>
            </div>
            <div className="glass-card p-5 rounded text-center">
              <p
                className="text-3xl font-display font-bold"
                style={{ color: 'var(--brand-gold)' }}
              >
                1
              </p>
              <p
                className="text-[10px] font-bold uppercase mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                关系网络
              </p>
            </div>
          </div>

          {/* 人物卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_CHARACTERS.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}

            {/* 添加新人物卡片 */}
            <div
              className="char-card-flat rounded overflow-hidden cursor-pointer group flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed"
              style={{
                borderColor: 'var(--border-color)',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div className="text-center">
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'var(--hover-bg)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201, 169, 98, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
                >
                  <iconify-icon
                    icon="lucide:plus"
                    className="text-4xl transition-colors"
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
                  创建新角色
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  使用 AI 生成人物设定
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
