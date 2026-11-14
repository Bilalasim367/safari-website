import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { verifyToken, type TokenPayload } from "@/lib/auth"

/**
 * Shared admin guard for API route handlers.
 * Returns the token payload when the request carries a valid admin JWT,
 * otherwise `null` (callers return the 401 response).
 */
export async function requireAdmin(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("access_token")?.value
    if (!token) return null
    const auth = await verifyToken(token)
    if (!auth || auth.role !== "admin") return null
    return auth
  } catch {
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

/** Safe JSON body parse for route handlers. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    if (!body || typeof body !== "object" || Array.isArray(body)) return null
    return body as Record<string, unknown>
  } catch {
    return null
  }
}
