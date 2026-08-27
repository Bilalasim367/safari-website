import { PrismaClient } from '@prisma/client'
import { PrismaMySQL } from '@prisma/adapter-mysql'
import mysql from 'mysql2/promise'

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
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
    if (admin) {
      console.log('Email:', admin.email)
      console.log('Name:', admin.name)
      console.log('Role:', admin.role)
    } else {
      console.log('No admin found')
    }
  } catch (e: unknown) {
    console.error('Error:', e instanceof Error ? e.message : String(e))
  }
  await prisma.$disconnect()
  await pool.end()
}

main()