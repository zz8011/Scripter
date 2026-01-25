/**
 * Scripter Export Module
 * 支持导出为 PDF、Word、纯文本格式
 * @version 1.0.0
 */

class ScripterExport {
    constructor(options = {}) {
        this.projectId = options.projectId || null;
        this.format = options.format || 'pdf'; // pdf | docx | txt
        this.onProgress = options.onProgress || null;
    }

    /**
     * 导出为纯文本
     * @param {Object} scriptData - 剧本数据
     * @returns {string} 纯文本格式
     */
    exportAsText(scriptData) {
        try {
            if (!scriptData) {
                throw new Error('剧本数据不能为空');
            }

            if (!scriptData.scenes || !Array.isArray(scriptData.scenes)) {
                throw new Error('剧本数据格式错误：缺少 scenes 数组');
            }

            let text = '';

            // 添加标题
            text += `${'='.repeat(40)}\n`;
            text += `  ${scriptData.title || '剧本标题'}\n`;
            text += `${'='.repeat(40)}\n\n`;

            // 添加场景
            scriptData.scenes.forEach(scene => {
                text += `第 ${scene.episode} 集 · 场景 ${scene.number}\n`;
                text += `【${scene.location}】 ${scene.time}\n\n`;

                if (scene.content && Array.isArray(scene.content)) {
                    scene.content.forEach(line => {
                        if (line.type === 'character') {
                            text += `【${line.content}】\n`;
                        } else if (line.type === 'dialogue') {
                            text += `${line.content}\n`;
                        } else if (line.type === 'action') {
                            text += `（${line.content}）\n`;
                        } else if (line.type === 'scene_header') {
                            text += `${line.content}\n`;
                        }
                    });
                }

                text += '\n---\n\n';
            });

            return text;
        } catch (error) {
            console.error('Export Text Error:', error);
            throw new Error(`导出纯文本失败：${error.message}`);
        }
    }

    /**
     * 导出为 PDF（使用浏览器打印 API）
     * @param {Object} scriptData - 剧本数据
     */
    async exportAsPDF(scriptData) {
        try {
            if (!scriptData) {
                throw new Error('剧本数据不能为空');
            }

            // 创建打印友好的 HTML
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('无法打开打印窗口。请检查浏览器的弹窗拦截设置。');
            }

            const printHTML = this.generatePrintHTML(scriptData);
            printWindow.document.write(printHTML);
            printWindow.document.close();

            // 触发打印对话框
            setTimeout(() => {
                try {
                    printWindow.print();
                } catch (printError) {
                    console.error('Print Error:', printError);
                    throw new Error('打印失败，请重试');
                }
            }, 500);

        } catch (error) {
            console.error('Export PDF Error:', error);
            alert(`导出 PDF 失败：${error.message}`);
            throw error;
        }
    }

    /**
     * 生成打印 HTML
     * @param {Object} scriptData - 剧本数据
     * @returns {string} HTML 字符串
     */
    generatePrintHTML(scriptData) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${scriptData.title || '剧本'}</title>
    <style>
        @page {
            size: A4;
            margin: 25.4mm;
        }
        body {
            font-family: 'Courier Prime', 'Courier New', monospace;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            background: #fff;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
        }
        .script-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 1em;
            padding-bottom: 0.5em;
            border-bottom: 2px solid #000;
        }
        .scene {
            margin-bottom: 2em;
        }
        .scene-header {
            font-weight: bold;
            margin-top: 1em;
            text-transform: uppercase;
        }
        .character {
            font-weight: bold;
            text-align: center;
            margin-top: 1em;
            text-transform: uppercase;
        }
        .parenthetical {
            text-align: center;
            font-style: italic;
            margin: 0.25em 0;
        }
        .dialogue {
            text-align: center;
            margin: 0.5em 0;
        }
        .action {
            margin: 0.5em 0;
        }
        .transition {
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            margin: 1em 0;
        }
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="script-title">${scriptData.title || '剧本标题'}</div>
    ${this.generateScenesHTML(scriptData.scenes)}
    <script>
        // 自动关闭打印窗口
        window.onafterprint = function() {
            setTimeout(function() {
                window.close();
            }, 1000);
        };
    </script>
</body>
</html>
        `;
    }

    /**
     * 生成场景 HTML
     * @param {Array} scenes - 场景数组
     * @returns {string} HTML 字符串
     */
    generateScenesHTML(scenes) {
        return scenes.map(scene => `
            <div class="scene">
                <div class="scene-header">第 ${scene.number} 场 · 【${scene.location}】 ${scene.time}</div>
                ${scene.content.map(line => {
                    if (line.type === 'character') {
                        return `<div class="character">【${line.content}】</div>`;
                    } else if (line.type === 'dialogue') {
                        return `<div class="dialogue">${line.content}</div>`;
                    } else if (line.type === 'action') {
                        return `<div class="action">（${line.content}）</div>`;
                    } else if (line.type === 'parenthetical') {
                        return `<div class="parenthetical">（${line.content}）</div>`;
                    } else if (line.type === 'transition') {
                        return `<div class="transition">${line.content}</div>`;
                    } else if (line.type === 'scene_header') {
                        return `<div class="scene-header">${line.content}</div>`;
                    }
                    return '';
                }).join('\n            ')}
            </div>
        `).join('\n');
    }

    /**
     * 计算场景时长（基于字数）
     * @param {Object} scene - 场景对象
     * @returns {number} 预计分钟数
     */
    calculateDuration(scene) {
        const totalChars = scene.content.reduce((sum, line) => {
            return sum + (line.content ? line.content.length : 0);
        }, 0);

        // 假设每分钟 180 字（中等语速）
        return Math.ceil(totalChars / 180);
    }

    /**
     * 计算总页数
     * @param {Object} scriptData - 剧本数据
     * @returns {number} 预计页数（按每页 250 字计算）
     */
    calculateTotalPages(scriptData) {
        const totalChars = scriptData.scenes.reduce((sum, scene) => {
            return sum + scene.content.reduce((s, line) => {
                return s + (line.content ? line.content.length : 0);
            }, 0);
        }, 0);

        return Math.ceil(totalChars / 250);
    }

    /**
     * 触发文件下载
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @param {string} mimeType - MIME 类型
     */
    downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 导出（根据格式调用对应方法）
     * @param {Object} scriptData - 剧本数据
     * @param {string} format - 导出格式
     */
    async export(scriptData, format = null) {
        const exportFormat = format || this.format;

        // 触发进度回调
        if (this.onProgress) {
            this.onProgress(10);
        }

        switch (exportFormat) {
            case 'pdf':
                await this.exportAsPDF(scriptData);
                break;
            case 'txt':
                const text = this.exportAsText(scriptData);
                this.downloadFile(text, `${scriptData.title || '剧本'}.txt`, 'text/plain');
                break;
            case 'word':
                // Word 导出需要额外的库支持，这里先提供提示
                alert('Word 导出功能需要集成 docx.js 库，将在后续版本中实现。');
                break;
            case 'finaldraft':
                // Final Draft 格式需要特定的 FDX 文件格式
                const fdxText = this.exportAsText(scriptData);
                this.downloadFile(fdxText, `${scriptData.title || '剧本'}.fdx`, 'text/plain');
                break;
            default:
                console.error('不支持的导出格式:', exportFormat);
        }

        // 触发进度回调
        if (this.onProgress) {
            this.onProgress(100);
        }
    }
}

// 导出到全局
window.ScripterExport = ScripterExport;
