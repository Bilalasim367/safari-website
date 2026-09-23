import { jwtVerify } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'

function maintenanceModeOn(): boolean {
  const value = (process.env.MAINTENANCE_MODE ?? '').toLowerCase()
  return value === 'true' || value === '1' || value === 'yes' || value === 'on'
}

async function isAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('access_token')?.value
  const secret = process.env.JWT_SECRET
  if (!token || !secret) return false
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  if (!maintenanceModeOn()) return NextResponse.next()

  if (await isAdminSession(request)) return NextResponse.next()

  return NextResponse.redirect(new URL('/coming-soon', request.url), { status: 307 })
}

export const config = {
  matcher: ['/((?!_next|api|admin|login|coming-soon|.*\\..*).*)'],
}