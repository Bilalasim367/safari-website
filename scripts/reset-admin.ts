import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const prisma = new PrismaClient({
  adapter: new PrismaLibSQL(libsql),
});

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
    console.log('Deleted existing admin:', existing.email);
  }

  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const _admin = await prisma.user.create({
    data: {
      email: 'admin@safari.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      status: 'active',
    },
  });

  console.log('Admin created:');
  console.log('Email:    admin@safari.com');
  console.log('Password: Admin123!');
  console.log('Name:     Admin User');

  await prisma.$disconnect();
}

main();
