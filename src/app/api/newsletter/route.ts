import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rateLimit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Newsletter signup. Stores one row per email (unique). Re-subscribing an
 * existing address succeeds without creating a duplicate.
 */
export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    if (!checkRateLimit(`newsletter:${ip}`, 8, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = (await request.json()) as { email?: unknown; source?: unknown }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
    }

    const source = body.source === "footer" ? "footer" : "homepage"

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true },
        })
      }
      return NextResponse.json({ success: true, alreadySubscribed: true })
    }

    await prisma.newsletterSubscriber.create({ data: { email, source } })
    return NextResponse.json({ success: true, alreadySubscribed: false })
  } catch (error) {
    console.error("Newsletter signup error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
