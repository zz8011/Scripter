/* ==================================================
   技能注册中心
   Skill Registry
   ================================================== */

import { Skill } from './Skill';

/**
 * 技能注册中心
 * 管理所有技能的注册和查找
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
      if (query.tag && !skill.tags.includes(query.tag)) return false;
      if (query.author && skill.author !== query.author) return false;
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
}
