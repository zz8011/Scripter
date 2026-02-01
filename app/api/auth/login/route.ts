import { NextRequest, NextResponse } from 'next/server'
import { getOAuthURL } from '@/lib/casdoor'
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce'

export async function GET(request: NextRequest) {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)

  // Store verifier in session for callback
  const response = NextResponse.json({
    url: getOAuthURL(codeChallenge),
  })

  response.cookies.set('code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth',
  })

  return response
}
