/* ==================================================
   剧本格式检查器
   Script Format Validator
   ================================================== */

import { Node as ProseMirrorNode } from 'prosemirror-model';

/* ==================================================
   格式错误类型 Format Error Types
   ================================================== */

export interface FormatError {
  type: 'error' | 'warning';
  message: string;
  line: number;
  offset: number;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormatError[];
  warnings: FormatError[];
  stats: {
    sceneCount: number;
    characterCount: number;
    dialogueCount: number;
    actionCount: number;
    parentheticalCount: number;
  };
}

/* ==================================================
   格式规则检查 Format Rule Checking
   ================================================== */

class ScriptValidator {
  /* --------------------------------------------------
     场景标题检查 Scene Heading Validation
     -------------------------------------------------- */

  private validateSceneHeading(text: string, line: number): FormatError[] {
    const errors: FormatError[] = [];

    // 必须以"场景"开头
    if (!text.trim().startsWith('场景')) {
      errors.push({
        type: 'error',
        message: '场景标题必须以"场景"开头',
        line,
        offset: 0,
        suggestion: '建议格式：场景1 - 室内 客厅 白天',
      });
    }

    // 检查场景编号
    const sceneNumberMatch = text.match(/场景(\d+)/);
    if (sceneNumberMatch) {
      const sceneNumber = parseInt(sceneNumberMatch[1], 10);
      if (isNaN(sceneNumber) || sceneNumber < 1) {
        errors.push({
          type: 'error',
          message: '场景编号必须大于0',
          line,
          offset: 0,
        });
      }
    }

    // 检查场景要素（时间、地点、内/外景）
    const hasTime = /白天|夜晚|清晨|黄昏|傍晚|凌晨|中午/.test(text);
    const hasLocation = /室内|室外|内外/.test(text);

    if (!hasTime && !hasLocation) {
      errors.push({
        type: 'warning',
        message: '建议包含场景时间（白天/夜晚）和地点（室内/室外）',
        line,
        offset: 0,
        suggestion: '例如：场景1 - 室内 客厅 白天',
      });
    }

    return errors;
  }

  /* --------------------------------------------------
     人物名称检查 Character Validation
     -------------------------------------------------- */

  private validateCharacter(text: string, line: number): FormatError[] {
    const errors: FormatError[] = [];
    const trimmedText = text.trim();

    // 检查长度
    if (trimmedText.length === 0) {
      errors.push({
        type: 'error',
        message: '人物名称不能为空',
        line,
        offset: 0,
      });
      return errors;
    }

    if (trimmedText.length > 20) {
      errors.push({
        type: 'warning',
        message: '人物名称过长，建议使用简称',
        line,
        offset: 0,
        suggestion: '例如：张三 (而不是"张三同志")',
      });
    }

    // 检查是否包含标点
    if (/[.,;:!?]/.test(trimmedText)) {
      errors.push({
        type: 'error',
        message: '人物名称不应包含标点符号',
        line,
        offset: 0,
      });
    }

    // 检查是否全大写
    if (trimmedText !== trimmedText.toUpperCase()) {
      errors.push({
        type: 'warning',
        message: '人物名称建议使用大写',
        line,
        offset: 0,
        suggestion: '例如：ZHANG SAN (而不是"Zhang San")',
      });
    }

    return errors;
  }

  /* --------------------------------------------------
     对白检查 Dialogue Validation
     -------------------------------------------------- */

  private validateDialogue(text: string, line: number): FormatError[] {
    const errors: FormatError[] = [];
    const trimmedText = text.trim();

    // 检查长度
    if (trimmedText.length === 0) {
      errors.push({
        type: 'error',
        message: '对白不能为空',
        line,
        offset: 0,
      });
      return errors;
    }

    // 检查是否过长（一行超过60字符）
    if (trimmedText.length > 60) {
      errors.push({
        type: 'warning',
        message: '对白建议分多行，每行不超过60字符',
        line,
        offset: 0,
      });
    }

    return errors;
  }

  /* --------------------------------------------------
     动作描述检查 Action Validation
     -------------------------------------------------- */

  private validateAction(text: string, line: number): FormatError[] {
    const errors: FormatError[] = [];
    const trimmedText = text.trim();

    // 检查长度
    if (trimmedText.length === 0) {
      errors.push({
        type: 'warning',
        message: '动作描述为空',
        line,
        offset: 0,
      });
      return errors;
    }

    // 检查是否过长（一段超过200字符）
    if (trimmedText.length > 200) {
      errors.push({
        type: 'warning',
        message: '动作描述建议分多段，每段不超过200字符',
        line,
        offset: 0,
      });
    }

    return errors;
  }

  /* --------------------------------------------------
     括号说明检查 Parenthetical Validation
     -------------------------------------------------- */

  private validateParenthetical(text: string, line: number): FormatError[] {
    const errors: FormatError[] = [];
    const trimmedText = text.trim();

    // 必须以括号开头和结尾
    if (!trimmedText.startsWith('(') || !trimmedText.endsWith(')')) {
      errors.push({
        type: 'error',
        message: '括号说明必须以小括号包裹',
        line,
        offset: 0,
        suggestion: '例如：(低声) 或 (犹豫地)',
      });
      return errors;
    }

    // 检查长度
    const content = trimmedText.slice(1, -1).trim();
    if (content.length === 0) {
      errors.push({
        type: 'error',
        message: '括号说明内容不能为空',
        line,
        offset: 0,
      });
    }

    if (content.length > 30) {
      errors.push({
        type: 'warning',
        message: '括号说明建议简洁，不超过30字符',
        line,
        offset: 0,
      });
    }

    return errors;
  }

  /* --------------------------------------------------
     主验证函数 Main Validation
     -------------------------------------------------- */

  public validate(doc: ProseMirrorNode): ValidationResult {
    const errors: FormatError[] = [];
    const warnings: FormatError[] = [];

    const stats = {
      sceneCount: 0,
      characterCount: 0,
      dialogueCount: 0,
      actionCount: 0,
      parentheticalCount: 0,
    };

    let line = 0;

    // 遍历文档节点
    doc.descendants((node) => {
      if (node.type.name === 'paragraph' || node.type.name === 'sceneHeading' ||
          node.type.name === 'character' || node.type.name === 'dialogue' ||
          node.type.name === 'action' || node.type.name === 'parenthetical') {

        line++;
        const text = node.textContent;

        // 根据节点类型进行验证
        switch (node.type.name) {
          case 'sceneHeading':
            stats.sceneCount++;
            errors.push(...this.validateSceneHeading(text, line));
            break;

          case 'character':
            stats.characterCount++;
            errors.push(...this.validateCharacter(text, line));
            break;

          case 'dialogue':
            stats.dialogueCount++;
            errors.push(...this.validateDialogue(text, line));
            break;

          case 'action':
            stats.actionCount++;
            errors.push(...this.validateAction(text, line));
            break;

          case 'parenthetical':
            stats.parentheticalCount++;
            errors.push(...this.validateParenthetical(text, line));
            break;

          case 'paragraph':
            // 普通段落默认为动作描述
            stats.actionCount++;
            warnings.push(...this.validateAction(text, line));
            break;
        }
      }
    });

    // 检查结构问题
    if (stats.sceneCount === 0) {
      errors.push({
        type: 'warning',
        message: '剧本缺少场景标题',
        line: 0,
        offset: 0,
        suggestion: '添加场景标题，例如：场景1 - 室内 客厅 白天',
      });
    }

    if (stats.dialogueCount > 0 && stats.characterCount === 0) {
      errors.push({
        type: 'warning',
        message: '有对白但缺少人物名称',
        line: 0,
        offset: 0,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats,
    };
  }

  /* --------------------------------------------------
     快速检查 Quick Check (用于实时提示)
     -------------------------------------------------- */

  public quickCheck(text: string, nodeType: string): FormatError[] {
    const errors: FormatError[] = [];

    switch (nodeType) {
      case 'sceneHeading':
        return this.validateSceneHeading(text, 0);

      case 'character':
        return this.validateCharacter(text, 0);

      case 'dialogue':
        return this.validateDialogue(text, 0);

      case 'action':
        return this.validateAction(text, 0);

      case 'parenthetical':
        return this.validateParenthetical(text, 0);
    }

    return errors;
  }
}

/* ==================================================
   导出单例 Export Singleton
   ================================================== */

export const scriptValidator = new ScriptValidator();

/* ==================================================
   便捷函数 Utility Functions
   ================================================== */

export function validateScript(doc: ProseMirrorNode): ValidationResult {
  return scriptValidator.validate(doc);
}

export function quickValidate(text: string, nodeType: string): FormatError[] {
  return scriptValidator.quickCheck(text, nodeType);
}
