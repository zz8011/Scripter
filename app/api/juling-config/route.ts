import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateJulingConfig, updateJulingConfig } from '@/lib/db/queries/juling-configs'
import { auth } from '@/lib/session'

/**
 * GET /api/juling-config
 * Get user's Juling config
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await getOrCreateJulingConfig(session.user.id)
    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error fetching Juling config:', error)
    return NextResponse.json({ error: 'Failed to fetch Juling config' }, { status: 500 })
  }
}

/**
 * PUT /api/juling-config
 * Update user's Juling config
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const config = await updateJulingConfig(session.user.id, body)
    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error updating Juling config:', error)
    return NextResponse.json({ error: 'Failed to update Juling config' }, { status: 500 })
  }
}
