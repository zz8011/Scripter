/* ==================================================
   技能初始化
   Skills Initialization
   ================================================== */

import { SkillRegistry } from './SkillRegistry';
import { FormatFixSkill } from './FormatFixSkill';
import { DialoguePolishSkill } from './DialoguePolishSkill';
import { SceneExpandSkill } from './SceneExpandSkill';
import { RhythmAnalyzeSkill } from './RhythmAnalyzeSkill';
import { ConsistencyCheckSkill } from './ConsistencyCheckSkill';
import { HumanizeSkill } from './HumanizeSkill';

/**
 * 初始化所有技能
 * 在应用启动时调用，将所有技能注册到 SkillRegistry
 */
export function initializeSkills(): void {
  const registry = SkillRegistry.getInstance();

  // 注册格式修复技能
  registry.register(new FormatFixSkill());

  // 注册对白润色技能
  registry.register(new DialoguePolishSkill());

  // 注册场景扩展技能
  registry.register(new SceneExpandSkill());

  // 注册节奏分析技能
  registry.register(new RhythmAnalyzeSkill());

  // 注册一致性检查技能
  registry.register(new ConsistencyCheckSkill());

  // 注册人性化润色技能
  registry.register(new HumanizeSkill());

  console.log('[Skills] 技能初始化完成，已注册 6 个技能');
}

/**
 * 获取已初始化的技能注册中心
 */
export function getSkillRegistry(): SkillRegistry {
  return SkillRegistry.getInstance();
}
