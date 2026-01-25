# v5 原型修复实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复 v5 原型系统中发现的 6 个中等问题，确保符合模块化架构和设计系统规范。

**Architecture:** 移除 Tailwind CDN 依赖，统一使用共享 CSS 文件，修复变量重复定义，为 JavaScript 模块添加 ES6 导出。

**Tech Stack:** HTML5, CSS3 (CSS Variables), ES6 Modules

---

## Task 1: 移除 index.html 中的 Tailwind CDN

**Files:**
- Modify: `docs/design/prototypes/v5/index.html:11`

**Step 1: 验证当前状态**

打开 `docs/design/prototypes/v5/index.html`，确认第 11 行包含：
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**Step 2: 移除 Tailwind CDN**

删除第 11 行的 Tailwind CDN 引用。

**Step 3: 添加 layouts.css 引用**

在第 20 行（components.css 引用之后）添加：
```html
<link rel="stylesheet" href="./assets/css/layouts.css">
```

**Step 4: 将 Tailwind 类名替换为自定义 CSS**

检查 HTML 中使用的 Tailwind 类名（如 `flex`, `items-center`, `justify-between` 等），在 `<style>` 标签中添加对应的自定义 CSS。

**Step 5: 验证修复**

在浏览器中打开 `http://localhost:8000`，确认：
- 页面样式正常显示
- 没有控制台错误
- 粒子动画正常工作
- 金色脉冲效果正常

**Step 6: Commit**

```bash
git add docs/design/prototypes/v5/index.html
git commit -m "fix: remove Tailwind CDN and use shared CSS for index.html"
```

---

## Task 2: 修复 dashboard.html 的变量重复定义

**Files:**
- Modify: `docs/design/prototypes/v5/pages/app/01-dashboard.html`

**Step 1: 验证当前状态**

打开文件，确认第 22-32 行存在重复的 `:root` 定义：
```css
:root {
  --paper-bg: #F5F1E8;
  --white-bg: #FFFFFF;
  --brand-gold: #C9A962;
  --brand-gold-dark: #A68A45;
  /* ... */
}
```

**Step 2: 移除重复的 :root 定义**

删除第 22-32 行的整个 `:root` 块。

**Step 3: 将缺失的变量添加到 variables.css**

编辑 `docs/design/prototypes/v5/assets/css/variables.css`，在品牌色彩部分添加：
```css
--brand-gold-dark: #A68A45;
```

**Step 4: 搜索并替换硬编码颜色**

在 `01-dashboard.html` 的 `<style>` 标签中，搜索硬编码的颜色值（如 `#FFFFFF`），替换为对应的 CSS 变量（`var(--card-bg)`）。

**Step 5: 验证修复**

打开 `http://localhost:8000/pages/app/01-dashboard.html`，确认：
- Dashboard 样式正常
- 卡片颜色正确
- 悬停效果正常

**Step 6: Commit**

```bash
git add docs/design/prototypes/v5/pages/app/01-dashboard.html docs/design/prototypes/v5/assets/css/variables.css
git commit -m "fix: remove duplicate CSS variables in dashboard.html"
```

---

## Task 3: 移除 dashboard.html 中的 Tailwind CDN

**Files:**
- Modify: `docs/design/prototypes/v5/pages/app/01-dashboard.html`

**Step 1: 移除 Tailwind CDN**

删除第 9 行：
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**Step 2: 替换 Tailwind 类名为自定义 CSS**

检查 `<style>` 标签外的所有元素，将 Tailwind 类名（如 `class="flex items-center"`）替换为对应的自定义类名或内联样式。

**Step 3: 验证修复**

打开 Dashboard 页面，确认：
- 布局正常
- 侧边栏切换正常
- AI 面板显示正常
- 卡片样式正常

**Step 4: Commit**

```bash
git add docs/design/prototypes/v5/pages/app/01-dashboard.html
git commit -m "fix: remove Tailwind CDN from dashboard.html"
```

---

## Task 4: 为 state-manager.js 添加 ES6 导出

**Files:**
- Modify: `docs/design/prototypes/v5/assets/js/core/state-manager.js:218`

**Step 1: 验证当前状态**

确认文件末尾（第 218 行之后）没有 `export` 语句。

**Step 2: 添加导出语句**

在文件末尾添加：
```javascript
// 导出模块
export { stateManager, generateJuling };
```

**Step 3: 验证语法**

确保文件其他部分没有语法错误。

**Step 4: 测试导入**

在浏览器控制台中测试：
```javascript
import { stateManager } from './assets/js/core/state-manager.js';
console.log(stateManager.get('juling'));
```

**Step 5: Commit**

```bash
git add docs/design/prototypes/v5/assets/js/core/state-manager.js
git commit -m "feat: add ES6 exports to state-manager.js"
```

---

## Task 5: 模块化 modal.js 的类导出

**Files:**
- Modify: `docs/design/prototypes/v5/assets/js/modules/modal.js`

**Step 1: 添加导出语句**

在文件末尾（第 206 行之后）添加：
```javascript
export { Modal, Toast };
```

**Step 2: 更新使用该模块的文件**

检查所有引入 `modal.js` 的 HTML 文件，将：
```html
<script src="../../assets/js/modules/modal.js"></script>
```

改为：
```html
<script type="module">
  import { Modal, Toast } from '../../assets/js/modules/modal.js';
  // 全局访问（为了向后兼容）
  window.Modal = Modal;
  window.Toast = Toast;
</script>
```

**Step 3: 验证功能**

打开任意包含模态框的页面，测试：
- Modal.confirm() 正常工作
- Toast.success() 正常工作
- Toast.error() 正常工作

**Step 4: Commit**

```bash
git add docs/design/prototypes/v5/assets/js/modules/modal.js
git commit -m "feat: add ES6 exports to modal.js"
```

---

## Task 6: 模块化 drag-drop.js 的类导出

**Files:**
- Modify: `docs/design/prototypes/v5/assets/js/modules/drag-drop.js`

**Step 1: 添加导出语句**

在文件末尾（第 190 行之后）添加：
```javascript
export { DragDrop, initKanbanDragDrop };
```

**Step 2: 更新使用该模块的文件**

检查 `02-editor.html` 和其他使用拖拽功能的页面，确保正确导入。

**Step 3: 验证功能**

打开编辑器页面，测试：
- 段落拖拽功能正常
- 金色指示线显示正常
- 拖拽后位置正确

**Step 4: Commit**

```bash
git add docs/design/prototypes/v5/assets/js/modules/drag-drop.js
git commit -m "feat: add ES6 exports to drag-drop.js"
```

---

## Task 7: 模块化其他 JS 文件的导出

**Files:**
- Modify: `docs/design/prototypes/v5/assets/js/core/navigation.js`
- Modify: `docs/design/prototypes/v5/assets/js/core/sidebar.js`
- Modify: `docs/design/prototypes/v5/assets/js/modules/ai-chat.js`
- Modify: `docs/design/prototypes/v5/assets/js/modules/format-check.js`
- Modify: `docs/design/prototypes/v5/assets/js/utils/helpers.js`

**Step 1: 为每个文件添加导出**

`navigation.js`:
```javascript
export class Navigation { /* ... */ }
```

`sidebar.js`:
```javascript
export class Sidebar { /* ... */ }
```

`ai-chat.js`:
```javascript
export class AIChat { /* ... */ }
```

`format-check.js`:
```javascript
export class FormatChecker { /* ... */ }
```

`helpers.js`:
```javascript
export { formatDate, relativeTime, formatNumber, /* ... */ };
```

**Step 2: 验证每个模块**

确保每个模块导出后功能正常。

**Step 3: Commit**

```bash
git add docs/design/prototypes/v5/assets/js/
git commit -m "feat: add ES6 exports to all JS modules"
```

---

## Task 8: 添加 Favicon

**Files:**
- Modify: `docs/design/prototypes/v5/index.html`

**Step 1: 在 <head> 中添加 favicon link**

在 `<meta>` 标签后添加：
```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>">
```

**Step 2: 验证**

刷新浏览器，确认标签页显示 sparkle emoji 图标，不再有 404 错误。

**Step 3: 为其他页面添加相同的 favicon**

为 `pages/auth/04-juling-intro.html`、`pages/app/01-dashboard.html`、`pages/app/02-editor.html` 添加相同的 favicon link。

**Step 4: Commit**

```bash
git add docs/design/prototypes/v5/
git commit -m "feat: add favicon to all pages"
```

---

## Task 9: 添加全局错误处理

**Files:**
- Create: `docs/design/prototypes/v5/assets/js/core/error-handler.js`

**Step 1: 创建错误处理模块**

```javascript
/**
 * Scripter 剧灵 - 全局错误处理
 */

class ErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    // 捕获 JavaScript 错误
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.message, e.filename, e.lineno);
      this.showErrorToUser('页面出现错误，请刷新重试');
    });

    // 捕获 Promise rejection
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.showErrorToUser('操作失败，请重试');
    });
  }

  showErrorToUser(message) {
    // 如果 Toast 可用，使用 Toast 显示
    if (window.Toast) {
      Toast.error(message);
    } else {
      // 降级到 alert
      console.error(message);
    }
  }
}

// 自动初始化
new ErrorHandler();

export { ErrorHandler };
```

**Step 2: 在主要页面引入**

在 `index.html`、`01-dashboard.html`、`02-editor.html` 的 `<head>` 中添加：
```html
<script type="module" src="./assets/js/core/error-handler.js"></script>
```

**Step 3: 测试错误处理**

在浏览器控制台故意抛出错误：
```javascript
throw new Error('Test error');
```

确认错误被捕获并显示用户友好提示。

**Step 4: Commit**

```bash
git add docs/design/prototypes/v5/assets/js/core/error-handler.js
git commit -m "feat: add global error handler"
```

---

## Task 10: 最终验证和清理

**Step 1: 运行完整验证清单**

打开每个页面，确认：
- [ ] index.html - 样式正常，无控制台错误
- [ ] pages/auth/01-login.html - 样式正常
- [ ] pages/auth/04-juling-intro.html - 样式正常
- [ ] pages/app/01-dashboard.html - 样式正常，交互正常
- [ ] pages/app/02-editor.html - 样式正常，拖拽正常
- [ ] pages/states/loading-states.html - 样式正常
- [ ] pages/states/error-states.html - 样式正常
- [ ] pages/states/empty-states.html - 样式正常
- [ ] pages/states/feedback-states.html - 样式正常

**Step 2: 检查浏览器控制台**

确认没有：
- 404 错误（除了可能的 API 调用）
- CSS 变量未定义警告
- JavaScript 错误

**Step 3: 验证模块化**

确认：
- 所有 JS 模块都有 `export` 语句
- CSS 文件没有重复定义
- 没有使用 Tailwind CDN

**Step 4: 更新 README**

如果需要，更新 `docs/design/prototypes/v5/README.md`，记录修复的问题。

**Step 5: 最终 Commit**

```bash
git add docs/design/prototypes/v5/README.md
git commit -m "docs: update README after prototype fixes"
```

---

## 验收标准

所有修复完成后，应该满足：

1. ✅ 没有 Tailwind CDN 引用
2. ✅ 所有页面都引用了 4 个共享 CSS 文件
3. ✅ CSS 变量只在 `variables.css` 中定义
4. ✅ 所有 JS 模块都有 ES6 导出
5. ✅ 所有页面都有 favicon
6. ✅ 有全局错误处理
7. ✅ 浏览器控制台无错误
8. ✅ 所有交互功能正常

---

**Estimated Time**: 60-90 分钟
**Priority**: High
**Dependencies**: 无（任务可并行执行）
