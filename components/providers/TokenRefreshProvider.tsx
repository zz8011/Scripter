/* ==================================================
   Token 刷新 Provider
   自动刷新 JWT Token，保持用户会话
   ================================================== */

'use client';

import { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';

// Token 刷新间隔（分钟）
const DEFAULT_REFRESH_INTERVAL = 5;

// Token 提前过期时间（分钟）
const TOKEN_EXPIRY_BUFFER = 10;

interface TokenRefreshContextType {
  refreshToken: () => Promise<boolean>;
}

const TokenRefreshContext = createContext<TokenRefreshContextType | null>(null);

interface TokenRefreshProviderProps {
  children: ReactNode;
  intervalMinutes?: number;
  enabled?: boolean;
}

/**
 * Token 刷新 Provider
 */
export function TokenRefreshProvider({
  children,
  intervalMinutes = DEFAULT_REFRESH_INTERVAL,
  enabled = true,
}: TokenRefreshProviderProps) {
  /**
   * 执行 Token 刷新
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('[TokenRefresh] Token refreshed successfully');
        return true;
      }

      if (response.status === 401) {
        console.log('[TokenRefresh] Session expired, redirecting to login');
        // 会话过期，跳转到登录页
        window.location.href = '/login?error=session_expired';
        return false;
      }

      console.error('[TokenRefresh] Failed to refresh token:', response.status);
      return false;
    } catch (error) {
      console.error('[TokenRefresh] Error refreshing token:', error);
      return false;
    }
  }, []);

  /**
   * 检查 Token 是否需要刷新
   */
  const checkAndRefreshToken = useCallback(async () => {
    // 检查是否是认证页面
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(
      path => window.location.pathname.startsWith(path)
    );

    if (isAuthPage) {
      return; // 在认证页面不需要刷新
    }

    await refreshToken();
  }, [refreshToken]);

  useEffect(() => {
    if (!enabled) return;

    // 页面可见性变化时检查是否需要刷新
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndRefreshToken();
      }
    };

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 设置定时刷新
    const intervalMs = intervalMinutes * 60 * 1000;
    const intervalId = setInterval(checkAndRefreshToken, intervalMs);

    // 清理函数
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [enabled, intervalMinutes, checkAndRefreshToken]);

  return (
    <TokenRefreshContext.Provider value={{ refreshToken }}>
      {children}
    </TokenRefreshContext.Provider>
  );
}

/**
 * 使用 Token 刷新的 Hook
 */
export function useTokenRefresh(): TokenRefreshContextType {
  const context = useContext(TokenRefreshContext);
  if (!context) {
    throw new Error('useTokenRefresh must be used within TokenRefreshProvider');
  }
  return context;
}
