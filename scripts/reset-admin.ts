import { PrismaClient } from '@prisma/client'
import { PrismaMySQL } from '@prisma/adapter-mysql'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const prisma = new PrismaClient({
  adapter: new PrismaMySQL(pool),
})

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: 'admin' } })
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } })
    console.log('Deleted existing admin:', existing.email)
  }

  const hashedPassword = await bcrypt.hash('Admin123!', 12)

  const _admin = await prisma.user.create({
    data: {
      email: 'admin@safari.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      status: 'active',
    },
  })

  console.log('Admin created:')
  console.log('Email:    admin@safari.com')
  console.log('Password: Admin123!')
  console.log('Name:     Admin User')

  await prisma.$disconnect()
  await pool.end()
}

main()