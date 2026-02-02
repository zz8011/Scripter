/* ==================================================
   忘记密码页面 Forgot Password Page
   剧灵 Scripter
   ================================================== */

'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconifyIcon } from '@/components/IconifyIcon';
import { validateEmail, getFriendlyErrorMessage } from '@/lib/auth-client';

/* ==================================================
   忘记密码表单 Forgot Password Form
   ================================================== */

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 入场动画
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 处理提交
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证邮箱
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: 调用发送重置邮件 API
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.code || 'default');
      // }

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'default';
      setError(getFriendlyErrorMessage(errorCode));
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // 成功状态
  if (isSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundColor: 'var(--paper-bg)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease-out',
        }}
      >
        <Card
          className="w-full max-w-md border-0 shadow-2xl"
          style={{
            backgroundColor: 'var(--white-bg)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <CardHeader className="text-center pb-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(127, 168, 112, 0.15)' }}
            >
              <IconifyIcon icon="lucide:check-circle" className="text-3xl" style={{ color: 'var(--success-green)' }} />
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-black)' }}
            >
              邮件已发送
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              重置密码链接已发送到您的邮箱
            </p>
          </CardHeader>

          <CardContent className="text-center space-y-4 pt-4">
            <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
              请检查 <strong>{email}</strong> 的收件箱，点击邮件中的链接重置密码。
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              如果没有收到邮件，请检查垃圾邮件文件夹，或者
            </p>
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-0">
            <Button
              onClick={() => setIsSuccess(false)}
              variant="outline"
              className="w-full h-11"
              style={{ borderColor: 'var(--border-color)' }}
            >
              重新发送
            </Button>
            <Link
              href="/login"
              className="text-sm font-medium hover:underline transition-colors"
              style={{ color: 'var(--brand-gold)' }}
            >
              返回登录
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: 'var(--paper-bg)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease-out',
      }}
    >
      <Card
        className="w-full max-w-md border-0 shadow-2xl"
        style={{
          backgroundColor: 'var(--white-bg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <CardHeader className="space-y-1 pb-2">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'var(--brand-gold)',
                boxShadow: '0 8px 32px rgba(201, 169, 98, 0.3)',
              }}
            >
              <IconifyIcon icon="lucide:key" className="text-3xl text-white" />
            </div>
            <div className="text-center">
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--ink-black)',
                }}
              >
                忘记密码？
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                输入邮箱地址，我们将发送重置链接
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {/* 错误提示 */}
          {error && (
            <Alert
              variant="destructive"
              className="border"
              style={{
                backgroundColor: 'rgba(201, 98, 98, 0.08)',
                borderColor: 'rgba(201, 98, 98, 0.2)',
              }}
            >
              <div className="flex items-start gap-2">
                <IconifyIcon
                  icon="lucide:alert-circle"
                  className="shrink-0 mt-0.5"
                  style={{ color: 'var(--error-red)' }}
                />
                <AlertDescription className="flex-1 text-sm" style={{ color: 'var(--error-red)' }}>
                  {error}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                邮箱
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IconifyIcon
                    icon="lucide:mail"
                    className="text-lg"
                    style={{ color: error ? 'var(--error-red)' : 'var(--text-muted)' }}
                  />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入注册时的邮箱地址"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="pl-10 h-11"
                  style={{
                    borderColor: error ? 'var(--error-red)' : undefined,
                  }}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base font-medium mt-2"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)',
              }}
            >
              {isLoading ? (
                <>
                  <IconifyIcon icon="lucide:loader-2" className="animate-spin mr-2" />
                  发送中...
                </>
              ) : (
                '发送重置链接'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pt-0">
          <Link
            href="/login"
            className="text-sm flex items-center gap-1 hover:underline transition-colors"
            style={{ color: 'var(--brand-gold)' }}
          >
            <IconifyIcon icon="lucide:arrow-left" className="text-sm" />
            返回登录
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ==================================================
   加载中组件 Loading State
   ================================================== */

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--paper-bg)' }}>
      <div className="text-center">
        <IconifyIcon
          icon="lucide:loader-2"
          className="animate-spin text-4xl mb-4"
          style={{ color: 'var(--brand-gold)' }}
        />
        <p style={{ color: 'var(--text-muted)' }}>加载中...</p>
      </div>
    </div>
  );
}

/* ==================================================
   页面导出 Page Export
   ================================================== */

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
