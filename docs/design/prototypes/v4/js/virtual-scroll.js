/**
 * Scripter Virtual Scroll Module
 * 用于优化长列表性能 - 虚拟滚动技术
 * @version 1.0.0
 */

class VirtualScroll {
    constructor(options = {}) {
        this.container = options.container;
        this.itemHeight = options.itemHeight || 120;
        this.items = options.items || [];
        this.renderItem = options.renderItem || this.defaultRenderItem;
        this.buffer = options.buffer || 5;
        this.className = options.className || 'virtual-scroll-item';

        this.visibleStart = 0;
        this.visibleEnd = 0;

        if (!this.container) {
            console.error('Virtual scroll container not found');
            return;
        }

        this.init();
    }

    init() {
        try {
            this.container.style.overflow = 'auto';
            this.container.style.position = 'relative';

            this.container.addEventListener('scroll', () => {
                try {
                    this.updateVisibleRange();
                } catch (error) {
                    console.error('Virtual scroll update error:', error);
                }
            });

            this.updateVisibleRange();
        } catch (error) {
            console.error('Virtual scroll init error:', error);
            throw error;
        }
    }

    updateVisibleRange() {
        try {
            const scrollTop = this.container.scrollTop;
            const containerHeight = this.container.clientHeight;

            this.visibleStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
            this.visibleEnd = Math.min(
                this.items.length,
                Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer
            );

            this.render();
        } catch (error) {
            console.error('Update visible range error:', error);
        }
    }

    render() {
        try {
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
        } catch (error) {
            console.error('Virtual scroll render error:', error);
        }
    }

    defaultRenderItem(item, index) {
        return `<div class="${this.className}" style="height: ${this.itemHeight}px;">${index}: ${item}</div>`;
    }

    /**
     * 更新列表数据
     * @param {Array} items - 新的数据数组
     */
    updateItems(items) {
        try {
            if (!Array.isArray(items)) {
                throw new Error('Items must be an array');
            }
            this.items = items;
            this.updateVisibleRange();
        } catch (error) {
            console.error('Update items error:', error);
            throw error;
        }
    }

    /**
     * 滚动到指定索引
     * @param {number} index - 目标索引
     */
    scrollToIndex(index) {
        try {
            if (index < 0 || index >= this.items.length) {
                throw new Error('Index out of bounds');
            }
            this.container.scrollTop = index * this.itemHeight;
        } catch (error) {
            console.error('Scroll to index error:', error);
        }
    }

    /**
     * 销毁虚拟滚动实例
     */
    destroy() {
        try {
            this.container.removeEventListener('scroll', this.updateVisibleRange);
            this.container.innerHTML = '';
        } catch (error) {
            console.error('Virtual scroll destroy error:', error);
        }
    }
}

// Export for use
window.VirtualScroll = VirtualScroll;
