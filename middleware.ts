import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 受保护的路由 - 需要认证才能访问
const protectedRoutes = [
  '/dashboard',
  '/editor',
  '/projects',
  '/characters',
  '/scenes',
  '/worldview',
  '/storyboard',
]

// 公开路由 - 无需认证
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth',
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/public',
]

/**
 * 检查路径是否需要认证
 */
function isProtectedRoute(pathname: string): boolean {
  // 检查是否是公开路由前缀
  for (const route of publicRoutes) {
    if (pathname.startsWith(route)) {
      return false
    }
  }

  // 检查是否是受保护路由
  for (const route of protectedRoutes) {
    if (pathname.startsWith(route)) {
      return true
    }
  }

  // 根路径需要认证（会重定向到 dashboard）
  if (pathname === '/') {
    return true
  }

  return false
}

/**
 * 中间件 - 处理认证和路由保护
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查会话 cookie
  const sessionCookie = request.cookies.get('scripter_session')
  const hasSession = !!sessionCookie?.value

  // 开发模式：允许无认证访问（仅用于开发测试）
  const isDevMode = process.env.NODE_ENV === 'development'
  const bypassAuth = isDevMode && process.env.BYPASS_AUTH === 'true'

  // 如果是受保护路由且没有会话（且不是绕过模式）
  if (isProtectedRoute(pathname) && !hasSession && !bypassAuth) {
    // API 路由返回 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to access this resource' },
        { status: 401 }
      )
    }

    // 页面路由重定向到登录页
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录用户访问登录页，重定向到 dashboard
  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

/**
 * 配置匹配规则
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - 静态文件 (/_next/static, /favicon.ico, etc.)
     * - 图片文件 (/images/*)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
