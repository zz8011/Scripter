/**
 * Scripter Format Checker
 * 剧本格式检查器 - 符合《中文短剧剧本格式规范 v2.0》
 */

class ScripterFormatChecker {
    constructor(options = {}) {
        this.editor = options.editor || document.querySelector('[data-script-editor]');
        this.output = options.output || document.querySelector('[data-format-output]');
        this.realtime = options.realtime !== false;
        this.autoFix = options.autoFix || false;
        this.showLineNumbers = options.showLineNumbers !== false;
        this.onError = options.onError || null;
        this.onWarning = options.onWarning || null;
        this.onValid = options.onValid || null;

        // 规范定义
        this.rules = {
            sceneHeader: {
                pattern: /^\d+\.\s+【(.+?)】\s+(.+?)\s*$/,
                description: '场景标题格式：序号. 【地点】 时间',
                example: '1. 【王府·书房】 日',
                severity: 'error'
            },
            characterName: {
                pattern: /^【(.+?)】$/,
                description: '角色名格式：【角色名】',
                example: '【王语嫣】',
                severity: 'error'
            },
            dialogue: {
                pattern: /^(.+)$/,
                description: '对话：角色名后的台词',
                context: 'afterCharacter',
                severity: 'warning'
            },
            action: {
                pattern: /^\((.+)\)$/,
                description: '动作/情绪描述：(动作描述)',
                example: '(微笑着)',
                severity: 'info'
            },
            os: {
                pattern: /^OS[:：](.+)$/,
                description: '内心独白：OS: 内容 或 OS：内容',
                example: 'OS: 这个秘密，我该如何告诉他？',
                severity: 'info'
            },
            transition: {
                pattern: /^(→|切入|切至|淡入|淡出|黑屏|闪回)$/,
                description: '转场标记：→、切入、切至、淡入、淡出、黑屏、闪回',
                severity: 'info'
            },
            timeSkip: {
                pattern: /^时间跳跃[:：](.+)$/,
                description: '时间跳跃：时间跳跃: 描述',
                example: '时间跳跃: 三日后',
                severity: 'info'
            },
            emptyLine: {
                pattern: /^\s*$/,
                description: '空行：场景分隔',
                severity: 'info'
            }
        };

        this.issues = [];
        this.init();
    }

    init() {
        if (!this.editor) {
            console.error('Script editor not found');
            return;
        }

        this.bindEvents();
        this.addStyles();
        this.addOutputPanel();
    }

    bindEvents() {
        if (this.realtime) {
            this.editor.addEventListener('input', () => {
                this.debounceCheck();
            });
        }
    }

    debounceCheck() {
        clearTimeout(this.checkTimer);
        this.checkTimer = setTimeout(() => {
            this.check();
        }, 500);
    }

    addOutputPanel() {
        // 如果没有指定的输出容器，创建一个浮动面板
        if (!this.output || !document.body.contains(this.output)) {
            const panel = document.createElement('div');
            panel.id = 'format-checker-panel';
            panel.className = 'format-checker-panel';
            panel.innerHTML = `
                <div class="format-checker-header">
                    <div class="flex items-center gap-2">
                        <iconify-icon icon="lucide:file-check" class="text-[#C9A962]"></iconify-icon>
                        <span class="font-semibold text-sm">格式检查</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span id="format-issue-count" class="text-xs text-[#8B7355]">0 问题</span>
                        <button onclick="document.getElementById('format-checker-panel').classList.toggle('collapsed')"
                            class="text-[#8B7355] hover:text-[#C9A962]">
                            <iconify-icon icon="lucide:chevron-down"></iconify-icon>
                        </button>
                    </div>
                </div>
                <div id="format-checker-content" class="format-checker-content">
                    <div class="format-checker-empty text-center py-8 text-[#8B7355] text-sm">
                        <iconify-icon icon="lucide:check-circle" class="text-4xl text-[#7FA870] mb-2"></iconify-icon>
                        <p>格式检查完成</p>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);
            this.output = document.getElementById('format-checker-content');
        }
    }

    check() {
        const content = this.editor.value || this.editor.textContent;
        const lines = content.split('\n');

        this.issues = [];
        let currentScene = null;
        let currentCharacter = null;
        let lineAfterCharacter = false;

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const trimmedLine = line.trim();

            // 跳过空行
            if (!trimmedLine) {
                this.issues.push({
                    line: lineNumber,
                    type: 'emptyLine',
                    severity: 'info',
                    message: '场景分隔空行'
                });
                currentCharacter = null;
                lineAfterCharacter = false;
                return;
            }

            // 检查场景标题
            const sceneMatch = trimmedLine.match(this.rules.sceneHeader.pattern);
            if (sceneMatch) {
                currentScene = {
                    number: sceneMatch[1],
                    location: sceneMatch[2],
                    time: sceneMatch[3] || ''
                };
                currentCharacter = null;
                lineAfterCharacter = false;
                return;
            }

            // 检查角色名
            const charMatch = trimmedLine.match(this.rules.characterName.pattern);
            if (charMatch) {
                currentCharacter = charMatch[1];
                lineAfterCharacter = true;
                return;
            }

            // 检查转场标记
            if (this.rules.transition.pattern.test(trimmedLine)) {
                this.issues.push({
                    line: lineNumber,
                    type: 'transition',
                    severity: 'info',
                    message: `转场标记: ${trimmedLine}`
                });
                lineAfterCharacter = false;
                return;
            }

            // 检查时间跳跃
            const timeSkipMatch = trimmedLine.match(this.rules.timeSkip.pattern);
            if (timeSkipMatch) {
                this.issues.push({
                    line: lineNumber,
                    type: 'timeSkip',
                    severity: 'info',
                    message: `时间跳跃: ${timeSkipMatch[1]}`
                });
                lineAfterCharacter = false;
                return;
            }

            // 检查内心独白
            const osMatch = trimmedLine.match(this.rules.os.pattern);
            if (osMatch) {
                this.issues.push({
                    line: lineNumber,
                    type: 'os',
                    severity: 'info',
                    message: `内心独白: ${osMatch[1]}`
                });
                lineAfterCharacter = false;
                return;
            }

            // 检查动作描述
            const actionMatch = trimmedLine.match(this.rules.action.pattern);
            if (actionMatch) {
                this.issues.push({
                    line: lineNumber,
                    type: 'action',
                    severity: 'info',
                    message: `动作描述: ${actionMatch[1]}`
                });
                return;
            }

            // 检查对话（应该跟在角色名后面）
            if (lineAfterCharacter && currentCharacter) {
                this.issues.push({
                    line: lineNumber,
                    type: 'dialogue',
                    severity: 'info',
                    message: `【${currentCharacter}】的台词: ${trimmedLine}`
                });
                lineAfterCharacter = false;
                return;
            }

            // 未识别的行
            if (!currentScene) {
                this.issues.push({
                    line: lineNumber,
                    type: 'missing-scene-header',
                    severity: 'error',
                    message: '缺少场景标题，场景应以「序号. 【地点】 时间」开头'
                });
            } else {
                this.issues.push({
                    line: lineNumber,
                    type: 'unknown',
                    severity: 'warning',
                    message: `未识别的内容: ${trimmedLine.substring(0, 30)}${trimmedLine.length > 30 ? '...' : ''}`
                });
            }
        });

        this.renderResults();
        this.notify();

        return {
            valid: this.issues.filter(i => i.severity === 'error').length === 0,
            issues: this.issues
        };
    }

    renderResults() {
        if (!this.output) return;

        const errorCount = this.issues.filter(i => i.severity === 'error').length;
        const warningCount = this.issues.filter(i => i.severity === 'warning').length;
        const infoCount = this.issues.filter(i => i.severity === 'info').length;

        const countEl = document.getElementById('format-issue-count');
        if (countEl) {
            if (errorCount > 0) {
                countEl.innerHTML = `<span class="text-[#C96262] font-bold">${errorCount} 错误</span>`;
            } else if (warningCount > 0) {
                countEl.innerHTML = `<span class="text-[#D9A046] font-bold">${warningCount} 警告</span>`;
            } else {
                countEl.innerHTML = `<span class="text-[#7FA870]">格式正确</span>`;
            }
        }

        if (this.issues.length === 0) {
            this.output.innerHTML = `
                <div class="format-checker-empty text-center py-8 text-[#8B7355] text-sm">
                    <iconify-icon icon="lucide:check-circle" class="text-4xl text-[#7FA870] mb-2"></iconify-icon>
                    <p>格式检查完成，未发现问题</p>
                </div>
            `;
            return;
        }

        let html = '<div class="format-checker-issues space-y-1 max-h-64 overflow-y-auto">';
        this.issues.forEach(issue => {
            const severityIcon = {
                error: '<iconify-icon icon="lucide:x-circle" class="text-[#C96262]"></iconify-icon>',
                warning: '<iconify-icon icon="lucide:alert-triangle" class="text-[#D9A046]"></iconify-icon>',
                info: '<iconify-icon icon="lucide:info" class="text-[#7FA870]"></iconify-icon>'
            }[issue.severity];

            html += `
                <div class="format-issue flex items-start gap-2 p-2 rounded hover:bg-[#FAF7F0] cursor-pointer"
                    data-line="${issue.line}">
                    <span class="mt-0.5">${severityIcon}</span>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-[#8B7355]">第 ${issue.line} 行</span>
                        </div>
                        <p class="text-xs text-[#5C5548]">${issue.message}</p>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        // 添加修复建议
        if (errorCount > 0 || warningCount > 0) {
            html += `
                <div class="format-checker-actions p-3 border-t border-[#D3C9B0] flex gap-2">
                    <button onclick="window.formatChecker.autoFixIssues()" class="flex-1 px-3 py-1.5 text-xs font-semibold bg-[#C9A962] text-white rounded hover:bg-[#A68A45]">
                        <iconify-icon icon="lucide:wand-2" class="mr-1"></iconify-icon>
                        自动修复
                    </button>
                    <button onclick="window.formatChecker.exportReport()" class="flex-1 px-3 py-1.5 text-xs font-semibold border border-[#D3C9B0] rounded hover:border-[#C9A962]">
                        <iconify-icon icon="lucide:download" class="mr-1"></iconify-icon>
                        导出报告
                    </button>
                </div>
            `;
        }

        this.output.innerHTML = html;

        // 添加点击跳转功能
        this.output.querySelectorAll('.format-issue').forEach(el => {
            el.addEventListener('click', () => {
                const lineNum = parseInt(el.dataset.line);
                this.jumpToLine(lineNum);
            });
        });
    }

    jumpToLine(lineNumber) {
        if (!this.editor) return;

        // 对于 textarea
        if (this.editor.tagName === 'TEXTAREA') {
            const lines = this.editor.value.split('\n');
            let position = 0;
            for (let i = 0; i < lineNumber - 1; i++) {
                position += lines[i].length + 1;
            }
            this.editor.focus();
            this.editor.setSelectionRange(position, position);
        }
    }

    autoFixIssues() {
        // 简单的自动修复示例
        let content = this.editor.value || this.editor.textContent;
        let fixCount = 0;

        // 修复常见的格式问题
        const fixes = [
            // 修复场景标题格式
            [/^(\d+)\.([^{]+?)\[([^\]]+)\](.*)$/gm, (match, num, space, loc, time) => {
                fixCount++;
                return `${num}. 【${loc}】${time}`;
            }],
            // 修复角色名格式
            [/^([^{]+?)\[([^\]]+)\]$/gm, (match, space, name) => {
                fixCount++;
                return `【${name}】`;
            }]
        ];

        fixes.forEach(([pattern, replacer]) => {
            content = content.replace(pattern, replacer);
        });

        this.editor.value = content;
        this.check();

        this.showNotification(`已修复 ${fixCount} 处格式问题`, 'success');
    }

    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalIssues: this.issues.length,
            errors: this.issues.filter(i => i.severity === 'error').length,
            warnings: this.issues.filter(i => i.severity === 'warning').length,
            info: this.issues.filter(i => i.severity === 'info').length,
            issues: this.issues
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `format-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('格式检查报告已导出', 'success');
    }

    notify() {
        const errors = this.issues.filter(i => i.severity === 'error');
        const warnings = this.issues.filter(i => i.severity === 'warning');

        if (errors.length > 0 && this.onError) {
            this.onError(errors);
        } else if (warnings.length > 0 && this.onWarning) {
            this.onWarning(warnings);
        } else if (this.issues.length > 0 && this.onValid) {
            this.onValid(this.issues);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in`;

        if (type === 'success') {
            notification.classList.add('bg-[#7FA870]', 'text-white');
            notification.innerHTML = `
                <iconify-icon icon="lucide:check-circle" class="text-base"></iconify-icon>
                <span class="text-sm font-medium">${message}</span>
            `;
        } else if (type === 'error') {
            notification.classList.add('bg-[#C96262]', 'text-white');
            notification.innerHTML = `
                <iconify-icon icon="lucide:x-circle" class="text-base"></iconify-icon>
                <span class="text-sm font-medium">${message}</span>
            `;
        } else {
            notification.classList.add('bg-[#1A1A1A]', 'text-white');
            notification.innerHTML = `
                <iconify-icon icon="lucide:info" class="text-base"></iconify-icon>
                <span class="text-sm font-medium">${message}</span>
            `;
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slide-out 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    addStyles() {
        const styleId = 'format-checker-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .format-checker-panel {
                position: fixed;
                bottom: 20px;
                right: 340px;
                width: 320px;
                background: white;
                border: 1px solid #D3C9B0;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                z-index: 999;
                overflow: hidden;
            }

            .format-checker-panel.collapsed .format-checker-content {
                display: none;
            }

            .format-checker-header {
                padding: 12px 16px;
                background: #FAF7F0;
                border-bottom: 1px solid #D3C9B0;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .format-checker-content {
                max-height: 400px;
                overflow-y: auto;
            }

            .format-checker-content::-webkit-scrollbar {
                width: 4px;
            }

            .format-checker-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .format-checker-content::-webkit-scrollbar-thumb {
                background: #D3C9B0;
                border-radius: 4px;
            }

            .format-issue {
                transition: background 0.2s ease;
            }

            @keyframes slide-in {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slide-out {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            .animate-slide-in {
                animation: slide-in 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    destroy() {
        if (this.editor) {
            this.editor.removeEventListener('input', this.debounceCheck);
        }
        const panel = document.getElementById('format-checker-panel');
        if (panel) panel.remove();
        const style = document.getElementById('format-checker-styles');
        if (style) style.remove();
    }
}

// Export for global use
window.ScripterFormatChecker = ScripterFormatChecker;
