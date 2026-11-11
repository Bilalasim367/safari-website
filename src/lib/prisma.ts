import { PrismaClient } from '@prisma/client'
import { debugLog, debugLogMessage } from '@/lib/debugLog'

declare global {
  var __prisma: PrismaClient | undefined
}

/**
 * Builds a log-safe description of the database target.
 *
 * Never log the raw connection string: it embeds the username and password and
 * debugLogMessage persists to debug-errors.log at the project root, which is
 * readable through the cPanel File Manager.
 */
function describeDatabaseTarget(url: string): string {
  try {
    const parsed = new URL(url.replace(/^mysql:\/\//, 'http://'))
    const database = parsed.pathname.replace(/^\//, '')
    return database ? `${parsed.hostname}/${database}` : parsed.hostname
  } catch {
    return 'unparseable DATABASE_URL'
  }
}

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL

  if (!url) {
    const err = new Error(
      'Missing DATABASE_URL environment variable. Set DATABASE_URL in your environment.'
    )
    debugLog('prisma:init', err)
    throw err
  }

  debugLogMessage('prisma:init', `Connecting to DB (${describeDatabaseTarget(url)})`)

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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