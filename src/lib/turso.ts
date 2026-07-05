import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url || !authToken) {
    throw new Error(
      'Missing Turso database credentials. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.'
    )
  }

  const libsqlClient = createClient({ url, authToken })

  const adapter = new PrismaLibSQL(libsqlClient);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  return client;
};

function getPrisma() {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient();
  }
  return globalThis.__prisma;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
