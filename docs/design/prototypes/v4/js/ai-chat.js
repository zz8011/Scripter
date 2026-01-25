/**
 * Scripter AI Chat Module
 * AI 流式对话组件 - 支持智谱 GLM-4.7
 */

class ScripterAIChat {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('ai-chat-container');
        this.inputSelector = options.inputSelector || '#ai-input';
        this.sendSelector = options.sendSelector || '#ai-send-btn';
        this.messagesSelector = options.messagesSelector || '#ai-messages';
        this.apiBase = options.apiBase || localStorage.getItem('zhipu_api_base') || 'https://open.bigmodel.cn/api/paas/v4';
        this.apiKey = options.apiKey || localStorage.getItem('zhipu_api_key') || '';
        this.model = options.model || 'glm-4.7';
        this.onMessage = options.onMessage || null;
        this.systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt();

        // Quick actions configuration
        this.quickActions = options.quickActions || this.getDefaultQuickActions();

        this.init();
    }

    getDefaultQuickActions() {
        return [
            { action: 'optimize', icon: 'lucide:sparkles', title: '优化选中文本' },
            { action: 'expand', icon: 'lucide:expand', title: '扩展场景' },
            { action: 'check', icon: 'lucide:check-circle', title: '格式检查' }
        ];
    }

    init() {
        this.render();
        this.bindEvents();
        this.addMessage({
            role: 'assistant',
            content: '你好！我是剧灵 AI 创作伙伴。我可以帮你优化对白、扩展场景、检查格式，或者提供创作建议。有什么我可以帮助你的吗？'
        });
    }

    render() {
        if (!this.container) {
            console.error('AI chat container not found');
            return;
        }

        this.container.innerHTML = `
            <div class="ai-chat-header">
                <div class="flex items-center gap-2 mb-1">
                    <iconify-icon icon="lucide:bot" class="text-xl text-[#C9A962]"></iconify-icon>
                    <div class="text-sm font-bold text-[#1A1A1A]">AI 创作伙伴</div>
                </div>
                <div class="ai-status text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span class="status-text">模型已就绪</span>
                </div>
            </div>

            <div class="ai-messages custom-scrollbar" id="ai-messages">
                <!-- Messages will be rendered here -->
            </div>

            <div class="ai-input-area">
                <div class="relative bg-[#FAF7F0] rounded border border-[#D3C9B0]/60 p-1">
                    <textarea
                        id="ai-input"
                        placeholder="输入创作指令... (Shift+Enter 换行，Enter 发送)"
                        class="w-full bg-transparent p-3 text-xs h-24 focus:outline-none resize-none custom-scrollbar"
                        rows="4"></textarea>
                    <div class="flex items-center justify-between px-2 pb-2">
                        <div class="flex items-center gap-1">
                            ${this.quickActions.map(action => `
                                <button class="ai-quick-btn" data-action="${action.action}" title="${action.title}">
                                    <iconify-icon icon="${action.icon}" class="text-sm"></iconify-icon>
                                </button>
                            `).join('')}
                        </div>
                        <button id="ai-send-btn" class="w-7 h-7 bg-[#1A1A1A] text-white rounded flex items-center justify-center hover:bg-[#C9A962] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <iconify-icon icon="lucide:arrow-up" class="text-base"></iconify-icon>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const styleId = 'ai-chat-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = this.getStyles();
            document.head.appendChild(style);
        }
    }

    getStyles() {
        return `
            .ai-chat-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: white;
            }
            .ai-chat-header {
                padding: 1.5rem;
                border-bottom: 1px solid rgba(211, 203, 176, 0.5);
                background: rgba(250, 247, 240, 0.3);
                min-height: 80px;
            }
            .ai-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .ai-input-area {
                padding: 1rem;
                border-top: 1px solid rgba(211, 203, 176, 0.4);
                background: white;
            }
            .ai-quick-btn {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(211, 203, 176, 0.6);
                background: white;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #5C5548;
            }
            .ai-quick-btn:hover {
                border-color: #C9A962;
                color: #C9A962;
                background: rgba(201, 169, 98, 0.05);
            }

            /* Message Bubbles */
            .ai-message {
                display: flex;
                gap: 0.75rem;
                max-width: 100%;
                animation: messageSlideIn 0.3s ease-out;
            }
            .ai-message.user {
                flex-direction: row-reverse;
            }
            .ai-message-avatar {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .ai-message.assistant .ai-message-avatar {
                background: rgba(201, 169, 98, 0.1);
                color: #C9A962;
            }
            .ai-message.user .ai-message-avatar {
                background: #1A1A1A;
                color: white;
            }
            .ai-message-content {
                flex: 1;
            }
            .ai-message-bubble {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 12px;
                line-height: 1.6;
                word-wrap: break-word;
            }
            .ai-message.assistant .ai-message-bubble {
                background: #FAF7F0;
                color: #1A1A1A;
                border: 1px solid rgba(211, 203, 176, 0.4);
                border-radius: 10px 10px 10px 2px;
            }
            .ai-message.user .ai-message-bubble {
                background: #1A1A1A;
                color: white;
                border-radius: 10px 10px 2px 10px;
            }
            .ai-message-timestamp {
                font-size: 9px;
                color: #8B7355;
                margin-top: 4px;
            }

            /* Typing Indicator */
            .ai-typing {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: #FAF7F0;
                border-radius: 10px;
                width: fit-content;
            }
            .ai-typing-dot {
                width: 6px;
                height: 6px;
                background: #C9A962;
                border-radius: 50%;
                animation: typingBounce 1.4s ease-in-out infinite;
            }
            .ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }

            /* Animations */
            @keyframes messageSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes typingBounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-4px); }
            }

            /* Cursor blinking for streaming */
            .streaming-cursor {
                display: inline-block;
                width: 2px;
                height: 1em;
                background: #C9A962;
                animation: blink 1s infinite;
                margin-left: 2px;
                vertical-align: text-bottom;
            }
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
        `;
    }

    bindEvents() {
        const input = document.querySelector(this.inputSelector);
        const sendBtn = document.querySelector(this.sendSelector);

        if (!input || !sendBtn) return;

        // Send button click
        sendBtn.addEventListener('click', () => this.sendMessage());

        // Enter to send, Shift+Enter for new line
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        // Quick action buttons
        document.querySelectorAll('.ai-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    addMessage(message) {
        const messagesContainer = document.querySelector(this.messagesSelector);
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `ai-message ${message.role}`;

        const avatar = message.role === 'assistant'
            ? '<iconify-icon icon="lucide:sparkles" class="text-sm"></iconify-icon>'
            : '<iconify-icon icon="lucide:user" class="text-sm"></iconify-icon>';

        const timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

        messageEl.innerHTML = `
            <div class="ai-message-avatar">${avatar}</div>
            <div class="ai-message-content">
                <div class="ai-message-bubble">${this.formatMessage(message.content)}</div>
                <div class="ai-message-timestamp">${timestamp}</div>
            </div>
        `;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (this.onMessage) {
            this.onMessage(message);
        }
    }

    formatMessage(content) {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-[#1A1A1A]/10 rounded text-xs">$1</code>')
            .replace(/\n/g, '<br>');
    }

    async sendMessage(content = null) {
        const input = document.querySelector(this.inputSelector);
        const sendBtn = document.querySelector(this.sendSelector);
        const messageText = content || input?.value?.trim();

        if (!messageText) return;

        // Add user message
        this.addMessage({
            role: 'user',
            content: messageText
        });

        // Clear input
        if (input) input.value = '';

        // Disable send button
        if (sendBtn) sendBtn.disabled = true;

        // Show typing indicator
        this.showTyping();

        try {
            await this.streamResponse(messageText);
        } catch (error) {
            this.hideTyping();
            this.addMessage({
                role: 'assistant',
                content: `抱歉，发生了错误：${error.message}。请检查 API 配置是否正确。`
            });
        } finally {
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    showTyping() {
        const messagesContainer = document.querySelector(this.messagesSelector);
        if (!messagesContainer) return;

        const typingEl = document.createElement('div');
        typingEl.className = 'ai-message assistant';
        typingEl.id = 'ai-typing-indicator';
        typingEl.innerHTML = `
            <div class="ai-message-avatar">
                <iconify-icon icon="lucide:sparkles" class="text-sm"></iconify-icon>
            </div>
            <div class="ai-typing">
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            </div>
        `;
        messagesContainer.appendChild(typingEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typingEl = document.getElementById('ai-typing-indicator');
        if (typingEl) typingEl.remove();
    }

    async streamResponse(prompt) {
        const messagesContainer = document.querySelector(this.messagesSelector);

        try {
            // Create assistant message element
            const messageEl = document.createElement('div');
            messageEl.className = 'ai-message assistant';
            const timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

            messageEl.innerHTML = `
                <div class="ai-message-avatar">
                    <iconify-icon icon="lucide:sparkles" class="text-sm"></iconify-icon>
                </div>
                <div class="ai-message-content">
                    <div class="ai-message-bubble"><span class="streaming-text"></span><span class="streaming-cursor"></span></div>
                    <div class="ai-message-timestamp">${timestamp}</div>
                </div>
            `;
            messagesContainer.appendChild(messageEl);

            const textEl = messageEl.querySelector('.streaming-text');
            let fullResponse = '';

            // Simulate streaming (replace with actual API call)
            const response = await this.mockStreamResponse(prompt);

            // Typewriter effect
            for (let i = 0; i < response.length; i++) {
                fullResponse += response[i];
                textEl.innerHTML = this.formatMessage(fullResponse);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                await this.delay(15); // Typing speed
            }

            // Remove cursor
            const cursor = messageEl.querySelector('.streaming-cursor');
            if (cursor) cursor.remove();

        } catch (error) {
            console.error('AI Chat Stream Error:', error);
            this.showError('消息流式传输失败，请重试');
            throw error;
        }
    }

    async mockStreamResponse(prompt) {
        // Mock response - replace with actual API call to Zhipu
        const responses = [
            `好的，我来帮你优化这段对白。根据角色的性格特点，我建议：

**修改前：**"${prompt.substring(0, 20)}..."

**修改后：**"根据你的需求，这段对白可以更加生动一些。让角色的情感通过细微的动作和语气变化体现出来。"

**修改说明：**
- 增加了情感层次
- 添加了潜台词
- 更符合人物性格

需要我继续优化其他部分吗？`,
            `我来帮你扩展这个场景：

**场景扩展建议：**

1. **环境细节**：可以添加更多环境描写，营造氛围
2. **人物动作**：通过细微动作展现角色内心
3. **感官体验**：加入声音、气味等感官元素

**扩展后的场景：**
（这里会显示扩展后的场景内容...）

需要我针对某个特定方面继续深入吗？`,
            `格式检查结果：

✅ 场景标题格式正确
✅ 人物对话格式符合规范
⚠️ 建议在动作描述中添加更多细节
✅ 整体结构完整

**改进建议：**
1. 可以考虑添加场景过渡
2. 部分对白可以更加精炼

需要我帮你自动修复这些问题吗？`
        ];

        // Create guide responses
        const createResponses = {
            shortDrama: `太好了！短剧是非常受欢迎的形式。🎯

**短剧创作要点：**
• 节奏快，每集 1-3 分钟
• 竖屏拍摄，注重人物特写
• 前 3 秒必须抓住观众
• 每集结尾留悬念

**接下来，请告诉我你想写什么题材？**

比如：都市甜宠、悬疑推理、古装言情、喜剧搞笑...`,
            webDrama: `网剧是个不错的选择！📺

**网剧创作要点：**
• 横屏拍摄，每集 15-30 分钟
• 适合连续剧情发展
• 人物塑造可以更深入
• 场景描写更丰富

**你想创作什么题材的网剧？**

比如：都市情感、古装权谋、科幻悬疑、青春校园...`,
            movie: `电影创作需要有深度和广度！🎬

**电影剧本要点：**
• 通常 90-120 分钟
• 三幕式结构
• 人物弧光完整
• 视觉语言重要

**你想创作什么类型的电影？**

比如：剧情片、喜剧片、动作片、悬疑片...`,
            genre: `很好！这个题材很有潜力。✨

**接下来，请简单描述一下你的故事创意：**

• 故事发生在什么背景下？
• 主角是什么样的人？
• 他们面临什么冲突？
• 你想表达什么主题？

不需要很详细，一个简单的想法就可以，我会帮你扩展完善！`,
            default: `收到你的指令："${prompt}"。作为剧灵 AI 创作伙伴，我可以帮你：

• 📝 优化对白和场景描述
• 🎭 检查格式和人物一致性
• 💡 提供创作灵感和建议
• 📊 分析剧本节奏和结构

请告诉我你需要什么帮助？`
        };

        // Simulate network delay
        await this.delay(500);

        // Check for create guide keywords
        if (prompt.includes('短剧') || prompt.includes('竖屏')) {
            return createResponses.shortDrama;
        } else if (prompt.includes('网剧')) {
            return createResponses.webDrama;
        } else if (prompt.includes('电影')) {
            return createResponses.movie;
        } else if (prompt.includes('都市') || prompt.includes('甜宠') || prompt.includes('悬疑') ||
                   prompt.includes('古装') || prompt.includes('言情') || prompt.includes('喜剧')) {
            return createResponses.genre;
        } else if (prompt.includes('优化') || prompt.includes('改')) {
            return responses[0];
        } else if (prompt.includes('扩展') || prompt.includes('场景')) {
            return responses[1];
        } else if (prompt.includes('检查') || prompt.includes('格式')) {
            return responses[2];
        } else {
            return createResponses.default;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleQuickAction(action) {
        const input = document.querySelector(this.inputSelector);
        if (!input) return;

        // Default prompts for common actions
        const defaultPrompts = {
            optimize: '请帮我优化选中的对白，使其更符合人物性格和场景氛围。',
            expand: '请帮我扩展当前场景，添加更多环境细节和人物动作描写。',
            check: '请检查当前剧本的格式是否符合行业标准，并给出改进建议。'
        };

        // Find the action config
        const actionConfig = this.quickActions.find(a => a.action === action);

        // Use custom prompt if available, otherwise use default
        if (actionConfig && actionConfig.prompt) {
            if (typeof actionConfig.prompt === 'function') {
                actionConfig.prompt();
            } else {
                input.value = actionConfig.prompt;
                input.focus();
            }
        } else if (defaultPrompts[action]) {
            input.value = defaultPrompts[action];
            input.focus();
        }
    }

    getDefaultSystemPrompt() {
        return `你是剧灵（Scripter）AI 创作伙伴，一个专业的短剧剧本创作助手。你的职责是：

1. 对白优化：帮助编剧润色对白，使其更符合人物性格和场景氛围
2. 场景扩展：为场景添加更多细节，包括环境、动作、感官体验等
3. 格式检查：检查剧本格式是否符合中文短剧行业标准
4. 创作建议：提供情节发展、人物塑造等方面的专业建议

请保持专业、友好的语气，用中文回复。回复要简洁明了，重点突出。`;
    }

    // Public method to update status
    setStatus(status, message) {
        const statusEl = document.querySelector('.ai-status .status-text');
        const dotEl = document.querySelector('.ai-status .status-dot');

        if (statusEl) statusEl.textContent = message;

        if (dotEl) {
            dotEl.className = 'status-dot';
            if (status === 'online') dotEl.classList.add('online');
            else if (status === 'offline') dotEl.classList.add('offline');
        }
    }

    // Start create project guide
    startCreateGuide() {
        const messagesContainer = document.querySelector(this.messagesSelector);
        if (!messagesContainer) return;

        // Clear existing messages
        messagesContainer.innerHTML = '';

        // Add welcome message for create guide
        this.addMessage({
            role: 'assistant',
            content: `你好！我是剧灵 AI 创作伙伴。很高兴能和你一起开始新的创作之旅！🎬

让我们一步步来创建你的新项目。首先，请告诉我：

**你想创作什么类型的故事？**

• 短剧（竖屏快节奏）
• 网剧（横屏连续剧）
• 电影（长片叙事）
• 微短剧（超短剧集）

你可以直接告诉我你的想法，比如："我想写一个都市甜宠短剧"或者"我想创作一个古风玄幻网剧"。`
        });
    }

    // Start edit project guide
    startEditGuide() {
        const messagesContainer = document.querySelector(this.messagesSelector);
        if (!messagesContainer) return;

        // Clear existing messages
        messagesContainer.innerHTML = '';

        // Add welcome message for edit guide
        this.addMessage({
            role: 'assistant',
            content: `你好！我可以帮你修改项目信息。📝

当前项目：**我送君归去**

你想修改什么内容？

• **项目名称** - 修改项目的标题
• **剧本类型** - 更改短剧/网剧/电影类型
• **题材标签** - 调整题材分类
• **故事简介** - 更新项目简介
• **其他信息** - 修改其他项目详情

请告诉我你想修改的内容，比如："把项目名称改为XXX"或者"修改题材标签为都市甜宠"。`
        });
    }

    // Start evaluate project guide
    startEvaluateGuide() {
        const messagesContainer = document.querySelector(this.messagesSelector);
        if (!messagesContainer) return;

        // Clear existing messages
        messagesContainer.innerHTML = '';

        // Add welcome message for evaluate guide
        this.addMessage({
            role: 'assistant',
            content: `你好！让我来帮你分析当前项目的情况。📊

**项目：我送君归去**

**项目概况：**
• 总字数：48,526 字
• 场景数：82 场
• 人物数：12 个
• 完成进度：60.5%
• 最后编辑：2 小时前

**快速评估：**
✅ 剧本结构完整，场景节奏把控良好
✅ 人物对白符合角色性格
⚠️ 建议增加更多环境描写细节
⚠️ 部分场景可以进一步丰富

**你想深入了解哪个方面？**

• **剧情分析** - 分析故事结构和节奏
• **人物塑造** - 评估角色设定和发展
• **场景质量** - 检查场景描写和转场
• **格式检查** - 检查剧本格式规范
• **改进建议** - 获取具体的优化建议

请告诉我你想了解的内容，或者直接上传剧本内容让我分析。`
        });
    }

    // Check script format
    checkFormat() {
        const scriptContent = document.querySelector('[data-script-content]');
        if (!scriptContent) return;

        // Extract script text content
        const scriptText = scriptContent.innerText || scriptContent.textContent;

        // Add user message
        this.addMessage({
            role: 'user',
            content: '请检查当前剧本的格式是否符合行业标准。'
        });

        // Simulate format check result
        const formatResult = `**格式检查报告** 📋

✅ **场景标题格式正确**
- "第 1 场：湘西山区·夜·外" 符合标准格式

✅ **人物对话格式规范**
- 【雾姝】标注正确
- 动作说明使用括号包裹
- 对白内容清晰

✅ **动作描写格式良好**
- 使用 △ 符号标识动作段落
- 描写简洁明了

⚠️ **改进建议：**

1. **场景编号**：建议添加统一的场景编号系统，如 "S1E01-01"
2. **时间标注**：当前使用"夜"，可以更具体，如"深夜/凌晨"
3. **转场提示**：场景之间可以添加转场说明（如：切至/淡入）

**总体评分：8.5/10** 🌟

剧本格式整体规范，符合短剧行业标准。建议按照上述建议进一步完善。

需要我帮你自动修复这些格式问题吗？`;

        // Add assistant response
        setTimeout(() => {
            this.addMessage({
                role: 'assistant',
                content: formatResult
            });
        }, 500);
    }

    showError(message) {
        const messagesContainer = document.querySelector(this.messagesSelector);
        if (!messagesContainer) {
            console.error(message);
            return;
        }

        const errorEl = document.createElement('div');
        errorEl.className = 'ai-message assistant error';
        errorEl.innerHTML = `
            <div class="ai-message-avatar">
                <iconify-icon icon="lucide:alert-circle" class="text-sm text-red-500"></iconify-icon>
            </div>
            <div class="ai-message-content">
                <div class="ai-message-bubble bg-red-50 border-red-200">${message}</div>
            </div>
        `;
        messagesContainer.appendChild(errorEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Export for use
window.ScripterAIChat = ScripterAIChat;
