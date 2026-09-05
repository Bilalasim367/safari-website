import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readPopupSettings, writePopupSettings, type PopupSettings } from '@/lib/popup-settings'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return null
  const auth = await verifyToken(token)
  if (!auth || auth.role !== 'admin') return null
  return auth
}

export async function GET() {
  const settings = readPopupSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const next: PopupSettings = {
      enabled: body.enabled !== false,
      whatsappNumber:
        typeof body.whatsappNumber === 'string' && body.whatsappNumber.trim()
          ? body.whatsappNumber.trim().replace(/\D/g, '')
          : '923247277489',
      names:
        Array.isArray(body.names) && body.names.length
          ? body.names.map((n: string) => n.trim()).filter(Boolean)
          : [],
      cities:
        Array.isArray(body.cities) && body.cities.length
          ? body.cities.map((c: string) => c.trim()).filter(Boolean)
          : [],
    }

    const result = writePopupSettings(next)
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Failed to save settings' }, { status: 500 })
    }
    return NextResponse.json(next)
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}