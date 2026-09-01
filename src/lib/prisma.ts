import { PrismaClient } from '@prisma/client'
import { debugLog, debugLogMessage } from '@/lib/debugLog'

declare global {
  var __prisma: PrismaClient | undefined
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

  debugLogMessage('prisma:init', `Connecting to DB (url prefix: ${url.slice(0, 30)}...)`)

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