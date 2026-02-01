/* ==================================================
   登录页面 Login Page
   ================================================== */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconifyIcon } from '@/components/IconifyIcon';

/* ==================================================
   登录页面组件 Login Page Component
   ================================================== */

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取重定向URL
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // 检查错误参数
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        missing_params: '认证参数缺失，请重试',
        missing_verifier: '安全验证失败，请重试',
        auth_failed: '认证失败，请检查账户信息',
        default: '登录过程中发生错误，请重试',
      };
      setError(errorMessages[errorParam] || errorMessages.default);
    }
  }, [searchParams]);

  /**
   * 处理 Casdoor 登录
   */
  const handleCasdoorLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 调用登录 API 获取 OAuth URL
      const response = await fetch('/api/auth/login');
      const data = await response.json();

      if (data.url) {
        // 重定向到 Casdoor 登录页面
        window.location.href = data.url;
      } else {
        setError('无法获取登录链接，请稍后重试');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('登录请求失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理开发模式登录（跳过认证）
   */
  const handleDevLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 创建开发模式会话
      const response = await fetch('/api/auth/dev-login', {
        method: 'POST',
      });

      if (response.ok) {
        router.push(redirectUrl);
      } else {
        setError('开发模式登录失败');
      }
    } catch (err) {
      console.error('Dev login error:', err);
      setError('开发模式登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4">
            <IconifyIcon icon="mdi:script-text" className="text-3xl text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-slate-900 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Scripter
          </h1>
          <p className="text-slate-500">AI 驱动的剧本创作平台</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-600">
              <IconifyIcon icon="mdi:alert-circle" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 登录按钮 */}
        <div className="space-y-4">
          <Button
            onClick={handleCasdoorLogin}
            disabled={isLoading}
            className="w-full h-12 text-base font-medium"
            style={{
              backgroundColor: 'var(--brand-gold)',
              color: 'var(--button-text-on-dark)',
            }}
          >
            {isLoading ? (
              <IconifyIcon icon="mdi:loading" className="animate-spin mr-2" />
            ) : (
              <IconifyIcon icon="mdi:account-circle" className="mr-2" />
            )}
            使用 Casdoor 登录
          </Button>

          {/* 开发模式快速登录 */}
          {isDev && (
            <Button
              onClick={handleDevLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 text-base"
            >
              <IconifyIcon icon="mdi:developer-board" className="mr-2" />
              开发模式快速登录
            </Button>
          )}
        </div>

        {/* 分隔线 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-400">或使用</span>
          </div>
        </div>

        {/* 其他登录方式 */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-11" disabled>
            <IconifyIcon icon="mdi:github" className="mr-2" />
            GitHub
          </Button>
          <Button variant="outline" className="h-11" disabled>
            <IconifyIcon icon="mdi:google" className="mr-2" />
            Google
          </Button>
        </div>

        {/* 说明文字 */}
        <p className="mt-6 text-center text-xs text-slate-400">
          登录即表示您同意我们的服务条款和隐私政策
        </p>

        {/* 开发模式提示 */}
        {isDev && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700 text-center">
              <IconifyIcon icon="mdi:information" className="inline mr-1" />
              当前处于开发模式，可使用"开发模式快速登录"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================================================
   页面导出 Page Export
   ================================================== */

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <IconifyIcon icon="mdi:loading" className="animate-spin text-4xl text-amber-500" />
          <p className="mt-4 text-slate-500">加载中...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
