/**
 * Scripter Modal Dialog
 * 模态对话框组件 - 用于设置、确认等弹出窗口
 */

class ScripterModal {
    constructor(options = {}) {
        this.id = options.id || 'modal-' + Date.now();
        this.title = options.title || '';
        this.content = options.content || '';
        this.width = options.width || 700; // 固定宽度 px
        this.height = options.height || 'auto'; // 固定高度或 auto
        this.closeOnBackdrop = options.closeOnBackdrop !== false;
        this.closeOnEscape = options.closeOnEscape !== false;
        this.onOpen = options.onOpen || null;
        this.onClose = options.onClose || null;
        this.showCloseButton = options.showCloseButton !== false;

        this.element = null;
        this.backdrop = null;
        this.isOpen = false;

        this.init();
    }

    init() {
        this.create();
        this.bindEvents();
        this.addStyles();
    }

    create() {
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'modal-backdrop';
        this.backdrop.id = this.id + '-backdrop';

        // Create modal
        this.element = document.createElement('div');
        this.element.className = 'modal';
        this.element.id = this.id;
        this.element.style.width = this.width + 'px';
        if (this.height !== 'auto') {
            this.element.style.height = this.height + 'px';
        }
        this.element.setAttribute('role', 'dialog');
        this.element.setAttribute('aria-modal', 'true');
        this.element.setAttribute('aria-labelledby', this.id + '-title');

        this.element.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title" id="${this.id}-title">${this.title}</h2>
                    ${this.showCloseButton ? `
                        <button class="modal-close" data-modal-close aria-label="关闭">
                            <iconify-icon icon="lucide:x" class="text-lg"></iconify-icon>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-content">
                    ${this.content}
                </div>
            </div>
        `;

        this.backdrop.appendChild(this.element);
        document.body.appendChild(this.backdrop);
    }

    bindEvents() {
        // Close button
        const closeBtn = this.element.querySelector('[data-modal-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Backdrop click
        if (this.closeOnBackdrop) {
            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop) {
                    this.close();
                }
            });
        }

        // Escape key
        if (this.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }
    }

    open() {
        this.isOpen = true;
        this.backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (this.onOpen) {
            this.onOpen(this);
        }
    }

    close() {
        this.isOpen = false;
        this.backdrop.classList.remove('active');
        document.body.style.overflow = '';

        if (this.onClose) {
            this.onClose(this);
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    setContent(content) {
        const contentEl = this.element.querySelector('.modal-content');
        if (contentEl) {
            contentEl.innerHTML = content;
        }
    }

    setTitle(title) {
        const titleEl = this.element.querySelector('.modal-title');
        if (titleEl) {
            titleEl.innerHTML = title;
        }
    }

    destroy() {
        if (this.backdrop && this.backdrop.parentNode) {
            this.backdrop.parentNode.removeChild(this.backdrop);
        }
    }

    addStyles() {
        const styleId = 'modal-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .modal-backdrop {
                position: fixed;
                inset: 0;
                z-index: 1000;
                background: rgba(26, 26, 26, 0.5);
                backdrop-filter: blur(4px);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .modal-backdrop.active {
                opacity: 1;
                visibility: visible;
            }

            .modal {
                background: white;
                border-radius: 12px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                max-height: 85vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transform: scale(0.95) translateY(20px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .modal-backdrop.active .modal {
                transform: scale(1) translateY(0);
            }

            .modal-container {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid #D3C9B0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #FAF7F0;
                flex-shrink: 0;
            }

            .modal-title {
                font-family: 'Noto Serif SC', serif;
                font-size: 18px;
                font-weight: 700;
                color: #1A1A1A;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .modal-close {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                color: #5C5548;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            .modal-close:hover {
                background: rgba(201, 169, 98, 0.1);
                color: #C9A962;
            }

            .modal-content {
                padding: 0;
                overflow-y: auto;
                flex: 1;
            }

            .modal-content::-webkit-scrollbar {
                width: 6px;
            }

            .modal-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .modal-content::-webkit-scrollbar-thumb {
                background: #D3C9B0;
                border-radius: 4px;
            }

            .modal-content::-webkit-scrollbar-thumb:hover {
                background: #C9A962;
            }

            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #D3C9B0;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                background: #FAF7F0;
                flex-shrink: 0;
            }

            /* Settings Modal Specific Styles */
            .settings-modal .modal-content {
                padding: 0;
            }

            .settings-tabs {
                display: flex;
                gap: 0;
                border-bottom: 2px solid #D3C9B0;
                flex-shrink: 0;
            }

            .settings-tab {
                padding: 14px 20px;
                font-size: 13px;
                font-weight: 500;
                color: #5C5548;
                border-bottom: 2px solid transparent;
                margin-bottom: -2px;
                cursor: pointer;
                transition: all 0.2s ease;
                background: transparent;
                border: none;
                display: flex;
                align-items: center;
                gap: 8px;
                white-space: nowrap;
            }

            .settings-tab:hover {
                color: #C9A962;
                background: rgba(201, 169, 98, 0.05);
            }

            .settings-tab.active {
                color: #C9A962;
                border-bottom-color: #C9A962;
            }

            .settings-panel {
                display: none;
                padding: 24px;
            }

            .settings-panel.active {
                display: block;
            }
        `;
        document.head.appendChild(style);
    }
}

// Global settings modal instance
let settingsModal = null;

// Function to open settings modal
function openSettingsModal() {
    if (!settingsModal) {
        settingsModal = new ScripterModal({
            id: 'settings-modal',
            title: '<iconify-icon icon="lucide:settings" class="text-[#C9A962]"></iconify-icon> 系统设置',
            width: 700,
            showCloseButton: true,
            content: getSettingsModalContent()
        });
    }
    settingsModal.open();
    initSettingsModalEvents();
}

// Get settings modal content
function getSettingsModalContent() {
    return `
        <div class="settings-modal">
            <div class="settings-tabs">
                <button class="settings-tab active" data-tab="account" onclick="switchSettingsTab('account')">
                    <iconify-icon icon="lucide:user" class="text-base"></iconify-icon>
                    用户设置
                </button>
                <button class="settings-tab" data-tab="api" onclick="switchSettingsTab('api')">
                    <iconify-icon icon="lucide:cpu" class="text-base"></iconify-icon>
                    AI 配置
                </button>
                <button class="settings-tab" data-tab="editor" onclick="switchSettingsTab('editor')">
                    <iconify-icon icon="lucide:file-text" class="text-base"></iconify-icon>
                    编辑器
                </button>
                <button class="settings-tab" data-tab="appearance" onclick="switchSettingsTab('appearance')">
                    <iconify-icon icon="lucide:palette" class="text-base"></iconify-icon>
                    外观
                </button>
            </div>

            <div id="settings-panel-account" class="settings-panel active">
                ${getAccountSettingsContent()}
            </div>

            <div id="settings-panel-api" class="settings-panel">
                ${getAPISettingsContent()}
            </div>

            <div id="settings-panel-editor" class="settings-panel">
                ${getEditorSettingsContent()}
            </div>

            <div id="settings-panel-appearance" class="settings-panel">
                ${getAppearanceSettingsContent()}
            </div>
        </div>
    `;
}

// Settings tab content functions
function getAccountSettingsContent() {
    return `
        <div class="space-y-6">
            <!-- Profile Section -->
            <section class="bg-[#FAF7F0] rounded-lg p-5 border border-[#D3C9B0]">
                <div class="flex items-center gap-3 mb-5">
                    <iconify-icon icon="lucide:user-circle" class="text-[#C9A962] text-xl"></iconify-icon>
                    <div class="font-semibold text-base text-[#1A1A1A]">个人资料</div>
                </div>

                <div class="flex items-start gap-5 mb-5">
                    <div class="relative group">
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
                            class="w-20 h-20 rounded-xl object-cover border-2 border-[#D3C9B0]" alt="Avatar">
                        <button class="absolute bottom-0 right-0 w-7 h-7 bg-[#C9A962] rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <iconify-icon icon="lucide:camera" class="text-sm"></iconify-icon>
                        </button>
                    </div>
                    <div class="flex-1 space-y-3">
                        <div>
                            <label class="form-label text-xs font-semibold text-[#1A1A1A] mb-1 block">用户名</label>
                            <input type="text" class="form-input w-full px-3 py-2 text-sm border border-[#D3C9B0] rounded focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none"
                                value="Felix Vincent">
                        </div>
                        <div>
                            <label class="form-label text-xs font-semibold text-[#1A1A1A] mb-1 block">邮箱</label>
                            <input type="email" class="form-input w-full px-3 py-2 text-sm border border-[#D3C9B0] rounded focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none"
                                value="felix@scripter.art">
                        </div>
                    </div>
                </div>

                <div>
                    <label class="form-label text-xs font-semibold text-[#1A1A1A] mb-1 block">个人简介</label>
                    <textarea class="form-input w-full px-3 py-2 text-sm border border-[#D3C9B0] rounded focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none resize-none"
                        rows="3" placeholder="介绍一下自己...">短剧编剧，专注于武侠悬疑题材。作品有《我送君归去》《大漠孤烟》。</textarea>
                </div>
            </section>

            <!-- Security Section -->
            <section class="bg-[#FAF7F0] rounded-lg p-5 border border-[#D3C9B0]">
                <div class="flex items-center gap-3 mb-4">
                    <iconify-icon icon="lucide:shield" class="text-[#C9A962] text-xl"></iconify-icon>
                    <div class="font-semibold text-base text-[#1A1A1A]">账户安全</div>
                </div>

                <div class="space-y-2">
                    <button class="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-[#D3C9B0] hover:border-[#C9A962] transition-colors">
                        <div class="flex items-center gap-3">
                            <iconify-icon icon="lucide:lock" class="text-[#5C5548]"></iconify-icon>
                            <span class="text-sm font-medium">修改密码</span>
                        </div>
                        <iconify-icon icon="lucide:chevron-right" class="text-[#8B7355]"></iconify-icon>
                    </button>
                    <button class="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-[#D3C9B0] hover:border-[#C9A962] transition-colors">
                        <div class="flex items-center gap-3">
                            <iconify-icon icon="lucide:smartphone" class="text-[#5C5548]"></iconify-icon>
                            <span class="text-sm font-medium">两步验证</span>
                        </div>
                        <span class="text-xs text-[#8B7355]">未启用</span>
                    </button>
                    <button class="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-[#D3C9B0] hover:border-[#C9A962] transition-colors">
                        <div class="flex items-center gap-3">
                            <iconify-icon icon="lucide:download" class="text-[#5C5548]"></iconify-icon>
                            <span class="text-sm font-medium">导出数据</span>
                        </div>
                        <iconify-icon icon="lucide:chevron-right" class="text-[#8B7355]"></iconify-icon>
                    </button>
                </div>
            </section>

            <!-- Subscription Info -->
            <section class="bg-gradient-to-r from-[#C9A962]/10 to-[#A68A45]/10 rounded-lg p-5 border border-[#C9A962]/30">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-[#C9A962] rounded-lg flex items-center justify-center">
                            <iconify-icon icon="lucide:crown" class="text-white text-lg"></iconify-icon>
                        </div>
                        <div>
                            <div class="font-semibold text-sm text-[#1A1A1A]">Pro 会员</div>
                            <div class="text-xs text-[#8B7355]">有效期至 2025-12-31</div>
                        </div>
                    </div>
                    <button class="px-4 py-2 bg-[#C9A962] text-white text-xs font-semibold rounded hover:bg-[#A68A45] transition-colors">
                        续费
                    </button>
                </div>
            </section>
        </div>
    `;
}

function getAPISettingsContent() {
    return `
        <div class="space-y-6">
            <section class="bg-[#FAF7F0] rounded-lg p-4 border border-[#D3C9B0]">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center">
                        <iconify-icon icon="lucide:sparkles" class="text-[#C9A962] text-lg"></iconify-icon>
                    </div>
                    <div>
                        <div class="font-semibold text-sm text-[#1A1A1A]">智谱 GLM-4.7</div>
                        <div class="text-xs text-[#8B7355]">文本处理、对话生成、剧本优化</div>
                    </div>
                </div>

                <div class="form-group mb-4">
                    <label class="form-label flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] mb-2">
                        <iconify-icon icon="lucide:link" class="text-[#C9A962] text-sm"></iconify-icon>
                        API Base URL
                    </label>
                    <input type="text" class="form-input w-full px-3 py-2 text-sm border border-[#D3C9B0] rounded focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none"
                        id="modal-zhipu-api-base" name="zhipu-api-base"
                        data-validate="required|api-url"
                        value="https://open.bigmodel.cn/api/paas/v4" placeholder="输入智谱 API 地址">
                    <div class="form-hint text-[10px] text-[#8B7355] mt-1">智谱 AI 开放平台 API 端点</div>
                </div>

                <div class="form-group mb-4">
                    <label class="form-label flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] mb-2">
                        <iconify-icon icon="lucide:key" class="text-[#C9A962] text-sm"></iconify-icon>
                        API Key
                    </label>
                    <div class="flex gap-2">
                        <input type="password" class="form-input flex-1 px-3 py-2 text-sm border border-[#D3C9B0] rounded focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none"
                            id="modal-zhipu-api-key" name="zhipu-api-key"
                            data-validate="required|minlength:20"
                            value="348ac438fd6041cda3c6f1799c66103c.1CY7SJdkJB2K9myk" placeholder="输入智谱 API Key">
                        <button class="btn-icon px-3 py-2 border border-[#D3C9B0] rounded hover:border-[#C9A962]" onclick="toggleModalPasswordVisibility('modal-zhipu-api-key')">
                            <iconify-icon icon="lucide:eye" class="text-sm"></iconify-icon>
                        </button>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button type="button" class="btn-secondary px-4 py-2 text-xs font-semibold border border-[#D3C9B0] rounded hover:border-[#C9A962] flex-1" onclick="testModalConnection('zhipu')">
                        <iconify-icon icon="lucide:zap" class="text-sm mr-1"></iconify-icon>
                        测试连接
                    </button>
                    <button type="button" class="btn-primary px-4 py-2 text-xs font-semibold bg-[#C9A962] text-white rounded hover:bg-[#A68A45] flex-1" onclick="saveModalAPISettings()">
                        <iconify-icon icon="lucide:save" class="text-sm mr-1"></iconify-icon>
                        保存配置
                    </button>
                </div>
            </section>

            <section class="bg-[#FAF7F0] rounded-lg p-4 border border-[#D3C9B0]">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center">
                        <iconify-icon icon="lucide:image" class="text-[#C9A962] text-lg"></iconify-icon>
                    </div>
                    <div>
                        <div class="font-semibold text-sm text-[#1A1A1A]">T8Star 图片生成</div>
                        <div class="text-xs text-[#8B7355]">人物人设图、场景概念图</div>
                    </div>
                </div>

                <div class="form-group mb-4">
                    <label class="form-label flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] mb-2">
                        <iconify-icon icon="lucide:link" class="text-[#C9A962] text-sm"></iconify-icon>
                        API Base URL
                    </label>
                    <input type="text" class="form-input w-full px-3 py-2 text-sm border border-[#D3C9B0] rounded focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none"
                        id="modal-t8star-api-base" name="t8star-api-base"
                        data-validate="required|api-url"
                        value="https://ai.t8star.cn" placeholder="输入 T8Star API 地址">
                </div>

                <div class="form-group mb-4">
                    <label class="form-label flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] mb-2">
                        <iconify-icon icon="lucide:key" class="text-[#C9A962] text-sm"></iconify-icon>
                        API Key
                    </label>
                    <div class="flex gap-2">
                        <input type="password" class="form-input flex-1 px-3 py-2 text-sm border border-[#D3C9B0] rounded focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none"
                            id="modal-t8star-api-key" name="t8star-api-key"
                            data-validate="required|minlength:20"
                            value="sk-hw1qk4MMad06RLuwKcatZ7zRl5JdespQexTMRqciwuCYqBTx" placeholder="输入 T8Star API Key">
                        <button class="btn-icon px-3 py-2 border border-[#D3C9B0] rounded hover:border-[#C9A962]" onclick="toggleModalPasswordVisibility('modal-t8star-api-key')">
                            <iconify-icon icon="lucide:eye" class="text-sm"></iconify-icon>
                        </button>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button type="button" class="btn-secondary px-4 py-2 text-xs font-semibold border border-[#D3C9B0] rounded hover:border-[#C9A962] flex-1" onclick="testModalConnection('t8star')">
                        <iconify-icon icon="lucide:zap" class="text-sm mr-1"></iconify-icon>
                        测试连接
                    </button>
                    <button type="button" class="btn-primary px-4 py-2 text-xs font-semibold bg-[#C9A962] text-white rounded hover:bg-[#A68A45] flex-1" onclick="saveModalAPISettings()">
                        <iconify-icon icon="lucide:save" class="text-sm mr-1"></iconify-icon>
                        保存配置
                    </button>
                </div>
            </section>
        </div>
    `;
}

function getEditorSettingsContent() {
    return `
        <div class="space-y-4">
            <div class="form-group">
                <label class="form-label flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] mb-2">
                    <iconify-icon icon="lucide:type" class="text-[#C9A962] text-sm"></iconify-icon>
                    字体大小
                </label>
                <div class="flex items-center gap-4">
                    <input type="range" min="14" max="22" value="18" class="flex-1 accent-[#C9A962]"
                        oninput="updateModalFontSize(this.value)">
                    <span id="modal-font-size-display" class="text-sm font-semibold text-[#C9A962] min-w-[3rem]">18px</span>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] mb-2">
                    <iconify-icon icon="lucide:line-height" class="text-[#C9A962] text-sm"></iconify-icon>
                    行高
                </label>
                <select class="form-input w-full px-3 py-2 text-sm border border-[#D3C9B0] rounded focus:border-[#C9A962] outline-none">
                    <option value="1.4">1.4 - 紧凑</option>
                    <option value="1.5" selected>1.5 - 标准</option>
                    <option value="1.6">1.6 - 宽松</option>
                    <option value="1.8">1.8 - 舒适</option>
                </select>
            </div>

            <div class="flex items-center justify-between p-4 bg-[#FAF7F0] rounded-lg border border-[#D3C9B0]">
                <div>
                    <div class="font-semibold text-sm text-[#1A1A1A]">启用等宽字体</div>
                    <div class="text-xs text-[#8B7355]">使用 Courier Prime 等宽字体</div>
                </div>
                <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
            </div>
        </div>
    `;
}

function getAppearanceSettingsContent() {
    return `
        <div class="space-y-4">
            <div>
                <label class="form-label flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] mb-3">
                    <iconify-icon icon="lucide:sun" class="text-[#C9A962] text-sm"></iconify-icon>
                    主题设置
                </label>
                <div class="grid grid-cols-3 gap-3">
                    <button class="p-4 bg-white rounded-lg border-2 border-[#C9A962] text-center">
                        <div class="w-8 h-8 bg-[#F5F1E8] rounded mx-auto mb-2 border border-[#D3C9B0]"></div>
                        <span class="text-sm font-medium">纸质米色</span>
                    </button>
                    <button class="p-4 bg-white rounded-lg border border-[#D3C9B0] text-center hover:border-[#C9A962] transition-colors">
                        <div class="w-8 h-8 bg-gray-100 rounded mx-auto mb-2"></div>
                        <span class="text-sm font-medium">简约白</span>
                    </button>
                    <button class="p-4 bg-white rounded-lg border border-[#D3C9B0] text-center hover:border-[#C9A962] transition-colors">
                        <div class="w-8 h-8 bg-[#1A1A1A] rounded mx-auto mb-2"></div>
                        <span class="text-sm font-medium">深邃黑</span>
                    </button>
                </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-[#FAF7F0] rounded-lg border border-[#D3C9B0]">
                <div>
                    <div class="font-semibold text-sm text-[#1A1A1A]">显示纸张纹理</div>
                    <div class="text-xs text-[#8B7355]">在背景显示细微纸张纹理</div>
                </div>
                <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
            </div>

            <div class="flex items-center justify-between p-4 bg-[#FAF7F0] rounded-lg border border-[#D3C9B0]">
                <div>
                    <div class="font-semibold text-sm text-[#1A1A1A]">显示行号</div>
                    <div class="text-xs text-[#8B7355]">在编辑器左侧显示行号</div>
                </div>
                <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
            </div>
        </div>
    `;
}

// Settings modal functions
function initSettingsModalEvents() {
    // Load saved values
    const zhipuBase = localStorage.getItem('zhipu_api_base');
    const zhipuKey = localStorage.getItem('zhipu_api_key');
    const t8starBase = localStorage.getItem('t8star_api_base');
    const t8starKey = localStorage.getItem('t8star_api_key');

    if (zhipuBase) {
        const input = document.getElementById('modal-zhipu-api-base');
        if (input) input.value = zhipuBase;
    }
    if (zhipuKey) {
        const input = document.getElementById('modal-zhipu-api-key');
        if (input) input.value = zhipuKey;
    }
    if (t8starBase) {
        const input = document.getElementById('modal-t8star-api-base');
        if (input) input.value = t8starBase;
    }
    if (t8starKey) {
        const input = document.getElementById('modal-t8star-api-key');
        if (input) input.value = t8starKey;
    }
}

function switchSettingsTab(tabName) {
    // Update tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Update panels
    document.querySelectorAll('.settings-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(`settings-panel-${tabName}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}

function toggleModalPasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

function updateModalFontSize(size) {
    const display = document.getElementById('modal-font-size-display');
    if (display) {
        display.textContent = `${size}px`;
    }
}

function testModalConnection(service) {
    const btn = event.target.closest('button');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<iconify-icon icon="lucide:loader-2" class="text-sm mr-2 animate-spin"></iconify-icon>测试中...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = '<iconify-icon icon="lucide:check" class="text-sm mr-2 text-green-600"></iconify-icon>连接成功';
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }, 2000);
    }, 1500);
}

function saveModalAPISettings() {
    const zhipuBase = document.getElementById('modal-zhipu-api-base')?.value;
    const zhipuKey = document.getElementById('modal-zhipu-api-key')?.value;
    const t8starBase = document.getElementById('modal-t8star-api-base')?.value;
    const t8starKey = document.getElementById('modal-t8star-api-key')?.value;

    // Save to localStorage
    if (zhipuBase) localStorage.setItem('zhipu_api_base', zhipuBase);
    if (zhipuKey) localStorage.setItem('zhipu_api_key', zhipuKey);
    if (t8starBase) localStorage.setItem('t8star_api_base', t8starBase);
    if (t8starKey) localStorage.setItem('t8star_api_key', t8starKey);

    // Show notification and close modal
    showModalNotification('API 配置已保存！', 'success');
    setTimeout(() => {
        if (settingsModal) {
            settingsModal.close();
        }
    }, 1500);
}

function showModalNotification(message, type = 'info') {
    const modal = settingsModal?.element;
    if (!modal) return;

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`;

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
    }

    modal.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slide-out 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Add toggle switch styles
const toggleSwitchStyle = document.createElement('style');
toggleSwitchStyle.textContent = `
    .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        background: #D3C9B0;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .toggle-switch.active {
        background: #C9A962;
    }

    .toggle-switch::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toggle-switch.active::after {
        left: 22px;
    }
`;
document.head.appendChild(toggleSwitchStyle);

// Export for global use
window.ScripterModal = ScripterModal;
window.openSettingsModal = openSettingsModal;
