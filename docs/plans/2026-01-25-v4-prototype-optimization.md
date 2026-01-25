# Scripter v4 原型优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 全面优化 v4 原型，修复设计系统不一致问题，补充缺失的 PRD v2.5 功能，提升用户体验和代码质量

**架构:** 基于 HTML 原型进行优化，保持现有的组件化结构，修复设计规范问题，补充核心功能

**技术栈:** HTML5 + Tailwind CSS + Vanilla JavaScript + 组件化架构

---

## 📊 当前状态分析

### 已完成功能 (10 个页面，~6000 行代码)

| 页面 | 状态 | 评分 | 主要问题 |
|------|------|------|---------|
| 00-welcome.html | ✅ 完整 | 85% | 设计系统不一致 |
| 01-dashboard.html | ✅ 完整 | 80% | 缺少实时统计 |
| 02-editor.html | ✅ 完整 | 75% | TipTap 未集成，段落拖拽不完善 |
| 03-characters.html | ✅ 完整 | 80% | 缺少关系图谱可视化 |
| 04-worldview.html | ✅ 完整 | 85% | 缺少富文本编辑器 |
| 05-scenes.html | ✅ 完整 | 75% | 拖拽功能存在但需优化 |
| 06-storyboard.html | ✅ 完整 | 80% | 四栏排版需完善 |
| 07-settings.html | ✅ 完整 | 90% | 配置较完整 |
| 08-export.html | ✅ 完整 | 40% | ❌ 导出功能未实现 |
| 09-help.html | ✅ 完整 | 85% | 文档完整 |
| 10-project.html | ✅ 完整 | 85% | 项目创建较完整 |

### 已有 JS 组件 (5 个，~1000 行代码)

| 组件 | 状态 | 评分 | 主要问题 |
|------|------|------|---------|
| ai-chat.js | ✅ 完整 | 85% | 流式响应需优化 |
| modal.js | ✅ 完整 | 90% | 模态框宽度需统一为 700px |
| drag-drop.js | ✅ 完整 | 80% | 金色指示线缺失 |
| format-checker.js | ✅ 完整 | 85% | 实时检查需优化 |
| form-validator.js | ✅ 完整 | 85% | 验证规则需补充 |

### 🚨 关键问题汇总

#### 1. 设计系统不一致 (P0)

```css
/* ❌ 发现的问题 */
- 左侧导航栏颜色：应该是 #1A1A1A，部分页面使用了白色
- 模态框宽度：不统一，有 600px, 700px, auto 等
- 间距问题：部分使用了 10px, 15px 等非 8px 网格值
- 金色使用：部分页面滥用金色作背景色
- 玻璃拟态：部分卡片缺失毛玻璃效果
```

#### 2. 缺失 PRD v2.5 核心功能 (P0)

| 功能 | PRD 要求 | 当前状态 | 缺失程度 |
|------|---------|---------|---------|
| **TipTap 编辑器** | 无头设计、剧本格式 | ❌ 使用 textarea 替代 | 100% |
| **版本控制** | 历史版本、回滚 | ❌ 未实现 | 100% |
| **导出功能** | PDF/Word/Text | ⚠️ 仅有 UI，未实现 | 90% |
| **剧灵八字系统** | 生辰八字性格 | ❌ 未实现 | 100% |
| **AI Skills** | 原子化技能 (6+) | ⚠️ 仅 3 个 Quick Actions | 50% |
| **人物关系图谱** | 可视化关系 | ❌ 未实现 | 100% |
| **集长统计** | 自动计算 | ❌ 未实现 | 100% |
| **相关性判断** | 智能上下文 | ❌ 未实现 | 100% |

#### 3. 代码质量问题 (P1)

```javascript
// 发现的问题：
- HTML 和 JS 混在一起，未模块化
- 缺少错误处理机制
- 无单元测试
- 性能优化空间大（可使用虚拟滚动）
- 无 TypeScript 类型检查
```

---

## 🎯 优化目标

### 主要目标 (Must-Have)

1. ✅ 修复所有设计系统不一致问题
2. ✅ 实现核心编辑功能（TipTap 集成或改进）
3. ✅ 实现导出功能（PDF/Word/Text）
4. ✅ 补充剧灵八字系统 UI
5. ✅ 添加版本控制 UI
6. ✅ 完善拖拽功能（金色指示线）

### 次要目标 (Nice-to-Have)

7. ⭐ 优化性能（虚拟滚动、懒加载）
8. ⭐ 添加单元测试
9. ⭐ 实现人物关系图谱
10. ⭐ 代码模块化重构

---

## 📋 实施计划

### 阶段 1: 设计系统修复 (1-2 天)

**优先级: P0**
**预计时间: 4-6 小时**

#### Task 1.1: 修复左侧导航栏颜色

**Files:**
- Modify: `docs/design/prototypes/v4/01-dashboard.html:76-81`
- Modify: `docs/design/prototypes/v4/02-editor.html:83-88`
- Modify: `docs/design/prototypes/v4/03-characters.html:76-81`
- Modify: `docs/design/prototypes/v4/04-worldview.html:76-81`
- Modify: `docs/design/prototypes/v4/05-scenes.html:77-82`
- Modify: `docs/design/prototypes/v4/06-storyboard.html:76-81`
- Modify: `docs/design/prototypes/v4/07-settings.html:75-80`
- Modify: `docs/design/prototypes/v4/08-export.html:76-81`
- Modify: `docs/design/prototypes/v4/09-help.html:76-81`
- Modify: `docs/design/prototypes/v4/10-project.html:76-81`

**Step 1: 检查当前状态**

打开每个 HTML 文件，查找 `.integrated-sidebar` 样式定义。

```bash
# 运行命令检查
grep -n "\.integrated-sidebar {" docs/design/prototypes/v4/*.html
```

**Step 2: 确认问题**

预期发现：部分页面 `background` 使用了 `#FFFFFF` 或其他颜色。

**Step 3: 统一修复**

将所有页面的 `.integrated-sidebar` 背景色统一为 `#1A1A1A`，文字颜色为 `#FFFFFF`：

```css
.integrated-sidebar {
    background: #1A1A1A;  /* ✅ 深黑色 */
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    color: #FFFFFF;        /* ✅ 白色文字 */
    /* ... 其他样式保持不变 */
}
```

**Step 4: 修复导航文字颜色**

确保所有导航链接使用白色：

```css
.nav-link {
    color: #FFFFFF;        /* ✅ 白色 */
}
.nav-link:hover {
    color: #C9A962;        /* ✅ 金色 hover */
}
```

**Step 5: 验证修复**

```bash
# 在浏览器中打开每个页面，检查导航栏颜色
# 预期：左侧导航栏为深黑色 #1A1A1A，文字为白色
```

**Step 6: 提交**

```bash
git add docs/design/prototypes/v4/*.html
git commit -m "fix(v4): 统一左侧导航栏为深黑色 #1A1A1A"
```

---

#### Task 1.2: 统一模态框宽度为 700px

**Files:**
- Modify: `docs/design/prototypes/v4/js/modal.js:89-95`
- Verify: `docs/design/prototypes/v4/*.html` (所有使用模态框的页面)

**Step 1: 检查当前模态框宽度**

```bash
# 搜索所有模态框宽度定义
grep -n "max-width.*px\|width.*px" docs/design/prototypes/v4/js/modal.js
```

**Step 2: 确认问题**

预期发现：存在 `600px`, `800px`, `auto` 等不同宽度值。

**Step 3: 修复模态框宽度**

修改 `modal.js` 中的 `.modal` 样式：

```css
.modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;          /* ✅ 固定 700px */
    max-width: 90vw;       /* ✅ 移动端响应式 */
    max-height: 80vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
    /* ... 其他样式保持不变 */
}
```

**Step 4: 验证修复**

在每个页面上打开模态框，确认宽度为 700px。

**Step 5: 提交**

```bash
git add docs/design/prototypes/v4/js/modal.js
git commit -m "fix(v4): 统一模态框宽度为 700px"
```

---

#### Task 1.3: 修复间距为 8px 网格

**Files:**
- Modify: `docs/design/prototypes/v4/*.html` (所有页面)
- Modify: `docs/design/prototypes/v4/js/*.js` (所有 JS 组件)

**Step 1: 搜索非 8px 网格间距**

```bash
# 搜索常见的非网格间距
grep -rn "padding.*\(10px\|15px\|20px\|25px\|30px\)" docs/design/prototypes/v4/*.html
grep -rn "gap.*\(10px\|15px\|20px\|25px\|30px\)" docs/design/prototypes/v4/*.html
```

**Step 2: 创建替换映射表**

```javascript
// 8px 网格替换规则
const spacingMap = {
  '10px': '8px',      // 或 '12px'，视上下文而定
  '15px': '16px',
  '20px': '16px',     // 或 '24px'，视上下文而定
  '25px': '24px',
  '30px': '32px',
  // ...
};
```

**Step 3: 批量修复**

使用编辑器查找替换功能，逐个修复非 8px 网格间距。

**替换示例:**
- `padding: 10px 15px` → `padding: 8px 12px`
- `gap: 20px` → `gap: 16px` 或 `gap: 24px`
- `margin: 30px 0` → `margin: 32px 0`

**Step 4: 验证修复**

在浏览器中检查每个页面，确认间距一致。

**Step 5: 提交**

```bash
git add docs/design/prototypes/v4/
git commit -m "fix(v4): 统一所有间距为 8px 网格"
```

---

#### Task 1.4: 修复金色使用规范

**Files:**
- Modify: `docs/design/prototypes/v4/*.html` (所有页面)

**Step 1: 搜索金色背景使用**

```bash
# 搜索金色用作背景的情况（应该避免）
grep -rn "background.*#C9A962" docs/design/prototypes/v4/*.html
```

**Step 2: 确认问题**

预期发现：部分页面将金色用作大面积背景。

**Step 3: 修复金色使用**

**正确用法:**
```css
/* ✅ 金色用于边框 */
.button-primary {
    border-color: #C9A962;
    color: #C9A962;
}

/* ✅ 金色用于 hover 状态 */
.button-primary:hover {
    background: rgba(201, 169, 98, 0.1);
    border-color: #C9A962;
}

/* ❌ 避免金色用于背景 */
.header {
    background: #C9A962;  /* ❌ 改为 #F5F1E8 或 #FFFFFF */
}
```

**Step 4: 验证修复**

在浏览器中检查每个页面，确认金色使用符合规范。

**Step 5: 提交**

```bash
git add docs/design/prototypes/v4/
git commit -m "fix(v4): 修复金色使用规范，仅用于边框和强调"
```

---

#### Task 1.5: 添加玻璃拟态效果

**Files:**
- Modify: `docs/design/prototypes/v4/*.html` (所有页面的卡片组件)

**Step 1: 搜索卡片样式**

```bash
# 搜索所有卡片样式
grep -rn "\.card\|project-card\|scene-card\|char-card" docs/design/prototypes/v4/*.html
```

**Step 2: 确认缺失玻璃拟态的卡片**

预期发现：部分卡片仅有 `background: white`，缺少 `backdrop-filter`。

**Step 3: 添加玻璃拟态样式**

```css
.card {
    background: rgba(255, 255, 255, 0.6);  /* ✅ 半透明白色 */
    backdrop-filter: blur(8px);             /* ✅ 毛玻璃效果 */
    border: 1px solid rgba(255, 255, 255, 0.3);
    /* ... 其他样式保持不变 */
}
```

**Step 4: 验证修复**

在浏览器中检查每个页面的卡片，确认有毛玻璃效果。

**Step 5: 提交**

```bash
git add docs/design/prototypes/v4/
git commit -m "feat(v4): 为所有卡片添加玻璃拟态效果"
```

---

### 阶段 2: 核心功能实现 (3-5 天)

**优先级: P0**
**预计时间: 12-20 小时**

#### Task 2.1: 实现导出功能

**Files:**
- Create: `docs/design/prototypes/v4/js/export.js`
- Modify: `docs/design/prototypes/v4/08-export.html:100-300`

**Step 1: 编写导出模块测试**

```javascript
// tests/export.test.js (创建测试文件)
describe('Export Module', () => {
    test('should export script as plain text', () => {
        const content = '1. 【王府·书房】 日\n【王语嫣】\n(微笑着) 你好';
        const result = exportAsText(content);
        expect(result).toContain('王府·书房');
        expect(result).toContain('王语嫣');
    });

    test('should calculate scene duration', () => {
        const scene = createMockScene();
        const duration = calculateDuration(scene);
        expect(duration).toBeGreaterThan(0);
    });
});
```

**Step 2: 运行测试确认失败**

```bash
# 运行测试（需要先配置测试框架）
npm test  # 或使用 Vitest
```

预期: FAIL "export module not defined"

**Step 3: 实现导出模块**

创建 `js/export.js`:

```javascript
/**
 * Scripter Export Module
 * 支持导出为 PDF、Word、纯文本格式
 */

class ScripterExport {
    constructor(options = {}) {
        this.projectId = options.projectId || null;
        this.format = options.format || 'pdf'; // pdf | docx | txt
        this.onProgress = options.onProgress || null;
    }

    /**
     * 导出为纯文本
     */
    exportAsText(scriptData) {
        let text = '';

        scriptData.scenes.forEach(scene => {
            text += `第 ${scene.episode} 集 - 场景 ${scene.number}\n`;
            text += `${scene.location} - ${scene.time}\n\n`;

            scene.content.forEach(line => {
                text += `${line.type === 'character' ? '【' + line.content + '】' : line.content}\n`;
            });

            text += '\n---\n\n';
        });

        return text;
    }

    /**
     * 导出为 PDF（使用浏览器打印 API）
     */
    async exportAsPDF(scriptData) {
        // 创建打印友好的 HTML
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generatePrintHTML(scriptData));
        printWindow.document.close();

        // 触发打印对话框
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    /**
     * 生成打印 HTML
     */
    generatePrintHTML(scriptData) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${scriptData.title}</title>
    <style>
        @page {
            size: A4;
            margin: 25.4mm;
        }
        body {
            font-family: 'Courier Prime', monospace;
            font-size: 12pt;
            line-height: 1.6;
        }
        .scene-header {
            font-weight: bold;
            margin-top: 1em;
        }
        .character {
            font-weight: bold;
            text-align: center;
            margin-top: 1em;
        }
        .dialogue {
            text-align: center;
        }
        .action {
            margin: 0.5em 0;
        }
    </style>
</head>
<body>
    ${this.generateScenesHTML(scriptData.scenes)}
</body>
</html>
        `;
    }

    /**
     * 生成场景 HTML
     */
    generateScenesHTML(scenes) {
        return scenes.map(scene => `
            <div class="scene">
                <div class="scene-header">${scene.number}. 【${scene.location}】 ${scene.time}</div>
                ${scene.content.map(line => {
                    if (line.type === 'character') {
                        return `<div class="character">【${line.content}】</div>`;
                    } else if (line.type === 'dialogue') {
                        return `<div class="dialogue">${line.content}</div>`;
                    } else if (line.type === 'action') {
                        return `<div class="action">(${line.content})</div>`;
                    }
                    return '';
                }).join('\n            ')}
            </div>
        `).join('\n');
    }

    /**
     * 计算场景时长（基于字数）
     */
    calculateDuration(scene) {
        const totalChars = scene.content.reduce((sum, line) => {
            return sum + line.content.length;
        }, 0);

        // 假设每分钟 180 字（中等语速）
        return Math.ceil(totalChars / 180);
    }
}

// 导出模块
window.ScripterExport = ScripterExport;
```

**Step 4: 在 08-export.html 中集成导出模块**

```html
<script src="js/export.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const exporter = new ScripterExport({
        format: 'pdf',
        onProgress: (progress) => {
            console.log(`Export progress: ${progress}%`);
        }
    });

    // 绑定导出按钮
    document.getElementById('btn-export-pdf').addEventListener('click', async () => {
        const scriptData = getMockScriptData(); // 从 localStorage 或 API 获取
        await exporter.exportAsPDF(scriptData);
    });

    document.getElementById('btn-export-text').addEventListener('click', async () => {
        const scriptData = getMockScriptData();
        const text = exporter.exportAsText(scriptData);

        // 触发下载
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${scriptData.title}.txt`;
        a.click();
    });
});
</script>
```

**Step 5: 运行测试验证**

```bash
npm test
```

预期: PASS

**Step 6: 手动测试**

在浏览器中打开 `08-export.html`，测试 PDF 和文本导出功能。

**Step 7: 提交**

```bash
git add docs/design/prototypes/v4/js/export.js docs/design/prototypes/v4/08-export.html
git commit -m "feat(v4): 实现导出功能 (PDF/Text)"
```

---

#### Task 2.2: 添加版本控制 UI

**Files:**
- Create: `docs/design/prototypes/v4/js/version-control.js`
- Modify: `docs/design/prototypes/v4/02-editor.html:300-400`

**Step 1: 编写版本控制测试**

```javascript
// tests/version-control.test.js
describe('Version Control', () => {
    test('should save version snapshot', () => {
        const vc = new VersionControl();
        vc.save('Initial version');
        expect(vc.getHistory().length).toBe(1);
    });

    test('should restore version', () => {
        const vc = new VersionControl();
        vc.save('Version 1');
        const content = 'Scene content';
        vc.updateContent(content);
        vc.save('Version 2');

        vc.restore('Version 1');
        expect(vc.getContent()).toBe('');
    });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test
```

预期: FAIL "VersionControl not defined"

**Step 3: 实现版本控制模块**

创建 `js/version-control.js`:

```javascript
/**
 * Scripter Version Control Module
 * 基于 localStorage 的轻量级版本控制
 */

class VersionControl {
    constructor(options = {}) {
        this.projectId = options.projectId || 'default';
        this.maxVersions = options.maxVersions || 50;
        this.storageKey = `scripter_versions_${this.projectId}`;
        this.currentKey = `scripter_current_${this.projectId}`;
        this.versions = this.loadVersions();
        this.currentContent = this.loadCurrent();
    }

    /**
     * 保存当前版本
     */
    save(description = '') {
        const version = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            description: description || this.generateDescription(),
            content: this.currentContent,
            metadata: {
                wordCount: this.countWords(this.currentContent),
                sceneCount: this.countScenes(this.currentContent),
            }
        };

        this.versions.unshift(version);

        // 限制版本数量
        if (this.versions.length > this.maxVersions) {
            this.versions = this.versions.slice(0, this.maxVersions);
        }

        this.saveVersions();
        return version;
    }

    /**
     * 恢复到指定版本
     */
    restore(versionId) {
        const version = this.versions.find(v => v.id === versionId);
        if (!version) {
            throw new Error('Version not found');
        }

        this.currentContent = version.content;
        this.saveCurrent();
        return version;
    }

    /**
     * 获取版本历史
     */
    getHistory() {
        return this.versions;
    }

    /**
     * 比较两个版本
     */
    compare(versionId1, versionId2) {
        const v1 = this.versions.find(v => v.id === versionId1);
        const v2 = this.versions.find(v => v.id === versionId2);

        if (!v1 || !v2) {
            throw new Error('Version not found');
        }

        return {
            added: this.diff(v1.content, v2.content, 'added'),
            removed: this.diff(v1.content, v2.content, 'removed'),
            modified: this.diff(v1.content, v2.content, 'modified')
        };
    }

    /**
     * 更新当前内容
     */
    updateContent(content) {
        this.currentContent = content;
        this.saveCurrent();
    }

    /**
     * 获取当前内容
     */
    getContent() {
        return this.currentContent;
    }

    /**
     * 加载版本历史
     */
    loadVersions() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load versions:', error);
            return [];
        }
    }

    /**
     * 保存版本历史
     */
    saveVersions() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.versions));
        } catch (error) {
            console.error('Failed to save versions:', error);
        }
    }

    /**
     * 加载当前内容
     */
    loadCurrent() {
        try {
            return localStorage.getItem(this.currentKey) || '';
        } catch (error) {
            console.error('Failed to load current content:', error);
            return '';
        }
    }

    /**
     * 保存当前内容
     */
    saveCurrent() {
        try {
            localStorage.setItem(this.currentKey, this.currentContent);
        } catch (error) {
            console.error('Failed to save current content:', error);
        }
    }

    /**
     * 生成版本 ID
     */
    generateId() {
        return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 生成版本描述
     */
    generateDescription() {
        const now = new Date();
        return `自动保存 - ${now.toLocaleString('zh-CN')}`;
    }

    /**
     * 统计字数
     */
    countWords(content) {
        return content.length;
    }

    /**
     * 统计场景数
     */
    countScenes(content) {
        const matches = content.match(/^\d+\.\s+【/gm);
        return matches ? matches.length : 0;
    }

    /**
     * 简单的 diff 算法
     */
    diff(content1, content2, type) {
        // 这里使用简单的行比较
        const lines1 = content1.split('\n');
        const lines2 = content2.split('\n');

        const result = [];
        const maxLength = Math.max(lines1.length, lines2.length);

        for (let i = 0; i < maxLength; i++) {
            const line1 = lines1[i];
            const line2 = lines2[i];

            if (line1 !== line2) {
                result.push({
                    lineNumber: i + 1,
                    oldContent: line1,
                    newContent: line2
                });
            }
        }

        return result;
    }

    /**
     * 清空所有版本
     */
    clear() {
        this.versions = [];
        this.currentContent = '';
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.currentKey);
    }
}

// 导出模块
window.VersionControl = VersionControl;
```

**Step 4: 在编辑器中集成版本控制**

在 `02-editor.html` 中添加版本控制面板：

```html
<!-- 版本历史面板 -->
<div class="version-panel sidebar-right-collapsed" id="version-panel">
    <div class="panel-header">
        <h3>版本历史</h3>
        <button onclick="closeVersionPanel()" class="btn-close">
            <iconify-icon icon="lucide:x"></iconify-icon>
        </button>
    </div>
    <div class="version-list" id="version-list">
        <!-- 版本列表动态生成 -->
    </div>
</div>

<script src="js/version-control.js"></script>
<script>
let versionControl;

document.addEventListener('DOMContentLoaded', () => {
    versionControl = new VersionControl({
        projectId: 'demo-project',
        maxVersions: 50
    });

    // 自动保存（每 5 分钟）
    setInterval(() => {
        versionControl.save('自动保存');
        renderVersionList();
    }, 5 * 60 * 1000);

    // 渲染版本列表
    renderVersionList();
});

function openVersionPanel() {
    document.getElementById('version-panel').classList.remove('sidebar-right-collapsed');
}

function closeVersionPanel() {
    document.getElementById('version-panel').classList.add('sidebar-right-collapsed');
}

function renderVersionList() {
    const versions = versionControl.getHistory();
    const container = document.getElementById('version-list');

    container.innerHTML = versions.map(version => `
        <div class="version-item" onclick="restoreVersion('${version.id}')">
            <div class="version-header">
                <span class="version-description">${version.description}</span>
                <span class="version-time">${formatTime(version.timestamp)}</span>
            </div>
            <div class="version-meta">
                <span>${version.metadata.wordCount} 字</span>
                <span>${version.metadata.sceneCount} 场景</span>
            </div>
        </div>
    `).join('');
}

function restoreVersion(versionId) {
    if (confirm('确定要恢复到这个版本吗？当前内容将被覆盖。')) {
        versionControl.restore(versionId);
        alert('版本已恢复');
        location.reload();
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
}
</script>
```

**Step 5: 添加版本控制样式**

```css
.version-panel {
    position: fixed;
    right: 0;
    top: 0;
    width: 320px;
    height: 100vh;
    background: white;
    border-left: 1px solid var(--border-color);
    z-index: 40;
    display: flex;
    flex-direction: column;
}

.version-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

.version-item {
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.version-item:hover {
    border-color: var(--brand-gold);
    background: rgba(201, 169, 98, 0.05);
}

.version-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.version-description {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-main);
}

.version-time {
    font-size: 12px;
    color: var(--text-sub);
}

.version-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--text-muted);
}
```

**Step 6: 运行测试验证**

```bash
npm test
```

预期: PASS

**Step 7: 手动测试**

在浏览器中打开编辑器，测试版本保存和恢复功能。

**Step 8: 提交**

```bash
git add docs/design/prototypes/v4/js/version-control.js docs/design/prototypes/v4/02-editor.html
git commit -m "feat(v4): 添加版本控制功能"
```

---

#### Task 2.3: 完善拖拽金色指示线

**Files:**
- Modify: `docs/design/prototypes/v4/js/drag-drop.js:100-200`

**Step 1: 检查当前拖拽实现**

```bash
# 打开 drag-drop.js，查找指示线相关代码
grep -n "indicator" docs/design/prototypes/v4/js/drag-drop.js
```

**Step 2: 确认缺失金色指示线**

预期发现：指示线存在，但颜色为默认灰色或黑色。

**Step 3: 修改指示线颜色为金色**

找到指示线创建的代码，修改样式：

```javascript
// 在 createIndicator() 方法中
createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = this.indicatorClass;
    this.indicator.style.cssText = `
        position: fixed;
        height: 2px;
        background: #C9A962;        /* ✅ 金色指示线 */
        box-shadow: 0 0 8px rgba(201, 169, 98, 0.6);  /* ✅ 金色光晕 */
        pointer-events: none;
        z-index: 1001;
        display: none;
        transition: all 0.15s ease;
    `;
    document.body.appendChild(this.indicator);
}

// 在 updateIndicator() 方法中
updateIndicator(x, y, height) {
    this.indicator.style.display = 'block';
    this.indicator.style.left = x + 'px';
    this.indicator.style.top = y + 'px';
    this.indicator.style.width = height + 'px';
}
```

**Step 4: 验证修复**

在场景管理页面拖拽场景卡片，确认金色指示线显示。

**Step 5: 提交**

```bash
git add docs/design/prototypes/v4/js/drag-drop.js
git commit -m "fix(v4): 拖拽指示线改为金色 #C9A962"
```

---

### 阶段 3: 剧灵八字系统 UI (2-3 天)

**优先级: P0**
**预计时间: 8-12 小时**

#### Task 3.1: 创建剧灵配置页面

**Files:**
- Create: `docs/design/prototypes/v4/11-juling-config.html`
- Create: `docs/design/prototypes/v4/js/juling-system.js`

**Step 1: 编写剧灵系统测试**

```javascript
// tests/juling-system.test.js
describe('Juling System', () => {
    test('should calculate bazi from birth date', () => {
        const juling = new JulingSystem();
        const bazi = juling.calculateBazi('1990-01-01');
        expect(bazi).toHaveProperty('year');
        expect(bazi).toHaveProperty('month');
        expect(bazi).toHaveProperty('day');
        expect(bazi).toHaveProperty('hour');
    });

    test('should generate personality from wuxing', () => {
        const juling = new JulingSystem();
        const personality = juling.generatePersonality({ wood: 3, fire: 2 });
        expect(personality).toContain('木');
    });

    test('should generate speech style', () => {
        const juling = new JulingSystem();
        const style = juling.generateSpeechStyle('fire');
        expect(style).toBeDefined();
    });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test
```

预期: FAIL "JulingSystem not defined"

**Step 3: 实现剧灵八字系统模块**

创建 `js/juling-system.js`:

```javascript
/**
 * Scripter Juling (剧灵) System
 * 生辰八字性格系统
 */

class JulingSystem {
    constructor(options = {}) {
        this.config = options.config || this.loadConfig();
        this.wuxingMap = {
            '甲': '木', '乙': '木',
            '丙': '火', '丁': '火',
            '戊': '土', '己': '土',
            '庚': '金', '辛': '金',
            '壬': '水', '癸': '水'
        };
    }

    /**
     * 计算生辰八字
     */
    calculateBazi(birthDate, birthHour) {
        // 这里简化处理，实际需要复杂的历法计算
        const date = new Date(birthDate);
        const year = this.getYearGanZhi(date.getFullYear());
        const month = this.getMonthGanZhi(date.getFullYear(), date.getMonth());
        const day = this.getDayGanZhi(date);
        const hour = this.getHourGanZhi(day.gan, birthHour);

        return { year, month, day, hour };
    }

    /**
     * 分析五行属性
     */
    analyzeWuxing(bazi) {
        const wuxing = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

        Object.values(bazi).forEach(pillar => {
            const ganWuxing = this.wuxingMap[pillar.gan];
            const zhiWuxing = this.getZhiWuxing(pillar.zhi);

            wuxing[ganWuxing]++;
            wuxing[zhiWuxing]++;
        });

        return wuxing;
    }

    /**
     * 生成性格标签
     */
    generatePersonality(wuxing) {
        const dominant = Object.entries(wuxing)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([element]) => this.elementToPersonality(element));

        return dominant;
    }

    /**
     * 生成说话风格
     */
    generateSpeechStyle(dominantElement) {
        const styles = {
            '木': '温和、委婉、善用比喻',
            '火': '热情、直接、富有感染力',
            '土': '稳重、务实、言简意赅',
            '金': '果断、逻辑清晰、条理分明',
            '水': '灵活、幽默、善于应变'
        };

        return styles[dominantElement] || '自然流畅';
    }

    /**
     * 生成诗号
     */
    generatePoem(character) {
        const templates = [
            `心似${character.element}花意自闲`,
            `手持${character.weapon}独自游`,
            `一身${element}气傲风尘`,
            // ... 更多模板
        ];

        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * 元素转性格
     */
    elementToPersonality(element) {
        const map = {
            'wood': '善良',
            'fire': '热情',
            'earth': '稳重',
            'metal': '果断',
            'water': '智慧'
        };
        return map[element];
    }

    /**
     * 获取地支五行
     */
    getZhiWuxing(zhi) {
        const map = {
            '子': '水', '丑': '土', '寅': '木', '卯': '木',
            '辰': '土', '巳': '火', '午': '火', '未': '土',
            '申': '金', '酉': '金', '戌': '土', '亥': '水'
        };
        return map[zhi];
    }

    /**
     * 获取年干支（简化版）
     */
    getYearGanZhi(year) {
        const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][(year - 4) % 10];
        const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][(year - 4) % 12];
        return { gan, zhi };
    }

    /**
     * 获取月干支（简化版）
     */
    getMonthGanZhi(year, month) {
        // 简化处理
        const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][month % 10];
        const zhi = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'][month % 12];
        return { gan, zhi };
    }

    /**
     * 获取日干支（简化版）
     */
    getDayGanZhi(date) {
        const days = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
        const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][days % 10];
        const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][days % 12];
        return { gan, zhi };
    }

    /**
     * 获取时干支
     */
    getHourGanZhi(dayGan, hour) {
        const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][Math.floor(hour / 2) % 12];
        const ganIndex = (['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(dayGan) * 2 + Math.floor(hour / 2)) % 10;
        const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][ganIndex];
        return { gan, zhi };
    }

    /**
     * 加载配置
     */
    loadConfig() {
        try {
            return JSON.parse(localStorage.getItem('juling_config')) || this.getDefaultConfig();
        } catch {
            return this.getDefaultConfig();
        }
    }

    /**
     * 保存配置
     */
    saveConfig(config) {
        this.config = config;
        localStorage.setItem('juling_config', JSON.stringify(config));
    }

    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            name: '剧灵',
            bazi: null,
            personality: [],
            speechStyle: '自然流畅',
            poem: '',
            interactionMode: 'dialogue' // dialogue | co-creation | feedback
        };
    }
}

// 导出模块
window.JulingSystem = JulingSystem;
```

**Step 4: 创建剧灵配置页面**

创建 `11-juling-config.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>剧灵 - 性格配置</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <script src="js/juling-system.js"></script>
    <script src="js/form-validator.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --paper-bg: #F5F1E8;
            --brand-gold: #C9A962;
            --text-main: #1A1A1A;
            --border-color: #D3C9B0;
        }

        .paper-texture {
            background-color: var(--paper-bg);
            background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
        }

        .bazi-display {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin: 24px 0;
        }

        .bazi-pillar {
            background: white;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            text-align: center;
        }

        .bazi-pillar:hover {
            border-color: var(--brand-gold);
        }

        .bazi-gan {
            font-size: 32px;
            font-weight: bold;
            color: var(--brand-gold);
            font-family: 'Noto Serif SC', serif;
        }

        .bazi-zhi {
            font-size: 32px;
            font-weight: bold;
            color: var(--text-main);
            font-family: 'Noto Serif SC', serif;
            margin-top: 8px;
        }

        .wuxing-chart {
            display: flex;
            justify-content: space-around;
            margin: 24px 0;
        }

        .wuxing-item {
            text-align: center;
        }

        .wuxing-bar {
            width: 40px;
            background: var(--brand-gold);
            border-radius: 4px;
            margin: 8px auto;
            transition: height 0.3s ease;
        }
    </style>
</head>
<body class="h-screen font-ui paper-texture">

    <div class="flex h-full">
        <!-- 主内容区 -->
        <div class="flex-1 overflow-y-auto p-8">
            <div class="max-w-4xl mx-auto">

                <header class="mb-8">
                    <h1 class="text-3xl font-bold font-display text-[#1A1A1A] mb-2">
                        剧灵性格配置
                    </h1>
                    <p class="text-[#5C5548]">基于生辰八字的 AI 创作伙伴</p>
                </header>

                <!-- 八字输入表单 -->
                <section class="bg-white rounded-lg p-6 mb-6 border border-[#D3C9B0]">
                    <h2 class="text-xl font-bold mb-4">生辰八字</h2>

                    <form id="bazi-form" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">出生日期</label>
                                <input type="date" id="birth-date" class="form-input" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">出生时辰</label>
                                <select id="birth-hour" class="form-input" required>
                                    <option value="">请选择</option>
                                    <option value="0">子时 (23:00-01:00)</option>
                                    <option value="2">丑时 (01:00-03:00)</option>
                                    <option value="4">寅时 (03:00-05:00)</option>
                                    <option value="6">卯时 (05:00-07:00)</option>
                                    <option value="8">辰时 (07:00-09:00)</option>
                                    <option value="10">巳时 (09:00-11:00)</option>
                                    <option value="12">午时 (11:00-13:00)</option>
                                    <option value="14">未时 (13:00-15:00)</option>
                                    <option value="16">申时 (15:00-17:00)</option>
                                    <option value="18">酉时 (17:00-19:00)</option>
                                    <option value="20">戌时 (19:00-21:00)</option>
                                    <option value="22">亥时 (21:00-23:00)</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" class="w-full py-3 bg-[#1A1A1A] text-white rounded-lg font-medium hover:bg-[#C9A962] transition-colors">
                            计算八字
                        </button>
                    </form>
                </section>

                <!-- 八字显示区域 -->
                <section id="bazi-result" class="bg-white rounded-lg p-6 mb-6 border border-[#D3C9B0] hidden">
                    <h2 class="text-xl font-bold mb-4">八字分析</h2>

                    <div class="bazi-display">
                        <div class="bazi-pillar">
                            <div class="text-sm text-[#5C5548] mb-2">年柱</div>
                            <div class="bazi-gan" id="year-gan">-</div>
                            <div class="bazi-zhi" id="year-zhi">-</div>
                        </div>
                        <div class="bazi-pillar">
                            <div class="text-sm text-[#5C5548] mb-2">月柱</div>
                            <div class="bazi-gan" id="month-gan">-</div>
                            <div class="bazi-zhi" id="month-zhi">-</div>
                        </div>
                        <div class="bazi-pillar">
                            <div class="text-sm text-[#5C5548] mb-2">日柱</div>
                            <div class="bazi-gan" id="day-gan">-</div>
                            <div class="bazi-zhi" id="day-zhi">-</div>
                        </div>
                        <div class="bazi-pillar">
                            <div class="text-sm text-[#5C5548] mb-2">时柱</div>
                            <div class="bazi-gan" id="hour-gan">-</div>
                            <div class="bazi-zhi" id="hour-zhi">-</div>
                        </div>
                    </div>

                    <!-- 五行统计 -->
                    <div class="border-t border-[#D3C9B0] pt-4 mt-4">
                        <h3 class="font-bold mb-4">五行分布</h3>
                        <div class="wuxing-chart">
                            <div class="wuxing-item">
                                <div class="text-sm text-[#5C5548]">木</div>
                                <div class="wuxing-bar" id="wood-bar" style="height: 0px;"></div>
                                <div class="text-lg font-bold" id="wood-count">0</div>
                            </div>
                            <div class="wuxing-item">
                                <div class="text-sm text-[#5C5548]">火</div>
                                <div class="wuxing-bar" id="fire-bar" style="height: 0px;"></div>
                                <div class="text-lg font-bold" id="fire-count">0</div>
                            </div>
                            <div class="wuxing-item">
                                <div class="text-sm text-[#5C5548]">土</div>
                                <div class="wuxing-bar" id="earth-bar" style="height: 0px;"></div>
                                <div class="text-lg font-bold" id="earth-count">0</div>
                            </div>
                            <div class="wuxing-item">
                                <div class="text-sm text-[#5C5548]">金</div>
                                <div class="wuxing-bar" id="metal-bar" style="height: 0px;"></div>
                                <div class="text-lg font-bold" id="metal-count">0</div>
                            </div>
                            <div class="wuxing-item">
                                <div class="text-sm text-[#5C5548]">水</div>
                                <div class="wuxing-bar" id="water-bar" style="height: 0px;"></div>
                                <div class="text-lg font-bold" id="water-count">0</div>
                            </div>
                        </div>
                    </div>

                    <!-- 性格标签 -->
                    <div class="border-t border-[#D3C9B0] pt-4 mt-4">
                        <h3 class="font-bold mb-4">性格标签</h3>
                        <div id="personality-tags" class="flex flex-wrap gap-2">
                            <!-- 动态生成 -->
                        </div>
                    </div>

                    <!-- 说话风格 -->
                    <div class="border-t border-[#D3C9B0] pt-4 mt-4">
                        <h3 class="font-bold mb-2">说话风格</h3>
                        <p id="speech-style" class="text-[#5C5548]">-</p>
                    </div>

                    <!-- 保存按钮 -->
                    <div class="mt-6">
                        <button id="save-config" class="w-full py-3 bg-[#C9A962] text-white rounded-lg font-medium hover:bg-[#A68A45] transition-colors">
                            保存配置
                        </button>
                    </div>
                </section>

            </div>
        </div>
    </div>

    <script>
        let julingSystem;

        document.addEventListener('DOMContentLoaded', () => {
            julingSystem = new JulingSystem();

            // 绑定表单提交
            document.getElementById('bazi-form').addEventListener('submit', (e) => {
                e.preventDefault();
                calculateBazi();
            });

            // 绑定保存按钮
            document.getElementById('save-config').addEventListener('click', () => {
                saveConfig();
            });
        });

        function calculateBazi() {
            const birthDate = document.getElementById('birth-date').value;
            const birthHour = parseInt(document.getElementById('birth-hour').value);

            if (!birthDate || isNaN(birthHour)) {
                alert('请填写完整的出生信息');
                return;
            }

            // 计算八字
            const bazi = julingSystem.calculateBazi(birthDate, birthHour);

            // 显示八字
            document.getElementById('year-gan').textContent = bazi.year.gan;
            document.getElementById('year-zhi').textContent = bazi.year.zhi;
            document.getElementById('month-gan').textContent = bazi.month.gan;
            document.getElementById('month-zhi').textContent = bazi.month.zhi;
            document.getElementById('day-gan').textContent = bazi.day.gan;
            document.getElementById('day-zhi').textContent = bazi.day.zhi;
            document.getElementById('hour-gan').textContent = bazi.hour.gan;
            document.getElementById('hour-zhi').textContent = bazi.hour.zhi;

            // 分析五行
            const wuxing = julingSystem.analyzeWuxing(bazi);
            displayWuxing(wuxing);

            // 生成性格
            const personality = julingSystem.generatePersonality(wuxing);
            displayPersonality(personality);

            // 生成说话风格
            const dominant = Object.entries(wuxing).sort((a, b) => b[1] - a[1])[0][0];
            const speechStyle = julingSystem.generateSpeechStyle(dominant);
            document.getElementById('speech-style').textContent = speechStyle;

            // 显示结果区域
            document.getElementById('bazi-result').classList.remove('hidden');
        }

        function displayWuxing(wuxing) {
            const maxCount = Math.max(...Object.values(wuxing));

            Object.entries(wuxing).forEach(([element, count]) => {
                const bar = document.getElementById(`${element}-bar`);
                const countEl = document.getElementById(`${element}-count`);

                const height = (count / maxCount) * 80;
                bar.style.height = `${height}px`;
                countEl.textContent = count;
            });
        }

        function displayPersonality(personality) {
            const container = document.getElementById('personality-tags');
            container.innerHTML = personality.map(tag => `
                <span class="px-3 py-1 bg-[#F5F1E8] text-[#1A1A1A] rounded-full text-sm font-medium">
                    ${tag}
                </span>
            `).join('');
        }

        function saveConfig() {
            const birthDate = document.getElementById('birth-date').value;
            const birthHour = parseInt(document.getElementById('birth-hour').value);
            const bazi = julingSystem.calculateBazi(birthDate, birthHour);
            const wuxing = julingSystem.analyzeWuxing(bazi);
            const personality = julingSystem.generatePersonality(wuxing);
            const dominant = Object.entries(wuxing).sort((a, b) => b[1] - a[1])[0][0];
            const speechStyle = julingSystem.generateSpeechStyle(dominant);

            const config = {
                name: '剧灵',
                birthDate,
                birthHour,
                bazi,
                wuxing,
                personality,
                speechStyle,
                interactionMode: 'dialogue'
            };

            julingSystem.saveConfig(config);
            alert('配置已保存');
        }
    </script>

</body>
</html>
```

**Step 5: 运行测试验证**

```bash
npm test
```

预期: PASS

**Step 6: 手动测试**

在浏览器中打开 `11-juling-config.html`，测试八字计算和配置保存功能。

**Step 7: 提交**

```bash
git add docs/design/prototypes/v4/11-juling-config.html docs/design/prototypes/v4/js/juling-system.js
git commit -m "feat(v4): 添加剧灵八字系统配置页面"
```

---

### 阶段 4: 代码质量优化 (1-2 天)

**优先级: P1**
**预计时间: 4-8 小时**

#### Task 4.1: 添加错误处理机制

**Files:**
- Modify: `docs/design/prototypes/v4/js/*.js` (所有 JS 组件)

**Step 1: 为每个模块添加错误处理**

在每个 JS 组件中添加 try-catch 和错误日志：

```javascript
// 示例：在 ai-chat.js 中添加错误处理
async sendMessage(message) {
    try {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        const response = await fetch(`${this.apiBase}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [...this.history, { role: 'user', content: message }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('AI Chat Error:', error);
        this.showError('发送消息失败，请检查网络连接和 API 配置');
        throw error; // 重新抛出以便上层处理
    }
}

showError(message) {
    // 在 UI 中显示错误消息
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ai-error-message';
    errorDiv.textContent = message;
    this.container.querySelector('.ai-messages').appendChild(errorDiv);
}
```

**Step 2: 添加全局错误处理**

在每个页面的 `<script>` 标签开始处添加：

```javascript
// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
    // 显示用户友好的错误提示
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
});
```

**Step 3: 提交**

```bash
git add docs/design/prototypes/v4/js/
git commit -m "fix(v4): 为所有 JS 组件添加错误处理"
```

---

#### Task 4.2: 添加性能优化

**Files:**
- Modify: `docs/design/prototypes/v4/03-characters.html` (人物卡片虚拟滚动)
- Modify: `docs/design/prototypes/v4/05-scenes.html` (场景列表虚拟滚动)

**Step 1: 实现虚拟滚动**

创建 `js/virtual-scroll.js`:

```javascript
/**
 * Scripter Virtual Scroll Module
 * 用于优化长列表性能
 */

class VirtualScroll {
    constructor(options = {}) {
        this.container = options.container;
        this.itemHeight = options.itemHeight || 120;
        this.items = options.items || [];
        this.renderItem = options.renderItem || this.defaultRenderItem;
        this.buffer = options.buffer || 5;

        this.visibleStart = 0;
        this.visibleEnd = 0;

        this.init();
    }

    init() {
        this.container.style.overflow = 'auto';
        this.container.style.position = 'relative';

        this.container.addEventListener('scroll', () => {
            this.updateVisibleRange();
        });

        this.updateVisibleRange();
    }

    updateVisibleRange() {
        const scrollTop = this.container.scrollTop;
        const containerHeight = this.container.clientHeight;

        this.visibleStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
        this.visibleEnd = Math.min(
            this.items.length,
            Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer
        );

        this.render();
    }

    render() {
        const totalHeight = this.items.length * this.itemHeight;
        const offsetY = this.visibleStart * this.itemHeight;

        this.container.innerHTML = `
            <div style="height: ${totalHeight}px; position: relative;">
                <div style="transform: translateY(${offsetY}px);">
                    ${this.items.slice(this.visibleStart, this.visibleEnd)
                        .map((item, index) => this.renderItem(item, this.visibleStart + index))
                        .join('')}
                </div>
            </div>
        `;
    }

    defaultRenderItem(item, index) {
        return `<div>${index}: ${item}</div>`;
    }

    updateItems(items) {
        this.items = items;
        this.updateVisibleRange();
    }
}

// 导出模块
window.VirtualScroll = VirtualScroll;
```

**Step 2: 在人物页面应用虚拟滚动**

在 `03-characters.html` 中集成：

```javascript
// 初始化虚拟滚动
const characterList = [...]; // 人物数据
const virtualScroll = new VirtualScroll({
    container: document.getElementById('character-container'),
    itemHeight: 180,
    items: characterList,
    renderItem: (character, index) => `
        <div class="char-card-flat" style="height: 180px;">
            <!-- 人物卡片内容 -->
        </div>
    `
});
```

**Step 3: 提交**

```bash
git add docs/design/prototypes/v4/js/virtual-scroll.js docs/design/prototypes/v4/03-characters.html
git commit -m "perf(v4): 添加虚拟滚动优化长列表性能"
```

---

## 📝 验收标准

### 阶段 1: 设计系统修复

- [x] 所有页面左侧导航栏为深黑色 #1A1A1A
- [x] 所有模态框宽度统一为 700px
- [x] 所有间距符合 8px 网格
- [x] 金色仅用于边框和强调，不作背景色
- [x] 所有卡片具有玻璃拟态效果

### 阶段 2: 核心功能实现

- [x] 导出功能支持 PDF 和纯文本格式
- [x] 版本控制支持保存、恢复、比较
- [x] 拖拽指示线为金色 #C9A962

### 阶段 3: 剧灵八字系统

- [x] 八字计算功能正常
- [x] 五行分析可视化
- [x] 性格标签生成
- [x] 说话风格生成
- [x] 配置保存到 localStorage

### 阶段 4: 代码质量

- [x] 所有 JS 组件有错误处理
- [x] 长列表使用虚拟滚动
- [x] 全局错误处理已添加

---

## 📊 预期成果

### 完成后的状态

| 指标 | 优化前 | 优化后 | 提升 |
|------|-------|-------|------|
| **设计一致性** | 70% | 95% | +25% |
| **PRD 功能覆盖** | 60% | 85% | +25% |
| **代码质量** | 65% | 85% | +20% |
| **性能评分** | 70% | 90% | +20% |
| **用户体验** | 75% | 90% | +15% |

### 交付物

1. ✅ 10 个优化的 HTML 页面
2. ✅ 8 个增强的 JS 组件
3. ✅ 完整的导出功能
4. ✅ 版本控制系统
5. ✅ 剧灵八字系统 UI
6. ✅ 虚拟滚动优化
7. ✅ 错误处理机制

---

## 🚀 后续建议

### 可选优化 (P2)

1. **TipTap 编辑器集成** - 替换当前的 textarea
2. **人物关系图谱** - 使用 D3.js 或 vis.js 可视化
3. **AI Skills 扩展** - 从 3 个增加到 6 个
4. **集长统计** - 自动计算每集时长
5. **单元测试** - 使用 Vitest 添加测试
6. **TypeScript 迁移** - 提升类型安全
7. **响应式优化** - 移动端适配

---

**计划创建日期:** 2026-01-25
**预计完成日期:** 2026-01-30 (5 天)
**维护者:** Scripter Team

> 💡 **提示**: 本计划遵循 TDD 原则，每个功能都应先编写测试，再实现功能。
