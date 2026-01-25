import { NextRequest, NextResponse } from 'next/server'
import { exchangeToken, getUserInfo } from '@/lib/casdoor'
import { getUserByEmail, createUser } from '@/db/queries/users'
import { createSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(new URL('/login?error=missing_params', request.url))
  }

  try {
    // Get code verifier from cookie
    const codeVerifier = request.cookies.get('code_verifier')?.value

    if (!codeVerifier) {
      return NextResponse.redirect(new URL('/login?error=missing_verifier', request.url))
    }

    // Exchange code for token
    const token = await exchangeToken(code, state)

    // Get user info from token
    const userInfo = await getUserInfo(token.accessToken)

    // Check if user exists in database
    let user = await getUserByEmail(userInfo.email)

    if (!user) {
      // Create new user
      user = await createUser({
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        plan: 'free',
        aiQuota: {
          monthlyLimit: 500000, // 50万 tokens
          used: 0,
          resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    // Create session
    await createSession({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken: token.accessToken,
    })

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }
}
