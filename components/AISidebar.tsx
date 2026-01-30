"use client";

/* ==================================================
   右侧 AI 助手组件 AI Sidebar Component
   ================================================== */

import { useState, useRef, useEffect } from "react";
import { AIMessage, UserInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTheme } from "@/app/providers/theme-provider";

interface AISidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// 模拟用户信息
const MOCK_USER: UserInfo = {
  id: "user_001",
  name: "Felix Vincent",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
};

// 扩展的用户信息（用于 UI 显示）
interface ExtendedUserInfo extends UserInfo {
  membership?: string;
  membershipLabel?: string;
  isOnline?: boolean;
}

const MOCK_USER_EXTENDED: ExtendedUserInfo = {
  ...MOCK_USER,
  membership: "pro",
  membershipLabel: "编剧资深会员",
  isOnline: true,
};

// 模拟 AI 初始消息
const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: "welcome_001",
    role: "assistant",
    content: "你好！我是剧灵，你的 AI 创作搭档。🪶\n\n我可以帮你：\n• 生成剧本情节和对话\n• 创建和优化人物设定\n• 分析剧本格式和节奏\n• 提供创作建议和灵感\n\n有什么可以帮到你的吗？",
    timestamp: new Date(),
    type: "text",
  },
];

// 快捷操作配置
const QUICK_ACTIONS = [
  { id: "create", icon: "lucide:plus-circle", label: "开启新创作", prompt: "我想开始一个新创作项目" },
  { id: "optimize", icon: "lucide:wand-2", label: "优化剧本", prompt: "帮我优化当前剧本" },
  { id: "analyze", icon: "lucide:trending-up", label: "分析节奏", prompt: "分析剧本节奏和结构" },
  { id: "format", icon: "lucide:file-check", label: "检查格式", prompt: "检查剧本格式是否符合规范" },
];

export function AISidebar({ collapsed, onToggle }: AISidebarProps) {
  const { theme, setTheme, actualTheme } = useTheme();
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 侧边栏宽度
  const sidebarWidth = 320; // w-80 = 320px

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: AIMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // 调用真实 AI API
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: '请求失败' }));
        throw new Error(errorData.error || '请求失败');
      }

      const data = await res.json();

      const aiMessage: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // 错误处理
      const errorMessage: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: `抱歉，AI 服务暂时无法响应：${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // 快捷操作
  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <>
      {/* 折叠/展开按钮 - 独立于侧边栏 */}
      <div
        className="fixed top-1/2 -translate-y-1/2 z-20 sidebar-transition no-print"
        style={{
          right: collapsed ? '0px' : `${sidebarWidth}px`
        }}
      >
        <button
          onClick={onToggle}
          className="w-6 h-12 border border-r-0 rounded-l flex items-center justify-center cursor-pointer hover:shadow-sm"
          style={{
            backgroundColor: 'var(--hover-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--ink-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--white-bg)';
            e.currentTarget.style.borderColor = 'var(--brand-gold)';
            e.currentTarget.style.color = 'var(--brand-gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--ink-secondary)';
          }}
          aria-label={collapsed ? "展开 AI 助手" : "折叠 AI 助手"}
        >
          <iconify-icon icon={collapsed ? "lucide:chevron-left" : "lucide:chevron-right"} className="text-sm" />
        </button>
      </div>

      {/* 右侧 AI 面板 */}
      <aside
        className={cn(
          "integrated-sidebar integrated-sidebar-right w-80 shrink-0 flex flex-col sidebar-transition border-l relative",
          collapsed && "!w-0 min-w-0 opacity-0 pointer-events-none"
        )}
        style={{
          backgroundColor: 'var(--white-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        {/* 用户信息头部 */}
        <div
          className="p-6 border-b"
          style={{
            backgroundColor: 'var(--white-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div
            className="flex items-center justify-between p-2 rounded cursor-pointer group transition-colors"
            style={{ transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={MOCK_USER_EXTENDED.avatar}
                  alt={MOCK_USER_EXTENDED.name}
                  className="w-9 h-9 rounded-full object-cover border"
                  style={{ borderColor: 'var(--border-color)' }}
                />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: 'var(--success-green)',
                    borderColor: 'var(--white-bg)'
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-xs font-bold"
                  style={{ color: 'var(--ink-black)' }}
                >
                  {MOCK_USER_EXTENDED.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-1 rounded"
                    style={{
                      color: 'var(--brand-gold)',
                      backgroundColor: 'rgba(201, 169, 98, 0.1)'
                    }}
                  >
                    {MOCK_USER_EXTENDED.membership?.toUpperCase()}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {MOCK_USER_EXTENDED.membershipLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 主题切换按钮 */}
              <button
                onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
                className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink-black)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                title={actualTheme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
              >
                <iconify-icon icon={actualTheme === "dark" ? "lucide:sun" : "lucide:moon"} />
              </button>
              {/* 用户设置按钮 */}
              <button
                className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink-black)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <iconify-icon icon="lucide:settings" />
              </button>
            </div>
          </div>
        </div>

        {/* 聊天消息区域 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg p-3",
                  message.role === "user" ? "" : "border"
                )}
                style={message.role === "user" ? {
                  backgroundColor: 'var(--brand-gold)',
                  color: 'var(--button-text-on-dark)'
                } : {
                  backgroundColor: 'var(--hover-bg)',
                  color: 'var(--ink-black)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <span
                  className="text-[10px] opacity-60 mt-1 block"
                  style={{ color: 'inherit' }}
                >
                  {message.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {/* AI 正在输入指示器 */}
          {isTyping && (
            <div className="flex justify-start">
              <div
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: 'var(--hover-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--brand-gold)', animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--brand-gold)', animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--brand-gold)', animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 快捷操作 */}
        <div
          className="px-4 py-2 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex flex-col items-center gap-1 p-2 rounded transition-colors group"
                style={{ transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                  const icon = e.currentTarget.querySelector('.iconify-icon') as HTMLElement;
                  const label = e.currentTarget.querySelector('span') as HTMLElement;
                  if (icon) icon.style.color = 'var(--brand-gold)';
                  if (label) label.style.color = 'var(--ink-black)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  const icon = e.currentTarget.querySelector('.iconify-icon') as HTMLElement;
                  const label = e.currentTarget.querySelector('span') as HTMLElement;
                  if (icon) icon.style.color = 'var(--ink-secondary)';
                  if (label) label.style.color = 'var(--text-muted)';
                }}
                title={action.label}
              >
                <iconify-icon
                  icon={action.icon}
                  className="text-lg"
                  style={{ color: 'var(--ink-secondary)', transition: 'color 0.2s' }}
                />
                <span
                  className="text-[9px]"
                  style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
                >
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 输入区域 */}
        <div
          className="p-4 border-t"
          style={{
            backgroundColor: 'var(--white-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-end gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="输入你的问题..."
              className="flex-1 resize-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-all min-h-[60px] max-h-[120px]"
              style={{
                backgroundColor: 'var(--hover-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--ink-black)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-gold)';
                e.currentTarget.style.boxShadow = '0 0 0 1px var(--brand-gold)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className={cn(
                "px-4 py-2 rounded-lg transition-all flex items-center justify-center"
              )}
              style={inputValue.trim() ? {
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)'
              } : {
                backgroundColor: 'var(--border-color)',
                color: 'var(--text-muted)',
                cursor: 'not-allowed'
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--brand-gold-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (inputValue.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--brand-gold)';
                }
              }}
            >
              <iconify-icon icon="lucide:send" className="text-lg" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
