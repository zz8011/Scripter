/* ==================================================
   应用 Provider 组合
   整合所有全局 Provider
   ================================================== */

'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { TokenRefreshProvider } from '@/components/providers/TokenRefreshProvider';
import { Toaster } from '@/components/ui/toaster';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * 应用 Provider 组合
 * 按正确顺序包裹所有全局 Provider
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="scripter-theme"
    >
      <TokenRefreshProvider intervalMinutes={5} enabled={true}>
        {children}
        <Toaster />
      </TokenRefreshProvider>
    </ThemeProvider>
  );
}
