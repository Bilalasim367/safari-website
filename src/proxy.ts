import { NextResponse, type NextRequest } from 'next/server'

// Canonical production origin. Keep in sync with `src/lib/site.ts` (SITE_URL).
const CANONICAL_HOST = 'safari-perfumes.com'
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`

// Hosts where bot protection and rate limiting are enforced. Local dev,
// previews, and the standalone server used for QA are exempt so that browser
// automation is never blocked.
const PROTECTED_HOSTS = new Set([CANONICAL_HOST, `www.${CANONICAL_HOST}`])

const BOT_UA_REGEX = /(lightpanda|gptbot|bytespider|ahrefsbot|semrushbot|mj12bot|petalbot|ccbot|scrapy|python-requests|headlesschrome)/i
// Search engines must never be treated as bots: they index the storefront.
const SEARCH_ENGINE_UA_REGEX = /(googlebot|google-inspectiontool|googleother|adsbot-google|bingbot|bingpreview|slurp|duckduckbot|applebot|yandexbot|baiduspider)/i

type RateEntry = {
  count: number
  windowStart: number
}

const rateMap = new Map<string, RateEntry>()
const MAX_RATE_ENTRIES = 10000
const CLEANUP_INTERVAL_MS = 60_000
const RATE_WINDOW_MS = 60_000 // 1 minute
const SHOP_LIMIT = 30
const API_LIMIT = 60

let lastCleanup = 0

function getHost(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const raw =
    forwardedHost?.split(',')[0]?.trim() ||
    request.headers.get('host') ||
    request.nextUrl.host ||
    ''
  // Strip the port so `example.com:3000` still resolves to `example.com`.
  return raw.toLowerCase().replace(/:\d+$/, '')
}

function getProtocol(request: NextRequest): string {
  // Phusion Passenger (used on the cPanel host) forwards the real scheme in
  // these headers; `nextUrl.protocol` is `http` internally even for HTTPS.
  const passengerProto = request.headers.get('!~passenger-proto')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const raw =
    passengerProto?.split(',')[0]?.trim() ||
    forwardedProto?.split(',')[0]?.trim() ||
    request.nextUrl.protocol ||
    ''
  return raw.replace(/:$/, '').toLowerCase()
}

function getClientIp(request: NextRequest): string {
  const cf = request.headers.get('cf-connecting-ip')
  if (cf && cf.trim().length > 0) return cf.trim()

  const xff = request.headers.get('x-forwarded-for')
  if (xff && xff.trim().length > 0) {
    const first = xff.split(',')[0]?.trim()
    if (first && first.length > 0) return first
  }

  // fallback
  return 'unknown'
}

function cleanupRateMap(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [ip, entry] of rateMap) {
    if (now - entry.windowStart > RATE_WINDOW_MS * 2) {
      rateMap.delete(ip)
    }
  }
  // hard cap
  if (rateMap.size > MAX_RATE_ENTRIES) {
    let removed = 0
    for (const ip of rateMap.keys()) {
      if (removed > rateMap.size - MAX_RATE_ENTRIES) break
      rateMap.delete(ip)
      removed++
    }
  }
}

function isRateLimited(ip: string, path: string, now: number): { limited: boolean; retryAfter: number } {
  if (ip === 'unknown') return { limited: false, retryAfter: 0 }
  const isApi = path.startsWith('/api')
  const isShop = path.startsWith('/shop')
  const limit = isApi ? API_LIMIT : SHOP_LIMIT
  if (!isApi && !isShop) return { limited: false, retryAfter: 0 }

  const entry = rateMap.get(ip)
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateMap.set(ip, { count: 1, windowStart: now })
    return { limited: false, retryAfter: 0 }
  }
  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.windowStart + RATE_WINDOW_MS - now) / 1000)
    return { limited: true, retryAfter: Math.max(1, retryAfter) }
  }
  entry.count += 1
  rateMap.set(ip, entry)
  return { limited: false, retryAfter: 0 }
}

export async function proxy(request: NextRequest) {
  const now = Date.now()
  const path = request.nextUrl.pathname
  const ua = request.headers.get('user-agent') ?? ''
  const host = getHost(request)
  const protocol = getProtocol(request)
  const isProductionHost = PROTECTED_HOSTS.has(host)

  // ── 1. Canonical host + HTTPS redirect (duplicate-content fix) ──────
  // Only applies on the production domains, so localhost/preview stay usable.
  if (isProductionHost && (host !== CANONICAL_HOST || protocol !== 'https')) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, CANONICAL_ORIGIN)
    return NextResponse.redirect(target, 308)
  }

  // ── 2. Bot protection + rate limiting (production only) ─────────────
  const isSearchEngine = SEARCH_ENGINE_UA_REGEX.test(ua)

  if (isProductionHost) {
    const isBadBot = BOT_UA_REGEX.test(ua) || ua.trim().length === 0
    if (isBadBot && !isSearchEngine && (path.startsWith('/shop') || path.startsWith('/api'))) {
      return new NextResponse('Forbidden', { status: 403, headers: { 'Cache-Control': 'no-store' } })
    }

    // Rate limit for /shop and /api/*. Search engines are exempt so a crawl
    // burst can never produce 429s that look like the site is unavailable.
    if (!isSearchEngine) {
      const ip = getClientIp(request)
      cleanupRateMap(now)
      const rl = isRateLimited(ip, path, now)
      if (rl.limited) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfter),
            'Cache-Control': 'no-store',
          },
        })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\.[^/]+$|favicon\.ico|robots\.txt|sitemap\.xml).*)'],
}
