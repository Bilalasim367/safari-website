import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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