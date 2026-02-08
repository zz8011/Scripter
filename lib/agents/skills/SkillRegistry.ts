/* ==================================================
   技能注册中心
   Skill Registry
   ================================================== */

import { Skill, ContextRequirement } from '../core/types';

/**
 * 技能注册中心
 * 管理所有技能的注册和查找
 *
 * 新增功能：
 * - 查询技能的上下文需求
 * - 检查技能是否需要特定上下文
 * - 按上下文需求筛选技能
 */
export class SkillRegistry {
  private static instance: SkillRegistry;
  private skills: Map<string, Skill> = new Map();
  private skillsByCategory: Map<string, Set<string>> = new Map();
  
  private constructor() {}
  
  /**
   * 获取单例
   */
  public static getInstance(): SkillRegistry {
    if (!SkillRegistry.instance) {
      SkillRegistry.instance = new SkillRegistry();
    }
    return SkillRegistry.instance;
  }
  
  /**
   * 注册技能
   */
  public register(skill: Skill): void {
    this.skills.set(skill.id, skill);
    
    // 按分类索引
    if (!this.skillsByCategory.has(skill.category)) {
      this.skillsByCategory.set(skill.category, new Set());
    }
    this.skillsByCategory.get(skill.category)!.add(skill.id);
    
    console.log(`[SkillRegistry] 技能注册: ${skill.name} (${skill.id})`);
  }
  
  /**
   * 注销技能
   */
  public unregister(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (skill) {
      this.skills.delete(skillId);
      
      // 从分类索引中移除
      const categorySkills = this.skillsByCategory.get(skill.category);
      if (categorySkills) {
        categorySkills.delete(skillId);
      }
      
      console.log(`[SkillRegistry] 技能注销: ${skill.name} (${skillId})`);
    }
  }
  
  /**
   * 获取技能
   */
  public getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }
  
  /**
   * 获取所有技能
   */
  public getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }
  
  /**
   * 按分类获取技能
   */
  public getSkillsByCategory(category: string): Skill[] {
    const skillIds = this.skillsByCategory.get(category);
    if (!skillIds) return [];
    
    return Array.from(skillIds)
      .map(id => this.skills.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }
  
  /**
   * 搜索技能
   */
  public searchSkills(query: {
    name?: string;
    category?: string;
    tag?: string;
    author?: string;
  }): Skill[] {
    return this.getAllSkills().filter(skill => {
      if (query.name && !skill.name.includes(query.name)) return false;
      if (query.category && skill.category !== query.category) return false;
      if (query.tag && !skill.metadata.tags.includes(query.tag)) return false;
      if (query.author && skill.metadata.author !== query.author) return false;
      return true;
    });
  }
  
  /**
   * 获取统计信息
   */
  public getStats() {
    return {
      totalSkills: this.skills.size,
      categories: Array.from(this.skillsByCategory.entries()).map(([category, skillIds]) => ({
        category,
        count: skillIds.size,
      })),
    };
  }

  /**
   * 获取技能的上下文需求
   * @param skillId 技能 ID
   * @returns 上下文需求数组，如果技能不存在或没有声明需求则返回空数组
   */
  public getContextRequirements(skillId: string) {
    const skill = this.skills.get(skillId);
    return skill?.requiredContext || [];
  }

  /**
   * 检查技能是否需要特定类型的上下文
   * @param skillId 技能 ID
   * @param contextType 上下文类型
   * @returns 是否需要该类型的上下文
   */
  public requiresContext(skillId: string, contextType: string): boolean {
    const requirements = this.getContextRequirements(skillId);
    return requirements.some(req => req.type === contextType);
  }

  /**
   * 获取所有需要特定上下文类型的技能
   * @param contextType 上下文类型
   * @returns 需要该上下文的技能列表
   */
  public getSkillsByContextRequirement(contextType: string): Skill[] {
    return this.getAllSkills().filter(skill =>
      skill.requiredContext?.some(req => req.type === contextType)
    );
  }
}
