/* ==================================================
   技能基类
   Skill Base Class
   ================================================== */

import { v4 as uuidv4 } from 'uuid';
import { Context } from '../core/types';

/**
 * 技能基类
 * 所有技能都继承此类
 */
export abstract class Skill {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly category: string;
  public readonly version: string;
  public readonly author: string;
  public readonly tags: string[];
  public readonly confidence: number;
  
  constructor(
    name: string,
    description: string,
    category: string,
    options: {
      version?: string;
      author?: string;
      tags?: string[];
      confidence?: number;
    } = {}
  ) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.category = category;
    this.version = options.version || '1.0.0';
    this.author = options.author || 'unknown';
    this.tags = options.tags || [];
    this.confidence = options.confidence ?? 0.8;
  }
  
  /**
   * 执行技能
   */
  public abstract execute(context: Context, input: any): Promise<any>;
  
  /**
   * 验证输入
   */
  protected abstract validateInput(input: any): boolean;
  
  /**
   * 获取元数据
   */
  public getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      version: this.version,
      author: this.author,
      tags: this.tags,
      confidence: this.confidence,
    };
  }
}
