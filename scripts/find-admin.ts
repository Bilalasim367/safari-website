import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const prisma = new PrismaClient({
  adapter: new PrismaLibSQL(libsql),
});

async function main() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (admin) {
      console.log('Email:', admin.email);
      console.log('Name:', admin.name);
      console.log('Role:', admin.role);
    } else {
      console.log('No admin found');
    }
  } catch (e: any) {
    console.error('Error:', e.message);
  }
  await prisma.$disconnect();
}

main();
