/**
 * Scripter Version Control Module
 * 基于 localStorage 的轻量级版本控制
 * @version 1.0.0
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
     * @param {string} description - 版本描述
     * @returns {Object} 保存的版本对象
     */
    save(description = '') {
        try {
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
        } catch (error) {
            console.error('Version Control Save Error:', error);
            throw new Error(`保存版本失败：${error.message}`);
        }
    }

    /**
     * 恢复到指定版本
     * @param {string} versionId - 版本 ID
     * @returns {Object} 恢复的版本对象
     */
    restore(versionId) {
        try {
            const version = this.versions.find(v => v.id === versionId);
            if (!version) {
                throw new Error('版本不存在');
            }

            this.currentContent = version.content;
            this.saveCurrent();
            return version;
        } catch (error) {
            console.error('Version Control Restore Error:', error);
            throw new Error(`恢复版本失败：${error.message}`);
        }
    }

    /**
     * 获取版本历史
     * @returns {Array} 版本数组
     */
    getHistory() {
        return this.versions;
    }

    /**
     * 比较两个版本
     * @param {string} versionId1 - 版本 1 ID
     * @param {string} versionId2 - 版本 2 ID
     * @returns {Object} 比较结果
     */
    compare(versionId1, versionId2) {
        try {
            const v1 = this.versions.find(v => v.id === versionId1);
            const v2 = this.versions.find(v => v.id === versionId2);

            if (!v1 || !v2) {
                throw new Error('版本不存在');
            }

            return {
                added: this.diff(v1.content, v2.content, 'added'),
                removed: this.diff(v1.content, v2.content, 'removed'),
                modified: this.diff(v1.content, v2.content, 'modified')
            };
        } catch (error) {
            console.error('Version Control Compare Error:', error);
            throw new Error(`比较版本失败：${error.message}`);
        }
    }

    /**
     * 更新当前内容
     * @param {string} content - 新内容
     */
    updateContent(content) {
        this.currentContent = content;
        this.saveCurrent();
    }

    /**
     * 获取当前内容
     * @returns {string} 当前内容
     */
    getContent() {
        return this.currentContent;
    }

    /**
     * 加载版本历史
     * @returns {Array} 版本数组
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
     * @returns {string} 当前内容
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
     * @returns {string} 版本 ID
     */
    generateId() {
        return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 生成版本描述
     * @returns {string} 版本描述
     */
    generateDescription() {
        const now = new Date();
        return `自动保存 - ${now.toLocaleString('zh-CN')}`;
    }

    /**
     * 统计字数
     * @param {string} content - 内容
     * @returns {number} 字数
     */
    countWords(content) {
        return content.length;
    }

    /**
     * 统计场景数
     * @param {string} content - 内容
     * @returns {number} 场景数
     */
    countScenes(content) {
        const matches = content.match(/^\d+\.\s+【/gm);
        return matches ? matches.length : 0;
    }

    /**
     * 简单的 diff 算法
     * @param {string} content1 - 内容 1
     * @param {string} content2 - 内容 2
     * @param {string} type - 差异类型
     * @returns {Array} 差异数组
     */
    diff(content1, content2, type) {
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
                    oldContent: line1 || '',
                    newContent: line2 || ''
                });
            }
        }

        return result;
    }

    /**
     * 删除指定版本
     * @param {string} versionId - 版本 ID
     */
    deleteVersion(versionId) {
        const index = this.versions.findIndex(v => v.id === versionId);
        if (index !== -1) {
            this.versions.splice(index, 1);
            this.saveVersions();
        }
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

    /**
     * 格式化时间戳
     * @param {string} timestamp - ISO 时间戳
     * @returns {string} 格式化的时间
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // 小于 1 分钟
        if (diff < 60000) {
            return '刚刚';
        }

        // 小于 1 小时
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)} 分钟前`;
        }

        // 小于 1 天
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)} 小时前`;
        }

        // 小于 7 天
        if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)} 天前`;
        }

        // 其他情况显示完整日期
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// 导出到全局
window.VersionControl = VersionControl;
