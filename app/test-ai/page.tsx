'use client'

import { useState } from 'react'

export default function TestAIPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testAI = async () => {
    if (!message.trim()) {
      setError('请输入消息')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || '请求失败')
      }

      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const examplePrompts = [
    '帮我构思一个悬疑故事的开头',
    '创建一个复杂的反派人物',
    '设计一个紧张的动作场景',
    '为一个爱情故事设计世界观',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            剧灵 AI 测试工具
          </h1>
          <p className="text-amber-700 dark:text-amber-300">
            开发模式下测试智谱 GLM-4.7 连接
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
            输入消息
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入你想对剧灵说的话..."
            className="w-full px-4 py-3 border border-amber-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={4}
            disabled={loading}
          />

          {/* Example Prompts */}
          <div className="mt-4">
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">示例提示：</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="px-3 py-1 text-sm bg-amber-100 dark:bg-gray-700 text-amber-800 dark:text-amber-200 rounded-full hover:bg-amber-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={testAI}
            disabled={loading || !message.trim()}
            className="mt-4 w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                思考中...
              </>
            ) : (
              '发送消息'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-1">错误</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">
              剧灵的回复
            </h3>

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none mb-6">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {response.content}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="border-t border-amber-100 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-3">
                使用统计
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-amber-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-amber-600 dark:text-amber-400 text-xs mb-1">提示词 Tokens</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {response.usage.prompt_tokens}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-amber-600 dark:text-amber-400 text-xs mb-1">完成 Tokens</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {response.usage.completion_tokens}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-amber-600 dark:text-amber-400 text-xs mb-1">总 Tokens</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {response.usage.total_tokens}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-amber-600 dark:text-amber-400 text-xs mb-1">模型</p>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mt-1">
                    {response.model}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="mt-4 text-xs text-amber-600 dark:text-amber-400">
              响应时间: {new Date().toLocaleString('zh-CN')}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-blue-900 dark:text-blue-100 font-medium mb-2">ℹ️ 开发模式说明</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• 此页面仅用于开发测试，无需登录</li>
            <li>• 调用的是 `/api/ai/test` 端点（绕过认证）</li>
            <li>• 生产环境应使用 `/api/ai/chat` 或 `/api/ai/stream`（需要认证）</li>
            <li>• 配置 Casdoor 认证后可使用完整的 AI 功能</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
