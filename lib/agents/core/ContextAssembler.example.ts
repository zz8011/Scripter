/**
 * ContextAssembler 使用示例
 *
 * 本文件展示如何使用 ContextAssembler 组装智能上下文
 */

import { ContextAssembler } from './ContextAssembler';
import type { ContextRequirement } from './types';

/**
 * 示例 1: 对白润色 Skill
 *
 * 需要：当前场景 + 人物档案
 */
async function exampleDialoguePolish() {
  const assembler = new ContextAssembler({
    projectId: 'project-123',
    userId: 'user-456',
    maxTokens: 8000,
  });

  const requirements: ContextRequirement[] = [
    { type: 'currentScene' },
    { type: 'characterProfile', characterId: 'char-1' },
    { type: 'selectedText' },
  ];

  const input = {
    sceneId: 'scene-1',
    characterId: 'char-1',
    selectedText: '李明：我要去参军。',
  };

  const result = await assembler.assemble(requirements, input);

  console.log('组装的上下文:', result.context);
  console.log('Token 数量:', result.tokenCount);
  console.log('数据来源:', result.sources);
  console.log('缓存命中:', result.cached);

  // 使用组装的上下文调用 LLM
  // await callLLM(result.context);
}

/**
 * 示例 2: 一致性检查 Skill
 *
 * 需要：所有人物 + 剧情大纲 + 世界观规则
 */
async function exampleConsistencyCheck() {
  const assembler = new ContextAssembler({
    projectId: 'project-123',
    userId: 'user-456',
    maxTokens: 10000,
  });

  const requirements: ContextRequirement[] = [
    { type: 'allCharacters' },
    { type: 'plotOutline' },
    { type: 'worldRules' },
    { type: 'currentScene' },
  ];

  const input = {
    sceneId: 'scene-5',
  };

  const result = await assembler.assemble(requirements, input);

  console.log('组装的上下文:', result.context);
  console.log('Token 数量:', result.tokenCount);

  // 检查是否有缓存命中
  const stats = assembler.getCacheStats();
  console.log('缓存统计:', stats);
}

/**
 * 示例 3: 场景扩展 Skill
 *
 * 需要：当前场景 + 相邻场景 + 剧情大纲 + 创作意图
 */
async function exampleSceneExpand() {
  const assembler = new ContextAssembler({
    projectId: 'project-123',
    userId: 'user-456',
    maxTokens: 12000,
  });

  const requirements: ContextRequirement[] = [
    { type: 'currentScene' },
    { type: 'adjacentScenes', range: 2 }, // 前后各 2 个场景
    { type: 'plotOutline' },
    { type: 'creativeIntent' },
  ];

  const input = {
    sceneId: 'scene-3',
  };

  const result = await assembler.assemble(requirements, input);

  console.log('组装的上下文:', result.context);
  console.log('Token 数量:', result.tokenCount);
}

/**
 * 示例 4: 对话式 AI（带对话历史）
 *
 * 需要：对话历史 + 当前场景 + 创作意图
 */
async function exampleConversationalAI() {
  const assembler = new ContextAssembler({
    projectId: 'project-123',
    userId: 'user-456',
    maxTokens: 8000,
  });

  const requirements: ContextRequirement[] = [
    { type: 'conversationHistory', limit: 10 },
    { type: 'currentScene' },
    { type: 'creativeIntent' },
  ];

  const input = {
    sceneId: 'scene-1',
    conversationHistory: [
      { role: 'user', content: '帮我分析一下这个场景的节奏' },
      { role: 'assistant', content: '这个场景的节奏偏慢...' },
      { role: 'user', content: '那应该怎么改进？' },
    ],
  };

  const result = await assembler.assemble(requirements, input);

  console.log('组装的上下文:', result.context);
  console.log('Token 数量:', result.tokenCount);
}

/**
 * 示例 5: Token 限制和降级策略
 *
 * 当上下文超出 token 限制时，ContextAssembler 会自动降级
 */
async function exampleTokenLimit() {
  const assembler = new ContextAssembler({
    projectId: 'project-123',
    userId: 'user-456',
    maxTokens: 2000, // 较小的限制
  });

  const requirements: ContextRequirement[] = [
    { type: 'currentScene' }, // 必要上下文，会被截断
    { type: 'allCharacters' }, // 非必要，可能被跳过
    { type: 'plotOutline' }, // 非必要，可能被跳过
    { type: 'worldRules' }, // 非必要，可能被跳过
  ];

  const input = {
    sceneId: 'scene-1',
  };

  const result = await assembler.assemble(requirements, input);

  console.log('组装的上下文:', result.context);
  console.log('Token 数量:', result.tokenCount);
  console.log('数据来源:', result.sources);

  // 检查哪些上下文被跳过
  result.sources.forEach((source) => {
    if (source.includes('skipped')) {
      console.log('跳过的上下文:', source);
    }
    if (source.includes('truncated')) {
      console.log('截断的上下文:', source);
    }
  });
}

/**
 * 示例 6: 缓存管理
 *
 * ContextAssembler 会自动缓存数据，避免重复查询
 */
async function exampleCacheManagement() {
  const assembler = new ContextAssembler({
    projectId: 'project-123',
    userId: 'user-456',
    maxTokens: 8000,
    cacheTTL: 5 * 60 * 1000, // 5 分钟
  });

  const requirements: ContextRequirement[] = [
    { type: 'worldRules' },
    { type: 'allCharacters' },
  ];

  const input = {};

  // 第一次调用（缓存未命中）
  console.log('第一次调用:');
  const result1 = await assembler.assemble(requirements, input);
  console.log('缓存命中:', result1.cached);

  // 第二次调用（缓存命中）
  console.log('\n第二次调用:');
  const result2 = await assembler.assemble(requirements, input);
  console.log('缓存命中:', result2.cached);

  // 查看缓存统计
  const stats = assembler.getCacheStats();
  console.log('\n缓存统计:');
  console.log('- 命中次数:', stats.hits);
  console.log('- 未命中次数:', stats.misses);
  console.log('- 命中率:', (stats.hitRate * 100).toFixed(2) + '%');
  console.log('- 缓存大小:', stats.size);

  // 清除缓存
  assembler.clearCache();
  console.log('\n缓存已清除');

  // 第三次调用（缓存再次未命中）
  console.log('\n第三次调用:');
  const result3 = await assembler.assemble(requirements, input);
  console.log('缓存命中:', result3.cached);
}

/**
 * 示例 7: 在 Skill 中使用 ContextAssembler
 */
class ExampleSkill {
  static descriptor = {
    id: 'example-skill',
    name: '示例技能',
    description: '展示如何在 Skill 中使用 ContextAssembler',
    requiredContext: [
      { type: 'currentScene' },
      { type: 'characterProfile' },
    ] as ContextRequirement[],
  };

  async execute(projectId: string, userId: string, input: any) {
    // 创建 ContextAssembler
    const assembler = new ContextAssembler({
      projectId,
      userId,
      maxTokens: 8000,
    });

    // 组装上下文
    const { context, tokenCount } = await assembler.assemble(
      ExampleSkill.descriptor.requiredContext,
      input
    );

    console.log('Skill 使用的上下文:', context);
    console.log('Token 数量:', tokenCount);

    // 使用上下文调用 LLM
    // const result = await callLLM(context, input);
    // return result;
  }
}

/**
 * 示例 8: 在 API 路由中使用 ContextAssembler
 */
async function exampleAPIRoute(req: any, res: any) {
  const { skillId, input, editorState } = req.body;
  const { projectId, userId } = req.user;

  // 1. 获取 Skill
  // const skill = skillRegistry.getSkill(skillId);

  // 2. 创建 ContextAssembler
  const assembler = new ContextAssembler({
    projectId,
    userId,
    maxTokens: 8000,
  });

  // 3. 组装上下文
  const assemblerInput = {
    sceneId: editorState?.currentSceneId,
    selectedText: editorState?.selectedText,
    characterId: input?.characterId,
  };

  const { context, tokenCount, sources } = await assembler.assemble(
    // skill.descriptor.requiredContext,
    [{ type: 'currentScene' }], // 示例
    assemblerInput
  );

  console.log('API 组装的上下文:', context);
  console.log('Token 数量:', tokenCount);
  console.log('数据来源:', sources);

  // 4. 执行 Skill
  // const result = await skill.execute(context, input);

  // 5. 返回结果
  // res.json({ result, tokenCount, sources });
}

// 导出示例函数
export {
  exampleDialoguePolish,
  exampleConsistencyCheck,
  exampleSceneExpand,
  exampleConversationalAI,
  exampleTokenLimit,
  exampleCacheManagement,
  ExampleSkill,
  exampleAPIRoute,
};
