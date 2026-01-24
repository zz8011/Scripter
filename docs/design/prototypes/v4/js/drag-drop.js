/**
 * Scripter Drag & Drop Module
 * 拖拽排序组件 - 支持场景列表和段落级拖拽
 * 使用原生 API 实现，无外部依赖
 */

class ScripterDragDrop {
    constructor(options = {}) {
        this.container = options.container || document.querySelector('[data-draggable-container]');
        this.items = options.items || '[data-draggable-item]';
        this.handle = options.handle || '[data-draggable-handle]';
        this.onDragStart = options.onDragStart || null;
        this.onDragEnd = options.onDragEnd || null;
        this.onReorder = options.onReorder || null;
        this.placeholderClass = options.placeholderClass || 'drag-placeholder';
        this.indicatorClass = options.indicatorClass || 'drag-indicator';
        this.draggingClass = options.draggingClass || 'dragging';

        this.draggedElement = null;
        this.placeholder = null;
        this.indicator = null;
        this.dragStartIndex = -1;

        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Drag container not found');
            return;
        }

        this.bindEvents();
        this.createIndicator();
        this.addStyles();
    }

    bindEvents() {
        // Use event delegation for dynamic content
        this.container.addEventListener('mousedown', this.handleDragStart.bind(this), { passive: false });
        document.addEventListener('mousemove', this.handleDragMove.bind(this), { passive: false });
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));

        // Touch events for mobile
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleDragEnd.bind(this));
    }

    handleDragStart(e) {
        const handle = e.target.closest(this.handle);
        if (!handle) return;

        const item = handle.closest(this.items);
        if (!item) return;

        e.preventDefault();
        this.startDrag(item, e.clientX, e.clientY);
    }

    handleTouchStart(e) {
        const handle = e.target.closest(this.handle);
        if (!handle) return;

        const item = handle.closest(this.items);
        if (!item) return;

        const touch = e.touches[0];
        this.startDrag(item, touch.clientX, touch.clientY);
    }

    startDrag(item, x, y) {
        this.draggedElement = item;
        this.dragStartIndex = this.getItemIndex(item);

        // Create placeholder
        this.placeholder = item.cloneNode(true);
        this.placeholder.classList.add(this.placeholderClass);
        this.placeholder.style.height = item.offsetHeight + 'px';

        // Add dragging styles
        item.classList.add(this.draggingClass);
        item.style.position = 'fixed';
        item.style.zIndex = '1000';
        item.style.width = item.offsetWidth + 'px';
        item.style.pointerEvents = 'none';

        // Calculate offset
        const rect = item.getBoundingClientRect();
        this.offsetX = x - rect.left;
        this.offsetY = y - rect.top;

        // Insert placeholder
        item.parentNode.insertBefore(this.placeholder, item);

        // Move to body for proper positioning
        document.body.appendChild(item);
        this.moveAt(x, y);

        if (this.onDragStart) {
            this.onDragStart(item, this.dragStartIndex);
        }
    }

    handleDragMove(e) {
        if (!this.draggedElement) return;
        e.preventDefault();
        this.moveAt(e.clientX, e.clientY);
        this.updateIndicator(e.clientX, e.clientY);
    }

    handleTouchMove(e) {
        if (!this.draggedElement) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.moveAt(touch.clientX, touch.clientY);
        this.updateIndicator(touch.clientX, touch.clientY);
    }

    moveAt(pageX, pageY) {
        if (!this.draggedElement) return;
        this.draggedElement.style.left = (pageX - this.offsetX) + 'px';
        this.draggedElement.style.top = (pageY - this.offsetY) + 'px';
    }

    updateIndicator(x, y) {
        if (!this.placeholder || !this.indicator) return;

        // Get all items except placeholder and dragged element
        const items = Array.from(this.container.querySelectorAll(this.items))
            .filter(item => item !== this.placeholder && item !== this.draggedElement);

        let targetItem = null;
        let position = 'before';

        for (const item of items) {
            const rect = item.getBoundingClientRect();
            const itemMiddle = rect.top + rect.height / 2;
            const itemCenter = rect.left + rect.width / 2;

            // Check if cursor is over this item
            if (y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right) {
                targetItem = item;
                position = y < itemMiddle ? 'before' : 'after';
                break;
            }
        }

        // Update indicator position
        if (targetItem) {
            const rect = targetItem.getBoundingClientRect();
            const containerRect = this.container.getBoundingClientRect();

            if (position === 'before') {
                this.indicator.style.top = (rect.top - containerRect.top) + 'px';
            } else {
                this.indicator.style.top = (rect.bottom - containerRect.top) + 'px';
            }
            this.indicator.style.left = (rect.left - containerRect.left) + 'px';
            this.indicator.style.width = rect.width + 'px';
            this.indicator.style.display = 'block';
        } else {
            this.indicator.style.display = 'none';
        }
    }

    handleDragEnd(e) {
        if (!this.draggedElement) return;

        const items = Array.from(this.container.querySelectorAll(this.items))
            .filter(item => item !== this.placeholder && item !== this.draggedElement);

        let targetItem = null;
        let position = 'before';

        // Get cursor position
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
        const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);

        for (const item of items) {
            const rect = item.getBoundingClientRect();
            const itemMiddle = rect.top + rect.height / 2;

            if (clientY >= rect.top && clientY <= rect.bottom) {
                targetItem = item;
                position = clientY < itemMiddle ? 'before' : 'after';
                break;
            }
        }

        // Move element to new position
        if (targetItem) {
            if (position === 'before') {
                targetItem.parentNode.insertBefore(this.placeholder, targetItem);
            } else {
                targetItem.parentNode.insertBefore(this.placeholder, targetItem.nextSibling);
            }
        }

        // Replace placeholder with dragged element
        this.placeholder.parentNode.replaceChild(this.draggedElement, this.placeholder);

        // Reset styles
        this.draggedElement.classList.remove(this.draggingClass);
        this.draggedElement.style.position = '';
        this.draggedElement.style.zIndex = '';
        this.draggedElement.style.width = '';
        this.draggedElement.style.pointerEvents = '';
        this.draggedElement.style.left = '';
        this.draggedElement.style.top = '';

        const dragEndIndex = this.getItemIndex(this.draggedElement);

        // Hide indicator
        this.indicator.style.display = 'none';

        if (this.onDragEnd) {
            this.onDragEnd(this.draggedElement, this.dragStartIndex, dragEndIndex);
        }

        if (this.onReorder && this.dragStartIndex !== dragEndIndex) {
            this.onReorder(this.dragStartIndex, dragEndIndex);
        }

        this.draggedElement = null;
        this.placeholder = null;
    }

    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.className = this.indicatorClass;
        this.indicator.style.cssText = `
            position: absolute;
            height: 3px;
            background: #C9A962;
            border-radius: 2px;
            display: none;
            pointer-events: none;
            z-index: 999;
            box-shadow: 0 2px 4px rgba(201, 169, 98, 0.3);
        `;
        this.container.appendChild(this.indicator);
    }

    getItemIndex(item) {
        const items = Array.from(this.container.querySelectorAll(this.items));
        return items.indexOf(item);
    }

    addStyles() {
        const styleId = 'drag-drop-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .drag-placeholder {
                background: rgba(201, 169, 98, 0.05) !important;
                border: 2px dashed #C9A962 !important;
                border-radius: 8px !important;
                opacity: 0.5;
            }

            .dragging {
                opacity: 0.8;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
                transform: rotate(2deg);
            }

            [data-draggable-handle] {
                cursor: grab;
            }

            [data-draggable-handle]:active {
                cursor: grabbing;
            }

            .drag-over {
                border-top: 3px solid #C9A962;
            }

            /* Scene card hover effect during drag */
            .scene-card.drag-over-top {
                border-top-color: #C9A962;
                border-top-width: 3px;
            }

            .scene-card.drag-over-bottom {
                border-bottom-color: #C9A962;
                border-bottom-width: 3px;
            }

            /* Animation for reorder */
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .dragging ~ .scene-card {
                animation: slideIn 0.2s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    destroy() {
        if (this.indicator && this.indicator.parentNode) {
            this.indicator.parentNode.removeChild(this.indicator);
        }
    }
}

// Scene-specific drag implementation
class SceneDragDrop extends ScripterDragDrop {
    constructor(options = {}) {
        super({
            container: options.container || document.querySelector('[data-scenes-container]'),
            items: '[data-scene-item]',
            handle: options.handle || '[data-scene-handle]',
            ...options
        });
    }

    handleDragEnd(e) {
        super.handleDragEnd(e);

        // Update scene numbers
        this.updateSceneNumbers();
    }

    updateSceneNumbers() {
        const scenes = this.container.querySelectorAll('[data-scene-item]');
        scenes.forEach((scene, index) => {
            const numberEl = scene.querySelector('[data-scene-number]');
            if (numberEl) {
                numberEl.textContent = String(index + 1).padStart(2, '0');
            }
        });
    }
}

// Paragraph-specific drag implementation
class ParagraphDragDrop extends ScripterDragDrop {
    constructor(options = {}) {
        super({
            container: options.container || document.querySelector('[data-paragraphs-container]'),
            items: '[data-paragraph-item]',
            handle: options.handle || '[data-paragraph-handle]',
            ...options
        });
    }
}

// Export for global use
window.ScripterDragDrop = ScripterDragDrop;
window.SceneDragDrop = SceneDragDrop;
window.ParagraphDragDrop = ParagraphDragDrop;
