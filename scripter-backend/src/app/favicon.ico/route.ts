import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Favicon handler - return empty response to avoid 500 errors
export async function GET() {
  // Return 204 No Content - browsers will just use their default icon
  return new NextResponse(null, { status: 204 })
}

// Handle HEAD requests as well
export async function HEAD() {
  return new NextResponse(null, { status: 204 })
}
