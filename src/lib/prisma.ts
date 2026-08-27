import { PrismaClient } from '@prisma/client'
import { debugLog, debugLogMessage } from '@/lib/debugLog'

declare global {
  var __prisma: PrismaClient | undefined
}

function sanitizeDatabaseUrl(rawUrl: string): string {
  try {
    // If url contains an unencoded password with special chars (like = or @),
    // normalize the password portion safely
    const match = rawUrl.match(/^(mysql:\/\/)([^:]+):([^@]+)@([^:/]+)(:\d+)?(\/.*)?$/)
    if (match) {
      const [, proto, user, pass, host, port, rest] = match
      const encodedPass = encodeURIComponent(decodeURIComponent(pass))
      return `${proto}${user}:${encodedPass}@${host}${port || ':3306'}${rest || ''}`
    }
  } catch {
    // fallback to original
  }
  return rawUrl
}

const createPrismaClient = () => {
  const rawUrl = process.env.DATABASE_URL

  if (!rawUrl) {
    const err = new Error(
      'Missing DATABASE_URL environment variable. Set DATABASE_URL in your environment.'
    )
    debugLog('prisma:init', err)
    throw err
  }

  const url = sanitizeDatabaseUrl(rawUrl)
  debugLogMessage('prisma:init', `Connecting to DB (url prefix: ${url.slice(0, 30)}...)`)

  try {
    const client = new PrismaClient({
      datasources: {
        db: {
          url,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    })

    debugLogMessage('prisma:init', 'PrismaClient created successfully')
    return client
  } catch (error) {
    debugLog('prisma:init:create', error)
    throw error
  }
}

function getPrisma() {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient()
  }
  return globalThis.__prisma
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma()
    const value = client[prop as keyof PrismaClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

export default prisma